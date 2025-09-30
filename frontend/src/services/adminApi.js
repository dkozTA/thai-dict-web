import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get all users for admin
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Update a user's role
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw error;
  }
};

/**
 * Toggle user active status
 */
export const toggleUserActive = async (userId) => {
  try {
    const response = await axios.put(`${API_URL}/admin/users/${userId}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    throw error;
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

/**
 * Get dictionary statistics
 */
export const getDictionaryStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dictionary/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch dictionary stats:', error);
    return {
      totalWords: 0,
      totalCategories: 0,
      popularSearches: []
    };
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0
    };
  }
};

/**
 * Get user suggestions
 */
export const getUserSuggestions = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/suggestions`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return [];
  }
};

/**
 * Approve a suggestion
 */
export const approveSuggestion = async (suggestionId) => {
  try {
    const response = await axios.post(`${API_URL}/admin/suggestions/${suggestionId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve suggestion:', error);
    throw error;
  }
};

/**
 * Reject a suggestion
 */
export const rejectSuggestion = async (suggestionId) => {
  try {
    const response = await axios.post(`${API_URL}/admin/suggestions/${suggestionId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Failed to reject suggestion:', error);
    throw error;
  }
};

/**
 * Get all dictionary words
 */
export const getAllWords = async (page = 1, limit = 10, searchTerm = '', category = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/admin/dictionary`, {
      params: { page, limit, search: searchTerm, category }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dictionary words:', error);
    throw error;
  }
};

/**
 * Add a new word to the dictionary
 */
export const addWord = async (wordData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/dictionary`, wordData);
    return response.data;
  } catch (error) {
    console.error('Failed to add word:', error);
    throw error;
  }
};

/**
 * Update an existing word
 */
export const updateWord = async (wordId, wordData) => {
  try {
    const response = await axios.put(`${API_URL}/admin/dictionary/${wordId}`, wordData);
    return response.data;
  } catch (error) {
    console.error('Failed to update word:', error);
    throw error;
  }
};

/**
 * Delete a word
 */
export const deleteWord = async (wordId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/dictionary/${wordId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete word:', error);
    throw error;
  }
};

/**
 * Get dictionary categories
 */
export const getDictionaryCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/dictionary/categories`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return ['general', 'food', 'travel'];
  }
};

/**
 * Get reports data based on time range
 */
export const getReports = async (timeRange = 'month') => {
  try {
    // Use real API endpoint instead of mock data
    const response = await axios.get(`${API_URL}/admin/reports`, {
      params: { timeRange }
    });
    return response.data.data;
    
    // Comment out or remove the mock data
    // return getMockReportData(timeRange);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    // Still return empty data structure on error
    return getEmptyReportData();
  }
};

// Empty data structure for error cases
const getEmptyReportData = () => ({
  searchStats: [],
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    roleDistribution: { user: 0, editor: 0, admin: 0 }
  },
  wordStats: [],
  categoryDistribution: {},
  userGrowth: [],
  searchTerms: [],
  suggestionStats: { pending: 0, approved: 0, rejected: 0 }
});

/**
 * Get recent words added to dictionary
 */
export const getRecentWords = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/admin/dictionary/recent`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch recent words:', error);
    return [];
  }
};

/**
 * Get recent users registered
 */
export const getRecentUsers = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/admin/users/recent`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch recent users:', error);
    return [];
  }
};

/**
 * Get suggestion statistics
 */
export const getSuggestionStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/suggestions/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch suggestion stats:', error);
    return { pending: 0, approved: 0, rejected: 0 };
  }
};

/**
 * Get translation feedback reports
 */
export const getTranslationFeedback = async (status = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/admin/translations/feedback`, {
      params: { status }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch translation feedback:', error);
    return [];
  }
};

/**
 * Update translation feedback status
 */
export const updateTranslationFeedback = async (id, status, adminNote = '') => {
  try {
    const response = await axios.patch(`${API_URL}/admin/translations/feedback/${id}`, {
      status,
      adminNote
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update translation feedback:', error);
    throw error;
  }
};