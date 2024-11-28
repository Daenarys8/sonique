import React, { useState, useEffect } from 'react';
import { puzzleService } from '../services/aws/puzzleService';
import { leaderboardService } from '../services/aws/leaderboardService';
import { bedrockService } from '../services/aws/bedrockService';
import { LoadingPage } from './LoadingPage';
import { CategoryGrid } from './CategoryGrid';
import { GamePlay } from './GamePlay';
import { UserProfile } from './UserProfile';

interface GameState {
  isLoading: boolean;
  currentScreen: 'loading' | 'categories' | 'gameplay';
  selectedCategory: string | null;
  currentPuzzle: {
    id: string;
    category: string;
    scrambled: string;
    answer: string;
    hint: string;
    difficulty: number;
    timeLimit?: number;
  } | null;
  userProgress: {
    [category: string]: number;
  };
  error: string | null;
}

interface Score {
  username: string;
  score: number;
  timestamp: string;
}

function PuzzleGame() {
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    currentScreen: 'loading',
    selectedCategory: null,
    currentPuzzle: null,
    userProgress: {},
    error: null
  });
  const [topScores, setTopScores] = useState<Score[]>([]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const scores = await leaderboardService.getTopScores();
        setTopScores(scores);
        
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            isLoading: false,
            currentScreen: 'categories'
          }));
        }, 3000);
      } catch (err) {
        setGameState(prev => ({
          ...prev,
          error: 'Failed to initialize game. Please try again.',
          isLoading: false
        }));
        console.error(err);
      }
    };

    initializeGame();
  }, []);

  const handleCategorySelect = async (category: string) => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      const prompt = `Generate a puzzle for category: ${category}. Include a well-known quote, word, poem, chemical reaction, mathematical equation, or historical fact based on the category.`;
      const response = await bedrockService.invokeBedrock(prompt);
      
      const puzzle = {
        id: Date.now().toString(),
        category,
        scrambled: response.scrambledText,
        answer: response.originalText,
        hint: response.hint,
        difficulty: Math.min(Math.floor(gameState.userProgress[category] / 3) + 1, 5),
        timeLimit: 60 + (Math.floor(gameState.userProgress[category] / 3) * 30)
      };

      setGameState(prev => ({
        ...prev,
        isLoading: false,
        currentScreen: 'gameplay',
        selectedCategory: category,
        currentPuzzle: puzzle
      }));
    } catch (err) {
      setGameState(prev => ({
        ...prev,
        error: 'Failed to generate puzzle. Please try again.',
        isLoading: false
      }));
      console.error(err);
    }
  };

  // Removed unused code - gameplay logic moved to usePuzzle hook

  const handleGameComplete = async (coinsEarned: number) => {
    if (!gameState.selectedCategory) return;

    const newProgress = {
      ...gameState.userProgress,
      [gameState.selectedCategory]: (gameState.userProgress[gameState.selectedCategory] || 0) + 1
    };

    setGameState(prev => ({
      ...prev,
      userProgress: newProgress,
      currentScreen: 'categories',
      currentPuzzle: null,
      selectedCategory: null
    }));

    try {
      // Update user progress in the database
      await puzzleService.updateProgress(gameState.selectedCategory, coinsEarned);
      
      // Update leaderboard
      await leaderboardService.submitScore(localStorage.getItem('username') || 'Guest', coinsEarned);
      const newScores = await leaderboardService.getTopScores();
      setTopScores(newScores);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (gameState.isLoading) {
    return <LoadingPage onLoadComplete={() => {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        currentScreen: 'categories'
      }));
    }} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {gameState.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {gameState.error}
        </div>
      )}

      {gameState.currentScreen === 'categories' && (
        <CategoryGrid
          onCategorySelect={(category) => handleCategorySelect(category.id)}
          userProgress={gameState.userProgress}
        />
      )}

      {gameState.currentScreen === 'gameplay' && (
        gameState.currentPuzzle ? (
          <GamePlay
            puzzle={gameState.currentPuzzle}
            onComplete={handleGameComplete}
            onNextPuzzle={() => handleCategorySelect(gameState.selectedCategory!)}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Top Scores</h3>
          <div className="space-y-2">
            {topScores.map((score, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{score.username}</span>
                <span className="text-indigo-600 font-bold">{score.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-1">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}

export default PuzzleGame;
