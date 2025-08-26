import React from 'react';
import { containsThaiCharacters } from '../../utils/textUtils';
import styles from '../../styles/ThaiText.module.css';

const ThaiText = ({ 
  text, 
  size = 'medium', 
  showOriginal = false,
  phonetic = '',
  showPhonetic = false
}) => {
  if (!text) return null;
  
  // We no longer need to transform the text, just check if it's already Thai
  const isThaiAlready = containsThaiCharacters(text);
  
  const sizeClass = {
    small: styles['thai-text-sm'],
    medium: styles['thai-text-md'],
    large: styles['thai-text-lg']
  }[size] || styles['thai-text-md'];

  return (
    <span className={`${styles['thai-text']} ${sizeClass}`}>
      <span lang="th">{text}</span>
      
      {showOriginal && !isThaiAlready && (
        <span className={styles['thai-original']}>({text})</span>
      )}
      
      {showPhonetic && phonetic && (
        <span className={styles['thai-phonetic']}>/{phonetic}/</span>
      )}
    </span>
  );
};

export default ThaiText;