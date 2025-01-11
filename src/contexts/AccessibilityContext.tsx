import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { AccessibilityState, AccessibilityContextType } from '../types/accessibility';

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const getInitialState = (): AccessibilityState => ({
  isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  hasWebGL: false, // Will be updated in useEffect
  orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast: false,
  screenReaderActive: false,
  windowSize: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>(getInitialState);

  // Check WebGL support
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        setState(prev => ({ ...prev, hasWebGL }));
      } catch(e) {
        setState(prev => ({ ...prev, hasWebGL: false }));
      }
    };

    checkWebGL();
  }, []);

  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = () => {
      setState(prev => ({
        ...prev,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }));
    };

    const debouncedResize = debounce(handleResize, 100);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setState(prev => ({
        ...prev,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      }));
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial orientation check
    handleOrientationChange();

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Handle reduced motion preference
  useEffect(() => {
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    motionMediaQuery.addEventListener('change', handleMotionPreference);
    setState(prev => ({ ...prev, reducedMotion: motionMediaQuery.matches }));
    return () => motionMediaQuery.removeEventListener('change', handleMotionPreference);
  }, []);

  // Handle high contrast preference
  useEffect(() => {
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleContrastPreference = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, highContrast: e.matches }));
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };

    contrastMediaQuery.addEventListener('change', handleContrastPreference);
    setState(prev => ({ ...prev, highContrast: contrastMediaQuery.matches }));
    document.documentElement.classList.toggle('high-contrast', contrastMediaQuery.matches);
    return () => contrastMediaQuery.removeEventListener('change', handleContrastPreference);
  }, []);

  // Memoized context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    ...state,
    setHighContrast: (enabled: boolean) => {
      setState(prev => ({ ...prev, highContrast: enabled }));
      document.documentElement.classList.toggle('high-contrast', enabled);
    },
    setReducedMotion: (enabled: boolean) => {
      setState(prev => ({ ...prev, reducedMotion: enabled }));
    }
  }), [state]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Custom hook with error boundary
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};