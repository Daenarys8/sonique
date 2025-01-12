import React, { useState, useCallback } from 'react';
import { CategoryGrid } from '../components/CategoryGrid';
import { Leaderboard } from '../components/Leaderboard';
import { GameProgress } from '../components/GameProgress';
import { useGameState } from '../hooks/useGameState';
import { Header } from '../components/Header';
import { useGame } from '../contexts/GameContext';
import { PuzzleScreen } from '../components/PuzzleScreen';
import { Settings } from '../components/Settings';
import { Profile } from '../components/Profile';

function GameLayout({ children }: { children: (props: { isSoundEnabled: boolean, toggleSound: () => void }) => React.ReactNode }) {
  const { userProfile } = useGameState();
  const {
    isSoundEnabled,
    showSettings,
    showProfile,
    toggleSound,
    handleSettingsClick,
    handleProfileClick,
    handleSettingsClose,
    handleProfileClose
  } = useGame();

  return (
    <>
      <Header
        coins={userProfile.stats.totalCoins}
        onSettingsClick={handleSettingsClick}
        onProfileClick={handleProfileClick}
        style={{
          fontSize: 'clamp(1.25rem, 2vw, 2rem)', // Clamp for the header font size
        }}
      />
      {children({ isSoundEnabled, toggleSound })}
      {showSettings && (
        <Settings
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          onClose={handleSettingsClose}
        />
      )}
      {showProfile && (
        <Profile onClose={handleProfileClose} />
      )}
    </>
  );
}

function GameContent() {
  const { userProfile, updateCoins, completeCategory } = useGameState();
  const { 
    selectedCategory,
    isSoundEnabled,
    handleCategorySelect,
    handleCategoryClear
  } = useGame();
  const [hp, setHp] = useState(4);

  const handlePuzzleComplete = useCallback((coinsEarned: number) => {
    if (selectedCategory && 'id' in selectedCategory && 'name' in selectedCategory && 'icon' in selectedCategory) {
      updateCoins(coinsEarned);
      completeCategory(selectedCategory);
      handleCategoryClear();
    }
  }, [selectedCategory, updateCoins, completeCategory, handleCategoryClear]);

  return selectedCategory ? (
    <PuzzleScreen
      categoryId={selectedCategory?.id}
      onComplete={handlePuzzleComplete}
      onBack={handleCategoryClear}
      isSoundEnabled={isSoundEnabled}
    />
  ) : (
    <main 
      id="main-content" 
      className="max-w-7xl mx-auto py-8 px-4 relative z-10" 
      role="main"
      style={{
        padding: 'clamp(1rem, 2vw, 2.5rem)', // Clamping padding for responsive design
      }}
    >
      <div 
        className="grid md:grid-cols-3 gap-8"
        style={{
          gap: 'clamp(1rem, 2vw, 2.5rem)', // Clamping grid gap based on viewport width
        }}
      >
        <div className="md:col-span-2">
          <GameProgress profile={userProfile} hp={hp} />
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}

const GameMainPage: React.FC = () => {
  return (
    <main 
      id="main-content" 
      className="max-w-7xl mx-auto py-8 px-4 relative z-10" 
      role="main"
      style={{
        maxWidth: 'clamp(300px, 80vw, 1200px)', // Clamping max width
        padding: 'clamp(1rem, 2vw, 2.5rem)', // Clamping padding for the main content
      }}
    >
        <GameLayout>
          {() => <GameContent />}
        </GameLayout>
    </main>
  );
};

export default GameMainPage;
