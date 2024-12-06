// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Checking if user is authenticated');
        if (authService.isAuthenticated()) {
          console.log('User is authenticated');
          const userData = await authService.getUser();
          console.log('User data:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    login: async (credentials) => {
      const response = await authService.login(credentials);
      setUser(user);
      return response;
    },
    register: async (userData) => {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    },
    signup: async (userData) => {
      const response = await authService.signup(userData);
      setUser(response.user);
      return response;
    },
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;