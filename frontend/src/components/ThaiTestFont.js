import React from 'react';
import styles from '../styles/ThaiTestFont.module.css';

const ThaiTestFont = () => {
  // Sample Thai text for testing
  const testText = "สวัสดี ภาษาไทย กินข้าว น้ำ ฉันชอบกินอาหารไทย";
  
  return (
    <div className={styles.fontTester}>
      <h3>Thai Font Test</h3>
      
      <div className={styles.testRow}>
        <h4>1. System Default (Sarabun)</h4>
        <div className={styles.sampleDefault} lang="th">{testText}</div>
      </div>
      
      <div className={styles.testRow}>
        <h4>2. Thai VietNam Chuan Font</h4>
        <div className={styles.sampleCustom} lang="th">{testText}</div>
      </div>
      
      <div className={styles.testRow}>
        <h4>3. Transliterated (from textUtils.js)</h4>
        <div lang="th">b*a kha*w m#</div>
        <div className={styles.meaning}>Should show: บ้า ข้าว มำ</div>
      </div>
    </div>
  );
};

export default ThaiTestFont;