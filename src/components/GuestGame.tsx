import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { SoundManager } from './CategoryGrid';


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

const SOUND_EFFECTS = {
  hover: '/sounds/hover-chime.mp3',
  select: '/sounds/select-chime.wav',
  success: '/sounds/success-chime.mp3',
  attack: '/sounds/attack.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  sonique: '/sounds/sonique.mp3',
  npccry: '/sounds/npccry.mp3',
  painhum: '/sounds/painhum.mp3',
  grunt: '/sounds/grunt.wav'
};

// Update these paths to your actual GIF file locations
const CAST_GIF = '/effects/cast.gif';
const SUFFER_GIF = '/effects/suffer.gif';

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

  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [playerEffect, setPlayerEffect] = useState<string | null>(null); // For player's GIF
  const [npcEffect, setNpcEffect] = useState<string | null>(null); // For NPC's GIF
  const [playerGif, setPlayerGif] = useState<string | null>(null); // Either "cast" or "suffer"
  const [npcGif, setNpcGif] = useState<string | null>(null); // Either "cast" or "suffer"


  const triggerGif = useCallback(
    (character: 'player' | 'npc', gifType: 'cast' | 'suffer', duration: number) => {
      if (character === 'player') {
        setPlayerGif(gifType);
        setTimeout(() => setPlayerGif(null), duration); // Hide after duration
      } else if (character === 'npc') {
        setNpcGif(gifType);
        setTimeout(() => setNpcGif(null), duration); // Hide after duration
      }
    },
    []
  );

  

  useEffect(() => {
    // Initialize sound manager with all sound effects
    soundManagerRef.current = new SoundManager(SOUND_EFFECTS);
  
    return () => {
      // Clean up any playing sounds before nullifying
      soundManagerRef.current?.stopAll();
      soundManagerRef.current = null;
    };
  }, []);
  
  const playSound = (soundType: keyof typeof SOUND_EFFECTS, duration?: number) => {
    try {
      if (!soundManagerRef.current) {
        console.warn('Sound manager not initialized');
        return;
      }
  
      const sound = soundManagerRef.current.play(soundType);
      
      if (duration && sound) {
        // Stop the sound after the specified duration
        const timeoutId = setTimeout(() => {
          soundManagerRef.current?.stop(soundType);
        }, duration);
  
        // Clean up timeout if component unmounts
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  

  useEffect(() => {
    // Load and play music when the game starts
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio('/sounds/fighting-music.mp3'); // Adjust path as needed
      backgroundMusicRef.current.loop = true;
    }
    backgroundMusicRef.current.play().catch(err => console.error('Music playback failed:', err));

    return () => {
      // Stop music when the component unmounts
      backgroundMusicRef.current?.pause();
      backgroundMusicRef.current = null;
    };
  }, []);

  //useEffect(() => {
  //  if (gameComplete) {
      // Stop the music if the game completes
  //    backgroundMusicRef.current?.pause();
  //  }
  //}, [gameComplete]);

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

      setPlayerEffect('/effects/cast.gif');
      setNpcEffect('/effects/suffer.gif');
      triggerGif('player', 'cast', 4000); // Player "cast" GIF
      triggerGif('npc', 'suffer', 4000); // NPC "suffer" GIF
      playSound('correct');
      playSound('npccry', 10000);
      
      // Player attacks, NPC gets hit
      playAnimationSequence(
        1, // Player attack animation index
        2, // NPC get_hit animation index
        ANIMATION_DURATIONS.ATTACK
      );
    } else {
      setHp(prev => prev - 1);

      setPlayerEffect('/effects/suffer.gif');
      setNpcEffect('/effects/cast.gif');

      triggerGif('npc', 'cast', 1000); // NPC "cast" GIF
      triggerGif('player', 'suffer', 1000); // Player "suffer" GIF
      playSound('wrong');
      playSound('grunt',10000);
      playSound('painhum',10000);
      
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

    setTimeout(() => {
      setPlayerEffect(null);
      setNpcEffect(null);
    }, ANIMATION_DURATIONS.ATTACK);
  
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentQuestionIndex(prev => prev + 1);
    fetchQuestion();
  }, [selectedAnswer, isAnimating, hp, playAnimationSequence, getCurrentQuestion, fetchQuestion, triggerGif]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      resetModels();
    };
  }, [resetModels]);

  // Update game complete check
  useEffect(() => {
    if (currentQuestionIndex >= 5 && hp >= 3) {
      playAnimationSequence(
        2, // Player attack animation index
        4, // NPC defeat animation index
        ANIMATION_DURATIONS.VICTORY
      );
      setGameComplete(true);
    }
  }, [currentQuestionIndex, hp, playAnimationSequence]);
  startGuestSession;

  // Update the game complete check
  useEffect(() => {
    if (currentQuestionIndex >= 5 || hp <= 0) {
      playAnimationSequence(
        3, // Player defeat animation index
        3, // NPC victory animation index
        ANIMATION_DURATIONS.VICTORY
      );
      setGameComplete(true);
    }
  }, [currentQuestionIndex, hp, playAnimationSequence]);
  

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
          position: 'relative', // Add this for layering
        }}
      >
        <Header
          coins={score}
          onSettingsClick={() => setShowSettings(true)}
          onProfileClick={() => setShowProfile(true)}
          isGuest={true}
        />
    
        {/* Right Model */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '50%',
            pointerEvents: 'none',
            zIndex: 1, // Lower priority than buttons
          }}
        >
          <Canvas camera={{ position: [5, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-10, 10, 5]} intensity={10} />
            <Character3D
              modelPath={MODEL_PATHS.NPC.BASE.model}
              animationPaths={MODEL_PATHS.NPC.BASE.animations}
              position={[2, -2, 0]}
              scale={0.02}
              rotation={[0, -Math.PI / 0.25, 0]}
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
            width: '50%',
            pointerEvents: 'none',
            zIndex: 1, // Lower priority than buttons
          }}
        >
          <Canvas camera={{ position: [-5, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={7} />
            <Character3D
              modelPath={MODEL_PATHS.PLAYER.BASE.model}
              animationPaths={MODEL_PATHS.PLAYER.BASE.animations}
              position={[-2, -2, 0]}
              scale={0.02}
              rotation={[0, Math.PI / 0.5, 0]}
              currentAnimation={playerState.currentAnimation}
            />
            <Environment preset="park" />
          </Canvas>
        </div>
    
        {/* Buttons Section */}
        <div
          className="guest-game-complete flex flex-col items-center justify-center min-h-[400px] text-center text-white"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10, // Ensure it appears above the models
            pointerEvents: 'auto', // Enable interactions
          }}
        >
          <h2 className="text-3xl font-bold mb-4">
            {hp <= 0 ? 'Game Over!' : 'Level Complete!'}
          </h2>
          <p className="text-2xl mb-4">Final Score: {score}</p>
          <p className="text-xl mb-4">Remaining HP: {hp}</p>
          <p className="mb-6">Sign up to save your progress and access more gameplay!</p>
          <div className="flex gap-4">
            <button
              onClick={handleSignUp}
              onMouseEnter={() => playSound('hover')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign Up
            </button>
            <button
              onClick={handleLogin}
              onMouseEnter={() => playSound('hover')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Login
            </button>
            <button
              onClick={handleReplay}
              onMouseEnter={() => playSound('hover')}
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
      {/* Player GIF Effect */}
      {playerEffect && (
        <img
          src={playerEffect}
          alt="Player Effect"
          className="absolute left-20 top-1/2 transform -translate-y-1/2"
          style={{ width: '400px', height: '700px', pointerEvents: 'none' }}
        />
      )}

      {/* NPC GIF Effect */}
      {npcEffect && (
        <img
          src={npcEffect}
          alt="NPC Effect"
          className="absolute right-20 top-1/2 transform -translate-y-1/2"
          style={{ width: '400px', height: '700px', pointerEvents: 'none' }}
        />
      )}

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
          {/* Show NPC's GIF */}
        {npcGif && (
          <img
            src={npcGif === 'cast' ? CAST_GIF : SUFFER_GIF}
            alt={`${npcGif} GIF`}
            className="gif-overlay"
          />
        )}
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
          {/* Show Player's GIF */}
        {playerGif && (
          <img
            src={playerGif === 'cast' ? CAST_GIF : SUFFER_GIF}
            alt={`${playerGif} GIF`}
            className="gif-overlay"
          />
        )}
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
                          onMouseEnter={() => playSound('hover')}
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
                    onMouseEnter={() => playSound('attack')}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition-colors"
                  >
                    Attack
                  </button>
                )}
                {showResult && (
                  <button
                    onClick={handleNextQuestion}
                    onMouseEnter={() => playSound('sonique')}
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
