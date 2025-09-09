import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Admin.module.css';
import { getUserSuggestions, approveSuggestion, rejectSuggestion } from '../../services/adminApi';
import ThaiWord from '../../components/common/ThaiWord';

const SuggestionsManagement = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Fetch suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load suggestions on component mount
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);
  
  // Filter suggestions based on status
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.status === filter;
  });

  // Handle approving a suggestion
  const handleApprove = async (suggestionId) => {
    if (processingAction) return;
    
    try {
      setProcessingAction(true);
      const response = await approveSuggestion(suggestionId);
      
      if (response.success) {
        // Update the suggestion in the local state
        setSuggestions(suggestions.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, status: 'approved' } 
            : suggestion
        ));
        setShowDetailModal(false);
      } else {
        setError(response.message || 'Failed to approve suggestion');
      }
    } catch (error) {
      console.error('Error approving suggestion:', error);
      setError('Error approving suggestion. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Handle rejecting a suggestion
  const handleReject = async (suggestionId) => {
    if (processingAction) return;
    
    try {
      setProcessingAction(true);
      const response = await rejectSuggestion(suggestionId);
      
      if (response.success) {
        // Update the suggestion in the local state
        setSuggestions(suggestions.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, status: 'rejected' } 
            : suggestion
        ));
        setShowDetailModal(false);
      } else {
        setError(response.message || 'Failed to reject suggestion');
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      setError('Error rejecting suggestion. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };
  
  // View suggestion details
  const viewDetails = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowDetailModal(true);
  };
  
  return (
    <div className={styles.adminPage}>
      <h1 className={styles.adminTitle}>Quản lý góp ý từ người dùng</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.adminActions}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${filter === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setFilter('pending')}
          >
            Đang chờ duyệt
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setFilter('approved')}
          >
            Đã chấp nhận
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'rejected' ? styles.activeTab : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Đã từ chối
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
        </div>
        
        <button 
          className={styles.refreshBtn}
          onClick={fetchSuggestions}
          disabled={loading}
        >
          🔄 Làm mới
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
                  <th>Loại góp ý</th>
                  <th>Từ / Nội dung</th>
                  <th>Người đóng góp</th>
                  <th>Ngày góp ý</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuggestions.map((suggestion) => (
                  <tr key={suggestion.id}>
                    <td>{suggestion.type === 'new_word' ? 'Thêm từ mới' : 'Sửa từ'}</td>
                    <td className={styles.thaiWord}>
                      {suggestion.word && (
                        <ThaiWord text={suggestion.word.word || suggestion.word} />
                      )}
                    </td>
                    <td>{suggestion.user?.displayName || suggestion.user?.email || 'Người dùng ẩn danh'}</td>
                    <td>{formatDate(suggestion.created_at)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(suggestion.status)}`}>
                        {suggestion.status === 'approved' && 'Đã duyệt'}
                        {suggestion.status === 'rejected' && 'Đã từ chối'}
                        {suggestion.status === 'pending' && 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => viewDetails(suggestion)}
                      >
                        Xem chi tiết
                      </button>
                      {suggestion.status === 'pending' && (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleApprove(suggestion.id)}
                          >
                            Duyệt
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleReject(suggestion.id)}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSuggestions.length === 0 && (
                  <tr>
                    <td colSpan="6" className={styles.noResults}>Không có góp ý nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Suggestion Detail Modal */}
      {showDetailModal && selectedSuggestion && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết góp ý</h2>
            
            <div className={styles.suggestionDetail}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Loại góp ý:</div>
                <div className={styles.detailValue}>
                  {selectedSuggestion.type === 'new_word' ? 'Thêm từ mới' : 'Sửa từ hiện có'}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Người đóng góp:</div>
                <div className={styles.detailValue}>
                  {selectedSuggestion.user?.displayName || selectedSuggestion.user?.email || 'Người dùng ẩn danh'}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Ngày góp ý:</div>
                <div className={styles.detailValue}>
                  {formatDate(selectedSuggestion.created_at)}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Trạng thái:</div>
                <div className={styles.detailValue}>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedSuggestion.status)}`}>
                    {selectedSuggestion.status === 'approved' && 'Đã duyệt'}
                    {selectedSuggestion.status === 'rejected' && 'Đã từ chối'}
                    {selectedSuggestion.status === 'pending' && 'Chờ duyệt'}
                  </span>
                </div>
              </div>
              
              {selectedSuggestion.type === 'edit_word' && (
                <div className={styles.comparisonContainer}>
                  <div className={styles.comparisonColumn}>
                    <h3>Từ hiện tại</h3>
                    <div className={styles.wordCard}>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Từ tiếng Thái:</span>
                        <span className={styles.thaiWord}>{selectedSuggestion.original?.word || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Phiên âm:</span>
                        <span>{selectedSuggestion.original?.word_transliterated || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Nghĩa tiếng Việt:</span>
                        <span>{selectedSuggestion.original?.vietnamese_meaning || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Danh mục:</span>
                        <span>{selectedSuggestion.original?.category || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonColumn}>
                    <h3>Đề xuất sửa</h3>
                    <div className={styles.wordCard}>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Từ tiếng Thái:</span>
                        <span className={styles.thaiWord}>{selectedSuggestion.word?.word || selectedSuggestion.word || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Phiên âm:</span>
                        <span>{selectedSuggestion.word?.word_transliterated || selectedSuggestion.word_transliterated || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Nghĩa tiếng Việt:</span>
                        <span>{selectedSuggestion.word?.vietnamese_meaning || selectedSuggestion.vietnamese_meaning || 'N/A'}</span>
                      </div>
                      <div className={styles.wordField}>
                        <span className={styles.fieldLabel}>Danh mục:</span>
                        <span>{selectedSuggestion.word?.category || selectedSuggestion.category || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedSuggestion.type === 'new_word' && (
                <div className={styles.newWordContainer}>
                  <h3>Từ mới đề xuất</h3>
                  <div className={styles.wordCard}>
                    <div className={styles.wordField}>
                      <span className={styles.fieldLabel}>Từ tiếng Thái:</span>
                      <span className={styles.thaiWord}>{selectedSuggestion.word?.word || selectedSuggestion.word || 'N/A'}</span>
                    </div>
                    <div className={styles.wordField}>
                      <span className={styles.fieldLabel}>Phiên âm:</span>
                      <span>{selectedSuggestion.word?.word_transliterated || selectedSuggestion.word_transliterated || 'N/A'}</span>
                    </div>
                    <div className={styles.wordField}>
                      <span className={styles.fieldLabel}>Nghĩa tiếng Việt:</span>
                      <span>{selectedSuggestion.word?.vietnamese_meaning || selectedSuggestion.vietnamese_meaning || 'N/A'}</span>
                    </div>
                    <div className={styles.wordField}>
                      <span className={styles.fieldLabel}>Danh mục:</span>
                      <span>{selectedSuggestion.word?.category || selectedSuggestion.category || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Ghi chú:</div>
                <div className={styles.detailValue}>
                  {selectedSuggestion.note || 'Không có ghi chú'}
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              
              {selectedSuggestion.status === 'pending' && (
                <>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => handleReject(selectedSuggestion.id)}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Đang xử lý...' : 'Từ chối'}
                  </button>
                  <button 
                    className={styles.approveBtn}
                    onClick={() => handleApprove(selectedSuggestion.id)}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Đang xử lý...' : 'Duyệt'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsManagement;