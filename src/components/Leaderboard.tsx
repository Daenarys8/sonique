import React from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types/game';
import '../styles/leaderboard.css';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "BrainMaster", score: 1200, coins: 5000 },
  { rank: 2, username: "QuizWhiz", score: 1100, coins: 4500 },
  { rank: 3, username: "PuzzlePro", score: 1000, coins: 4000 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="rank-icon" />;
    case 2:
      return <Medal className="rank-icon" />;
    case 3:
      return <Medal className="rank-icon" />;
    default:
      return <span className="rank-number">{rank}</span>;
  }
};

export function Leaderboard() {
  return (
    <div className="leaderboard-container relative overflow-hidden rounded-xl shadow-2xl w-full sm:w-[500px]">
      {/* Background with overlay */}
      <div className="relative inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm w-full" />

      {/* Fixed Header */}
      <div className="relative z-10 p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="trophy-icon-wrapper">
            <Trophy className="trophy-icon" />
          </div>
          <h2 className="leaderboard-title font-bold text-white tracking-wider font-gaming">
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
              className="leaderboard-entry group flex items-center justify-between w-full flex-wrap sm:flex-nowrap"
            >
              {/* Rank and Username */}
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="rank-badge flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                <span className="font-gaming text-white username">
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
