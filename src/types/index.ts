export interface User {
  id: string;
  username: string;
}

export interface Puzzle {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: string;
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  score: number;
  lives: number;
  level: number;
}

// Category type has been moved to game.ts to avoid duplication
export type { Category } from './game';

export type ErrorType = {
  message: string;
  code?: string;
  details?: unknown;
};

export interface ApiResponse<T> {
  data?: T;
  error?: ErrorType;
  loading?: boolean;
}