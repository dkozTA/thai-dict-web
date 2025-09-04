import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const RequireAdmin = ({ children }) => {
  const { currentUser, userRole, isLoading } = useUser();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // console.log to verify the role
  console.log('User role:', userRole);
  
  if (!currentUser || userRole !== 'admin') {
    // Redirect users who aren't admins to the home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;