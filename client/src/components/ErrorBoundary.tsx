import React, { Component, ErrorInfo, ReactNode } from 'react';
import { error as logError } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch JavaScript errors anywhere in the child
 * component tree, log those errors, and display a fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    logError('Error caught by ErrorBoundary:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-700">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            We're sorry, but an error occurred while rendering this component.
          </p>
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-xs font-mono">
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            className="mt-4 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 rounded text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;