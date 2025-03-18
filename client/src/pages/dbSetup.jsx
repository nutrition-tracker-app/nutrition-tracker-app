import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/getUseAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  trackExercise,
  trackWeight,
  trackSleep,
  getUserMetrics,
  getUserDiaryEntries,
  getDiaryEntriesByCategory,
} from '../services/firestoreService';
import setupDatabase, {
  populateDatabase,
  getFoodKeywords,
} from '../utils/databaseSetup';
import { useSettings } from '../context/settingsContext';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';

function DatabaseSetup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useSettings();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [populateResults, setPopulateResults] = useState(null);
  const [operation, setOperation] = useState('');
  const [foodLimit, setFoodLimit] = useState(100); // Default to 100 foods

  // Force sign out function
  const forceSignOut = async () => {
    try {
      setIsLoading(true);

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Delete IndexedDB
      const dbNames = [
        'firebaseLocalStorageDb',
        'firestore',
        'firebase-installations-database',
      ];

      dbNames.forEach((dbName) => {
        try {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () =>
            console.log(`Successfully deleted ${dbName}`);
          request.onerror = () => console.error(`Error deleting ${dbName}`);
        } catch (e) {
          console.error(`Error while trying to delete ${dbName}:`, e);
        }
      });

      // Sign out and redirect
      await signOut(auth);

      // Set a small timeout to ensure all async operations complete
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Error during force sign out:', error);
      setError(
        'Failed to sign out completely. Try again or clear your browser cache.'
      );
      setIsLoading(false);
    }
  };

  // Protect the route
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSetupDatabase = async () => {
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    try {
      setIsLoading(true);
      setOperation('setup');
      setError(null);
      setResults(null);
      setPopulateResults(null);

      const setupResults = await setupDatabase(currentUser.uid);
      setResults(setupResults);

      console.log('Database setup completed:', setupResults);
    } catch (error) {
      console.error('Error setting up database:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle populating database with foods from the API
  const handlePopulateDatabase = async () => {
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    if (foodLimit <= 0 || foodLimit > 1000) {
      setError('Please enter a valid limit between 1 and 1000.');
      return;
    }

    try {
      setIsLoading(true);
      setOperation('populate');
      setError(null);
      setResults(null);
      setTestResults(null);
      setPopulateResults(null);

      const results = await populateDatabase(currentUser.uid, foodLimit);
      setPopulateResults(results);

      console.log('Database population completed:', results);

      if (!results.success) {
        setError(
          `Failed to populate database: ${results.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error populating database:', error);
      setError(error.message);
      setPopulateResults({
        success: false,
        error: error.message,
        totalAdded: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testExerciseTracking = async () => {
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTestResults(null);

      const testResults = {
        steps: [],
        success: true,
      };

      // Step 1: Track an exercise
      testResults.steps.push({
        name: 'Adding exercise data',
        status: 'running',
      });

      const exerciseId = await trackExercise(
        currentUser.uid,
        'running',
        30, // 30 minutes
        'high',
        250 // calories burned
      );

      testResults.steps[0].status = 'success';
      testResults.steps[0].data = { exerciseId };

      // Step 2: Get exercise metrics
      testResults.steps.push({
        name: 'Retrieving exercise metrics',
        status: 'running',
      });

      const metrics = await getUserMetrics(currentUser.uid, 'exercise');
      const exerciseMetric = metrics.find((m) => m.id === exerciseId);

      if (!exerciseMetric) {
        testResults.steps[1].status = 'failed';
        testResults.steps[1].error = 'Exercise metric not found';
        testResults.success = false;
      } else {
        testResults.steps[1].status = 'success';
        testResults.steps[1].data = { metric: exerciseMetric };
      }

      // Test weight tracking
      testResults.steps.push({
        name: 'Testing weight tracking',
        status: 'running',
      });

      const weightId = await trackWeight(currentUser.uid, 70, 'kg');
      const weightMetrics = await getUserMetrics(currentUser.uid, 'weight');

      if (weightMetrics.length === 0) {
        testResults.steps[2].status = 'failed';
        testResults.steps[2].error = 'Weight metric not found';
        testResults.success = false;
      } else {
        testResults.steps[2].status = 'success';
        testResults.steps[2].data = { weightId };
      }

      // Test sleep tracking
      testResults.steps.push({
        name: 'Testing sleep tracking',
        status: 'running',
      });

      const now = new Date();
      const bedtime = new Date(now);
      bedtime.setHours(bedtime.getHours() - 8);

      const sleepId = await trackSleep(
        currentUser.uid,
        bedtime.toISOString(),
        now.toISOString(),
        7 // quality
      );

      const sleepMetrics = await getUserMetrics(currentUser.uid, 'sleep');

      if (sleepMetrics.length === 0) {
        testResults.steps[3].status = 'failed';
        testResults.steps[3].error = 'Sleep metric not found';
        testResults.success = false;
      } else {
        testResults.steps[3].status = 'success';
        testResults.steps[3].data = { sleepId };
      }

      // Test diary entries
      testResults.steps.push({
        name: 'Testing diary entries',
        status: 'running',
      });

      const diaryEntries = await getUserDiaryEntries(currentUser.uid);
      const entriesByCategory = await getDiaryEntriesByCategory(
        currentUser.uid,
        new Date()
      );

      testResults.steps[4].status = 'success';
      testResults.steps[4].data = {
        entriesCount: diaryEntries.length,
        categories: Object.keys(entriesByCategory),
      };

      setTestResults(testResults);
    } catch (error) {
      console.error('Error testing database:', error);
      setError(error.message);
      setTestResults({
        steps: [],
        success: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the common food keywords for display
  const foodKeywords = getFoodKeywords();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <NavBar2 />

      <div className="container mx-auto px-4 py-8">
        <h1
          className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-green-400' : 'text-green-600'
          }`}
        >
          Database Setup and Testing
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Setup Section */}
          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}
            >
              Setup Database
            </h2>
            <p className="mb-4">
              This will set up the database with initial data structures for the
              new schema. It will create example meals, initialize user
              settings, and set up streak tracking.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleSetupDatabase}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
                }`}
              >
                {isLoading && operation === 'setup'
                  ? 'Setting up...'
                  : 'Run Setup'}
              </button>

              <button
                onClick={forceSignOut}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white ${
                  darkMode
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50'
                    : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                }`}
              >
                {isLoading ? 'Signing Out...' : 'Force Sign Out'}
              </button>
            </div>

            <div
              className={`mt-2 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Force Sign Out will completely clear all stored data and reset
              your authentication state.
            </div>

            {results && (
              <div
                className={`mt-4 p-4 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className="font-semibold mb-2">Results:</h3>
                <pre
                  className={`text-sm overflow-x-auto ${
                    darkMode ? 'text-gray-300' : 'text-gray-800'
                  }`}
                >
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test Section */}
          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}
            >
              Test Database
            </h2>
            <p className="mb-4">
              This will test the new database schema by adding exercise, weight,
              and sleep data, then verifying that it was saved correctly.
            </p>

            <button
              onClick={testExerciseTracking}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-white ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50'
                  : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
              }`}
            >
              {isLoading && !operation ? 'Testing...' : 'Run Tests'}
            </button>

            {testResults && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <div className="space-y-2">
                  {testResults.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded ${
                        step.status === 'success'
                          ? darkMode
                            ? 'bg-green-900 text-green-100'
                            : 'bg-green-100'
                          : step.status === 'failed'
                          ? darkMode
                            ? 'bg-red-900 text-red-100'
                            : 'bg-red-100'
                          : darkMode
                          ? 'bg-yellow-900 text-yellow-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{step.name}</span>
                        <span
                          className={`font-semibold ${
                            step.status === 'success'
                              ? darkMode
                                ? 'text-green-300'
                                : 'text-green-700'
                              : step.status === 'failed'
                              ? darkMode
                                ? 'text-red-300'
                                : 'text-red-700'
                              : darkMode
                              ? 'text-yellow-300'
                              : 'text-yellow-700'
                          }`}
                        >
                          {step.status.toUpperCase()}
                        </span>
                      </div>
                      {step.error && (
                        <div
                          className={`text-sm mt-1 ${
                            darkMode ? 'text-red-300' : 'text-red-600'
                          }`}
                        >
                          Error: {step.error}
                        </div>
                      )}
                      {step.data && (
                        <div
                          className={`text-sm mt-1 overflow-x-auto ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {JSON.stringify(step.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-4 p-3 rounded font-semibold ${
                    testResults.success
                      ? darkMode
                        ? 'bg-green-900 text-green-300'
                        : 'bg-green-100 text-green-700'
                      : darkMode
                      ? 'bg-red-900 text-red-300'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {testResults.success
                    ? 'All tests passed successfully!'
                    : `Tests failed: ${
                        testResults.error || 'See details above'
                      }`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Population Section */}
        <div
          className={`p-6 rounded-lg shadow-md mb-8 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}
          >
            Populate Database with Food Data
          </h2>
          <p className="mb-4">
            This will add food items to your database from the USDA food
            database API. Once populated, you'll be able to search for these
            foods in the Quick Add modal without having to use the API.
          </p>

          <div className="flex items-end space-x-4 mb-4">
            <div className="flex-grow">
              <label
                htmlFor="num-food-add-input"
                className={`block mb-2 font-medium ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}
              >
                Number of foods to add (max 1000):
              </label>
              <input
                id="num-food-add-input"
                type="number"
                value={foodLimit}
                onChange={(e) => setFoodLimit(Number(e.target.value))}
                min="1"
                max="1000"
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
              />
            </div>

            <button
              onClick={handlePopulateDatabase}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-white ${
                darkMode
                  ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50'
                  : 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300'
              }`}
            >
              {isLoading && operation === 'populate'
                ? 'Populating...'
                : 'Populate Database'}
            </button>
          </div>

          <div
            className={`p-3 rounded ${
              darkMode
                ? 'bg-yellow-900 text-yellow-100'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <p>
              <strong>Note:</strong> This process may take several minutes for
              larger limits. The API has rate limits, so we've added delays
              between requests.
            </p>
          </div>

          {/* Population Results */}
          {populateResults && (
            <div
              className={`mt-4 p-4 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h3 className="font-semibold mb-3">Population Results:</h3>

              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={
                      populateResults.success
                        ? darkMode
                          ? 'text-green-400'
                          : 'text-green-600'
                        : darkMode
                        ? 'text-red-400'
                        : 'text-red-600'
                    }
                  >
                    {populateResults.success ? 'Success' : 'Failed'}
                  </span>
                </p>

                <p>
                  <span className="font-medium">Foods Added:</span>{' '}
                  {populateResults.totalAdded || 0}
                </p>

                {populateResults.error && (
                  <p className={darkMode ? 'text-red-400' : 'text-red-600'}>
                    <span className="font-medium">Error:</span>{' '}
                    {populateResults.error}
                  </p>
                )}

                {populateResults.results &&
                  populateResults.results.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">
                        First few foods added:
                      </h4>
                      <div
                        className={`max-h-60 overflow-y-auto ${
                          darkMode ? 'bg-gray-800' : 'bg-white'
                        } p-3 rounded-md border ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <ul className="list-disc pl-5">
                          {populateResults.results
                            .slice(0, 10)
                            .map((food, index) => (
                              <li key={index}>
                                {food.name} ({food.calories} cal)
                              </li>
                            ))}
                        </ul>
                        {populateResults.results.length > 10 && (
                          <p
                            className={`mt-2 italic ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            ...and {populateResults.results.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Food Keywords Display */}
          <div className="mt-6">
            <h3
              className={`font-semibold mb-2 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}
            >
              Food Keywords Used:
            </h3>
            <div
              className={`max-h-36 overflow-y-auto ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              } p-3 rounded-md`}
            >
              <div className="flex flex-wrap gap-2">
                {foodKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-sm ${
                      darkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            className={`p-4 rounded mb-6 ${
              darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'
            }`}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default DatabaseSetup;
