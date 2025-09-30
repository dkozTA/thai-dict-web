import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';
import { getTranslationFeedback, updateTranslationFeedback } from '../../services/adminApi';
import ThaiWord from '../../components/common/ThaiWord';

const TranslationFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved', 'ignored'
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTranslationFeedback(filter);
        setFeedback(data);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
        setError('Failed to load translation feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [filter]);
  
  // View feedback details
  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    setAdminNote(item.adminNote || '');
    setShowDetailModal(true);
  };
  
  // Update feedback status
  const handleUpdateStatus = async (status) => {
    if (processing || !selectedFeedback) return;
    
    try {
      setProcessing(true);
      await updateTranslationFeedback(selectedFeedback.id, status, adminNote);
      
      // Update local state
      setFeedback(feedback.map(item => 
        item.id === selectedFeedback.id 
          ? {...item, status, adminNote} 
          : item
      ));
      
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating feedback status:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  // Format date helper function
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Get appropriate class for status badges
  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved': return styles.statusApproved;
      case 'ignored': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };
  
  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Quản lý phản hồi dịch thuật</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.adminActions}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setFilter('pending')}
          >
            Đang chờ xử lý
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'resolved' ? styles.activeTab : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Đã xử lý
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'ignored' ? styles.activeTab : ''}`}
            onClick={() => setFilter('ignored')}
          >
            Bỏ qua
          </button>
        </div>
        
        <button 
          className={styles.refreshBtn}
          onClick={() => setFilter(filter)} // This will trigger a refetch
        >
          🔄 Làm mới
        </button>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Từ/văn bản gốc</th>
                <th>Bản dịch</th>
                <th>Người góp ý</th>
                <th>Ngày góp ý</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {feedback.length > 0 ? feedback.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.sourceLanguage === 'thai' ? (
                      <div className={styles.thaiWord}>
                        <ThaiWord text={item.originalText} />
                      </div>
                    ) : (
                      <div>{item.originalText}</div>
                    )}
                  </td>
                  <td>
                    {item.sourceLanguage === 'vietnamese' ? (
                      <div className={styles.thaiWord}>
                        <ThaiWord text={item.translatedText} />
                      </div>
                    ) : (
                      <div>{item.translatedText}</div>
                    )}
                  </td>
                  <td>{item.userId === 'anonymous' ? 'Khách' : item.userId}</td>
                  <td>{formatDate(item.timestamp)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(item.status || 'pending')}`}>
                      {item.status === 'resolved' ? 'Đã xử lý' : 
                       item.status === 'ignored' ? 'Bỏ qua' : 'Đang chờ'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => handleViewDetails(item)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className={styles.noResults}>Không có phản hồi dịch thuật nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết phản hồi dịch thuật</h3>
            
            <div className={styles.suggestionDetail}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Ngôn ngữ nguồn:</div>
                <div className={styles.detailValue}>
                  {selectedFeedback.sourceLanguage === 'thai' ? 'Tiếng Thái' : 'Tiếng Việt'}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Văn bản gốc:</div>
                <div className={styles.detailValue}>
                  {selectedFeedback.sourceLanguage === 'thai' ? (
                    <div className={styles.thaiWord}>
                      <ThaiWord text={selectedFeedback.originalText} />
                    </div>
                  ) : (
                    selectedFeedback.originalText
                  )}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Bản dịch:</div>
                <div className={styles.detailValue}>
                  {selectedFeedback.sourceLanguage === 'vietnamese' ? (
                    <div className={styles.thaiWord}>
                      <ThaiWord text={selectedFeedback.translatedText} />
                    </div>
                  ) : (
                    selectedFeedback.translatedText
                  )}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Phản hồi của người dùng:</div>
                <div className={styles.detailValue}>
                  {selectedFeedback.feedback}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Ghi chú của admin:</div>
                <div className={styles.detailValue}>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Thêm ghi chú..."
                    className={styles.formTextarea}
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.rejectBtn}
                onClick={() => handleUpdateStatus('ignored')}
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Bỏ qua'}
              </button>
              <button 
                className={styles.approveBtn}
                onClick={() => handleUpdateStatus('resolved')}
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Đã xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationFeedback;