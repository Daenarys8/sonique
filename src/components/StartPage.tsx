import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/fonts.css';

export function StartPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [message, setMessage] = useState('');
  const fullMessage = 
  "The Sonique Challenge awaits. Are you ready to push your mind to the limit? Test your intellect, unravel mysteries, and prove you're not just another player—you're a force to be reckoned with. Only the sharpest will conquer the obstacles ahead. Step into the arena. The challenge is on. Will you rise to the occasion?";

  // Preload audio
  useEffect(() => {
    const audio = new Audio('/assets/thriller.mp3');
    audio.preload = 'auto';
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
      const audio = new Audio('/assets/thriller.mp3');
      await audio.play();
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
      <span className="futuristic-title-green"> challenge</span>
    </>
  );

  return (
    <div 
      className="min-h-screen flex flex-col relative pt-16"
      style={{
        backgroundImage: "url('/assets/background.gif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center flex-1">
        {/* Title and Message Section */}
        <div className="mb-16 w-full max-w-2xl"> {/* Single width control container */}
          <div className="animate-bounce mb-8 text-center">
            <h1 className="text-4xl font-['Press_Start_2P']">
              {renderTitle()}
            </h1>
          </div>
          {/* Animated Message */}
          <h1 className="futuristic-message text-xl mb-12 text-justify">
            {message}
          </h1>
        </div>
        
        {/* Main content - centered buttons */}
        <div className="flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {audioError && (
            <div className="text-yellow-400 mb-4 text-center text-sm">
              Note: Audio playback failed. You can still continue playing.
            </div>
          )}
  
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`
                start-button px-12 py-6 text-3xl font-orbitron text-white 
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
              disabled={isLoading}
              className={`
                start-button px-12 py-6 text-3xl font-orbitron text-white 
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
                className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 
                  animate-pulse"
              />
            </button>
          </div>
        </div>
      </div>
  
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
        Click any button to begin the challenge
      </div>
    </div>
  );  
}  
