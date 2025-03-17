/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import NavBar3 from '../components/navbar3';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/settingsContext';

function Home() {
  // Import settings context for dark mode
  const { darkMode } = useSettings();

  // Testimonials data
  const testimonials = [
    {
      text: "Since using Nutrition Tracker 9000, I've lost 15 pounds and gained muscle. The easy tracking makes staying on top of my macros simple!",
      name: 'John Doe',
      title: 'Fitness Enthusiast',
      initials: 'JD',
      color: darkMode ? 'bg-blue-700' : 'bg-blue-100',
      textColor: darkMode ? 'text-blue-200' : 'text-blue-800',
    },
    {
      text: 'The detailed meal history and tracking has completely changed my relationship with food. I finally understand my eating habits!',
      name: 'Jane Smith',
      title: 'Nutrition Coach',
      initials: 'JS',
      color: darkMode ? 'bg-green-700' : 'bg-green-100',
      textColor: darkMode ? 'text-green-200' : 'text-green-800',
    },
    {
      text: 'Love how I can edit my meals after logging them. The dark mode is so sleek - makes tracking my evening meals easier on the eyes!',
      name: 'Alex Johnson',
      title: 'Software Developer',
      initials: 'AJ',
      color: darkMode ? 'bg-purple-700' : 'bg-purple-100',
      textColor: darkMode ? 'text-purple-200' : 'text-purple-800',
    },
    {
      text: "I've tried many nutrition apps, but this one makes it so simple to log meals. The macro breakdowns help me optimize my training diet!",
      name: 'Sarah Williams',
      title: 'Marathon Runner',
      initials: 'SW',
      color: darkMode ? 'bg-red-700' : 'bg-red-100',
      textColor: darkMode ? 'text-red-200' : 'text-red-800',
    },
  ];

  // State for active testimonials
  const [activeTestimonials, setActiveTestimonials] = useState([0, 1]);
  const [animationClass, setAnimationClass] = useState('opacity-100');

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out animation
      setAnimationClass('opacity-0 transform -translate-y-6');

      // Change content after fade out
      setTimeout(() => {
        setActiveTestimonials((prev) => {
          const newTestimonials = [
            (prev[0] + 2) % testimonials.length,
            (prev[1] + 2) % testimonials.length,
          ];
          return newTestimonials;
        });

        // Fade back in with new content
        setAnimationClass('opacity-100 transform translate-y-0');
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div
      className={`${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 to-slate-800'
          : 'bg-gradient-to-b from-white to-gray-100'
      } flex flex-col min-h-screen`}
    >
      <NavBar3 />

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden ${
          darkMode
            ? 'bg-gradient-to-b from-slate-800 to-slate-900'
            : 'bg-gradient-to-b from-gray-50 to-white'
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute top-20 right-10 w-64 h-64 rounded-full ${
              darkMode ? 'bg-green-900' : 'bg-green-100'
            } opacity-30 animate-float`}
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className={`absolute -top-10 -left-10 w-72 h-72 rounded-full ${
              darkMode ? 'bg-blue-900' : 'bg-blue-100'
            } opacity-20 animate-float`}
            style={{ animationDelay: '1.5s' }}
          ></div>
          <div
            className={`absolute bottom-10 right-1/4 w-40 h-40 rounded-full ${
              darkMode ? 'bg-yellow-900' : 'bg-yellow-100'
            } opacity-25 animate-float`}
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Food icons as decorative elements */}
          <div
            className="absolute top-[15%] left-[10%] opacity-30 text-4xl animate-float"
            style={{ animationDelay: '0.5s' }}
          >
            🥗
          </div>
          <div
            className="absolute top-[30%] right-[15%] opacity-30 text-4xl animate-float"
            style={{ animationDelay: '1.7s' }}
          >
            🍎
          </div>
          <div
            className="absolute bottom-[20%] left-[25%] opacity-30 text-4xl animate-float"
            style={{ animationDelay: '2.1s' }}
          >
            🥑
          </div>
          <div
            className="absolute top-[50%] right-[25%] opacity-30 text-5xl animate-float"
            style={{ animationDelay: '1.2s' }}
          >
            📊
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center py-24 px-4">
            {/* Fancy badge */}
            <div
              className={`inline-block px-8 py-4 rounded-full text-xl font-semibold -mt-4 mb-8 animate-pulse-glow ${
                darkMode
                  ? 'bg-blue-900 text-blue-100'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              The Ultimate Nutrition App
            </div>

            {/* Main Heading */}
            <div className="mb-8 relative">
              <h2
                className={`text-5xl md:text-6xl font-extrabold ${
                  darkMode ? 'text-slate-100' : 'text-black'
                } mb-8 animate-fadeIn`}
              >
                Eat right,{' '}
                <span
                  className={darkMode ? 'text-green-400' : 'text-green-600'}
                >
                  get
                </span>{' '}
                right
              </h2>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-full max-w-md overflow-hidden">
                  <div
                    className={`typewriter typewriter-1 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    } text-xl font-semibold border-r-0`}
                  >
                    Track every bite with precision
                  </div>
                </div>
                <div className="w-full max-w-md overflow-hidden">
                  <div
                    className={`typewriter typewriter-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    } text-xl font-semibold border-r-0`}
                  >
                    Reach your nutrition goals faster
                  </div>
                </div>
                <div className="w-full max-w-md overflow-hidden flex items-center">
                  <div
                    className={`typewriter typewriter-3 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    } text-xl font-semibold`}
                  >
                    See your progress in real-time
                  </div>
                </div>
              </div>
            </div>

            {/* Main Info Box */}
            <div
              className={`border ${
                darkMode
                  ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-[#2c4c2c]'
                  : 'border-gray-200 bg-gradient-to-br from-white to-[#efffce]'
              } p-8 rounded-xl shadow-xl mx-auto max-w-3xl relative`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-xl"></div>

              <div className="flex flex-col md:flex-row items-center gap-8 pt-2">
                {/* Image or graphic */}
                <div
                  className={`rounded-full p-6 ${
                    darkMode ? 'bg-slate-900' : 'bg-white'
                  } shadow-lg transform transition-transform hover:rotate-12 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className={`absolute top-2 left-3 w-4 h-4 rounded-full ${
                        darkMode ? 'bg-green-500' : 'bg-green-300'
                      } animate-float`}
                      style={{ animationDelay: '0.7s' }}
                    ></div>
                    <div
                      className={`absolute bottom-3 right-2 w-3 h-3 rounded-full ${
                        darkMode ? 'bg-blue-500' : 'bg-blue-300'
                      } animate-float`}
                      style={{ animationDelay: '1.4s' }}
                    ></div>
                  </div>
                  <div className="relative z-10">
                    <svg
                      className="w-24 h-24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21"
                        stroke={darkMode ? '#4ade80' : '#16a34a'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="3"
                        r="1"
                        fill={darkMode ? '#4ade80' : '#16a34a'}
                      />
                      <circle
                        cx="20"
                        cy="7"
                        r="1"
                        fill={darkMode ? '#4ade80' : '#16a34a'}
                      />
                      <circle
                        cx="4"
                        cy="7"
                        r="1"
                        fill={darkMode ? '#4ade80' : '#16a34a'}
                      />
                    </svg>
                  </div>
                </div>

                <div className="text-left">
                  <p
                    className={`text-xl ${
                      darkMode ? 'text-slate-100' : 'text-black'
                    } font-medium mb-6 leading-relaxed`}
                  >
                    From a rice pebble to a whole feast, Nutrition Tracker 9000
                    helps you track every bite with precision. Take control of
                    your nutrition journey today.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full ${
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        } flex items-center justify-center mr-2`}
                      >
                        <span
                          className={`${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <span
                        className={
                          darkMode ? 'text-slate-300' : 'text-gray-800'
                        }
                      >
                        Easy Tracking
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full ${
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        } flex items-center justify-center mr-2`}
                      >
                        <span
                          className={`${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <span
                        className={
                          darkMode ? 'text-slate-300' : 'text-gray-800'
                        }
                      >
                        Detailed Analytics
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full ${
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        } flex items-center justify-center mr-2`}
                      >
                        <span
                          className={`${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <span
                        className={
                          darkMode ? 'text-slate-300' : 'text-gray-800'
                        }
                      >
                        Goal Setting
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/signup"
                    className={`inline-flex items-center border-0 ${
                      darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    } px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 group`}
                  >
                    <span>Get Started Free</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Scrolling stats ticker */}
            <div
              className={`mt-10 py-4 px-6 rounded-full inline-flex items-center justify-center text-sm font-medium ${
                darkMode
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="mr-2">🔥</span>
              <span className="animate-pulse-glow">
                Join over 10,000 users · 1M+ meals tracked · 4.9 Star Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with transition */}
      <div
        className={`py-20 pt-28 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-800 to-slate-900'
            : 'bg-gradient-to-r from-gray-50 to-gray-100'
        } relative section-transition`}
        style={{
          '--before-bg': darkMode ? '#143824' : '#d5ffaa',
          '--after-bg': darkMode ? '#0f2a18' : '#c5ffa8',
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div
            className="relative mb-20 pt-16 opacity-0 animate-popup"
            style={{ animationDelay: '0.2s' }}
          >
            <div
              className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-xl ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              } flex items-center justify-center shadow-xl border ${
                darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}
            >
              <svg
                className="w-16 h-16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke={darkMode ? '#4ade80' : '#16a34a'}
                  strokeWidth="1.5"
                />
                <path
                  d="M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
                  fill={darkMode ? '#4ade80' : '#16a34a'}
                />
                <path
                  d="M16 15C16 16.1046 15.1046 17 14 17C12.8954 17 12 16.1046 12 15C12 13.8954 12.8954 13 14 13C15.1046 13 16 13.8954 16 15Z"
                  fill={darkMode ? '#4ade80' : '#16a34a'}
                />
                <path
                  d="M10 15C10 16.1046 9.10457 17 8 17C6.89543 17 6 16.1046 6 15C6 13.8954 6.89543 13 8 13C9.10457 13 10 13.8954 10 15Z"
                  fill={darkMode ? '#4ade80' : '#16a34a'}
                />
                <path
                  d="M12 7V13M8 13L12 15M14 13L12 15"
                  stroke={darkMode ? '#4ade80' : '#16a34a'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <h3
            className={`text-4xl font-bold text-center mb-4 ${
              darkMode ? 'text-slate-100' : 'text-gray-900'
            } opacity-0 animate-popup`}
            style={{ animationDelay: '0.4s' }}
          >
            Why Choose Nutrition Tracker 9000?
          </h3>
          <p
            className={`text-center max-w-2xl mx-auto mb-16 ${
              darkMode ? 'text-slate-300' : 'text-gray-600'
            } text-lg`}
          >
            Our nutrition tracking app is designed to make your health journey
            simpler and more effective.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 - Enhanced with hover line */}
            <div
              className={`feature-card ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800'
                  : 'bg-white'
              } rounded-2xl overflow-hidden shadow-xl border ${
                darkMode ? 'border-slate-600' : 'border-gray-200'
              } group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 opacity-0 animate-popup`}
              style={{ animationDelay: '0.6s' }}
            >
              <div
                className={`h-1 w-full ${
                  darkMode ? 'bg-green-500' : 'bg-green-400'
                }`}
              ></div>
              <div className="p-8">
                <div
                  className={`h-16 w-16 rounded-xl flex items-center justify-center mb-6 ${
                    darkMode
                      ? 'bg-green-900 text-green-300'
                      : 'bg-green-100 text-green-600'
                  } text-4xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="relative pb-1">
                  <h4
                    className={`text-2xl font-bold mb-1 ${
                      darkMode ? 'text-slate-100' : 'text-gray-900'
                    } group-hover:text-green-500 transition-colors duration-300 inline-block`}
                  >
                    Effortless Tracking
                  </h4>
                  <div
                    className={`hover-line absolute -bottom-1 left-0 ${
                      darkMode ? 'bg-green-500' : 'bg-green-500'
                    }`}
                  ></div>
                </div>
                <p
                  className={`${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  } text-base mt-4`}
                >
                  Quickly add meals with our intuitive interface. Track
                  calories, protein, carbs, and fat with just a few clicks. Edit
                  or delete entries with ease.
                </p>
                <ul
                  className={`mt-4 space-y-2 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-green-400' : 'text-green-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    One-click meal logging
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-green-400' : 'text-green-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Detailed nutrition breakdown
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-green-400' : 'text-green-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Edit entries anytime
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 - Enhanced with hover line */}
            <div
              className={`feature-card ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800'
                  : 'bg-white'
              } rounded-2xl overflow-hidden shadow-xl border ${
                darkMode ? 'border-slate-600' : 'border-gray-200'
              } group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 opacity-0 animate-popup`}
              style={{ animationDelay: '0.8s' }}
            >
              <div
                className={`h-1 w-full ${
                  darkMode ? 'bg-blue-500' : 'bg-blue-400'
                }`}
              ></div>
              <div className="p-8">
                <div
                  className={`h-16 w-16 rounded-xl flex items-center justify-center mb-6 ${
                    darkMode
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                  } text-4xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="relative pb-1">
                  <h4
                    className={`text-2xl font-bold mb-1 ${
                      darkMode ? 'text-slate-100' : 'text-gray-900'
                    } group-hover:text-blue-500 transition-colors duration-300 inline-block`}
                  >
                    Flexible Tracking
                  </h4>
                  <div
                    className={`hover-line absolute -bottom-1 left-0 ${
                      darkMode ? 'bg-blue-500' : 'bg-blue-500'
                    }`}
                  ></div>
                </div>
                <p
                  className={`${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  } text-base mt-4`}
                >
                  Access your nutrition data anytime, anywhere with our
                  web-based platform. Enjoy our sleek dark mode interface for
                  comfortable late-night tracking.
                </p>
                <ul
                  className={`mt-4 space-y-2 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Web-based platform
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Dark/light mode toggle
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Data export options
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Enhanced with hover line */}
            <div
              className={`feature-card ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800'
                  : 'bg-white'
              } rounded-2xl overflow-hidden shadow-xl border ${
                darkMode ? 'border-slate-600' : 'border-gray-200'
              } group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 opacity-0 animate-popup`}
              style={{ animationDelay: '1s' }}
            >
              <div
                className={`h-1 w-full ${
                  darkMode ? 'bg-yellow-500' : 'bg-yellow-400'
                }`}
              ></div>
              <div className="p-8">
                <div
                  className={`h-16 w-16 rounded-xl flex items-center justify-center mb-6 ${
                    darkMode
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-yellow-100 text-yellow-600'
                  } text-4xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="relative pb-1">
                  <h4
                    className={`text-2xl font-bold mb-1 ${
                      darkMode ? 'text-slate-100' : 'text-gray-900'
                    } group-hover:text-yellow-500 transition-colors duration-300 inline-block`}
                  >
                    Reach Your Goals
                  </h4>
                  <div
                    className={`hover-line absolute -bottom-1 left-0 ${
                      darkMode ? 'bg-yellow-500' : 'bg-yellow-500'
                    }`}
                  ></div>
                </div>
                <p
                  className={`${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  } text-base mt-4`}
                >
                  Set custom targets for macros and track your progress. See
                  your nutrition trends over time with detailed analytics and
                  visual reports.
                </p>
                <ul
                  className={`mt-4 space-y-2 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Custom goal setting
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Progress visualization
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`mr-2 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`}
                    >
                      ✓
                    </span>{' '}
                    Trend analysis reports
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials with animated transition */}
      <div
        className={`py-20 px-4 relative section-transition`}
        style={{
          '--before-bg': darkMode ? '#0f2a18' : '#efffce',
          '--after-bg': darkMode ? '#143824' : '#d5ffaa',
        }}
      >
        {/* Animated background with horizontal lines and gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base gradient */}
          <div
            className={`absolute inset-0 ${
              darkMode
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800'
                : 'bg-gradient-to-b from-white via-gray-50 to-gray-100'
            }`}
          ></div>

          {/* Animated horizontal lines */}
          <div
            className={`absolute inset-0 opacity-10`}
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${
                darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              } 0px, ${
                darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              } 1px, transparent 1px, transparent 60px)`,
            }}
          ></div>

          {/* Diagonal transition effect */}
          <div
            className={`absolute left-0 right-0 w-full h-24 ${
              darkMode ? 'bg-slate-900' : 'bg-white'
            } -top-12 transform -skew-y-2`}
          ></div>
          <div
            className={`absolute left-0 right-0 w-full h-24 ${
              darkMode ? 'bg-slate-800' : 'bg-gray-100'
            } -bottom-12 transform skew-y-2`}
          ></div>

          {/* Accent glow */}
          <div
            className={`absolute top-1/4 left-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl ${
              darkMode ? 'bg-green-900' : 'bg-green-200'
            }`}
          ></div>
          <div
            className={`absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full opacity-20 blur-3xl ${
              darkMode ? 'bg-blue-900' : 'bg-blue-200'
            }`}
          ></div>
        </div>

        <div className="text-center relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6 ${
              darkMode
                ? 'bg-blue-900 text-blue-100'
                : 'bg-blue-50 text-blue-800'
            } animate-pulse-glow shadow-lg`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span>Real User Experiences</span>
          </div>

          <h3
            className={`text-4xl font-bold text-center mb-16 ${
              darkMode ? 'text-slate-100' : 'text-gray-900'
            }`}
          >
            What Our Users Say
          </h3>

          {/* Testimonial Indicators - Enhanced */}
          <div className="flex justify-center gap-3 mb-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-10 h-2 rounded-full transition-all duration-300 ${
                  activeTestimonials.includes(index)
                    ? darkMode
                      ? 'bg-green-500 w-14'
                      : 'bg-green-600 w-14'
                    : darkMode
                    ? 'bg-slate-600'
                    : 'bg-gray-300'
                }`}
                onClick={() => {
                  setAnimationClass('opacity-0 transform -translate-y-6');
                  setTimeout(() => {
                    setActiveTestimonials([
                      index,
                      (index + 1) % testimonials.length,
                    ]);
                    setAnimationClass('opacity-100 transform translate-y-0');
                  }, 500);
                }}
                aria-label={`Show testimonial ${index + 1}`}
              ></button>
            ))}
          </div>

          {/* Quote marks with SVG instead of text */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 opacity-10 w-40 h-40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={darkMode ? '#475569' : '#e2e8f0'}
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
        </div>

        <div
          className={`max-w-5xl mx-auto grid md:grid-cols-2 gap-8 transition-all duration-500 ease-in-out ${animationClass}`}
        >
          {activeTestimonials.map((testimonialIndex) => {
            const t = testimonials[testimonialIndex];
            return (
              <div
                key={testimonialIndex}
                className={`p-8 rounded-2xl ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-gray-200'
                } border shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 relative`}
              >
                <div
                  className={`absolute top-0 inset-x-1.5 left-0.1 h-0.75 overflow-hidden rounded-t-2xl ${
                    darkMode
                      ? 'bg-gradient-to-r from-green-400 to-blue-500'
                      : 'bg-gradient-to-r from-green-400 to-blue-500'
                  } rounded-t-2xl`}
                ></div>
                <div
                  className={`text-lg italic mb-6 ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  } leading-relaxed pt-2`}
                >
                  &quot;{t.text}&quot;
                </div>
                <div className="flex items-center">
                  <div
                    className={`h-12 w-12 rounded-full ${
                      t.color
                    } flex items-center justify-center border-2 ${
                      darkMode ? 'border-slate-700' : 'border-white'
                    } shadow-md`}
                  >
                    <span className={`font-bold ${t.textColor}`}>
                      {t.initials}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4
                      className={`font-bold ${
                        darkMode ? 'text-slate-100' : 'text-gray-900'
                      }`}
                    >
                      {t.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}
                    >
                      {t.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll through testimonials button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              setAnimationClass('opacity-0 transform -translate-y-6');
              setTimeout(() => {
                setActiveTestimonials((prev) => [
                  (prev[0] + 2) % testimonials.length,
                  (prev[1] + 2) % testimonials.length,
                ]);
                setAnimationClass('opacity-100 transform translate-y-0');
              }, 500);
            }}
            className={`px-6 py-3 rounded-full ${
              darkMode
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-300 flex items-center mx-auto`}
            aria-label="See more reviews"
          >
            <span>See more reviews</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* CTA Section with enhanced visuals */}
      <div
        className={`py-20 relative overflow-hidden section-transition`}
        style={{
          '--before-bg': darkMode ? '#143824' : '#efffce',
          '--after-bg': darkMode ? '#0f2a18' : '#c5ffa8',
        }}
      >
        {/* Background with 3D light effect */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient background */}
          <div
            className={`absolute inset-0 ${
              darkMode
                ? 'bg-gradient-to-br from-[#0f2a18] via-[#143824] to-[#1c4024]'
                : 'bg-gradient-to-br from-[#c5ffa8] via-[#d8ffc1] to-[#efffce]'
            }`}
          ></div>

          {/* Light rays for depth effect */}
          <div
            className={`absolute inset-0 opacity-20 ${
              darkMode ? 'bg-black' : 'bg-white'
            }`}
            style={{
              backgroundImage: `radial-gradient(circle at 30% 20%, ${
                darkMode
                  ? 'rgba(80, 250, 120, 0.4)'
                  : 'rgba(255, 255, 255, 0.8)'
              } 0%, transparent 50%)`,
            }}
          ></div>

          <div
            className={`absolute inset-0 opacity-30 ${
              darkMode ? 'bg-black' : 'bg-white'
            }`}
            style={{
              backgroundImage: `radial-gradient(circle at 70% 80%, ${
                darkMode
                  ? 'rgba(59, 130, 246, 0.4)'
                  : 'rgba(255, 255, 255, 0.8)'
              } 0%, transparent 60%)`,
            }}
          ></div>

          {/* Blurred lines for texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 90%, ${
                darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              } 95%, transparent 100%), 
                           linear-gradient(180deg, transparent 90%, ${
                             darkMode
                               ? 'rgba(255, 255, 255, 0.05)'
                               : 'rgba(0, 0, 0, 0.03)'
                           } 95%, transparent 100%)`,
              backgroundSize: '120px 120px',
            }}
          ></div>

          {/* Animated flowing particles */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Larger flowing orbs */}
            <div
              className={`absolute top-1/4 left-1/5 w-80 h-80 rounded-full ${
                darkMode ? 'bg-green-700' : 'bg-green-300'
              } animate-float opacity-20 blur-2xl`}
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className={`absolute top-3/4 right-1/4 w-96 h-96 rounded-full ${
                darkMode ? 'bg-blue-700' : 'bg-blue-300'
              } animate-float opacity-20 blur-2xl`}
              style={{ animationDelay: '1.2s' }}
            ></div>
            <div
              className={`absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full ${
                darkMode ? 'bg-emerald-700' : 'bg-emerald-300'
              } animate-float opacity-20 blur-2xl`}
              style={{ animationDelay: '0.8s' }}
            ></div>

            {/* Smaller accent particles */}
            <div
              className={`absolute top-1/3 right-1/3 w-16 h-16 rounded-full ${
                darkMode ? 'bg-blue-400' : 'bg-blue-200'
              } animate-float opacity-30 blur-sm`}
              style={{ animationDelay: '1.5s' }}
            ></div>
            <div
              className={`absolute top-2/3 left-1/4 w-20 h-20 rounded-full ${
                darkMode ? 'bg-green-400' : 'bg-green-200'
              } animate-float opacity-30 blur-sm`}
              style={{ animationDelay: '2s' }}
            ></div>
            <div
              className={`absolute bottom-1/4 right-1/5 w-12 h-12 rounded-full ${
                darkMode ? 'bg-yellow-400' : 'bg-yellow-200'
              } animate-float opacity-30 blur-sm`}
              style={{ animationDelay: '1.8s' }}
            ></div>
          </div>

          {/* Shimmer layer */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-5"
            style={{ animation: 'shimmer 8s infinite' }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Content with layered design */}
          <div
            className={`max-w-5xl mx-auto rounded-2xl ${
              darkMode
                ? 'bg-slate-800/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'
                : 'bg-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
            } backdrop-blur-sm p-12 border ${
              darkMode ? 'border-slate-700' : 'border-gray-200'
            } animate-popup opacity-0`}
            style={{ animationDelay: '0.3s' }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-t-2xl`}
            ></div>

            <div className="text-center pt-2">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2 text-sm font-bold ${
                  darkMode
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-blue-50 text-blue-800'
                } animate-pulse-glow`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Limited Time Offer</span>
              </div>

              <h3
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  darkMode ? 'text-slate-100' : 'text-gray-900'
                }`}
              >
                Ready to transform your{' '}
                <span
                  className={darkMode ? 'text-green-400' : 'text-green-600'}
                >
                  nutrition
                </span>{' '}
                tracking?
              </h3>

              <p
                className={`max-w-2xl mx-auto mb-12 ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                } text-lg leading-relaxed`}
              >
                Join thousands of users who are achieving their fitness and
                health goals with Nutrition Tracker 9000. Our comprehensive
                tracking system helps you stay on course.
              </p>

              {/* Feature bullets */}
              <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
                <div
                  className={`flex items-start ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full ${
                      darkMode ? 'bg-slate-700' : 'bg-green-100'
                    } flex items-center justify-center mr-3`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <div>Free to get started with all core features</div>
                </div>
                <div
                  className={`flex items-start ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full ${
                      darkMode ? 'bg-slate-700' : 'bg-green-100'
                    } flex items-center justify-center mr-3`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <div>Unlimited meal tracking and history</div>
                </div>
                <div
                  className={`flex items-start ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full ${
                      darkMode ? 'bg-slate-700' : 'bg-green-100'
                    } flex items-center justify-center mr-3`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <div>Beautiful dark mode for night tracking</div>
                </div>
              </div>

              {/* CTA Buttons with enhanced effects */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  to="/signup"
                  className={`relative overflow-hidden group w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 
                    ${
                      darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    }`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <span>Get Started Free</span>
                    <svg
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                  <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 blur-xl"></div>
                  </div>
                </Link>

                <Link
                  to="/login"
                  className={`w-full md:w-auto ${
                    darkMode
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  } px-8 py-4 rounded-xl font-bold text-lg shadow-md border ${
                    darkMode ? 'border-slate-700' : 'border-gray-200'
                  } flex items-center justify-center`}
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  <span>Sign In</span>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center">
                <div
                  className={`flex items-center gap-6 ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  } text-sm`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    <span>Secure & private</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      ></path>
                    </svg>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>30-day trial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
