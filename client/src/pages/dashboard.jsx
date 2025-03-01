import React from 'react';
import { useState, useEffect } from 'react';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import QuickAddMealModal from '../components/quickAddModal';
import { Link } from 'react-router-dom';

function Dashboard() {
  const userName = 'person (change later)';
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <NavBar2 />

      {/* Page Content */}
      <div className="border-b border-black flex flex-col items-start py-2 px-6 bg-gray-200">
        {/* Navigation Buttons */}
        <div className="flex space-x-4 m-1">
          <Link
            to="/"
            className="border border-black px-3 py-1 rounded-md bg-white hover:bg-[#DECEFF] text-sm"
          >
            Home
          </Link>
          <Link
            to="/log-meal"
            className="border border-black px-3 py-1 rounded-md bg-white hover:bg-[#DECEFF] text-sm"
          >
            Log Meal
          </Link>
          <Link
            to="/meal-history"
            className="border border-black px-3 py-1 rounded-md bg-white hover:bg-[#DECEFF] text-sm"
          >
            Meal History
          </Link>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="border border-black bg-gray-100 px-24 py-4 mx-auto rounded-md mt-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}!
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-2xl mx-auto">
        {/* Calories Card */}
        <div className="border border-black rounded-md shadow-md bg-[#efffce] p-6 text-start">
          <div className="w-full h-38 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">[Graph Placeholder]</span>
          </div>
          <h3 className="text-xl font-semibold mt-4">Calories</h3>
          <p className="text-gray-700">Blah blah blah</p>
        </div>

        {/* Macros Card */}
        <div className="border border-black rounded-md shadow-md bg-[#efffce] p-6 text-start">
          <div className="w-full h-38 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">[Graph Placeholder]</span>
          </div>
          <h3 className="text-xl font-semibold mt-4">Macros</h3>
          <p className="text-gray-700">Blah blah blah</p>
        </div>
      </div>

      {/* Quick Add Meal Button */}
      <div className="grid grid-cols-4 gap-4 m-6 max-w-4xl mx-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-black px-4 py-2 rounded-md bg-white hover:bg-gray-200"
        >
          Quick Add Meal
        </button>
        <button className="border border-black px-4 py-2 rounded-md bg-white hover:bg-gray-200">
          Feature 1
        </button>
        <button className="border border-black px-4 py-2 rounded-md bg-white hover:bg-gray-200">
          Feature 2
        </button>
        <button className="border border-black px-4 py-2 rounded-md bg-white hover:bg-gray-200">
          Feature 3
        </button>
      </div>

      {/* Quick Add Meal Modal */}
      <QuickAddMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default Dashboard;
