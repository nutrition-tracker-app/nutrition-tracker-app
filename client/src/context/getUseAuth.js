/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
/* eslint-enable no-unused-vars */
import { AuthContext } from './authContextStore';

// Hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;