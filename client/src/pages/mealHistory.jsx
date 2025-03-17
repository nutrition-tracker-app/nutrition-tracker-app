/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate, Link } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import {
  getUserDiaryEntries,
  deleteDiaryEntry,
  updateDiaryEntry,
} from '../services/firestoreService';
import QuickAddMealModal from '../components/quickAddModal';
import EditableContent from '../components/editableContent';
import { useSettings } from '../context/settingsContext';

function MealHistory() {
  const { currentUser } = useAuth();
  const { editMode, darkMode } = useSettings();
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Group meals by date
  const [groupedMeals, setGroupedMeals] = useState({});

  // Protect the route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Function to fetch and process meals
  const fetchAndProcessMeals = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors

      console.log('Fetching meals for user ID:', currentUser.uid);
      const userMeals = await getUserDiaryEntries(currentUser.uid);
      console.log(`Fetched ${userMeals.length} meals`);

      setMeals(userMeals);

      // Group meals by date
      const grouped = {};
      userMeals.forEach((meal) => {
        // Handle different date formats safely
        let mealDate;
        try {
          if (meal.createdAt && typeof meal.createdAt.toDate === 'function') {
            // Firestore timestamp
            mealDate = meal.createdAt.toDate().toISOString().split('T')[0];
          } else if (meal.date instanceof Date) {
            // JavaScript Date object
            mealDate = meal.date.toISOString().split('T')[0];
          } else if (meal.date && typeof meal.date === 'string') {
            // ISO string or other date string
            mealDate = new Date(meal.date).toISOString().split('T')[0];
          } else {
            // Fallback to current date if no valid date is found
            mealDate = new Date().toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error parsing date for meal:', meal, e);
          mealDate = new Date().toISOString().split('T')[0];
        }

        if (!grouped[mealDate]) {
          grouped[mealDate] = [];
        }

        grouped[mealDate].push(meal);
      });

      console.log(`Grouped meals into ${Object.keys(grouped).length} dates`);
      setGroupedMeals(grouped);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('Failed to load your meal data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Fetch meals when component mounts or modal closes
  useEffect(() => {
    fetchAndProcessMeals();
  }, [currentUser, isModalOpen, fetchAndProcessMeals]);

  // Add a function to manually refresh
  const handleRefresh = () => {
    fetchAndProcessMeals();
  }; // Re-fetch when modal closes (potential new meal added)

  // Handle meal update
  const handleUpdateMeal = async (mealId, field, value) => {
    // Don't update if the value is empty
    if (value === '' || value === null || value === undefined) {
      return;
    }

    try {
      console.log(`Updating meal ${mealId}, field: ${field}, value: ${value}`);

      // Find the meal in our local state
      const mealToUpdate = meals.find((meal) => meal.id === mealId);
      if (!mealToUpdate) {
        console.error('Meal not found in local state');
        return;
      }

      // Update the meal in Firestore
      await updateDiaryEntry(mealId, {
        [field]: field === 'name' ? value : Number(value),
      });

      // Update local state
      const updatedMeals = meals.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            [field]: field === 'name' ? value : Number(value),
            updatedAt: new Date(), // Client-side timestamp for immediate UI update
          };
        }
        return meal;
      });

      setMeals(updatedMeals);

      // Update grouped meals
      const newGroupedMeals = { ...groupedMeals };
      Object.keys(newGroupedMeals).forEach((date) => {
        newGroupedMeals[date] = newGroupedMeals[date].map((meal) => {
          if (meal.id === mealId) {
            return {
              ...meal,
              [field]: field === 'name' ? value : Number(value),
              updatedAt: new Date(),
            };
          }
          return meal;
        });
      });

      setGroupedMeals(newGroupedMeals);

      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Failed to update meal. Please try again.');
    }
  };

  // Handle meal deletion
  const handleDeleteMeal = async (mealId) => {
    // Use window.confirm to ensure it's properly scoped
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      console.log('Deleting meal with ID:', mealId);
      await deleteDiaryEntry(mealId);
      console.log('Meal deleted successfully');

      // Update local state to reflect deletion
      setMeals(meals.filter((meal) => meal.id !== mealId));

      // Update grouped meals
      const newGroupedMeals = { ...groupedMeals };
      Object.keys(newGroupedMeals).forEach((date) => {
        newGroupedMeals[date] = newGroupedMeals[date].filter(
          (meal) => meal.id !== mealId
        );
        if (newGroupedMeals[date].length === 0) {
          delete newGroupedMeals[date];
        }
      });

      setGroupedMeals(newGroupedMeals);

      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }
  };

  // Filter meals based on selected date
  const filteredDates =
    selectedDate === 'all'
      ? Object.keys(groupedMeals).sort((a, b) => new Date(b) - new Date(a))
      : selectedDate && selectedDate in groupedMeals
      ? [selectedDate]
      : [];

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString; // Fallback to the original string
    }
  };

  // Calculate daily totals
  const calculateDailyTotals = (meals) => {
    return meals.reduce(
      (totals, meal) => {
        return {
          calories: totals.calories + (meal.calories || 0),
          protein: totals.protein + (meal.protein || 0),
          carbs: totals.carbs + (meal.carbs || 0),
          fat: totals.fat + (meal.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Get available dates for filter dropdown
  const availableDates = Object.keys(groupedMeals).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Apply edit-mode class to document body when in edit mode
  useEffect(() => {
    if (editMode) {
      document.body.classList.add('edit-mode');
    } else {
      document.body.classList.remove('edit-mode');
    }

    return () => {
      document.body.classList.remove('edit-mode');
    };
  }, [editMode]);

  return (
    <div
      className={`${
        darkMode ? 'bg-slate-900' : 'bg-white'
      } flex flex-col min-h-screen transition-colors`}
    >
      <NavBar2 />

      {/* Page Header */}
      <div
        className={`border-b border-black flex flex-col items-start py-2 px-6 ${
          darkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}
      >
        {/* Navigation Buttons */}
        <div className="flex space-x-4 m-1">
          <Link
            to="/dashboard"
            className={`border border-black px-3 py-1 rounded-md ${
              darkMode
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-600'
                : 'bg-white hover:bg-[#DECEFF]'
            } text-sm`}
          >
            Dashboard
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`border border-black px-3 py-1 rounded-md ${
              darkMode
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-600'
                : 'bg-white hover:bg-[#DECEFF]'
            } text-sm`}
          >
            Log Meal
          </button>
          <Link
            to="/diary"
            className={`border border-black px-3 py-1 rounded-md ${
              darkMode
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-600'
                : 'bg-white hover:bg-[#DECEFF]'
            } text-sm`}
          >
            Diary
          </Link>
          <Link
            to="/meal-history"
            className={`border border-black px-3 py-1 rounded-md ${
              darkMode
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-600'
                : 'bg-white hover:bg-[#DECEFF]'
            } text-sm`}
          >
            Meal History
          </Link>
          <Link
            to="/charts"
            className={`border border-black px-3 py-1 rounded-md ${
              darkMode
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-600'
                : 'bg-white hover:bg-[#DECEFF]'
            } text-sm`}
          >
            Charts
          </Link>
        </div>
      </div>

      {/* Page Title */}
      <div
        className={`border border-black ${
          darkMode ? 'bg-slate-800 text-slate-100' : 'bg-gray-100'
        } px-24 py-4 mx-auto rounded-md mt-10 text-center`}
      >
        <h2
          className={`text-2xl font-bold ${
            darkMode ? 'text-slate-100' : 'text-gray-900'
          }`}
        >
          Your Meal History
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mx-auto mt-4 max-w-2xl">
          {error}
        </div>
      )}

      {/* Date Filter and Controls */}
      <div
        className={`w-full max-w-2xl mx-auto mt-6 pb-3 border-b ${
          darkMode ? 'border-slate-600' : 'border-gray-300'
        }`}
      >
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <label
              htmlFor="date-filter"
              className={`font-medium mr-2 ${darkMode ? 'text-slate-200' : ''}`}
            >
              Filter by date:
            </label>
            <select
              id="date-filter"
              className={`border ${
                darkMode
                  ? 'border-slate-600 bg-slate-700 text-slate-200'
                  : 'border-gray-300 bg-white'
              } rounded-md p-1`}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">All dates</option>
              {today in groupedMeals && <option value={today}>Today</option>}
              {yesterday in groupedMeals && (
                <option value={yesterday}>Yesterday</option>
              )}
              {availableDates.map(
                (date) =>
                  date !== today &&
                  date !== yesterday && (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  )
              )}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className={`border border-black px-3 py-1 rounded-md ${
                darkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-white hover:bg-gray-100'
              } text-sm flex items-center font-medium`}
              disabled={isLoading}
            >
              {isLoading ? <span>Refreshing...</span> : <span>↻ Refresh</span>}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="border border-black px-4 py-1.5 rounded-md bg-green-400 hover:bg-green-500 text-sm font-medium text-white shadow-sm hover:shadow transition-all flex items-center"
              title="Add a new meal"
            >
              <span className="mr-1 text-lg">+</span>
              <span>Add Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meal History Content */}
      <div className="max-w-2xl mx-auto my-6 w-full px-4">
        {isLoading ? (
          <div className="text-center py-8">Loading your meal history...</div>
        ) : Object.keys(groupedMeals).length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode
                ? 'bg-slate-800 border-slate-600'
                : 'bg-white border-gray-300'
            } rounded-lg shadow-sm border p-6`}
          >
            <h3
              className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-slate-100' : ''
              }`}
            >
              No meals found
            </h3>
            <p
              className={`${
                darkMode ? 'text-slate-300' : 'text-gray-600'
              } mb-4`}
            >
              You haven&apos;t logged any meals yet.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Add Your First Meal
            </button>
          </div>
        ) : filteredDates.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode
                ? 'bg-slate-800 border-slate-600'
                : 'bg-white border-gray-300'
            } rounded-lg shadow-sm border p-6`}
          >
            <h3
              className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-slate-100' : ''
              }`}
            >
              No meals for selected date
            </h3>
            <p
              className={`${
                darkMode ? 'text-slate-300' : 'text-gray-600'
              } mb-4`}
            >
              Try selecting a different date or view all meals.
            </p>
            <button
              onClick={() => setSelectedDate('all')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              View All Meals
            </button>
          </div>
        ) : (
          filteredDates.map((date) => (
            <div key={date} className="mb-8">
              <div
                className={`flex justify-between items-center mb-3 border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? 'text-slate-100' : ''
                  }`}
                >
                  {date === today
                    ? 'Today'
                    : date === yesterday
                    ? 'Yesterday'
                    : formatDate(date)}
                </h3>
                <div
                  className={`${
                    darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100'
                  } px-2 py-1 rounded-full text-sm font-medium`}
                >
                  {groupedMeals[date]
                    ? `${groupedMeals[date].length} ${
                        groupedMeals[date].length === 1 ? 'meal' : 'meals'
                      }`
                    : '0 meals'}
                </div>
              </div>

              {/* Daily Totals */}
              {groupedMeals[date] &&
                (() => {
                  const totals = calculateDailyTotals(groupedMeals[date]);
                  // Round values to 1 decimal place for better readability
                  const roundedTotals = {
                    calories: Math.round(totals.calories),
                    protein: Math.round(totals.protein * 10) / 10,
                    carbs: Math.round(totals.carbs * 10) / 10,
                    fat: Math.round(totals.fat * 10) / 10,
                  };

                  return (
                    <div
                      className={`${
                        darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
                      } p-4 rounded-lg mb-4 border ${
                        darkMode ? 'border-slate-600' : 'border-gray-300'
                      } shadow-sm`}
                    >
                      <div
                        className={`font-semibold mb-3 text-center border-b ${
                          darkMode
                            ? 'border-slate-600 text-slate-100'
                            : 'border-gray-300'
                        } pb-2`}
                      >
                        Daily Totals
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:justify-around gap-2 text-sm">
                        <div
                          className={`${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          } rounded-lg p-2 text-center shadow-sm`}
                        >
                          <div
                            className={`font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}
                          >
                            Calories
                          </div>
                          <div
                            className={`${
                              darkMode ? 'text-blue-400' : 'text-blue-600'
                            } font-bold text-lg`}
                          >
                            {roundedTotals.calories}
                          </div>
                        </div>
                        <div
                          className={`${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          } rounded-lg p-2 text-center shadow-sm`}
                        >
                          <div
                            className={`font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}
                          >
                            Protein
                          </div>
                          <div
                            className={`${
                              darkMode ? 'text-red-400' : 'text-red-600'
                            } font-bold text-lg`}
                          >
                            {roundedTotals.protein}g
                          </div>
                        </div>
                        <div
                          className={`${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          } rounded-lg p-2 text-center shadow-sm`}
                        >
                          <div
                            className={`font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}
                          >
                            Carbs
                          </div>
                          <div
                            className={`${
                              darkMode ? 'text-green-400' : 'text-green-600'
                            } font-bold text-lg`}
                          >
                            {roundedTotals.carbs}g
                          </div>
                        </div>
                        <div
                          className={`${
                            darkMode ? 'bg-slate-700' : 'bg-white'
                          } rounded-lg p-2 text-center shadow-sm`}
                        >
                          <div
                            className={`font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}
                          >
                            Fat
                          </div>
                          <div
                            className={`${
                              darkMode ? 'text-yellow-400' : 'text-yellow-600'
                            } font-bold text-lg`}
                          >
                            {roundedTotals.fat}g
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Meals List */}
              <div className="space-y-3">
                {groupedMeals[date] &&
                  groupedMeals[date].map((meal) => {
                    // Format meal time
                    let mealTime = '';
                    try {
                      if (
                        meal.createdAt &&
                        typeof meal.createdAt.toDate === 'function'
                      ) {
                        mealTime = new Date(
                          meal.createdAt.toDate()
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      }
                    } catch (e) {
                      console.error('Error formatting meal time:', e);
                    }

                    return (
                      <div
                        key={meal.id}
                        className={`border border-gray-300 p-4 rounded-lg ${
                          darkMode ? 'bg-slate-800' : 'bg-white'
                        } shadow-sm hover:shadow-md transition-shadow themed-card`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <EditableContent
                              value={meal.name || 'Unnamed Meal'}
                              onChange={(value) =>
                                handleUpdateMeal(meal.id, 'name', value)
                              }
                              className={`font-semibold text-lg ${
                                darkMode ? 'text-slate-50' : 'text-gray-800'
                              }`}
                              placeholder="Enter meal name"
                            />
                            {mealTime && (
                              <div
                                className={`text-xs ${
                                  darkMode ? 'text-slate-400' : 'text-gray-500'
                                }`}
                              >
                                {mealTime}
                              </div>
                            )}
                            {meal.updatedAt && (
                              <div
                                className={`text-xs ${
                                  darkMode ? 'text-blue-400' : 'text-blue-500'
                                }`}
                              >
                                Edited:{' '}
                                {typeof meal.updatedAt.toDate === 'function'
                                  ? new Date(
                                      meal.updatedAt.toDate()
                                    ).toLocaleString()
                                  : new Date(meal.updatedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                darkMode ? 'text-blue-400 bg-blue-900' : ''
                              }`}
                            >
                              <EditableContent
                                value={Math.round(meal.calories || 0)}
                                onChange={(value) =>
                                  handleUpdateMeal(meal.id, 'calories', value)
                                }
                                type="number"
                                className="inline w-12 text-center bg-transparent"
                              />{' '}
                              kcal
                            </div>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 p-1.5 rounded-full w-7 h-7 flex items-center justify-center text-lg font-medium transition-colors"
                              title="Delete this meal"
                              aria-label="Delete meal"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-around items-center mt-3 relative">
                          {/* Protein */}
                          <div className="text-center">
                            <div
                              className={`${
                                darkMode
                                  ? 'bg-red-900 text-red-300'
                                  : 'bg-red-100 text-red-600'
                              } rounded-lg px-3 py-1.5 font-medium`}
                            >
                              <EditableContent
                                value={
                                  Math.round((meal.protein || 0) * 10) / 10
                                }
                                onChange={(value) =>
                                  handleUpdateMeal(meal.id, 'protein', value)
                                }
                                type="number"
                                className="inline w-12 text-center bg-transparent"
                              />
                              g
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                darkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}
                            >
                              Protein
                            </div>
                          </div>

                          {/* Vertical Divider */}
                          <div
                            className={`h-12 w-px ${
                              darkMode ? 'bg-slate-600' : 'bg-gray-300'
                            } absolute left-1/3 top-1/2 transform -translate-y-1/2`}
                          ></div>

                          {/* Carbs */}
                          <div className="text-center">
                            <div
                              className={`${
                                darkMode
                                  ? 'bg-green-900 text-green-300'
                                  : 'bg-green-100 text-green-600'
                              } rounded-lg px-3 py-1.5 font-medium`}
                            >
                              <EditableContent
                                value={Math.round((meal.carbs || 0) * 10) / 10}
                                onChange={(value) =>
                                  handleUpdateMeal(meal.id, 'carbs', value)
                                }
                                type="number"
                                className="inline w-12 text-center bg-transparent"
                              />
                              g
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                darkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}
                            >
                              Carbs
                            </div>
                          </div>

                          {/* Vertical Divider */}
                          <div
                            className={`h-12 w-px ${
                              darkMode ? 'bg-slate-600' : 'bg-gray-300'
                            } absolute left-2/3 top-1/2 transform -translate-y-1/2`}
                          ></div>

                          {/* Fat */}
                          <div className="text-center">
                            <div
                              className={`${
                                darkMode
                                  ? 'bg-yellow-900 text-yellow-300'
                                  : 'bg-yellow-100 text-yellow-600'
                              } rounded-lg px-3 py-1.5 font-medium`}
                            >
                              <EditableContent
                                value={Math.round((meal.fat || 0) * 10) / 10}
                                onChange={(value) =>
                                  handleUpdateMeal(meal.id, 'fat', value)
                                }
                                type="number"
                                className="inline w-12 text-center bg-transparent"
                              />
                              g
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                darkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}
                            >
                              Fat
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Meal Modal */}
      <QuickAddMealModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Use our shared function to refresh meals
          fetchAndProcessMeals();
        }}
        userId={currentUser?.uid}
      />

      <Footer />
    </div>
  );
}

export default MealHistory;
