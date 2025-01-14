import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';
import '../styles/fonts.css';
import '../styles/button-position-fixes.css';
import '../styles/responsive-text.css';

import { useAccessibility } from '../contexts/AccessibilityContext';
import type { AccessibilityContextType, AccessibilityState } from '../types/accessibility';

type LoadingPageProps = {
  onLoadComplete: () => void;
};

const SOUND_EFFECTS = {
  hover: '/sounds/hover-chime.mp3',
  select: '/sounds/select-chime.wav',
  success: '/sounds/success-chime.mp3'
};

export function LoadingPage({ onLoadComplete }: LoadingPageProps) {
  const { reducedMotion } = useAccessibility();
  const loadingSteps = [
    { text: '', image: '/assets/background.gif' },
    { 
      text: `Agent, this is it. The Sonique Challenge awaits. You’ve been selected, not just for your strength, but for your intellect, your resolve, and your ability to think beyond the ordinary. Across the stars, an enemy like no other is waiting. A force with a mind as sharp as any blade, determined to test you. They’ll push you to your limits. But you will not falter. Your mission is clear: Outwit them, outsmart them, and show them that the human mind is unbeatable. This is no ordinary battlefield, and only the sharpest will emerge victorious. Step forward now, Agent. Show them who we are. Godspeed. The future is in your hands.`,
      image: '/assets/robo-intro.jpg' 
    },
    { text: 'Prepare for an amazing experience.', image: '/assets/robo-intro.jpg' },
    { text: "Let's get started!", image: '/assets/robo-intro.jpg' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isSpeechLoaded, setIsSpeechLoaded] = useState(false);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null); // For intro background music
  const speechAudioRef = useRef<HTMLAudioElement | null>(null); // For the speech audio
  const soundManagerRef = useRef<SoundManager | null>(null);

  useEffect(() => {
    // Background music setup (intro.mp3)
    backgroundAudioRef.current = new Audio('/sounds/intro.mp3');
    backgroundAudioRef.current.loop = true; // Loop the background music
    backgroundAudioRef.current.preload = 'auto';

    // Speech setup (intro-speech.mp3)
    speechAudioRef.current = new Audio('/sounds/intro-speech.mp3');
    speechAudioRef.current.loop = false; // Don't loop speech audio
    speechAudioRef.current.preload = 'auto';

    const backgroundAudio = backgroundAudioRef.current;
    const speechAudio = speechAudioRef.current;

    // Setup event listeners for background music and speech audio
    const handleBackgroundAudioCanPlayThrough = () => {
      if (backgroundAudio) {
        setIsAudioLoaded(true);
      }
    };

    const handleSpeechAudioCanPlayThrough = () => {
      if (speechAudio) {
        setIsSpeechLoaded(true);
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio loading error:', e);
      setIsSoundEnabled(false);
      localStorage.setItem('soundEnabled', 'false');
    };

    backgroundAudio.addEventListener('canplaythrough', handleBackgroundAudioCanPlayThrough);
    speechAudio.addEventListener('canplaythrough', handleSpeechAudioCanPlayThrough);
    backgroundAudio.addEventListener('error', handleError);
    speechAudio.addEventListener('error', handleError);

    // Initialize audio state
    backgroundAudio.muted = !isSoundEnabled;
    speechAudio.muted = !isSoundEnabled;

    return () => {
      // Cleanup
      backgroundAudio.removeEventListener('canplaythrough', handleBackgroundAudioCanPlayThrough);
      speechAudio.removeEventListener('canplaythrough', handleSpeechAudioCanPlayThrough);
      backgroundAudio.removeEventListener('error', handleError);
      speechAudio.removeEventListener('error', handleError);
      backgroundAudio.pause();
      speechAudio.pause();
      backgroundAudio.src = '';
      speechAudio.src = '';
      backgroundAudioRef.current = null;
      speechAudioRef.current = null;
    };
  }, [isSoundEnabled]);

  useEffect(() => {
    if (!backgroundAudioRef.current || !isAudioLoaded) return;
    
    // Start playing background music when audio is ready
    const playBackgroundAudio = async () => {
      try {
        if (isSoundEnabled) {
          backgroundAudioRef.current!.muted = false;
          await backgroundAudioRef.current!.play();
        } else {
          backgroundAudioRef.current!.muted = true;
        }
      } catch (error) {
        console.warn('Background audio autoplay prevented:', error);
        setIsSoundEnabled(false);
        localStorage.setItem('soundEnabled', 'false');
      }
    };

    playBackgroundAudio();
  }, [isSoundEnabled, isAudioLoaded]);

  useEffect(() => {
    if (!speechAudioRef.current || !isSpeechLoaded) return;
    
    // Play speech only after 5 seconds (at the second step)
    const playSpeech = async () => {
      try {
        if (isSoundEnabled) {
          speechAudioRef.current!.muted = false;
          await speechAudioRef.current!.play();
        } else {
          speechAudioRef.current!.muted = true;
        }
      } catch (error) {
        console.warn('Speech audio autoplay prevented:', error);
        setIsSoundEnabled(false);
        localStorage.setItem('soundEnabled', 'false');
      }
    };

    if (currentStep === 1) {
      // Play speech after the 2-second delay, at the second step
      setTimeout(() => {
        playSpeech();
      }, 2000); // Wait 2 seconds before playing speech
    }
  }, [isSoundEnabled, isSpeechLoaded, currentStep]);

  useEffect(() => {
    if (currentStep === 0) {
      // Show the loading spinner (GIF is already showing)
      setTimeout(() => {
        setCurrentStep(1); // Transition to second step after 5 seconds
      }, 3000); // Transition after 5 seconds
    }
  }, [currentStep]);

  const toggleSound = async () => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', String(newSoundEnabled));

    // Toggle background music
    if (backgroundAudioRef.current) {
      if (newSoundEnabled) {
        try {
          backgroundAudioRef.current.muted = false;
          await backgroundAudioRef.current.play();
        } catch (error) {
          console.warn('Background audio play prevented:', error);
          setIsSoundEnabled(false);
          localStorage.setItem('soundEnabled', 'false');
        }
      } else {
        backgroundAudioRef.current.muted = true;
      }
    }

    // Toggle speech audio
    if (speechAudioRef.current) {
      if (newSoundEnabled) {
        speechAudioRef.current.muted = false;
        if (currentStep === 1 && !speechAudioRef.current.paused) {
          await speechAudioRef.current.play();
        }
      } else {
        speechAudioRef.current.muted = true;
      }
    }
  };

  const renderTitle = () => (
    <h1 className="">
      <span className="futuristic-title-green text-glow">son</span>
      <span className="futuristic-title-orange text-glow">IQ</span>
      <span className="futuristic-title-green text-glow">ue</span>
      <span className="futuristic-title-green text-glow"> Worlds</span>
    </h1>
  );

  const handleNextStep = () => {
    if (currentStep < loadingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStartGame = () => {
    // Call the onLoadComplete function to signify that loading is complete
    onLoadComplete();
  };

  useEffect(() => {
      // Initialize sound manager with all sound effects
      soundManagerRef.current = new SoundManager(SOUND_EFFECTS);
  
      return () => {
        soundManagerRef.current = null;
      };
    }, []);

  const playSound = (soundType: keyof typeof SOUND_EFFECTS) => {
    if (isSoundEnabled) {
      soundManagerRef.current?.play(soundType);
    }
  };

  return (
    <div className="loading-container bg-black min-h-screen flex flex-col justify-center items-center relative">
      <div className="absolute inset-0 bg-black/40" />
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-650"
        style={{
          backgroundImage: `url(${loadingSteps[currentStep].image})`,
          opacity: 1,
          transition: reducedMotion ? 'none' : 'background-image 1s ease'
        }}
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Loading Spinner */}
      {currentStep === 0 && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10" 
          aria-live="polite"
        >
          <div 
            className="spinner"
            role="status" 
            aria-label="Loading..."
          />
        </div>
      )}
  
      {/* Content Layer */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto">
        {/* Title Section */}
        <div className="mb-8">
          {renderTitle()}
        </div>
  
        {/* Loading Text */}
        <p 
          className="loading-text futuristic-message futuristic-message-green text-glow text-white mb-8 break-words" 
          aria-live="polite"
        >
          {loadingSteps[currentStep].text}
        </p>
  
        {/* Button Container */}
        {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
          <div className="loading-page-button-container -mt-12">
          <button
            onClick={currentStep === 3 ? handleStartGame : handleNextStep}
            onMouseEnter={() => playSound('hover')}
            className={`
              loading-page-button
              start-button
              px-4 sm:px-6 md:px-8 lg:px-10  /* Responsive padding */
              py-2 sm:py-4 md:py-6  /* Responsive padding */
              text-sm sm:text-base md:text-lg lg:text-xl  /* Responsive font size */
              font-orbitron text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              rounded-lg
              shadow-[0_0_20px_rgba(79,70,229,0.5)]
              hover:shadow-[0_0_40px_rgba(79,70,229,0.6)]
              border border-indigo-400/50
              hover:border-indigo-300
              transition-all duration-300 ease-in-out
              transform hover:scale-105
              relative overflow-hidden
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:transform-none
              focus:outline-none
              focus:ring-2
              focus:ring-purple-500
              focus:ring-offset-2
              focus-visible:ring-offset-black
              active:transform active:scale-95
            `}
            aria-label={currentStep === 3 ? 'Start Game' : 'Next Step'}
          >
            <span className="relative z-10">
              {currentStep === 3 ? 'Start Game' : 'Next'}
            </span>
          </button>
        </div>        
        )}
  
        {/* Sound Toggle Button */}
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-colors duration-200"
          aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>
    </div>
  );
}
