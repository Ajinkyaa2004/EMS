import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee' | 'client' | 'freelancer' | 'trainee';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  apiClient: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get storage key based on user role, fallback to path-based key for initial load
  const getStorageKey = () => {
    if (user) {
      return `auth_${user.role}`;
    }
    // During initial load, check all possible role keys
    const roles = ['admin', 'employee', 'client', 'freelancer', 'trainee'];
    for (const role of roles) {
      if (sessionStorage.getItem(`auth_${role}_token`)) {
        return `auth_${role}`;
      }
    }
    return 'auth_default';
  };
  
  const [storageKey, setStorageKey] = useState(getStorageKey);
  
  // Create a tab-specific axios instance
  const [apiClient] = useState(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor to always use the current token from sessionStorage
    instance.interceptors.request.use((config) => {
      // Try all role-based keys to find the token
      const roles = ['admin', 'employee', 'client', 'freelancer', 'trainee'];
      let currentToken = null;
      
      for (const role of roles) {
        const token = sessionStorage.getItem(`auth_${role}_token`);
        if (token) {
          currentToken = token;
          break;
        }
      }
      
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });
    
    return instance;
  });
  // Initialize token and user from sessionStorage (tab-specific)
  useEffect(() => {
    // Try to find token from any role-based storage
    const roles = ['admin', 'employee', 'client', 'freelancer', 'trainee'];
    let foundToken = null;
    let foundUser = null;
    let foundRole = null;
    
    for (const role of roles) {
      const token = sessionStorage.getItem(`auth_${role}_token`);
      const userStr = sessionStorage.getItem(`auth_${role}_user`);
      
      if (token && userStr) {
        try {
          foundToken = token;
          foundUser = JSON.parse(userStr);
          foundRole = role;
          break;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          sessionStorage.removeItem(`auth_${role}_token`);
          sessionStorage.removeItem(`auth_${role}_user`);
        }
      }
    }
    
    if (foundToken && foundUser) {
      setToken(foundToken);
      setUser(foundUser);
      setStorageKey(`auth_${foundRole}`);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Use role-based storage key
      const roleKey = `auth_${userData.role}`;
      sessionStorage.setItem(`${roleKey}_token`, newToken);
      sessionStorage.setItem(`${roleKey}_user`, JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setStorageKey(roleKey);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role,
      });
      const { token: newToken, user: userData } = response.data;
      
      // Use role-based storage key
      const roleKey = `auth_${userData.role}`;
      sessionStorage.setItem(`${roleKey}_token`, newToken);
      sessionStorage.setItem(`${roleKey}_user`, JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setStorageKey(roleKey);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all role-based storage
    const roles = ['admin', 'employee', 'client', 'freelancer', 'trainee'];
    roles.forEach(role => {
      sessionStorage.removeItem(`auth_${role}_token`);
      sessionStorage.removeItem(`auth_${role}_user`);
    });
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        apiClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
