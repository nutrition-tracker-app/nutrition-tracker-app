/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
/* eslint-enable no-unused-vars */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// Component to protect routes that require authentication
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  // User authenticated, render the component
  return children;
}
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;