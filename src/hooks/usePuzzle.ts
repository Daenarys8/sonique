import { useState, useCallback } from 'react';
import type { Puzzle, PuzzleResult } from '../types/puzzle';
import { validateAnswer } from '../utils/puzzleUtils';
import { calculateReward } from '../utils/gameUtils';

export function usePuzzle(initialPuzzle: Puzzle) {
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle);
  const [startTime] = useState<number>(Date.now());

  const checkAnswer = useCallback((userInput: string): PuzzleResult => {
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
  };
}