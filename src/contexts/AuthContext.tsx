import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, type AuthUser } from 'aws-amplify/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface User {
  username: string;
  id: string;
  email?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const authUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setCurrentUser({
        username: authUser.username,
        id: authUser.userId,
        email: attributes.email
      });
    } catch (err) {
      console.error('Error fetching current user:', err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      
      if (isSignedIn) {
        const authUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        setCurrentUser({
          username: authUser.username,
          id: authUser.userId,
          email: attributes.email
        });
        setError(null);
        setIsGuest(false);
      } else {
        // Handle additional authentication steps if needed
        switch (nextStep.signInStep) {
          case 'CONFIRM_SIGN_UP':
            setError('Please confirm your email address');
            break;
          case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
            setError('Please change your password');
            break;
          default:
            setError(`Additional step required: ${nextStep.signInStep}`);
        }
        throw new Error(`Authentication requires additional step: ${nextStep.signInStep}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setIsGuest(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const guestUser: User = {
        username: 'guest',
        id: `guest-${Date.now()}`,
      };
      setCurrentUser(guestUser);
      setIsGuest(true);
      setError(null);
    } catch (err) {
      setError('Failed to login as guest. Please try again.');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    loginAsGuest,
    isGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
