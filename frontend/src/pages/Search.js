import React, { useState, useEffect } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Search.module.css';
import ThaiText from '../components/common/ThaiText';
import NotebookPicker from '../components/common/NotebookPicker';
import { searchThaiWords, getPopularWords } from '../services/dictionaryhandle';
import { containsThaiCharacters, containsVietnameseCharacters } from '../utils/textUtils';
import { addWordToNotebook, addSearchHistory, getUser, createNotebook } from '../services/userApi';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Từ vựng');
  const [results, setResults] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyWords, setHistoryWords] = useState([]);
  const [notebooks, setNotebooks] = useState({});
  const [showNotebookPicker, setShowNotebookPicker] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [newNotebookName, setNewNotebookName] = useState('');
  const [savingNotebook, setSavingNotebook] = useState(false);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      setHistoryWords(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    (async () => {
      const doc = await getUser(userId).catch(()=>null);
      if (doc) {
        if (doc.history?.search) {
          // merge remote search history with local (remote first)
          const merged = [...new Set([...(doc.history.search || []), ...historyWords])].slice(0,10);
          setHistoryWords(merged);
          localStorage.setItem('searchHistory', JSON.stringify(merged));
        }
        setNotebooks(doc.notebooks || {});
        if (!localStorage.getItem('defaultNotebookId')) {
          const first = Object.keys(doc.notebooks || {})[0];
          if (first) localStorage.setItem('defaultNotebookId', first);
        }
      }
    })();
  }, [historyWords]);

  // Auto select first result
  useEffect(() => {
    if (results.length > 0) {
      setSelectedWord(results[0]);
      setRelatedWords(results.slice(1, 6));
    } else {
      setSelectedWord(null);
      setRelatedWords([]);
    }
  }, [results]);

  const saveToHistory = (term) => {
    const next = [term, ...historyWords.filter(t => t !== term)].slice(0, 10);
    setHistoryWords(next);
    localStorage.setItem('searchHistory', JSON.stringify(next));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Nhập từ cần tìm');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Decide search type
      let searchType = 'all';
      if (selectedCategory === 'Từ vựng') {
        if (containsVietnameseCharacters(searchTerm)) searchType = 'meaning';
        else if (containsThaiCharacters(searchTerm)) searchType = 'word';
        else if (/^[a-zA-Z0-9\s\-(\(\))]+$/.test(searchTerm)) searchType = 'phonetic';
      }
      const data = await searchThaiWords(searchTerm, searchType);
      setResults(data);
      if (data.length > 0) {
        const wasNew = !historyWords.includes(searchTerm);
        saveToHistory(searchTerm);
        const userId = localStorage.getItem('userId');
        if (userId && wasNew) {
          try {
            await addSearchHistory(userId, searchTerm);
            console.log('Search history saved to backend');
          } catch (error) {
            console.error('Failed to save search history:', error);
          }
        }
      }
      if (data.length === 0) setError('Không tìm thấy kết quả');
    } catch (err) {
      console.error(err);
      setError('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrentWord = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Đăng nhập để lưu từ');
      return;
    }
    setShowNotebookPicker(true);
  };

  const actuallyAddWord = async (nbId) => {
  const userId = localStorage.getItem('userId');
  if (!userId || !selectedWord) return;
  await addWordToNotebook(userId, nbId, {
    wordId: selectedWord.id || selectedWord.word,
    word: selectedWord.word,
    vietnamese_meaning: selectedWord.vietnamese_meaning,
    phonetic: selectedWord.word_transliterated || '',
    note: '',
    examples: selectedWord.examples || []
  }).catch(()=>{});
  setShowNotebookPicker(false);
};

const handleCreateNotebook = async () => {
  if (!newNotebookName.trim()) return;
  setSavingNotebook(true);
  try {
    const userId = localStorage.getItem('userId');
    const nb = await createNotebook(userId, newNotebookName.trim());
    if (nb?.id) {
      const updated = { ...notebooks, [nb.id]: nb };
      setNotebooks(updated);
      setSelectedNotebookId(nb.id);
      localStorage.setItem('defaultNotebookId', nb.id);
      setNewNotebookName('');
    }
  } finally {
    setSavingNotebook(false);
  }
};

  const extractHeadlineMeaning = (text) => {
    if (!text) return '';
    const first = text.split(/(?<=\.)\s+|;|,/)[0];
    return first.trim();
  };

  const highlightTerm = (text) => {
    if (!text || !searchTerm) return text;
    const rex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'ig');
    return text.replace(rex, '<mark>$1</mark>');
  };

  return (
    <PageLayout title="Tra cứu">
      <div className={styles.newSearchWrapper}>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className={styles.newSearchBar}>
            <input
              type="text"
              className={styles.newSearchInput}
              placeholder="Nhập từ..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              disabled={loading}
              lang="th"
            />
            <button type="submit" className={styles.newSearchButton} disabled={loading}>
              {loading ? 'Đang tìm...' : '🔍'}
            </button>
        </form>

        {/* Category Chips */}
        <div className={styles.modeChips}>
          {['Từ vựng','Mẫu câu','Ngữ pháp'].map(cat => (
            <button
              key={cat}
              onClick={()=>setSelectedCategory(cat)}
              className={`${styles.modeChip} ${selectedCategory===cat?styles.activeMode:''}`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Left Column */}
            <div className={styles.leftColumn}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  Kết quả tra cứu cho “{searchTerm || '...'}”
                </div>
                <div className={styles.resultList}>
                  {loading && <div className={styles.placeholderBox}></div>}
                  {!loading && results.length === 0 && (
                    <div className={styles.emptyState}>Không có kết quả</div>
                  )}
                  {!loading && results.map(w => (
                    <div
                      key={w.id}
                      className={`${styles.resultItem} ${selectedWord && selectedWord.id===w.id?styles.selectedItem:''}`}
                      onClick={()=>setSelectedWord(w)}
                    >
                      <div className={styles.resultWord}>{w.word_transliterated || w.word}</div>
                      <div className={styles.resultMeaning}>
                        {extractHeadlineMeaning(w.vietnamese_meaning)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelTitleSmall}>Lịch sử tìm kiếm:</div>
                <div className={styles.relatedList}>
                  {historyWords.map((term, index) => (
                    <div
                      key={index}
                      className={styles.relatedItem}
                      onClick={() => {
                        setSearchTerm(term);
                        handleSearch();
                      }}
                    >
                      <div className={styles.relatedWord}>{term}</div>
                      <div className={styles.relatedMeaning}>
                        Nhấn để tìm lại
                      </div>
                    </div>
                  ))}
                  {historyWords.length === 0 && <div className={styles.emptyStateMini}>Chưa có lịch sử</div>}
                </div>
              </div>
            </div>

          {/* Main Detail */}
          <div className={styles.mainCard}>
            {selectedWord ? (
              <>
                <div className={styles.wordHeaderLine}>
                  <div className={styles.wordTitle}>
                    {(() => {
                      const thaiWord = selectedWord.word && containsThaiCharacters(selectedWord.word)
                        ? selectedWord.word
                        : (selectedWord.displayWord && containsThaiCharacters(selectedWord.displayWord)
                            ? selectedWord.displayWord
                            : null);
                      return (thaiWord || selectedWord.word || selectedWord.word_transliterated || '').toUpperCase();
                    })()}
                  </div>
                  {/* Placeholder for add button */}
                    <button className={styles.addBtn} type="button" title="Lưu"
                      onClick={handleAddCurrentWord}>
                      +
                    </button>
                </div>

                <div className={styles.sectionRow}>
                  <div className={styles.sectionLabel}>phiên âm:  </div>
                  <div className={styles.sectionValue}>
                    {selectedWord.word_transliterated || '(chưa có)'}
                  </div>
                </div>

                <div className={styles.headMeaningBox}>
                  {extractHeadlineMeaning(selectedWord.vietnamese_meaning) || 'Là danh từ or ...'}
                </div>

                {/* <div className={styles.sectionBlock}>
                  <div className={styles.blockTitle}>Nghĩa...</div>
                  <div
                    className={styles.blockContent}
                    dangerouslySetInnerHTML={{__html: highlightTerm(selectedWord.vietnamese_meaning)}}
                  />
                </div> */}

                <div className={styles.sectionBlock}>
                  <div className={styles.blockTitle}>Ví dụ:</div>
                  <div className={styles.examplesBlock}>
                    {(selectedWord.examples || []).slice(0,5).map((ex,i)=>{
                      // Split example into Thai part and Vietnamese meaning part
                      const parts = ex.split(':');
                      const thaiPart = parts[0]?.trim() || '';
                      const vietnamesePart = parts[1]?.trim() || '';
                      
                      return (
                        <div key={i} className={styles.exampleLine}>
                          <span className={styles.exampleIndex}>VD{i+1}</span>
                          <div className={styles.exampleContent}>
                            {thaiPart && (
                              <div className={styles.exampleThai}>
                                <ThaiText text={thaiPart} size="small" />
                              </div>
                            )}
                            {vietnamesePart && (
                              <div className={styles.exampleMeaning}>
                                {vietnamesePart}
                              </div>
                            )}
                            {/* If no colon separator, show entire text as Thai */}
                            {!vietnamesePart && parts.length === 1 && (
                              <div className={styles.exampleThai}>
                                <ThaiText text={ex} size="small" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(selectedWord.examples || []).length === 0 && (
                      <div className={styles.emptyStateMini}>Chưa có ví dụ....</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholderDetail}>
                Nhập từ và chọn kết quả để xem chi tiết
              </div>
            )}
            {error && <div className={styles.errorInline}>{error}</div>}
          </div>
        </div>
      </div>


      <NotebookPicker
        show={showNotebookPicker}
        onClose={() => setShowNotebookPicker(false)}
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookId}
        setSelectedNotebookId={setSelectedNotebookId}
        newNotebookName={newNotebookName}
        setNewNotebookName={setNewNotebookName}
        savingNotebook={savingNotebook}
        onCreateNotebook={handleCreateNotebook}
        onSaveWord={actuallyAddWord}
      />
    </PageLayout>
  );
};

export default Search;