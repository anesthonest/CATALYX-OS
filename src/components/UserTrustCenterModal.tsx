import React, { useState } from 'react';
import { realityEngineService, CapabilityInventoryItem } from '../services/realityEngineService';
import { 
  Shield, 
  X, 
  Database, 
  Cpu, 
  PlugZap, 
  Lock, 
  FileText, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface UserTrustCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userRole?: string;
  onNavigate?: (tab: string) => void;
}

type TrustTab = 'KNOWS' | 'DATA_USAGE' | 'AI_STATUS' | 'INTEGRATIONS' | 'GOVERNANCE' | 'AUDIT_LOG';

export const UserTrustCenterModal: React.FC<UserTrustCenterModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'anesthonest81@gmail.com',
  userRole = 'Strategic Commander',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TrustTab>('KNOWS');
  const inventory = realityEngineService.getCapabilityInventory();
  const auditLogs = realityEngineService.getAuditLogs();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[88vh]">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-brand-cyan p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  TRANSPARENCY & HONESTY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                  REALITY FIRST
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">
                CATALYX User Trust Center
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-white/5 shrink-0 scrollbar-none">
          {[
            { id: 'KNOWS', label: 'What CATALYX Knows', icon: Info },
            { id: 'DATA_USAGE', label: 'Data & Storage', icon: Database },
            { id: 'AI_STATUS', label: 'AI Transparency', icon: Cpu },
            { id: 'INTEGRATIONS', label: 'Integrations Truth', icon: PlugZap },
            { id: 'GOVERNANCE', label: 'Safety & Bounds', icon: Lock },
            { id: 'AUDIT_LOG', label: 'Audit Trail', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TrustTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-white border border-emerald-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm text-gray-200">
          {/* TAB 1: WHAT CATALYX KNOWS */}
          {activeTab === 'KNOWS' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                <h4 className="text-xs font-mono text-emerald-400 uppercase mb-2">Profile & Identity Baseline</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  CATALYX stores your authenticated session identity, role assignment, and calculated momentum metrics. We never sell your personal information or train third-party public models on your private tasks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Active Account</span>
                  <span className="font-semibold text-white truncate block mt-0.5">{userEmail}</span>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-1">Tenant: Isolated Workspace</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Permission Clearance</span>
                  <span className="font-semibold text-white truncate block mt-0.5">{userRole}</span>
                  <span className="text-[10px] font-mono text-brand-cyan block mt-1">L2 Execution Clearance</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2 text-xs">
                <h5 className="font-mono text-gray-400 uppercase">Information Boundaries</h5>
                <ul className="space-y-1 pl-4 list-disc text-gray-300 text-xs">
                  <li>Your tasks and goals are kept strictly in your designated workspace.</li>
                  <li>No simulated tasks or fake activity will be injected into your dashboard.</li>
                  <li>AI coaches only receive context relevant to the specific session or objective you choose to discuss.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: DATA & STORAGE */}
          {activeTab === 'DATA_USAGE' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h4 className="text-xs font-mono text-brand-cyan uppercase">Storage Architecture</h4>
                <p className="text-xs text-gray-300">
                  CATALYX employs a resilient dual-tier storage strategy: Durable browser-isolated LocalStorage with full offline execution capability, plus seamless cloud synchronization when Firebase is configured.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Primary Engine</span>
                  <span className="font-semibold text-white block mt-0.5">Durable Local Storage</span>
                  <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Active (Immediate)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Cloud Persistence</span>
                  <span className="font-semibold text-white block mt-0.5">Firebase Firestore</span>
                  <span className="text-[10px] font-mono text-amber-400 mt-1 block">Optional in Settings</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Data Portability</span>
                  <span className="font-semibold text-white block mt-0.5">JSON / CSV Export</span>
                  <span className="text-[10px] font-mono text-brand-cyan mt-1 block">100% Exportable</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI TRANSPARENCY */}
          {activeTab === 'AI_STATUS' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-brand-purple/20 space-y-2">
                <h4 className="text-xs font-mono text-brand-purple uppercase">Google GenAI / Gemini Provider Status</h4>
                <p className="text-xs text-gray-300">
                  When a server-side GEMINI_API_KEY is configured in .env, CATALYX streams responses directly from the official Google GenAI SDK. When no key is provided, CATALYX runs on a deterministic local tactical heuristic engine.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-mono text-gray-400">PRIMARY AI ENGINE:</span>
                  <span className="font-mono text-brand-cyan font-bold">Google GenAI (Gemini)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-mono text-gray-400">FALLBACK MODE:</span>
                  <span className="font-mono text-emerald-400">High-Speed Offline Heuristic Engine</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-mono text-gray-400">SAFETY SCREENING:</span>
                  <span className="font-mono text-emerald-400">Active (L2 Safety Gateways)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-400">DISCLOSURE STANDARD:</span>
                  <span className="font-mono text-white">Full Epistemic Truth Cards (Rule 7)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTEGRATIONS TRUTH */}
          {activeTab === 'INTEGRATIONS' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 text-xs text-gray-300">
                Truthful connection state of external services. We never claim a connection is "Live" if credentials or setup are missing.
              </div>

              <div className="space-y-2">
                {inventory.map((item) => {
                  const badge = realityEngineService.getBadgeInfo(item.classification);
                  return (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">{item.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">{item.description}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border whitespace-nowrap ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: GOVERNANCE & BOUNDS */}
          {activeTab === 'GOVERNANCE' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <h4 className="text-xs font-mono text-emerald-400 uppercase">Autonomy Levels & Bounded Execution</h4>
                <p className="text-xs text-gray-300">
                  CATALYX enforces strict autonomy ceilings. Autonomous agents cannot silently modify tasks, delete databases, or charge payment providers without human review.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400">L0 (Observe Only):</span>
                  <span className="text-white">Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400">L1 (Advise & Recommend):</span>
                  <span className="text-emerald-400 font-bold">Permitted</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400">L2 (Human-in-the-Loop Action Preview):</span>
                  <span className="text-emerald-400 font-bold">Enforced for All Mutations</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                  <span className="text-gray-400">L3/L4 (Unsupervised Multi-Step Mutation):</span>
                  <span className="text-rose-400 font-bold">Hard-Blocked (Safety Safeguard)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'AUDIT_LOG' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono text-gray-400 uppercase">IMMUTABLE EVENT LOG</span>
                <span className="text-[10px] font-mono text-gray-500">{auditLogs.length} verified records</span>
              </div>

              {auditLogs.length > 0 ? (
                auditLogs.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold">{entry.action}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        entry.result === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {entry.result}
                      </span>
                    </div>
                    <div className="text-gray-300 text-[11px]">{entry.evidence}</div>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 pt-1">
                      <span>Target: {entry.targetName}</span>
                      <span>CorrID: {entry.correlationId}</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs font-mono text-gray-500">
                  Audit log initialized. Consequential actions will record here automatically.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0 text-xs font-mono text-gray-500">
          <span>CATALYX V22 INTEGRITY SEAL</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
          >
            Close Trust Center
          </button>
        </div>
      </div>
    </div>
  );
};
