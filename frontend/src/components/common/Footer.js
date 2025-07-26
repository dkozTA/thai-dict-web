import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      textAlign: 'center', 
      padding: '1rem',
      marginLeft: '70px',
      transition: 'margin-left 0.3s ease'
    }}>
      <p>&copy; 2025 ThaiVie Dictionary. All rights reserved.</p>
    </footer>
  );
};

export default Footer;