import type { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export const LoadingSpinner = ({ 
  size = 40, 
  color = '#8b5cf6', 
  message = 'Loading...' 
}: LoadingSpinnerProps) => {
  const spinnerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    border: `3px solid rgba(255, 255, 255, 0.1)`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && (
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};