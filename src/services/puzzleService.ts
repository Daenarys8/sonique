import type { Puzzle } from '../types/puzzle';
import { scrambleWords, scrambleEquation } from '../utils/puzzleUtils';

export const mockPuzzles: Record<string, Puzzle[]> = {
  literature: [
    {
      id: 'lit1',
      category: 'literature',
      content: 'To be or not to be that is the question',
      scrambled: '',
      hint: 'Famous Shakespeare quote from Hamlet',
      difficulty: 2,
      timeLimit: 60,
    },
    {
      id: 'lit2',
      category: 'literature',
      content: 'All that glitters is not gold',
      scrambled: '',
      hint: 'Shakespeare wisdom from Merchant of Venice',
      difficulty: 1,
      timeLimit: 45,
    }
  ],
  math: [
    {
      id: 'math1',
      category: 'math',
      content: '2 + 2 = 4',
      scrambled: '',
      hint: 'Basic addition equation',
      difficulty: 1,
      timeLimit: 30,
    },
    {
      id: 'math2',
      category: 'math',
      content: '3 × 4 = 12',
      scrambled: '',
      hint: 'Simple multiplication',
      difficulty: 2,
      timeLimit: 40,
    }
  ],
  science: [
    {
      id: 'sci1',
      category: 'science',
      content: 'Force equals mass times acceleration',
      scrambled: '',
      hint: 'Newton\'s Second Law of Motion',
      difficulty: 2,
      timeLimit: 50,
    }
  ],
  history: [
    {
      id: 'hist1',
      category: 'history',
      content: 'In fourteen hundred ninety-two Columbus sailed the ocean blue',
      scrambled: '',
      hint: 'Famous historical rhyme about exploration',
      difficulty: 1,
      timeLimit: 45,
    }
  ]
};

import { generatePuzzle as bedrockGeneratePuzzle } from './aws/bedrockService';

export async function getPuzzle(category: string): Promise<Puzzle> {
  try {
    // Try to generate a puzzle using Bedrock first
    const generated = await bedrockGeneratePuzzle(category, 'medium');
    if (generated) {
      const newPuzzle: Puzzle = {
        id: `${category}-${Date.now()}`,
        category,
        content: generated,
        scrambled: '',
        hint: `AI generated ${category} puzzle`,
        difficulty: 2,
        timeLimit: 60
      };
      return newPuzzle;
    }
  } catch (error) {
    console.warn('Failed to generate puzzle with Bedrock, falling back to mock puzzles:', error);
  }

  // Fallback to mock puzzles
  const puzzles = mockPuzzles[category] || [];
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  
  if (!puzzle) {
    throw new Error(`No puzzles found for category: ${category}`);
  }
  
  // Scramble the content based on category
  puzzle.scrambled = category === 'math' 
    ? scrambleEquation(puzzle.content)
    : scrambleWords(puzzle.content);
    
  return puzzle;
}