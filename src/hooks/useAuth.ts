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
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const user = await authService.login(username, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };
}