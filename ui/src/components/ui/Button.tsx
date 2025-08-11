import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  style = {},
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  const variants = {
    primary: {
      background: '#475569',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    danger: {
      background: '#dc2626',
      color: 'white',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
    },
    ghost: {
      background: 'transparent',
      color: '#94a3b8',
      border: 'none'
    }
  };

  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  const finalStyle = {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
    opacity: (disabled || isLoading) ? 0.6 : 1,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer'
  };

  return (
    <button
      className={className}
      style={finalStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};