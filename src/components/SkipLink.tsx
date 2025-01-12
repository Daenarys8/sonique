import React from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white 
        focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-indigo-500"
      onClick={(e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.tabIndex = -1;
          target.focus();
          target.removeAttribute('tabindex');
        }
      }}
    >
      {label}
    </a>
  );
}