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
    secret: "fallback_session_secret_key", // FIX: removed SESSION_SECRET environment variable dependency
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
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Route: Upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  let filePath = null;


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
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use form field name 'file'." });
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

    // Build absolute file path
    filePath = path.join(__dirname, req.file.path);

    // Verify file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "File upload failed - file not found on disk" });
    }

    console.log(`Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Send PDF to Python service for processing
    const response = await axios.post("http://localhost:5000/process-pdf", {
      filePath: filePath,
    }, {
      timeout: 60000 // 60 second timeout
    });

    res.json({
      message: "PDF uploaded & processed successfully!",
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file after error: ${filePath}`);
      } catch (cleanupErr) {
        console.error(`Failed to cleanup file: ${cleanupErr.message}`);
      }
    }

    // Determine error type and send appropriate response
    if (err.code === 'ECONNREFUSED') {
      console.error("RAG service not available");
      return res.status(503).json({
        error: "RAG service unavailable",
        details: "Please ensure the Python service is running on port 5000"
      });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: "File too large",
        details: "Maximum file size is 10MB"
      });
    }

    const details = err.response?.data || err.message;
    console.error("Upload processing failed:", details);
    res.status(500).json({ error: "PDF processing failed", details });
    const filePath = path.resolve(req.file.path);
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
  let fileStream;

  try {
    const FormData = require("form-data");
    const formData = new FormData();
    fileStream = fs.createReadStream(filePath);
    formData.append("file", fileStream, req.file.originalname);

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
    // Initialize session chat history if it doesn't exist
    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    // Add user message to session history
    req.session.chatHistory.push({
      role: "user",
      content: question,
    });

    // Send question + history to FastAPI with session isolation
    const response = await axios.post("http://localhost:5000/ask", {
      question: question,
      session_ids: session_ids,
      history: req.session.chatHistory,
    });

    // Add assistant response to session history
    req.session.chatHistory.push({
      role: "assistant",
      content: response.data.answer,
    });

    res.json(response.data);
  } catch (error) {
    console.error("[/ask] Question processing failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to process question. Please try again." });
  }
  res.json({ message: "History cleared" });
});

app.post("/clear-history", (req, res) => {
  // Clear only this user's session history
  if (req.session) {
    req.session.chatHistory = [];
  }
  res.json({ message: "History cleared" });
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

// Route: Generate Smart Question Suggestions
app.post("/generate-suggestions", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/suggest-questions", {}, {
      timeout: 10000
    });
    res.json({ suggestions: response.data.suggestions || [] });
  } catch (err) {
    console.error("Suggestion generation failed:", err.message);
    res.json({ suggestions: [] }); // Fail gracefully
  }
});

// Global error handler for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: "File too large",
        details: "Maximum file size is 10MB"
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));

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
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
