import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/game-responsive.css';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const responsive = useResponsive();
  
  return (
    <div className={`game-container ${responsive.isLandscape ? 'landscape' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
};