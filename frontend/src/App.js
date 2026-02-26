import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Spinner,
  Navbar
} from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_BASE = process.env.REACT_APP_API_URL || "";
const THEME_STORAGE_KEY = "pdf-qa-bot-theme";

function App() {
  const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [question, setQuestion] = useState("");

  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [comparing, setComparing] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  // ===============================
  // Theme Persistence
  // ===============================
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    document.body.classList.toggle("bg-dark", darkMode);
  }, [darkMode]);

  // ===============================
  // Load saved data
  // ===============================
  useEffect(() => {
    const savedChat = localStorage.getItem("chatHistory");
    const savedPdfs = localStorage.getItem("pdfs");

    if (savedChat) setChatHistory(JSON.parse(savedChat));
    if (savedPdfs) setPdfs(JSON.parse(savedPdfs));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("pdfs", JSON.stringify(pdfs));
  }, [pdfs]);

  // ===============================
  // Upload PDF
  // ===============================
  const uploadPDF = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      const url = URL.createObjectURL(file);

      setPdfs((prev) => [
        ...prev,
        {
          name: file.name,
          doc_id: res.data.doc_id,
          session_id: res.data.session_id,
          url,
          session_id: res.data.session_id, // REQUIRED: keep sessionId
        },
      ]);

      setFile(null);
      alert("PDF uploaded successfully!");
    } catch (err) {
      alert("Upload failed.");
    }

    setUploading(false);
    setProcessingPdf(false);
  };

  // ===============================
  // Toggle Selection
  // ===============================
  const toggleDocSelection = (session_id) => {
    setComparisonResult(null);
    setSelectedSessions((prev) =>
      prev.includes(session_id)
        ? prev.filter((id) => id !== session_id)
        : [...prev, session_id]
    );
  };

  // ===============================
  // Ask Question
  // ===============================
  const askQuestion = async () => {
    if (!question.trim() || selectedSessions.length === 0) return;

    setChatHistory((prev) => [...prev, { role: "user", text: question }]);
    const q = question;
    setQuestion("");
    setAsking(true);

    try {
      const res = await axios.post(`${API_BASE}/ask`, {
        question,
        session_ids: selectedSessions,
      });

      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: res.data.answer },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: "Error getting answer." },
      ]);
    }

    setAsking(false);
  };

  // ===============================
  // Summarize
  // ===============================
  const summarizePDF = async () => {
    if (selectedSessions.length === 0) return;

    setSummarizing(true);

    try {
      const res = await axios.post(`${API_BASE}/summarize`, {
        session_ids: selectedSessions,
      });

      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: res.data.summary },
      ]);
    } catch {
      alert("Error summarizing.");
    }

    setSummarizing(false);
  };

  // ===============================
  // Compare
  // ===============================
  const compareDocuments = async () => {
    if (selectedSessions.length < 2) return;

    setComparing(true);

    try {
      const res = await axios.post(`${API_BASE}/compare`, {
        session_ids: selectedSessions,
      });

      setComparisonResult(res.data.comparison);
    } catch {
      alert("Error comparing.");
    }

    setComparing(false);
  };

  const selectedPdfs = pdfs.filter((p) =>
    selectedSessions.includes(p.session_id)
  );

  return (
    <div className={darkMode ? "bg-dark text-light" : "bg-light text-dark"} style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar bg={darkMode ? "dark" : "primary"} variant="dark" className="mb-4">
        <Container className="d-flex justify-content-between">
          <Navbar.Brand>🤖 PDF Q&A Bot</Navbar.Brand>
          <div>
            <Button variant="danger" size="sm" onClick={() => {
              setChatHistory([]);
              setPdfs([]);
              setSelectedSessions([]);
              localStorage.clear();
            }}>
              Clear History
            </Button>
            <Form.Check
              inline
              type="switch"
              label="Dark"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="ms-3"
            />
          </div>
        </Container>
      </Navbar>

      <Container>
        {/* Upload */}
        <Card className="mb-4">
          <Card.Body>
            <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
            <Button className="mt-2" onClick={uploadPDF} disabled={!file || uploading}>
              {uploading ? <Spinner size="sm" /> : "Upload"}
            </Button>
          </Card.Body>
        </Card>

        {/* Selection */}
        {pdfs.length > 0 && (
          <Card className="mb-4">
            <Card.Body>
              <h5>Select Documents</h5>
              {pdfs.map((pdf) => (
                <Form.Check
                  key={pdf.session_id}
                  type="checkbox"
                  label={pdf.name}
                  checked={selectedSessions.includes(pdf.session_id)}
                  onChange={() => toggleDocSelection(pdf.session_id)}
                />
              ))}
            </Card.Body>
          </Card>
        )}

        {/* Comparison Mode */}
        {selectedPdfs.length === 2 && (
          <Row className="mb-4">
            {selectedPdfs.map((pdf) => (
              <Col key={pdf.session_id} md={6}>
                <Card>
                  <Card.Body>
                    <h6>{pdf.name}</h6>
                    <Document file={pdf.url}>
                      <Page pageNumber={1} />
                    </Document>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {comparisonResult && (
          <Card className="mb-4">
            <Card.Body>
              <h5>AI Comparison</h5>
              <ReactMarkdown>{comparisonResult}</ReactMarkdown>
            </Card.Body>
          </Card>
        )}

        {/* Chat */}
        <Card>
          <Card.Body>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {chatHistory.map((msg, i) => (
                <div key={i} className="mb-2">
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))}
            </div>

            <Form className="d-flex gap-2 mt-3">
              <Form.Control
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
              />
              <Button onClick={askQuestion} disabled={asking}>
                {asking ? <Spinner size="sm" /> : "Ask"}
              </Button>
            </Form>

            <Button variant="warning" className="mt-3 me-2" onClick={summarizePDF}>
              {summarizing ? <Spinner size="sm" /> : "Summarize"}
            </Button>

            <Button variant="info" className="mt-3" onClick={compareDocuments}>
              {comparing ? <Spinner size="sm" /> : "Compare"}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default App;