import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const registerBackendUser = async ({ id, email, username, password }) => {
  const res = await axios.post(`${API_URL}/user/register`, { id, email, username, password });
  return res.data;
};

export const loginBackendUser = async ({ idOrEmail, password }) => {
  const body = idOrEmail.includes('@')
    ? { email: idOrEmail, password }
    : { id: idOrEmail, password };
  const res = await axios.post(`${API_URL}/user/login`, body);
  return res.data;
};

export const addSearchHistoryRemote = async (userId, term) => {
  return axios.post(`${API_URL}/user/${userId}/history/search`, { term });
};

export const addTranslateHistoryRemote = async (userId, text) => {
  return axios.post(`${API_URL}/user/${userId}/history/translate`, { text });
};