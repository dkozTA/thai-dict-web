import axios from 'axios';
import { containsThaiCharacters, formatThaiText } from '../utils/textUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios to handle UTF-8 properly
axios.defaults.headers.common['Accept-Charset'] = 'UTF-8';
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

// Search for Thai words using our API
export const searchThaiWords = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) return [];

    // Ensure proper encoding of Thai characters in the URL
    const encodedTerm = encodeURIComponent(searchTerm.trim());
    
    // Add header to ensure proper UTF-8 handling
    const response = await axios.get(`${API_URL}/dictionary/search`, {
      params: {
        query: encodedTerm,
        limit: 20
      },
      headers: {
        'Accept-Charset': 'UTF-8',
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    if (response.data.success) {
      // Ensure Thai text is properly decoded
      const results = response.data.data.map(word => ({
        ...word,
        word: decodeThaiText(word.word),
        phonetic: word.phonetic ? decodeThaiText(word.phonetic) : word.phonetic,
        examples: word.examples ? word.examples.map(ex => decodeThaiText(ex)) : []
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
    // If text is already in Thai script, return as is
    if (containsThaiCharacters(text)) {
      return text;
    }
    
    // Otherwise, use the transliteration map to convert
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
    const response = await axios.get(`${API_URL}/dictionary/popular`, {
      params: { limit }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get popular words');
    }
  } catch (error) {
    console.error('Get popular words error:', error);
    // Return empty array instead of throwing
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