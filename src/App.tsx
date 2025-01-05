import React, { useState, useCallback, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
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
import { SignupForm } from './components/SignupForm';
import { ConfirmSignup } from './components/ConfirmSignup';
import { StartPage } from './components/StartPage';
import { Profile } from './components/Profile';
import GuestGame from './components/GuestGame';
import { PublicRoute } from './components/PublicRoute';
import { PrivateRoute } from './components/PrivateRoute';
import './index.css';

const SoundContext = createContext<{ isSoundEnabled: boolean }>({ isSoundEnabled: true });

function GameLayout({ children }: { children: (props: { isSoundEnabled: boolean, toggleSound: () => void }) => React.ReactNode }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );
  const { userProfile } = useGameState();
  const [showProfile, setShowProfile] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const toggleSound = useCallback(() => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    localStorage.setItem('soundEnabled', String(newSoundEnabled));
  }, [isSoundEnabled]);

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  return (
    <>
      <Header
        coins={userProfile.stats.totalCoins}
        onSettingsClick={handleSettingsClick}
        onProfileClick={handleProfileClick}
      />
      {children({ isSoundEnabled, toggleSound })}
      {showSettings && (
        <Settings
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

function GameContent() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { userProfile, updateCoins, completeCategory } = useGameState();
  const { isSoundEnabled } = useContext(SoundContext); // Add this context for sound settings

  const handleCategorySelect = useCallback((
    category: Omit<Category, 'description' | 'difficulty'> & { 
      description?: string; 
      difficulty?: 'easy' | 'medium' | 'hard' 
    }
  ) => {
    const fullCategory: Category = {
      ...category,
      description: category.description || '',
      difficulty: category.difficulty || 'medium'
    };
    setSelectedCategory(fullCategory);
  }, []);

  const handlePuzzleComplete = useCallback((coinsEarned: number) => {
    if (selectedCategory && 'id' in selectedCategory && 'name' in selectedCategory && 'icon' in selectedCategory) {
      updateCoins(coinsEarned); // Use actual coins earned instead of fixed 10
      const category: Category = {
        id: selectedCategory.id,
        name: selectedCategory.name,
        progress: selectedCategory.progress || 0,
        totalPuzzles: selectedCategory.totalPuzzles || 0,
        description: selectedCategory.description,
        difficulty: selectedCategory.difficulty || 'medium'
      };
      completeCategory(category);
    }
    setSelectedCategory(null);
  }, [selectedCategory, updateCoins, completeCategory]);

  return selectedCategory ? (
    <PuzzleScreen
      categoryId={selectedCategory?.id}
      onComplete={handlePuzzleComplete}
      onBack={() => setSelectedCategory(null)}
      isSoundEnabled={isSoundEnabled}
    />
  ) : (
    <main className="max-w-7xl mx-auto py-8 px-4 relative z-10">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GameProgress profile={userProfile} />
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  const handleLoadComplete = () => {
    setInitialLoading(false);
  };

  // Show loading page only during initial load
  if (initialLoading) {
    return <LoadingPage onLoadComplete={handleLoadComplete} />;
  }

  // Show a simple loading indicator during auth state changes
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen relative">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          } 
        />
        <Route 
          path="/confirm-signup" 
          element={
            <PublicRoute>
              <ConfirmSignup />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthenticationScreen />
            </PublicRoute>
          } 
        />
        <Route 
          path="/guest" 
          element={
            <PublicRoute>
              <GuestGame />
            </PublicRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <StartPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/game" 
          element={
            <PrivateRoute>
              <GameLayout>
                {() => <GameContent />}
              </GameLayout>
            </PrivateRoute>
          } 
        />
        {/* ... other routes ... */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div
    style={{
      backgroundImage: "url('/assets/game1.jpg')",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      minHeight: "100vh",
    }}
  >
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </div>
  );
}

export default App;
