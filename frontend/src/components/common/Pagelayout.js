import React, { useState, useEffect } from 'react';
import styles from '../../styles/Sidebar.module.css';

const PageLayout = ({ children, title, showUserInfo = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = () => {
      const sidebar = document.querySelector(`.${styles.sidebar}`);
      if (sidebar) {
        setSidebarOpen(sidebar.classList.contains(styles.open));
      }
    };

    // Check sidebar state periodically
    const interval = setInterval(handleSidebarToggle, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.pageContent} ${sidebarOpen ? styles.shifted : ''}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {showUserInfo && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>U</div>
          </div>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;