import axios from 'axios';

// Intelligently fallback to localhost:8000 backend API if VITE_API_URL isn't explicitly set
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
