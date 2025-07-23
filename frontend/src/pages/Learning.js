import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Learning.module.css';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('flashcards');

  return (
    <div className={styles.learningPage}>
      <h1>Learning</h1>

      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'flashcards' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            📚 Flashcards
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'quiz' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            🧠 Quiz
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'notebook' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notebook')}
          >
            📖 My Notebook
          </button>
        </div>

  
      </div>
    </div>
  );
};

export default Learning;