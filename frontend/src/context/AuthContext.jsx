import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState({
    email: '',
    businessName: localStorage.getItem('business_name') || 'My Business',
    businessType: localStorage.getItem('business_type') || 'general'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  // Verify user session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await api.getMe();
        setToken('authenticated');
        setUser({
          email: data.email,
          businessName: data.business_name,
          businessType: data.business_type
        });
        localStorage.setItem('business_name', data.business_name);
        localStorage.setItem('business_type', data.business_type);
      } catch (err) {
        setToken('');
        setUser({ email: '', businessName: 'My Business', businessType: 'general' });
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('business_name', data.user.business_name);
      localStorage.setItem('business_type', data.user.business_type);
      setToken('authenticated');
      setUser({
        email: data.user.email,
        businessName: data.user.business_name,
        businessType: data.user.business_type
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, businessName, businessType) => {
    setLoading(true);
    try {
      const data = await api.register(email, password, businessName, businessType);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('onboarding_complete');
    localStorage.removeItem('business_name');
    localStorage.removeItem('business_type');
    setToken('');
    setUser({ email: '', businessName: 'My Business', businessType: 'general' });
  };

  const updateProfileState = (businessName, businessType, email) => {
    localStorage.setItem('business_name', businessName);
    localStorage.setItem('business_type', businessType);
    setUser(prev => ({
      ...prev,
      businessName,
      businessType,
      ...(email ? { email } : {})
    }));
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, updateProfileState }}>
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
