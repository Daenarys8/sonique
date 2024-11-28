import React, { useState, useEffect } from 'react';
import { generatePuzzle } from '../services/puzzleGenerationService';

interface PuzzleScreenProps {
  categoryId: string | undefined;
  onComplete: () => void;
  onBack: () => void;
}

export function PuzzleScreen({ categoryId, onComplete, onBack }: PuzzleScreenProps) {
  const [puzzle, setPuzzle] = useState<PuzzleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const generatedPuzzle = await generatePuzzle(categoryId);
        setPuzzle(generatedPuzzle);
      } catch (err) {
        setError('Failed to load puzzle');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPuzzle();
  }, [categoryId]);

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

  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSubmitAnswer = () => {
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Puzzle Challenge</h2>
          <p className="text-lg mb-4">{puzzle?.question}</p>
          
          {!showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="text-indigo-600 hover:text-indigo-800 mb-4"
            >
              Need a hint?
            </button>
          )}
          
          {showHint && (
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <p className="text-indigo-800">{puzzle?.hint}</p>
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
              Your Answer:
            </label>
            <input
              type="text"
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter your answer here"
            />
            <button
              onClick={handleSubmitAnswer}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={!userAnswer.trim()}
            >
              Submit Answer
            </button>
          </div>

          {isCorrect !== null && (
            <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {isCorrect ? (
                <p>Correct! Well done! 🎉</p>
              ) : (
                <div>
                  <p className="mb-2">Not quite right. Try again!</p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Show Answer
                  </button>
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Answer:</h3>
              <p>{puzzle?.answer}</p>
              <h3 className="font-bold mt-4 mb-2">Explanation:</h3>
              <p>{puzzle?.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}