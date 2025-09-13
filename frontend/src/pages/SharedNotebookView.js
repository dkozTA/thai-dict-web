import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/common/Pagelayout';
import ThaiWord from '../components/common/ThaiWord';
import styles from '../styles/SharedNotebook.module.css';
import { getSharedNotebook } from '../services/userApi';

const PAGE_SIZE = 12; // Match the same page size as Learning.js

const SharedNotebookView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        setLoading(true);
        const data = await getSharedNotebook(id);
        
        // Convert words from object to array if needed
        if (data && data.words && typeof data.words === 'object' && !Array.isArray(data.words)) {
          data.words = Object.values(data.words);
        }
        
        setNotebook(data);
        setError('');
      } catch (error) {
        console.error('Error fetching shared notebook:', error);
        setError('Không thể tải sổ tay chia sẻ. Có thể sổ tay đã bị xóa hoặc không còn được chia sẻ.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotebook();
  }, [id]);
  
  // Sort words by added_at (newest first)
  const wordsArray = useMemo(() => {
    if (!notebook?.words) return [];
    return [...notebook.words].sort((a, b) => (b.added_at || 0) - (a.added_at || 0));
  }, [notebook]);
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(wordsArray.length / PAGE_SIZE));
  const pagedWords = useMemo(() => 
    wordsArray.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [wordsArray, currentPage]
  );
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let pages = [];
    if (totalPages <= 7) {
      pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 'gap-end', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, 'gap-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, 'gap-start', currentPage - 1, currentPage, currentPage + 1, 'gap-end', totalPages];
      }
    }
    
    return (
      <div className={styles.paginationBar}>
        {pages.map((p, idx) => {
          if (p === 'gap-start' || p === 'gap-end') {
            return <span key={idx} className={styles.pageGap}>…</span>;
          }
          return (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(p)}
            >{p}</button>
          );
        })}
      </div>
    );
  };
  
  if (loading) {
    return (
      <PageLayout title="Sổ tay chia sẻ">
        <div className={styles.sharedNotebookContainer}>
          <div className={styles.loading}>Đang tải sổ tay...</div>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !notebook) {
    return (
      <PageLayout title="Sổ tay chia sẻ">
        <div className={styles.sharedNotebookContainer}>
          <div className={styles.error}>
            {error || 'Không tìm thấy sổ tay.'}
            <button 
              className={styles.backButton}
              onClick={() => navigate('/learning')}
            >
              Quay lại
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title={notebook.name || 'Sổ tay chia sẻ'}>
      <div className={styles.sharedNotebookContainer}>
        <div className={styles.detailWrapper}>
          <div className={styles.detailHeader}>
            <div className={styles.detailLeft}>
              <button className={styles.backBtn} onClick={() => navigate('/learning')}>←</button>
              <div>
                <h2 className={styles.detailTitle}>{notebook.name}</h2>
                <div className={styles.detailSub}>
                  {wordsArray.length} từ • Chia sẻ bởi: {notebook.ownerName || 'Ẩn danh'}
                  {notebook.description && <p className={styles.description}>{notebook.description}</p>}
                </div>
              </div>
            </div>
            <div className={styles.detailRight}>
              <Link
                to={`/shared-notebook/${id}/quiz`}
                className={styles.learnBtn}
              >
                Quiz
              </Link>
              <Link
                to={`/shared-notebook/${id}/flashcard`}
                className={styles.learnBtn}
              >
                Flashcard
              </Link>
            </div>
          </div>

          <div className={styles.wordsPanel}>
            <div className={styles.wordsHeaderRow}>
              <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            </div>

            <div className={styles.wordsGrid}>
              {pagedWords.map((word, index) => (
                <div key={index} className={styles.wordCard}>
                  <div className={styles.wordLineTop}>
                    <span className={`${styles.wordMain} word-thai`} lang="th">{word.word}</span>
                    {word.phonetic && <span className={styles.wordPhonetic}>({word.phonetic})</span>}
                  </div>
                  <div className={styles.wordMeaning}>{word.vietnamese_meaning}</div>
                  {word.note && <div className={styles.wordNote}>Ghi chú: {word.note}</div>}
                </div>
              ))}
              
              {pagedWords.length === 0 && (
                <div className={styles.emptyWords}>Sổ tay này không có từ nào.</div>
              )}
            </div>

            {renderPagination()}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SharedNotebookView;