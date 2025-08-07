import React from 'react';
import Icon from './Icon';
import { Button } from './ui/Button';
import { theme } from '../styles/theme';
import { ApiError } from '../utils/api';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  const fontSize = size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'md';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
      color: theme.colors.gray[400]
    }}>
      <div style={{ marginBottom: theme.spacing.md }}>
        <Icon name="loader" size={iconSize} />
      </div>
      <p style={{ fontSize: theme.typography.fontSize[fontSize] }}>
        {message}
      </p>
    </div>
  );
};

interface ErrorDisplayProps {
  error: Error | ApiError;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry,
  title = 'Error'
}) => {
  const isApiError = error instanceof ApiError;
  
  return (
    <div style={{
      padding: theme.spacing.lg,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${theme.colors.danger[500]}`,
      borderRadius: theme.borderRadius.md,
      margin: theme.spacing.md
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing.md
      }}>
        <Icon 
          name="alert-triangle" 
          size={24} 
          color={theme.colors.danger[500]}
          style={{ marginRight: theme.spacing.sm }}
        />
        <h3 style={{
          color: theme.colors.danger[500],
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      
      <p style={{
        color: theme.colors.gray[300],
        marginBottom: onRetry ? theme.spacing.md : 0
      }}>
        {error.message}
      </p>

      {isApiError && (
        <p style={{
          color: theme.colors.gray[400],
          fontSize: theme.typography.fontSize.sm,
          marginBottom: onRetry ? theme.spacing.md : 0
        }}>
          Status: {error.status} {error.statusText}
        </p>
      )}

      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="secondary" 
          size="sm"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};