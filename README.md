# Nutrition Tracker 9000

A comprehensive web application for tracking nutritional intake, managing meal history, and achieving health goals. Built with React, Firebase, and modern web technologies.

## Table of Contents
- [Nutrition Tracker 9000](#nutrition-tracker-9000)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Clone the Repository](#clone-the-repository)
    - [Install Dependencies](#install-dependencies)
    - [Firebase Setup](#firebase-setup)
  - [Running the Application](#running-the-application)
    - [Development Mode](#development-mode)
    - [Building for Production](#building-for-production)
    - [Deployment](#deployment)
  - [Code Structure](#code-structure)
    - [Key Files](#key-files)
  - [Authentication](#authentication)
  - [Data Storage](#data-storage)
  - [UI Components](#ui-components)
    - [NavBar Component](#navbar-component)
    - [EditableContent Component](#editablecontent-component)
    - [QuickAddMealModal Component](#quickaddmealmodal-component)
  - [Theming and Dark Mode](#theming-and-dark-mode)
  - [Navigation](#navigation)
    - [Protected Routes](#protected-routes)
  - [Contributing](#contributing)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)

## Overview

Nutrition Tracker 9000 is a feature-rich web application designed to help users track their daily food intake, monitor nutritional data, and maintain healthy dietary habits. The application provides an intuitive interface for logging meals, visualizing nutrition trends, and setting personalized dietary goals.

## Features

- **User Authentication**: Secure sign-up and login functionality with Firebase Authentication
- **Dashboard**: Visual overview of daily nutritional intake with progress bars for calories and macronutrients
- **Meal Logging**: Quick-add meal functionality with calorie and macronutrient tracking
- **Meal History**: Comprehensive view of past meals with filtering by date
- **Editable Content**: In-place editing of meal details and nutritional information
- **Dark/Light Mode**: Customizable UI theme that persists across sessions
- **Responsive Design**: Fully responsive interface that works on desktops, tablets, and mobile devices

## Architecture

The application follows a modern React architecture with the following key components:

- **Frontend**: React.js with functional components and hooks
- **Routing**: React Router for client-side navigation
- **State Management**: Context API for global state management
- **Database**: Firebase Firestore for meal and user data storage
- **Authentication**: Firebase Authentication for user management
- **Styling**: Tailwind CSS for utility-first styling approach

## Installation

Follow these steps to set up the project on your local machine:

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/nutrition-tracker-app.git
cd nutrition-tracker-app
```

### Install Dependencies
```bash
# Install server dependencies (if applicable)
npm install

# Navigate to client directory
cd client

# Install client dependencies
npm install
```

### Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Email/Password and Google sign-in methods
3. Create a Firestore database
4. Add your Firebase configuration to `client/src/firebase/config.js`:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Running the Application

### Development Mode
```bash
# Navigate to client directory
cd client

# Start the development server
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173)

### Building for Production
```bash
# Navigate to client directory
cd client

# Build the application
npm run build
```

### Deployment
The application can be deployed to Firebase Hosting:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy to Firebase Hosting
firebase deploy
```

## Code Structure

The application is organized into the following directory structure:

```
/client
  /public           # Static assets
  /src
    /components     # Reusable UI components
    /context        # React context providers
    /firebase       # Firebase configuration
    /pages          # Main page components
    /services       # Service layer for API calls
    index.css       # Global CSS styles
    main.jsx        # Entry point
```

### Key Files

- `src/main.jsx`: Application entry point, sets up routing and context providers
- `src/firebase/config.js`: Firebase configuration
- `src/context/authContext.jsx`: Authentication context provider
- `src/context/settingsContext.jsx`: Settings and theme context provider
- `src/pages/dashboard.jsx`: Main dashboard view
- `src/pages/mealHistory.jsx`: Meal history tracking view

## Authentication

The application uses Firebase Authentication for user management. Authentication logic is encapsulated in the AuthContext provider:

```javascript
// src/context/authContext.jsx
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    
    return unsubscribe; // Cleanup on unmount
  }, []);
  
  // Authentication methods
  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };
  
  const logout = async () => {
    return await signOut(auth);
  };
  
  // Context value
  const value = {
    currentUser,
    signInWithGoogle,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Data Storage

Meal data is stored in Firebase Firestore. The application uses a service layer to interact with Firestore:

```javascript
// src/services/firestoreService.js
export const getUserMeals = async (userId) => {
  try {
    const mealsCollection = collection(db, 'meals');
    const q = query(
      mealsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

export const addMeal = async (mealData) => {
  try {
    const mealsCollection = collection(db, 'meals');
    const docRef = await addDoc(mealsCollection, {
      ...mealData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};
```

## UI Components

The application uses a component-based architecture with reusable UI components:

### NavBar Component

```jsx
// src/components/navbar.jsx
function NavBar() {
  const { currentUser, logout } = useAuth();
  const { darkMode } = useSettings();
  
  return (
    <nav className={`border-b-2 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'}`}>
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/">Nutrition Tracker 9000</Link>
      </div>
      
      {/* Navigation Links */}
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <>
            <span>{currentUser.displayName || currentUser.email}</span>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/meal-history">Meal History</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
```

### EditableContent Component

```jsx
// src/components/editableContent.jsx
function EditableContent({ value, onChange, type = 'text', className, placeholder }) {
  const { editMode } = useSettings();
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle click to edit in edit mode
  const handleClick = () => {
    if (editMode && !isEditing) {
      setIsEditing(true);
    }
  };
  
  // Handle blur event to save changes
  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    setEditValue(e.target.value);
  };
  
  return (
    <div className={`editable-content ${className}`} onClick={handleClick}>
      {isEditing ? (
        <input
          type={type}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          placeholder={placeholder}
          className="bg-transparent border-b outline-none"
        />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}
```

### QuickAddMealModal Component

```jsx
// src/components/quickAddModal.jsx
function QuickAddMealModal({ isOpen, onClose, userId }) {
  const [mealData, setMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addMeal({
        ...mealData,
        userId,
        calories: Number(mealData.calories),
        protein: Number(mealData.protein),
        carbs: Number(mealData.carbs),
        fat: Number(mealData.fat)
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    setMealData({
      ...mealData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Add Meal</h2>
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <button type="submit">Add Meal</button>
          </form>
        </div>
      </div>
    )
  );
}
```

## Theming and Dark Mode

The application supports dark mode through a settings context and CSS classes:

```javascript
// src/context/settingsContext.jsx
export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const value = {
    darkMode,
    toggleDarkMode
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
```

CSS variables are used for theming in `index.css`:

```css
:root {
  /* Light mode colors */
  --bg-primary: #efffce;
  --bg-secondary: #fff;
  --text-primary: #333;
  --text-secondary: #555;
  --accent-green: #4ade80;
  --accent-blue: #3b82f6;
}

.dark-mode {
  /* Dark mode colors */
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #f8fafc;
  --text-secondary: #e2e8f0;
  --accent-green: #22c55e;
  --accent-blue: #3b82f6;
}
```

## Navigation

The application uses React Router for navigation between pages:

```jsx
// src/main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meal-history" element={<MealHistory />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>
);
```

### Protected Routes

Dashboard and meal history pages are protected with authentication checks:

```jsx
// src/pages/dashboard.jsx
function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Rest of component...
}
```

## Contributing

We welcome contributions to improve the Nutrition Tracker 9000 application! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Ensure your Firebase configuration is correct in `src/firebase/config.js`
   - Check that you have enabled the necessary Firebase services (Authentication, Firestore)

2. **Authentication Problems**
   - Verify that you've enabled the Email/Password and Google sign-in methods in Firebase Console
   - Check browser console for authentication errors

3. **Routing Issues**
   - Ensure that all route paths in `main.jsx` match the Link components throughout the application
   - Check for typos in path names

4. **Development Server Problems**
   - Clear node_modules and reinstall dependencies: `rm -rf node_modules && npm install`
   - Ensure you're running the latest version of Node.js