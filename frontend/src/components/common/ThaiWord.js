import React, { useRef, useEffect } from 'react';

/**
 * Component for rendering Thai words with custom Thai VietNam Chuan font
 * Now supports editable mode for input fields
 */
const ThaiWord = ({ 
  text, 
  className = '', 
  editable = false, 
  onChange,
  placeholder = ''
}) => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (editable && contentRef.current) {
      // Update the content if text changes externally
      if (contentRef.current.textContent !== text) {
        contentRef.current.textContent = text || '';
      }
    }
  }, [text, editable]);
  
  const handleInput = () => {
    if (editable && onChange && contentRef.current) {
      onChange(contentRef.current.textContent);
    }
  };
  
  if (editable) {
    return (
      <div
        ref={contentRef}
        contentEditable={true}
        className={`word-thai ${className}`}
        lang="th"
        onInput={handleInput}
        placeholder={placeholder}
        style={{ 
          minHeight: '150px',
          outline: 'none',
          whiteSpace: 'pre-wrap'
        }}
        suppressContentEditableWarning={true}
      >{text}</div>
    );
  }

  // Non-editable version (original)
  if (!text) return null;

  return (
    <span className={`word-thai ${className}`} lang="th">
      {text}
    </span>
  );
};

export default ThaiWord;