import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/common/Pagelayout';
import NotebookPicker from '../components/common/NotebookPicker';
import styles from '../styles/Learning.module.css';
import { getUser, createNotebook, updateWordInNotebook } from '../services/userApi';

const PAGE_SIZE = 12;

const Learning = () => {
  const [userNotebooks, setUserNotebooks] = useState({});
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [activeMode, setActiveMode] = useState('flashcard');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingNb, setLoadingNb] = useState(false);
  
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
          {[1,2].map(i => (
            <div key={i} className={`${styles.nbCard} ${styles.discoverCard}`}>
              <div className={styles.nbName}>Note mẫu {i}</div>
              <div className={styles.nbMetaRow}>
                <span>{(i*10)} từ</span>
                <span>• TV</span>
              </div>
              <div className={styles.nbDate}>Lượt xem: {(i*1000)+231}</div>
            </div>
          ))}
          <div className={styles.nbPlaceholder}>Sẽ hiển thị sổ tay công khai của người khác…</div>
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
              <h2 className={styles.detailTitle}>{currentNotebook.name}</h2>
              <div className={styles.detailSub}>
                {wordsArray.length} từ • Cập nhật {formatDate(currentNotebook.updated_at)}
              </div>
            </div>
          </div>
          <div className={styles.modeTabs}>
            {['flashcard','quiz','more','miniTest'].map(mode => (
              <button
                key={mode}
                type="button"
                className={`${styles.modeTab} ${activeMode===mode ? styles.modeTabActive : ''}`}
                onClick={()=>setActiveMode(mode)}
              >
                {{
                  flashcard: 'Flashcard',
                  quiz: 'Quizz',
                  more: '…',
                  miniTest: 'miniTest'
                }[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.wordsPanel}>
          <div className={styles.wordsHeaderRow}>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <span className={styles.wordsHeaderLabel}>Từ vựng</span>
            <button className={styles.editIconBtn} title="Chế độ chỉnh sửa">✎</button>
          </div>

          <div className={styles.wordsGrid}>
            {pagedWords.map(w => (
              <div key={w.id} className={styles.wordCard}>
                <div className={styles.wordLineTop}>
                  <span className={styles.wordMain}>{w.word}</span>
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

        <div className={styles.modeInfoBox}>
          {activeMode === 'flashcard' && <p>Chế độ Flashcard (sắp hoàn thiện).</p>}
          {activeMode === 'quiz' && <p>Chế độ Quizz (sắp hoàn thiện).</p>}
          {activeMode === 'more' && <p>Tính năng khác (đang chuẩn bị).</p>}
          {activeMode === 'miniTest' && <p>Mini Test (sắp hoàn thiện).</p>}
        </div>
      </div>
    );
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
    </PageLayout>
  );
};

export default Learning;