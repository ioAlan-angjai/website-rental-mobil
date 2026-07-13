'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Customer } from '@/types';

interface AuthContextType {
  user: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<Customer>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Mock implementation - Phase 2 akan integrate dengan backend
      console.log('Login attempt:', email);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<Customer>) => {
    setIsLoading(true);
    try {
      console.log('Register attempt:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
