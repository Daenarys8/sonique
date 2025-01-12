import React from 'react';
import '../styles/responsive-updates.css';
import '../styles/responsive.css';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = ''
}) => {
  return (
    <div className={`responsive-container ${className}`.trim()}>
      {children}
    </div>
  );
};