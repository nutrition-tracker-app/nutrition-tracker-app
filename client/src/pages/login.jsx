/* eslint-disable no-unused-vars */
import React from 'react'; // good practice
/* eslint-enable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import useAuth from '../context/getUseAuth';

function Login() {
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
      await signInWithGoogle();
      // Successful login will trigger the useEffect above
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <NavBar2 />
      {/* Login Box */}
      <div className="flex flex-grow items-center justify-center">
        <div className="bg-[#efffce] p-8 rounded-md shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
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
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;