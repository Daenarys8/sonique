// src/services/puzzleService.ts
import { generateClient } from 'aws-amplify/api';
import type { Puzzle } from '../types/puzzle';
import type { GeneratePuzzleResponse, UpdateProgressResponse } from '../types/graphql';
import { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient({
  authMode: 'userPool'
});

const GENERATE_PUZZLE_MUTATION = `
  mutation GeneratePuzzle($category: String!) { 
    generatePuzzle(category: $category) {
      generatePuzzle {
        content
        options
        hint
        difficulty
        correctAnswer
        explanation
      }
    }
  }
`;

const UPDATE_PROGRESS_MUTATION = `
  mutation UpdateProgress($category: String!, $coins: Int!) { 
    updateProgress(category: $category, coins: $coins)
  }
`;

export const puzzleService = {
  getPuzzle: async (category: string): Promise<Puzzle[]> => {
    try {
      console.log('Generating puzzle for category:', category);

      const response = await client.graphql({
        query: GENERATE_PUZZLE_MUTATION,
        variables: {
          category
        }
      }) as GraphQLResult<GeneratePuzzleResponse>;

      // Check if response and data exist
      if (!response || !('data' in response) || !response.data?.generatePuzzle?.generatePuzzle) {
        throw new Error('Puzzle generation failed - no data returned');
      }
      
      const puzzlesData = response.data.generatePuzzle.generatePuzzle;
      const puzzleArray = Array.isArray(puzzlesData) ? puzzlesData : [puzzlesData];
      
      const puzzles: Puzzle[] = puzzleArray.map((puzzleData, index) => ({
        id: `${category}-${Date.now()}-${index}`,
        category,
        content: puzzleData.content,
        correctAnswer: puzzleData.correctAnswer,
        options: puzzleData.options,
        hint: puzzleData.hint || '',
        difficulty: puzzleData.difficulty,
        timeLimit: 60,
        explanation: puzzleData.explanation
      }));

      return puzzles;

    } catch (error) {
      console.error('Failed to get puzzle from API:', error);
      throw new Error(`Failed to generate puzzles for category: ${category}`);
    }
  },

  // Add getPuzzleWithRetry
  getPuzzleWithRetry: async (
    category: string, 
    maxRetries = 3
  ): Promise<Puzzle[]> => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const puzzles = await puzzleService.getPuzzle(category);
        return puzzles;  // Return the array of puzzles
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff with max delay of 5 seconds
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.debug(`Retry attempt ${attempt} for category ${category} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`Failed to generate puzzles for category: ${category} after multiple attempts`);
  },

  updateProgress: async (category: string, coins: number): Promise<void> => {
    // Input validation
    if (!category || typeof category !== 'string') {
      throw new Error('Invalid category provided');
    }

    if (typeof coins !== 'number' || coins < 0) {
      throw new Error('Invalid coins amount provided');
    }

    try {
      const response = await client.graphql<UpdateProgressResponse>({
        query: UPDATE_PROGRESS_MUTATION,
        variables: {
          category,
          coins
        },
      }) as GraphQLResult<UpdateProgressResponse>;

      // Check for GraphQL errors
      if (response.errors?.length) {
        const errorMessage = response.errors
          .map(error => error.message)
          .join(', ');
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      if (!response.data || response.data.updateProgress !== true) {
        throw new Error('Failed to update progress: Server returned invalid response');
      }

      // Log success for debugging
      console.debug('Progress updated successfully', {
        category,
        coins,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to update progress:', {
        error,
        category,
        coins,
        timestamp: new Date().toISOString()
      });

      if (error instanceof Error) {
        throw error; // Preserve the original error
      }
      throw new Error('Failed to update progress');
    }
  },

  // Optional: Add retry wrapper
  updateProgressWithRetry: async (
    category: string, 
    coins: number, 
    maxRetries = 3
  ): Promise<void> => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await puzzleService.updateProgress(category, coins);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) break;
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Failed to update progress after multiple attempts');
  }
};
