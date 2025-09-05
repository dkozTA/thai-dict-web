import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChange, getCurrentUser, logoutUser } from '../services/userService';
import { getUser } from '../services/userApi';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setIsLoading(true);
      if (user) {
        // User is signed in
        setCurrentUser(user);
        
        try {
          const userData = await getUser(user.uid);
          setUserDetails(userData);
          setUserRole(userData?.role || 'user');
          
          // Check if the user is active and set the state
          const isUserActive = userData?.isActive !== false;
          setIsActive(isUserActive);
          
          // If user is inactive, log them out automatically
          if (!isUserActive) {
            console.warn('Inactive user tried to login, logging out...');
            setTimeout(() => {
              logoutUser().catch(err => console.error('Error logging out inactive user:', err));
            }, 1000);
          }
          
          localStorage.setItem('userId', user.uid);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUserRole('user');
          setIsActive(true);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserDetails(null);
        setUserRole(null);
        setIsActive(true);
        localStorage.removeItem('userId');
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Check if user is admin
  const isAdmin = userRole === 'admin';
  
  // Check if user is editor or higher
  const isEditor = ['editor', 'admin'].includes(userRole);
  
  // Check if user is moderator or higher
  const isModerator = ['moderator', 'editor', 'admin'].includes(userRole);

  // Check if user account is active
  const isAccountActive = isActive === true;

  const value = {
    currentUser,
    userDetails,
    userRole,
    isAdmin,
    isEditor,
    isModerator,
    isAccountActive,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the auth context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;