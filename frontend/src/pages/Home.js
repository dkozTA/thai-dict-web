import React from 'react';

const Home = () => {
  return (
    <div className="home-page">
      <h1>🇹🇭 Welcome to Thai Dictionary</h1>
      <p>Your comprehensive tool for learning and translating Thai language</p>
      
      <div className="features">
        <div className="feature-card">
          <h3>📚 Dictionary</h3>
          <p>Look up Thai words and get Vietnamese translations</p>
        </div>
        
        <div className="feature-card">
          <h3>🔄 Translation</h3>
          <p>Translate text, voice, and images</p>
        </div>
        
        <div className="feature-card">
          <h3>🎓 Learning</h3>
          <p>Practice with flashcards and quizzes</p>
        </div>
        
        <div className="feature-card">
          <h3>📖 Reading</h3>
          <p>Improve your reading skills with practice texts</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
