import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchThaiWords } from '../services/dictionaryhandle';
import styles from '../styles/Home.module.css'; 

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search for words in Firebase
      const results = await searchThaiWords(searchTerm);
      setSearchResults(results);

      // If no results, show message
      if (results.length === 0) {
        setError('No words found. Try a different search term.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.homePage}> 
      <h1>Welcome to Thai Dictionary</h1>
      
      <div className={styles.searchBox}> 
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm từ tiếng Thái"
            className={styles.searchInput} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={loading}
          >
            {loading ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </form>
        
        {error && <div className={styles.errorMessage}>{error}</div>} 
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <h3>Search Results:</h3>
          {searchResults.map((word) => (
            <div key={word.id} className={styles.wordResult}>
              <h4>{word.word}</h4>
              <p><strong>Vietnamese:</strong> {word.vietnamese_meaning}</p> 
              {word.phonetic && (
                <p><strong>Phonetic:</strong> {word.phonetic}</p>
              )}
              {word.grammar_note && (
                <p><strong>Grammar:</strong> {word.grammar_note}</p> 
              )}
              {word.note && (
                <p><strong>Note:</strong> {word.note}</p>
              )}
              {word.category && (
                <p><strong>Category:</strong> {word.category}</p> 
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.features}> 
        <Link to="/dictionary" className={styles.featureCardLink}>
          <div className={styles.featureCard}>
            <h3>📚 Dictionary</h3>
            <p>Look up Thai words and get Vietnamese translations</p>
          </div>
        </Link>
        
        <div className={styles.featureCard}>
          <h3>🔄 Translation</h3>
          <p>Translate text, voice, and images</p>
        </div>

        <div className={styles.featureCard}> 
          <h3>🎓 Learning</h3>
          <p>Practice with flashcards and quizzes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;