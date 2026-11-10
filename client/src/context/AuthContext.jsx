import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('notegen_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('notegen_token');
    localStorage.removeItem('notegen_user');
    setToken(null);
    setUser(null);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      localStorage.setItem('notegen_token', res.token);
      localStorage.setItem('notegen_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      closeAuth();
      return res.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    if (res.token && res.user) {
      localStorage.setItem('notegen_token', res.token);
      localStorage.setItem('notegen_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      closeAuth();
      return res.user;
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('notegen_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
          setToken(savedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        authModalOpen,
        authMode,
        openAuth,
        closeAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
