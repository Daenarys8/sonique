import React from 'react';
import { Star, Gamepad2, Trophy } from 'lucide-react';
import type { UserProfile } from '../types/game';
import './gameprogress.css';

type GameProgressProps = {
  profile: UserProfile;
};

export function GameProgress({ profile }: GameProgressProps) {
  const experienceToNextLevel = (Math.floor(profile.stats.totalScore / 1000) + 1) * 1000 - profile.stats.totalScore;
  const currentLevel = Math.floor(profile.stats.totalScore / 1000) + 1;
  const progressInLevel = (profile.stats.totalScore % 1000) / 10;
  
  return (
    <div className="game-progress-container relative overflow-hidden rounded-xl shadow-2xl">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-none" />
      
      {/* Content */}
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="level-badge">
            <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-gaming text-white tracking-wider glow-text">
            Level {currentLevel}
          </h2>
        </div>

        {/* Progress section */}
        <div className="space-y-6">
          {/* XP Progress */}
          <div className="progress-section">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-gaming text-sm">
                LEVEL {currentLevel}
              </span>
              <span className="text-blue-400 font-gaming text-sm">
                LEVEL {currentLevel + 1}
              </span>
            </div>
            
            {/* Custom progress bar */}
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
            
            <div className="text-center mt-2">
              <span className="text-cyan-400 font-gaming text-sm glow-text">
                {experienceToNextLevel} XP to next level
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-container">
            <div className="stat-item">
              <Gamepad2 className="w-5 h-5 text-green-400" />
              <span className="font-gaming text-green-400">
                {profile.stats.totalGames} Games
              </span>
            </div>
            <div className="stat-item">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-gaming text-yellow-400">
                {profile.stats.totalCoins} Coins
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
