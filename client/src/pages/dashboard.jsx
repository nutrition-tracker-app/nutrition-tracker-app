/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate, Link } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import QuickAddMealModal from '../components/quickAddModal';
import useAuth from '../context/getUseAuth';
import {
  getUserDiaryEntries,
  getLatestUserMetric,
  getUserStreak,
  getUserMetricsByDate,
  getUserWeightHistory,
} from '../services/firestoreService';
import { useSettings } from '../context/settingsContext';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function Dashboard() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meals, setMeals] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);
  const [latestSleep, setLatestSleep] = useState(null);
  const [exerciseMetrics, setExerciseMetrics] = useState([]);
  const [userStreak, setUserStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const navigate = useNavigate();

  // Protect the dashboard route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch user's meals and metrics from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);

        // Fetch in parallel for better performance
        const userMeals = await getUserDiaryEntries(currentUser.uid);
        setMeals(userMeals);

        try {
          // For weight, we want the most recent entry regardless of date
          const weightMetric = await getLatestUserMetric(
            currentUser.uid,
            'weight',
            false // Get latest weight, not just today's
          );
          setLatestWeight(weightMetric);
        } catch (weightError) {
          console.error('Error fetching weight metric:', weightError);
          // Don't let this error stop the entire dashboard
        }

        try {
          // Get sleep metrics for today only, not from past days
          const sleepMetric = await getLatestUserMetric(
            currentUser.uid,
            'sleep',
            true // Only get sleep for today
          );
          setLatestSleep(sleepMetric);
        } catch (sleepError) {
          console.error('Error fetching sleep metric:', sleepError);
          // Don't let this error stop the entire dashboard
        }

        try {
          // Get exercise metrics for today
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          // We'll need to add a function to get exercise metrics for today in firestoreService
          const exerciseData = await getUserMetricsByDate(
            currentUser.uid,
            'exercise',
            todayStart,
            todayEnd
          );
          setExerciseMetrics(exerciseData || []);
        } catch (exerciseError) {
          console.error('Error fetching exercise metrics:', exerciseError);
          // Don't let this error stop the entire dashboard
        }

        try {
          const streak = await getUserStreak(currentUser.uid);
          setUserStreak(streak);
        } catch (streakError) {
          console.error('Error fetching user streak:', streakError);
          // Don't let this error stop the entire dashboard
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load your data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, isModalOpen]);

  // Fetch user's all past weight entries
  useEffect(() => {
    const fetchWeightHistory = async () => {
      if (!currentUser) return;

      try {
        console.log('Fetching weight history...');
        const history = await getUserWeightHistory(currentUser.uid);

        if (!history || history.length === 0) {
          console.warn('No weight history data found.');
          return;
        }

        setWeightHistory(
          history.map((entry) => ({
            date: new Date(entry.date.toDate()).toLocaleDateString(),
            weight: entry.value,
          }))
        );
      } catch (error) {
        console.error('Error fetching weight history:', error);
      }
    };

    fetchWeightHistory();
  }, [currentUser]);

  // Calculate total calories and macros for today
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  // Safely filter meals with error handling
  const todaysMeals = (meals || []).filter((meal) => {
    try {
      if (!meal) return false;

      let mealDate;
      // Handle different date formats safely
      if (meal.createdAt && typeof meal.createdAt.toDate === 'function') {
        mealDate = meal.createdAt.toDate().toISOString().split('T')[0];
      } else if (meal.date instanceof Date) {
        mealDate = meal.date.toISOString().split('T')[0];
      } else if (meal.date && typeof meal.date === 'string') {
        mealDate = new Date(meal.date).toISOString().split('T')[0];
      } else {
        mealDate = new Date().toISOString().split('T')[0]; // Default to today
      }

      return mealDate === today;
    } catch (error) {
      console.error('Error filtering meal:', meal, error);
      return false;
    }
  });

  // Safely calculate totals with error handling
  let rawTotalCalories = 0,
    rawTotalProtein = 0,
    rawTotalCarbs = 0,
    rawTotalFat = 0;

  try {
    // Calculate the raw totals
    rawTotalCalories = todaysMeals.reduce(
      (sum, meal) => sum + (Number(meal?.calories) || 0),
      0
    );
    rawTotalProtein = todaysMeals.reduce(
      (sum, meal) => sum + (Number(meal?.protein) || 0),
      0
    );
    rawTotalCarbs = todaysMeals.reduce(
      (sum, meal) => sum + (Number(meal?.carbs) || 0),
      0
    );
    rawTotalFat = todaysMeals.reduce(
      (sum, meal) => sum + (Number(meal?.fat) || 0),
      0
    );
  } catch (error) {
    console.error('Error calculating meal totals:', error);
    // Leave the totals as 0
  }

  // Calculate exercise calories burned
  let exerciseCaloriesBurned = 0;
  try {
    exerciseCaloriesBurned = exerciseMetrics.reduce((total, exercise) => {
      return total + (Number(exercise.details?.calories) || 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating exercise calories:', error);
  }

  // Calculate net calories (consumed - burned)
  const netCalories = Math.max(0, rawTotalCalories - exerciseCaloriesBurned);

  // Round the values for display
  const totalCalories = Math.round(rawTotalCalories);
  const totalNetCalories = Math.round(netCalories);
  const totalExerciseCalories = Math.round(exerciseCaloriesBurned);
  const totalProtein = Math.round(rawTotalProtein * 10) / 10;
  const totalCarbs = Math.round(rawTotalCarbs * 10) / 10;
  const totalFat = Math.round(rawTotalFat * 10) / 10;

  // Get calorie goal from settings
  const { userProfile } = useSettings();
  const calorieGoal = userProfile?.targetCalories || 2000;

  // Calculate macronutrient goals based on calorie goal
  // Protein: 30% of calories (4 calories per gram)
  // Carbs: 45% of calories (4 calories per gram)
  // Fat: 25% of calories (9 calories per gram)
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  // Calculate percentages for progress bars - safely
  let caloriePercentage = 0,
    proteinPercentage = 0,
    carbsPercentage = 0,
    fatPercentage = 0;

  try {
    caloriePercentage =
      Math.min(100, (totalNetCalories / calorieGoal) * 100) || 0;
    proteinPercentage = Math.min(100, (totalProtein / proteinGoal) * 100) || 0;
    carbsPercentage = Math.min(100, (totalCarbs / carbsGoal) * 100) || 0;
    fatPercentage = Math.min(100, (totalFat / fatGoal) * 100) || 0;
  } catch (error) {
    console.error('Error calculating percentages:', error);
    // Keep the percentages at 0
  }

  // Import settings context
  const { darkMode } = useSettings() || { darkMode: false };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? 'bg-slate-900 text-slate-50' : 'bg-white'
      }`}
    >
      <NavBar2 />

      {/* Page Content */}
      <div
        className={`border-b border-black flex flex-col items-start py-2 px-6 ${
          darkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}
      >
        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-start gap-2 w-full px-6 mt-2">
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

      {/* Welcome Message */}
      <div
        className={`border border-black ${
          darkMode ? 'bg-slate-800' : 'bg-gray-100'
        } px-24 py-4 mx-auto rounded-md mt-10 text-center`}
      >
        <h2
          className={`text-2xl font-bold ${
            darkMode ? 'text-slate-100' : 'text-gray-900'
          }`}
        >
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
        <div>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 w-full max-w-4xl mx-auto">
            {/* Weight Card */}
            <div
              className={`border border-black rounded-md shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } p-4`}
            >
              <h3
                className={`text-lg font-semibold mb-2 text-center border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                Weight
              </h3>
              {latestWeight ? (
                <div className="flex flex-col items-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {latestWeight.value} {latestWeight.details?.unit || 'kg'}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    } mt-1`}
                  >
                    Last updated:{' '}
                    {latestWeight.date
                      ? new Date(
                          typeof latestWeight.date.toDate === 'function'
                            ? latestWeight.date.toDate()
                            : latestWeight.date
                        ).toLocaleDateString()
                      : 'Unknown'}
                  </div>
                  <Link
                    to="/diary"
                    className={`mt-3 text-sm px-3 py-1 rounded-full ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Track Weight
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center py-3">
                  <p
                    className={`${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    } text-center mb-3`}
                  >
                    No weight data yet
                  </p>
                  <Link
                    to="/diary"
                    className={`text-sm px-3 py-1 rounded-full ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Add Weight
                  </Link>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div
              className={`border border-black rounded-md shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } p-4`}
            >
              <h3
                className={`text-lg font-semibold mb-2 text-center border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                Streak
              </h3>
              <div className="flex flex-col items-center">
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}
                >
                  {userStreak.currentStreak} days
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  } mt-1`}
                >
                  Current streak
                </div>
                <div
                  className={`text-base font-medium mt-3 ${
                    darkMode ? 'text-yellow-300' : 'text-yellow-600'
                  }`}
                >
                  Longest: {userStreak.longestStreak} days
                </div>
              </div>
            </div>

            {/* Sleep Card */}
            <div
              className={`border border-black rounded-md shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } p-4`}
            >
              <h3
                className={`text-lg font-semibold mb-2 text-center border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                Sleep
                {latestSleep &&
                  latestSleep.date &&
                  new Date().toDateString() !==
                    new Date(
                      typeof latestSleep.date.toDate === 'function'
                        ? latestSleep.date.toDate()
                        : latestSleep.date
                    ).toDateString() && (
                    <span
                      className={`text-xs block ${
                        darkMode ? 'text-yellow-300' : 'text-yellow-600'
                      }`}
                    >
                      (Last recorded)
                    </span>
                  )}
              </h3>
              {latestSleep ? (
                <div className="flex flex-col items-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {latestSleep && latestSleep.value && latestSleep.value > 0
                      ? `${Math.floor(Math.max(0, latestSleep.value) / 60)}h ${
                          Math.max(0, latestSleep.value) % 60
                        }m`
                      : '0h 0m'}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    } mt-1`}
                  >
                    Quality:{' '}
                    {latestSleep && latestSleep.details
                      ? latestSleep.details.quality || 0
                      : 0}
                    /10
                  </div>
                  {latestSleep && latestSleep.date && (
                    <div
                      className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      } mt-1`}
                    >
                      {new Date(
                        typeof latestSleep.date.toDate === 'function'
                          ? latestSleep.date.toDate()
                          : latestSleep.date
                      ).toLocaleDateString()}
                    </div>
                  )}
                  <Link
                    to="/diary"
                    className={`mt-3 text-sm px-3 py-1 rounded-full ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Track Sleep
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center py-3">
                  <p
                    className={`${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    } text-center mb-3`}
                  >
                    No sleep data yet
                  </p>
                  <Link
                    to="/diary"
                    className={`text-sm px-3 py-1 rounded-full ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Add Sleep
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 w-full max-w-4xl mx-auto">
            {/* Calories Card */}
            <div
              className={`border border-black rounded-md shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } p-6`}
            >
              <h3
                className={`text-xl font-semibold mb-3 text-center border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                Today&apos;s Calories
              </h3>
              <div className="bg-gray-200 w-full h-8 rounded-full mb-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ width: `${caloriePercentage}%` }}
                >
                  {caloriePercentage > 15
                    ? `${Math.round((totalNetCalories / calorieGoal) * 100)}%`
                    : ''}
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span
                  className={`${
                    darkMode
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                  } px-3 py-1 rounded-full`}
                >
                  {totalNetCalories} kcal (net)
                </span>
                <span
                  className={`${
                    darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100'
                  } px-3 py-1 rounded-full`}
                >
                  {calorieGoal} kcal goal
                </span>
              </div>
              {totalExerciseCalories > 0 && (
                <div className="flex justify-between text-xs mb-4">
                  <span
                    className={darkMode ? 'text-gray-300' : 'text-gray-600'}
                  >
                    Consumed: {totalCalories} kcal
                  </span>
                  <span
                    className={darkMode ? 'text-green-400' : 'text-green-600'}
                  >
                    Exercise: -{totalExerciseCalories} kcal
                  </span>
                </div>
              )}
              <p
                className={`text-center ${
                  darkMode
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-white text-gray-700'
                } rounded-lg p-3 shadow-sm`}
              >
                You&apos;ve consumed{' '}
                <span
                  className={`font-semibold ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {totalCalories} calories
                </span>{' '}
                {totalExerciseCalories > 0 && (
                  <>
                    and burned{' '}
                    <span
                      className={`font-semibold ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                    >
                      {totalExerciseCalories} calories
                    </span>{' '}
                    through exercise, for a net of{' '}
                    <span
                      className={`font-semibold ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      {totalNetCalories} calories
                    </span>
                    ,{' '}
                  </>
                )}
                which is{' '}
                <span
                  className={`font-semibold ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {Math.round((totalNetCalories / calorieGoal) * 100)}%
                </span>{' '}
                of your daily goal.
              </p>
            </div>

            {/* Macros Card */}
            <div
              className={`border border-black rounded-md shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } p-6`}
            >
              <h3
                className={`text-xl font-semibold mb-3 text-center border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                Today&apos;s Macros
              </h3>

              {/* Macro Progress Bars */}
              <div className="mb-4">
                {/* Protein */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Protein</span>
                    <span>
                      {totalProtein}g / {proteinGoal}g
                    </span>
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
                    <span>
                      {totalCarbs}g / {carbsGoal}g
                    </span>
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
                    <span>
                      {totalFat}g / {fatGoal}g
                    </span>
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
                  <div
                    className={`${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {totalExerciseCalories > 0 ? (
                      <>{totalNetCalories} (net)</>
                    ) : (
                      <>{totalCalories}</>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Protein</div>
                  <div
                    className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}
                  >
                    {totalProtein}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Carbs</div>
                  <div
                    className={`${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}
                  >
                    {totalCarbs}g
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Fat</div>
                  <div
                    className={`${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}
                  >
                    {totalFat}g
                  </div>
                </div>
              </div>
            </div>

            {/* Weight History Chart Card */}
            <div
              className={`border border-black rounded-md shadow-md p-6 ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-3 text-center border-b pb-2 ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                }`}
              >
                Weight Progress
              </h3>
              {weightHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightHistory}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(tick) =>
                        new Date(tick).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis
                      domain={['dataMin - 5', 'dataMax + 5']} // Dynamically adjust based on min/max weight
                      tickCount={5} // Adjusts the number of ticks
                      label={{
                        value: 'Weight (lbs)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 },
                      }}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3182ce"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p
                  className={`text-center text-gray-600 ${
                    darkMode ? 'border-slate-600' : 'border-gray-300'
                  } `}
                >
                  No weight data available
                </p>
              )}
            </div>

            {/* Recent Meals Section */}
            <div
              className={`w-full max-w-2xl mx-auto mt-6 p-4 border border-black rounded-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } md:col-span-3`}
            >
              <div
                className={`flex justify-between items-center mb-3 border-b ${
                  darkMode ? 'border-slate-600' : 'border-gray-300'
                } pb-2`}
              >
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? 'text-slate-100' : ''
                  }`}
                >
                  Today&apos;s Meals
                </h3>
                <Link
                  to="/diary"
                  className={`${
                    darkMode
                      ? 'text-blue-400 hover:bg-blue-900'
                      : 'text-blue-600 hover:bg-blue-100'
                  } px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center`}
                  title="View diary"
                >
                  <span>View all meals</span>
                  <span className="ml-1">→</span>
                </Link>
              </div>
              {todaysMeals && todaysMeals.length > 0 ? (
                <div className="space-y-2">
                  {todaysMeals.slice(0, 3).map(
                    (meal) =>
                      meal && (
                        <div
                          key={meal.id}
                          className={`border ${
                            darkMode
                              ? 'border-slate-600 bg-slate-700'
                              : 'border-gray-300 bg-white'
                          } p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className={`font-semibold text-lg ${
                                darkMode ? 'text-slate-100' : ''
                              }`}
                            >
                              {meal.name}
                            </span>
                            <span
                              className={`${
                                darkMode
                                  ? 'bg-blue-900 text-blue-300'
                                  : 'bg-blue-100 text-blue-600'
                              } px-2 py-1 rounded-full font-medium`}
                            >
                              {Math.round(meal.calories || 0)} kcal (
                              {meal.amount || 100}g)
                            </span>
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
                                {Math.round((meal.protein || 0) * 10) / 10}g
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
                                {Math.round((meal.carbs || 0) * 10) / 10}g
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
                                {Math.round((meal.fat || 0) * 10) / 10}g
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
                      )
                  )}
                </div>
              ) : (
                <p
                  className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}
                >
                  No meals logged today. Start tracking your nutrition!
                </p>
              )}
            </div>
          </div>
        </div>
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
        <button
          className={`border border-black px-4 py-2 rounded-md ${
            darkMode
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          <span>Meal Plans</span>
        </button>
        <button
          className={`border border-black px-4 py-2 rounded-md ${
            darkMode
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          <span>Import Recipe</span>
        </button>
        <button
          className={`border border-black px-4 py-2 rounded-md ${
            darkMode
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          <span>Reports</span>
        </button>
      </div>

      {/* Quick Add Meal Modal */}
      {isModalOpen && (
        <QuickAddMealModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={currentUser.uid}
        />
      )}

      <Footer />
    </div>
  );
}

export default Dashboard;
