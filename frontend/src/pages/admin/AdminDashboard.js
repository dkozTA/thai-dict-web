import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';

const DictionaryManagement = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  
  // New word form state
  const [newWord, setNewWord] = useState({
    word: '',
    word_transliterated: '',
    vietnamese_meaning: '',
    grammar_note: '',
    category: 'general',
    examples: []
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage] = useState(10);
  
  useEffect(() => {
    // In a real application, you would fetch this data from your API
    const fetchWords = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockData = Array(25).fill().map((_, index) => ({
          id: `word_${index}`,
          word: `คำศัพท์ ${index + 1}`,
          word_transliterated: `KAM SAP ${index + 1}`,
          vietnamese_meaning: `Từ vựng số ${index + 1}`,
          grammar_note: index % 3 === 0 ? 'vh' : '',
          category: index % 5 === 0 ? 'food' : 'general',
          examples: [
            { thai: `ประโยค ${index + 1}`, meaning: `Câu ví dụ ${index + 1}` }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setWords(mockData);
      } catch (error) {
        console.error('Error fetching words:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWords();
  }, []);
  
  // Filter words based on search term and category
  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      word.vietnamese_meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.word_transliterated.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get current words for pagination
  const indexOfLastWord = currentPage * wordsPerPage;
  const indexOfFirstWord = indexOfLastWord - wordsPerPage;
  const currentWords = filteredWords.slice(indexOfFirstWord, indexOfLastWord);
  
  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);
  
  // Handle adding new example field
  const handleAddExample = () => {
    setNewWord({
      ...newWord,
      examples: [...newWord.examples, { thai: '', meaning: '' }]
    });
  };
  
  // Handle editing example field
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...newWord.examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setNewWord({ ...newWord, examples: updatedExamples });
  };
  
  // Handle removing example field
  const handleRemoveExample = (index) => {
    const updatedExamples = newWord.examples.filter((_, i) => i !== index);
    setNewWord({ ...newWord, examples: updatedExamples });
  };
  
  // Reset form
  const resetForm = () => {
    setNewWord({
      word: '',
      word_transliterated: '',
      vietnamese_meaning: '',
      grammar_note: '',
      category: 'general',
      examples: []
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real application, you would send this data to your API
    console.log('Form submitted with data:', newWord);
    
    // Reset form and close modal
    resetForm();
    setShowAddModal(false);
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Quản lý từ điển</h1>
      
      <div className={styles.adminActions}>
        <div className={styles.searchFilters}>
          <input
            type="text"
            placeholder="Tìm kiếm từ..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categoryFilter}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="general">Từ chung</option>
            <option value="food">Thức ăn</option>
            <option value="travel">Du lịch</option>
          </select>
        </div>
        
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          + Thêm từ mới
        </button>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Từ tiếng Thái</th>
                  <th>Phiên âm</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>Danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentWords.map((word) => (
                  <tr key={word.id}>
                    <td className={styles.thaiWord}>{word.word}</td>
                    <td>{word.word_transliterated}</td>
                    <td>{word.vietnamese_meaning}</td>
                    <td>{word.category}</td>
                    <td className={styles.actions}>
                      <button className={styles.editBtn}>Sửa</button>
                      <button className={styles.deleteBtn}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.pagination}>
            {Array.from({ length: Math.ceil(filteredWords.length / wordsPerPage) }).map((_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? styles.activePage : ''}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* Add Word Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Thêm từ mới</h2>
            
            <form onSubmit={handleSubmit} className={styles.wordForm}>
              <div className={styles.formGroup}>
                <label>Từ tiếng Thái:</label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Phiên âm:</label>
                <input
                  type="text"
                  value={newWord.word_transliterated}
                  onChange={(e) => setNewWord({ ...newWord, word_transliterated: e.target.value })}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nghĩa tiếng Việt:</label>
                <textarea
                  value={newWord.vietnamese_meaning}
                  onChange={(e) => setNewWord({ ...newWord, vietnamese_meaning: e.target.value })}
                  required
                ></textarea>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ghi chú ngữ pháp:</label>
                <input
                  type="text"
                  value={newWord.grammar_note}
                  onChange={(e) => setNewWord({ ...newWord, grammar_note: e.target.value })}
                  placeholder="vd: vh, dt, ..."
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Danh mục:</label>
                <select
                  value={newWord.category}
                  onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                >
                  <option value="general">Từ chung</option>
                  <option value="food">Thức ăn</option>
                  <option value="travel">Du lịch</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ví dụ:</label>
                <button 
                  type="button" 
                  className={styles.addExampleBtn}
                  onClick={handleAddExample}
                >
                  + Thêm ví dụ
                </button>
                
                {newWord.examples.map((example, index) => (
                  <div key={index} className={styles.exampleRow}>
                    <div className={styles.exampleInputs}>
                      <input
                        type="text"
                        placeholder="Câu tiếng Thái"
                        value={example.thai}
                        onChange={(e) => handleExampleChange(index, 'thai', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Nghĩa tiếng Việt"
                        value={example.meaning}
                        onChange={(e) => handleExampleChange(index, 'meaning', e.target.value)}
                      />
                    </div>
                    <button 
                      type="button" 
                      className={styles.removeExampleBtn}
                      onClick={() => handleRemoveExample(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Thêm từ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryManagement;