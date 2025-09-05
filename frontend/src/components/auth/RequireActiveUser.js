import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const RequireActiveUser = ({ children }) => {
  const { currentUser, isAccountActive, isLoading } = useUser();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/profile" replace />;
  }

  if (!isAccountActive) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Account Deactivated</h2>
        <p>Your account has been deactivated. Please contact an administrator.</p>
        <button 
          onClick={() => window.location.href = '/profile'}
          style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return children;
};

export default RequireActiveUser;