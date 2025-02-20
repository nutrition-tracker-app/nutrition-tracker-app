import React from 'react'; // good practice
import ReactDOM from 'react-dom/client'; // render app into browser
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // handle frontend routing

import '../App.css';

function App() {
  return (
    <>
      <div>
        <h1>Welcome to the App Page</h1>
        <p>This is the App page inside your Nutrition Tracker.</p>
      </div>
    </>
  );
}

export default App;
