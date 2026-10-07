import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, api, getToken, setToken, removeToken, setUnauthorizedCallback } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    age?: number;
    country?: string;
    professional_title?: string;
    qualifications?: string;
    certifications?: string;
    years_experience?: number;
    area_of_expertise?: string;
    organization?: string;
    registration_number?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
    window.location.hash = 'dashboard';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (getToken()) {
        const userData = await api.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Set 401 callback
    setUnauthorizedCallback(() => {
      logout();
    });

    refreshUser();
  }, [logout, refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    setTokenState(res.access_token);
    const userData = await api.getMe();
    setUser(userData);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    age?: number;
    country?: string;
    professional_title?: string;
    qualifications?: string;
    certifications?: string;
    years_experience?: number;
    area_of_expertise?: string;
    organization?: string;
    registration_number?: string;
  }) => {
    await api.register(data);
    // Auto login after registration
    await login(data.email, data.password);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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
