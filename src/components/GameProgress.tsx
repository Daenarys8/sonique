import React from 'react';
import { Star, Gamepad2, Trophy, Heart } from 'lucide-react';
import type { UserProfile } from '../types/game';
import './gameprogress.css';

type GameProgressProps = {
  profile: UserProfile;
  hp: number; // HP passed as a prop
};

export function GameProgress({ profile, hp }: GameProgressProps) {
  const experienceToNextLevel = (Math.floor(profile.stats.totalScore / 1000) + 1) * 1000 - profile.stats.totalScore;
  const currentLevel = Math.floor(profile.stats.totalScore / 1000) + 1;
  const progressInLevel = (profile.stats.totalScore % 1000) / 10;

  // Health percentage calculation
  const hpPercentage = (hp / 5) * 100; // Assuming max HP is 5

  return (
    <div className="game-progress-container">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-none" />
      
      {/* Content */}
      <div className="relative z-10 p-4 space-y-0"> {/* Reduced padding */}
        <div className="flex items-center gap-1"> {/* Reduced gap */}
          <div className="level-badge">
            <Star className="w-5 h-5 text-yellow-400 animate-pulse" /> {/* Smaller icon size */}
          </div>
          <h2 className="level-title font-gaming text-white glow-text">
            Level {currentLevel}
          </h2>
        </div>
  
        {/* Progress section */}
        <div className="space-y-0"> {/* Reduced space between sections */}
          {/* XP Progress */}
          <div className="progress-section">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-gaming glow-text">
                LEVEL {currentLevel}
              </span>
              <span className="text-blue-400 font-gaming glow-text">
                LEVEL {currentLevel + 1}
              </span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar-background" />
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressInLevel}%` }}
              />
              <div className="progress-markers">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`marker ${progressInLevel > i * 10 ? 'active' : ''}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center mt-1">
              <span className="text-cyan-400 font-gaming glow-text">
                {experienceToNextLevel} XP to next level
              </span>
            </div>
          </div>
  
          {/* HP Progress */}
          <div className="progress-section">
            <div className="flex justify-between items-center mb-1">
              <span className="text-red-400 font-gaming glow-text">HP</span>
              <span className="text-green-400 font-gaming glow-text">Max HP</span>
            </div>
  
            {/* HP Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar-background" />
              <div 
                className="progress-bar-fill bg-red-500"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
  
            <div className="text-center mt-1">
              <span className="text-white font-gaming glow-text">
                {hp} / 5 HP remaining
              </span>
            </div>
          </div>
  
          {/* Stats */}
          <div className="stats-container">
            <div className="stat-item">
              <Gamepad2 className="stat-icon" /> {/* Small icon */}
              <span className="font-gaming text-green-400 glow-text">
                {profile.stats.totalGames} Games
              </span>
            </div>
            <div className="stat-item">
              <Trophy className="stat-icon" /> {/* Small icon */}
              <span className="font-gaming text-yellow-400 glow-text">
                {profile.stats.totalCoins} Coins
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );      
}
