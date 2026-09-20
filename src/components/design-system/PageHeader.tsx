import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'gold' | 'purple' | 'blue' | 'emerald' | 'cyan' | 'amber';
  icon?: React.ReactNode;
  onBack?: () => void;
  actions?: React.ReactNode;
  roleLens?: React.ReactNode;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'gold',
  icon,
  onBack,
  actions,
  roleLens,
  breadcrumbs
}) => {
  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'gold':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'blue':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-white/10 text-gray-300 border-white/15';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-300">{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="text-gray-600">/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {icon && (
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-amber-400">
              {icon}
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getBadgeClasses()}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {(actions || roleLens) && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {roleLens}
          {actions}
        </div>
      )}
    </div>
  );
};
