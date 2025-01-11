/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {  // Add theme wrapper
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.5' },
        },
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      maxWidth: {
        'screen-content': '90%',
      },
      // Add accessibility-related theme extensions
      colors: {
        'high-contrast': {
          text: '#ffffff',
          bg: '#000000',
          primary: '#ffffff',
          secondary: '#ffffff',
        }
      },
      fontSize: {
        'accessible-base': ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'accessible-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.015em' }],
      },
      minHeight: {
        'touch-target': '44px',
      },
      minWidth: {
        'touch-target': '44px',
      },
      padding: {
        'touch-safe': '0.75rem',
      },
      borderWidth: {
        'focus': '3px',
      },
      outlineWidth: {
        'focus': '3px',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      scrollbar: ['rounded', 'dark'],
      // Add accessibility-related variants
      backgroundColor: ['hover', 'focus', 'active', 'disabled', 'high-contrast'],
      textColor: ['hover', 'focus', 'active', 'disabled', 'high-contrast'],
      outline: ['focus-visible'],
      ringWidth: ['focus-visible'],
      ringColor: ['focus-visible'],
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    // Add a plugin for reduced motion if needed
    function({ addUtilities }) {
      addUtilities({
        '.motion-safe': {
          '@media (prefers-reduced-motion: no-preference)': {
            'transition-property': 'all',
            'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
            'transition-duration': '150ms',
          },
        },
        '.motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'transition-property': 'none',
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
            'scroll-behavior': 'auto !important',
          },
        },
        '.high-contrast': {
          'filter': 'contrast(200%) brightness(150%)',
        },
        '.focus-outline': {
          'outline': '3px solid currentColor',
          'outline-offset': '2px',
        },
      })
    },
  ],
};
