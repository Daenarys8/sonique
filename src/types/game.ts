export type Category = {
  id: string;
  name: string;
  icon: string;
  progress: number;
  totalPuzzles: number;
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