export interface AccessibilityState {
    isMobile: boolean;
    hasWebGL: boolean;
    orientation: 'portrait' | 'landscape';
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderActive: boolean;
    windowSize: {
      width: number;
      height: number;
    };
  }
  
  export interface AccessibilityContextType extends AccessibilityState {
    setHighContrast: (enabled: boolean) => void;
    // Add other methods as needed
  }