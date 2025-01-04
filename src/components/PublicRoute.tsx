// components/PublicRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { currentUser, isGuest, loading: authLoading } = useAuth();
  
    if (authLoading) {
      return <div>Loading...</div>;
    }
  
    // Allow guest users to access public routes, redirect authenticated users
    if (currentUser && !isGuest) {
      return <Navigate to="/guest" replace />;
    }
  
    return <>{children}</>;
  };
