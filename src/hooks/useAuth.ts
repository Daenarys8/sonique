import { useState, useEffect } from 'react';
import { authService } from '../services/aws/authService';

interface UserStats {
  totalGames: number;
  totalScore: number;
  totalCoins: number;
}

interface User {
  username: string;
  email: string;
  stats: UserStats;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setError(null);
    } catch (error) {
      console.error('Auth state check failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const user = await authService.login(username, password);
      setUser(user);
      setIsAuthenticated(true);
      setError(null);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser: user,  // rename user to currentUser
    isGuest: !isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
