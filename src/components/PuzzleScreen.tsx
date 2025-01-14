import React, { useState, useEffect, useCallback, useRef } from 'react';
import { puzzleService } from '../services/puzzleService';
import type { Puzzle } from '../types/puzzle';
import { GameContainer } from './GameContainer';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { BattleScene } from './BattleScene';
import { MODEL_PATHS, ANIMATION_DURATIONS } from '../constants/modelPaths';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Character3D } from './Character3D'
import { Canvas } from '@react-three/fiber'
import { GameProgress } from './GameProgress';
import { SoundManager } from './CategoryGrid';
import { OrbitControls, Environment } from '@react-three/drei'
import { useGameState } from '../hooks/useGameState';
import '../styles/PuzzleScreen.css';
import '../styles/model.css';
import '../styles/game-responsive.css';
import '../styles/fixes.css';
import '../styles/base.css';
import '../styles/animations.css';
import '../styles/responsive.css';
import '../styles/GuestGame.css';

// Battle constants
const CAST_GIF = '/effects/cast.gif';
const SUFFER_GIF = '/effects/suffer.gif';

// Update PuzzleScreen to handle sound
interface PuzzleScreenProps {
  categoryId?: string;
  puzzle?: Puzzle;
  onComplete: (coinsEarned: number) => void;
  onBack: () => void;
  isGuestMode?: boolean;
  isSoundEnabled?: boolean;
  isMobile?: boolean;
}

export function PuzzleScreen({
  categoryId,
  onComplete,
  onBack,
  isGuestMode = false,
  isSoundEnabled = true,
  isMobile = false,
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
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [playerEffect, setPlayerEffect] = useState<string | null>(null);
  const [npcEffect, setNpcEffect] = useState<string | null>(null);
  const [orientation, setOrientation] = useState(window.screen.orientation.type);
  const [gameComplete, setGameComplete] = useState(false);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [playerGif, setPlayerGif] = useState<string | null>(null); // Either "cast" or "suffer"
  const [npcGif, setNpcGif] = useState<string | null>(null); // Either "cast" or "suffer"
  const { reducedMotion, highContrast } = useAccessibility();
  const [hp, setHp] = useState(5); // Add this with other state declarations
  const { userProfile } = useGameState();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [playerState, setPlayerState] = useState({
      currentAnimation: 0
    });
    
    const [npcState, setNpcState] = useState({
      currentAnimation: 0
    });
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
      const handleOrientationChange = () => {
        setOrientation(window.screen.orientation.type);
      };
  
      window.addEventListener('orientationchange', handleOrientationChange);
      return () => window.removeEventListener('orientationchange', handleOrientationChange);
    }, []);

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

  useEffect(() => {
    console.log('Current Puzzle Index:', currentPuzzleIndex);
    console.log('Puzzles Length:', puzzles.length);
  }, [currentPuzzleIndex, puzzles]);

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

const [announcement, setAnnouncement] = useState<string>('');
  
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

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

  // Calculate coins based on time and attempts
  const calculateCoins = useCallback((timeRemaining: number, attemptCount: number): number => {
    const baseCoins = 10;
    const timeBonus = Math.floor(timeRemaining / 10);
    const attemptPenalty = Math.max(0, attemptCount - 1) * 2;
    return Math.max(Math.floor((baseCoins + timeBonus - attemptPenalty) * 1), 1);
  }, []);

  const currentPuzzle = puzzles[currentPuzzleIndex];
  // Handle submitting answer and moving to next puzzle
  // And update handleSubmitAnswer:
  // For handling puzzle progression
    const handleSubmitAnswer = useCallback(() => {
      if (!puzzles || puzzles.length === 0) return;
      
      // Calculate coins
      const earnedCoins = calculateCoins(timeLeft, attempts);
      setCoins(prev => prev + earnedCoins);
      playSound('sonique');

      if (currentPuzzleIndex === puzzles.length - 1) {
        // This is the final puzzle
        setGameComplete(true);
        onComplete?.(coins + earnedCoins);
      } else {
        // Move to next puzzle
        setTimeout(() => {
          setCurrentPuzzleIndex(prev => prev + 1);
          resetPuzzleState();
        }, 50);
      }
    }, [
      puzzles,
      currentPuzzleIndex,
      timeLeft,
      attempts,
      coins,
      calculateCoins,
      playSound,
      onComplete,
      resetPuzzleState
    ]);
      // For handling the attack animations and effects
        const handleAttack = useCallback(() => {
          if (!userAnswer || !currentPuzzle) return;
          
          // Play attack sound
          playSound('attack');
          
          // Check if the answer is correct
          const correct = userAnswer === currentPuzzle.correctAnswer;
          
          // Set the result
          setIsCorrect(correct);
          
          if (correct) {
            setAnnouncement("Correct answer! You gained health and attacked the enemy!");
            
            setPlayerEffect('/effects/cast.gif');
            setNpcEffect('/effects/suffer.gif');
            triggerGif('player', 'cast', 4000);
            triggerGif('npc', 'suffer', 4000);
            playSound('correct');
            playSound('npccry');
            
            // Player attacks, NPC gets hit
            playAnimationSequence(
              1, // Player attack animation index
              2, // NPC get_hit animation index
              ANIMATION_DURATIONS.ATTACK
            );
          } else {
            setHp(prev => prev - 1);
            setAnnouncement("Incorrect answer! Enemy attacks and you lose health!");

            setPlayerEffect('/effects/suffer.gif');
            setNpcEffect('/effects/cast.gif');

            triggerGif('npc', 'cast', 1000);
            triggerGif('player', 'suffer', 1000);
            playSound('wrong');
            playSound('grunt');
            playSound('painhum');
            
            // NPC attacks, Player gets hit
            playAnimationSequence(
              2, // Player hit animation index
              1, // NPC attack animation index
              ANIMATION_DURATIONS.ATTACK
            );

            // Check for game over
            if (hp <= 1) {
              setAnnouncement("Game Over! You've been defeated!");
              playAnimationSequence(
                3, // Player hit/defeat animation index
                3, // NPC victory animation index
                ANIMATION_DURATIONS.DEATH
              );
              setGameComplete(true);
              return;
            }
          }

          // Clear effects after animation
          setTimeout(() => {
            setPlayerEffect(null);
            setNpcEffect(null);
            handleSubmitAnswer(); // Call handleSubmitAnswer after animations
          }, ANIMATION_DURATIONS.ATTACK);

        }, [
          userAnswer,
          currentPuzzle,
          hp,
          playSound,
          triggerGif,
          playAnimationSequence,
          ANIMATION_DURATIONS.ATTACK,
          ANIMATION_DURATIONS.DEATH
        ]);

  // Handle clicking an option
  const handleOptionClick = useCallback((option: string) => {
    if (showResult) return;
    setUserAnswer(option);
  }, [isAnimating]);

  

  // Play sound for success or error
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Add this check after the loading check
  if (!puzzles || puzzles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading IQs...</div>
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
          Back to sonIQue Worlds
        </button>
      </div>
    );
  }

  return (
    <GameContainer className={`guest-game-container ${orientation.includes('landscape') ? 'landscape' : 'portrait'}`}>
    {!gameComplete ? (
      <>
        {/* Player GIF Effect */}
              {playerEffect && (
                <img
                  src={playerEffect}
                  alt="Player casting attack effect"
                  aria-hidden="true"
                  className="absolute left-20 top-1/2 transform -translate-y-1/2"
                  style={{ width: '400px', height: '700px', pointerEvents: 'none' }}
                />
              )}
        
              {/* NPC GIF Effect */}
              {npcEffect && (
                <img
                  src={npcEffect}
                  alt="NPC attack effect"
                  aria-hidden="true"
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
                    transition: reducedMotion ? 'none' : 'all 0.3s ease',
                    filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
                  }}
                >
                  <Canvas onCreated={() => setModelsLoaded(true)} camera={{ position: [5, 2, 5], fov: 50 }}>
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
                    alt={npcGif === 'cast' ? 'Enemy casting attack' : 'Enemy taking damage'}
                    aria-hidden="true"
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
                    transition: reducedMotion ? 'none' : 'all 0.3s ease',
                    filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
                  }}
                >
                  <Canvas onCreated={() => setModelsLoaded(true)} camera={{ position: [-5, 2, 5], fov: 50 }}>
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
                    alt={playerGif === 'cast' ? 'Player casting attack' : 'Player taking damage'}
                    aria-hidden="true"
                    className="gif-overlay"
                  />
                )}
                </div> 
                {/* Header Section */}
                <div className="flex justify-between"
                style={{ position: 'absolute', top: '5%', left: '10%', transform: 'translateX(-50%)' }}>
                  <button
                    onClick={onBack}
                    onMouseEnter={() => playSound('hover')}
                    className="game-button-primary"
                  >
                    ← Back
                  </button>
                  <div className={`timer-display ${timeLeft < 10 ? 'timer-warning' : ''}`}>
                    <div className="timer-circle">
                      <span className="timer-text">{timeLeft}</span>
                    </div>
                  </div>
                </div>
              {/* Game Progress Container - Positioned below the Header */}
                <div 
                  className="game-progress-container-guest flex justify-center"
                  style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <GameProgress profile={userProfile} hp={hp} />
                </div>

            {/* Main Puzzle Section */}
            <div className="max-w-4xl mx-auto p-4" style={{ position: 'relative', zIndex: 2, top: '10%' }}>
              <div className="panel-header text-center">
                <h2
                  className="text-2xl font-gaming text-white glow-text"
                  style={{
                    fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', // Dynamic text size
                    marginBottom: 'clamp(1rem, 2vw, 1.5rem)', // Dynamic spacing
                  }}
                >
                  IQ {currentPuzzleIndex + 1} of {puzzles.length}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Puzzle Question */}
                <div>
                  <p
                    className="text-lg text-white leading-relaxed text-justify"
                    style={{
                      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', // Dynamic text size
                      lineHeight: 'clamp(1.5, 2vw, 2)', // Dynamic line height
                    }}
                  >
                    {currentPuzzle?.content}
                  </p>
                </div>

                {/* Answer Options */}
                <div
                  className="options-grid grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 20vw, 250px), 1fr))', // Responsive grid
                    rowGap: 'clamp(1rem, 2vw, 1.5rem)', // Dynamic row gap
                    columnGap: 'clamp(1rem, 2vw, 1.5rem)', // Dynamic column gap
                  }}
                >
                  {currentPuzzle?.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      onMouseEnter={() => playSound('hover')}
                      className={`option-button p-4 rounded-lg transition-all text-lg font-medium duration-200
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
                        }`}
                      disabled={isCorrect !== null || isSubmitting}
                      aria-pressed={userAnswer === option}
                      role="radio"
                      aria-checked={userAnswer === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="controls flex justify-center gap-4 mt-6">
                  {userAnswer && isCorrect === null && (
                    <button
                      onClick={() => handleAttack()}
                      onMouseEnter={() => playSound('attack')}
                      className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition-all transform hover:scale-105"
                    >
                      Attack
                    </button>
                  )}
                  {isCorrect !== null && (
                    <button
                      onClick={handleSubmitAnswer}
                      onMouseEnter={() => playSound('sonique')}
                      className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold transition-all transform hover:scale-105"
                    >
                      {currentPuzzleIndex >= puzzles.length - 1 ? 'Finish' : 'Sonique'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            {/* Right Model */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: '50%', // Right half of the screen
                zIndex: 1,
                pointerEvents: 'none', // Prevents interfering with UI interactions
                transition: reducedMotion ? 'none' : 'all 0.3s ease',
                filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
              }}
            >
              <Canvas onCreated={() => setModelsLoaded(true)} camera={{ position: [5, 2, 5], fov: 50 }}>
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
                zIndex: 1,
                pointerEvents: 'none', // Prevents interfering with UI interactions
                transition: reducedMotion ? 'none' : 'all 0.3s ease',
                filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
              }}
            >
              <Canvas onCreated={() => setModelsLoaded(true)} camera={{ position: [-5, 2, 5], fov: 50 }}>
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
        
            {/* Buttons Section */}
            <div
              className={`
                guest-game-complete 
                flex flex-col 
                items-center 
                justify-center 
                min-h-[400px] 
                text-center 
                ${highContrast ? 'text-white' : 'text-white'}
              `}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10, // Ensure it appears above the models
                pointerEvents: 'auto', // Enable interactions
                transition: reducedMotion ? 'none' : 'all 0.3s ease'
              }}
            ></div>
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-4">Congratulations! 🎉</h2>
              <p className="text-gray-200 mb-4">You've completed all puzzles!</p>
              <p className="text-xl text-yellow-400 mb-6">Final Score: {coins} coins</p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
                >
                  Return Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded text-white"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
    </GameContainer>
  );
  
}
