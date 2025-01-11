import { fontConfig } from '../config/font-loading';

export function loadFonts() {
  // Add preload links for critical fonts
  fontConfig.preloadFonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Load async fonts
  const asyncFontLoader = new FontFace('AsyncFont', 'url(/path/to/font.woff2)');
  fontConfig.asyncFonts.forEach(fontUrl => {
    const font = new FontFace(
      fontUrl.includes('orbitron') ? 'Orbitron' : 'Share Tech Mono',
      `url(${fontUrl})`,
      { display: fontConfig.display }
    );
    
    font.load().then(loadedFont => {
      document.fonts.add(loadedFont);
    }).catch(err => {
      console.error('Failed to load font:', err);
    });
  });
}