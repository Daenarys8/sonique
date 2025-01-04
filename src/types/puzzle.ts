export type PuzzleResult = {
  isCorrect: boolean;
  timeSpent: number;
  coinsEarned: number;
};

// src/types/puzzle.ts
export interface Puzzle {
  id: string;
  category: string;
  content: string;
  correctAnswer: string;  
  options: string[];      
  hint?: string;
  difficulty: number;
  timeLimit: number;
  explanation?: string;   
}

