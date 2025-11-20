import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests from sessionStorage (role-based)
apiClient.interceptors.request.use((config) => {
  // Try all possible role keys to find the token
  const roles = ['admin', 'employee', 'client', 'freelancer'];
  let token = null;
  
  for (const role of roles) {
    const roleToken = sessionStorage.getItem(`auth_${role}_token`);
    if (roleToken) {
      token = roleToken;
      break;
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all role-based storage on 401
      const roles = ['admin', 'employee', 'client', 'freelancer'];
      roles.forEach(role => {
        sessionStorage.removeItem(`auth_${role}_token`);
        sessionStorage.removeItem(`auth_${role}_user`);
      });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
