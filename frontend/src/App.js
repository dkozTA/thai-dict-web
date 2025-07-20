import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages (will be created later)
// import Home from './pages/Home';
// import Dictionary from './pages/Dictionary';
// import Translation from './pages/Translation';
// import Learning from './pages/Learning';
// import Reading from './pages/Reading';
// import Profile from './pages/Profile';

// Import common components (will be created later)
// import Header from './components/common/Header';
// import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Vie-Thai</h1>
          <p>OK</p>
          <nav>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '20px' }}>
              <li><a href="/">Home</a></li>
              <li><a href="/dictionary">Dictionary</a></li>
              <li><a href="/translation">Translation</a></li>
              <li><a href="/learning">Learning</a></li>
              <li><a href="/reading">Reading</a></li>
            </ul>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<div>🏠 Home Page - Coming Soon!</div>} />
            <Route path="/dictionary" element={<div>📚 Dictionary - Coming Soon!</div>} />
            <Route path="/translation" element={<div>🔄 Translation - Coming Soon!</div>} />
            <Route path="/learning" element={<div>🎓 Learning - Coming Soon!</div>} />
            <Route path="/reading" element={<div>📖 Reading Practice - Coming Soon!</div>} />
            <Route path="/profile" element={<div>👤 Profile - Coming Soon!</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
