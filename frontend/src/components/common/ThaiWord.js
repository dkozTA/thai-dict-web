import React from 'react';

/**
 * Component specifically for rendering Thai words with custom Thai VietNam Chuan font
 * Simple and focused - just applies the font class and lang attribute
 */
const ThaiWord = ({ text, className = '' }) => {
  if (!text) return null;

  return (
    <span className={`word-thai ${className}`} lang="th">
      {text}
    </span>
  );
};

export default ThaiWord;