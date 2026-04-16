import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MOCK_ADMIN_ID = '60d5ecb8b392d70015352516';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token or Mock ID in Development
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neurofocus_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (process.env.NODE_ENV === 'development') {
      // Auth Bypass Logic for Development
      config.headers['X-Mock-User-ID'] = MOCK_ADMIN_ID;
      // In a real scenario, the backend would also need specialized handling for this header
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 429 Too Many Requests: Trigger Rate Limiting Toast
      if (status === 429) {
        window.dispatchEvent(new CustomEvent('api-rate-limit', { 
          detail: { message: 'System cooling down. Please wait a moment, Explorer.' } 
        }));
      }
      
      // 401 Unauthorized: Clear session and redirect to homepage (login)
      if (status === 401 && window.location.pathname !== '/') {
        localStorage.removeItem('neurofocus_token');
        localStorage.removeItem('neurofocus_role');
        window.location.href = '/';
      }
      
      // 422 Unprocessable Entity: Specific validation logic handled in components
    }
    
    return Promise.reject(error);
  }
);
