import React, { Component, type ReactNode } from 'react';
import Icon from './Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  retry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1 
    });
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-white" style={{ padding: 'var(--spacing-xl)' }}>
          <div className="mb-6">
            <Icon name="activity" size={64} color="var(--color-error)" />
          </div>
          <h2 className="heading-2 mb-4" style={{ color: 'var(--color-error)' }}>
            Something went wrong
          </h2>
          <p className="text-muted max-w-96 mb-6">
            We encountered an unexpected error. {this.state.retryCount < 3 ? 'Try again or refresh the page.' : 'Please refresh the page.'}
          </p>
          <div className="flex gap-4">
            {this.state.retryCount < 3 && (
              <button 
                onClick={this.retry}
                className="btn btn-secondary"
              >
                Try Again
              </button>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="text-muted cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="text-sm mt-2 p-4 overflow-auto max-w-[600px] rounded-lg" style={{
                color: 'var(--color-error)',
                background: 'rgba(239, 68, 68, 0.1)'
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;