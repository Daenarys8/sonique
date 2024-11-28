export type Category = {
  id: string;
  name: string;
  icon: string;
  progress: number;
  totalPuzzles: number;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type UserProfile = {
  coins: number;
  level: number;
  completedPuzzles: number;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  coins: number;
};