import React, { useState } from 'react';
import { submitNewWordSuggestion, submitEditWordSuggestion } from '../../services/userApi';
import styles from '../../styles/SuggestionForm.module.css';

const SuggestionForm = ({ wordData = null, onClose, onSuccess }) => {
  // If wordData is provided, it's an edit suggestion, otherwise it's a new word
  const isEditMode = !!wordData;
  
  // Form state
  const [formData, setFormData] = useState({
    word: wordData?.word || '',
    word_transliterated: wordData?.word_transliterated || '',
    vietnamese_meaning: wordData?.vietnamese_meaning || '',
    grammar_note: wordData?.grammar_note || '',
    category: wordData?.category || 'general',
    examples: Array.isArray(wordData?.examples) ? [...wordData.examples] : [],
    note: '' // User note for the suggestion
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new example
  const handleAddExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { thai: '', meaning: '' }]
    }));
  };
  
  // Handle changing an example
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...formData.examples];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    setFormData(prev => ({ ...prev, examples: updatedExamples }));
  };
  
  // Handle removing an example
  const handleRemoveExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Bạn cần đăng nhập để gửi góp ý');
        return;
      }
      
      // Basic validation
      if (!formData.word.trim()) {
        setError('Từ tiếng Thái không được để trống');
        return;
      }
      
      if (!formData.vietnamese_meaning.trim()) {
        setError('Nghĩa tiếng Việt không được để trống');
        return;
      }
      
      if (isEditMode) {
        // Submit edit suggestion
        await submitEditWordSuggestion(
          userId,
          wordData.id,
          {
            word: formData.word,
            word_transliterated: formData.word_transliterated,
            vietnamese_meaning: formData.vietnamese_meaning,
            grammar_note: formData.grammar_note,
            category: formData.category,
            examples: formData.examples
          },
          formData.note
        );
      } else {
        // Submit new word suggestion
        await submitNewWordSuggestion(
          userId,
          {
            word: formData.word,
            word_transliterated: formData.word_transliterated,
            vietnamese_meaning: formData.vietnamese_meaning,
            grammar_note: formData.grammar_note,
            category: formData.category,
            examples: formData.examples
          },
          formData.note
        );
      }
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess(isEditMode ? 'edit' : 'new');
      }
      
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setError(error.response?.data?.message || 'Lỗi khi gửi góp ý. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.suggestionForm}>
      <h2>{isEditMode ? 'Góp ý chỉnh sửa từ' : 'Góp ý từ mới'}</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Từ tiếng Thái:</label>
          <input
            type="text"
            name="word"
            value={formData.word}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Phiên âm:</label>
          <input
            type="text"
            name="word_transliterated"
            value={formData.word_transliterated}
            onChange={handleChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Nghĩa tiếng Việt:</label>
          <textarea
            name="vietnamese_meaning"
            value={formData.vietnamese_meaning}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className={styles.formGroup}>
          <label>Ghi chú ngữ pháp:</label>
          <input
            type="text"
            name="grammar_note"
            value={formData.grammar_note}
            onChange={handleChange}
            placeholder="vd: vh, dt, ..."
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Danh mục:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
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
          
          {formData.examples.map((example, index) => (
            <div key={index} className={styles.exampleRow}>
              <div className={styles.exampleInputs}>
                <input
                  type="text"
                  placeholder="Câu tiếng Thái"
                  value={example.thai || ''}
                  onChange={(e) => handleExampleChange(index, 'thai', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Nghĩa tiếng Việt"
                  value={example.meaning || ''}
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
        
        <div className={styles.formGroup}>
          <label>Ghi chú của bạn:</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Nếu có thông tin bổ sung hoặc nguồn tham khảo, hãy ghi vào đây"
          ></textarea>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi góp ý'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionForm;