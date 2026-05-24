import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5022/api';
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

