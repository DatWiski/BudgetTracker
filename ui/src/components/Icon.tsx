import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'currentColor', style = {} }) => {
  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...style
  };

  const icons: Record<string, React.ReactElement> = {
    dashboard: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    subscriptions: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M7 15h0M2 10h20"/>
      </svg>
    ),
    bills: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
    income: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    money: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    trending: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
      </svg>
    ),
    entertainment: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10,8 16,12 10,16 10,8"/>
      </svg>
    ),
    productivity: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
      </svg>
    ),
    utilities: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    education: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    fitness: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M6.5 6.5C7.5 5.5 9 5.5 10 6.5s1 2.5 0 3.5L8.5 8.5 6.5 6.5z"/>
        <path d="M13.5 13.5c1-1 2.5-1 3.5 0s1 2.5 0 3.5-2.5 1-3.5 0"/>
        <path d="M8.5 8.5l7 7"/>
        <path d="M2.5 21.5L5.5 18.5"/>
        <path d="M18.5 5.5L21.5 2.5"/>
      </svg>
    ),
    food: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    transport: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M3 18h18"/>
        <path d="M8 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <circle cx="8" cy="18" r="2"/>
        <circle cx="16" cy="18" r="2"/>
      </svg>
    ),
    health: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
      </svg>
    ),
    shopping: (
      <svg viewBox="0 0 24 24" style={iconStyle}>
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    )
  };

  return icons[name] || <div style={{ width: size, height: size, backgroundColor: color, borderRadius: '50%' }}></div>;
};

export default Icon;