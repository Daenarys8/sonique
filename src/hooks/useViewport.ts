import { useState, useEffect } from 'react';
import { getViewportSize } from '../utils/deviceDetection';

export const useViewport = () => {
  const [viewport, setViewport] = useState(getViewportSize());
  const [orientation, setOrientation] = useState(window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape');

  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportSize());
      setOrientation(window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape');
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return { ...viewport, orientation };
};