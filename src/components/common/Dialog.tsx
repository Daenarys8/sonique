import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className = '' }: DialogProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  const { highContrast, reducedMotion } = useAccessibility();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = useKeyboardNavigation({
    onEscape: onClose,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${title}-title`}
      ref={focusTrapRef}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={dialogRef}
            tabIndex={-1}
            className={`
              relative 
              w-full 
              max-w-md 
              rounded-lg 
              shadow-xl 
              ${highContrast ? 'bg-black text-white border border-white' : 'bg-white text-gray-900'}
              ${className}
            `}
            style={{
              transition: reducedMotion ? 'none' : 'all 0.2s ease-out'
            }}
          >
            <div className="p-6">
              <h2 
                id={`${title}-title`}
                className={`text-lg font-medium leading-6 mb-4 
                  ${highContrast ? 'text-white' : 'text-gray-900'}`}
              >
                {title}
              </h2>
              <div role="document">{children}</div>
              <button
                className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
                aria-label="Close dialog"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}