import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const RequireAuth = ({ children }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;