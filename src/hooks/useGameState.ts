import { useState, useEffect } from 'react';
import type { Category, UserProfile } from '../types/game';
import { getUserProfile, updateUserProfile } from '../services/aws/userService';
import { updateScore } from '../services/aws/leaderboardService.ts';

import { mockPuzzles } from '../services/puzzleService';

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
    coins: 1000,
    level: 1,
    completedPuzzles: 0,
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
      coins: userProfile.coins + amount,
    };
    
    setUserProfile(newProfile);
    await updateUserProfile(userId, { coins: newProfile.coins });
    await updateScore('default', userProfile.completedPuzzles * 100, newProfile.coins);
  };

  const completeCategory = async (category: Category): Promise<void> => {
    const newProfile = {
      ...userProfile,
      completedPuzzles: userProfile.completedPuzzles + 1,
      level: Math.floor((userProfile.completedPuzzles + 1) / 5) + 1,
    };
    
    setUserProfile(newProfile);
    await updateUserProfile(userId, {
      completedPuzzles: newProfile.completedPuzzles,
      level: newProfile.level,
    });
  };

  return {
    userProfile,
    updateCoins,
    completeCategory,
  };
}