/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';
import { createUserProfile } from '../services/firestoreService';

function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      
      // Create or update user profile in Firestore
      if (result?.user) {
        const { uid, displayName, email, photoURL } = result.user;
        await createUserProfile(uid, {
          displayName,
          email,
          photoURL,
          isNewUser: true
        });
      }
      
      // Successful signup will trigger the useEffect above
    } catch (error) {
      setError('Failed to sign up. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <NavBar2 />
      {/* Signup Box */}
      <div className="flex flex-grow items-center justify-center">
        <div className="bg-[#efffce] p-8 rounded-md shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-700 mt-2">
            Or{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              sign in
            </Link>{' '}
            to your account
          </p>
          <hr className="border-black my-4" />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center border border-black px-4 py-2 rounded-md shadow-sm bg-white hover:bg-gray-200 disabled:opacity-50"
          >
            <FaGoogle className="mr-2" />
            {isLoading ? 'Creating account...' : 'Continue with Google'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;
