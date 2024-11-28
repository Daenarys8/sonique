export type Puzzle = {
  id: string;
  category: string;
  content: string;
  scrambled: string;
  hint: string;
  difficulty: number;
  timeLimit?: number;
};

export type PuzzleResult = {
  isCorrect: boolean;
  timeSpent: number;
  coinsEarned: number;
};