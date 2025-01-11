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
    <div className="leaderboard-container relative overflow-hidden rounded-xl shadow-2xl w-[500px] responsive-container">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm" />

      {/* Fixed Header */}
      <div className="relative z-10 p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="trophy-icon-wrapper">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider font-gaming">
            Leaderboard
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 p-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Leaderboard entries */}
        <div className="space-y-3">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="leaderboard-entry group flex items-center justify-between w-full"
            >
              {/* Rank and Username */}
              <div className="flex items-center gap-4">
                <div className="rank-badge flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                <span className="font-gaming text-white text-lg min-w-[120px]">
                  {entry.username}
                </span>
              </div>

              {/* Score and Coins */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="score-badge whitespace-nowrap">
                  {entry.score} pts
                </div>
                <div className="coins-badge whitespace-nowrap">
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
