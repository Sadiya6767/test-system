import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('admin_user');
      const savedToken = localStorage.getItem('admin_token');
      if (savedUser && savedToken) {
        setAdmin(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      console.error('Failed to parse saved auth state', e);
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await adminAPI.login({ email, password });
    const { token: receivedToken, admin: receivedAdmin } = response.data;

    localStorage.setItem('admin_token', receivedToken);
    localStorage.setItem('admin_user', JSON.stringify(receivedAdmin));

    setToken(receivedToken);
    setAdmin(receivedAdmin);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
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