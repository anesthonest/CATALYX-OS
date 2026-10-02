import React from 'react';

interface CatalyxLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
  variant?: 'image' | 'hybrid' | 'emblem';
}

export const CatalyxLogo: React.FC<CatalyxLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showSubtitle = false,
  className = '',
  variant = 'hybrid'
}) => {
  const sizeMap = {
    xs: { emblem: 'w-5 h-5', text: 'text-xs', sub: 'text-[7px]' },
    sm: { emblem: 'w-7 h-7', text: 'text-sm', sub: 'text-[8px]' },
    md: { emblem: 'w-9 h-9', text: 'text-base', sub: 'text-[9px]' },
    lg: { emblem: 'w-12 h-12', text: 'text-xl', sub: 'text-[10px]' },
    xl: { emblem: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
    hero: { emblem: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl sm:text-4xl', sub: 'text-xs tracking-[0.25em]' }
  };

  const dim = sizeMap[size] || sizeMap.md;

  if (variant === 'image') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/catalyx_logo.jpg"
          alt="CATALYX - Vinexsah Technologies"
          className={`${dim.emblem} rounded-xl object-contain drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)]`}
        />
        {showSubtitle && (
          <span className="text-[9px] font-mono tracking-[0.25em] text-amber-400/90 uppercase mt-1">
            VINEXSAH TECHNOLOGIES
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Gold Crescent & Silver/Gold X Emblem */}
      <div className={`relative ${dim.emblem} shrink-0 rounded-xl overflow-hidden shadow-lg shadow-amber-500/10 border border-amber-500/20 bg-black/60 flex items-center justify-center`}>
        <img
          src="/catalyx_logo.jpg"
          alt="CATALYX"
          className="w-full h-full object-cover transform scale-110"
          onError={(e) => {
            // Graceful fallback to SVG if image fails to load
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        {/* SVG Fallback Emblem if image not loaded */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <span className="font-display font-black text-amber-400">C</span>
        </div>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className={`font-display font-black tracking-widest ${dim.text} text-white flex items-center`}>
            <span className="text-gray-100">CATA</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">LYX</span>
          </div>
          {showSubtitle && (
            <div className={`font-mono uppercase tracking-[0.25em] text-amber-400/80 font-semibold mt-1 ${dim.sub}`}>
              VINEXSAH TECHNOLOGIES
            </div>
          )}
        </div>
      )}
    </div>
  );
};
