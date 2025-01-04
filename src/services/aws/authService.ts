// src/services/aws/authService.ts
import { getCurrentUser, signIn, signOut, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

interface UserStats {
  totalGames: number;
  totalScore: number;
  totalCoins: number;
  highestLevel: number;
  lastPuzzleCompleted: string;
}

interface User {
  username: string;
  email: string;
  stats: UserStats;
}

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const authUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // Initialize with default stats since we don't have a stats endpoint yet
      const stats: UserStats = {
        totalGames: 0,
        totalScore: 0,
        totalCoins: 0,
        highestLevel: 1,
        lastPuzzleCompleted: ''
      };

      return {
        username: authUser.username,
        email: attributes.email || '',
        stats
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async login(username: string, password: string): Promise<User> {
    try {
      const { isSignedIn } = await signIn({ 
        username, 
        password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH"
        }
      });

      if (!isSignedIn) {
        throw new Error('Sign in failed');
      }

      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Failed to get user data after login');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async updateStats(stats: Partial<UserStats>): Promise<UserStats> {
    try {
      // Since we don't have a stats endpoint, we'll just return the stats
      // You can implement this later when you create the stats Lambda function
      return stats as UserStats;
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  },

  async getUserProgress(): Promise<any> {
    try {
      const session = await fetchAuthSession();
      if (!session.tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const user = await getCurrentUser();
      
      const response = await fetch(`${API_ENDPOINT}/progress/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${session.tokens.accessToken.toString()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }
};
