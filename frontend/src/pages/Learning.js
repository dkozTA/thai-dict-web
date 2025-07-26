import React, { useState } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Learning.module.css';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('flashcards');

  const flashcardCollections = [
    {
      id: 1,
      title: "Từ vựng cơ bản",
      description: "Từ vựng thường dùng hàng ngày",
      progress: 65,
      cardCount: 50
    },
    {
      id: 2,
      title: "Ẩm thực & Nhà hàng",
      description: "Từ vựng về đồ ăn và nhà hàng",
      progress: 30,
      cardCount: 40
    },
    {
      id: 3,
      title: "Du lịch & Giao thông",
      description: "Từ vựng cần thiết khi du lịch Thái Lan",
      progress: 80,
      cardCount: 35
    }
  ];

  const renderFlashcardsTab = () => (
    <div className={styles.flashcardsSection}>
      <h2>📚 Học với Flashcard</h2>
      <div className={styles.collections}>
        {flashcardCollections.map((collection) => (
          <div key={collection.id} className={styles.collectionCard}>
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
            <div className={styles.progress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${collection.progress}%`, backgroundColor: '#2c5aa0' }}
              ></div>
              <span>{collection.progress}% hoàn thành • {collection.cardCount} thẻ</span>
            </div>
            <button className={styles.studyButton}>
              Tiếp tục học
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuizTab = () => (
    <div className={styles.quizSection}>
      <h2>🧠 Kiểm tra kiến thức</h2>
      <div className={styles.quizOptions}>
        <div className={styles.quizCard}>
          <h3>📝 Trắc nghiệm</h3>
          <p>Chọn bản dịch tiếng Việt đúng cho từ tiếng Thái</p>
          <button className={styles.quizButton}>Bắt đầu</button>
        </div>
        <div className={styles.quizCard}>
          <h3>🔗 Ghép cặp</h3>
          <p>Ghép từ tiếng Thái với nghĩa tiếng Việt</p>
          <button className={styles.quizButton}>Bắt đầu</button>
        </div>
        <div className={styles.quizCard}>
          <h3>✍️ Luyện viết</h3>
          <p>Gõ bản dịch đúng cho từ đã cho</p>
          <button className={styles.quizButton}>Bắt đầu</button>
        </div>
      </div>
    </div>
  );

  const renderNotebookTab = () => (
    <div className={styles.notebookSection}>
      <h2>📖 Sổ tay cá nhân</h2>
      <div className={styles.notebookActions}>
        <button className={styles.createButton}>+ Tạo bộ sưu tập mới</button>
        <button className={styles.importButton}>📥 Nhập từ từ điển</button>
      </div>
      
      <div className={styles.savedCollections}>
        <div className={styles.notebookCard}>
          <h3>Từ yêu thích</h3>
          <p>Bộ sưu tập từ vựng quan trọng cá nhân</p>
          <p><strong>15 từ</strong> • Tạo 2 ngày trước</p>
          <div className={styles.cardActions}>
            <button className={styles.viewButton}>Xem</button>
            <button className={styles.editButton}>Sửa</button>
            <button className={styles.shareButton}>Chia sẻ</button>
          </div>
        </div>
        
        <div className={styles.notebookCard}>
          <h3>Tiếng Thái thương mại</h3>
          <p>Từ vựng chuyên ngành kinh doanh</p>
          <p><strong>28 từ</strong> • Tạo 1 tuần trước</p>
          <div className={styles.cardActions}>
            <button className={styles.viewButton}>Xem</button>
            <button className={styles.editButton}>Sửa</button>
            <button className={styles.shareButton}>Chia sẻ</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout title="Trung tâm học tập">
      <div className={styles.learningContent}>
        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'flashcards' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              📚 Flashcards
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'quiz' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              🧠 Kiểm tra
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'notebook' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('notebook')}
            >
              📖 Sổ tay
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'flashcards' && renderFlashcardsTab()}
            {activeTab === 'quiz' && renderQuizTab()}
            {activeTab === 'notebook' && renderNotebookTab()}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Learning;