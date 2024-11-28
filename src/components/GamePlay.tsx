import React, { useState } from 'react';
import { Send, Clock, Lightbulb } from 'lucide-react';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types/puzzle';

type GamePlayProps = {
  puzzle: Puzzle;
  onComplete: (coinsEarned: number) => void;
  onNextPuzzle: () => void;
};

export function GamePlay({ puzzle, onComplete, onNextPuzzle }: GamePlayProps) {
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const { puzzle: currentPuzzle, checkAnswer } = usePuzzle(puzzle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkAnswer(userInput);
    
    if (result.isCorrect) {
      onComplete(result.coinsEarned);
      onNextPuzzle();
      setUserInput('');
      setShowHint(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Unscramble the {currentPuzzle.category}</h2>
        {currentPuzzle.timeLimit && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{currentPuzzle.timeLimit}s</span>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className="text-lg font-medium text-gray-700 mb-4">{currentPuzzle.scrambled}</p>
        {showHint && (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{currentPuzzle.hint}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Type your answer..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Show Hint</span>
        </button>
      </form>
    </div>
  );
}