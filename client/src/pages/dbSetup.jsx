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
  getDiaryEntriesByCategory
} from '../services/firestoreService';
import setupDatabase from '../utils/databaseSetup';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';

function DatabaseSetup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  
  // Force sign out function
  const forceSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Delete IndexedDB
      const dbNames = ['firebaseLocalStorageDb', 'firestore', 'firebase-installations-database'];
      
      dbNames.forEach(dbName => {
        try {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => console.log(`Successfully deleted ${dbName}`);
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
      setError('Failed to sign out completely. Try again or clear your browser cache.');
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
      setError(null);
      setResults(null);
      
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
        success: true
      };
      
      // Step 1: Track an exercise
      testResults.steps.push({ name: 'Adding exercise data', status: 'running' });
      
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
      testResults.steps.push({ name: 'Retrieving exercise metrics', status: 'running' });
      
      const metrics = await getUserMetrics(currentUser.uid, 'exercise');
      const exerciseMetric = metrics.find(m => m.id === exerciseId);
      
      if (!exerciseMetric) {
        testResults.steps[1].status = 'failed';
        testResults.steps[1].error = 'Exercise metric not found';
        testResults.success = false;
      } else {
        testResults.steps[1].status = 'success';
        testResults.steps[1].data = { metric: exerciseMetric };
      }
      
      // Test weight tracking
      testResults.steps.push({ name: 'Testing weight tracking', status: 'running' });
      
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
      testResults.steps.push({ name: 'Testing sleep tracking', status: 'running' });
      
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
      testResults.steps.push({ name: 'Testing diary entries', status: 'running' });
      
      const diaryEntries = await getUserDiaryEntries(currentUser.uid);
      const entriesByCategory = await getDiaryEntriesByCategory(currentUser.uid, new Date());
      
      testResults.steps[4].status = 'success';
      testResults.steps[4].data = { 
        entriesCount: diaryEntries.length,
        categories: Object.keys(entriesByCategory)
      };
      
      setTestResults(testResults);
    } catch (error) {
      console.error('Error testing database:', error);
      setError(error.message);
      setTestResults({
        steps: [],
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <NavBar2 />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Database Setup and Testing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Setup Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Setup Database</h2>
            <p className="mb-4">
              This will set up the database with initial data structures for the new schema.
              It will create example meals, initialize user settings, and set up streak tracking.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSetupDatabase}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? 'Setting up...' : 'Run Setup'}
              </button>
              
              <button
                onClick={forceSignOut}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
              >
                {isLoading ? 'Signing Out...' : 'Force Sign Out'}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Force Sign Out will completely clear all stored data and reset your authentication state.
            </div>
            
            {results && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Results:</h3>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* Test Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Database</h2>
            <p className="mb-4">
              This will test the new database schema by adding exercise, weight, and sleep data,
              then verifying that it was saved correctly.
            </p>
            
            <button
              onClick={testExerciseTracking}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {isLoading ? 'Testing...' : 'Run Tests'}
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
                          ? 'bg-green-100' 
                          : step.status === 'failed' 
                            ? 'bg-red-100' 
                            : 'bg-yellow-100'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{step.name}</span>
                        <span className={`font-semibold ${
                          step.status === 'success' 
                            ? 'text-green-700' 
                            : step.status === 'failed' 
                              ? 'text-red-700' 
                              : 'text-yellow-700'
                        }`}>
                          {step.status.toUpperCase()}
                        </span>
                      </div>
                      {step.error && (
                        <div className="text-red-600 text-sm mt-1">
                          Error: {step.error}
                        </div>
                      )}
                      {step.data && (
                        <div className="text-sm text-gray-600 mt-1 overflow-x-auto">
                          {JSON.stringify(step.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className={`mt-4 p-3 rounded font-semibold ${
                  testResults.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {testResults.success 
                    ? 'All tests passed successfully!' 
                    : `Tests failed: ${testResults.error || 'See details above'}`}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default DatabaseSetup;