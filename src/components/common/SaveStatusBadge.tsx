import React, { useState, useEffect } from 'react';
import { Check, RefreshCw, CloudOff, AlertCircle } from 'lucide-react';
import { persistenceSyncService, SaveStatusInfo } from '../../services/persistenceSyncService';

export const SaveStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState<SaveStatusInfo>(persistenceSyncService.getStatus());

  useEffect(() => {
    return persistenceSyncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  // Configure appearance based on authoritative status
  const getBadgeConfig = () => {
    switch (status.state) {
      case 'saving':
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />,
          label: status.message || 'Saving changes...',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-3 h-3 text-gray-400" />,
          label: 'Offline — saved locally',
          classes: 'bg-slate-800 text-gray-300 border-white/10'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3 text-rose-400" />,
          label: 'Sync error — retrying',
          classes: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        };
      case 'saved':
      case 'synced':
        return {
          icon: <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />,
          label: 'Saved',
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'idle':
      default:
        return {
          icon: <Check className="w-3 h-3 text-emerald-400/80 stroke-[2.5]" />,
          label: 'Saved',
          classes: 'bg-slate-900/60 text-gray-400 border-white/5'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border backdrop-blur-sm transition-all select-none ${config.classes} ${className}`}
      title={status.message}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
