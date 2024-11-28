import React from 'react';
import { Star } from 'lucide-react';
import type { UserProfile } from '../types/game';

type GameProgressProps = {
  profile: UserProfile;
};

export function GameProgress({ profile }: GameProgressProps) {
  const experienceToNextLevel = (profile.level * 1000) - (profile.completedPuzzles * 100);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-800">Your Progress</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Level {profile.level}</span>
          <span className="text-gray-600">{experienceToNextLevel} XP to next level</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(profile.completedPuzzles % 10) * 10}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Puzzles Completed: {profile.completedPuzzles}</span>
          <span>Total Coins: {profile.coins}</span>
        </div>
      </div>
    </div>
  );
}