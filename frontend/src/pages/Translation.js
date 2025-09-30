import React, { useState } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Translation.module.css';
import { translateText } from '../services/translationService';
import ThaiWord from '../components/common/ThaiWord';
import { submitTranslationFeedback } from '../services/userApi';

const Translation = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('thai');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleTranslate = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Vui lòng nhập văn bản cần dịch');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save translation history if user is logged in
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          // save translation to user history
          // await addTranslateHistoryRemote(userId, inputText);
        } catch (historyErr) {
          console.error('Failed to save translation history:', historyErr);
        }
      }

      const result = await translateText(inputText, sourceLanguage);
      setTranslatedText(result);
    } catch (err) {
      setError('Dịch thuật thất bại. Vui lòng thử lại.');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(sourceLanguage === 'thai' ? 'vietnamese' : 'thai');
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // Save feedback to the suggestions collection
      // You could create a new function in userApi.js for this
      await submitTranslationFeedback({
        originalText: inputText,
        translatedText: translatedText,
        sourceLanguage: sourceLanguage,
        feedback: feedbackText,
        userId: userId,
        timestamp: new Date()
      });
      
      setFeedbackSuccess(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setError('Không thể gửi góp ý. Vui lòng thử lại sau.');
    }
  };

  return (
    <PageLayout title="Dịch thuật">
      <div className={styles.translationContent}>
        <div className={styles.translationContainer}>
          <div className={styles.languageSelector}>
            <select 
              value={sourceLanguage} 
              onChange={(e) => setSourceLanguage(e.target.value)}
              className={styles.languageSelect}
            >
              <option value="thai">Thái → Việt</option>
              <option value="vietnamese">Việt → Thái</option>
            </select>
            <button 
              type="button" 
              onClick={swapLanguages}
              className={styles.swapButton}
            >
              ⇄
            </button>
          </div>

          <form onSubmit={handleTranslate} className={styles.translationForm}>
            <div className={styles.textAreas}>
              <div className={styles.inputSection}>
                <label>
                  {sourceLanguage === 'thai' ? 'Văn bản tiếng Thái:' : 'Văn bản tiếng Việt:'}
                </label>
                
                {sourceLanguage === 'thai' ? (
                  <div className={`${styles.inputTextarea} ${styles.thaiInput}`}>
                    <ThaiWord 
                      text={inputText} 
                      editable={true} 
                      onChange={(value) => setInputText(value)}
                      placeholder={`Nhập tiếng Thái tại đây...`}
                    />
                  </div>
                ) : (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tiếng Việt tại đây..."
                    className={styles.inputTextarea}
                    rows="6"
                    disabled={loading}
                  />
                )}
              </div>

              <div className={styles.outputSection}>
                <label>
                  {sourceLanguage === 'thai' ? 'Bản dịch tiếng Việt:' : 'Bản dịch tiếng Thái:'}
                </label>
                {sourceLanguage === 'vietnamese' ? (
                  <div className={`${styles.outputTextarea} ${styles.thaiOutput}`}>
                    <ThaiWord text={translatedText} />
                  </div>
                ) : (
                  <textarea
                    value={translatedText}
                    readOnly
                    placeholder="Bản dịch sẽ hiển thị tại đây..."
                    className={styles.outputTextarea}
                    rows="6"
                  />
                )}
              </div>

              <div className={styles.feedbackSection}>
                {translatedText && (
                  <button 
                    type="button"
                    className={styles.feedbackButton}
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    🔔 Báo cáo lỗi dịch
                  </button>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.translateButton}
              disabled={loading || !inputText.trim()}
            >
              {loading ? '⏳ Đang dịch...' : '🔄 Dịch'}
            </button>
          </form>

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <h3>🎤 Dịch giọng nói</h3>
            <p>Sắp ra mắt: Nói và nhận bản dịch tức thì</p>
          </div>
          <div className={styles.featureCard}>
            <h3>📷 Dịch hình ảnh</h3>
            <p>Sắp ra mắt: Tải ảnh có chữ để dịch</p>
          </div>
          <div className={styles.featureCard}>
            <h3>💬 Dịch hội thoại</h3>
            <p>Sắp ra mắt: Dịch cuộc trò chuyện thời gian thực</p>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Báo cáo lỗi dịch</h3>
            
            {feedbackSuccess ? (
              <div className={styles.successMessage}>
                <p>Cảm ơn bạn đã góp ý! Chúng tôi sẽ xem xét và cải thiện dịch thuật.</p>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackSuccess(false);
                    setFeedbackText('');
                  }}
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <p>Dịch hiện tại:</p>
                <div className={styles.currentTranslation}>
                  <div><strong>Gốc:</strong> {inputText}</div>
                  <div><strong>Dịch:</strong> {translatedText}</div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Góp ý của bạn:</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Vui lòng cho biết lỗi dịch và gợi ý chỉnh sửa..."
                    className={styles.feedbackTextarea}
                    rows="4"
                    required
                  />
                </div>
                
                <div className={styles.modalButtons}>
                  <button 
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className={styles.submitButton}
                  >
                    Gửi góp ý
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Translation;