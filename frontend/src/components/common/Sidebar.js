import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { path: '/search', icon: '🔍', text: 'Tra cứu' },
    { path: '/translation', icon: '🌐', text: 'Dịch' },
    { path: '/learning', icon: '📚', text: 'Học tập' },
    { path: '/profile', icon: '👤', text: 'Tài khoản' }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          {sidebarOpen && <span className={styles.appName}>ThaiVie</span>}
        </div>
        
        <div className={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`${styles.menuItem} ${!sidebarOpen ? styles.collapsed : ''} ${location.pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.menuText}>{item.text}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Hamburger button for when sidebar is closed */}
      {!sidebarOpen && (
        <button className={styles.floatingHamburger} onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
    </>
  );
};

export default Sidebar;