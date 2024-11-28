import type { Category } from '../types/game';

export const calculateProgress = (completed: number, total: number): number => {
  return Math.min(100, (completed / total) * 100);
};

export const calculateReward = (difficulty: number, timeSpent: number): number => {
  const baseReward = 100;
  const timeBonus = Math.max(0, 60 - timeSpent) * 2;
  const difficultyMultiplier = 1 + (difficulty * 0.1);
  
  return Math.round((baseReward + timeBonus) * difficultyMultiplier);
};

export const getDifficultyLabel = (category: Category): string => {
  const difficultyMap: Record<string, string> = {
    literature: 'Medium',
    science: 'Hard',
    history: 'Medium',
    math: 'Hard',
    sports: 'Medium',
    music: 'Medium',
    movies: 'Easy',
    random: 'Variable',
  };
  
  return difficultyMap[category.id] || 'Medium';
};