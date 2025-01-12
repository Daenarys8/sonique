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
import { GameProvider } from './contexts/GameContext';
import { useGame } from './contexts/GameContext';
import { SkipLink } from './components/SkipLink';
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
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import  ErrorBoundary  from './components/ErrorBoundary';
import './index.css';

// Remove unused SoundContext

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
    <main id="main-content" className="max-w-7xl mx-auto py-8 px-4 relative z-10" role="main">
      <div className="grid md:grid-cols-3 gap-8">
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

const BackgroundContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reducedMotion, highContrast } = useAccessibility();

  return (
    <div
      style={{
        backgroundImage: highContrast ? 'none' : "url('/assets/game1.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        transition: reducedMotion ? 'none' : 'background-image 0.3s ease',
        backgroundColor: highContrast ? '#000' : 'transparent'
      }}
      className={highContrast ? 'high-contrast' : ''}
    >
      {children}
    </div>
  );
};

const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ConfirmSignupPage = React.lazy(() => import('./pages/ConfirmSignupPage'));
const AuthenticationPage = React.lazy(() => import('./pages/AuthenticationPage'));
const GuestGamePage = React.lazy(() => import('./pages/GuestGamePage'));
const StartGamePage = React.lazy(() => import('./pages/StartGamePage'));
const GameMainPage = React.lazy(() => import('./pages/GameMainPage'));

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
    return <div className="loading-spinner" role="status">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative">
      <SkipLink targetId="main-content" />
      <React.Suspense fallback={<div className="loading-spinner" role="status" aria-live="polite">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/confirm-signup" 
            element={
              <PublicRoute>
                <ConfirmSignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <AuthenticationPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/guest" 
            element={
              <PublicRoute>
                <GuestGamePage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <StartGamePage />
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
      </React.Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <BackgroundContainer>
          <AuthProvider>
            <GameProvider>
              <div lang="en">
                <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
                <AppRoutes />
              </div>
            </GameProvider>
          </AuthProvider>
        </BackgroundContainer>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
