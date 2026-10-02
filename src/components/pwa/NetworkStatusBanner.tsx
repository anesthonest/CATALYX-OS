import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You're offline. Some features are temporarily unavailable.</span>
          <span className="hidden sm:inline opacity-80 font-normal">| Safe cached shell active</span>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-emerald-500/90 text-slate-950 px-4 py-2 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Back online — workspace synchronized.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
