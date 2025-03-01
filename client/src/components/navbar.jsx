/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
/* eslint-enable no-unused-vars */
import { Link } from 'react-router-dom';
import useAuth from '../context/getUseAuth';
import { useSettings } from '../context/settingsContext';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Import settings context for dark mode
  const { darkMode } = useSettings();
  
  return (
    <nav className={`border-b-2 ${
      darkMode 
        ? 'bg-gradient-to-r from-[#143824] via-[#2c4c2c] to-[#143824] text-slate-100 border-emerald-800' 
        : 'bg-gradient-to-r from-[#d5ffaa] via-[#efffce] to-[#d5ffaa] border-emerald-400'
    } px-8 py-4 flex justify-between items-center shadow-xl relative z-50`}>
      
      {/* Subtle animated accent line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60"></div>
      
      {/* Subtle gradient shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-green-400 to-transparent" 
             style={{transform: 'translateX(-100%)', animation: 'shimmer-slide 8s infinite linear'}}></div>
      </div>
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className={`text-xl font-bold ${darkMode ? 'text-slate-100 hover:text-slate-300' : 'text-gray-900 hover:text-gray-400'}`}
        >
          Nutrition Tracker 9000
        </Link>
      </div>

      {/* Center - Navigation Links */}
      <div className={`hidden md:flex px-7 space-x-8 ${darkMode ? 'text-slate-100' : 'text-black'} font-medium ml-auto`}>
        <a href="#" className={`nav-link-hover ${darkMode ? 'hover:text-green-300' : 'hover:text-green-600'} transition-colors duration-200 py-1`}>
          About Us
        </a>
        <Link to="/dashboard" className={`nav-link-hover ${darkMode ? 'hover:text-green-300' : 'hover:text-green-600'} transition-colors duration-200 py-1 flex items-center`}>
          <span className="mr-1">📊</span> Dashboard
        </Link>
        <a href="#" className={`nav-link-hover ${darkMode ? 'hover:text-green-300' : 'hover:text-green-600'} transition-colors duration-200 py-1`}>
          Resources
        </a>
        <a href="#" className={`nav-link-hover ${darkMode ? 'hover:text-green-300' : 'hover:text-green-600'} transition-colors duration-200 py-1`}>
          Contact
        </a>
      </div>

      {/* Sign-in Button or User Profile */}
      <div className="hidden md:flex items-center space-x-3">
        {currentUser ? (
          <div className="flex items-center space-x-3">
            {currentUser.photoURL ? (
              <div className="relative">
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className={`w-8 h-8 rounded-full border-2 ${darkMode ? 'border-green-500' : 'border-green-400'} shadow-md`}
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${darkMode ? 'border-green-500 bg-slate-700 text-green-300' : 'border-green-400 bg-white text-green-600'} shadow-md relative`}>
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
              </div>
            )}
            <span className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{currentUser.displayName || currentUser.email}</span>
            <a
              href="/dashboard"
              rel="noopener noreferrer" 
              role="button"
              className={`px-4 py-1.5 rounded-lg shadow-md transition-all duration-200 ${
                darkMode 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } flex items-center cursor-pointer`}
              onClick={() => window.location.href = '/dashboard'}
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" fill="currentColor"/>
              </svg>
              Dashboard
            </a>
            <a
              href="/meal-history"
              rel="noopener noreferrer"
              role="button"
              className={`px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              } flex items-center cursor-pointer`}
              onClick={() => window.location.href = '/meal-history'}
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z" fill="currentColor"/>
              </svg>
              Meal History
            </a>
          </div>
        ) : (
          <Link
            to="/login"
            className={`px-4 py-1.5 rounded-lg shadow-md transition-all duration-200 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white'
            } flex items-center`}
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" fill="currentColor"/>
              <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="currentColor"/>
            </svg>
            Sign in
          </Link>
        )}
      </div>

      {/* Hamburger Button */}
      <button
        className={`md:hidden ml-auto p-2 rounded-lg shadow-md transition-colors ${
          darkMode 
            ? 'bg-slate-700 text-green-400 hover:bg-slate-600' 
            : 'bg-white text-green-600 border border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Mobile Menu (only visible when isOpen is true) */}
      {isOpen && (
        <div className={`absolute top-14 left-0 w-full ${
          darkMode 
            ? 'bg-gradient-to-b from-[#143824] to-[#0f2a18] text-slate-100 border-t border-b border-green-800' 
            : 'bg-gradient-to-b from-[#efffce] to-[#d5ffaa] border-t border-b border-green-300'
        } flex flex-col py-4 shadow-xl md:hidden z-50`}>
          <div className="container mx-auto px-6 flex flex-col space-y-3">
            <a href="#" className={`py-2 px-3 rounded-lg ${
              darkMode 
                ? 'hover:bg-green-900/30 hover:text-green-300' 
                : 'hover:bg-green-100 hover:text-green-800'
            } transition-colors duration-200`}>
              About Us
            </a>
            <Link to="/dashboard" className={`py-2 px-3 rounded-lg ${
              darkMode 
                ? 'hover:bg-green-900/30 hover:text-green-300' 
                : 'hover:bg-green-100 hover:text-green-800'
            } transition-colors duration-200 flex items-center`}>
              <span className="mr-1">📊</span> Dashboard
            </Link>
            <a href="#" className={`py-2 px-3 rounded-lg ${
              darkMode 
                ? 'hover:bg-green-900/30 hover:text-green-300' 
                : 'hover:bg-green-100 hover:text-green-800'
            } transition-colors duration-200`}>
              Resources
            </a>
            <a href="#" className={`py-2 px-3 rounded-lg ${
              darkMode 
                ? 'hover:bg-green-900/30 hover:text-green-300' 
                : 'hover:bg-green-100 hover:text-green-800'
            } transition-colors duration-200`}>
              Contact
            </a>
            
            <div className="border-t border-dashed my-2 opacity-40"></div>
            
            {currentUser ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 py-2 px-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className={`w-8 h-8 rounded-full border-2 ${darkMode ? 'border-green-500' : 'border-green-400'}`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      darkMode 
                        ? 'border-green-500 bg-slate-700 text-green-300' 
                        : 'border-green-400 bg-white text-green-600'
                    }`}>
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                
                <a
                  href="/dashboard"
                  className={`flex items-center py-2 px-3 rounded-lg ${
                    darkMode 
                      ? 'bg-green-600/30 text-green-300 hover:bg-green-600/50' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  } transition-colors duration-200 cursor-pointer`}
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/dashboard';
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" fill="currentColor"/>
                  </svg>
                  Dashboard
                </a>
                
                <a
                  href="/meal-history"
                  className={`flex items-center py-2 px-3 rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-200 hover:bg-slate-700/70' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-colors duration-200 cursor-pointer`}
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/meal-history';
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z" fill="currentColor"/>
                  </svg>
                  Meal History
                </a>
              </div>
            ) : (
              <Link
                to="/login"
                className={`flex items-center justify-center py-2 px-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700' 
                    : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
                } shadow-md transition-colors duration-200 mt-2`}
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" fill="currentColor"/>
                  <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="currentColor"/>
                </svg>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
