import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  badge?: string;
  accentColor?: 'gold' | 'purple' | 'blue' | 'emerald' | 'cyan' | 'amber';
  onClick: () => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  actionLabel = 'Get Started',
  badge,
  accentColor = 'gold',
  onClick,
  className = ''
}) => {
  const getColors = () => {
    switch (accentColor) {
      case 'gold':
        return {
          icon: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          hoverBorder: 'hover:border-amber-500/40',
          btn: 'text-amber-400 hover:text-amber-300',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        };
      case 'purple':
        return {
          icon: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          hoverBorder: 'hover:border-purple-500/40',
          btn: 'text-purple-400 hover:text-purple-300',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
        };
      case 'blue':
        return {
          icon: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          hoverBorder: 'hover:border-blue-500/40',
          btn: 'text-blue-400 hover:text-blue-300',
          badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
        };
      case 'emerald':
        return {
          icon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          hoverBorder: 'hover:border-emerald-500/40',
          btn: 'text-emerald-400 hover:text-emerald-300',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        };
      case 'cyan':
        return {
          icon: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          hoverBorder: 'hover:border-cyan-500/40',
          btn: 'text-cyan-400 hover:text-cyan-300',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
        };
      default:
        return {
          icon: 'bg-white/10 text-white border-white/20',
          hoverBorder: 'hover:border-white/30',
          btn: 'text-white hover:text-gray-200',
          badge: 'bg-white/10 text-gray-300 border-white/20'
        };
    }
  };

  const colors = getColors();

  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl catalyx-surface-card ${colors.hoverBorder} transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer border ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`p-2.5 rounded-xl border ${colors.icon} group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${colors.badge}`}>
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
          {title}
        </h3>

        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className={`mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold ${colors.btn}`}>
        <span>{actionLabel}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
