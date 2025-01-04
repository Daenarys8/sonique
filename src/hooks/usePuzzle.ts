import { useState, useCallback } from 'react';
import type { Puzzle, PuzzleResult } from '../types/puzzle';
import { validateAnswer } from '../utils/puzzleUtils';
import { calculateReward } from '../utils/gameUtils';

export function usePuzzle(initialPuzzle: Puzzle) {
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [startTime, setStartTime] = useState<number>(Date.now()); // Ensure we can reset the start time for new puzzles

  // Resets the start time whenever the puzzle changes (useEffect or when a new puzzle is set)
  const resetPuzzle = (newPuzzle: Puzzle) => {
    setPuzzle(newPuzzle);
    setStartTime(Date.now()); // Reset start time to track new puzzle
  };

  const checkAnswer = useCallback((userInput: string): PuzzleResult => {
    if (!userInput.trim()) {
      return { isCorrect: false, timeSpent: 0, coinsEarned: 0 };
    }

    const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds
    const isCorrect = validateAnswer(userInput, puzzle.content);
    const coinsEarned = isCorrect ? calculateReward(puzzle.difficulty, timeSpent) : 0;

    return {
      isCorrect,
      timeSpent,
      coinsEarned,
    };
  }, [puzzle, startTime]);

  return {
    puzzle,
    checkAnswer,
    resetPuzzle, // Allow resetting the puzzle externally
  };
}
