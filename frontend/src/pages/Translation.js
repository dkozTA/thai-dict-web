import React, { useState } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Translation.module.css';

const Translation = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('thai');

  const handleTranslate = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Vui lòng nhập văn bản cần dịch');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement translation logic
      setTimeout(() => {
        setTranslatedText(`[Đã dịch]: ${inputText}`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Dịch thuật thất bại. Vui lòng thử lại.');
      console.error('Translation error:', err);
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(sourceLanguage === 'thai' ? 'vietnamese' : 'thai');
    setInputText(translatedText);
    setTranslatedText(inputText);
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
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Nhập ${sourceLanguage === 'thai' ? 'tiếng Thái' : 'tiếng Việt'} tại đây...`}
                  className={styles.inputTextarea}
                  rows="6"
                  disabled={loading}
                />
              </div>

              <div className={styles.outputSection}>
                <label>
                  {sourceLanguage === 'thai' ? 'Bản dịch tiếng Việt:' : 'Bản dịch tiếng Thái:'}
                </label>
                <textarea
                  value={translatedText}
                  readOnly
                  placeholder="Bản dịch sẽ hiển thị tại đây..."
                  className={styles.outputTextarea}
                  rows="6"
                />
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
    </PageLayout>
  );
};

export default Translation;