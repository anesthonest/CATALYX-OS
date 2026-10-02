import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { CatalyxLogo } from '../common/CatalyxLogo';

export const PWAInstallBanner: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
    dismissInstall,
    isInstallDismissed
  } = usePWA();

  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or dismissed by user, do not show banner
  if (isInstalled || isInstallDismissed) {
    return null;
  }

  // Only show if browser supports prompt or is iOS Safari (which doesn't support beforeinstallprompt)
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      promptInstall();
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-40 p-3.5 rounded-2xl glass-panel-heavy border border-amber-500/30 shadow-2xl backdrop-blur-xl bg-[#030712]/95"
        >
          <div className="flex items-start gap-3">
            <CatalyxLogo size="sm" showWordmark={false} variant="image" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-white tracking-wide">
                  Install CATALYX App
                </span>
                <button
                  onClick={dismissInstall}
                  className="text-gray-400 hover:text-white p-1 -mr-1 -mt-1 cursor-pointer"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Install CATALYX for faster standalone access from your home screen or desktop.
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'Instructions' : 'Install'}</span>
                </button>
                <button
                  type="button"
                  onClick={dismissInstall}
                  className="text-[10px] text-gray-400 hover:text-gray-200 font-mono px-2 py-1 cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari Guided Install Dialog */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-panel-heavy p-6 rounded-2xl border border-white/10 text-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-display font-bold text-white">Add CATALYX to Home Screen</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Install CATALYX on your iPhone or iPad for a full-screen, native application experience:
              </p>

              <div className="space-y-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-white/5 font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-brand-cyan" /> <strong>Share</strong> button in Safari toolbar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> <strong>Add to Home Screen</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Confirm by tapping <strong>Add</strong> in the top right</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  dismissInstall();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
