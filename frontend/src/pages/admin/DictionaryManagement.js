import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Admin.module.css';
import { getAllWords, addWord, updateWord, deleteWord, getDictionaryCategories } from '../../services/adminApi';
import ThaiWord from '../../components/common/ThaiWord';

const DictionaryManagement = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [categories, setCategories] = useState(['general', 'food', 'travel']);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // New/edit word form state
  const [wordForm, setWordForm] = useState({
    word: '',
    word_transliterated: '',
    vietnamese_meaning: '',
    grammar_note: '',
    category: 'general',
    examples: []
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wordsPerPage] = useState(10);

    // Fetch words from API
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllWords(currentPage, wordsPerPage, searchTerm, selectedCategory);
      
      if (response.success) {
        setWords(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        setError('Failed to load words');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Error loading words from server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, wordsPerPage, searchTerm, selectedCategory]);
  
  // Fetch words on mount and when search/filter changes
  useEffect(() => {
    fetchWords();
    fetchCategories();
  }, [currentPage, selectedCategory, fetchWords]);
  
  // Apply search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchWords();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, fetchWords]);
  
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const categoriesList = await getDictionaryCategories();
      if (categoriesList.length > 0) {
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Change page
  const paginate = pageNumber => {
    setCurrentPage(pageNumber);
  };
  
  // Handle adding new example field
  const handleAddExample = () => {
    setWordForm({
      ...wordForm,
      examples: [...wordForm.examples, { thai: '', meaning: '' }]
    });
  };
  
  // Handle editing example field
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...wordForm.examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setWordForm({ ...wordForm, examples: updatedExamples });
  };
  
  // Handle removing example field
  const handleRemoveExample = (index) => {
    const updatedExamples = wordForm.examples.filter((_, i) => i !== index);
    setWordForm({ ...wordForm, examples: updatedExamples });
  };
  
  // Reset form
  const resetForm = () => {
    setWordForm({
      word: '',
      word_transliterated: '',
      vietnamese_meaning: '',
      grammar_note: '',
      category: 'general',
      examples: []
    });
    setSelectedWord(null);
  };
  
  // Open edit modal with word data
  const handleEditClick = (word) => {
    setSelectedWord(word);
    setWordForm({
      word: word.word || '',
      word_transliterated: word.word_transliterated || '',
      vietnamese_meaning: word.vietnamese_meaning || '',
      grammar_note: word.grammar_note || '',
      category: word.category || 'general',
      examples: Array.isArray(word.examples) ? word.examples : []
    });
    setShowEditModal(true);
  };
  
  // Handle delete word
  const handleDeleteClick = async (wordId) => {
    if (!window.confirm('Bạn có chắc muốn xóa từ này không?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await deleteWord(wordId);
      
      if (response.success) {
        // Remove the word from the local state
        setWords(words.filter(word => word.id !== wordId));
      } else {
        setError('Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Error deleting word');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle add form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError('');
      
      const response = await addWord(wordForm);
      
      if (response.success) {
        // Add the new word to the list if we're on the first page
        if (currentPage === 1) {
          setWords([response.data, ...words].slice(0, wordsPerPage));
        }
        resetForm();
        setShowAddModal(false);
      } else {
        setError(response.message || 'Failed to add word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Error adding word to dictionary');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError('');
      
      const response = await updateWord(selectedWord.id, wordForm);
      
      if (response.success) {
        // Update the word in the local state
        setWords(words.map(word => word.id === selectedWord.id ? {...word, ...response.data} : word));
        resetForm();
        setShowEditModal(false);
      } else {
        setError(response.message || 'Failed to update word');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      setError('Error updating word');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Quản lý từ điển</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
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
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
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
                {words.map((word) => (
                  <tr key={word.id}>
                    <td className={styles.thaiWord}>
                      <ThaiWord text={word.word} />
                    </td>
                    <td>{word.word_transliterated}</td>
                    <td>{word.vietnamese_meaning}</td>
                    <td>{word.category}</td>
                    <td className={styles.actions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleEditClick(word)}
                      >
                        Sửa
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteClick(word.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {words.length === 0 && (
                  <tr>
                    <td colSpan="5" className={styles.noResults}>Không tìm thấy từ nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
            {/* Pagination */}
            {totalPages > 1 && (
            <div className={styles.pagination}>
                {/* First page */}
                <button
                className={currentPage === 1 ? styles.activePage : ''}
                onClick={() => paginate(1)}
                >
                1
                </button>
                
                {/* Ellipsis if needed */}
                {currentPage > 3 && (
                <span className={styles.pageEllipsis}>...</span>
                )}
                
                {/* Pages around current page */}
                {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Only show pages near the current page (current-1, current, current+1)
                if (
                    pageNumber !== 1 &&
                    pageNumber !== totalPages &&
                    pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1
                ) {
                    return (
                    <button
                        key={pageNumber}
                        className={currentPage === pageNumber ? styles.activePage : ''}
                        onClick={() => paginate(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                    );
                }
                return null;
                })}
                
                {/* Ellipsis if needed */}
                {currentPage < totalPages - 2 && (
                <span className={styles.pageEllipsis}>...</span>
                )}
                
                {/* Last page (if more than 1 page) */}
                {totalPages > 1 && (
                <button
                    className={currentPage === totalPages ? styles.activePage : ''}
                    onClick={() => paginate(totalPages)}
                >
                    {totalPages}
                </button>
                )}
            </div>
            )}
        </>
      )}
      
      {/* Word Form Modal Component - Reused for both add and edit */}
      {(showAddModal || showEditModal) && (
        <div className={styles.modalOverlay} onClick={() => {
          showAddModal ? setShowAddModal(false) : setShowEditModal(false);
          resetForm();
        }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{showAddModal ? 'Thêm từ mới' : 'Chỉnh sửa từ'}</h2>
            
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className={styles.wordForm}>
              <div className={styles.formGroup}>
                <label>Từ tiếng Thái:</label>
                <input
                  type="text"
                  value={wordForm.word}
                  onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                  required
                  disabled={submitLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Phiên âm:</label>
                <input
                  type="text"
                  value={wordForm.word_transliterated}
                  onChange={(e) => setWordForm({ ...wordForm, word_transliterated: e.target.value })}
                  disabled={submitLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Nghĩa tiếng Việt:</label>
                <textarea
                  value={wordForm.vietnamese_meaning}
                  onChange={(e) => setWordForm({ ...wordForm, vietnamese_meaning: e.target.value })}
                  required
                  disabled={submitLoading}
                ></textarea>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ghi chú ngữ pháp:</label>
                <input
                  type="text"
                  value={wordForm.grammar_note}
                  onChange={(e) => setWordForm({ ...wordForm, grammar_note: e.target.value })}
                  placeholder="vd: vh, dt, ..."
                  disabled={submitLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Danh mục:</label>
                <select
                  value={wordForm.category}
                  onChange={(e) => setWordForm({ ...wordForm, category: e.target.value })}
                  disabled={submitLoading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ví dụ:</label>
                <button 
                  type="button" 
                  className={styles.addExampleBtn}
                  onClick={handleAddExample}
                  disabled={submitLoading}
                >
                  + Thêm ví dụ
                </button>
                
                {wordForm.examples.map((example, index) => (
                  <div key={index} className={styles.exampleRow}>
                    <div className={styles.exampleInputs}>
                      <input
                        type="text"
                        placeholder="Câu tiếng Thái"
                        value={example.thai || ''}
                        onChange={(e) => handleExampleChange(index, 'thai', e.target.value)}
                        disabled={submitLoading}
                      />
                      <input
                        type="text"
                        placeholder="Nghĩa tiếng Việt"
                        value={example.meaning || ''}
                        onChange={(e) => handleExampleChange(index, 'meaning', e.target.value)}
                        disabled={submitLoading}
                      />
                    </div>
                    <button 
                      type="button" 
                      className={styles.removeExampleBtn}
                      onClick={() => handleRemoveExample(index)}
                      disabled={submitLoading}
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
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                  }}
                  disabled={submitLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={submitLoading}
                >
                  {submitLoading 
                    ? 'Đang xử lý...' 
                    : (showAddModal ? 'Thêm từ' : 'Lưu thay đổi')}
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