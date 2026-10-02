import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const PWAUpdateModal: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-50 p-4 rounded-2xl glass-panel-heavy border border-brand-cyan/40 shadow-2xl backdrop-blur-xl bg-[#030712]/95 max-w-sm"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-display font-bold text-white tracking-wide">
              New Version Available
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              A new production release of CATALYX is ready with performance updates.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={applyUpdate}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Update Now</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
