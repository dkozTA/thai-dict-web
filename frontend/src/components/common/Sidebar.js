import React, { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';
import { useUser } from '../../context/UserContext';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { isAdmin } = useUser();

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
          
          {/* Admin link - moved inside the sidebar menu */}
          {isAdmin && (
            <NavLink 
              to="/admin"
              className={({isActive}) => `${styles.menuItem} ${!sidebarOpen ? styles.collapsed : ''} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.menuIcon}>👑</span>
              {sidebarOpen && <span className={styles.menuText}>Admin</span>}
            </NavLink>
          )}
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