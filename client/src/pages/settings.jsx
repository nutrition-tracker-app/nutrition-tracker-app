/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import { useSettings } from '../context/settingsContext';
import {
  getUserProfile,
  updateUserProfile,
} from '../services/firestoreService';
import { Link } from 'react-router-dom';

function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    darkMode,
    editMode,
    userProfile,
    toggleDarkMode,
    toggleEditMode,
    updateUserProfile: updateContextProfile,
    calculateTDEE,
    calculateTargetCalories,
  } = useSettings();

  // User profile settings
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    height: 175, // default in cm
    weight: 70, // default in kg
    age: 30, // default age
    sex: 'prefer-not-to-say', // default
    heightUnit: 'cm',
    weightUnit: 'kg',
    activityLevel: 'moderate', // default activity level
    weightGoal: 'maintain', // default weight goal
    useCustomCalories: false, // whether to use custom calorie target
    targetCalories: 2000, // default calorie target
  });

  // For "navbar3"
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate TDEE based on current profile values
  const [calculatedTDEE, setCalculatedTDEE] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Protect the settings route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch user profile on component mount (only once)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const serverUserProfile = await getUserProfile(currentUser.uid);

        // Use the values from the settings context
        const updatedProfile = {
          displayName:
            serverUserProfile?.displayName ||
            currentUser.displayName ||
            userProfile?.displayName ||
            '',
          photoURL:
            serverUserProfile?.photoURL ||
            currentUser.photoURL ||
            userProfile?.photoURL ||
            '',
          height:
            serverUserProfile?.settings?.height || userProfile?.height || 175,
          weight:
            serverUserProfile?.settings?.weight || userProfile?.weight || 70,
          age: userProfile?.age || 30,
          sex: serverUserProfile?.settings?.sex || userProfile?.sex || 'male',
          heightUnit:
            serverUserProfile?.settings?.heightUnit ||
            userProfile?.heightUnit ||
            'cm',
          weightUnit:
            serverUserProfile?.settings?.weightUnit ||
            userProfile?.weightUnit ||
            'kg',
          activityLevel: userProfile?.activityLevel || 'moderate',
          weightGoal: userProfile?.weightGoal || 'maintain',
          useCustomCalories: userProfile?.useCustomCalories || false,
          targetCalories: userProfile?.targetCalories || 2000,
        };

        setProfile(updatedProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    // Only run this effect once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnitChange = (e) => {
    const { name, value } = e.target;

    // Update the unit
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Convert value if needed
    if (name === 'heightUnit') {
      if (value === 'in' && profile.heightUnit === 'cm') {
        // Convert cm to inches
        setProfile((prev) => ({
          ...prev,
          height: Math.round(prev.height / 2.54),
        }));
      } else if (value === 'cm' && profile.heightUnit === 'in') {
        // Convert inches to cm
        setProfile((prev) => ({
          ...prev,
          height: Math.round(prev.height * 2.54),
        }));
      }
    } else if (name === 'weightUnit') {
      if (value === 'lb' && profile.weightUnit === 'kg') {
        // Convert kg to pounds
        setProfile((prev) => ({
          ...prev,
          weight: Math.round(prev.weight * 2.20462),
        }));
      } else if (value === 'kg' && profile.weightUnit === 'lb') {
        // Convert pounds to kg
        setProfile((prev) => ({
          ...prev,
          weight: Math.round(prev.weight / 2.20462),
        }));
      }
    }
  };

  // Calculate TDEE when specific profile values change
  useEffect(() => {
    // Skip calculation while loading
    if (isLoading) return;

    try {
      // Convert height if necessary
      let heightInCm = profile.height;
      if (profile.heightUnit === 'in') {
        heightInCm = profile.height * 2.54;
      }

      // Convert weight if necessary
      let weightInKg = profile.weight;
      if (profile.weightUnit === 'lb') {
        weightInKg = profile.weight / 2.20462;
      }

      // Calculate BMR manually to avoid context dependency
      const calculateBMR = () => {
        if (profile.sex === 'male') {
          return 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age + 5;
        } else {
          return 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age - 161;
        }
      };

      // Apply activity multiplier
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
      };

      const bmr = calculateBMR();
      const multiplier =
        activityMultipliers[profile.activityLevel] ||
        activityMultipliers.moderate;
      const tdee = Math.round(bmr * multiplier);

      // Store calculated TDEE
      setCalculatedTDEE(tdee);

      // If not using custom calories, update the target calories
      if (!profile.useCustomCalories) {
        let targetCals;

        switch (profile.weightGoal) {
          case 'lose':
            targetCals = Math.round(tdee * 0.8); // 20% deficit
            break;
          case 'gain':
            targetCals = Math.round(tdee * 1.1); // 10% surplus
            break;
          default: // maintain
            targetCals = tdee;
        }

        setProfile((prev) => ({
          ...prev,
          targetCalories: targetCals,
        }));
      }
    } catch (error) {
      console.error('Error calculating TDEE:', error);
    }
  }, [
    profile.sex,
    profile.height,
    profile.weight,
    profile.age,
    profile.activityLevel,
    profile.weightGoal,
    profile.heightUnit,
    profile.weightUnit,
    profile.useCustomCalories,
    isLoading,
  ]);

  const handleSave = async () => {
    if (!currentUser) {
      setError('You must be logged in to save settings.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Update user profile with settings
      await updateUserProfile(currentUser.uid, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        settings: {
          height: profile.height,
          weight: profile.weight,
          age: profile.age,
          sex: profile.sex,
          heightUnit: profile.heightUnit,
          weightUnit: profile.weightUnit,
          activityLevel: profile.activityLevel,
          weightGoal: profile.weightGoal,
          useCustomCalories: profile.useCustomCalories,
          targetCalories: profile.targetCalories,
          darkMode: darkMode,
        },
      });

      // Update the context profile
      updateContextProfile({
        sex: profile.sex,
        height: profile.height,
        weight: profile.weight,
        age: profile.age,
        activityLevel: profile.activityLevel,
        weightGoal: profile.weightGoal,
        useCustomCalories: profile.useCustomCalories,
        targetCalories: profile.targetCalories,
      });

      setSuccess('Settings saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? 'bg-slate-900 text-slate-50' : 'bg-white'
      }`}
    >
      <NavBar2 />
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          <div className="text-center">Loading your settings...</div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                {success}
              </div>
            )}

            {/* Profile Section */}
            <div
              className={`mb-8 p-6 rounded-lg shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } border border-black`}
            >
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Profile Settings
              </h2>

              <div className="mb-4">
                <label htmlFor="name-input" className="block font-medium mb-1">
                  Display Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="profile-url-input"
                  className="block font-medium mb-1"
                >
                  Profile Picture URL
                </label>
                <input
                  id="profile-url-input"
                  type="text"
                  name="photoURL"
                  value={profile.photoURL}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://example.com/profile.jpg"
                />
                {profile.photoURL && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={profile.photoURL}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full border-2 border-green-500 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="sex-input" className="block font-medium mb-1">
                  Sex
                </label>
                <select
                  id="sex-input"
                  name="sex"
                  value={profile.sex}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Physical Measurements */}
            <div
              className={`mb-8 p-6 rounded-lg shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } border border-black`}
            >
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Physical Measurements
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="height-input"
                  className="block font-medium mb-1"
                >
                  Height
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="height-input"
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    min="0"
                    className={`flex-grow px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <label htmlFor="height-unit-input" className="sr-only">
                    Height Unit Input
                  </label>
                  <select
                    id="height-unit-input"
                    name="heightUnit"
                    value={profile.heightUnit}
                    onChange={handleUnitChange}
                    className={`px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="weight-input"
                  className="block font-medium mb-1"
                >
                  Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="weight-input"
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    min="0"
                    className={`flex-grow px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <label htmlFor="weight-unit-input" className="sr-only">
                    Weight Unit Input
                  </label>
                  <select
                    id="weight-unit-input"
                    name="weightUnit"
                    value={profile.weightUnit}
                    onChange={handleUnitChange}
                    className={`px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="age-input" className="block font-medium mb-1">
                  Age
                </label>
                <input
                  id="age-input"
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Nutrition & Calorie Settings */}
            <div
              className={`mb-8 p-6 rounded-lg shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } border border-black`}
            >
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Nutrition & Calorie Settings
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="activity-level-input"
                  className="block font-medium mb-1"
                >
                  Activity Level
                </label>
                <select
                  id="activity-level-input"
                  name="activityLevel"
                  value={profile.activityLevel}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">
                    Moderate (exercise 3-5 days/week)
                  </option>
                  <option value="active">
                    Active (exercise 6-7 days/week)
                  </option>
                  <option value="veryActive">
                    Very Active (physical job or 2x training)
                  </option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="weight-goal-input"
                  className="block font-medium mb-1"
                >
                  Weight Goal
                </label>
                <select
                  id="weight-goal-input"
                  name="weightGoal"
                  value={profile.weightGoal}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div className="mt-6 p-4 bg-opacity-50 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Calculated Daily Calories</h3>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      Based on your profile, we estimate your daily caloric
                      needs to be:
                    </p>
                  </div>
                  <div
                    className={`font-bold text-xl ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {calculatedTDEE} kcal
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 p-2 rounded-md border">
                  <div>
                    <h3 className="font-medium">Use Custom Calorie Goal</h3>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}
                    >
                      Override the calculated value with your own target
                    </p>
                  </div>

                  <label
                    htmlFor="custom-calorie-button"
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      id="custom-calorie-button"
                      type="checkbox"
                      name="useCustomCalories"
                      className="sr-only peer"
                      checked={profile.useCustomCalories}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          useCustomCalories: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="daily-calorie-target-input"
                    className="block font-medium mb-1"
                  >
                    Daily Calorie Target
                  </label>
                  <input
                    id="daily-calorie-target-input"
                    type="number"
                    name="targetCalories"
                    value={profile.targetCalories}
                    onChange={handleChange}
                    disabled={!profile.useCustomCalories}
                    min="1000"
                    max="8000"
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${
                      !profile.useCustomCalories
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  >
                    {profile.useCustomCalories
                      ? 'Enter your own daily calorie target'
                      : `Using calculated target based on your ${profile.weightGoal} goal`}
                  </p>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div
              className={`mb-8 p-6 rounded-lg shadow-md ${
                darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
              } border border-black`}
            >
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Appearance
              </h2>

              <div className="flex items-center justify-between mb-4 p-3 rounded-md border">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  >
                    Switch between light and dark color themes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border">
                <div>
                  <h3 className="font-medium">Edit Mode</h3>
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  >
                    Enable to edit your diary entries
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={editMode}
                    onChange={toggleEditMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`px-6 py-2 rounded-md font-medium border border-black
                  ${
                    darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Settings;
