import type { CSSProperties } from 'react';
import { Card } from './Card';
import Icon from '../Icon';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  description: string;
  iconName: string;
  iconColor?: string;
  valueColor?: string;
  gradientColors: [string, string];
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  description,
  iconName,
  iconColor = 'white',
  valueColor = 'white',
  gradientColors,
  isLoading = false
}: StatCardProps) => {
  const iconStyle: CSSProperties = {
    width: '60px',
    height: '60px',
    background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  };

  return (
    <Card hover>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={iconStyle}>
          <Icon name={iconName} size={32} color={iconColor} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            {subtitle}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: valueColor }}>
            {isLoading ? '...' : value}
          </div>
        </div>
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: 0 }}>
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {description}
        </span>
      </div>
    </Card>
  );
};