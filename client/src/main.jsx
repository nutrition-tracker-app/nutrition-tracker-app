// imports
import React from 'react'; // good practice
import { StrictMode } from 'react'; // additional checks in dev mode
import { createRoot } from 'react-dom/client'; // react 18 way to redner app
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // handle frontend routing

// styling
import './index.css';

// pages
import App from './pages/App.jsx';
import Home from './pages/home.jsx';

// create root of app and render it into the root div in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>
);
