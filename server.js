const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
require("dotenv").config();

const app = express(); // FIX: removed duplicate declaration

// Configuration constants
const PORT = process.env.PORT || 4000;
const RAG_URL = process.env.RAG_SERVICE_URL || "http://localhost:5000";
const SESSION_SECRET = process.env.SESSION_SECRET; // FIX: removed hardcoded secret
const UPLOAD_TIMEOUT_MS = 180000; // 3 minutes for file upload processing
const ASK_TIMEOUT_MS = 180000; // 3 minutes for question answering
const SUMMARIZE_TIMEOUT_MS = 180000; // 3 minutes for summarization
const COMPARE_TIMEOUT_MS = 180000; // 3 minutes for comparison
const HEALTH_CHECK_TIMEOUT_MS = 5000; // 5 seconds for health check
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const UPLOAD_LIMIT = 5;
const ASK_LIMIT = 30;
const SUMMARIZE_LIMIT = 10;
const COMPARE_LIMIT = 10;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}


app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());


app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: SESSION_MAX_AGE_MS,
    },
  })
);


/**
 * Creates a rate limiter middleware with consistent configuration
 * @param {number} max - Maximum requests per window
 * @param {string} message - Error message when limit exceeded
 * @returns {Function} Express middleware for rate limiting
 */
const makeLimiter = (max, msg) =>
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max,
    message: msg,
    standardHeaders: true,
    legacyHeaders: false,
  });

const uploadLimiter = makeLimiter(UPLOAD_LIMIT, "Too many PDF uploads, try again later.");
const askLimiter = makeLimiter(ASK_LIMIT, "Too many questions, try again later.");
const summarizeLimiter = makeLimiter(SUMMARIZE_LIMIT, "Too many summarization requests.");
const compareLimiter = makeLimiter(COMPARE_LIMIT, "Too many comparison requests.");


const UPLOAD_DIR = path.resolve(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({ storage });


app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "healthy", service: "pdf-qa-gateway" });
});

app.get("/readyz", async (req, res) => {
  /**
   * Readiness probe endpoint - Checks if RAG service is available
   * @returns {Object} Readiness status with dependency health
   */
  try {
    const response = await axios.get(`${RAG_URL}/healthz`, { timeout: HEALTH_CHECK_TIMEOUT_MS });
    if (response.status === 200) {
      return res.status(200).json({
        status: "ready",
        service: "pdf-qa-gateway",
        dependencies: { rag_service: "healthy" },
      });
    }
    throw new Error("RAG service returned non-200 status");
  } catch (error) {
    console.error("[/readyz] RAG service health check failed:", error.message);
    return res.status(503).json({
      status: "not ready",
      service: "pdf-qa-gateway",
      dependencies: { rag_service: "unreachable" },
    });
  }
});

// FIX: Upload endpoint with file cleanup to prevent disk space exhaustion (Issue #110)
/**
 * Upload endpoint - Receives PDF file and processes via RAG service
 * Enforces rate limiting and performs cleanup to prevent disk space exhaustion
 * @param {File} file - PDF file from multipart form data (req.file)
 * @returns {Object} Upload result with session_id for future queries
 */
app.post("/upload", uploadLimiter, upload.single("file"), async (req, res) => {
  // Guard against missing file to avoid accessing properties of undefined
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = path.resolve(req.file.path);
  const uploadDirResolved = path.resolve(UPLOAD_DIR);
  
  // SECURITY: Validate that the file path is within UPLOAD_DIR (prevent path traversal)
  if (!filePath.startsWith(uploadDirResolved + path.sep) && filePath !== uploadDirResolved) {
    console.error("[/upload] Path traversal attempt detected:", filePath);
    return res.status(400).json({ error: "Invalid file path." });
  }

  let fileStream;

  try {
    // Create a readable stream from the uploaded file
    fileStream = fs.createReadStream(filePath);
    
    // Use FormData to send multipart data to FastAPI
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", fileStream);

    const response = await axios.post(
      `${RAG_URL}/upload`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: UPLOAD_TIMEOUT_MS,
      }
    );

    // Store sessionId returned from FastAPI
    if (req.session) {
      req.session.currentSessionId = response.data.session_id;
      req.session.chatHistory = [];
    }

    return res.json({
      message: response.data.message,
      session_id: response.data.session_id,
    });
  } catch (err) {
    console.error("[/upload] File processing failed:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to process file. Please try again." });
  } finally {
    // SECURITY: Destroy stream to prevent file descriptor leaks (especially on Windows)
    if (fileStream) {
      fileStream.destroy();
    }
    
    // FIX: Delete uploaded file from Node server after processing (Issue #110)
    // This prevents disk space exhaustion from orphaned PDF files
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== "ENOENT") {
        // Only log if it's not "file not found" (which is fine)
        console.warn(`[/upload] Failed to delete file: ${unlinkErr.message}`);
      }
    });
  }
});


/**
 * Ask endpoint - Submit a question about uploaded documents
 * @param {string} question - User's question (required, non-empty)
 * @param {Array<string>} session_ids - Session IDs of documents to query (required, non-empty)
 * @returns {Object} Answer with citations from the RAG service
 */
app.post("/ask", askLimiter, async (req, res) => {
  const { question, session_ids } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }
  if (!session_ids || session_ids.length === 0) {
    return res.status(400).json({ error: "At least one document (session_id) is required." });
  }

  try {
    const response = await axios.post(
      `${RAG_URL}/ask`,
      { question, session_ids },
      { timeout: ASK_TIMEOUT_MS }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("[/ask] Question processing failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to process question. Please try again." });
  }
});


/**
 * Summarize endpoint - Generate summary of uploaded documents
 * @param {Array<string>} session_ids - Session IDs of documents to summarize (required, non-empty)
 * @returns {Object} Summary text from RAG service
 */
app.post("/summarize", summarizeLimiter, async (req, res) => {
  const { session_ids } = req.body;

  if (!session_ids || session_ids.length === 0) {
    return res.status(400).json({ error: "At least one document (session_id) is required." });
  }

  try {
    const response = await axios.post(
      `${RAG_URL}/summarize`,
      { session_ids },
      { timeout: SUMMARIZE_TIMEOUT_MS }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("[/summarize] Summarization failed:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to summarize documents. Please try again." });
  }
});


/**
 * Compare endpoint - Compare two or more uploaded documents
 * @param {Array<string>} session_ids - Session IDs of documents to compare (required, minimum 2)
 * @returns {Object} Comparison analysis from RAG service
 */
app.post("/compare", compareLimiter, async (req, res) => {
  const { session_ids } = req.body;

  if (!session_ids || session_ids.length < 2) {
    return res.status(400).json({ error: "At least 2 documents are required for comparison." });
  }

  try {
    const response = await axios.post(
      `${RAG_URL}/compare`,
      { session_ids },
      { timeout: COMPARE_TIMEOUT_MS }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("[/compare] Comparison failed:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to compare documents. Please try again." });
  }
});


/**
 * Health check endpoint - Simple liveness probe
 * @returns {Object} Health status
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`RAG service configured at: ${RAG_URL}`);
});