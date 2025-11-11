// src/config/api.ts
import axios from 'axios';

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'https://api.autoonline.lk';
  }
  return 'https://api.autoonline.lk';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (CORS, no connection)
    if (error.code === 'ERR_NETWORK') {
      const networkError = new Error('Network error. Please check your connection.');
      console.error('Network Error:', networkError);
      throw networkError;
    }

    // Server response errors
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || 'An error occurred';
      
      // Handle 521 specifically
      if (status === 521) {
        // Return a structured error instead of throwing new Error
        return Promise.reject({
          code: 521,
          message: 'Server is unavailable. Please try again later.',
          isServerError: true
        });
      }
      
      return Promise.reject({
        code: status,
        message: `${status}: ${message}`
      });
    }

    // Other errors
    return Promise.reject({
      message: error.message || 'An unexpected error occurred'
    });
  }
);

export default apiClient;