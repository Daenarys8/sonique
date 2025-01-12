/**
 * Font loading optimization configuration
 */
export const fontConfig = {
  // Font display strategy
  display: 'swap' as const,
  
  // Preload critical fonts
  preloadFonts: [
    '/fonts/orbitron-v25-latin-regular.woff2',
    '/fonts/tech-mono-v15-latin-regular.woff2'
  ],
  
  // Optional fonts to load asynchronously
  asyncFonts: [
    '/fonts/orbitron-v25-latin-700.woff2',
    '/fonts/tech-mono-v15-latin-700.woff2'
  ],

  // Font families
  families: {
    orbitron: {
      name: 'Orbitron',
      weights: [400, 700],
      styles: ['normal'],
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
    },
    techMono: {
      name: 'Share Tech Mono',
      weights: [400],
      styles: ['normal'],
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
    }
  }
};