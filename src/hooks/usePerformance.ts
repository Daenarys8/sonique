import { useEffect } from 'react';
import { loadFonts } from '../utils/fontLoader';
import { preloadCriticalImages } from '../utils/imageOptimization';

interface PerformanceConfig {
  preloadImages?: string[];
  loadFonts?: boolean;
}

export function usePerformance(config: PerformanceConfig = {}) {
  useEffect(() => {
    // Load fonts if enabled
    if (config.loadFonts) {
      loadFonts();
    }

    // Preload critical images if any
    if (config.preloadImages?.length) {
      preloadCriticalImages(config.preloadImages);
    }
  }, [config.loadFonts, config.preloadImages]);
}