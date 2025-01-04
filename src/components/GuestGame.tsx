import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header';
import { Settings } from './Settings';
import { Profile } from './Profile';
import './GuestGame.css';

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
    }
  
    setSelectedAnswer(null);
    setShowResult(false);
  
    // Fetch next question when moving to next
    fetchQuestion();
    setCurrentQuestionIndex(prev => prev + 1);
  };
  startGuestSession;

  // Update the game complete check
  useEffect(() => {
    if (currentQuestionIndex >= 10) { // Or whatever limit you want
      setGameComplete(true);
    }
  }, [currentQuestionIndex]);
  

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
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-2xl mb-4">Final Score: {score}</p>
          <p className="mb-6">Sign up to save your progress and access more quizzes!</p>
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

      <div className="max-w-4xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="text-white">
            {/* Progress and Score */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-xl">Question {currentQuestionIndex + 1}/10</div>
            </div>

            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-6">
              <h2 className="text-2xl mb-6">{getCurrentQuestion()?.question}</h2>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(getCurrentQuestion()?.answers || {}).map(([key, value]) => {
                  if (!value) return null;
                  // Make sure key is of type AnswerKey
                  const answerKey = key as AnswerKey;
                  return (
                    <button
                      key={answerKey}
                      onClick={() => handleAnswerSelect(answerKey)}
                      className={`p-4 rounded-lg text-left transition-all
                        ${selectedAnswer === answerKey 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/5 hover:bg-white/20'}`}
                      disabled={showResult}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              {selectedAnswer && !showResult && (
                <button
                  onClick={() => setShowResult(true)}
                  className="px-8 py-3 bg-green-500 rounded-lg text-white font-bold"
                >
                  Submit Answer
                </button>
              )}
              {showResult && (
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-blue-500 rounded-lg text-white font-bold"
                >
                  Next Question
                </button>
              )}
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
