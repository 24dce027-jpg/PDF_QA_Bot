import { useState, useEffect } from "react";

const THEME_STORAGE_KEY = "pdf-qa-bot-theme";
const DARK_MODE_CLASS = "dark-mode";

/**
 * Custom hook for managing dark mode theme
 * Persists theme preference to localStorage and applies to document
 * @returns {{darkMode: boolean, toggleTheme: Function}} Current theme state and toggle function
 */
export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    document.body.classList.toggle(DARK_MODE_CLASS, darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleTheme };
};

export default useTheme;
