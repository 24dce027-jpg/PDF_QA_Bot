const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Configuration
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:5000";
const PORT = process.env.PORT || 4000;

// Health and readiness endpoints
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "healthy", service: "pdf-qa-gateway" });
});

app.get("/readyz", async (req, res) => {
  try {
    // Check if FastAPI service is reachable
    const response = await axios.get(`${RAG_SERVICE_URL}/healthz`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      res.status(200).json({ 
        status: "ready", 
        service: "pdf-qa-gateway",
        dependencies: {
          "rag-service": "healthy"
        }
      });
    } else {
      throw new Error("FastAPI service not healthy");
    }
  } catch (error) {
    res.status(503).json({ 
      status: "not ready", 
      service: "pdf-qa-gateway",
      error: "Cannot reach RAG service",
      dependencies: {
        "rag-service": "unhealthy"
      }
    });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const response = await axios.post(`${RAG_SERVICE_URL}/process-pdf`, {
      filePath,
    });

    res.json({ doc_id: response.data.doc_id });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

app.post("/ask", async (req, res) => {
  const response = await axios.post(`${RAG_SERVICE_URL}/ask`, req.body);
  res.json(response.data);
});

app.post("/summarize", async (req, res) => {
  const response = await axios.post(`${RAG_SERVICE_URL}/summarize`, req.body);
  res.json(response.data);
});

app.post("/compare", async (req, res) => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/compare`, req.body);
    res.json({ comparison: response.data.comparison });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error comparing documents" });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));