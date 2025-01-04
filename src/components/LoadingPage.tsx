import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import '../styles/fonts.css';

type LoadingPageProps = {
  onLoadComplete: () => void;
};

export function LoadingPage({ onLoadComplete }: LoadingPageProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const [audio] = useState(() => {
    const audio = new Audio('/assets/thriller.mp3');
    audio.loop = true;
    audio.muted = false; // Start unmuted for autoplay
    return audio;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 3000);

    // Function to handle initial audio setup
    const initializeAudio = async () => {
      try {
        // Try to play muted first (this is usually allowed)
        await audio.play();
        
        // If sound should be enabled, unmute after successful play
        if (isSoundEnabled) {
          audio.muted = false;
        }
      } catch (error) {
        console.error('Audio autoplay failed:', error);
        // If autoplay fails, ensure sound is disabled
        setIsSoundEnabled(false);
        localStorage.setItem('soundEnabled', 'false');
      }
    };

    // Add click event listener to document for user interaction
    const handleUserInteraction = async () => {
      if (isSoundEnabled) {
        try {
          audio.muted = false;
          await audio.play();
        } catch (error) {
          console.error('Audio play failed after interaction:', error);
        }
      }
      // Remove the event listener after first interaction
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    initializeAudio();

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [onLoadComplete, audio, isSoundEnabled]);

  const toggleSound = async () => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', String(newSoundEnabled));
    
    try {
      if (newSoundEnabled) {
        audio.muted = false;
        await audio.play();
      } else {
        audio.muted = true;
      }
    } catch (error) {
      console.error('Toggle sound failed:', error);
    }
  };

  const renderTitle = () => (
    <>
      <span className="futuristic-title-green">son</span>
      <span className="futuristic-title-orange">IQ</span>
      <span className="futuristic-title-green">ue</span>
      <span className="futuristic-title-green"> worlds</span>
    </>
  );

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-0">
        <img src="/assets/background.gif" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10">
        <div className="animate-bounce mb-8">
          <h1 className="text-4xl font-['Press_Start_2P']">
            {renderTitle()}
          </h1>
        </div>
        <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mb-8 mx-auto"></div>
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
          aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>
    </div>
  );
}
