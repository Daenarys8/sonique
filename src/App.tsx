import React, { useState } from 'react';
import { Routes, Route} from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { SkipLink } from './components/SkipLink';
import { LoadingPage } from './components/LoadingPage';
import { PublicRoute } from './components/PublicRoute';
import { PrivateRoute } from './components/PrivateRoute';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import  ErrorBoundary  from './components/ErrorBoundary';
import './index.css';

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
                <GameMainPage />
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
