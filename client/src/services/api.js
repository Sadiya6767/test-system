import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to automatically add JWT token for admin endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.config.url.includes('/admin') && !error.config.url.includes('/admin/login')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const testAPI = {
  getQuestions: (track) => api.get('/test/questions', { params: { track } }),
  startTest: (formData) => api.post('/test/start', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAttempt: (attemptId) => api.get(`/test/attempt/${attemptId}`),
  submitAnswer: (payload) => api.post('/test/answer', payload),
  submitTest: (payload) => api.post('/test/submit', payload),
};

export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),
  getResults: (params) => api.get('/admin/results', { params }),
  getResultById: (id) => api.get(`/admin/results/${id}`),
  deleteResult: (id) => api.delete(`/admin/results/${id}`),
  getExportUrl: () => `${API_BASE_URL}/admin/export`,
};

export default api;