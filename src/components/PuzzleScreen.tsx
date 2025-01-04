import React, { useState, useEffect, useCallback } from 'react';
import { puzzleService } from '../services/puzzleService';
import type { Puzzle } from '../types/puzzle';
import './puzzlescreen.css';

// Update PuzzleScreen to handle sound
interface PuzzleScreenProps {
  categoryId?: string;
  puzzle?: Puzzle;
  onComplete: (coinsEarned: number) => void;
  onBack: () => void;
  isGuestMode?: boolean;
  isSoundEnabled?: boolean;
}

export function PuzzleScreen({
  categoryId,
  onComplete,
  onBack,
  isGuestMode = false,
  isSoundEnabled = true,
}: PuzzleScreenProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [loading, setLoading] = useState(!isGuestMode);
  const [error, setError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [attempts, setAttempts] = useState(0);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Load puzzles effect for authenticated users
  useEffect(() => {
    if (isGuestMode || !categoryId) return;

    const loadPuzzles = async () => {
      try {
        setLoading(true);
        const fetchedPuzzles = await puzzleService.getPuzzleWithRetry(categoryId); // Assuming this returns 5 puzzles
        setPuzzles(fetchedPuzzles);
        setTimeLeft(fetchedPuzzles[0].timeLimit || 60);
        resetPuzzleState(); // Reset state for first puzzle
      } catch (err) {
        console.error('Failed to load puzzles:', err);
        setError('Failed to load puzzles');
      } finally {
        setLoading(false);
      }
    };

    loadPuzzles();
  }, [categoryId, isGuestMode]);

  // Reset puzzle state when moving to a new puzzle
  const resetPuzzleState = () => {
    setUserAnswer('');
    setIsCorrect(null);
    setShowHint(false);
    setAttempts(0);
    setIsTimeWarning(false);
  };

  // Timer effect
  useEffect(() => {
    if (!puzzles[currentPuzzleIndex] || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 10) {
          setIsTimeWarning(true);
        }

        if (prev <= 1) {
          clearInterval(timer);
          setIsCorrect(false);
          onComplete(1); // Minimum coins for timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [puzzles, currentPuzzleIndex, timeLeft, isGuestMode, onComplete]);

  // Handle submitting answer and moving to next puzzle
  const handleSubmitAnswer = async () => {
    if (!puzzles[currentPuzzleIndex] || !userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setAttempts((prev) => prev + 1);

    const currentPuzzle = puzzles[currentPuzzleIndex];
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === currentPuzzle.correctAnswer.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      const coins = calculateCoins(timeLeft, attempts);
      playSound('success');

      if (!isGuestMode) {
        await puzzleService.updateProgressWithRetry(currentPuzzle.category, coins);
      }

      setTimeout(() => {
        // Move to next puzzle
        if (currentPuzzleIndex < puzzles.length - 1) {
          setCurrentPuzzleIndex((prevIndex) => prevIndex + 1);
          resetPuzzleState();
        } else {
          onComplete(10); // Total coins when all puzzles are completed
        }
      }, 1500);
    } else {
      playSound('error');
      if (attempts >= 2 && !showHint) {
        setShowHint(true);
      }
    }

    setIsSubmitting(false);
  };

  // Handle clicking an option
  const handleOptionClick = (option: string) => {
    setUserAnswer(option);
  };

  // Calculate coins based on time and attempts
  const calculateCoins = useCallback((timeRemaining: number, attemptCount: number): number => {
    const baseCoins = 10;
    const timeBonus = Math.floor(timeRemaining / 10);
    const attemptPenalty = Math.max(0, attemptCount - 1) * 2;
    return Math.max(Math.floor((baseCoins + timeBonus - attemptPenalty) * 1), 1);
  }, []);

  // Play sound for success or error
  const playSound = useCallback((soundType: 'success' | 'error') => {
    if (!isSoundEnabled) return;
    const sound = new Audio(`/sounds/${soundType}.mp3`);
    sound.play().catch(() => {});
  }, [isSoundEnabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  const currentPuzzle = puzzles[currentPuzzleIndex];

  return (
    <div className="puzzle-screen-container min-h-screen py-8 px-4 flex flex-col">
      {/* Header Section */}
      <div className="container mx-auto mb-8">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="game-button-primary">← Back</button>
          <div className={`timer-display ${timeLeft < 10 ? 'timer-warning' : ''}`}>
            <div className="timer-circle">
              <span className="timer-text">{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Puzzle Section */}
      <div className="container mx-auto flex-1 flex items-start justify-center mt-4">
        <div className="game-panel max-w-3xl w-full">
          <div className="space-y-6">
            <div className="panel-header text-center">
              <h2 className="text-2xl font-gaming text-white glow-text mb-6">
                IQ {currentPuzzleIndex + 1} of {puzzles.length}
              </h2>
            </div>

            <div className="puzzle-content">
              {/* Puzzle Question */}
              <div className="puzzle-question mb-8">
                <p className="text-lg text-white leading-relaxed text-justify">{currentPuzzle?.content}</p>
              </div>

              {/* Answer Options */}
              <div className="options-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentPuzzle?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      option-button
                      p-4 rounded-lg
                      text-lg font-medium
                      transition-all duration-200
                      ${userAnswer === option 
                        ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-lg transform scale-105' 
                        : 'bg-gray-700 text-gray-100 hover:bg-gray-600 border-2 border-transparent'
                      }
                      ${isCorrect !== null 
                        ? userAnswer === option 
                          ? isCorrect 
                            ? 'bg-green-600 border-green-400' 
                            : 'bg-red-600 border-red-400'
                          : 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                      }
                      disabled:opacity-50
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
                    `}
                    disabled={isCorrect !== null || isSubmitting}
                    aria-pressed={userAnswer === option}
                    role="radio"
                    aria-checked={userAnswer === option}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback Section */}
              {isCorrect !== null && (
                <div className={`feedback-panel ${isCorrect ? 'success' : 'error'} mt-6`}>
                  {isCorrect ? (
                    <div className="success-animation text-center">
                      <span className="success-icon text-4xl block mb-2">🎉</span>
                      <p className="text-lg">Correct! Well done!</p>
                    </div>
                  ) : (
                    <div className="error-content text-center">
                      <p className="mb-2">Not quite right. Try again!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Reveal Section */}
              {isCorrect === false && (
                <div className="answer-reveal-panel mt-6">
                  <h3 className="text-yellow-400 font-gaming mb-2">Answer:</h3>
                  <p className="text-white text-lg">{currentPuzzle?.correctAnswer}</p>
                </div>
              )}

              {/* Submit Answer Button */}
              <button
                onClick={handleSubmitAnswer}
                className="game-button-submit w-full mt-4"
                disabled={!userAnswer.trim() || isSubmitting || timeLeft === 0}
              >
                {isSubmitting ? <span className="loading-dots">Checking</span> : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
