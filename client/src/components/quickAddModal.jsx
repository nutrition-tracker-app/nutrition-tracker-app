/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { addMeal, getUserDiaryEntries } from '../services/firestoreService';
import PropTypes from 'prop-types';
import { searchFoods, extractNutrients } from '../services/foodApiService';
import { useSettings } from '../context/settingsContext';

function QuickAddMealModal({ isOpen, onClose, userId }) {
  const { darkMode } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentMeals, setRecentMeals] = useState([]);
  const [entryMode, setEntryMode] = useState('custom'); // 'custom' or 'database'
  const [selectedFood, setSelectedFood] = useState(null);

  // Close modal w/ esc key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Form data
  const [mealData, setMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    amount: '', // Default serving size
    category: 'uncategorized',
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
        category: 'uncategorized',
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
    if (
      entryMode === 'database' &&
      e.target.name !== 'name' &&
      e.target.name !== 'category'
    ) {
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
      //processedValue = Number(value) || 0;
      //processedValue = value === '' ? '' : Number(value);
      processedValue = value === '' ? '' : value.replace(/^0+/, '');
    }

    console.log(`Changing ${name} to:`, processedValue);

    setMealData({
      ...mealData,
      [name]: processedValue,
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
      
      // Log the full API response to console
      console.log('Food API Search Response:', results);
      
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
      // Log the selected food details
      console.log('Selected Food Item:', food);
      
      // Extract common nutrients using our improved function
      const nutrients = extractNutrients(food);
      
      // Log the extracted nutrients
      console.log('Extracted Nutrients:', nutrients);

      // Save the selected food for reference
      setSelectedFood(food);

      // Switch to database mode
      setEntryMode('database');

      // Check if allNutrients is available
      if (nutrients.allNutrients && nutrients.allNutrients.length > 0) {
        console.log(`Food has ${nutrients.allNutrients.length} detailed nutrients`);
      } else {
        console.warn('No detailed nutrients found in food data');
      }
      
      // Update the meal data with the food's information
      setMealData({
        name: food.description || food.foodName || 'Unknown Food',
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        carbs: nutrients.carbs || 0,
        fat: nutrients.fat || 0,
        amount: mealData.amount, // Preserve the current amount
        category: mealData.category, // Preserve the current category
        // Include all nutrients
        allNutrients: nutrients.allNutrients || [],
        sodium: nutrients.sodium || 0,
        cholesterol: nutrients.cholesterol || 0,
        fiber: nutrients.fiber || 0, 
        sugar: nutrients.sugar || 0
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
      category: meal.category || 'uncategorized',
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
        date: new Date(), // Store the current date
      };

      // Enhanced logging
      console.log('=== MEAL SAVE DETAILS ===');
      console.log('Adding meal with data:', nutrients);
      console.log('Meal nutrient values:', {
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat
      });
      console.log('Selected meal category:', nutrients.category);
      
      // Save to Firestore
      const mealResult = await addMeal(userId, nutrients);
      console.log('Meal save result:', mealResult);

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
          category: 'uncategorized',
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
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-[#efffce]'} border border-black shadow-lg rounded-lg flex flex-col p-4 max-h-[90vh] w-[90vw] md:w-[500px] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Quick Add Meal</h2>
          <button
            className={`${darkMode ? 'text-slate-100' : 'text-gray-700'} hover:text-white hover:bg-red-500 w-7 h-7 rounded-full flex items-center justify-center transition-colors`}
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
            className={`px-3 py-1 rounded-md border border-black ${
              entryMode === 'custom'
                ? 'bg-green-400 text-white font-semibold'
                : darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'
            } transition-colors`}
            onClick={handleSwitchToCustom}
          >
            Custom Entry
          </button>
          <div className={`text-center text-xs flex items-center ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            or
          </div>
          <button
            className={`px-3 py-1 rounded-md border border-black ${
              entryMode === 'database'
                ? 'bg-green-400 text-white font-semibold'
                : darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'
            } ${
              !selectedFood ? 'opacity-50 cursor-not-allowed' : ''
            } transition-colors`}
            disabled={!selectedFood}
            onClick={() => selectedFood && setEntryMode('database')}
          >
            Database Food
          </button>
        </div>

        {/* Custom Mode: Recent Meals Dropdown (Only shown in custom mode) */}
        {entryMode === 'custom' && recentMeals.length > 0 && (
          <div className="mb-4">
            <label className={`block font-medium ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-1`}>
              Recent Meals:
            </label>
            <select
              className={`${darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-700'} w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
              onChange={(e) => {
                if (e.target.value !== '') {
                  const selectedMeal = recentMeals[Number(e.target.value)];
                  handleSelectRecentMeal(selectedMeal);
                }
              }}
              value=""
            >
              <option value="" className={darkMode ? 'bg-gray-700' : 'bg-white'}>-- Select a recent meal --</option>
              {recentMeals.map((meal, index) => (
                <option key={meal.id} value={index} className={darkMode ? 'bg-gray-700' : 'bg-white'}>
                  {meal.name} ({meal.calories} cal)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Database Mode: Search Food Database */}
        <div className="mb-4">
          <label className={`block font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-1`}>
            Search Food Database:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="🔍 Search for a food..."
              className={`${darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'} flex-grow px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`border border-blue-400 px-3 py-2 rounded-md ${darkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} font-medium transition-colors disabled:opacity-50`}
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className={`mt-2 border border-blue-200 rounded-md max-h-40 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
              {searchResults.map((food, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 ${darkMode ? 'hover:bg-gray-600 text-slate-100' : 'hover:bg-blue-50 text-gray-800'} cursor-pointer border-b border-blue-100 last:border-b-0 transition-colors`}
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
          <div className={`mb-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-lg border border-blue-200 shadow-sm`}>
            <h3 className={`font-semibold ${darkMode ? 'text-blue-300 border-blue-700' : 'text-blue-800 border-blue-200'} border-b pb-2 mb-3`}>
              {mealData.name}
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`${darkMode ? 'bg-blue-800' : 'bg-blue-100'} rounded-lg p-2`}>
                <div className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} font-bold`}>
                  {mealData.calories}
                </div>
                <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Calories</div>
              </div>
              <div className={`${darkMode ? 'bg-red-900' : 'bg-red-100'} rounded-lg p-2`}>
                <div className={`${darkMode ? 'text-red-300' : 'text-red-600'} font-bold`}>
                  {mealData.protein}g
                </div>
                <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Protein</div>
              </div>
              <div className={`${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-lg p-2`}>
                <div className={`${darkMode ? 'text-green-300' : 'text-green-600'} font-bold`}>
                  {mealData.carbs}g
                </div>
                <div className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Carbs</div>
              </div>
              <div className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-lg p-2`}>
                <div className={`${darkMode ? 'text-yellow-300' : 'text-yellow-600'} font-bold`}>{mealData.fat}g</div>
                <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-2">
          <label className={`block font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Meal Name:</label>
          <input
            type="text"
            name="name"
            value={mealData.name}
            onChange={handleChange}
            className={`${darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'} w-full px-3 py-2 border border-gray-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors`}
            placeholder="Enter meal name"
          />

          <div className="flex justify-between items-center mt-3">
            <div className="w-1/2 pr-1">
              <label className={`block font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Amount:
              </label>
              <input
                type="number"
                name="amount"
                value={mealData.amount}
                onChange={handleChange}
                min="1"
                className={`${darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'} w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
                placeholder="100"
              />
            </div>
            <div className="w-1/2 pl-1">
              <label className={`block font-medium ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Unit:</label>
              <input
                type="text"
                value="g"
                disabled
                className={`${darkMode ? 'bg-gray-600 text-slate-300' : 'bg-gray-100 text-gray-500'} w-full px-3 py-2 border border-gray-300 rounded-md opacity-70 outline-none`}
              />
            </div>
          </div>

          <label className={`block font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>
            Calories:
          </label>
          <input
            type="number"
            name="calories"
            value={mealData.calories === '' ? '' : mealData.calories}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            className={`${
              darkMode 
                ? (entryMode === 'database' ? 'bg-blue-800 text-slate-100' : 'bg-gray-700 text-slate-100')
                : (entryMode === 'database' ? 'bg-blue-50 text-gray-800' : 'bg-white text-gray-800')
            } w-full px-3 py-2 border ${
              entryMode === 'database'
                ? 'border-blue-300'
                : 'border-gray-400'
            } rounded-md ${
              entryMode === 'database'
                ? 'opacity-90'
                : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            } outline-none transition-colors`}
            placeholder="0"
          />

          <label className={`block font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Protein (g):</label>
          <input
            type="number"
            name="protein"
            value={mealData.protein === '' ? '' : mealData.protein}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`${
              darkMode 
                ? (entryMode === 'database' ? 'bg-red-800 text-slate-100' : 'bg-gray-700 text-slate-100')
                : (entryMode === 'database' ? 'bg-red-50 text-gray-800' : 'bg-white text-gray-800')
            } w-full px-3 py-2 border ${
              entryMode === 'database'
                ? 'border-red-300'
                : 'border-gray-400'
            } rounded-md ${
              entryMode === 'database'
                ? 'opacity-90'
                : 'focus:border-red-500 focus:ring-1 focus:ring-red-500'
            } outline-none transition-colors`}
            placeholder="0"
          />

          <label className={`block font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Carbs (g):</label>
          <input
            type="number"
            name="carbs"
            value={mealData.carbs}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`${
              darkMode 
                ? (entryMode === 'database' ? 'bg-green-800 text-slate-100' : 'bg-gray-700 text-slate-100')
                : (entryMode === 'database' ? 'bg-green-50 text-gray-800' : 'bg-white text-gray-800')
            } w-full px-3 py-2 border ${
              entryMode === 'database'
                ? 'border-green-300'
                : 'border-gray-400'
            } rounded-md ${
              entryMode === 'database'
                ? 'opacity-90'
                : 'focus:border-green-500 focus:ring-1 focus:ring-green-500'
            } outline-none transition-colors`}
            placeholder="0"
          />

          <label className={`block font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Fat (g):</label>
          <input
            type="number"
            name="fat"
            value={mealData.fat}
            onChange={handleChange}
            readOnly={entryMode === 'database'}
            min="0"
            step="0.1"
            className={`${
              darkMode 
                ? (entryMode === 'database' ? 'bg-yellow-800 text-slate-100' : 'bg-gray-700 text-slate-100')
                : (entryMode === 'database' ? 'bg-yellow-50 text-gray-800' : 'bg-white text-gray-800')
            } w-full px-3 py-2 border ${
              entryMode === 'database'
                ? 'border-yellow-300'
                : 'border-gray-400'
            } rounded-md ${
              entryMode === 'database'
                ? 'opacity-90'
                : 'focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
            } outline-none transition-colors`}
            placeholder="0"
          />

          <label className={`block font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-3`}>
            Meal Category:
          </label>
          <select
            name="category"
            value={mealData.category}
            onChange={handleChange}
            className={`${darkMode ? 'bg-gray-700 text-slate-100' : 'bg-white text-gray-800'} w-full px-3 py-2 border border-purple-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors`}
          >
            <option value="uncategorized" className={darkMode ? 'bg-gray-700' : ''}>Uncategorized</option>
            <option value="breakfast" className={darkMode ? 'bg-gray-700' : ''}>Breakfast</option>
            <option value="lunch" className={darkMode ? 'bg-gray-700' : ''}>Lunch</option>
            <option value="dinner" className={darkMode ? 'bg-gray-700' : ''}>Dinner</option>
            <option value="snack" className={darkMode ? 'bg-gray-700' : ''}>Snack</option>
          </select>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className={`border border-black px-4 py-1.5 rounded-md ${darkMode ? 'bg-gray-600 text-slate-100 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} font-medium transition-colors`}
            title="Cancel and close"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !mealData.name.trim()}
            className={`border border-black px-4 py-1.5 rounded-md bg-green-400 hover:bg-green-500 text-white font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 ${darkMode ? 'disabled:bg-gray-700' : 'disabled:bg-gray-300'} disabled:shadow-none`}
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