// components/PublicRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './LoadingPage';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ children, redirectTo = "/game" }: PublicRouteProps) => {
  const { currentUser, isGuest, loading: authLoading } = useAuth();
  const location = useLocation();

  // Only show loading when we're actually checking auth status
  if (authLoading) {
    return <LoadingPage onLoadComplete={() => {}} />;
  }

  // Only redirect if user is authenticated AND not a guest
  if (currentUser && !isGuest) {
    // Preserve the intended destination if it exists
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Render children for guests or unauthenticated users
  return <>{children}</>;
};
