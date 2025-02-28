import React from 'react';
import { Link } from 'react-router-dom';

function NavBar2() {
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
    </nav>
  );
}

export default NavBar2;
