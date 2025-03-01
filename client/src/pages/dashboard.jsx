/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate, Link } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import QuickAddMealModal from '../components/quickAddModal';
import useAuth from '../context/getUseAuth';
import { getUserMeals } from '../services/firestoreService';
import { useSettings } from '../context/settingsContext';

function Dashboard() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Protect the dashboard route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch user's meals from Firestore
  useEffect(() => {
    const fetchMeals = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userMeals = await getUserMeals(currentUser.uid);
        setMeals(userMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
        setError('Failed to load your meal data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [currentUser]);

  // Calculate total calories and macros for today
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const todaysMeals = meals.filter(meal => {
    const mealDate = new Date(meal.createdAt?.toDate() || meal.date || Date.now())
      .toISOString().split('T')[0];
    return mealDate === today;
  });
  
  // Calculate the raw totals
  let rawTotalCalories = todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  let rawTotalProtein = todaysMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  let rawTotalCarbs = todaysMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  let rawTotalFat = todaysMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
  
  // Round the values for display
  const totalCalories = Math.round(rawTotalCalories);
  const totalProtein = Math.round(rawTotalProtein * 10) / 10;
  const totalCarbs = Math.round(rawTotalCarbs * 10) / 10;
  const totalFat = Math.round(rawTotalFat * 10) / 10;

  // Daily goals (could be stored in user profile in the future)
  const calorieGoal = 2000;
  const proteinGoal = 150;
  const carbsGoal = 200;
  const fatGoal = 65;

  // Calculate percentages for progress bars
  const caloriePercentage = Math.min(100, (totalCalories / calorieGoal) * 100);
  const proteinPercentage = Math.min(100, (totalProtein / proteinGoal) * 100);
  const carbsPercentage = Math.min(100, (totalCarbs / carbsGoal) * 100);
  const fatPercentage = Math.min(100, (totalFat / fatGoal) * 100);

  // Import settings context
  const { darkMode } = useSettings();

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-slate-900 text-slate-50' : 'bg-white'}`}>
      <NavBar2 />

      {/* Page Content */}
      <div className={`border-b border-black flex flex-col items-start py-2 px-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
        {/* Navigation Buttons */}
        <div className="flex space-x-4 m-1">
          <Link
            to="/"
            className={`border border-black px-3 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-[#DECEFF]'} text-sm`}
          >
            Home
          </Link>
          <Link
            to="/log-meal"
            className={`border border-black px-3 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-[#DECEFF]'} text-sm`}
          >
            Log Meal
          </Link>
          <Link
            to="/meal-history"
            className={`border border-black px-3 py-1 rounded-md ${darkMode ? 'bg-slate-800 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-[#DECEFF]'} text-sm`}
          >
            Meal History
          </Link>
        </div>
      </div>

      {/* Welcome Message */}
      <div className={`border border-black ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} px-24 py-4 mx-auto rounded-md mt-10 text-center`}>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          Welcome back, {currentUser?.displayName || 'Nutrition Tracker User'}!
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mx-auto mt-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center mt-8">Loading your nutrition data...</div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-2xl mx-auto">
            {/* Calories Card */}
            <div className={`border border-black rounded-md shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} p-6`}>
              <h3 className={`text-xl font-semibold mb-3 text-center border-b ${darkMode ? 'border-slate-600' : 'border-gray-300'} pb-2`}>Today&apos;s Calories</h3>
              <div className="bg-gray-200 w-full h-8 rounded-full mb-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ width: `${caloriePercentage}%` }}
                >
                  {caloriePercentage > 15 ? `${Math.round((totalCalories / calorieGoal) * 100)}%` : ''}
                </div>
              </div>
              <div className="flex justify-between text-sm mb-4 font-medium">
                <span className={`${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} px-3 py-1 rounded-full`}>{totalCalories} kcal</span>
                <span className={`${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100'} px-3 py-1 rounded-full`}>{calorieGoal} kcal goal</span>
              </div>
              <p className={`text-center ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-gray-700'} rounded-lg p-3 shadow-sm`}>
                You&apos;ve consumed <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{totalCalories} calories</span> today, which is{' '}
                <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{Math.round((totalCalories / calorieGoal) * 100)}%</span> of your daily goal.
              </p>
            </div>

            {/* Macros Card */}
            <div className={`border border-black rounded-md shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} p-6`}>
              <h3 className={`text-xl font-semibold mb-3 text-center border-b ${darkMode ? 'border-slate-600' : 'border-gray-300'} pb-2`}>Today&apos;s Macros</h3>
              
              {/* Macro Progress Bars */}
              <div className="mb-4">
                {/* Protein */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Protein</span>
                    <span>{totalProtein}g / {proteinGoal}g</span>
                  </div>
                  <div className="bg-gray-200 w-full h-4 rounded-full mb-2">
                    <div 
                      className="bg-red-500 h-4 rounded-full"
                      style={{ width: `${proteinPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Carbs */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Carbs</span>
                    <span>{totalCarbs}g / {carbsGoal}g</span>
                  </div>
                  <div className="bg-gray-200 w-full h-4 rounded-full">
                    <div 
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${carbsPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Fat */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Fat</span>
                    <span>{totalFat}g / {fatGoal}g</span>
                  </div>
                  <div className="bg-gray-200 w-full h-4 rounded-full">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full"
                      style={{ width: `${fatPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Summary View */}
              <div className="flex justify-around border-t border-gray-300 pt-3">
                <div className="text-center">
                  <div className="font-medium">Calories</div>
                  <div className="text-blue-600">{totalCalories}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Protein</div>
                  <div className="text-red-600">{totalProtein}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Carbs</div>
                  <div className="text-green-600">{totalCarbs}g</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Fat</div>
                  <div className="text-yellow-600">{totalFat}g</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Meals Section */}
          <div className={`w-full max-w-2xl mx-auto mt-6 p-4 border border-black rounded-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'}`}>
            <div className={`flex justify-between items-center mb-3 border-b ${darkMode ? 'border-slate-600' : 'border-gray-300'} pb-2`}>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-100' : ''}`}>Today&apos;s Meals</h3>
              <Link 
                to="/meal-history" 
                className={`${darkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-100'} px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center`}
                title="View meal history"
              >
                <span>View all meals</span>
                <span className="ml-1">→</span>
              </Link>
            </div>
            {todaysMeals.length > 0 ? (
              <div className="space-y-2">
                {todaysMeals.slice(0, 3).map((meal) => (
                  <div key={meal.id} className={`border ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-white'} p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-semibold text-lg ${darkMode ? 'text-slate-100' : ''}`}>{meal.name}</span>
                      <span className={`${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} px-2 py-1 rounded-full font-medium`}>
                        {Math.round(meal.calories || 0)} kcal
                      </span>
                    </div>
                    <div className="flex justify-around items-center mt-3 relative">
                      {/* Protein */}
                      <div className="text-center">
                        <div className={`${darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'} rounded-lg px-3 py-1.5 font-medium`}>
                          {Math.round((meal.protein || 0) * 10) / 10}g
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Protein</div>
                      </div>
                      
                      {/* Vertical Divider */}
                      <div className={`h-12 w-px ${darkMode ? 'bg-slate-600' : 'bg-gray-300'} absolute left-1/3 top-1/2 transform -translate-y-1/2`}></div>
                      
                      {/* Carbs */}
                      <div className="text-center">
                        <div className={`${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'} rounded-lg px-3 py-1.5 font-medium`}>
                          {Math.round((meal.carbs || 0) * 10) / 10}g
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Carbs</div>
                      </div>
                      
                      {/* Vertical Divider */}
                      <div className={`h-12 w-px ${darkMode ? 'bg-slate-600' : 'bg-gray-300'} absolute left-2/3 top-1/2 transform -translate-y-1/2`}></div>
                      
                      {/* Fat */}
                      <div className="text-center">
                        <div className={`${darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600'} rounded-lg px-3 py-1.5 font-medium`}>
                          {Math.round((meal.fat || 0) * 10) / 10}g
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Fat</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>No meals logged today. Start tracking your nutrition!</p>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 m-6 max-w-4xl mx-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-black px-4 py-2 rounded-md bg-green-400 hover:bg-green-500 text-white font-medium shadow-sm hover:shadow transition-all flex items-center justify-center"
          title="Add a new meal"
        >
          <span className="mr-1 text-lg">+</span>
          <span>Quick Add Meal</span>
        </button>
        <button className={`border border-black px-4 py-2 rounded-md ${darkMode ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-gray-200'}`}>
          Set Goals
        </button>
        <button className={`border border-black px-4 py-2 rounded-md ${darkMode ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-gray-200'}`}>
          Food Search
        </button>
        <button className={`border border-black px-4 py-2 rounded-md ${darkMode ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-white hover:bg-gray-200'}`}>
          Weekly Report
        </button>
      </div>

      {/* Quick Add Meal Modal */}
      <QuickAddMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={currentUser?.uid}
      />

      <Footer />
    </div>
  );
}

export default Dashboard;
