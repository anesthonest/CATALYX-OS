import React, { useState } from 'react';
import { ActionPreviewRequest } from '../services/realityEngineService';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Lock, 
  Unlock,
  Layers,
  FileCheck
} from 'lucide-react';

interface ActionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionPreview: ActionPreviewRequest | null;
  onConfirmExecute: (action: ActionPreviewRequest) => Promise<void>;
  isExecuting?: boolean;
}

export const ActionPreviewModal: React.FC<ActionPreviewModalProps> = ({
  isOpen,
  onClose,
  actionPreview,
  onConfirmExecute,
  isExecuting = false
}) => {
  const [strongConfirmationTyped, setStrongConfirmationTyped] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen || !actionPreview) return null;

  const requiresStrongConfirmation = actionPreview.risk === 'high' || actionPreview.risk === 'critical';
  const isStrongConfirmed = !requiresStrongConfirmation || strongConfirmationTyped.trim().toUpperCase() === 'CONFIRM';

  const getRiskBadge = (risk: ActionPreviewRequest['risk']) => {
    switch (risk) {
      case 'critical':
        return {
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
          label: 'CRITICAL RISK'
        };
      case 'high':
        return {
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: ShieldAlert,
          label: 'HIGH RISK'
        };
      case 'medium':
        return {
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: ShieldCheck,
          label: 'MODERATE RISK'
        };
      default:
        return {
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
          label: 'LOW RISK'
        };
    }
  };

  const riskInfo = getRiskBadge(actionPreview.risk);
  const RiskIcon = riskInfo.icon;

  const handleExecute = async () => {
    if (!actionPreview.isAuthorized) {
      setErrorNotice(`Unauthorized: Missing required permission ${actionPreview.requiredPermission}`);
      return;
    }

    if (requiresStrongConfirmation && !isStrongConfirmed) {
      setErrorNotice("Please type 'CONFIRM' to authorize this high-impact action.");
      return;
    }

    setErrorNotice(null);
    try {
      await onConfirmExecute(actionPreview);
    } catch (e: any) {
      setErrorNotice(e.message || 'Execution failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan block">
                V22 REALITY ACTION PREVIEW
              </span>
              <h3 className="text-base font-semibold text-white">
                Confirm Execution
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExecuting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Summary Matrix */}
        <div className="mt-4 space-y-3">
          {/* Action & Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase">ACTION</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${riskInfo.badgeClass}`}>
                <RiskIcon className="w-3 h-3" />
                {riskInfo.label}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {actionPreview.actionName}
            </div>
          </div>

          {/* Target & Scope */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">TARGET</span>
              <span className="font-semibold text-gray-200 truncate block mt-0.5">{actionPreview.targetName}</span>
              <span className="text-[10px] font-mono text-gray-500">Type: {actionPreview.targetType}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">AFFECTED SCOPE</span>
              <span className="font-semibold text-gray-200 truncate block mt-0.5">{actionPreview.affectedScope}</span>
              <span className="text-[10px] font-mono text-gray-500">Durable State</span>
            </div>
          </div>

          {/* Planned Changes */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-brand-purple" />
              PLANNED MUTATIONS (CHANGES)
            </span>
            <ul className="space-y-1.5 pl-4 list-disc text-xs text-gray-300">
              {actionPreview.plannedChanges.map((chg, idx) => (
                <li key={idx}>{chg}</li>
              ))}
            </ul>
          </div>

          {/* Permission Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-white/5 text-xs">
            <span className="font-mono text-gray-400">PERMISSION CHECK:</span>
            {actionPreview.isAuthorized ? (
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" />
                Authorized ({actionPreview.requiredPermission})
              </span>
            ) : (
              <span className="font-mono text-rose-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Denied ({actionPreview.requiredPermission})
              </span>
            )}
          </div>

          {/* Strong Confirmation if High/Critical Risk */}
          {requiresStrongConfirmation && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ELEVATED IMPACT: TYPE 'CONFIRM' TO PROCEED</span>
              </div>
              <input
                type="text"
                placeholder="Type CONFIRM here"
                value={strongConfirmationTyped}
                onChange={(e) => setStrongConfirmationTyped(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/40 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting || !actionPreview.isAuthorized || !isStrongConfirmed}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              !actionPreview.isAuthorized || !isStrongConfirmed
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-purple via-pink-600 to-brand-cyan text-white shadow-lg shadow-purple-950/50 hover:opacity-90'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>EXECUTING IN REALITY...</span>
              </>
            ) : (
              <>
                <span>CONFIRM & EXECUTE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
