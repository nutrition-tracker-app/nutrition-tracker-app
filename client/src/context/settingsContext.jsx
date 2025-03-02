/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect } from 'react';
/* eslint-enable no-unused-vars */

// Create the context
const SettingsContext = createContext();

// Settings provider component
export const SettingsProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [editMode, setEditMode] = useState(() => {
    const savedEditMode = localStorage.getItem('editMode');
    return savedEditMode ? JSON.parse(savedEditMode) : false;
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply dark mode classes to the document root
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('editMode', JSON.stringify(editMode));
  }, [editMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleEditMode = () => setEditMode(prev => !prev);

  // Provide the context values
  const value = {
    darkMode,
    editMode,
    toggleDarkMode,
    toggleEditMode
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;