import React from 'react';
import NavBar from '../components/navbar';
import Footer from '../components/footer';

function Home() {
  return (
    <div className="bg-white flex flex-col min-h-screen">
      <NavBar />

      <div className="text-center mt-14">
        {/* Main Heading */}
        <h2 className="text-4xl font-extrabold text-black">
          Eat right, get right
        </h2>
        <h2 className="text-3xl font-semibold text-gray-700 mt-2">
          Reach your goals.
        </h2>

        {/* Info Box */}
        <div className=" border border-black mt-6 bg-[#efffce] px-4 py-4 rounded-md mx-auto w-2/4 md:w2/4 sm:w-2/4">
          <p className="text-lg text-black font-medium">
            From a rice pebble to a whole feast, Nutrition Tracker 9000 helps
            you track every bite with precision.
          </p>
        </div>

        {/* Sign Up Button */}
        <button className="border border-black mt-6 bg-[#DECEFF] text-black px-6 py-2 rounded-md shadow-md text-lg font-bold hover:underline">
          Sign up now!
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
