/**
 * Utility functions for handling Thai ethnic text (Vietnam)
 */

/**
 * Check if text contains Thai ethnic script characters
 * @param {string} text - Text to check
 * @returns {boolean} - Whether text contains Thai characters
 */
export const containsThaiCharacters = (text) => {
  if (!text) return false;
  
  // Thai Viet Unicode range (for Thai ethnic script in Vietnam)
  // Using both Thai Viet and Thai script ranges to be safe
  const thaiPattern = /[\u0E00-\u0E7F\uAA80-\uAADF]/;
  return thaiPattern.test(text);
};

/**
 * Format Thai text for display
 * @param {string} text - Text to format
 * @returns {string} - Original text (no transliteration)
 */
export const formatThaiText = (text) => {
  // Simply return the text as is - no transliteration
  return text || '';
};

/**
 * Check if text contains Vietnamese characters
 * @param {string} text - Text to check
 * @returns {boolean} - Whether text contains Vietnamese characters
 */
export const containsVietnameseCharacters = (text) => {
  if (!text) return false;
  
  // Vietnamese-specific characters
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text);
};