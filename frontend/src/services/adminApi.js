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