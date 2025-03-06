/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import { useSettings } from '../context/settingsContext';
import { getUserProfile, updateUserProfile } from '../services/firestoreService';

function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { darkMode, editMode, toggleDarkMode, toggleEditMode } = useSettings();
  
  // User profile settings
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    height: 175, // default in cm
    weight: 70, // default in kg
    sex: 'prefer-not-to-say', // default
    heightUnit: 'cm',
    weightUnit: 'kg',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Protect the settings route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(currentUser.uid);
        
        if (userProfile) {
          setProfile({
            displayName: userProfile.displayName || currentUser.displayName || '',
            photoURL: userProfile.photoURL || currentUser.photoURL || '',
            height: userProfile.settings?.height || 175,
            weight: userProfile.settings?.weight || 70,
            sex: userProfile.settings?.sex || 'prefer-not-to-say',
            heightUnit: userProfile.settings?.heightUnit || 'cm',
            weightUnit: userProfile.settings?.weightUnit || 'kg',
          });
        } else {
          // Use current user data if profile doesn't exist
          setProfile({
            ...profile,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    
    // Update the unit
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Convert value if needed
    if (name === 'heightUnit') {
      if (value === 'in' && profile.heightUnit === 'cm') {
        // Convert cm to inches
        setProfile(prev => ({
          ...prev,
          height: Math.round(prev.height / 2.54)
        }));
      } else if (value === 'cm' && profile.heightUnit === 'in') {
        // Convert inches to cm
        setProfile(prev => ({
          ...prev,
          height: Math.round(prev.height * 2.54)
        }));
      }
    } else if (name === 'weightUnit') {
      if (value === 'lb' && profile.weightUnit === 'kg') {
        // Convert kg to pounds
        setProfile(prev => ({
          ...prev,
          weight: Math.round(prev.weight * 2.20462)
        }));
      } else if (value === 'kg' && profile.weightUnit === 'lb') {
        // Convert pounds to kg
        setProfile(prev => ({
          ...prev,
          weight: Math.round(prev.weight / 2.20462)
        }));
      }
    }
  };

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
          sex: profile.sex,
          heightUnit: profile.heightUnit,
          weightUnit: profile.weightUnit,
          darkMode: darkMode,
        }
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
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-slate-900 text-slate-50' : 'bg-white'}`}>
      <NavBar2 />

      {/* Page Content */}
      <div className={`border-b border-black flex flex-col items-start py-2 px-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
        <h1 className="text-xl font-bold">Settings</h1>
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
            <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Profile Settings</h2>
              
              <div className="mb-4">
                <label className="block font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1">Profile Picture URL</label>
                <input
                  type="text"
                  name="photoURL"
                  value={profile.photoURL}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
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
                <label className="block font-medium mb-1">Sex</label>
                <select
                  name="sex"
                  value={profile.sex}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Physical Measurements</h2>
              
              <div className="mb-4">
                <label className="block font-medium mb-1">Height</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                    min="0"
                    className={`flex-grow px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    name="heightUnit"
                    value={profile.heightUnit}
                    onChange={handleUnitChange}
                    className={`px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1">Weight</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    min="0"
                    className={`flex-grow px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    name="weightUnit"
                    value={profile.weightUnit}
                    onChange={handleUnitChange}
                    className={`px-3 py-2 border rounded-md ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-slate-800' : 'bg-[#efffce]'} border border-black`}>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Appearance</h2>
              
              <div className="flex items-center justify-between mb-4 p-3 rounded-md border">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Switch between light and dark color themes</p>
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
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Enable to edit your diary entries</p>
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
                  ${darkMode 
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