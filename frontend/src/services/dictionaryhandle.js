import axios from 'axios';
import { containsThaiCharacters, formatThaiText, containsVietnameseCharacters } from '../utils/textUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios to handle UTF-8 properly
// axios.defaults.headers.common['Accept-Charset'] = 'UTF-8';
// axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

// Search for Thai words using our API
  export const searchThaiWords = async (searchTerm, searchType = 'all') => {
    try {
      if (!searchTerm.trim()) return [];

      console.log('Searching for:', searchTerm, 'with type:', searchType);

      // Don't encode Vietnamese characters - let axios handle it properly
      const response = await axios.get(`${API_URL}/dictionary/search`, {
        params: {
          query: searchTerm.trim(), // Don't encode here
          limit: 20,
          searchType: searchType
        },
        // headers: {
        //   'Accept-Charset': 'UTF-8',
        //   'Content-Type': 'application/json; charset=utf-8'
        // }
      });

    if (response.data.success) {
      console.log('Search results:', response.data.data);
      
      // Process results for display
      const results = response.data.data.map(word => ({
        ...word,
        word: word.word ? decodeThaiText(word.word) : word.word,
        phonetic: word.phonetic ? decodeThaiText(word.phonetic) : word.phonetic,
        // DO NOT transliterate examples – keep original so we can split later
        examples: Array.isArray(word.examples) ? word.examples : []
      }));
      return results;
    } else {
      throw new Error(response.data.message || 'Search failed');
    }
  } catch (error) {
    console.error('Dictionary search error:', error);
    throw error;
  }
};

// Helper function to decode Thai text
const decodeThaiText = (text) => {
  if (!text) return '';
  try {
    if (containsThaiCharacters(text)) return text;
    // if it already has Vietnamese diacritics, keep as Vietnamese
    if (containsVietnameseCharacters && containsVietnameseCharacters(text)) return text;
    return formatThaiText(text);
  } catch (e) {
    console.error('Error decoding Thai text:', e);
    return text;
  }
};

// Get a single word by ID
export const getWordById = async (wordId) => {
  try {
    const response = await axios.get(`${API_URL}/dictionary/word/${wordId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get word');
    }
  } catch (error) {
    console.error('Get word error:', error);
    throw error;
  }
};

// Get popular words
export const getPopularWords = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/dictionary/popular`, { params: { limit } });
    if (response.data.success) {
      return response.data.data.map(word => ({
        ...word,
        word: decodeThaiText(word.word)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching popular words:', error);
    return [];
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/dictionary/categories`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get categories');
    }
  } catch (error) {
    console.error('Get categories error:', error);
    // Return empty array instead of throwing
    return [];
  }
};