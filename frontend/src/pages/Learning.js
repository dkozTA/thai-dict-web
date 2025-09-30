import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/common/Pagelayout';
import NotebookPicker from '../components/common/NotebookPicker';
import styles from '../styles/Learning.module.css';
import { firestore } from '../services/firebase';
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { 
  getUser, 
  createNotebook, 
  updateWordInNotebook, 
  updateNotebookName, 
  deleteNotebook, 
  shareNotebook,       
  unshareNotebook,     
  getSharedNotebooks   
} from '../services/userApi';

const PAGE_SIZE = 12;

const Learning = () => {
  const navigate = useNavigate();
  const [userNotebooks, setUserNotebooks] = useState({});
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [activeMode, setActiveMode] = useState('flashcard');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingNb, setLoadingNb] = useState(false);
  const [showEditNotebookModal, setShowEditNotebookModal] = useState(false);
  const [editNotebookData, setEditNotebookData] = useState({
    id: '',
    name: ''
  });
  const [updatingNotebook, setUpdatingNotebook] = useState(false);

  // Sharing notebook states
  const [isShared, setIsShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    visibility: 'public',
    description: ''
  });
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [sharedNotebooks, setSharedNotebooks] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);
  
  // Create notebook modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [creatingNotebook, setCreatingNotebook] = useState(false);

  // Edit word states
  const [editingWord, setEditingWord] = useState(null);
  const [editWordData, setEditWordData] = useState({
    word: '',
    vietnamese_meaning: '',
    phonetic: '',
    note: ''
  });

  // ...existing formatDate function...
  const formatDate = (timestamp) => {
    try {
      let date;
      
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      }
      else if (timestamp) {
        date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          date = new Date();
        }
      }
      else {
        date = new Date();
      }
      
      return date.toISOString().slice(0,10);
    } catch (error) {
      return new Date().toISOString().slice(0,10);
    }
  };

  // ...existing useEffect and useMemo...
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    (async () => {
      setLoadingNb(true);
      try {
        const doc = await getUser(userId).catch(()=>null);
        if (doc?.notebooks) setUserNotebooks(doc.notebooks);
      } finally {
        setLoadingNb(false);
      }
    })();
      fetchSharedNotebooks();
  }, []);

  const notebooksArray = useMemo(
    () => Object.values(userNotebooks || {}).sort((a,b)=> (b.updated_at || 0) - (a.updated_at || 0)),
    [userNotebooks]
  );

  const currentNotebook = selectedNotebookId ? userNotebooks[selectedNotebookId] : null;
  const wordsArray = useMemo(() => {
    if (!currentNotebook?.words) return [];
    return Object.values(currentNotebook.words).sort((a,b)=> (b.added_at || 0) - (a.added_at || 0));
  }, [currentNotebook]);

  const totalPages = Math.max(1, Math.ceil(wordsArray.length / PAGE_SIZE));
  const pagedWords = useMemo(
    () => wordsArray.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE),
    [wordsArray, currentPage]
  );

  const checkIfShared = useCallback(async (notebookId) => {
    if (!notebookId) return;
    
    try {
      const q = query(
        collection(firestore, 'shared_notebooks'),
        where('notebookId', '==', notebookId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      setIsShared(!snapshot.empty);
    } catch (error) {
      console.error('Error checking if notebook is shared:', error);
    }
  }, []);

  // Call this when notebook changes
  useEffect(() => {
    if (selectedNotebookId) {
      checkIfShared(selectedNotebookId);
    }
  }, [selectedNotebookId, checkIfShared]);

  // Add share/unshare functionality
  const handleShareNotebook = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !selectedNotebookId) return;
    
    setSharingInProgress(true);
    try {
      await shareNotebook(userId, selectedNotebookId, shareData);
      setShowShareModal(false);
      setIsShared(true);
      alert('Sổ tay đã được chia sẻ thành công!');
    } catch (error) {
      alert('Không thể chia sẻ sổ tay. Vui lòng thử lại.');
    } finally {
      setSharingInProgress(false);
    }
  };

const handleUnshareNotebook = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId || !selectedNotebookId) return;
  
  if (!window.confirm('Bạn có chắc muốn ngừng chia sẻ sổ tay này?')) {
    return;
  }
  
  setSharingInProgress(true);
    try {
      await unshareNotebook(userId, selectedNotebookId);
      setIsShared(false);
      alert('Đã ngừng chia sẻ sổ tay.');
    } catch (error) {
      alert('Không thể ngừng chia sẻ sổ tay. Vui lòng thử lại.');
    } finally {
      setSharingInProgress(false);
    }
  };

  const handleSelectNotebook = (id) => {
    setSelectedNotebookId(id);
    setActiveMode('flashcard');
    setCurrentPage(1);
  };

  // Create notebook functions
  const handleCreateNotebook = () => {
    setShowCreateModal(true);
    setNewNotebookName('');
  };

  const handleCreateNotebookSubmit = async () => {
    if (!newNotebookName.trim()) return;
    setCreatingNotebook(true);
    try {
      const userId = localStorage.getItem('userId');
      const nb = await createNotebook(userId, newNotebookName.trim());
      if (nb?.id) {
        setUserNotebooks(prev => ({ ...prev, [nb.id]: nb }));
        setShowCreateModal(false);
        setNewNotebookName('');
        setSelectedNotebookId(nb.id);
      }
    } finally {
      setCreatingNotebook(false);
    }
  };

  const handleEditNotebook = () => {
    setEditNotebookData({
      id: selectedNotebookId,
      name: currentNotebook?.name || ''
    });
    setShowEditNotebookModal(true);
  };

  const handleSaveNotebookEdit = async () => {
    if (!editNotebookData.id || !editNotebookData.name.trim()) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setUpdatingNotebook(true);
    try {
      // Update local state first for responsiveness
      setUserNotebooks(prev => ({
        ...prev,
        [editNotebookData.id]: {
          ...prev[editNotebookData.id],
          name: editNotebookData.name,
          updated_at: Date.now()
        }
      }));
      
      // We'll need to implement this function in userApi.js
      await updateNotebookName(userId, editNotebookData.id, editNotebookData.name);
      
      setShowEditNotebookModal(false);
    } catch (error) {
      console.error('Failed to update notebook:', error);
      alert('Lỗi khi cập nhật sổ tay. Vui lòng thử lại.');
    } finally {
      setUpdatingNotebook(false);
    }
  };

  const handleDeleteNotebook = async () => {
    if (!editNotebookData.id) return;
    
    if (!window.confirm('Bạn có chắc muốn xóa sổ tay này? Tất cả các từ trong sổ tay sẽ bị mất.')) {
      return;
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setUpdatingNotebook(true);
    try {
      // We'll need to implement this function in userApi.js
      await deleteNotebook(userId, editNotebookData.id);
      
      // Update local state
      const newNotebooks = { ...userNotebooks };
      delete newNotebooks[editNotebookData.id];
      setUserNotebooks(newNotebooks);
      
      setShowEditNotebookModal(false);
      setSelectedNotebookId(null); // Return to library view
    } catch (error) {
      console.error('Failed to delete notebook:', error);
      alert('Lỗi khi xóa sổ tay. Vui lòng thử lại.');
    } finally {
      setUpdatingNotebook(false);
    }
  };

  // Edit word functions
  const handleEditWord = (word) => {
    setEditingWord(word);
    setEditWordData({
      word: word.word || '',
      vietnamese_meaning: word.vietnamese_meaning || '',
      phonetic: word.phonetic || '',
      note: word.note || ''
    });
  };

  const handleSaveWordEdit = async () => {
    if (!editingWord) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await updateWordInNotebook(userId, selectedNotebookId, editingWord.id, editWordData);
      
      // Refresh notebooks data
      const doc = await getUser(userId);
      if (doc?.notebooks) {
        setUserNotebooks(doc.notebooks);
      }
      
      setEditingWord(null);
      console.log('Word updated successfully!');
    } catch (error) {
      console.error('Failed to update word:', error);
      
      // Show user-friendly error message
      if (error.response?.status === 404) {
        alert('Không tìm thấy từ hoặc sổ tay để cập nhật');
      } else {
        alert('Lỗi khi cập nhật từ. Vui lòng thử lại.');
      }
    }
  };

  // ...existing renderPagination function...
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxShow = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxShow - 1);
    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('gap-start');
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages) {
      if (end < totalPages -1) pages.push('gap-end');
      pages.push(totalPages);
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
              onClick={()=>setCurrentPage(p)}
            >{p}</button>
          );
        })}
      </div>
    );
  };

  /* ================= LIBRARY VIEW ================= */
  const renderLibraryView = () => (
    <div className={styles.libraryWrapper}>
      <section className={styles.sectionBlock}>
        <h3 className={styles.sectionHeading}>Sổ tay</h3>
        <div className={styles.notebookGrid}>
          <button className={`${styles.nbCard} ${styles.nbCreateCard}`} onClick={handleCreateNotebook} type="button">
            <span className={styles.plusSign}>+</span>
          </button>
          {loadingNb && <div className={styles.nbLoading}>Đang tải...</div>}
          {!loadingNb && notebooksArray.map(nb => {
            const count = Object.keys(nb.words || {}).length;
            return (
              <div
                key={nb.id}
                className={styles.nbCard}
                onClick={()=>handleSelectNotebook(nb.id)}
              >
                <div className={styles.nbName} title={nb.name}>{nb.name}</div>
                <div className={styles.nbMetaRow}>
                  <span>{count} từ</span>
                </div>
                <div className={styles.nbDate}>
                  Ngày tạo: {formatDate(nb.created_at || nb.updated_at)}
                </div>
              </div>
            );
          })}
          {!loadingNb && notebooksArray.length === 0 && (
            <div className={styles.nbEmptyMessage}>Chưa có sổ tay. Tạo mới để bắt đầu.</div>
          )}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <h3 className={styles.sectionHeading}>Khám phá</h3>
        <div className={styles.discoverGrid}>
          {loadingShared && <div className={styles.nbLoading}>Đang tải sổ tay chia sẻ...</div>}
          
          {!loadingShared && sharedNotebooks.length > 0 && sharedNotebooks.map(notebook => (
            <div 
              key={notebook.id} 
              className={`${styles.nbCard} ${styles.discoverCard}`}
              onClick={() => navigate(`/shared-notebook/${notebook.id}`)}
            >
              <div className={styles.nbName}>{notebook.name}</div>
              <div className={styles.nbMetaRow}>
                <span>{notebook.wordCount} từ</span>
                <span>• {notebook.ownerName}</span>
              </div>
              <div className={styles.nbDate}>Lượt xem: {notebook.views || 0}</div>
            </div>
          ))}
          
          {!loadingShared && sharedNotebooks.length === 0 && (
            <div className={styles.nbPlaceholder}>Chưa có sổ tay nào được chia sẻ</div>
          )}
        </div>
      </section>
    </div>
  );

  /* ================= NOTEBOOK DETAIL VIEW ================= */
  const renderNotebookDetail = () => {
    if (!currentNotebook) return null;
    return (
      <div className={styles.detailWrapper}>
        <div className={styles.detailHeader}>
          <div className={styles.detailLeft}>
            <button className={styles.backBtn} onClick={()=>setSelectedNotebookId(null)}>←</button>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.detailTitle}>{currentNotebook.name}</h2>
                <button 
                  className={styles.editNotebookBtn} 
                  onClick={handleEditNotebook}
                  title="Chỉnh sửa sổ tay"
                >
                  ✎
                </button>
              </div>
              <div className={styles.detailSub}>
                {wordsArray.length} từ • Cập nhật {formatDate(currentNotebook.updated_at)}
                {isShared && <span className={styles.sharedBadge}>• Đã chia sẻ</span>}
              </div>
            </div>
          </div>
          <div className={styles.detailRight}>
            <button
              className={isShared ? styles.unshareBtn : styles.shareBtn}
              onClick={isShared ? handleUnshareNotebook : () => setShowShareModal(true)}
              disabled={sharingInProgress}
            >
              {sharingInProgress ? '...' : (isShared ? 'Ngừng chia sẻ' : 'Chia sẻ')}
            </button>
            <Link
              to={`/learning/quiz/${selectedNotebookId}`}
              className={styles.learnBtn}
            >
              Quiz
            </Link>
            <Link
              to={`/learning/flashcard/${selectedNotebookId}`}
              className={styles.learnBtn}
            >
              Flashcard
            </Link>
          </div>
        </div>

        <div className={styles.wordsPanel}>
          <div className={styles.wordsHeaderRow}>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
          </div>

          <div className={styles.wordsGrid}>
            {pagedWords.map(w => (
              <div key={w.id} className={styles.wordCard}>
                <div className={styles.wordLineTop}>
                  <span className={`${styles.wordMain} word-thai`} lang="th">{w.word}</span>
                  {w.phonetic && <span className={styles.wordPhonetic}>({w.phonetic})</span>}
                </div>
                <div className={styles.wordMeaning}>{w.vietnamese_meaning}</div>
                {w.note && <div className={styles.wordNote}>Ghi chú: {w.note}</div>}
                
                {/* Edit button for each word */}
                <button 
                  className={styles.wordEditBtn}
                  onClick={() => handleEditWord(w)}
                  title="Chỉnh sửa từ"
                >
                  ✎
                </button>
              </div>
            ))}
            {pagedWords.length === 0 && (
              <div className={styles.emptyWords}>Chưa có từ trong sổ tay này.</div>
            )}
          </div>

          {renderPagination()}
        </div>
      </div>
    );
  };

  const fetchSharedNotebooks = async () => {
    setLoadingShared(true);
    try {
      const data = await getSharedNotebooks();
      setSharedNotebooks(data);
    } catch (error) {
      console.error('Error fetching shared notebooks:', error);
    } finally {
      setLoadingShared(false);
    }
  };

  return (
    <PageLayout title="Từ của tôi">
      <div className={styles.learningShell}>
        {!selectedNotebookId && renderLibraryView()}
        {selectedNotebookId && renderNotebookDetail()}
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.createModal} onClick={e => e.stopPropagation()}>
            <h3>Tạo sổ tay mới</h3>
            <input
              type="text"
              placeholder="Nhập tên sổ tay"
              value={newNotebookName}
              onChange={e => setNewNotebookName(e.target.value)}
              disabled={creatingNotebook}
              className={styles.createInput}
              autoFocus
            />
            <div className={styles.createActions}>
              <button
                type="button"
                className={styles.createCancel}
                onClick={() => setShowCreateModal(false)}
              >Hủy</button>
              <button
                type="button"
                className={styles.createSubmit}
                disabled={creatingNotebook || !newNotebookName.trim()}
                onClick={handleCreateNotebookSubmit}
              >
                {creatingNotebook ? 'Đang tạo...' : 'Tạo sổ tay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <div className={styles.modalOverlay} onClick={() => setEditingWord(null)}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <h3>Chỉnh sửa từ</h3>
            <div className={styles.editForm}>
              <div className={styles.editField}>
                <label>Từ Thai:</label>
                <input
                  type="text"
                  value={editWordData.word}
                  onChange={e => setEditWordData(prev => ({...prev, word: e.target.value}))}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.editField}>
                <label>Nghĩa tiếng Việt:</label>
                <textarea
                  value={editWordData.vietnamese_meaning}
                  onChange={e => setEditWordData(prev => ({...prev, vietnamese_meaning: e.target.value}))}
                  className={styles.editTextarea}
                  rows={3}
                />
              </div>
              <div className={styles.editField}>
                <label>Phiên âm:</label>
                <input
                  type="text"
                  value={editWordData.phonetic}
                  onChange={e => setEditWordData(prev => ({...prev, phonetic: e.target.value}))}
                  className={styles.editInput}
                />
              </div>
              <div className={styles.editField}>
                <label>Ghi chú:</label>
                <input
                  type="text"
                  value={editWordData.note}
                  onChange={e => setEditWordData(prev => ({...prev, note: e.target.value}))}
                  className={styles.editInput}
                />
              </div>
            </div>
            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.editCancel}
                onClick={() => setEditingWord(null)}
              >Hủy</button>
              <button
                type="button"
                className={styles.editSave}
                onClick={handleSaveWordEdit}
              >Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notebook Modal */}
      {showEditNotebookModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditNotebookModal(false)}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <h3>Chỉnh sửa sổ tay</h3>
            <div className={styles.editForm}>
              <div className={styles.editField}>
                <label>Tên sổ tay:</label>
                <input
                  type="text"
                  value={editNotebookData.name}
                  onChange={e => setEditNotebookData(prev => ({...prev, name: e.target.value}))}
                  className={styles.editInput}
                  disabled={updatingNotebook}
                />
              </div>
            </div>
            <div className={styles.editActionsFlex}>
              <button
                type="button"
                className={`${styles.deleteBtn}`}
                onClick={handleDeleteNotebook}
                disabled={updatingNotebook}
              >Xóa sổ tay</button>
              <div className={styles.rightActions}>
                <button
                  type="button"
                  className={styles.editCancel}
                  onClick={() => setShowEditNotebookModal(false)}
                  disabled={updatingNotebook}
                >Hủy</button>
                <button
                  type="button"
                  className={styles.editSave}
                  onClick={handleSaveNotebookEdit}
                  disabled={updatingNotebook || !editNotebookData.name.trim()}
                >
                  {updatingNotebook ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Notebook Modal */}
      {showShareModal && (
        <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
          <div className={styles.shareModal} onClick={e => e.stopPropagation()}>
            <h3>Chia sẻ sổ tay</h3>
            <div className={styles.shareForm}>
              <div className={styles.formField}>
                <label>Mô tả sổ tay (không bắt buộc):</label>
                <textarea
                  value={shareData.description}
                  onChange={e => setShareData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Thêm mô tả ngắn về sổ tay này..."
                  className={styles.shareTextarea}
                  rows={3}
                  disabled={sharingInProgress}
                />
              </div>
              <div className={styles.shareActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowShareModal(false)}
                  disabled={sharingInProgress}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.shareSubmitBtn}
                  onClick={handleShareNotebook}
                  disabled={sharingInProgress}
                >
                  {sharingInProgress ? 'Đang chia sẻ...' : 'Chia sẻ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Learning;