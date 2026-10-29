import axios from 'axios';
import { handleMockRequest } from './mockData';

const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Request interceptor to attach JWT auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eco_track_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/forgot-password');
      if (!isAuthRoute) {
        localStorage.removeItem('eco_track_token');
        localStorage.removeItem('eco_track_user');
        window.location.hash = '#/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Unified wrapper supporting live API with automated fallback to client-side mock store
const api = {
  async get(url, config) {
    if (isGitHubPages) {
      return handleMockRequest('get', url, null);
    }
    try {
      return await apiInstance.get(url, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        console.warn(`[ECO TRACK] API offline, falling back to mock: GET ${url}`);
        return handleMockRequest('get', url, null);
      }
      throw err;
    }
  },

  async post(url, data, config) {
    if (isGitHubPages) {
      return handleMockRequest('post', url, data);
    }
    try {
      return await apiInstance.post(url, data, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        console.warn(`[ECO TRACK] API offline, falling back to mock: POST ${url}`);
        return handleMockRequest('post', url, data);
      }
      throw err;
    }
  },

  async put(url, data, config) {
    if (isGitHubPages) {
      return handleMockRequest('put', url, data);
    }
    try {
      return await apiInstance.put(url, data, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        console.warn(`[ECO TRACK] API offline, falling back to mock: PUT ${url}`);
        return handleMockRequest('put', url, data);
      }
      throw err;
    }
  },

  async delete(url, config) {
    if (isGitHubPages) {
      return handleMockRequest('delete', url, null);
    }
    try {
      return await apiInstance.delete(url, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        console.warn(`[ECO TRACK] API offline, falling back to mock: DELETE ${url}`);
        return handleMockRequest('delete', url, null);
      }
      throw err;
    }
  }
};

export default api;
