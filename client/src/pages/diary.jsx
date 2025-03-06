/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import { useSettings } from '../context/settingsContext';
import { 
  getUserMealsByDate, 
  deleteMeal, 
  getUserMetrics, 
  trackWeight, 
  trackSleep, 
  trackExercise 
} from '../services/firestoreService';

function Diary() {
  const { currentUser } = useAuth();
  const { darkMode, editMode } = useSettings();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [metrics, setMetrics] = useState({
    weight: [],
    sleep: [],
    exercise: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add metric modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  
  // Form data for metrics
  const [weightData, setWeightData] = useState({
    weight: '',
    unit: 'kg'
  });
  
  const [sleepData, setSleepData] = useState({
    bedtime: '',
    wakeup: '',
    quality: 5
  });
  
  const [exerciseData, setExerciseData] = useState({
    category: 'cardio',
    duration: '',
    intensity: 'moderate',
    calories: ''
  });
  
  // Nutrition goals (could be fetched from user profile in the future)
  const nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 30,
    sugar: 50,
    sodium: 2300
  };

  // Protect the route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch meals and metrics when date changes
  useEffect(() => {
    const fetchDiaryData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch meals for selected date
        const userMeals = await getUserMealsByDate(currentUser.uid, selectedDate);
        setMeals(userMeals);
        
        // Fetch metrics for selected date
        const fetchAndProcessMetric = async (type) => {
          const userMetrics = await getUserMetrics(currentUser.uid, type);
          
          // Filter metrics for selected date
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);
          const selectedDateEnd = new Date(selectedDate);
          selectedDateEnd.setHours(23, 59, 59, 999);
          
          return userMetrics.filter(metric => {
            if (!metric || !metric.date) return false;
            
            let metricDate;
            try {
              // Handle different date formats
              if (typeof metric.date.toDate === 'function') {
                metricDate = metric.date.toDate();
              } else if (metric.date instanceof Date) {
                metricDate = metric.date;
              } else {
                metricDate = new Date(metric.date);
              }
              
              return metricDate >= selectedDateStart && metricDate <= selectedDateEnd;
            } catch (error) {
              console.error("Error processing date:", error);
              return false;
            }
          });
        };
        
        const weightMetrics = await fetchAndProcessMetric('weight');
        const sleepMetrics = await fetchAndProcessMetric('sleep');
        const exerciseMetrics = await fetchAndProcessMetric('exercise');
        
        setMetrics({
          weight: weightMetrics,
          sleep: sleepMetrics,
          exercise: exerciseMetrics
        });
        
      } catch (error) {
        console.error('Error fetching diary data:', error);
        setError('Failed to load your diary data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaryData();
  }, [currentUser, selectedDate]);

  // Calculate totals from meals
  const calculateTotals = () => {
    const totals = meals.reduce((acc, meal) => {
      // Ensure all values are numbers and have defaults
      acc.calories += Number(meal.calories) || 0;
      acc.protein += Number(meal.protein) || 0;
      acc.carbs += Number(meal.carbs) || 0;
      acc.fat += Number(meal.fat) || 0;
      acc.fiber += Number(meal.fiber) || 0;
      acc.sugar += Number(meal.sugar) || 0;
      acc.sodium += Number(meal.sodium) || 0;
      
      return acc;
    }, { 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });
    
    console.log("Calculated meal totals:", totals);
    return totals;
  };
  
  const totals = calculateTotals();

  // Calculate percentages of daily goals
  const calculatePercentage = (value, goal) => {
    return Math.min(100, Math.round((value / goal) * 100));
  };

  // Group meals by category
  const mealCategories = {
    breakfast: meals.filter(meal => meal.category === 'breakfast'),
    lunch: meals.filter(meal => meal.category === 'lunch'),
    dinner: meals.filter(meal => meal.category === 'dinner'),
    snack: meals.filter(meal => meal.category === 'snack'),
    uncategorized: meals.filter(meal => !meal.category || meal.category === 'uncategorized')
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Navigate to previous/next day
  const navigateDay = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Delete meal
  const handleDeleteMeal = async (mealId) => {
    if (!editMode) {
      alert('Enable edit mode in Settings to delete meals');
      return;
    }
    
    try {
      await deleteMeal(mealId);
      setMeals(meals.filter(meal => meal.id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again.');
    }
  };

  // Add weight
  const handleAddWeight = async () => {
    try {
      if (!weightData.weight) {
        alert('Please enter a weight value');
        return;
      }
      
      await trackWeight(currentUser.uid, weightData.weight, weightData.unit);
      
      // Update local state to show the new entry
      const newWeightMetric = {
        id: 'temp-' + Date.now(),
        type: 'weight',
        date: { toDate: () => new Date() },
        value: Number(weightData.weight),
        details: { unit: weightData.unit },
        createdAt: { toDate: () => new Date() }
      };
      
      setMetrics(prev => ({
        ...prev,
        weight: [newWeightMetric, ...prev.weight]
      }));
      
      // Reset form and close modal
      setWeightData({ weight: '', unit: 'kg' });
      setShowWeightModal(false);
    } catch (error) {
      console.error('Error adding weight:', error);
      setError('Failed to add weight. Please try again.');
    }
  };
  
  // Add sleep
  const handleAddSleep = async () => {
    try {
      if (!sleepData.bedtime || !sleepData.wakeup) {
        alert('Please enter bedtime and wake-up time');
        return;
      }
      
      // Calculate duration for UI update (same calculation we use in firestore)
      const sleepStart = new Date(sleepData.bedtime);
      const sleepEnd = new Date(sleepData.wakeup);
      
      // Handle overnight sleep (when end time is earlier than start time)
      let durationMs = sleepEnd - sleepStart;
      if (durationMs < 0) {
        // If negative, assume sleep is overnight and add a day worth of milliseconds
        durationMs += 24 * 60 * 60 * 1000;
        console.log("Overnight sleep detected, adjusted duration");
      }
      
      // Ensure we have a positive duration
      const durationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
      console.log(`Sleep UI: Start=${sleepStart}, End=${sleepEnd}, Duration=${durationMinutes} minutes`);
      
      await trackSleep(
        currentUser.uid, 
        sleepData.bedtime, 
        sleepData.wakeup, 
        sleepData.quality
      );
      
      // Update local state to show the new entry with the corrected duration
      const newSleepMetric = {
        id: 'temp-' + Date.now(),
        type: 'sleep',
        date: { toDate: () => new Date() },
        value: durationMinutes, // This now comes from our corrected calculation above
        details: { 
          bedtime: { toDate: () => sleepStart },
          wakeup: { toDate: () => sleepEnd },
          quality: Number(sleepData.quality)
        },
        createdAt: { toDate: () => new Date() }
      };
      
      setMetrics(prev => ({
        ...prev,
        sleep: [newSleepMetric, ...prev.sleep]
      }));
      
      // Reset form and close modal
      setSleepData({ bedtime: '', wakeup: '', quality: 5 });
      setShowSleepModal(false);
    } catch (error) {
      console.error('Error adding sleep:', error);
      setError('Failed to add sleep data. Please try again.');
    }
  };
  
  // Add exercise
  const handleAddExercise = async () => {
    try {
      if (!exerciseData.duration) {
        alert('Please enter exercise duration');
        return;
      }
      
      await trackExercise(
        currentUser.uid,
        exerciseData.category,
        exerciseData.duration,
        exerciseData.intensity,
        exerciseData.calories || 0
      );
      
      // Update local state to show the new entry
      const newExerciseMetric = {
        id: 'temp-' + Date.now(),
        type: 'exercise',
        date: { toDate: () => new Date() },
        value: Number(exerciseData.duration),
        details: {
          category: exerciseData.category,
          intensity: exerciseData.intensity,
          calories: Number(exerciseData.calories) || 0,
          duration: Number(exerciseData.duration)
        },
        createdAt: { toDate: () => new Date() }
      };
      
      setMetrics(prev => ({
        ...prev,
        exercise: [newExerciseMetric, ...prev.exercise]
      }));
      
      // Reset form and close modal
      setExerciseData({ 
        category: 'cardio', 
        duration: '', 
        intensity: 'moderate', 
        calories: '' 
      });
      setShowExerciseModal(false);
    } catch (error) {
      console.error('Error adding exercise:', error);
      setError('Failed to add exercise data. Please try again.');
    }
  };

  // Format time from timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    let date;
    try {
      if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return 'Invalid time';
    }
  };
  
  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Component to display meal macronutrients with extra nutrients
  const MealNutrients = ({ meal, darkMode }) => {
    return (
      <div className="flex items-center justify-around text-xs flex-wrap gap-1 mt-2">
        <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
          P: {meal.protein?.toFixed(1) || 0}g
        </div>
        <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
          C: {meal.carbs?.toFixed(1) || 0}g
        </div>
        <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
          F: {meal.fat?.toFixed(1) || 0}g
        </div>
        {Number(meal.fiber) > 0 && (
          <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
            Fiber: {meal.fiber?.toFixed(1) || 0}g
          </div>
        )}
        {Number(meal.sugar) > 0 && (
          <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'}`}>
            Sugar: {meal.sugar?.toFixed(1) || 0}g
          </div>
        )}
        {Number(meal.sodium) > 0 && (
          <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
            Na: {meal.sodium || 0}mg
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-slate-900 text-slate-50' : 'bg-white'}`}>
      <NavBar2 />

      {/* Page Content */}
      <div className={`border-b border-black flex flex-col items-start py-2 px-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
        <h1 className="text-xl font-bold">Diary</h1>
      </div>

      {/* Date Navigation */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigateDay(-1)} 
          className={`px-3 py-1 rounded-md ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          ← Previous Day
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className={`px-3 py-1 rounded-md border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
        />
        <button 
          onClick={() => navigateDay(1)} 
          className={`px-3 py-1 rounded-md ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Next Day →
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mx-4 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading your diary data...</div>
      ) : (
        <div className="container mx-auto px-4 pb-6">
          {/* Nutrition Summary */}
          <div className={`mb-6 p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
            <h2 className="text-lg font-bold mb-3 border-b pb-2">Daily Nutrition</h2>
            
            {/* Calories */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Calories</span>
                <span>{Math.round(totals.calories)} / {nutritionGoals.calories} kcal</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.calories, nutritionGoals.calories)}%` }}></div>
              </div>
            </div>
            
            {/* Protein */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Protein</span>
                <span>{totals.protein.toFixed(1)} / {nutritionGoals.protein} g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-red-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.protein, nutritionGoals.protein)}%` }}></div>
              </div>
            </div>
            
            {/* Carbs */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Carbs</span>
                <span>{totals.carbs.toFixed(1)} / {nutritionGoals.carbs} g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.carbs, nutritionGoals.carbs)}%` }}></div>
              </div>
            </div>
            
            {/* Fat */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Fat</span>
                <span>{totals.fat.toFixed(1)} / {nutritionGoals.fat} g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-yellow-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.fat, nutritionGoals.fat)}%` }}></div>
              </div>
            </div>
            
            {/* Fiber */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Fiber</span>
                <span>{totals.fiber.toFixed(1)} / {nutritionGoals.fiber} g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.fiber, nutritionGoals.fiber)}%` }}></div>
              </div>
            </div>
            
            {/* Sugar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Sugar</span>
                <span>{totals.sugar.toFixed(1)} / {nutritionGoals.sugar} g</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-pink-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.sugar, nutritionGoals.sugar)}%` }}></div>
              </div>
            </div>
            
            {/* Sodium */}
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Sodium</span>
                <span>{totals.sodium.toFixed(0)} / {nutritionGoals.sodium} mg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${calculatePercentage(totals.sodium, nutritionGoals.sodium)}%` }}></div>
              </div>
            </div>
          </div>
          
          {/* Metrics Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Weight Section */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h2 className="text-lg font-bold">Weight</h2>
                <button 
                  onClick={() => setShowWeightModal(true)}
                  className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  + Add
                </button>
              </div>
              
              {metrics.weight.length > 0 ? (
                <div className="space-y-3">
                  {metrics.weight.map((metric) => (
                    <div key={metric.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{metric.value} {metric.details?.unit || 'kg'}</span>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {metric.date ? (
                            typeof metric.date.toDate === 'function' 
                              ? metric.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(metric.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No weight data for this day</p>
              )}
            </div>
            
            {/* Sleep Section */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h2 className="text-lg font-bold">Sleep</h2>
                <button 
                  onClick={() => setShowSleepModal(true)}
                  className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  + Add
                </button>
              </div>
              
              {metrics.sleep.length > 0 ? (
                <div className="space-y-3">
                  {metrics.sleep.map((metric) => (
                    <div key={metric.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{formatDuration(metric.value)}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {formatTime(metric.details?.bedtime)} - {formatTime(metric.details?.wakeup)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'} mr-1`}>Quality:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            metric.details?.quality >= 7 
                              ? 'bg-green-100 text-green-800' 
                              : metric.details?.quality >= 4 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>{metric.details?.quality || 0}/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No sleep data for this day</p>
              )}
            </div>
            
            {/* Exercise Section */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h2 className="text-lg font-bold">Exercise</h2>
                <button 
                  onClick={() => setShowExerciseModal(true)}
                  className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  + Add
                </button>
              </div>
              
              {metrics.exercise.length > 0 ? (
                <div className="space-y-3">
                  {metrics.exercise.map((metric) => (
                    <div key={metric.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium capitalize">{metric.details?.category || 'Exercise'}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {formatDuration(metric.value)} • {metric.details?.intensity || 'moderate'} intensity
                          </div>
                        </div>
                        {metric.details?.calories > 0 && (
                          <div className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                            {metric.details.calories} kcal
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No exercise data for this day</p>
              )}
            </div>
          </div>
          
          {/* Meals Sections */}
          <div className="space-y-6">
            {/* Breakfast */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Breakfast</h2>
              
              {mealCategories.breakfast.length > 0 ? (
                <div className="space-y-3">
                  {mealCategories.breakfast.map((meal) => (
                    <div key={meal.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(meal.calories)} kcal
                          </span>
                          {editMode && (
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete meal"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <MealNutrients meal={meal} darkMode={darkMode} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No breakfast meals logged</p>
              )}
            </div>
            
            {/* Lunch */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Lunch</h2>
              
              {mealCategories.lunch.length > 0 ? (
                <div className="space-y-3">
                  {mealCategories.lunch.map((meal) => (
                    <div key={meal.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(meal.calories)} kcal
                          </span>
                          {editMode && (
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete meal"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <MealNutrients meal={meal} darkMode={darkMode} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No lunch meals logged</p>
              )}
            </div>
            
            {/* Dinner */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Dinner</h2>
              
              {mealCategories.dinner.length > 0 ? (
                <div className="space-y-3">
                  {mealCategories.dinner.map((meal) => (
                    <div key={meal.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(meal.calories)} kcal
                          </span>
                          {editMode && (
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete meal"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <MealNutrients meal={meal} darkMode={darkMode} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No dinner meals logged</p>
              )}
            </div>
            
            {/* Snacks */}
            <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-lg font-bold mb-3 border-b pb-2">Snacks</h2>
              
              {mealCategories.snack.length > 0 ? (
                <div className="space-y-3">
                  {mealCategories.snack.map((meal) => (
                    <div key={meal.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(meal.calories)} kcal
                          </span>
                          {editMode && (
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete meal"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <MealNutrients meal={meal} darkMode={darkMode} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No snacks logged</p>
              )}
            </div>
            
            {/* Uncategorized */}
            {mealCategories.uncategorized.length > 0 && (
              <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
                <h2 className="text-lg font-bold mb-3 border-b pb-2">Other Meals</h2>
                
                <div className="space-y-3">
                  {mealCategories.uncategorized.map((meal) => (
                    <div key={meal.id} className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(meal.calories)} kcal
                          </span>
                          {editMode && (
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete meal"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <MealNutrients meal={meal} darkMode={darkMode} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Track Weight</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Weight</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weightData.weight}
                  onChange={(e) => setWeightData({...weightData, weight: e.target.value})}
                  className={`flex-grow px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
                <select
                  value={weightData.unit}
                  onChange={(e) => setWeightData({...weightData, unit: e.target.value})}
                  className={`px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className={`px-4 py-2 border rounded-md ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddWeight}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Track Sleep</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Bedtime</label>
              <input
                type="datetime-local"
                value={sleepData.bedtime}
                onChange={(e) => setSleepData({...sleepData, bedtime: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Wake Time</label>
              <input
                type="datetime-local"
                value={sleepData.wakeup}
                onChange={(e) => setSleepData({...sleepData, wakeup: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Sleep Quality (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={sleepData.quality}
                onChange={(e) => setSleepData({...sleepData, quality: e.target.value})}
                className="w-full"
              />
              <div className="flex justify-between text-xs">
                <span>Poor (1)</span>
                <span>Average (5)</span>
                <span>Excellent (10)</span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSleepModal(false)}
                className={`px-4 py-2 border rounded-md ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSleep}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Track Exercise</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Category</label>
              <select
                value={exerciseData.category}
                onChange={(e) => setExerciseData({...exerciseData, category: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={exerciseData.duration}
                onChange={(e) => setExerciseData({...exerciseData, duration: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="0"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Intensity</label>
              <select
                value={exerciseData.intensity}
                onChange={(e) => setExerciseData({...exerciseData, intensity: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very high">Very High</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Calories Burned (optional)</label>
              <input
                type="number"
                value={exerciseData.calories}
                onChange={(e) => setExerciseData({...exerciseData, calories: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowExerciseModal(false)}
                className={`px-4 py-2 border rounded-md ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddExercise}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Diary;