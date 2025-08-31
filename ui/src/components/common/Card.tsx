import React, { type ReactNode } from "react";

export interface CardProps {
  title: string;
  subtitle?: string;
  status?: {
    text: string;
    color: string;
  };
  icon: ReactNode;
  amount: string;
  amountLabel?: string;
  actions?: ReactNode[];
  theme?: "expense" | "income" | "neutral";
  onClick?: () => void;
  inactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  status,
  icon,
  amount,
  amountLabel,
  actions = [],
  theme = "neutral",
  onClick,
  inactive = false,
}) => {
  const themeColors = {
    expense: {
      iconBg: "bg-glass",
      iconColor: "text-muted opacity-70",
    },
    income: {
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400 opacity-80",
    },
    neutral: {
      iconBg: "bg-glass",
      iconColor: "text-muted opacity-70",
    },
  };

  const currentTheme = themeColors[theme];

  return (
    <div
      className="glass-card-strong mb-4"
      style={{ padding: "var(--spacing-lg)" }}
      onClick={onClick}
    >
      <div className="grid grid-cols-[1fr_auto_1.5fr] gap-8 items-center">
        {/* Left side - Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-3xl font-bold text-white leading-tight">{title}</h3>
            {inactive && <span className="status-badge">INACTIVE</span>}
          </div>
          <div className="text-base">
            {subtitle && (
              <>
                <span className="text-muted text-sm">{subtitle}</span>
                {status && <span> • </span>}
              </>
            )}
            {status && (
              <span className="font-medium" style={{ color: status.color }}>
                {status.text}
              </span>
            )}
          </div>
        </div>

        {/* Center - Icon */}
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center justify-center w-20 h-20 ${currentTheme.iconBg} rounded-lg`}
          >
            <div className={`${currentTheme.iconColor}`} style={{ fontSize: "36px" }}>
              {icon}
            </div>
          </div>
        </div>

        {/* Right side - Amount and actions */}
        <div className="flex items-center justify-end">
          <div className="text-right" style={{ paddingRight: "40px" }}>
            <div className="text-white text-3xl font-black leading-none">{amount}</div>
            {amountLabel && (
              <div className="text-xs uppercase font-medium text-muted leading-tight">
                {amountLabel}
              </div>
            )}
          </div>

          {actions.length > 0 && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default Card;
