import React, { useState } from 'react';
import { searchThaiWords } from '../services/dictionaryhandle';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Search.module.css';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Từ vựng');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // fake
  const historyWords = [''];
  const popularWords = ['กิน', 'ดื่ม', 'นอน', 'ไป', 'ทำ'];
  const suggestions = ['Thử tìm từ cơ bản', 'Sử dụng phiên âm', 'Kiểm tra chính tả'];

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Vui lòng nhập từ cần tìm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await searchThaiWords(searchTerm);
      setSearchResults(results);

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
    console.log('Selected category:', category);
  };

  const handleWordClick = (word) => {
    setSearchTerm(word);
    console.log('Clicked word:', word);
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
                <h4>{word.word}</h4>
                <p><strong>Tiếng Việt:</strong> {word.vietnamese_meaning}</p> 
                {word.phonetic && (
                  <p><strong>Phiên âm:</strong> {word.phonetic}</p>
                )}
                {word.grammar_note && (
                  <p><strong>Ngữ pháp:</strong> {word.grammar_note}</p> 
                )}
                {word.note && (
                  <p><strong>Ghi chú:</strong> {word.note}</p>
                )}
                {word.category && (
                  <p><strong>Danh mục:</strong> {word.category}</p> 
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className={styles.contentArea}>
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
              <h3>📜 Lịch sử tìm kiếm:</h3>
              <div className={styles.wordChips}>
                {historyWords.map((word, index) => (
                  <button
                    key={index}
                    className={styles.wordChip}
                    onClick={() => handleWordClick(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
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
                  >
                    {word}
                  </button>
                ))}
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