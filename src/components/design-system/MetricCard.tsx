import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  accentColor?: 'gold' | 'purple' | 'blue' | 'emerald' | 'cyan' | 'amber';
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  change,
  isPositive = true,
  icon,
  accentColor = 'gold',
  onClick,
  className = ''
}) => {
  const getIconColorClasses = () => {
    switch (accentColor) {
      case 'gold':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'purple':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
      case 'blue':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25';
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      default:
        return 'bg-white/10 text-gray-300 border-white/15';
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`p-4 rounded-xl catalyx-surface-card hover:border-white/20 transition-all text-left flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-400 tracking-wide uppercase font-mono">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-lg border text-xs ${getIconColorClasses()}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="my-1.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
          {subtext}
        </p>
      )}
    </Component>
  );
};
