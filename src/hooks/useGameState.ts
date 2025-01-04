import { useState, useEffect } from 'react';
import type { Category, UserProfile } from '../types/game';
import { getUserProfile, updateUserProfile } from '../services/aws/userService';
import { leaderboardService } from '../services/aws/leaderboardService';

export function useGameState(
  userId: string = 'default',
  initialCategory?: Category
) {
  const defaultCategory: Category = {
    id: 'default',
    name: 'Default',
    icon: 'default-icon',
    progress: 0,
    totalPuzzles: 0,
    description: '',
    difficulty: 'medium'
  };
  
  const selectedCategory: Category = initialCategory || defaultCategory;

  const [userProfile, setUserProfile] = useState<UserProfile>({
    userId: 'default',
    username: 'default',
    stats: {
      totalGames: 0,
      totalScore: 0,
      totalCoins: 1000,
      completedCategories: []
    },
    preferences: {
      theme: 'light',
      soundEnabled: true
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateCoins = async (amount: number) => {
    const newProfile = {
      ...userProfile,
      stats: {
        ...userProfile.stats,
        totalCoins: userProfile.stats.totalCoins + amount
      }
    };
    
    setUserProfile(newProfile);
    await updateUserProfile(userId, {
      stats: {
        totalCoins: newProfile.stats.totalCoins
      }
    });

    await leaderboardService.submitScore(
      userId,
      userProfile.stats.totalScore,
      newProfile.stats.totalCoins
    );
  };

  const completeCategory = async (category: Category): Promise<void> => {
    const newProfile = {
      ...userProfile,
      stats: {
        ...userProfile.stats,
        totalGames: userProfile.stats.totalGames + 1,
        totalScore: userProfile.stats.totalScore + 100,
        completedCategories: userProfile.stats.completedCategories.includes(category.id)
          ? userProfile.stats.completedCategories
          : [...userProfile.stats.completedCategories, category.id]
      }
    };
    
    setUserProfile(newProfile);
    await updateUserProfile(userId, {
      stats: {
        totalGames: newProfile.stats.totalGames,
        totalScore: newProfile.stats.totalScore,
        completedCategories: newProfile.stats.completedCategories
      }
    });
  };

  return {
    userProfile,
    updateCoins,
    completeCategory,
  };
}
