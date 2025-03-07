/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { addMeal, getUserDiaryEntries } from '../services/firestoreService';
import PropTypes from 'prop-types';
import { searchFoods, extractNutrients } from '../services/foodApiService';

function QuickAddMealModal({ isOpen, onClose, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentMeals, setRecentMeals] = useState([]);
  const [entryMode, setEntryMode] = useState('custom'); // 'custom' or 'database'
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Form data
  const [mealData, setMealData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    amount: 100, // Default serving size
    category: 'uncategorized'
  });

  // Load recent meals when component mounts
  useEffect(() => {
    const loadRecentMeals = async () => {
      if (!userId || !isOpen) return;
      
      try {
        const meals = await getUserDiaryEntries(userId);
        if (Array.isArray(meals)) {
          setRecentMeals(meals.slice(0, 5)); // Get most recent 5 meals
        } else {
          console.error('Expected meals to be an array but got:', typeof meals);
          setRecentMeals([]);
        }
      } catch (error) {
        console.error('Error loading recent meals:', error);
        setRecentMeals([]);
      }
    };
    
    loadRecentMeals();
  }, [userId, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setMealData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        amount: 100,
        category: 'uncategorized'
      });
      setSearchQuery('');
      setSearchResults([]);
      setError('');
      setSuccess(false);
      setEntryMode('custom');
      setSelectedFood(null);
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    // If we're in database mode and user tries to edit values, switch to custom mode
    if (entryMode === 'database' && e.target.name !== 'name' && e.target.name !== 'category') {
      setEntryMode('custom');
    }
    
    const { name, value } = e.target;
    
    // Handle different field types
    let processedValue;
    if (name === 'name' || name === 'category') {
      // For text fields or selects
      processedValue = value;
    } else {
      // For numeric fields
      processedValue = Number(value) || 0;
    }
    
    console.log(`Changing ${name} to:`, processedValue);
    
    setMealData({
      ...mealData,
      [name]: processedValue
    });
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Search for foods in the USDA database
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await searchFoods(searchQuery);
      setSearchResults(results.slice(0, 5)); // Limit to first 5 results
    } catch (error) {
      console.error('Error searching foods:', error);
      setError('Failed to search foods. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a food from search results
  const handleSelectFood = async (food) => {
    try {
      // Extract common nutrients using our improved function
      const nutrients = extractNutrients(food);
      
      // Save the selected food for reference
      setSelectedFood(food);
      
      // Switch to database mode
      setEntryMode('database');
      
      // Update the meal data with the food's information
      setMealData({
        name: food.description || food.foodName || 'Unknown Food',
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        carbs: nutrients.carbs || 0,
        fat: nutrients.fat || 0,
        amount: mealData.amount, // Preserve the current amount
        category: mealData.category // Preserve the current category
      });
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error selecting food:', error);
    }
  };

  // Handle selecting a recent meal
  const handleSelectRecentMeal = (meal) => {
    setMealData({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      amount: meal.amount || 100,
      category: meal.category || 'uncategorized'
    });
    setEntryMode('custom');
    setSelectedFood(null);
  };

  // Switch to custom mode
  const handleSwitchToCustom = () => {
    setEntryMode('custom');
    setSelectedFood(null);
  };

  // Save meal to Firestore
  const handleSave = async () => {
    if (!userId) {
      setError('You must be logged in to save meals.');
      return;
    }
    
    if (!mealData.name.trim()) {
      setError('Please enter a meal name.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Ensure amount is a proper number
      const finalAmount = Number(mealData.amount) || 100;
      
      // Scale nutrients according to amount if needed
      const nutrients = {
        ...mealData,
        amount: finalAmount,
        date: new Date() // Store the current date
      };
      
      console.log("Adding meal with data:", nutrients);
      console.log("Selected meal category:", nutrients.category);
      await addMeal(userId, nutrients);
      
      setSuccess(true);
      
      // Reset form after brief delay to show success message
      setTimeout(() => {
        setMealData({
          name: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          amount: 100,
          category: 'uncategorized'
        });
        setSuccess(false);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving meal:', error);
      setError('Failed to save meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 mx-auto z-50">
      <div className="bg-[#efffce] border border-black shadow-lg rounded-lg p-6 w-96 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-lg font-bold text-green-700">Quick Add Meal</h2>
          <button
            className="text-gray-700 hover:text-white hover:bg-red-500 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            Meal saved successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Entry Mode Selector */}
        <div className="flex justify-between mb-3">
          <button
            className={`px-3 py-1 rounded-md border border-black ${entryMode === 'custom' ? 'bg-green-400 text-white font-semibold' : 'bg-white'} transition-colors`}
            onClick={handleSwitchToCustom}
          >
            Custom Entry
          </button>
          <div className="text-center text-xs flex items-center text-gray-500">or</div>
          <button
            className={`px-3 py-1 rounded-md border border-black ${entryMode === 'database' ? 'bg-green-400 text-white font-semibold' : 'bg-white'} ${!selectedFood ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
            disabled={!selectedFood}
            onClick={() => selectedFood && setEntryMode('database')}
          >
            Database Food
          </button>
        </div>

        {/* Custom Mode: Recent Meals Dropdown (Only shown in custom mode) */}
        {entryMode === 'custom' && recentMeals.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium text-purple-700 mb-1">Recent Meals:</label>
            <select 
              className="bg-white w-full px-3 py-2 border border-purple-300 rounded-md text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
              onChange={(e) => {
                if (e.target.value !== "") {
                  const selectedMeal = recentMeals[Number(e.target.value)];
                  handleSelectRecentMeal(selectedMeal);
                }
              }}
              value=""
            >
              <option value="">-- Select a recent meal --</option>
              {recentMeals.map((meal, index) => (
                <option key={meal.id} value={index}>
                  {meal.name} ({meal.calories} cal)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Database Mode: Search Food Database */}
        <div className="mb-4">
          <label className="block font-medium text-blue-700 mb-1">Search Food Database:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="🔍 Search for a food..."
              className="bg-white flex-grow px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="border border-blue-400 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border border-blue-200 rounded-md max-h-40 overflow-y-auto bg-white shadow-sm">
              {searchResults.map((food, index) => (
                <div 
                  key={index}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 transition-colors"
                  onClick={() => handleSelectFood(food)}
                >
                  {food.description || food.foodName || 'Unknown Food'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Food Info (Database Mode) */}
        {entryMode === 'database' && selectedFood && (
          <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">{mealData.name}</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-blue-100 rounded-lg p-2">
                <div className="text-blue-600 font-bold">{mealData.calories}</div>
                <div className="text-xs text-blue-700">Calories</div>
              </div>
              <div className="bg-red-100 rounded-lg p-2">
                <div className="text-red-600 font-bold">{mealData.protein}g</div>
                <div className="text-xs text-red-700">Protein</div>
              </div>
              <div className="bg-green-100 rounded-lg p-2">
                <div className="text-green-600 font-bold">{mealData.carbs}g</div>
                <div className="text-xs text-green-700">Carbs</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-2">
                <div className="text-yellow-600 font-bold">{mealData.fat}g</div>
                <div className="text-xs text-yellow-700">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-2">
          <label className="block font-medium text-green-700">Meal Name:</label>
          <input
            type="text"
            name="name"
            value={mealData.name}
            onChange={handleChange}
            className="bg-white w-full px-3 py-2 border border-gray-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
            placeholder="Enter meal name"
          />

          <div className="flex justify-between items-center mt-3">
            <div className="w-1/2 pr-1">
              <label className="block font-medium text-purple-600">Amount:</label>
              <input
                type="number"
                name="amount"
                value={mealData.amount}
                onChange={handleChange}
                min="1"
                className="bg-white w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                placeholder="100"
              />
            </div>
            <div className="w-1/2 pl-1">
              <label className="block font-medium text-gray-500">Unit:</label>
              <input
                type="text"
                value="g"
                disabled
                className="bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md opacity-70 outline-none"
              />
            </div>
          </div>

          <label className="block font-medium text-blue-600 mt-2">Calories:</label>
          <input
            type="number"
            name="calories"
            value={mealData.calories}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            className={`bg-white w-full px-3 py-2 border ${entryMode === 'database' ? 'border-blue-300 bg-blue-50' : 'border-gray-400'} rounded-md ${entryMode === 'database' ? 'opacity-90' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} outline-none transition-colors`}
            placeholder="0"
          />

          <label className="block font-medium text-red-600">Protein (g):</label>
          <input
            type="number"
            name="protein"
            value={mealData.protein}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`bg-white w-full px-3 py-2 border ${entryMode === 'database' ? 'border-red-300 bg-red-50' : 'border-gray-400'} rounded-md ${entryMode === 'database' ? 'opacity-90' : 'focus:border-red-500 focus:ring-1 focus:ring-red-500'} outline-none transition-colors`}
            placeholder="0"
          />

          <label className="block font-medium text-green-600">Carbs (g):</label>
          <input
            type="number"
            name="carbs"
            value={mealData.carbs}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`bg-white w-full px-3 py-2 border ${entryMode === 'database' ? 'border-green-300 bg-green-50' : 'border-gray-400'} rounded-md ${entryMode === 'database' ? 'opacity-90' : 'focus:border-green-500 focus:ring-1 focus:ring-green-500'} outline-none transition-colors`}
            placeholder="0"
          />

          <label className="block font-medium text-yellow-600">Fat (g):</label>
          <input
            type="number"
            name="fat"
            value={mealData.fat}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`bg-white w-full px-3 py-2 border ${entryMode === 'database' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-400'} rounded-md ${entryMode === 'database' ? 'opacity-90' : 'focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'} outline-none transition-colors`}
            placeholder="0"
          />
          
          <label className="block font-medium text-purple-600 mt-3">Meal Category:</label>
          <select
            name="category"
            value={mealData.category}
            onChange={handleChange}
            className="bg-white w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
          >
            <option value="uncategorized">Uncategorized</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="border border-black px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 font-medium transition-colors"
            title="Cancel and close"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || !mealData.name.trim()}
            className="border border-black px-4 py-1.5 rounded-md bg-green-400 hover:bg-green-500 text-white font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none"
            title="Save this meal"
          >
            {isLoading ? 'Saving...' : 'Save Meal'}
          </button>
        </div>
      </div>
    </div>
  );
}

QuickAddMealModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default QuickAddMealModal;