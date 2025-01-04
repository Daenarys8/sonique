export type Category = {
  id: string;
  name: string;
  progress: number;
  totalPuzzles: number;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  backgroundImage?: string;
};

export interface UserProfile {
  userId: string;
  username: string;
  email?: string;
  stats: {
    totalGames: number;
    totalScore: number;
    totalCoins: number;
    completedCategories: string[];
  };
  preferences?: {
    theme?: 'light' | 'dark';
    soundEnabled?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  coins: number;
};
