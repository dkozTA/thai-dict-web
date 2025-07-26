import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Search from './pages/Search';
import Translation from './pages/Translation';
import Learning from './pages/Learning';
import Profile from './pages/Profile';

// Import components
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<Search />} />
            <Route path="/translation" element={<Translation />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;