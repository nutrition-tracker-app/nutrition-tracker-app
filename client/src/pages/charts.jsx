/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate, Link } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import {
  getUserWeightHistory,
  getUserSleepHistory,
  getUserCalorieHistory,
  getUserProteinHistory,
  getUserFatHistory,
  getUserCarbHistory,
} from '../services/firestoreService';
import QuickAddMealModal from '../components/quickAddModal';
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

function Charts() {
  const { currentUser } = useAuth();
  const { darkMode } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [proteinHistory, setProteinHistory] = useState([]);
  const [fatHistory, setFatHistory] = useState([]);
  const [carbHistory, setCarbHistory] = useState([]);
  const navigate = useNavigate();

  // Protect the route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch users sleep history
  useEffect(() => {
    const fetchSleepHistory = async () => {
      if (!currentUser) return;

      try {
        console.log('Fetching sleep history...');
        const history = await getUserSleepHistory(currentUser.uid);

        if (!history || history.length === 0) {
          console.warn('No sleep history data found.');
          return;
        }

        setSleepHistory(
          history.map((entry) => ({
            date: new Date(entry.date.toDate()).toLocaleDateString(),
            sleepDuration: entry.value,
            quality: entry.quality,
          }))
        );
      } catch (error) {
        console.error('Error fetching sleep history:', error);
      }
    };

    fetchSleepHistory();
  }, [currentUser]);

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

  // Fetch user's all past calories
  useEffect(() => {
    const fetchCalorieHistory = async () => {
      if (!currentUser) return;

      console.log('Fetching calorie history...');
      const history = await getUserCalorieHistory(currentUser.uid);

      if (!history || history.length === 0) {
        console.warn('No calorie history data found.');
        return;
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      setCalorieHistory(history);
    };

    fetchCalorieHistory();
  }, [currentUser]);

  // Fetch user's all past protein
  useEffect(() => {
    const fetchProteinHistory = async () => {
      if (!currentUser) return;

      console.log('Fetching protein history...');
      const history = await getUserProteinHistory(currentUser.uid);

      if (!history || history.length === 0) {
        console.warn('No protein history data found.');
        return;
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      setProteinHistory(history);
    };

    fetchProteinHistory();
  }, [currentUser]);

  // Fetch user's all past fat
  useEffect(() => {
    const fetchFatHistory = async () => {
      if (!currentUser) return;

      console.log('Fetching fat history...');
      const history = await getUserFatHistory(currentUser.uid);

      if (!history || history.length === 0) {
        console.warn('No fat history data found.');
        return;
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFatHistory(history);
    };

    fetchFatHistory();
  }, [currentUser]);

  // Fetch user's all past carb
  useEffect(() => {
    const fetchCarbHistory = async () => {
      if (!currentUser) return;

      console.log('Fetching carb history...');
      const history = await getUserCarbHistory(currentUser.uid);

      if (!history || history.length === 0) {
        console.warn('No carb history data found.');
        return;
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      setCarbHistory(history);
    };

    fetchCarbHistory();
  }, [currentUser]);

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
          Progress Charts
        </h2>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 w-full max-w-4xl mx-auto mb-6">
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

        {/* Sleep History Chart Card */}
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
            Sleep Progress
          </h3>
          {sleepHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sleepHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  label={{
                    style: { textAnchor: 'middle', fontSize: 16 },
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sleepDuration"
                  stroke="#805ad5"
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
              No sleep data available
            </p>
          )}
        </div>

        {/* Calorie History Chart Card */}
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
            Calorie Progress
          </h3>
          {calorieHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calorieHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  label={{
                    value: 'Calories',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 14 },
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff7300"
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
              No calorie data available
            </p>
          )}
        </div>

        {/* Protein History Chart Card */}
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
            Protein Progress
          </h3>
          {proteinHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={proteinHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  label={{
                    value: 'Protein (g)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 14 },
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f56565"
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
              No protein data available
            </p>
          )}
        </div>

        {/* Fats History Chart Card */}
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
            Fats Progress
          </h3>
          {fatHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fatHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  label={{
                    value: 'Fats (g)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 14 },
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ecc94b"
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
              No fat data available
            </p>
          )}
        </div>

        {/* Carbs History Chart Card */}
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
            Carbohydrate Progress
          </h3>
          {carbHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={carbHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis
                  label={{
                    value: 'Carbohyrdate (g)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 14 },
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#48bb78"
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
              No carb data available
            </p>
          )}
        </div>
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

export default Charts;
