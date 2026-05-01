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
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          window.location.href = '/login';
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

  // ─── Login (supports email or phone) ──────────────────────────────────────
  const login = async (identifier, password, type = 'email') => {
    const payload = type === 'email' ? { email: identifier, password } : { phone: identifier, password };
    const res = await api.post('/auth/login', payload);
    if (!res.data) throw new Error('No data received from server');
    const { token: newToken, user: newUser } = res.data;
    setAuthData(newToken, newUser);
    return newUser;
  };

  // ─── Traditional Register ─────────────────────────────────────────────────
  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    if (!res.data) throw new Error('No data received from server');
    const { token: newToken, user: newUser } = res.data;
    setAuthData(newToken, newUser);
    return newUser;
  };

  // ─── OTP: Send Email OTP ──────────────────────────────────────────────────
  const sendEmailOTP = async (email, purpose = 'verification') => {
    const res = await api.post('/auth/send-email-otp', { email, purpose });
    return res.data;
  };

  // ─── OTP: Send Phone OTP ──────────────────────────────────────────────────
  const sendPhoneOTP = async (phone) => {
    const res = await api.post('/auth/send-phone-otp', { phone });
    return res.data;
  };

  // ─── OTP: Verify Email OTP ────────────────────────────────────────────────
  const verifyEmailOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-email-otp', { email, otp });
    return res.data;
  };

  // ─── OTP: Verify Phone OTP ────────────────────────────────────────────────
  const verifyPhoneOTP = async (phone, otp) => {
    const res = await api.post('/auth/verify-phone-otp', { phone, otp });
    return res.data;
  };

  // ─── OTP: Register with OTP ───────────────────────────────────────────────
  const registerWithOTP = async (username, password, otp, method, email, phone) => {
    const payload = { username, password, otp, method };
    if (method === 'email') payload.email = email;
    if (method === 'phone') payload.phone = phone;

    const res = await api.post('/auth/register-with-otp', payload);
    if (!res.data) throw new Error('No data received from server');
    const { token: newToken, user: newUser } = res.data;
    setAuthData(newToken, newUser);
    return newUser;
  };

  // ─── Forgot Password ──────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  // ─── Reset Password ───────────────────────────────────────────────────────
  const resetPassword = async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  };

  // ─── Change Password (Authenticated) ──────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  // ─── Refresh User ─────────────────────────────────────────────────────────
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
      sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP,
      registerWithOTP, forgotPassword, resetPassword, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
