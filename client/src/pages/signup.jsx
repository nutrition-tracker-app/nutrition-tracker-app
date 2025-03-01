import React from 'react';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className="bg-white flex flex-col min-h-screen">
      <NavBar2 />
      {/* Login Box */}
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

          {/* Placeholder for Google Sign-In */}
          <button className="w-full flex items-center justify-center border border-black px-4 py-2 rounded-md shadow-sm bg-white hover:bg-gray-200">
            <span className="mr-2">*</span> {/* Placeholder for Google Icon */}
            Continue with Google
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;
