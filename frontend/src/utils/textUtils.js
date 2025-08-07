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
 * Thai ethnic script transliteration map for Vietnam
 * Based on common transliteration systems used in Vietnam
 */
const THAI_VN_TRANSLITERATION_MAP = {
  // Basic consonants
  // Consonants - dựa trên hệ thống romanization cụ thể của từ điển bạn dùng
  'b': 'บ',   // ba
  'p': 'ป',   // pa
  't': 'ต',   // ta
  'd': 'ด',   // da
  'k': 'ก',   // ka
  'g': 'ก',   // ga (alternative)
  'G': 'ง',   // ng (final)
  'm': 'ม',   // ma
  'n': 'น',   // na
  'c': 'จ',   // cha/ja
  'j': 'จ',   // ja
  'J': 'ช',   // cha (alternative)
  'l': 'ล',   // la
  'w': 'ว',   // wa
  'h': 'ห',   // ha
  'y': 'ย',   // ya
  'Y': 'ไ',   // ai vowel prefix
  'r': 'ร',   // ra
  's': 'ส',   // sa
  'x': 'ข',   // kha
  'z': 'ช',   // cha
  'f': 'ฟ',   // fa
  'v': 'ว',   // va
  'V': 'ะ',   // short vowel marker
  'q': 'ก',   // alternative k
  
  // Vowels and markers
  'a': 'า',   // long a
  'i': 'ิ',   // short i
  'I': 'ี',   // long i  
  'u': 'ุ',   // short u
  'U': 'ู',   // long u
  'e': 'เ',   // e prefix
  'E': 'แ',   // ae
  'o': 'โ',   // o prefix
  'O': 'อ',   // o vowel
  '@': 'ึ',   // ue vowel
  '#': 'ำ',   // am
  
  // Tone marks
  '*': '้',   // falling tone (mai tho)
  '&': '่',   // low tone (mai ek)  
  '^': '๊',   // high tone (mai tri)
  '~': '๋',   // rising tone (mai chattawa)
  '?': '์',   // silent (thanthakhat)
  '+': '็',   // short vowel (mai taikhu)
  
  // Special combinations that appear in your data
  'aJ': 'าย',  // long a + y
  'ekV': 'เขะ', // e + k + short vowel
  'Yb': 'ไบ',  // ai + b
  'c*a': 'ช้า', // cha + tone + long a
  'f*a': 'ฟ้า', // fa + tone + long a
};

/**
 * Format Thai text for display
 * @param {string} text - Text to format (either Thai script or transliteration)
 * @returns {string} - Formatted text
 */
export const formatThaiText = (text) => {
  if (!text) return '';
  
  // If already contains Thai characters, return as is
  if (containsThaiCharacters(text)) {
    return text;
  }
  
  // Try to convert transliteration
  try {
    // First handle common patterns in your data
    let processed = text;
    
    // Remove any parenthetical expressions like (baG)
    processed = processed.replace(/\([^)]+\)/g, '');
    
    // Process the text character by character
    let result = '';
    for (let i = 0; i < processed.length; i++) {
      // Check for digraphs (two-letter combinations) first
      const twoChars = processed.slice(i, i+2);
      if (THAI_VN_TRANSLITERATION_MAP[twoChars]) {
        result += THAI_VN_TRANSLITERATION_MAP[twoChars];
        i++; // Skip next character as we've used it
        continue;
      }
      
      // Check for single characters
      const char = processed[i];
      result += THAI_VN_TRANSLITERATION_MAP[char] || char;
    }
    
    return result;
  } catch (error) {
    console.error('Error formatting Thai text:', error);
    return text; // Return original if conversion fails
  }
};