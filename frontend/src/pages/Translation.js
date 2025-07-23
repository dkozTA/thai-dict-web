import React, { useState } from 'react';
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
      setError('Please enter text to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement translation logic with Firebase or translation service
      // For now, simulate translation
      setTimeout(() => {
        setTranslatedText(`[Translated]: ${inputText}`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Translation failed. Please try again.');
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
    <div className={styles.translationPage}>
      <h1>🔄 Text Translation</h1>
      <p>Translate between Thai and Vietnamese</p>

      <div className={styles.translationContainer}>
        <div className={styles.languageSelector}>
          <select 
            value={sourceLanguage} 
            onChange={(e) => setSourceLanguage(e.target.value)}
            className={styles.languageSelect}
          >
            <option value="thai">Thai → Vietnamese</option>
            <option value="vietnamese">Vietnamese → Thai</option>
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
                {sourceLanguage === 'thai' ? 'Thai Text:' : 'Vietnamese Text:'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter ${sourceLanguage === 'thai' ? 'Thai' : 'Vietnamese'} text here...`}
                className={styles.inputTextarea}
                rows="6"
                disabled={loading}
              />
            </div>

            <div className={styles.outputSection}>
              <label>
                {sourceLanguage === 'thai' ? 'Vietnamese Translation:' : 'Thai Translation:'}
              </label>
              <textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
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
            {loading ? '⏳ Translating...' : '🔄 Translate'}
          </button>
        </form>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>🎤 Voice Translation</h3>
          <p>Coming soon: Speak and get instant translations</p>
        </div>
        <div className={styles.featureCard}>
          <h3>📷 Image Translation</h3>
          <p>Coming soon: Upload images with text to translate</p>
        </div>
        <div className={styles.featureCard}>
          <h3>💬 Chat Translation</h3>
          <p>Coming soon: Real-time conversation translation</p>
        </div>
      </div>
    </div>
  );
};

export default Translation;