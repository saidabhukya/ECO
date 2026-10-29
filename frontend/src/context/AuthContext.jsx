import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eco_track_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eco_track_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('eco_track_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('eco_track_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('[Auth Error] Failed to verify session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('eco_track_token', res.data.token);
      localStorage.setItem('eco_track_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('eco_track_token');
      localStorage.removeItem('eco_track_user');
      window.location.hash = '#/login';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('eco_track_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
