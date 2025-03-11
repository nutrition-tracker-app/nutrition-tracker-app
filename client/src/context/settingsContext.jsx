/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect } from 'react';
/* eslint-enable no-unused-vars */

// Create the context
const SettingsContext = createContext();

// Calculate BMR using Mifflin-St Jeor Equation
const calculateBMR = (sex, weight, height, age) => {
  // Convert height from cm to m if needed
  const heightInM = height > 3 ? height / 100 : height;
  
  if (sex === 'male') {
    return (10 * weight) + (6.25 * heightInM * 100) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightInM * 100) - (5 * age) - 161;
  }
};

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

  // User profile settings
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile 
      ? JSON.parse(savedProfile) 
      : {
          sex: 'male',
          age: 30,
          weight: 70, // kg
          height: 175, // cm
          activityLevel: 'moderate', // sedentary, light, moderate, active, very active
          weightGoal: 'maintain', // lose, maintain, gain
          targetCalories: 2000,
          useCustomCalories: false
        };
  });

  // Calculate BMR and TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const { sex, weight, height, age, activityLevel } = userProfile;
    
    // Calculate base BMR
    const bmr = calculateBMR(sex, weight, height, age);
    
    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2, // Little to no exercise
      light: 1.375, // Light exercise 1-3 days per week
      moderate: 1.55, // Moderate exercise 3-5 days per week
      active: 1.725, // Heavy exercise 6-7 days per week
      veryActive: 1.9 // Very heavy exercise, physical job or twice-daily training
    };
    
    const multiplier = activityMultipliers[activityLevel] || activityMultipliers.moderate;
    return Math.round(bmr * multiplier);
  };

  // Calculate target calories based on weight goal
  const calculateTargetCalories = () => {
    const tdee = calculateTDEE();
    const { weightGoal } = userProfile;
    
    // Apply weight goal modifier
    switch (weightGoal) {
      case 'lose':
        return Math.round(tdee * 0.8); // 20% deficit
      case 'gain':
        return Math.round(tdee * 1.1); // 10% surplus
      default: // maintain
        return tdee;
    }
  };

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

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Toggle functions
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleEditMode = () => setEditMode(prev => !prev);
  
  // Update user profile
  const updateUserProfile = (updates) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      
      // If not using custom calories, recalculate the target
      if (!updated.useCustomCalories) {
        updated.targetCalories = calculateTargetCalories();
      }
      
      return updated;
    });
  };

  // Provide the context values
  const value = {
    darkMode,
    editMode,
    userProfile,
    toggleDarkMode,
    toggleEditMode,
    updateUserProfile,
    calculateTDEE,
    calculateTargetCalories
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