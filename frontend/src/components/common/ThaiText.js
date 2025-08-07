import React from 'react';
import { containsThaiCharacters, formatThaiText } from '../../utils/textUtils';

const ThaiText = ({ 
  text, 
  size = 'medium', 
  showOriginal = false,
  phonetic = '',
  showPhonetic = false
}) => {
  if (!text) return null;
  
  // Process the text
  const isThaiAlready = containsThaiCharacters(text);
  const formattedText = isThaiAlready ? text : formatThaiText(text);
  
  const sizeClass = {
    small: 'thai-text-sm',
    medium: 'thai-text-md',
    large: 'thai-text-lg'
  }[size] || 'thai-text-md';

  return (
    <span className={`thai-text ${sizeClass}`}>
      <span lang="th">{formattedText}</span>
      
      {showOriginal && !isThaiAlready && (
        <span className="thai-original">({text})</span>
      )}
      
      {showPhonetic && phonetic && (
        <span className="thai-phonetic">/{phonetic}/</span>
      )}
    </span>
  );
};

export default ThaiText;