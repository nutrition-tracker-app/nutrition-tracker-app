import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border border-black bg-[#efffce] px-8 py-3 flex justify-between items-center shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="text-xl font-bold text-gray-900 hover:text-gray-400"
        >
          Nutrition Tracker 9000
        </Link>
      </div>

      {/* Center - Navigation Links */}
      <div className="hidden md:flex px-7 space-x-3 text-black font-medium ml-auto">
        <a href="#" className="hover:text-gray-400">
          About Us
        </a>
        <span className="text-gray-500">|</span> {/* Divider */}
        <a href="#" className="hover:text-gray-400">
          Resources
        </a>
        <span className="text-gray-500">|</span> {/* Divider */}
        <a href="#" className="hover:text-gray-400">
          Contact
        </a>
      </div>

      {/* Sign-in Button */}
      <div className="hidden md:flex items-center space-x-3">
        <button className="border border-black px-3 py-1 rounded-md shadow-sm text-gray-900 bg-white hover:bg-[#DECEFF]">
          Sign in
        </button>
      </div>

      {/* Humburger Button */}
      <button
        className="md:hidden ml-auto px-1 border border-black rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu (only visible when isOpen is true) */}
      {isOpen && (
        <div className="border border-black absolute top-14 left-0 w-full bg-[#efffce] flex flex-col items-center py-3 shadow-lg md:hidden">
          <a href="#" className="py-1 hover:text-gray-400">
            About Us
          </a>
          <a href="#" className="py-1 hover:text-gray-400">
            Resources
          </a>
          <a href="#" className="py-1 hover:text-gray-400">
            Contact
          </a>
          <button className="border border-black px-3 py-1 rounded-md shadow-sm text-gray-900 bg-white hover:bg-[#DECEFF] mt-2">
            Sign in
          </button>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
