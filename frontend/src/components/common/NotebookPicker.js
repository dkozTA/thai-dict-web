import React from 'react';
import styles from '../../styles/NotebookPicker.module.css';

const NotebookPicker = ({
  show,
  onClose,
  notebooks,
  selectedNotebookId,
  setSelectedNotebookId,
  newNotebookName,
  setNewNotebookName,
  savingNotebook,
  onCreateNotebook,
  onSaveWord
}) => {
  if (!show) return null;

  return (
    <div className={styles.nbOverlay} onClick={onClose}>
      <div className={styles.nbModal} onClick={e => e.stopPropagation()}>
        <h3>Chọn sổ tay</h3>
        <div className={styles.nbList}>
          {Object.keys(notebooks).length === 0 && <div className={styles.nbEmpty}>Chưa có sổ tay</div>}
          {Object.values(notebooks).map(nb => {
            const count = Object.keys(nb.words || {}).length;
            return (
              <button
                key={nb.id}
                className={`${styles.nbItem} ${selectedNotebookId === nb.id ? styles.nbItemActive : ''}`}
                type="button"
                onClick={() => setSelectedNotebookId(nb.id)}
              >
                <div className={styles.nbName}>{nb.name}</div>
                <div className={styles.nbMeta}>{count} từ</div>
              </button>
            );
          })}
        </div>
        <div className={styles.nbCreateRow}>
          <input
            type="text"
            placeholder="Tên sổ tay mới"
            value={newNotebookName}
            onChange={e => setNewNotebookName(e.target.value)}
            disabled={savingNotebook}
            className={styles.nbInput}
          />
          <button
            type="button"
            className={styles.nbCreateBtn}
            disabled={savingNotebook || !newNotebookName.trim()}
            onClick={onCreateNotebook}
          >
            {savingNotebook ? '...' : 'Tạo'}
          </button>
        </div>
        <div className={styles.nbActions}>
          <button
            type="button"
            className={styles.nbCancel}
            onClick={onClose}
          >Hủy</button>
          <button
            type="button"
            className={styles.nbSave}
            disabled={!selectedNotebookId}
            onClick={() => onSaveWord(selectedNotebookId)}
          >Lưu từ</button>
        </div>
      </div>
    </div>
  );
};

export default NotebookPicker;