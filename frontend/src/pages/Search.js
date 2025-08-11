import React, { useState, useEffect } from 'react';
import PageLayout from '../components/common/Pagelayout';
import styles from '../styles/Search.module.css';
import ThaiText from '../components/common/ThaiText';
import { searchThaiWords, getPopularWords } from '../services/dictionaryhandle';
import { containsThaiCharacters, containsVietnameseCharacters } from '../utils/textUtils';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Từ vựng');
  const [results, setResults] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyWords, setHistoryWords] = useState([]);

  // Load history on mount
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('searchHistory')) || [];
      setHistoryWords(h);
    } catch {
      setHistoryWords([]);
    }
  }, []);

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
        else if (/^[a-zA-Z0-9\s\-\(\)]+$/.test(searchTerm)) searchType = 'phonetic';
      }
      const data = await searchThaiWords(searchTerm, searchType);
      setResults(data);
      if (data.length > 0) saveToHistory(searchTerm);
      if (data.length === 0) setError('Không tìm thấy kết quả');
    } catch (err) {
      console.error(err);
      setError('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
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
                <div className={styles.panelTitleSmall}>Các từ liên quan:</div>
                <div className={styles.relatedList}>
                  {relatedWords.map(r => (
                    <div
                      key={r.id}
                      className={styles.relatedItem}
                      onClick={()=>setSelectedWord(r)}
                    >
                      <div className={styles.relatedWord}>{r.word_transliterated || r.word}</div>
                      <div className={styles.relatedMeaning}>
                        {extractHeadlineMeaning(r.vietnamese_meaning)}
                      </div>
                    </div>
                  ))}
                  {relatedWords.length === 0 && <div className={styles.emptyStateMini}>Không có</div>}
                </div>
              </div>
            </div>

          {/* Main Detail */}
          <div className={styles.mainCard}>
            {selectedWord ? (
              <>
                <div className={styles.wordHeaderLine}>
                  <div className={styles.wordTitle}>
                    {(selectedWord.word_transliterated || selectedWord.word || '').toUpperCase()}
                  </div>
                  {/* Placeholder for add button */}
                  <button className={styles.addBtn} type="button" title="Thêm">
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

                <div className={styles.sectionBlock}>
                  <div className={styles.blockTitle}>Nghĩa...</div>
                  <div
                    className={styles.blockContent}
                    dangerouslySetInnerHTML={{__html: highlightTerm(selectedWord.vietnamese_meaning)}}
                  />
                </div>

                <div className={styles.sectionBlock}>
                  <div className={styles.blockTitle}>Ví dụ:</div>
                  <div className={styles.examplesBlock}>
                    {(selectedWord.examples || []).slice(0,5).map((ex,i)=>(
                      <div key={i} className={styles.exampleLine}>
                        <span className={styles.exampleIndex}>VD{i+1}</span>
                        <ThaiText text={ex} size="small" />
                      </div>
                    ))}
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
    </PageLayout>
  );
};

export default Search;