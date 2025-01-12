import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AccessibilityContextType } from '../types/accessibility';
import { AccessibilityContext } from '../contexts/AccessibilityContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Simple singleton ErrorReporter class
class ErrorReporter {
  private static instance: ErrorReporter;
  
  private constructor() {}

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  public reportError(error: Error, componentName: string): void {
    // You can implement your error reporting logic here
    // For example, sending to a logging service or analytics
    console.error(`Error in ${componentName}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Utility function to sanitize error messages
const sanitizeErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  
  // Remove any sensitive information or sanitize the error message
  // This is a basic implementation - enhance based on your needs
  const sanitized = error.message
    // Remove potential stack traces
    .split('\n')[0]
    // Remove potential file paths
    .replace(/\/[\w/.:-]+/g, '')
    // Remove potential memory addresses
    .replace(/0x[a-fA-F0-9]+/g, '')
    // Limit length
    .slice(0, 150);

  return sanitized || 'An unexpected error occurred';
};


class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  // Static method to access context type
  static contextType = AccessibilityContext;
  // Declare context type
  declare context: React.ContextType<typeof AccessibilityContext>;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorReporter = ErrorReporter.getInstance();
    errorReporter.reportError(error, this.constructor.name);
  }

  public render() {
    if (this.state.hasError) {
      // Get accessibility features from context if available
      const highContrast = this.context?.highContrast ?? false;
      const reducedMotion = this.context?.reducedMotion ?? false;

      return (
        <div 
          className={`
            min-h-screen 
            flex 
            items-center 
            justify-center 
            ${highContrast ? 'bg-black text-white' : 'bg-gray-50'}
          `}
          style={{
            transition: reducedMotion ? 'none' : 'all 0.3s ease',
          }}
        >
          <div 
            className={`
              max-w-md 
              w-full 
              p-6 
              rounded-lg 
              shadow-lg
              ${highContrast ? 'bg-black border border-white' : 'bg-white'}
            `}
            style={{
              maxWidth: 'clamp(20rem, 70%, 30rem)',
              padding: 'clamp(1rem, 2vw, 2rem)',
            }}
          >
            <h2 
              className={`
                text-2xl 
                font-bold 
                mb-4
                ${highContrast ? 'text-white' : 'text-red-600'}
              `}
              style={{
                fontSize: 'clamp(1.25rem, 2vw, 2rem)',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              }}
              role="alert"
            >
              Something went wrong
            </h2>
            <p 
              className={`
                mb-4
                ${highContrast ? 'text-white' : 'text-gray-600'}
              `}
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)',
              }}
            >
              {sanitizeErrorMessage(this.state.error) || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`
                w-full 
                px-4 
                py-2 
                rounded-lg 
                ${highContrast 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }
              `}
              style={{
                transition: reducedMotion ? 'none' : 'all 0.2s ease',
                minHeight: '44px', // WCAG touch target size
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
