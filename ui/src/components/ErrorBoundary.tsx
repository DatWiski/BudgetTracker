import React, { Component, type ReactNode } from 'react';
import Icon from './Icon';
import { Button } from './ui/Button';
import { theme } from '../styles/theme';

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
        <div style={{
          padding: theme.spacing.xl,
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.white,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: theme.spacing.lg }}>
            <Icon name="activity" size={64} color={theme.colors.danger[500]} />
          </div>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.danger[500],
            marginBottom: theme.spacing.md
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: theme.colors.gray[400],
            marginBottom: theme.spacing.lg,
            maxWidth: '400px'
          }}>
            We encountered an unexpected error. {this.state.retryCount < 3 ? 'Try again or refresh the page.' : 'Please refresh the page.'}
          </p>
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            {this.state.retryCount < 3 && (
              <Button onClick={this.retry} variant="secondary">
                Try Again
              </Button>
            )}
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: theme.spacing.xl, textAlign: 'left' }}>
              <summary style={{ color: theme.colors.gray[400], cursor: 'pointer' }}>
                Error Details (Development)
              </summary>
              <pre style={{
                color: theme.colors.danger[500],
                fontSize: theme.typography.fontSize.sm,
                padding: theme.spacing.md,
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: theme.borderRadius.md,
                marginTop: theme.spacing.sm,
                overflow: 'auto',
                maxWidth: '600px'
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