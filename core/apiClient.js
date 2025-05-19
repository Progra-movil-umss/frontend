// apiClient.js
// Cliente Axios robusto con refresh automático de tokens, compatible con web y móvil

import axios from 'axios';
import storage from './storage';

export const API_BASE_URL = 'https://florafind-aau6a.ondigitalocean.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor para incluir el access_token en cada request
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem('flora_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Refresh manual compatible con React Native
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await storage.getItem('flora_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const data = resp.data;
        const expiresIn = data.expires_in || 1800;
        const refreshExpiresIn = data.refresh_expires_in || 604800;
        const expiryTime = Date.now() + expiresIn * 1000;
        const refreshExpTime = Date.now() + refreshExpiresIn * 1000;
        await storage.multiSet([
          ['flora_token', data.access_token],
          ['flora_token_expiry', expiryTime.toString()],
          ['flora_refresh_token', data.refresh_token || refreshToken],
          ['flora_refresh_token_expiry', refreshExpTime.toString()],
        ]);
        processQueue(null, data.access_token);
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
        return apiClient(originalRequest);
      } catch (err) {
        await storage.multiRemove([
          'flora_token',
          'flora_token_expiry',
          'flora_refresh_token',
          'flora_refresh_token_expiry',
        ]);
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
