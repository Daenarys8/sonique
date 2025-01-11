import { useEffect } from 'react';

export function useImagePreload(imagePaths: string[]) {
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = imagePaths.map(path => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(path);
          img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
          img.src = path;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Failed to preload images:', error);
      }
    };

    preloadImages();
  }, [imagePaths]);
}