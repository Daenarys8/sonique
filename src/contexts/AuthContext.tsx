import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
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

  

  const checkGuestUser = useCallback(() => {
    const storedIsGuest = localStorage.getItem('isGuest');
    const storedGuestUser = localStorage.getItem('guestUser');
    
    if (storedIsGuest === 'true' && storedGuestUser) {
      try {
        const guestUser = JSON.parse(storedGuestUser);
        setCurrentUser(guestUser);
        setIsGuest(true);
        setError(null);
        return true;
      } catch (e) {
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestUser');
      }
    }
    return false;
  }, []);

  const fetchCurrentUser = useCallback(async (isMounted: { current: boolean }) => {
    if (checkGuestUser()) {
      if (isMounted.current) {
        setLoading(false);
      }
      return;
    }

    try {
      const session = await fetchAuthSession();
      
      if (!session?.tokens) {
        if (isMounted.current) {
          setCurrentUser(null);
          setIsGuest(false);
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        const [authUser, attributes] = await Promise.all([
          getCurrentUser(),
          fetchUserAttributes()
        ]);

        if (!isMounted.current) return;

        const userProfile = await getUserProfile(authUser.userId);
        
        if (!isMounted.current) return;

        if (!userProfile) {
          const defaultProfile = getDefaultProfile(authUser.userId, authUser.username);
          const newProfile = await createUserProfile(authUser.userId, defaultProfile);
          
          if (isMounted.current) {
            setCurrentUser({
              username: authUser.username,
              id: authUser.userId,
              email: attributes.email,
              profile: newProfile
            });
            setIsGuest(false);
            setError(null);
          }
        } else {
          if (isMounted.current) {
            setCurrentUser({
              username: authUser.username,
              id: authUser.userId,
              email: attributes.email,
              profile: userProfile
            });
            setIsGuest(false);
            setError(null);
          }
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
          setIsGuest(false);
          setError('Failed to load user data');
        }
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Error fetching current user:', err);
        
        const authError = err as { name?: string; message?: string };
        
        switch (authError.name) {
          case 'UserNotFoundException':
          case 'NotAuthorizedException':
          case 'UserUnAuthenticatedException':
            setCurrentUser(null);
            setIsGuest(false);
            setError(null);
            break;
          case 'NetworkError':
            setCurrentUser(null);
            setIsGuest(false);
            setError('Network connection issue. Please check your connection.');
            break;
          default:
            setCurrentUser(null);
            setIsGuest(false);
            setError('An unexpected error occurred. Please try again.');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [checkGuestUser]);

  const login = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username, 
        password, 
        options: {
          authFlowType: "USER_PASSWORD_AUTH"
        } 
      });

      if (isSignedIn) {
        const [authUser, attributes] = await Promise.all([
          getCurrentUser(),
          fetchUserAttributes()
        ]);
        
        let profile;
        try {
          const userProfile = await getUserProfile(authUser.userId);
          if (!userProfile) {
            const defaultProfile = getDefaultProfile(authUser.userId, authUser.username);
            profile = await createUserProfile(authUser.userId, defaultProfile);
          } else {
            profile = userProfile;
          }
        } catch (profileError) {
          console.error('Error fetching/creating profile:', profileError);
          profile = null;
        }

        setCurrentUser({
          username: authUser.username,
          id: authUser.userId,
          email: attributes.email,
          profile
        });
        setError(null);
        setIsGuest(false);
      } else {
        handleAuthStep(nextStep);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      throw err;
    }
  };

  const handleAuthStep = (nextStep: any) => {
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
  };

  const logout = async () => {
    try {
      if (isGuest) {
        // Clear guest session
        localStorage.removeItem('guestUser');
        localStorage.removeItem('isGuest');
      } else {
        await signOut();
      }
      
      setCurrentUser(null);
      setIsGuest(false);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      const guestUser: User = {
        username: `guest-${randomId}`,
        id: `guest-${timestamp}`,
        profile: {
          userId: `guest-${timestamp}`,
          username: `guest-${randomId}`,
          stats: {
            totalGames: 0,
            totalScore: 0,
            totalCoins: 0
          }
        }
      };
      
      setCurrentUser(guestUser);
      setIsGuest(true);
      setError(null);

      // Persist guest user to localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      localStorage.setItem('isGuest', 'true');
      
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err.message || 'Failed to login as guest. Please try again.');
      throw err;
    }
  };

  const startGuestSession = () => {
    setIsGuest(true);
    setLoading(false);
    setError(null);
  };

  const endGuestSession = () => {
    setIsGuest(false);
    setError(null);
  };

  useEffect(() => {
    const isMounted = { current: true };
    
    // Set loading to true before starting the auth check
    setLoading(true);
    
    // Start the auth check process
    fetchCurrentUser(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, [fetchCurrentUser]);

  const value = useMemo(() => ({
    currentUser,
    loading,
    error,
    login,
    logout,
    loginAsGuest,
    isGuest,
    startGuestSession,
    endGuestSession
  }), [currentUser, loading, error, isGuest]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
