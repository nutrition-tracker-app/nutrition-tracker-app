/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import { FaEnvelope, FaGithub, FaFileAlt, FaLock } from 'react-icons/fa';
import { useSettings } from '../context/settingsContext';

function Footer() {
  // Import settings context for dark mode
  const { darkMode } = useSettings();
  
  return (
    <footer className={`${
      darkMode 
        ? 'bg-gradient-to-r from-[#143824] via-[#2c4c2c] to-[#143824] text-slate-100' 
        : 'bg-gradient-to-r from-[#d5ffaa] via-[#efffce] to-[#d5ffaa]'
    } border-t-2 ${darkMode ? 'border-emerald-800' : 'border-emerald-400'} px-4 py-5 mt-auto w-full relative z-20`}>
      
      {/* Subtle animated accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60"></div>
      
      {/* Subtle gradient shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-green-400 to-transparent" 
             style={{transform: 'translateX(-100%)', animation: 'shimmer-slide 8s infinite linear'}}></div>
      </div>
      
      {/* Footer Content */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-wrap gap-5 md:gap-8 mb-4 md:mb-0">
          {/* Contact */}
          <a href="#" className={`flex items-center ${darkMode ? 'text-slate-100 hover:text-green-300' : 'text-gray-800 hover:text-green-600'} transition-colors duration-200`}>
            <FaEnvelope className="mr-2" /> Contact
          </a>

          {/* Github */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${darkMode ? 'text-slate-100 hover:text-green-300' : 'text-gray-800 hover:text-green-600'} transition-colors duration-200`}
          >
            <FaGithub className="mr-2" /> GitHub
          </a>

          {/* Terms */}
          <a href="#" className={`flex items-center ${darkMode ? 'text-slate-100 hover:text-green-300' : 'text-gray-800 hover:text-green-600'} transition-colors duration-200`}>
            <FaFileAlt className="mr-2" /> Terms
          </a>

          {/* Privacy */}
          <a href="#" className={`flex items-center ${darkMode ? 'text-slate-100 hover:text-green-300' : 'text-gray-800 hover:text-green-600'} transition-colors duration-200`}>
            <FaLock className="mr-2" /> Privacy
          </a>
        </div>
        
        <div className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} text-sm`}>
          © {new Date().getFullYear()} Nutrition Tracker 9000. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
