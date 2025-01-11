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
            transition: reducedMotion ? 'none' : 'all 0.3s ease'
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
          >
            <h2 
              className={`
                text-2xl 
                font-bold 
                mb-4
                ${highContrast ? 'text-white' : 'text-red-600'}
              `}
              role="alert"
            >
              Something went wrong
            </h2>
            <p 
              className={`
                mb-4
                ${highContrast ? 'text-white' : 'text-gray-600'}
              `}
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
                minHeight: '44px' // WCAG touch target size
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