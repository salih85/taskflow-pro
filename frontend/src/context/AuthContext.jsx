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

  const login = async (credentials) => {
    setLoading(true);
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
