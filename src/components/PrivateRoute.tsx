// components/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './LoadingPage';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PrivateRoute = ({ 
  children, 
  redirectTo = "/login" 
}: PrivateRouteProps) => {
  const { currentUser, loading, isGuest } = useAuth();
  const location = useLocation();

  // Use the same LoadingPage component for consistency
  if (loading) {
    return <LoadingPage onLoadComplete={() => {}} />;
  }

  // Redirect both non-authenticated and guest users to login
  if (!currentUser || isGuest) {
    // Preserve the attempted route for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        replace 
        state={{ 
          from: location,
          message: "Please log in to access this page" 
        }} 
      />
    );
  }

  // Render children for authenticated non-guest users
  return <>{children}</>;
};
