// components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { currentUser, loading, isGuest } = useAuth(); // Add isGuest check

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect both non-authenticated and guest users to login
  if (!currentUser || isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};