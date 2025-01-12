import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/fonts.css';
import '../styles/button-position-fixes.css';
import '../styles/responsive-text.css';
import { SoundManager } from './CategoryGrid';

const SOUND_EFFECTS = {
  hover: '/sounds/hover-chime.mp3',
  select: '/sounds/select-chime.wav',
  success: '/sounds/success-chime.mp3'
};

export function StartPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [message, setMessage] = useState('');
  const soundManagerRef = useRef<SoundManager | null>(null);
  const fullMessage = 
  "The Sonique Challenge awaits. Are you ready to push your mind to the limit? Test your intellect, unravel mysteries, and prove you're not just another player—you're a force to be reckoned with. Only the sharpest will conquer the obstacles ahead. Step into the arena. The challenge is on. Will you rise to the occasion?";

  // Preload audio
  useEffect(() => {
    const audio = new Audio('/sounds/intro.mp3');
    audio.preload = 'auto';
    // audio.play();
    let messageInterval: NodeJS.Timeout;
    let currentIndex = 0;

    // Animate the message
    messageInterval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setMessage(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(messageInterval);
      }
    }, 50);

    // Cleanup function to clear the intervals
    return () => {
      if (messageInterval) clearInterval(messageInterval);
    };
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    setAudioError(false);
    
    try {
      navigate('/guest');
    } catch (error) {
      console.error('Audio playback failed:', error);
      setAudioError(true);
      // Navigate anyway if audio fails
      navigate('/guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    navigate('/login');
  };

  const renderTitle = () => (
    <>
      <span className="futuristic-title-green">son</span>
      <span className="futuristic-title-orange">IQ</span>
      <span className="futuristic-title-green">ue</span>
      <span className="futuristic-title-green">  Worlds</span>
    </>
  );

  useEffect(() => {
          // Initialize sound manager with all sound effects
          soundManagerRef.current = new SoundManager(SOUND_EFFECTS);
      
          return () => {
            soundManagerRef.current = null;
          };
        }, []);
    
      const playSound = (soundType: keyof typeof SOUND_EFFECTS) => {
          soundManagerRef.current?.play(soundType);
      };

      return (
        <div 
        className="start-page-container"
        >
          {/* Content wrapper */}
          <div className="relative z-10 flex flex-col items-center flex-1">
            {/* Title and Message Section */}
            <div className="mb-6 w-full max-w-2xl"> {/* Adjusted margin here */}
              <div className="animate-bounce -mb-3 text-center">
                <div className="text-3xl sm:text-4xl font-['Press_Start_2P'] text-white">
                  {renderTitle()}
                </div>
              </div>
              
              {/* Animated Message */}
              <h1 className="futuristic-message mb-2 text-center"> {/* Reduced margin */}
                {message}
              </h1>
            </div>
            
            {/* Main content - centered buttons */}
            <div className="start-page-button-container">
              {audioError && (
                <div className="text-yellow-400 mb-4 text-center text-sm">
                  Note: Audio playback failed. You can still continue playing.
                </div>
              )}

              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={handleLogin}
                  onMouseEnter={() => playSound('hover')}
                  disabled={isLoading}
                  className={`
                    start-button px-12 py-6 text-3xl sm:text-2xl font-orbitron text-white 
                    bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg
                    shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)]
                    border border-indigo-400/50 hover:border-indigo-300
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    relative overflow-hidden
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                    ${isLoading ? 'animate-pulse' : ''}
                  `}
                >
                  Login
                </button>

                <button
                  onClick={handleStart}
                  onMouseEnter={() => playSound('hover')}
                  disabled={isLoading}
                  className={`
                    start-button px-12 py-6 text-3xl sm:text-2xl font-orbitron text-white 
                    bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg
                    shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)]
                    border border-indigo-400/50 hover:border-indigo-300
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    relative overflow-hidden
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                    ${isLoading ? 'animate-pulse' : ''}
                  `}
                >
                  <span className="relative z-10">
                    {isLoading ? 'Loading...' : 'GUEST'}
                  </span>
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-14 left-0 right-0 text-center text-white/70 text-sm px-4">
            Click any button to begin the challenge
          </div>
        </div>
      );      
    }      
