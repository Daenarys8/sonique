import React from 'react';
import { CategoryGrid } from '../components/CategoryGrid';
import { Leaderboard } from '../components/Leaderboard';
import { GameProgress } from '../components/GameProgress';
import { useGameState } from '../hooks/useGameState';

const GameMainPage: React.FC = () => {
  const { userProfile } = useGameState();
  const hp = 4; // Default value, you might want to get this from a game state

  return (
    <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 relative z-10" role="main">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GameProgress profile={userProfile} hp={hp} />
          <CategoryGrid onCategorySelect={() => {}} />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </main>
  );
};

export default GameMainPage;