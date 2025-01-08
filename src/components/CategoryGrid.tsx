import React, { useEffect, useRef, useState } from 'react';
import type { Category } from '../types/game';
import './CategoryGrid.css';

const categories: Category[] = [
  { id: 'literature', name: 'Virellia', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/literature.jpg' },
  { id: 'science', name: 'Eclipsia', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/science.jpg' },
  { id: 'history', name: 'Zephora', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/history.jpg' },
  { id: 'math', name: 'Nexus', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/math.jpg' },
  { id: 'sports', name: 'Thalara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/sports.jpg' },
  { id: 'music', name: 'Calypsium', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/music.jpg' },
  { id: 'movies', name: 'Xenthoris', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/movies.jpg' },
  { id: 'random', name: 'Valkora', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/random.jpg' },

  { id: 'technology', name: 'Mepharaus', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/technology.jpg' },
  { id: 'psychology', name: 'Itheron', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/psychology.jpg' },
  { id: 'astronomy', name: 'Teros', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/astronomy.jpg' },
  { id: 'philosophy', name: 'Caldera', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/philosophy.jpg' },
  { id: 'geography', name: 'Solara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/geography.jpg' },
  { id: 'engineering', name: 'Ryonix', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/engineering.jpg' },
  { id: 'biology', name: 'Sylphira', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/biology.jpg' },

  { id: 'language', name: 'Lunara', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/language.jpg' },
  { id: 'economics', name: 'Proxima', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/economics.jpg' },
  { id: 'art', name: 'Selarion', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/art.jpg' },
  { id: 'sociology', name: 'Veridion', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/sociology.jpg' },
  { id: 'politics', name: 'Zyphar', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/politics.jpg' },
  { id: 'health', name: 'Nyronis', progress: 0, totalPuzzles: 10000, backgroundImage: '/assets/health.jpg' }
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
export class SoundManager {
  private soundPools: Map<string, HTMLAudioElement[]>;
  private currentIndices: Map<string, number>;
  private readonly poolSize: number;

  constructor(sounds: typeof SOUND_EFFECTS, poolSize: number = 3) {
    this.soundPools = new Map();
    this.currentIndices = new Map();
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
    });
  }

  play(soundType: keyof typeof SOUND_EFFECTS) {
    const pool = this.soundPools.get(soundType);
    const currentIndex = this.currentIndices.get(soundType) || 0;

    if (pool) {
      const sound = pool[currentIndex];
      sound.currentTime = 0;
      sound.play();
      this.currentIndices.set(soundType, (currentIndex + 1) % this.poolSize);
    }
  }
}

export function CategoryGrid({ onCategorySelect, userProgress = {} }: CategoryGridProps) {
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  useEffect(() => {
    // Initialize sound manager with all sound effects
    soundManagerRef.current = new SoundManager(SOUND_EFFECTS);

    return () => {
      soundManagerRef.current = null;
    };
  }, []);

  useEffect(() => {
      const audio = new Audio('/sounds/intro.wav');
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
    <div className="category-grid-container">
      {/* Sound toggle button */}
      <button 
        onClick={toggleSound}
        className="sound-toggle-button"
        aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      <div className="worlds-container">
        <h2 className="pick-a-challenge-title text-2xl text-center font-bold text-white-800 mb-6">
            Sonique Worlds
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 p-8">
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
            <div className="card-content">
              {/* Glowing border effect */}
              <div className="glow-effect"></div>
              
              {/* Category name with special styling */}
              <h3 className="category-title">{category.name}</h3>
              
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
  );
}
