import React from 'react';
import { Plus } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  whyItMatters?: string;
  icon?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  whyItMatters,
  icon,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionIcon = <Plus className="w-4 h-4" />,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div
      className={`p-8 sm:p-12 rounded-2xl catalyx-surface-card border border-dashed border-white/15 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      {icon && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-amber-400 mb-4">
          {icon}
        </div>
      )}

      {/* 1. What is missing? */}
      <h3 className="text-base sm:text-lg font-display font-bold text-white mb-2">
        {title}
      </h3>

      {/* 2. What it is & why it matters */}
      <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed mb-3">
        {description}
      </p>

      {whyItMatters && (
        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-gray-400 mb-6 max-w-sm">
          <strong className="text-gray-300">Why it matters:</strong> {whyItMatters}
        </div>
      )}

      {/* 3. What should I do? */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {primaryActionLabel && onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="px-4 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            {primaryActionIcon}
            <span>{primaryActionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
