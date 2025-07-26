import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <nav className={styles.navigation}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/translation">Translation</Link></li>
            <li><Link to="/learning">Learning</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;