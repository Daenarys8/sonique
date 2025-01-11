import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  label = 'Loading...' 
}: LoadingSpinnerProps) {
  const { reducedMotion, highContrast } = useAccessibility();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div
      role="status"
      className="inline-flex items-center gap-2"
      aria-label={label}
    >
      <svg
        className={`
          animate-spin 
          ${sizeClasses[size]} 
          ${highContrast ? 'text-white' : 'text-indigo-600'}
        `}
        style={{
          animation: reducedMotion ? 'none' : undefined
        }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}