import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get public shared notebooks
 */
export const getSharedNotebooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/shared-notebooks`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch shared notebooks:', error);
    throw error;
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