import React from "react";
import { Card, Form } from "react-bootstrap";

/**
 * DocumentSelector component
 * Displays a checklist for selecting documents for Q&A operations
 * @param {Object} props - Component props
 * @param {Array} props.documents - Array of document objects with doc_id and name
 * @param {Array} props.selectedDocIds - Array of currently selected document IDs
 * @param {Function} props.onSelectionChange - Callback when document selection changes
 * @param {string} props.cardClass - CSS class for card styling
 * @returns {JSX.Element|null} Document selector component or null if no documents
 */
const DocumentSelector = ({
  documents,
  selectedDocIds,
  onSelectionChange,
  cardClass,
}) => {
  const handleToggle = (docId) => {
    onSelectionChange(docId);
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <Card className={`mb-4 ${cardClass}`}>
      <Card.Body>
        <Card.Title>Select Documents</Card.Title>
        <Form>
          {documents.map((doc) => (
            <Form.Group key={doc.doc_id} className="mb-2">
              <Form.Check
                type="checkbox"
                id={`doc-${doc.doc_id}`}
                label={doc.name}
                checked={selectedDocIds.includes(doc.doc_id)}
                onChange={() => handleToggle(doc.doc_id)}
              />
            </Form.Group>
          ))}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DocumentSelector;
