# Interactive Puzzle Game Project

## Overview
This is an interactive 3D puzzle game that combines educational quizzes with animated character battles. Players can compete against AI opponents while solving puzzles, with both guest and authenticated user modes available.

## Key Features
- 3D character models with animations
- Interactive battle system
- Educational puzzle content
- Guest and authenticated gameplay modes
- Responsive design for multiple devices
- Accessibility features
- Sound effects and background music

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm 8+

### Development Setup
1. Clone the repository
```bash
git clone [repository-url]
cd puzzle-game
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy the `.env.example` file to `.env` and configure the required variables:
```bash
cp .env.example .env
```
Then edit the `.env` file with your specific values:
- VITE_QUIZ_API_KEY - API key for quiz questions
- AWS Cognito settings for authentication
- API endpoints
- Game configuration options

4. Start development server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure
- `/src`
  - `/components` - React components
  - `/styles` - CSS styles and themes
  - `/services` - API and game services
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/types` - TypeScript types
  - `/utils` - Utility functions

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Testing
```bash
npm run test
```

## CSS Structure Optimization
The project uses a modular CSS approach with files organized by feature:
- `model-*.css` - 3D model styling
- `responsive-*.css` - Responsive design rules
- `accessibility.css` - Accessibility enhancements
- `game-interface-*.css` - Game UI components

## Technical Stack
- React + TypeScript
- Three.js for 3D rendering
- Vite for build tooling
- TailwindCSS for styling
- Web Audio API for sound effects

## Accessibility Features
- Screen reader support
- High contrast mode
- Reduced motion options
- Keyboard navigation
- Responsive font sizing

## Performance Considerations
- Code splitting
- Asset optimization
- Lazy loading
- Mobile-first design
- Progressive enhancement