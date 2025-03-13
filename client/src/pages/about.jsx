import React from 'react';
import { useSettings } from '../context/settingsContext';
import NavBar2 from '../components/navbar2';
import Footer from '../components/footer';

// Import images
import KevinImage from '../assets/placeholder.png';
import EddieImage from '../assets/placeholder.png';
import EddiesDogImage from '../assets/placeholder.png';

function AboutUs() {
  const { darkMode } = useSettings();

  return (
    <div
      className={`min-h-screen${
        darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <NavBar2 />
      <h1 className="text-3xl font-bold text-center mb-8 mt-8">About Us</h1>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Team */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold border-b-2 pb-2 border-gray-500 inline-block">
            Meet the Team
          </h2>
          <p className="mt-4 text-lg">
            We are the developers who built Nutrition Tracker 9000 to help
            people take control of their nutrition and wellness.
          </p>
        </div>

        {/* Profile Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Eddies Profile */}
          <div
            className={`p-6 border border-black rounded-lg shadow-md text-center ${
              darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
            }`}
          >
            <img
              src={EddieImage}
              alt="Eddie"
              className={`w-32 h-32 mx-auto rounded-full border-2 ${
                darkMode ? 'border-white' : 'border-gray-600'
              }`}
            />
            <h3 className="text-xl font-bold mt-4">Eddie Yefremov</h3>
            <p
              className={`mt-4 text-gray-300 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Eddie Description Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Doloremque incidunt, molestiae praesentium, aut
              placeat repudiandae fugit quaerat aliquam nostrum ratione,
              laboriosam hic aliquid optio omnis dolores alias quo similique
              asperiores.
            </p>
          </div>

          {/* Kevin's Profile */}
          <div
            className={`p-6 border border-black rounded-lg shadow-md text-center ${
              darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
            }`}
          >
            <img
              src={KevinImage}
              alt="Kevin"
              className={`w-32 h-32 mx-auto rounded-full border-2 ${
                darkMode ? 'border-white' : 'border-gray-600'
              }`}
            />
            <h3 className="text-xl font-bold mt-4">Kevin Phan</h3>
            <p
              className={`mt-4 text-gray-300 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              Kevin Description Lorem ipsum dolor sit amet consectetur,
              adipisicing elit. Nobis voluptatum eveniet enim accusamus, quasi
              laudantium soluta dolore repudiandae fuga, quae natus delectus
              harum debitis excepturi obcaecati nostrum ut suscipit. Autem!
            </p>
          </div>
        </div>

        {/* Dedication */}
        <div
          className={`p-6 border border-black rounded-lg shadow-md text-center mb-10 ${
            darkMode ? 'bg-slate-800' : 'bg-[#efffce]'
          }`}
        >
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            <h3 className="text-xl font-bold mb-8">
              Dedicated to [Dog's Name]
            </h3>
            <img
              src={EddiesDogImage}
              alt="[name of dog]"
              className="w-48 h-48 mx-auto rounded-lg border-4 animate-glow"
            />
            <p
              className={`mt-6 text-gray-300 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}
            >
              This project is dedicated to Eddies dog, [name], ...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;
