import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { CategoryGrid } from './components/CategoryGrid';
import { Leaderboard } from './components/Leaderboard';
import { GameProgress } from './components/GameProgress';
import { useGameState } from './hooks/useGameState';
import type { Category } from './types/game';
import { AuthenticationScreen } from './components/AuthenticationScreen';
import { PuzzleScreen } from './components/PuzzleScreen';
import { LoadingPage } from './components/LoadingPage';
import { Settings } from './components/Settings';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const { userProfile, updateCoins, completeCategory } = useGameState();
  const { currentUser, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !currentUser) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [authLoading, currentUser]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Omit<Category, 'description' | 'difficulty'> & { description?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => {
    // Ensure we have a complete Category object
    const fullCategory: Category = {
      ...category,
      description: category.description || '',
      difficulty: category.difficulty || 'medium'
    };
    setSelectedCategory(fullCategory);
  };

  const handlePuzzleComplete = () => {
    // Update progress and coins
    if (selectedCategory && 'id' in selectedCategory && 'name' in selectedCategory && 'icon' in selectedCategory) {
      updateCoins(10); // Award coins for completion
      // Ensure all required Category fields are present
      const category: Category = {
        id: selectedCategory.id,
        name: selectedCategory.name,
        icon: selectedCategory.icon,
        progress: selectedCategory.progress || 0,
        totalPuzzles: selectedCategory.totalPuzzles || 0,
        description: selectedCategory.description,
        difficulty: selectedCategory.difficulty || 'medium'
      };
      completeCategory(category);
    }
    setSelectedCategory(null);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const toggleSound = () => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', String(newSoundEnabled));
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  return (
    <div className="min-h-screen relative">
      {isLoading ? (
        <LoadingPage onLoadComplete={handleLoadComplete} />
      ) : showAuth && !currentUser ? (
        <AuthenticationScreen />
      ) : selectedCategory ? (
        <PuzzleScreen
          categoryId={selectedCategory?.id}
          onComplete={handlePuzzleComplete}
          onBack={() => setSelectedCategory(null)}
        />
      ) : (
        <>
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
      {showSettings && (
        <Settings
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          onClose={() => setShowSettings(false)}
        />
      )}
        </>
      )}
    </div>
  );
}

export default App;