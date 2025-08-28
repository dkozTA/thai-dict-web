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