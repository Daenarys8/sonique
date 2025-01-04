import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { getUserProfile, createUserProfile, getDefaultProfile } from '../services/aws/userService';

interface User {
  username: string;
  id: string;
  email?: string;
  profile?: any; // Will be populated with UserProfile from userService
}

interface UserStats {
  totalGames: number;
  totalScore: number;
  totalCoins: number;
}

interface UserProfile {
  userId: string;
  username: string;
  stats: UserStats;
  // Add any other profile properties you might have
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  isGuest: boolean;
  startGuestSession: () => void;
  endGuestSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for guest user first
    const storedGuestUser = localStorage.getItem('guestUser');
    const storedIsGuest = localStorage.getItem('isGuest');
    
    if (storedIsGuest === 'true' && storedGuestUser) {
      setCurrentUser(JSON.parse(storedGuestUser));
      setIsGuest(true);
      setLoading(false);
    } else {
      const isMounted = { current: true };
      fetchCurrentUser(isMounted);
      return () => {
        isMounted.current = false;
      };
    }
  }, []);

  const fetchCurrentUser = async (isMounted: { current: boolean }) => {
    try {
        // First check if we're in guest mode
        const storedIsGuest = localStorage.getItem('isGuest');
        const storedGuestUser = localStorage.getItem('guestUser');
        
        if (storedIsGuest === 'true' && storedGuestUser) {
          if (isMounted.current) {
            setCurrentUser(JSON.parse(storedGuestUser));
            setIsGuest(true);
            setLoading(false);
          }
          return; // Exit early for guest users
        }
      // Fetch auth user and attributes in parallel for better performance
      const [authUser, attributes] = await Promise.all([
        getCurrentUser(),
        fetchUserAttributes()
      ]);
  
      if (!isMounted.current) return;
  
      // Explicitly type the userProfile
    const userProfile: UserProfile | null = await getUserProfile(authUser.userId);
      
      // Create profile if it doesn't exist
      if (!userProfile && isMounted.current) {
        const defaultProfile = getDefaultProfile(authUser.userId, authUser.username);
        const newProfile = await createUserProfile(authUser.userId, defaultProfile);
        if (isMounted.current) {
          setCurrentUser({
            username: authUser.username,
            id: authUser.userId,
            email: attributes.email,
            profile: newProfile
          });
          setError(null);
        }
      } else if (userProfile && isMounted.current) {
        setCurrentUser({
          username: authUser.username,
          id: authUser.userId,
          email: attributes.email,
          profile: userProfile
        });
        setError(null);
      }
  
    } catch (err) {
      if (!isMounted.current) return;
  
      console.error('Error fetching current user:', err);
      
      const authError = err as { name?: string; message?: string };
      
      switch (authError.name) {
        case 'UserNotFoundException':
        case 'NotAuthorizedException':
        case 'UserUnAuthenticatedException':
          // Handle unauthenticated state gracefully
          setCurrentUser(null);
          setError(null); // Don't show error if user is just not logged in
          break;
        case 'NetworkError':
          setError('Network connection issue. Please check your connection.');
          break;
        default:
          setCurrentUser(null);
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password, options: {
        authFlowType: "USER_PASSWORD_AUTH"  // Add this explicit auth flow
      } });
      
      if (isSignedIn) {
        const authUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        const userProfile = await getUserProfile(authUser.userId);
        if (!userProfile) {
          const defaultProfile = getDefaultProfile(authUser.userId, authUser.username);
          await createUserProfile(authUser.userId, defaultProfile);
        }
        const profile = userProfile || await getUserProfile(authUser.userId);
        setCurrentUser({
          username: authUser.username,
          id: authUser.userId,
          email: attributes.email,
          profile
        });
        setError(null);
        setIsGuest(false);
      } else {
        // Handle additional authentication steps if needed
        switch (nextStep.signInStep) {
          case 'CONFIRM_SIGN_UP':
            setError('Please confirm your email address');
            break;
          case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
            setError('Please change your password');
            break;
          default:
            setError(`Additional step required: ${nextStep.signInStep}`);
        }
        throw new Error(`Authentication requires additional step: ${nextStep.signInStep}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (isGuest) {
        // Clear guest session
        localStorage.removeItem('guestUser');
        localStorage.removeItem('isGuest');
        setCurrentUser(null);
        setIsGuest(false);
      } else {
        // Regular user logout
        await signOut();
        setCurrentUser(null);
        setIsGuest(false);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const guestUser: User = {
        username: `guest-${Math.random().toString(36).substring(7)}`,
        id: `guest-${Date.now()}`,
      };
      
      try {
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
        localStorage.setItem('isGuest', 'true');
      } catch (storageError) {
        console.warn('Failed to persist guest session:', storageError);
      }
      
      setCurrentUser(guestUser);
      setIsGuest(true);
      setError(null);
    } catch (err) {
      console.error('Guest login error:', err);
      setError('Failed to login as guest. Please try again.');
      throw err;
    }
  };

  const startGuestSession = () => {
    setIsGuest(true);
    setLoading(false);
  };

  const endGuestSession = () => {
    setIsGuest(false);
  };


  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    loginAsGuest,
    isGuest,
    startGuestSession,
    endGuestSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
