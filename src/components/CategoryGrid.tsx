import React, { useEffect, useRef, useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import type { Category } from '../types/game';
import '../styles/CategoryGrid.css';

const categories: Category[] = [
  { id: 'literature', name: 'Scriptoria', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/literature.jpg' },
  { id: 'science', name: 'Innovaris', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/science.jpg' },
  { id: 'history', name: 'Chronosia', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/history.jpg' },
  { id: 'math', name: 'Logis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/math.jpg' },
  { id: 'sports', name: 'Athlaris', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/sports.jpg' },
  { id: 'music', name: 'Melodara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/music.jpg' },
  { id: 'movies', name: 'Cinemara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/movies.jpg' },
  { id: 'random', name: 'Variar', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/random.jpg' },
  { id: 'technology', name: 'Technis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/technology.jpg' },
  { id: 'psychology', name: 'Mindara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/psychology.jpg' },
  { id: 'astronomy', name: 'Stellara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/astronomy.jpg' },
  { id: 'philosophy', name: 'Sophara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/philosophy.jpg' },
  { id: 'geography', name: 'Terranova', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/geography.jpg' },
  { id: 'engineering', name: 'Structon', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/engineering.jpg' },
  { id: 'biology', name: 'Biomara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/biology.jpg' },
  { id: 'language', name: 'Lingua', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/language.jpg' },
  { id: 'economics', name: 'Economara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/economics.jpg' },
  { id: 'art', name: 'Artemis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/art.jpg' },
  { id: 'sociology', name: 'Socionis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/sociology.jpg' },
  { id: 'politics', name: 'Politaria', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/politics.jpg' },
  { id: 'health', name: 'Vitalis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/health.jpg' }
];


const SOUND_EFFECTS = {
  hover: '/sounds/hover-chime.mp3',
  select: '/sounds/select-chime.wav',
  success: '/sounds/success-chime.mp3'
};

type CategoryGridProps = {
  onCategorySelect: (category: Omit<Category, 'description' | 'difficulty'> & { description?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => void;
  userProgress?: { [key: string]: number };
};

// Enhanced SoundManager to handle multiple sound types
// Import the type definition
import type { SoundManager as SoundManagerType } from '../types/sound';

export class SoundManager implements SoundManagerType {
  private soundPools: Map<string, HTMLAudioElement[]>;
  private currentIndices: Map<string, number>;
  private activeTimeouts: Map<string, number[]>;
  private readonly poolSize: number;

  constructor(sounds: typeof SOUND_EFFECTS, poolSize: number = 3) {
    this.soundPools = new Map();
    this.currentIndices = new Map();
    this.activeTimeouts = new Map();
    this.poolSize = poolSize;

    // Initialize pools for each sound type
    Object.entries(sounds).forEach(([key, path]) => {
      this.soundPools.set(
        key,
        Array.from({ length: poolSize }, () => {
          const audio = new Audio(path);
          audio.volume = 0.2;
          return audio;
        })
      );
      this.currentIndices.set(key, 0);
      this.activeTimeouts.set(key, []);
    });
  }

  play(soundType: keyof typeof SOUND_EFFECTS, duration?: number, fadeOutDuration: number = 1000) {
    const pool = this.soundPools.get(soundType);
    const currentIndex = this.currentIndices.get(soundType) || 0;

    if (pool) {
      const sound = pool[currentIndex];
      sound.currentTime = 0;
      sound.volume = 0.2;

      // Enable looping if duration is longer than audio length
      if (duration) {
        sound.loop = true;
      }

      sound.play();

      // Update the current index for the next play
      this.currentIndices.set(soundType, (currentIndex + 1) % this.poolSize);

      if (duration) {
        const timeouts = this.activeTimeouts.get(soundType) || [];
        
        // Start fade out before duration ends
        if (fadeOutDuration > 0) {
          const fadeStartTime = duration - fadeOutDuration;
          const fadeTimeout = window.setTimeout(() => {
            this.fade(sound, 0.2, 0, fadeOutDuration);
          }, fadeStartTime);
          timeouts.push(fadeTimeout);
        }

        // Stop the sound after duration
        const stopTimeout = window.setTimeout(() => {
          sound.loop = false; // Disable looping
          sound.pause();
          sound.currentTime = 0;
          sound.volume = 0.2;
        }, duration);
        
        timeouts.push(stopTimeout);
        this.activeTimeouts.set(soundType, timeouts);

        return sound;
      }
    }
  }

  stop(soundType: keyof typeof SOUND_EFFECTS) {
    const pool = this.soundPools.get(soundType);
    if (pool) {
      pool.forEach(sound => {
        sound.loop = false; // Disable looping
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 0.2;
      });

      // Clear any active timeouts
      const timeouts = this.activeTimeouts.get(soundType);
      if (timeouts) {
        timeouts.forEach(timeout => window.clearTimeout(timeout));
        this.activeTimeouts.set(soundType, []);
      }
    }
  }

  private fade(audio: HTMLAudioElement, startVolume: number, endVolume: number, duration: number) {
    const startTime = performance.now();
    const volumeDiff = endVolume - startVolume;

    const updateVolume = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audio.volume = startVolume + (volumeDiff * progress);

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      }
    };

    requestAnimationFrame(updateVolume);
  }

  stopAll() {
    this.soundPools.forEach((pool, soundType) => {
      this.stop(soundType);
    });
  }

  setVolume(soundType: keyof typeof SOUND_EFFECTS, volume: number) {
    const pool = this.soundPools.get(soundType);
    if (pool) {
      pool.forEach(sound => {
        sound.volume = Math.max(0, Math.min(1, volume));
      });
    }
  }

  setGlobalVolume(volume: number) {
    this.soundPools.forEach((pool) => {
      pool.forEach(sound => {
        sound.volume = Math.max(0, Math.min(1, volume));
      });
    });
  }
}

export function CategoryGrid({ onCategorySelect, userProgress = {} }: CategoryGridProps) {
  const responsive = useResponsive();
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize sound manager with all sound effects
    soundManagerRef.current = new SoundManager(SOUND_EFFECTS);

    return () => {
      soundManagerRef.current = null;
    };
  }, []);

  useEffect(() => {
      const audio = new Audio('/sounds/intro.mp3');
      audio.preload = 'auto';
      audio.play();
      // Cleanup function to clear the intervals
      return () => {
      };
    }, []);

  const playSound = (soundType: keyof typeof SOUND_EFFECTS) => {
    if (soundEnabled) {
      soundManagerRef.current?.play(soundType);
    }
  };

  const handleCategorySelect = (category: Category) => {
    playSound('select');
    onCategorySelect(category);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', newValue.toString());
      return newValue;
    });
  };
  return (
    <div className={`category-grid-container`}>
      {/* Sound toggle button */}
      <button 
        onClick={toggleSound}
        className="sound-toggle-button"
        aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      
      <div className="worlds-container">
        <h2 className="pick-a-challenge-title text-center font-bold text-white">
          Sonique Worlds
        </h2>
      </div>
  
      <div className="scrollable-container overflow-y-auto h-[80vh] p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4 md:p-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategorySelect(category)}
          onMouseEnter={() => playSound('hover')}
          className="category-card group"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${category.backgroundImage})`,
          }}
        >
          <div className="card-content" role="button" aria-label={`Select ${category.name} category`}>
            {/* Glowing border effect */}
            <div className="glow-effect"></div>

            {/* Category name with responsive clamped font size */}
            <h3 className="category-title text-center">{category.name}</h3>

            {/* Progress bar container */}
            <div className="progress-wrapper">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((userProgress[category.id] || 0) / category.totalPuzzles) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {userProgress[category.id] || 0}/{category.totalPuzzles}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
    </div>
  );
}  