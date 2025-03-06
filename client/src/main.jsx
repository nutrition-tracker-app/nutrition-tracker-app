// imports
/* eslint-disable no-unused-vars */
import React from 'react'; // good practice
/* eslint-enable no-unused-vars */
import { StrictMode } from 'react'; // additional checks in dev mode
import { createRoot } from 'react-dom/client'; // react 18 way to redner app
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // handle frontend routing

// styling
import './index.css';

// Contexts
import { AuthProvider } from './context/authContext';
import { SettingsProvider } from './context/settingsContext';

// pages
/* eslint-disable no-unused-vars */
import App from './pages/App.jsx';
/* eslint-enable no-unused-vars */
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Dashboard from './pages/dashboard.jsx';
import MealHistory from './pages/mealHistory.jsx';
import Diary from './pages/diary.jsx';
import Settings from './pages/settings.jsx';
import DatabaseSetup from './pages/dbSetup.jsx';

// create root of app and render it into the root div in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meal-history" element={<MealHistory />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/db-setup" element={<DatabaseSetup />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>
);
