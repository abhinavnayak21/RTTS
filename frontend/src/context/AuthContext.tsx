import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rtts_token') || null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async (authToken: string): Promise<User | null> => {
    try {
      const response = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const normalizedUser = {
        ...response.data,
        role: (response.data.role?.toLowerCase() || 'customer') as UserRole,
      };
      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      console.error('Failed to fetch user context:', err);
      localStorage.removeItem('rtts_token');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (accessToken: string): Promise<User | null> => {
    localStorage.setItem('rtts_token', accessToken);
    setToken(accessToken);
    const userData = await fetchUser(accessToken);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('rtts_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
