import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header';
import { Settings } from './Settings';
import { Profile } from './Profile';
import './GuestGame.css';
import { GameProgress } from './GameProgress';
import { useGameState } from '../hooks/useGameState';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { MODEL_PATHS, ANIMATION_DURATIONS } from '../constants/modelPaths';
import { Character3D } from './Character3D'


interface Answer {
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  answer_e?: string;
  answer_f?: string;
}

interface CorrectAnswers {
  answer_a_correct: "true" | "false";
  answer_b_correct: "true" | "false";
  answer_c_correct: "true" | "false";
  answer_d_correct: "true" | "false";
  answer_e_correct: "true" | "false";
  answer_f_correct: "true" | "false";
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
  const [playerState, setPlayerState] = useState({
    currentAnimation: 0
  });
  
  const [npcState, setNpcState] = useState({
    currentAnimation: 0
  });
  
  const [isAnimating, setIsAnimating] = useState(false);

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

  const resetModels = useCallback(() => {
    // Reset both models to idle animation (index 0)
    setPlayerState(prev => ({
      ...prev,
      currentAnimation: 0
    }));
    
    setNpcState(prev => ({
      ...prev,
      currentAnimation: 0
    }));
    
    setIsAnimating(false);
  }, []);
  

  // Update your animation sequence function
  const playAnimationSequence = useCallback((
    playerAnimIndex: number,
    npcAnimIndex: number,
    duration: number
  ) => {
    setIsAnimating(true);
    
    setPlayerState(prev => ({
      ...prev,
      currentAnimation: playerAnimIndex
    }));
    
    setNpcState(prev => ({
      ...prev,
      currentAnimation: npcAnimIndex
    }));
  
    // Reset after duration if game isn't complete
    setTimeout(() => {
      if (!gameComplete) {
        resetModels();
      }
    }, duration);
  }, [gameComplete, resetModels]);
  
  const handleAnswerSelect = useCallback((answerKey: AnswerKey) => {
    if (showResult) return; // Prevent selecting after showing result
    setSelectedAnswer(answerKey);
  }, [isAnimating]);
  
  const getCurrentQuestion = (): QuizQuestion | undefined => {
    return questions[currentQuestionIndex];
  };

  const handleNextQuestion = useCallback(() => {
    if (!selectedAnswer || isAnimating) return;
  
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
  
    const correctAnswerKey = `${selectedAnswer}_correct` as CorrectAnswerKey;
    const isCorrect = currentQuestion.correct_answers[correctAnswerKey] === "true";
  
    if (isCorrect) {
      setScore(prev => prev + 100);
      setHp(prev => Math.min(prev + 1, 5));
      
      // Player attacks, NPC gets hit
      playAnimationSequence(
        1, // Player attack animation index
        2, // NPC get_hit animation index
        ANIMATION_DURATIONS.ATTACK
      );
    } else {
      setHp(prev => prev - 1);
      
      // NPC attacks, Player gets hit
      playAnimationSequence(
        2, // Player hit animation index
        1, // NPC attack animation index
        ANIMATION_DURATIONS.ATTACK
      );
  
      // Check for game over
      if (hp <= 1) {
        playAnimationSequence(
          3, // Player hit/defeat animation index
          3, // NPC victory animation index
          ANIMATION_DURATIONS.DEATH
        );
        setGameComplete(true);
        return;
      }
    }
  
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentQuestionIndex(prev => prev + 1);
    fetchQuestion();
  }, [selectedAnswer, isAnimating, hp, playAnimationSequence, getCurrentQuestion, fetchQuestion]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      resetModels();
    };
  }, [resetModels]);

  // Update game complete check
  useEffect(() => {
    if (currentQuestionIndex >= 5) {
      playAnimationSequence(
        2, // Player attack animation index
        4, // NPC defeat animation index
        ANIMATION_DURATIONS.VICTORY
      );
      setGameComplete(true);
    }
  }, [currentQuestionIndex, playAnimationSequence]);
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
    const handleReplay = () => {
      // Reset game state for another round
      setScore(0);
      setHp(5);
      setCurrentQuestionIndex(0);
      setGameComplete(false); // Set gameComplete to false to hide game-over screen
      fetchQuestion(); // Optionally fetch a new question set
    };
  
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
            <button
              onClick={handleReplay}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Replay
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
          position: 'relative',
          overflow: 'hidden', // Ensures models stay within bounds
        }}
      >
      <Header 
        coins={score}
        onSettingsClick={() => setShowSettings(true)}
        onProfileClick={() => setShowProfile(true)}
        isGuest={true}
      />
      {/* Left Model */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '50%', // Left half of the screen
            pointerEvents: 'none', // Prevents interfering with UI interactions
          }}
        >
          <Canvas camera={{ position: [-5, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={10} />
            <Character3D
              modelPath={MODEL_PATHS.PLAYER.BASE.model}
              animationPaths={MODEL_PATHS.PLAYER.BASE.animations}
              position={[-1.5, -2.08, 1]}
              scale={0.02} // Adjust the size
              rotation={[0, -Math.PI / 4, 0]} // Rotate slightly to face inward
              currentAnimation={playerState.currentAnimation}
            />
            <Environment preset="park" />
          </Canvas>
        </div>

        {/* Right Model */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '50%', // Right half of the screen
            pointerEvents: 'none', // Prevents interfering with UI interactions
          }}
        >
          <Canvas camera={{ position: [5, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-10, 10, 5]} intensity={10} />
            <Character3D
              modelPath={MODEL_PATHS.NPC.BASE.model}
              animationPaths={MODEL_PATHS.NPC.BASE.animations}
              position={[2, -2, 0]} // Position adjusted for right side
              scale={0.02} // Adjust the size
              rotation={[0, -Math.PI / 0.25, 0]} // Rotate to face left model
              currentAnimation={npcState.currentAnimation}
            />
            <Environment preset="park" />
          </Canvas>
        </div>

        {/* Left Model */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '50%', // Left half of the screen
            pointerEvents: 'none', // Prevents interfering with UI interactions
          }}
        >
          <Canvas camera={{ position: [-5, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={7} />
            <Character3D
              modelPath={MODEL_PATHS.PLAYER.BASE.model}
              animationPaths={MODEL_PATHS.PLAYER.BASE.animations}
              position={[-2, -2, 0]} // Position adjusted for left side
              scale={0.02} // Adjust the size
              rotation={[0, Math.PI / 0.5, 0]} // Rotate to face right model
              currentAnimation={playerState.currentAnimation}
            />
            <Environment preset="park" />
          </Canvas>
        </div>
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
                    {currentQuestionIndex >= 4 ? 'Finish' : 'Sonique'}
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
