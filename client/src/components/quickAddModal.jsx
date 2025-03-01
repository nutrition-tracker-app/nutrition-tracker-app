import React from 'react';

function QuickAddMealModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-25 mx-auto">
      <div className="bg-[#efffce] border border-black shadow-lg rounded-md p-6 w-96 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Quick Add Meal</h2>
          <button
            className="text-gray-700 hover:text-red-500"
            onClick={onClose}
          >
            X
          </button>
        </div>

        {/* Search & Dropdown */}
        <input
          type="text"
          placeholder="🔍 Search food database"
          className="bg-white w-full px-3 py-1 border border-gray-400 rounded-md mb-3"
        />
        <select className="text-gray-500 bg-white w-full px-3 py-1 border border-gray-400 rounded-md mb-3">
          <option>Recent meals dropdown</option>
          <option>rice</option>
        </select>

        {/* Input Fields */}
        <div className="space-y-2">
          <label className="block">Name:</label>
          <input
            type="text"
            className="bg-white w-full px-2 py-1 border border-gray-400 rounded-md"
          />

          <label className="block">Calories:</label>
          <input
            type="number"
            className="bg-white w-full px-2 py-1 border border-gray-400 rounded-md"
          />

          <label className="block">Protein:</label>
          <input
            type="number"
            className="bg-white w-full px-2 py-1 border border-gray-400 rounded-md"
          />

          <label className="block">Carbs:</label>
          <input
            type="number"
            className="bg-white w-full px-2 py-1 border border-gray-400 rounded-md"
          />

          <label className="block">Fat:</label>
          <input
            type="number"
            className="bg-white w-full px-2 py-1 border border-gray-400 rounded-md"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="border border-black px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button className="border border-black px-3 py-1 rounded-md bg-green-300 hover:bg-green-400">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickAddMealModal;
