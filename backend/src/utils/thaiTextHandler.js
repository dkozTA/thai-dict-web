/**
 * Utilities for handling Thai text and transliteration
 */

// Thai Unicode range: \u0E00-\u0E7F
const THAI_PATTERN = /[\u0E00-\u0E7F]/;

/**
 * Check if text contains valid Thai characters
 * @param {string} text - Text to check
 * @returns {boolean} - Whether text contains Thai characters
 */
const containsThaiCharacters = (text) => {
  if (!text) return false;
  return THAI_PATTERN.test(text);
};

/**
 * Normalize Thai text to ensure consistent representation
 * @param {string} text - Thai text to normalize
 * @returns {string} - Normalized Thai text
 */
const normalizeThaiText = (text) => {
  if (!text) return '';
  
  return text
    // Replace HTML entities with actual characters
    .replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/ig, (match, entity) => {
      switch (entity) {
        case 'amp': return '&';
        case 'lt': return '<';
        case 'gt': return '>';
        case 'quot': return '"';
        case 'apos': return "'";
        default:
          if (entity.charAt(0) === '#') {
            const code = entity.charAt(1).toLowerCase() === 'x'
              ? parseInt(entity.substring(2), 16)
              : parseInt(entity.substring(1), 10);
            return String.fromCharCode(code);
          }
          return match;
      }
    })
    // Normalize Thai tone marks and vowels order
    .normalize('NFC')
    // Remove zero-width spaces and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Standardize spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Mapping for transliteration (simplified example)
 * This needs to be expanded with your specific transliteration system
 */
const TRANSLITERATION_MAP = {
  // Vowels
  'a': 'า',
  'i': 'ิ',
  'I': 'ี',
  'u': 'ุ',
  'U': 'ู',
  'e': 'เ',
  'E': 'แ',
  'o': 'โ',
  'O': 'อ',
  
  // Consonants
  'k': 'ก',
  'c': 'จ',
  't': 'ต',
  'T': 'ท',
  'p': 'ป',
  'P': 'พ',
  'b': 'บ',
  'm': 'ม',
  'n': 'น',
  'N': 'ณ',
  'j': 'จ',
  'y': 'ย',
  'r': 'ร',
  'l': 'ล',
  'w': 'ว',
  's': 'ส',
  'h': 'ห',
  
  // Special characters
  '&': '่', // tone mark
  '*': '้', // tone mark
  '^': '๊', // tone mark
  '~': '๋', // tone mark
  
  // Other symbols
  '#': 'ฃ',
  '+': 'ฌ'
};

/**
 * Convert transliterated text to Thai script
 * This is a basic implementation and will need to be enhanced
 * for your specific transliteration system
 * 
 * @param {string} text - Transliterated text
 * @returns {string} - Thai script version
 */
const transliteratedToThai = (text) => {
  if (!text) return '';
  
  // If text already contains Thai characters, return as is
  if (containsThaiCharacters(text)) {
    return text;
  }
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Special handling for '<' and '>' which are used in transliteration system
    if (char === '<') {
      // Find matching '>' and process what's between them
      const closeIndex = text.indexOf('>', i);
      if (closeIndex > i) {
        const specialSequence = text.substring(i + 1, closeIndex);
        // Process special sequence - implement based on your transliteration system
        result += specialSequence; // Simplified; you'll need to enhance this
        i = closeIndex;
        continue;
      }
    }
    
    // Use the mapping if available, otherwise keep the original character
    result += TRANSLITERATION_MAP[char] || char;
  }
  
  return result;
};

/**
 * Create display-friendly version of word data
 * @param {Object} wordData - Word data from database
 * @returns {Object} - Enhanced word data for display
 */
const prepareWordForDisplay = (wordData) => {
  if (!wordData) return null;
  
  const result = { ...wordData };
  
  // Convert transliterated word to Thai if needed
  if (wordData.word && !containsThaiCharacters(wordData.word)) {
    result.displayWord = transliteratedToThai(wordData.word);
    result.isTransliterated = true;
  } else {
    result.displayWord = wordData.word;
    result.isTransliterated = false;
  }
  
  // Process examples
  if (wordData.examples && Array.isArray(wordData.examples)) {
    result.examples = wordData.examples.map(example => {
      if (!containsThaiCharacters(example)) {
        return {
          original: example,
          display: transliteratedToThai(example),
          isTransliterated: true
        };
      }
      return {
        original: example,
        display: example,
        isTransliterated: false
      };
    });
  }
  
  return result;
};

module.exports = {
  containsThaiCharacters,
  normalizeThaiText,
  transliteratedToThai,
  prepareWordForDisplay
};