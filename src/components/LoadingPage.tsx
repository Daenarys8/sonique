import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type LoadingPageProps = {
  onLoadComplete: () => void;
};

export function LoadingPage({ onLoadComplete }: LoadingPageProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const [audio] = useState(new Audio('/assets/thriller.mp3'));

  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 3000);

    if (isSoundEnabled) {
      audio.loop = true;
      audio.play().catch(console.error);
    }

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onLoadComplete, audio, isSoundEnabled]);

  const toggleSound = () => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', String(newSoundEnabled));
    
    if (newSoundEnabled) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center">
      <div className="animate-bounce mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Word Puzzle Challenge</h1>
      </div>
      <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mb-8"></div>
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
      >
        {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
}