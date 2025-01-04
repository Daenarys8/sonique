import React from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types/game';
import './leaderboard.css';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "BrainMaster", score: 1200, coins: 5000 },
  { rank: 2, username: "QuizWhiz", score: 1100, coins: 4500 },
  { rank: 3, username: "PuzzlePro", score: 1000, coins: 4000 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="font-bold text-lg">{rank}</span>;
  }
};

export function Leaderboard() {
  return (
    <div className="leaderboard-container relative overflow-hidden rounded-xl shadow-2xl">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="trophy-icon-wrapper">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider font-gaming">
            Leaderboard
          </h2>
        </div>

        {/* Leaderboard entries */}
        <div className="space-y-3">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="leaderboard-entry group"
            >
              {/* Rank and Username */}
              <div className="flex items-center gap-4">
                <div className="rank-badge">
                  {getRankIcon(entry.rank)}
                </div>
                <span className="font-gaming text-white text-lg">
                  {entry.username}
                </span>
              </div>

              {/* Score and Coins */}
              <div className="flex items-center gap-6">
                <div className="score-badge">
                  {entry.score} pts
                </div>
                <div className="coins-badge">
                  {entry.coins} 
                  <span className="ml-1 animate-bounce">🪙</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
