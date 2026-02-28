import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";

/**
 * Header component
 * Displays navigation bar with title and theme toggle button
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.onThemeToggle - Callback for theme toggle
 */
const Header = ({ darkMode, onThemeToggle }) => {
  return (
    <Navbar bg={darkMode ? "dark" : "primary"} variant="dark">
      <Container className="d-flex justify-content-between">
        <Navbar.Brand>🤖 PDF Q&A Bot</Navbar.Brand>
        <Button variant="outline-light" onClick={onThemeToggle}>
          {darkMode ? "Light" : "Dark"}
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
