import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/Pagelayout';
import ThaiWord from '../../components/common/ThaiWord';
import styles from '../../styles/QuizMode.module.css';
import { getUser, getSharedNotebook } from '../../services/userApi';

const QuizMode = ({ isShared }) => {
  const params = useParams();
  const notebookId = params.id || params.notebookId;
  const navigate = useNavigate();
  
  // State variables
  const [notebook, setNotebook] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizMode, setQuizMode] = useState('thaiToVietnamese'); // or vietnameseToThai
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    mode: 'thaiToVietnamese', // or 'vietnameseToThai'
  });
  
  // User results
  const [userAnswers, setUserAnswers] = useState([]);
  
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
        setAllWords(wordsArray);
      } catch (error) {
        console.error('Failed to load notebook:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [notebookId, navigate, isShared]);
  
  // Generate quiz questions
  const questions = useMemo(() => {
    if (allWords.length < 4) return [];
    
    // Shuffle all words
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    
    // Take only the number of questions specified in settings
    const questionWords = shuffled.slice(0, Math.min(quizSettings.questionCount, shuffled.length));
    
    return questionWords.map(word => {
      // For each question word, generate 3 wrong answers (distractors)
      const distractors = shuffled
        .filter(w => w.id !== word.id)
        .slice(0, 3);
      
      const options = [
        ...(quizSettings.mode === 'thaiToVietnamese' 
          ? [{ id: word.id, text: word.vietnamese_meaning }] 
          : [{ id: word.id, text: word.word }]),
        ...(quizSettings.mode === 'thaiToVietnamese'
          ? distractors.map(d => ({ id: d.id, text: d.vietnamese_meaning }))
          : distractors.map(d => ({ id: d.id, text: d.word })))
      ];
      
      // Shuffle options
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      
      return {
        word: word,
        question: quizSettings.mode === 'thaiToVietnamese' ? word.word : word.vietnamese_meaning,
        correctAnswerId: word.id,
        options: shuffledOptions
      };
    });
  }, [allWords, quizSettings.mode, quizSettings.questionCount]);
  
  // Handle starting the quiz
  const handleStartQuiz = () => {
    setQuizMode(quizSettings.mode);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setQuizCompleted(false);
    setUserAnswers([]);
    setQuizStarted(true);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (selectedOption !== null) return; // Already answered
    
    setSelectedOption(optionId);
    const isCorrect = optionId === questions[currentQuestion].correctAnswerId;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setUserAnswers([...userAnswers, {
      question: currentQuestion,
      selectedOptionId: optionId,
      correct: isCorrect
    }]);
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setQuizCompleted(true);
        setShowResult(true);
      }
    }, 1000);
  };
  
  // Reset quiz
  const handleReset = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setQuizCompleted(false);
    setUserAnswers([]);
  };
  
  // Toggle settings modal
  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Save settings
  const handleSaveSettings = () => {
    setShowSettings(false);
  };
  
  // Render start screen
  const renderStartScreen = () => (
    <div className={styles.startScreen}>
      <h2>Trắc nghiệm từ vựng</h2>
      <p>Sổ tay: <strong>{notebook?.name}</strong></p>
      <p>Số từ: <strong>{allWords.length}</strong> từ</p>
      <p>Số câu hỏi: <strong>{Math.min(quizSettings.questionCount, allWords.length)}</strong> câu</p>
      <p>Chế độ: <strong>{quizSettings.mode === 'thaiToVietnamese' ? 'Thái → Việt' : 'Việt → Thái'}</strong></p>
      
      <div className={styles.startActions}>
        <button 
          className={styles.settingsButton}
          onClick={handleToggleSettings}
        >
          ⚙️ Cài đặt
        </button>
        
        <button 
          className={styles.startButton} 
          onClick={handleStartQuiz}
          disabled={allWords.length < 4}
        >
          Bắt đầu làm bài
        </button>
      </div>
      
      {allWords.length < 4 && (
        <p className={styles.warning}>
          Cần ít nhất 4 từ trong sổ tay để tạo câu hỏi trắc nghiệm.
        </p>
      )}
    </div>
  );
  
  // Render question
  const renderQuestion = () => {
    if (questions.length === 0) return null;
    
    const currentQ = questions[currentQuestion];
    const isThaiToViet = quizMode === 'thaiToVietnamese';
    
    return (
      <div className={styles.questionContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        <div className={styles.questionHeader}>
          <span>Câu {currentQuestion + 1}/{questions.length}</span>
          <span>Điểm: {score}</span>
        </div>
        
        <div className={styles.question}>
          {isThaiToViet ? (
            <div lang="th" className={`${styles.thaiQuestion} word-thai`}>
              <ThaiWord text={currentQ.question} />
            </div>
          ) : (
            <div className={styles.vietQuestion}>
              {currentQ.question}
            </div>
          )}
          
          {isThaiToViet && currentQ.word.phonetic && (
            <div className={styles.phonetic}>
              ({currentQ.word.phonetic})
            </div>
          )}
        </div>
        
        <div className={styles.optionsGrid}>
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className={`${styles.optionButton} 
                ${selectedOption === option.id ? 
                  (option.id === currentQ.correctAnswerId ? styles.correctOption : styles.wrongOption) : 
                  ''}`}
              onClick={() => handleOptionSelect(option.id)}
              disabled={selectedOption !== null}
            >
              {isThaiToViet ? (
                <span>{option.text}</span>
              ) : (
                <span lang="th" className="word-thai">
                  <ThaiWord text={option.text} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render results
  const renderResults = () => (
    <div className={styles.resultsContainer}>
      <h2 className={styles.resultsTitle}>Kết quả</h2>
      
      <div className={styles.scoreCircle}>
        <div className={styles.scoreNumber}>{score}</div>
        <div className={styles.scoreTotal}>/{questions.length}</div>
      </div>
      
      <div className={styles.scorePercentage}>
        {Math.round((score / questions.length) * 100)}%
      </div>
      
      <p className={styles.resultMessage}>
        {score === questions.length ? '🎉 Tuyệt vời! Bạn trả lời đúng tất cả!' : 
         score >= questions.length * 0.7 ? '👍 Khá tốt! Hãy tiếp tục cố gắng!' :
         'Hãy ôn tập thêm nhé!'}
      </p>
      
      <div className={styles.resultActions}>
        <button 
          className={styles.restartButton}
          onClick={handleReset}
        >
          Làm lại
        </button>
        
        <button 
          className={styles.backButton}
          onClick={handleBackNavigation}
        >
          Trở về sổ tay
        </button>
      </div>
    </div>
  );
  
  // Render settings modal
  const renderSettingsModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
      <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <h3>Cài đặt trắc nghiệm</h3>
        
        <div className={styles.settingsGroup}>
          <label className={styles.settingsLabel}>
            Số câu hỏi:
            <select 
              value={quizSettings.questionCount} 
              onChange={(e) => setQuizSettings({...quizSettings, questionCount: Number(e.target.value)})}
              className={styles.settingsSelect}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
        
        <div className={styles.settingsGroup}>
          <label className={styles.settingsLabel}>Chế độ:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                name="mode"
                checked={quizSettings.mode === 'thaiToVietnamese'}
                onChange={() => setQuizSettings({...quizSettings, mode: 'thaiToVietnamese'})}
              /> 
              Thái → Việt
            </label>
            
            <label className={styles.radioLabel}>
              <input 
                type="radio" 
                name="mode"
                checked={quizSettings.mode === 'vietnameseToThai'}
                onChange={() => setQuizSettings({...quizSettings, mode: 'vietnameseToThai'})}
              /> 
              Việt → Thái
            </label>
          </div>
        </div>
        
        <div className={styles.settingsActions}>
          <button 
            className={styles.saveButton}
            onClick={handleSaveSettings}
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );

  const handleBackNavigation = () => {
    if (isShared) {
      navigate(`/shared-notebook/${notebookId}`);
    } else {
      navigate('/learning');
    }
  };

  return (
    <PageLayout title={`Quiz: ${notebook?.name || 'Sổ tay'}`}>
      <div className={styles.quizContainer}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleBackNavigation}
          >
            ← Trở lại
          </button>
          <h1 className={styles.title}>{notebook?.name || 'Đang tải...'}</h1>
        </div>
        
        {loading ? (
          <div className={styles.loadingIndicator}>Đang tải...</div>
        ) : (
          <>
            {!quizStarted && renderStartScreen()}
            {quizStarted && !showResult && renderQuestion()}
            {showResult && renderResults()}
          </>
        )}
        
        {showSettings && renderSettingsModal()}
      </div>
    </PageLayout>
  );
};

export default QuizMode;