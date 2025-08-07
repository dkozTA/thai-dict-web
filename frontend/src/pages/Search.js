import React, { useState, useEffect } from 'react';
import { searchThaiWords, getPopularWords } from '../services/dictionaryhandle';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Search.module.css';
import ThaiText from '../components/common/ThaiText';
import { containsThaiCharacters } from '../utils/textUtils';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Từ vựng');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popularWords, setPopularWords] = useState([]);
  const [historyWords, setHistoryWords] = useState([]);

  // Suggestions for empty search
  const suggestions = [
    'Thử tìm từ cơ bản như "กิน" (ăn)',
    'Sử dụng phiên âm Latin như "kin"',
    'Kiểm tra chính tả nếu không tìm thấy kết quả'
  ];

  // Load popular words and search history on component mount
  useEffect(() => {
    // Load popular words
    const loadPopularWords = async () => {
      try {
        const words = await getPopularWords(5);
        setPopularWords(words.map(w => w.word));
      } catch (error) {
        console.error('Failed to load popular words:', error);
        setPopularWords(['กิน', 'ดื่ม', 'นอน', 'ไป', 'ทำ']); // Fallback with Thai words
      }
    };

    // Load search history from localStorage
    const loadSearchHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setHistoryWords(history);
      } catch (error) {
        console.error('Failed to load search history:', error);
        setHistoryWords([]);
      }
    };

    loadPopularWords();
    loadSearchHistory();
  }, []);

  // Save search term to history
  const saveToHistory = (term) => {
    const history = [...historyWords];
    
    // Remove if already exists
    const existingIndex = history.indexOf(term);
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    // Add to the beginning
    history.unshift(term);
    
    // Limit to 10 items
    const limitedHistory = history.slice(0, 10);
    
    // Update state and localStorage
    setHistoryWords(limitedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Vui lòng nhập từ cần tìm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await searchThaiWords(searchTerm);
      setSearchResults(results);

      // Save to history only if search was successful
      if (results.length > 0) {
        saveToHistory(searchTerm);
      }

      if (results.length === 0) {
        setError('Không tìm thấy từ nào. Hãy thử từ khác.');
      }
    } catch (err) {
      setError('Tìm kiếm thất bại. Vui lòng thử lại.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Implement category-specific search when needed
  };

  const handleWordClick = (word) => {
    setSearchTerm(word);
    // Search immediately when clicking a word
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Clear search history
  const clearHistory = () => {
    setHistoryWords([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <PageLayout title="Tra cứu từ điển">
      <div className={styles.searchContent}>
        {/* Search Section */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Nhập từ tiếng Thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              disabled={loading}
              lang="th" // Add lang attribute for better input handling
            />
            <button 
              type="submit" 
              className={styles.searchBtn}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
            </button>
          </form>

          {/* Category Buttons */}
          <div className={styles.categoryButtons}>
            {['Từ vựng', 'Mẫu câu', 'Ngữ pháp'].map((category) => (
              <button
                key={category}
                className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <h3>Kết quả tìm kiếm:</h3>
            {searchResults.map((word) => (
              <div key={word.id} className={styles.wordResult}>
                <h4>
                  <ThaiText 
                    text={word.word} 
                    size="large" 
                    showOriginal={true} 
                    phonetic={word.phonetic} 
                    showPhonetic={!!word.phonetic} 
                  />
                </h4>
                <p><strong>Tiếng Việt:</strong> {word.vietnamese_meaning}</p>
                {word.examples && word.examples.length > 0 && (
                  <div>
                    <p><strong>Ví dụ:</strong></p>
                    <ul>
                      {word.examples.map((example, index) => (
                        <li key={index}>
                          <ThaiText 
                            text={example} 
                            showOriginal={true}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Left Sidebar and Main Section */}
          <div className={styles.leftContent}>
            <div className={styles.mainSection}>
              {/* Suggestions */}
              <div className={styles.section}>
                <h3>💡 Gợi ý:</h3>
                <ul className={styles.suggestionsList}>
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              {/* History */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>📜 Lịch sử tìm kiếm:</h3>
                  {historyWords.length > 0 && (
                    <button 
                      className={styles.clearButton} 
                      onClick={clearHistory}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                {historyWords.length > 0 ? (
                  <div className={styles.wordChips}>
                    {historyWords.map((word, index) => (
                      <button
                        key={index}
                        className={styles.wordChip}
                        onClick={() => handleWordClick(word)}
                        lang="th"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>Chưa có từ nào trong lịch sử</p>
                )}
              </div>

              {/* Popular Words */}
              <div className={styles.section}>
                <h3>🔥 Từ khóa phổ biến:</h3>
                <div className={styles.wordChips}>
                  {popularWords.map((word, index) => (
                    <button
                      key={index}
                      className={styles.wordChip}
                      onClick={() => handleWordClick(word)}
                      lang="th" // Add lang attribute for Thai text
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className={styles.rightSidebar}>
            <div className={styles.helpSection}>
              <h4>📖 Hướng dẫn sử dụng:</h4>
              <ul>
                <li>Nhập từ tiếng Thái vào ô tìm kiếm</li>
                <li>Chọn loại từ bạn muốn tìm</li>
                <li>Nhấp vào từ trong lịch sử để tìm lại</li>
              </ul>
            </div>
            
            <div className={styles.feedbackSection}>
              <h4>💭 Góp ý:</h4>
              <ul>
                <li>Báo lỗi từ điển không chính xác</li>
                <li>Đề xuất từ mới cần thêm</li>
                <li>Ý kiến cải thiện giao diện</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Search;