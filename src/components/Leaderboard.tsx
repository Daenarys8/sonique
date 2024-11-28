import React from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../types/game';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "BrainMaster", score: 1200, coins: 5000 },
  { rank: 2, username: "QuizWhiz", score: 1100, coins: 4500 },
  { rank: 3, username: "PuzzlePro", score: 1000, coins: 4000 },
];

export function Leaderboard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
      </div>
      <div className="space-y-4">
        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-indigo-600">#{entry.rank}</span>
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{entry.score} pts</span>
              <span className="text-yellow-600">{entry.coins} 🪙</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}