// src/types/graphql.ts

// Match the PuzzleResponse type from schema
export interface GeneratePuzzleResponse {
  generatePuzzle: {
    generatePuzzle: {
      content: string;
      options: string[];
      hint: string;
      difficulty: number;
      correctAnswer: string;
      explanation: string;
    }[];
  };
}

export interface UpdateProgressResponse {
  updateProgress: boolean;  // required (!)
}
