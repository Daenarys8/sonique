import type { Puzzle } from '../types/puzzle';
import { scrambleWords, scrambleEquation } from '../utils/puzzleUtils';

const mockPuzzles: Record<string, Puzzle[]> = {
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
  ],
};

export async function getPuzzle(category: string): Promise<Puzzle> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
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