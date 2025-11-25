

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial session check
  const [isLoggingIn, setIsLoggingIn] = useState(false); // For login action
  const [isSigningUp, setIsSigningUp] = useState(false); // For signup action

  useEffect(() => {
    // Check for an existing session when the app loads
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
    } catch (error) {
      // Re-throw the error so the calling component can handle it (e.g., show a message)
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsSigningUp(true);
    try {
      // Create the admin user
      const userData = { name, email, role: 'ADMIN' as const };
      await authService.createUser(userData, password);
      
      // Automatically log them in after successful signup by calling the login function
      await login(email, password);

    } catch (error) {
      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsSigningUp(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    isLoading,
    isLoggingIn,
    isSigningUp,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
