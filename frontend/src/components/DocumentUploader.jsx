import React, { useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { uploadDocument } from "../services/api";

/**
 * DocumentUploader component
 * Handles file input and upload with proper error handling and user feedback
 * @param {Object} props - Component props
 * @param {Function} props.onUploadSuccess - Callback triggered after successful upload
 * @param {string} props.sessionId - Current session ID
 * @param {boolean} props.darkMode - Dark mode enabled state
 * @param {string} props.cardClass - CSS class for card styling
 * @param {string} props.inputClass - CSS class for input styling
 */
const DocumentUploader = ({ onUploadSuccess, sessionId, darkMode, cardClass, inputClass }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadedDoc = await uploadDocument(file, sessionId);
      
      // Call success callback with uploaded document data
      onUploadSuccess(uploadedDoc);
      
      setFile(null);
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Document upload error:", error.message);
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className={`mb-4 ${cardClass}`}>
      <Card.Body>
        <Card.Title>Upload Document</Card.Title>
        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              type="file"
              className={inputClass}
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </Form.Group>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            variant="primary"
            className="w-100"
          >
            {uploading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DocumentUploader;
