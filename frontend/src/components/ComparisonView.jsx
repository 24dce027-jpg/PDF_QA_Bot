import React, { useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { compareDocuments } from "../services/api";

/**
 * ComparisonView component
 * Displays comparison analysis between two selected documents
 * @param {Object} props - Component props
 * @param {Array} props.selectedDocNames - Names of selected documents
 * @param {Array} props.selectedDocIds - IDs of selected documents
 * @param {string} props.sessionId - Current session ID
 * @param {string} props.cardClass - CSS class for card styling
 */
const ComparisonView = ({
  selectedDocNames,
  selectedDocIds,
  sessionId,
  cardClass,
}) => {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  const handleCompare = async () => {
    if (selectedDocIds.length !== 2) {
      alert("Please select exactly 2 documents for comparison");
      return;
    }

    setComparing(true);
    try {
      const response = await compareDocuments(sessionId, selectedDocIds);
      setComparisonResult(response.text);
    } catch (error) {
      console.error("Document comparison error:", error.message);
      alert(error.message || "Comparison failed. Please try again.");
      setComparisonResult(null);
    } finally {
      setComparing(false);
    }
  };

  // Only show if exactly 2 documents are selected
  if (selectedDocNames.length !== 2) {
    return null;
  }

  return (
    <Card className={`mb-4 ${cardClass}`}>
      <Card.Body>
        <Card.Title>Document Comparison</Card.Title>
        <p className="text-muted">
          Comparing: <strong>{selectedDocNames.join(" vs ")}</strong>
        </p>

        <Button
          variant="info"
          onClick={handleCompare}
          disabled={comparing}
          className="mb-3"
          block
        >
          {comparing ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Generating Comparison...
            </>
          ) : (
            "Generate Comparison"
          )}
        </Button>

        {comparisonResult && (
          <div
            style={{
              borderTop: "1px solid #ddd",
              paddingTop: 16,
              marginTop: 16,
            }}
          >
            <h6>AI Comparison Results:</h6>
            <ReactMarkdown>{comparisonResult}</ReactMarkdown>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComparisonView;
