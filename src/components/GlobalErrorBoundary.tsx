import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, RotateCcw, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  correlationId: string;
  copied: boolean;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    correlationId: '',
    copied: false
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const correlationId = 'err_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    return {
      hasError: true,
      error,
      correlationId
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`[CATALYX V26 CONTAINED ERROR] ${this.state.correlationId}:`, error, errorInfo);
  }

  handleSoftRecovery = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleResetCacheAndRecover = () => {
    try {
      // Clear potentially corrupt transient caches while preserving vital config
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('catalyx_v') || key.startsWith('catalyx_sim_'))) {
          if (!key.includes('firebase_config')) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  handleCopyDiagnostic = () => {
    const dossier = {
      release: 'CATALYX V26 Production Hardened',
      timestamp: new Date().toISOString(),
      correlationId: this.state.correlationId,
      errorMessage: this.state.error?.message || 'Unknown render defect',
      componentStack: this.state.errorInfo?.componentStack?.slice(0, 500) || 'None'
    };
    navigator.clipboard.writeText(JSON.stringify(dossier, null, 2)).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);
    });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                  System Isolation Active
                </span>
                <h2 className="text-xl font-display font-bold text-white mt-1">
                  CATALYX Contained a Render Exception
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
              The fault containment subsystem isolated an unexpected failure to prevent data corruption.
              Your local database records remain intact.
            </p>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/5 font-mono text-xs text-gray-400 space-y-1 mb-6">
              <div className="flex justify-between items-center text-[10px] text-gray-500 border-b border-white/5 pb-1">
                <span>Correlation ID: {this.state.correlationId}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> State Protected
                </span>
              </div>
              <p className="text-red-300 break-words mt-2">
                {this.state.error?.message || 'Render failure'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={this.handleSoftRecovery}
                className="w-full py-2.5 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Attempt Soft Recovery</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleCopyDiagnostic}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/5"
              >
                {this.state.copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dossier Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copy Diagnostic Dossier</span>
                  </>
                )}
              </button>

              <button
                onClick={this.handleResetCacheAndRecover}
                className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-500/20"
                title="Clears corrupted transient cache and reboots"
              >
                <span>Reset Cache & Recover</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
