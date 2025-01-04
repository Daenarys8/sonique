import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import '../styles/fonts.css';
import { initializeBackgroundMusic, playBackgroundMusic, stopBackgroundMusic } from '../utils/audioUtils';
import { useAuth } from '../contexts/AuthContext';

export function AuthenticationScreen() {
  const { currentUser, loading } = useAuth();
  const [title, setTitle] = useState('');

  const [backgroundMusic] = useState(() => initializeBackgroundMusic('/assets/audio/thriller.mp3'));
  const fullTitle = 'sonIQue';
  
    if (!loading && currentUser) {
      return <Navigate to="/game" replace />;
    }
  // Effect to animate the title and message
  useEffect(() => {
    // Play background music
    playBackgroundMusic(backgroundMusic);
    
    // Cleanup function to stop music when component unmounts
    return () => {
      stopBackgroundMusic(backgroundMusic);
    };
  }, [backgroundMusic]);

  useEffect(() => {
    // Animate the title letter by letter
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex < fullTitle.length) {
        setTitle(fullTitle.slice(0, titleIndex + 1));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
      }
    }, 200);

    // Cleanup function to clear the intervals
    return () => {
      if (titleInterval) clearInterval(titleInterval);
    };
  }, []);

  const renderTitle = (text: string) => {
    const prefix = text.slice(0, 3); // 'son'
    const highlight = text.slice(3, 5); // 'IQ'
    const suffix = text.slice(5); // 'ue'

    return (
      <>
        <span className="futuristic-title-green">{prefix}</span>
        <span className="futuristic-title-orange">{highlight}</span>
        <span className="futuristic-title-green">{suffix}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/background.gif"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 text-center px-4 pt-16">
        {/* Animated Title */}
        <h1 className="text-6xl mb-6 font-['Press_Start_2P']">
          {renderTitle(title)}
        </h1>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}