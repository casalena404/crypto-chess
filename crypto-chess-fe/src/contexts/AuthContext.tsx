import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, socketClient, User } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await apiClient.getProfile() as any;
          setUser(response.user);
          socketClient.setToken(token);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await apiClient.register(email, password, displayName) as any;
      setUser(response.user);
      apiClient.setToken(response.token);
      socketClient.setToken(response.token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password) as any;
      setUser(response.user);
      apiClient.setToken(response.token);
      apiClient.setToken(response.token);
      socketClient.setToken(response.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      apiClient.clearToken();
      socketClient.disconnect();
    }
  };

  const value: AuthContextValue = { user, loading, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


