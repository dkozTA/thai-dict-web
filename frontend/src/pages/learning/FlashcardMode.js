import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/Pagelayout';
import ThaiWord from '../../components/common/ThaiWord';
import styles from '../../styles/FlashcardMode.module.css'; // We'll create this soon
import { getUser, getSharedNotebook } from '../../services/userApi';

const FlashcardMode = ( { isShared }) => {
  const params = useParams();
  const notebookId = params.id || params.notebookId;
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Settings state - default values
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    frontSide: {
      showWord: true,
      showPhonetic: true,
      showMeaning: false
    },
    backSide: {
      showWord: true,
      showPhonetic: true,
      showMeaning: true
    }
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('flashcardSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  // Load notebook data
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!notebookId) {
      navigate('/learning');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        
        let nb;
        let wordsArray;
        
        if (isShared) {
          // Load shared notebook
          const sharedNotebook = await getSharedNotebook(notebookId);
          nb = sharedNotebook;
          
          // Convert words to array if needed
          if (nb && nb.words && typeof nb.words === 'object' && !Array.isArray(nb.words)) {
            wordsArray = Object.values(nb.words);
          } else {
            wordsArray = nb.words || [];
          }
        } else {
          // Load user's own notebook
          const userData = await getUser(userId);
          if (!userData?.notebooks?.[notebookId]) {
            navigate('/learning');
            return;
          }
          nb = userData.notebooks[notebookId];
          wordsArray = Object.values(nb.words || {});
        }

        setNotebook(nb);
        setWords(shuffleArray(wordsArray));
      } catch (error) {
        console.error('Failed to load notebook:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [notebookId, navigate, isShared]);

  // Shuffle array function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    localStorage.setItem('flashcardSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowSettingsModal(false);
  };

  const handleFlipCard = () => {
    setShowMeaning(!showMeaning);
  };

  const handleNextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMeaning(false);
    }
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  // If there's no content to show based on settings, provide fallback
  const shouldShowFallbackMessage = (side) => {
    const sideSettings = settings[side];
    return !sideSettings.showWord && !sideSettings.showPhonetic && !sideSettings.showMeaning;
  };

  // Update the back button navigation
  const handleBackNavigation = () => {
    if (isShared) {
      navigate(`/shared-notebook/${notebookId}`);
    } else {
      navigate('/learning');
    }
  };

  return (
    <PageLayout title={`Flashcard: ${notebook?.name || 'Sổ tay'}`}>
      <div className={styles.flashcardContainer}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleBackNavigation}
          >
            ← Trở lại
          </button>
          <h1 className={styles.title}>{notebook?.name || 'Đang tải...'}</h1>
          <div className={styles.headerActions}>
            <button 
              className={styles.settingsButton}
              onClick={handleOpenSettings}
              title="Cài đặt thẻ học"
            >
              ⚙️
            </button>
            <div className={styles.progress}>
              {!loading && words.length > 0 ? (
                <span>{currentIndex + 1} / {words.length}</span>
              ) : (
                <span>Đang tải...</span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingIndicator}>Đang tải flashcards...</div>
        ) : words.length > 0 ? (
          <div className={styles.cardWrapper}>
            <div 
              className={`${styles.flashcard} ${showMeaning ? styles.flipped : ''}`}
              onClick={handleFlipCard}
            >
              <div className={styles.cardFront}>
                {settings.frontSide.showWord && (
                  <div lang="th" className={`${styles.cardWord} word-thai`}>
                    {words[currentIndex].word}
                  </div>
                )}
                {settings.frontSide.showPhonetic && words[currentIndex].phonetic && (
                  <div className={styles.cardPhonetic}>{words[currentIndex].phonetic}</div>
                )}
                {settings.frontSide.showMeaning && (
                  <div className={styles.cardMeaning}>
                    {words[currentIndex].vietnamese_meaning}
                  </div>
                )}
                {shouldShowFallbackMessage('frontSide') && (
                  <div className={styles.cardFallback}>Nhấn để xem mặt sau</div>
                )}
                <div className={styles.cardHint}>Nhấn để lật thẻ</div>
              </div>
              <div className={styles.cardBack}>
                {settings.backSide.showWord && (
                  <div lang="th" className={`${styles.cardWord} word-thai`}>
                    {words[currentIndex].word}
                  </div>
                )}
                {settings.backSide.showPhonetic && words[currentIndex].phonetic && (
                  <div className={styles.cardPhonetic}>{words[currentIndex].phonetic}</div>
                )}
                {settings.backSide.showMeaning && (
                  <div className={styles.cardMeaning}>
                    {words[currentIndex].vietnamese_meaning}
                  </div>
                )}
                {shouldShowFallbackMessage('backSide') && (
                  <div className={styles.cardFallback}>Không có thông tin để hiển thị</div>
                )}
                {words[currentIndex].note && (
                  <div className={styles.cardNote}>{words[currentIndex].note}</div>
                )}
                <div className={styles.cardHint}>Nhấn để lật thẻ</div>
              </div>
            </div>

            <div className={styles.cardControls}>
              <button 
                className={styles.controlButton} 
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
              >
                ← Trước
              </button>
              <button
                className={styles.controlButton}
                onClick={handleNextCard}
                disabled={currentIndex === words.length - 1}
              >
                Tiếp →
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyNotebook}>
            <p>Sổ tay này chưa có từ nào. Thêm từ để bắt đầu học.</p>
            <button 
              className={styles.returnButton}
              onClick={() => navigate('/learning')}
            >
              Quay lại sổ tay
            </button>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
            <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
              <h3>Cài đặt thẻ học</h3>
              
              <div className={styles.settingsSection}>
                <h4>Mặt trước:</h4>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.frontSide.showWord}
                      onChange={(e) => setSettings({
                        ...settings,
                        frontSide: {
                          ...settings.frontSide,
                          showWord: e.target.checked
                        }
                      })}
                    /> Hiển thị từ
                  </label>
                </div>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.frontSide.showPhonetic}
                      onChange={(e) => setSettings({
                        ...settings,
                        frontSide: {
                          ...settings.frontSide,
                          showPhonetic: e.target.checked
                        }
                      })}
                    /> Hiển thị phiên âm
                  </label>
                </div>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.frontSide.showMeaning}
                      onChange={(e) => setSettings({
                        ...settings,
                        frontSide: {
                          ...settings.frontSide,
                          showMeaning: e.target.checked
                        }
                      })}
                    /> Hiển thị nghĩa
                  </label>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4>Mặt sau:</h4>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.backSide.showWord}
                      onChange={(e) => setSettings({
                        ...settings,
                        backSide: {
                          ...settings.backSide,
                          showWord: e.target.checked
                        }
                      })}
                    /> Hiển thị từ
                  </label>
                </div>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.backSide.showPhonetic}
                      onChange={(e) => setSettings({
                        ...settings,
                        backSide: {
                          ...settings.backSide,
                          showPhonetic: e.target.checked
                        }
                      })}
                    /> Hiển thị phiên âm
                  </label>
                </div>
                <div className={styles.settingOption}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.backSide.showMeaning}
                      onChange={(e) => setSettings({
                        ...settings,
                        backSide: {
                          ...settings.backSide,
                          showMeaning: e.target.checked
                        }
                      })}
                    /> Hiển thị nghĩa
                  </label>
                </div>
              </div>

              <div className={styles.settingsActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowSettingsModal(false)}
                >
                  Hủy
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={() => saveSettings(settings)}
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default FlashcardMode;