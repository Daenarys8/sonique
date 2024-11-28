# Project Overview

This is a React TypeScript puzzle game application with the following key features:

## Architecture
- Frontend: React 18 with TypeScript
- Styling: Tailwind CSS
- Build Tool: Vite
- Backend Integration: AWS Services (DynamoDB, Lambda, S3, Bedrock Runtime)

## Key Components
1. **Main Application (App.tsx)**
   - Header with coins display
   - Category grid for puzzle selection
   - Game progress tracking
   - Leaderboard integration

2. **Puzzle Game (PuzzleGame.tsx)**
   - Interactive puzzle interface
   - Real-time answer validation
   - Score tracking
   - Leaderboard updates

3. **Services**
   - AWS integration for puzzle and leaderboard data
   - Puzzle service for retrieving puzzles
   - Leaderboard service for score management

4. **Utils**
   - Puzzle utilities for word scrambling
   - Equation scrambling functionality
   - Answer validation

## Data Types
- Puzzles with questions, options, and scoring
- User profiles with progress tracking
- Leaderboard entries
- Game categories

## Key Features
1. Category-based puzzle selection
2. Real-time score tracking
3. Global leaderboard
4. User progress tracking
5. Interactive puzzle solving
6. AWS backend integration

## Dependencies
- AWS SDK for various services
- React and React DOM
- Lucide React for icons
- Development tools including TypeScript, ESLint, and Tailwind CSS