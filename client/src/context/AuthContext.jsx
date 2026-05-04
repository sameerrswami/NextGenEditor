import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // Axios response interceptor to handle 401 globally
  useEffect(() => {
    const PUBLIC_PATHS = ['/login', '/forgot-password'];
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const isPublicPage = PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p));
          if (!isPublicPage) {
            logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [logout]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, [token]);

  const setAuthData = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // ─── Core Auth ────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setAuthData(newToken, newUser);
    return newUser;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    setAuthData(newToken, newUser);
    return newUser;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/user/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout, loading, refreshUser,
      forgotPassword, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

