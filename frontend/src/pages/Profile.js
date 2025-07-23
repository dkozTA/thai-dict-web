import React, { useState } from 'react';
import styles from '../styles/Profile.module.css';

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement authentication logic with Firebase
    console.log('Form submitted:', formData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  if (isLoggedIn) {
    return (
      <div className={styles.profilePage}>
        <h1>👤 My Profile</h1>
        
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              <span>👤</span>
            </div>
            <h2>Welcome, User!</h2>
            <p>user@example.com</p>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statCard}>
              <h3>📚 Words Learned</h3>
              <span className={styles.statNumber}>45</span>
            </div>
            <div className={styles.statCard}>
              <h3>🎯 Quiz Score</h3>
              <span className={styles.statNumber}>87%</span>
            </div>
            <div className={styles.statCard}>
              <h3>📖 Collections</h3>
              <span className={styles.statNumber}>3</span>
            </div>
          </div>

          <div className={styles.profileActions}>
            <button className={styles.editButton}>Edit Profile</button>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h1>👤 {isLogin ? 'Login' : 'Sign Up'}</h1>
      
      <div className={styles.authContainer}>
        <div className={styles.authTabs}>
          <button 
            className={`${styles.authTab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`${styles.authTab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Display Name:</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className={styles.linkButton}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;