import { searchThaiWords } from './dictionaryhandle';

export const translateText = async (text, sourceLanguage) => {
  try {
    // Split text into words
    const words = text.split(/\s+/);
    const translatedWords = [];
    
    // Process each word
    for (const word of words) {
      // Look up in dictionary
      const searchResults = await searchThaiWords(
        word, 
        sourceLanguage === 'thai' ? 'word' : 'meaning',
        'system'
      );
      
      if (searchResults.length > 0) {
        translatedWords.push(
          sourceLanguage === 'thai' ? 
            searchResults[0].vietnamese_meaning.split(',')[0].trim() : 
            searchResults[0].word
        );
      } else {
        // Keep original if not found
        translatedWords.push(`[${word}]`);
      }
    }
    
    return translatedWords.join(' ');
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
}