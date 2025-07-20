import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Vie-Thai Dictionary</h1>
        </div>
        <nav className="navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dictionary">Dictionary</a></li>
            <li><a href="/translation">Translation</a></li>
            <li><a href="/learning">Learning</a></li>
            <li><a href="/reading">Reading</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
