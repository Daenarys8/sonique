import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header';
import { Settings } from './Settings';
import { Profile } from './Profile';
import './GuestGame.css';
import { GameProgress } from './GameProgress';
import { useGameState } from '../hooks/useGameState';

interface Answer {
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  answer_e?: string;
  answer_f?: string;
}

interface CorrectAnswers {
  answer_a_correct: boolean;
  answer_b_correct: boolean;
  answer_c_correct: boolean;
  answer_d_correct: boolean;
  answer_e_correct?: boolean;
  answer_f_correct?: boolean;
}

// Add this type to ensure type safety
type AnswerKey = keyof Answer;
type CorrectAnswerKey = `${AnswerKey}_correct`;

interface QuizQuestion {
  id: number;
  question: string;
  description: string | null;
  answers: Answer;
  correct_answers: CorrectAnswers;
  category: string;
  difficulty: string;
}

export function GuestGame() {
  const navigate = useNavigate();
  const { startGuestSession, endGuestSession } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hp, setHp] = useState(5); // Add this with other state declarations
  const { userProfile } = useGameState();

  useEffect(() => {
    // Initial question fetch when component mounts
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const apiKey = import.meta.env.VITE_QUIZ_API_KEY;
      
      if (!apiKey) {
        console.error('API key is missing');
        return;
      }
  
      const response = await fetch(
        'https://quizapi.io/api/v1/questions?limit=1',  // Only fetch 1 question
        {
          method: 'GET',
          headers: {
            'X-Api-Key': apiKey
          }
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setQuestions(prevQuestions => [...prevQuestions, ...data]); // Add new question to existing ones
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = (answerKey: AnswerKey) => {
    if (showResult) return; // Prevent selecting after showing result
    setSelectedAnswer(answerKey);
  };
  
  const getCurrentQuestion = (): QuizQuestion | undefined => {
    return questions[currentQuestionIndex];
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
  
    const correctAnswerKey = `${selectedAnswer}_correct` as CorrectAnswerKey;
    const isCorrect = currentQuestion.correct_answers[correctAnswerKey];
    
    if (isCorrect) {
      setScore(prev => prev + 100);
      // Increase HP if correct, but don't exceed 5
      setHp(prev => Math.min(prev + 1, 5));
    } else {
      // Decrease HP if wrong
      setHp(prev => prev - 1);
    }
  
    setSelectedAnswer(null);
    setShowResult(false);
  
    // Check if game should end due to HP loss
    if (hp <= 1 && !isCorrect) {
      setGameComplete(true);
      return;
    }
  
    // Fetch next question when moving to next
    fetchQuestion();
    setCurrentQuestionIndex(prev => prev + 1);
  };
  startGuestSession;

  // Update the game complete check
  useEffect(() => {
    if (currentQuestionIndex >= 5 || hp <= 0) {
      setGameComplete(true);
    }
  }, [currentQuestionIndex, hp]);
  

  const handleSignUp = () => {
    endGuestSession();
    navigate('/signup');
  };

  const handleLogin = () => {
    endGuestSession();
    navigate('/login');
  };

  if (gameComplete) {
    return (
      <div
        className="guest-game-wrapper"
        style={{
          backgroundImage: 'url(/assets/guestgame.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
          >
        <Header 
          coins={score}
          onSettingsClick={() => setShowSettings(true)}
          onProfileClick={() => setShowProfile(true)}
          isGuest={true}
        />
        <div className="guest-game-complete flex flex-col items-center justify-center min-h-[400px] text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              {hp <= 0 ? 'Game Over!' : 'Level Complete!'}
            </h2>
            <p className="text-2xl mb-4">Final Score: {score}</p>
            <p className="text-xl mb-4">Remaining HP: {hp}</p>
            <p className="mb-6">Sign up to save your progress and access more gameplay!</p>
          <div className="flex gap-4">
            <button
              onClick={handleSignUp}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign Up
            </button>
            <button
              onClick={handleLogin}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
          className="guest-game-wrapper"
          style={{
            backgroundImage: 'url(/assets/guestgame.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
          }}
        >
      <Header 
        coins={score}
        onSettingsClick={() => setShowSettings(true)}
        onProfileClick={() => setShowProfile(true)}
        isGuest={true}
      />

      {/* Game Progress Container - Positioned below the Header */}
        <div 
          className="game-progress-container mt-0 flex justify-center"
          style={{ 
            minHeight: '50px', // Example to reduce height in guest mode
            transform: 'scale(0.8)', // Scale down the component
            padding: '0px', // Reduce padding
            marginBottom: '-20px',
          }}
        >
          <GameProgress profile={userProfile} hp={hp} />
        </div>

      <div className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="text-white">
            {/* Main Wrapper */}
            <div
              className="guest-game-wrapper flex items-center justify-center"
              style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '5vh',
                marginBottom: '-4px',
              }}
            >
                
              {/* Question Container */}
              <div className="question-container bg-cover bg-center shadow-lg rounded-lg p-8 text-white relative mt-0">
                {/* Add a background image to the question container */}
                <div
                  className="question-container-bg absolute inset-0 rounded-lg z-0"
                  style={{
                    backgroundImage: 'url(/assets/ruins.jpg)', // Container-specific background
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(0.8)',
                  }}
                ></div>
                
                {/* Category and Difficulty */}
                <div className="category-difficulty ">
                IQ {currentQuestionIndex + 1}/5 | {getCurrentQuestion()?.category} | {getCurrentQuestion()?.difficulty}
                  </div>
                {/* Overlay for enhanced readability */}
                <div className="absolute inset-0 bg-black/40 z-10 rounded-lg"></div>
                

                {/* Question Content */}
                <div className="relative z-20">
                  {/* Header or Title */}
                  
                  <h2 className="text-4xl font-bold mb-6 text-center animate-fade-in">
                    {getCurrentQuestion()?.question}
                  </h2>

                  {/* Answer Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(getCurrentQuestion()?.answers || {}).map(([key, value], index) => {
                      if (!value) return null;
                      const answerKey = key as AnswerKey;
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                      return (
                        <button
                          key={answerKey}
                          onClick={() => handleAnswerSelect(answerKey)}
                          className={`p-4 rounded-lg transition-all text-left font-medium text-lg flex items-center gap-4
                            ${selectedAnswer === answerKey
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100/10 hover:bg-gray-100/20 text-gray-200'}`}
                          disabled={showResult}
                        >
                          <span className="option-label bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                            {optionLabel}
                          </span>
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls absolute bottom-8 flex justify-center gap-4">
                {selectedAnswer && !showResult && (
                  <button
                    onClick={() => setShowResult(true)}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition-colors"
                  >
                    Attack
                  </button>
                )}
                {showResult && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold transition-colors"
                  >
                    {currentQuestionIndex >= 4 ? 'Finish Conquest' : 'Load Weapon'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {showSettings && (
        <Settings
          isSoundEnabled={true}
          onToggleSound={() => {}}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          onLogin={() => {
            setShowProfile(false);
            navigate('/login');
          }}
          onSignup={() => {
            setShowProfile(false);
            navigate('/signup');
          }}
        />
      )}
    </div>
  );
}

export default GuestGame;
