// API Gateway configuration for all services
export const API_CONFIG = {
  // API Gateway - Main entry point
  GATEWAY_URL: 'http://localhost:8081',
  
  // Service endpoints (via API Gateway)
  USER_SERVICE: '/api/users',
  PAYMENT_SERVICE: '/api/payments',
  LOANS_SERVICE: '/api/loans',
  
  // Full URLs
  USER_API: 'http://localhost:8081/api/users',
  PAYMENT_API: 'http://localhost:8081/api/payments',
  LOANS_API: 'http://localhost:8081/api/loans',
  
  // Eureka Server (for monitoring)
  EUREKA_URL: 'http://localhost:8761',
  
  // Timeout settings
  TIMEOUT: 10000,
  
  // Retry settings
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Create Axios instance
import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_CONFIG.GATEWAY_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Invalid token, redirect to login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient }; 