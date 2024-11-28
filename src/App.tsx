import React from 'react';
import { Header } from './components/Header';
import { CategoryGrid } from './components/CategoryGrid';
import { Leaderboard } from './components/Leaderboard';
import { GameProgress } from './components/GameProgress';
import { useGameState } from './hooks/useGameState';
import type { Category } from './types/game';

function App() {
  const { userProfile, updateCoins, completeCategory } = useGameState();

  const handleCategorySelect = (category: Category) => {
    console.log('Selected category:', category);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  return (
    <div className="min-h-screen relative">
      <div className="futuristic-bg"></div>
      <div className="grid-overlay"></div>
      <Header
        coins={userProfile.coins}
        onSettingsClick={handleSettingsClick}
        onProfileClick={handleProfileClick}
      />
      
      <main className="max-w-7xl mx-auto py-8 px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <GameProgress profile={userProfile} />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Category</h2>
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </div>
          <div>
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;