/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import PropTypes from 'prop-types';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { AuthContext } from './authContextStore';


// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      console.log("Signing out");
      
      // First, sign out from Firebase auth
      await signOut(auth);
      
      // Clear storage
      localStorage.clear(); // Clear any local storage data
      sessionStorage.clear(); // Clear any session storage
      
      // Clear IndexedDB storage used by Firebase
      const dbName = 'firebaseLocalStorageDb';
      try {
        const request = indexedDB.deleteDatabase(dbName);
        
        request.onsuccess = function() {
          console.log("IndexedDB deleted successfully");
        };
        
        request.onerror = function() {
          console.error("Error deleting IndexedDB");
        };
      } catch (dbError) {
        console.error("Error clearing IndexedDB:", dbError);
      }
      
      // Force page reload to clear any in-memory state
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Log before subscription
    console.log("Setting up auth state change listener");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, user:", user ? user.uid : "null");
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};