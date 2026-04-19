import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('taskflowToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('taskflowUser')) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('taskflowToken', token);
    } else {
      localStorage.removeItem('taskflowToken');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('taskflowUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('taskflowUser');
    }
  }, [user]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token || user) return;
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setToken(null);
        setUser(null);
      }
    };

    loadUserProfile();
  }, [token, user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      setToken(response.data.token);
      setUser(response.data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', credentials);
      setToken(response.data.token);
      setUser(response.data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
