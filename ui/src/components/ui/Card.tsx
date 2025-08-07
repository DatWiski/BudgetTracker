import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', style = {}, hover = false, onClick }: CardProps) => {
  const baseStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    ...style
  };

  const hoverStyle: CSSProperties = hover ? {
    cursor: 'pointer'
  } : {};

  return (
    <div 
      className={className}
      style={{ ...baseStyle, ...hoverStyle }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};