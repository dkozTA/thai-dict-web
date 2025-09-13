import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const upsertUser = async (id, email) => {
  const res = await axios.post(`${API_URL}/user`, { id, email });
  return res.data.success ? res.data.data : null;
};

export const getUser = async (id) => {
  const res = await axios.get(`${API_URL}/user/${id}`);
  return res.data.success ? res.data.data : null;
};

export const addSearchHistory = async (userId, term) => {
  const res = await axios.post(`${API_URL}/user/${userId}/history/search`, { term });
  return res.data.success ? res.data.data : [];
};

export const createNotebook = async (userId, name) => {
  const res = await axios.post(`${API_URL}/user/${userId}/notebooks`, { name });
  return res.data.success ? res.data.data : null;
};

export const addWordToNotebook = async (userId, notebookId, wordPayload) => {
  const res = await axios.post(`${API_URL}/user/${userId}/notebooks/${notebookId}/words`, wordPayload);
  return res.data.success ? res.data.data : null;
};

export const updateWordInNotebook = async (userId, notebookId, wordId, wordData) => {
  const res = await axios.put(`${API_URL}/user/${userId}/notebooks/${notebookId}/words/${wordId}`, wordData);
  return res.data.success ? res.data.data : null;
};

// Update notebook name
export const updateNotebookName = async (userId, notebookId, newName) => {
  try {
    const response = await axios.put(`${API_URL}/user/${userId}/notebooks/${notebookId}`, {
      name: newName
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
};

// Delete notebook
export const deleteNotebook = async (userId, notebookId) => {
  try {
    const response = await axios.delete(`${API_URL}/user/${userId}/notebooks/${notebookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notebook:', error);
    throw error;
  }
};

/**
 * Submit a new word suggestion
 */
export const submitNewWordSuggestion = async (userId, wordData, note = '') => {
  try {
    const response = await axios.post(`${API_URL}/user/${userId}/suggestions/new-word`, {
      word: wordData,
      note
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit new word suggestion:', error);
    throw error;
  }
};

/**
 * Submit an edit suggestion for an existing word
 */
export const submitEditWordSuggestion = async (userId, wordId, wordData, note = '') => {
  try {
    const response = await axios.post(`${API_URL}/user/${userId}/suggestions/edit-word`, {
      wordId,
      word: wordData,
      note
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit word edit suggestion:', error);
    throw error;
  }
};

/**
 * Share a notebook
 */
export const shareNotebook = async (userId, notebookId, data) => {
  try {
    const response = await axios.post(`${API_URL}/user/${userId}/notebooks/${notebookId}/share`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to share notebook:', error);
    throw error;
  }
};

/**
 * Stop sharing a notebook
 */
export const unshareNotebook = async (userId, notebookId) => {
  try {
    const response = await axios.delete(`${API_URL}/user/${userId}/notebooks/${notebookId}/share`);
    return response.data;
  } catch (error) {
    console.error('Failed to unshare notebook:', error);
    throw error;
  }
};

/**
 * Get public shared notebooks
 */
export const getSharedNotebooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/shared-notebooks`);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch shared notebooks:', error);
    // Return empty array on error for graceful UI handling
    return [];
  }
};

/**
 * Get a specific shared notebook
 */
export const getSharedNotebook = async (shareId) => {
  try {
    const response = await axios.get(`${API_URL}/shared-notebooks/${shareId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch shared notebook:', error);
    throw error;
  }
};