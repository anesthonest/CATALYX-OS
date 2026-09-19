import React, { useState } from 'react';
import { RealityStatus, realityEngineService, AuditLogEntry } from '../services/realityEngineService';
import { 
  X, 
  Layers, 
  Activity, 
  Sparkles, 
  History, 
  FileText, 
  Code, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export interface InspectedObject {
  id: string;
  type: 'TASK' | 'PROJECT' | 'GOAL' | 'MISSION' | 'AGENT' | 'WORKFLOW' | 'PREDICTION' | 'SIMULATION' | 'TRANSACTION' | 'INTEGRATION' | 'DOCUMENT';
  title: string;
  description: string;
  realityStatus: RealityStatus;
  createdAt: string;
  updatedAt?: string;
  ownerOrActor?: string;
  metrics?: Record<string, any>;
  relatedObjects?: Array<{ id: string; type: string; title: string; linkTab?: string }>;
  activityLog?: Array<{ timestamp: string; text: string; actor: string }>;
  intelligenceSummary?: {
    finding: string;
    confidence: number;
    evidence: string;
    recommendation: string;
  };
  rawPayload?: Record<string, any>;
}

interface UniversalObjectInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  object: InspectedObject | null;
  onNavigate?: (tab: string) => void;
  isAdvancedMode?: boolean;
}

type TabType = 'OVERVIEW' | 'STATUS' | 'ACTIVITY' | 'RELATED' | 'INTELLIGENCE' | 'ACTIONS' | 'HISTORY' | 'AUDIT' | 'TECHNICAL';

export const UniversalObjectInspectorModal: React.FC<UniversalObjectInspectorModalProps> = ({
  isOpen,
  onClose,
  object,
  onNavigate,
  isAdvancedMode = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  if (!isOpen || !object) return null;

  const badge = realityEngineService.getBadgeInfo(object.realityStatus);
  const auditLogs = realityEngineService.getAuditLogs().filter(a => a.targetId === object.id || a.targetName.includes(object.title));

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'OVERVIEW', label: 'Overview', icon: Layers },
    { id: 'STATUS', label: 'Status & Truth', icon: CheckCircle2 },
    { id: 'ACTIVITY', label: 'Activity', icon: Activity },
    { id: 'RELATED', label: 'Related Objects', icon: ExternalLink },
    { id: 'INTELLIGENCE', label: 'Intelligence', icon: Sparkles },
    { id: 'ACTIONS', label: 'Actions', icon: ArrowRight },
    { id: 'HISTORY', label: 'History', icon: History },
    { id: 'AUDIT', label: 'Audit Trail', icon: Shield },
    { id: 'TECHNICAL', label: 'Technical Details', icon: Code },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xs font-mono font-bold text-white">
                {object.type.slice(0, 3)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-pink font-semibold">
                  {object.type} INSPECTOR
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border ${badge.badgeClass}`}>
                  {badge.label}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white truncate max-w-md">
                {object.title}
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

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-white/5 shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-purple/20 text-white border border-brand-purple/50 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-cyan' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm text-gray-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Description</span>
                <p className="mt-1 text-gray-300 leading-relaxed text-xs">
                  {object.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Entity ID</span>
                  <span className="font-mono text-xs text-white truncate block mt-0.5">{object.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Actor / Owner</span>
                  <span className="font-mono text-xs text-white truncate block mt-0.5">{object.ownerOrActor || 'System'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Created</span>
                  <span className="font-mono text-xs text-white truncate block mt-0.5">
                    {new Date(object.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Reality Class</span>
                  <span className="font-mono text-xs text-emerald-400 truncate block mt-0.5">{object.realityStatus}</span>
                </div>
              </div>

              {object.metrics && Object.keys(object.metrics).length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block mb-2">Live Metrics</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(object.metrics).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">
                        <span className="text-gray-500 text-[10px] block truncate">{k}</span>
                        <span className="text-white font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATUS & TRUTH */}
          {activeTab === 'STATUS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase">REALITY VERIFICATION</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-brand-cyan uppercase block">Epistemic Truth Criteria</span>
                <ul className="space-y-1.5 text-xs text-gray-400 pl-4 list-disc">
                  <li>Directly connected to persistent storage layer (no ephemeral mock states).</li>
                  <li>State changes generate verifiable audit records with correlation IDs.</li>
                  <li>Actions are bounded by verified role-based access control.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY */}
          {activeTab === 'ACTIVITY' && (
            <div className="space-y-2.5">
              {object.activityLog && object.activityLog.length > 0 ? (
                object.activityLog.map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="text-gray-200">{act.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-500">
                        <span>{act.actor}</span>
                        <span>•</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-mono text-gray-500">
                  No discrete activity events recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELATED OBJECTS */}
          {activeTab === 'RELATED' && (
            <div className="space-y-2">
              {object.relatedObjects && object.relatedObjects.length > 0 ? (
                object.relatedObjects.map((rel, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between hover:border-brand-purple/30 transition-all cursor-pointer"
                    onClick={() => rel.linkTab && onNavigate?.(rel.linkTab)}
                  >
                    <div>
                      <span className="text-[9px] font-mono text-brand-pink uppercase">{rel.type}</span>
                      <h5 className="text-xs font-semibold text-white">{rel.title}</h5>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-mono text-gray-500">
                  No linked objects discovered.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INTELLIGENCE */}
          {activeTab === 'INTELLIGENCE' && (
            <div className="space-y-3">
              {object.intelligenceSummary ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-brand-purple/20 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-brand-purple uppercase block">Cognitive Finding</span>
                    <p className="text-xs text-white font-medium mt-0.5">{object.intelligenceSummary.finding}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-brand-cyan uppercase block">Evidence</span>
                    <p className="text-xs text-gray-300 mt-0.5">{object.intelligenceSummary.evidence}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block">Recommendation</span>
                    <p className="text-xs text-gray-200 mt-0.5">{object.intelligenceSummary.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-gray-500">
                  No automated intelligence insights generated for this object.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ACTIONS */}
          {activeTab === 'ACTIONS' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                <h5 className="text-xs font-mono text-gray-400 uppercase mb-2">Available Real Operations</h5>
                <p className="text-xs text-gray-300">
                  Actions triggered on this entity will present an Action Preview modal before modifying persistent state.
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500 font-mono">Creation Date</span>
                <span className="font-mono text-white">{new Date(object.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500 font-mono">Last Synchronized</span>
                <span className="font-mono text-white">{object.updatedAt ? new Date(object.updatedAt).toLocaleString() : 'Live'}</span>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-2">
              {auditLogs.length > 0 ? (
                auditLogs.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-purple font-semibold">{entry.action}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        entry.result === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {entry.result}
                      </span>
                    </div>
                    <div className="text-gray-400 text-[11px]">{entry.evidence}</div>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 pt-1">
                      <span>By: {entry.actorEmail}</span>
                      <span>CorrID: {entry.correlationId}</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-mono text-gray-500">
                  No specific audit trail entries logged for this item yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 9: TECHNICAL DETAILS */}
          {activeTab === 'TECHNICAL' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-gray-300 overflow-x-auto max-h-72">
                <pre>{JSON.stringify(object.rawPayload || object, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0 text-xs font-mono text-gray-500">
          <span>CATALYX V22 TRUTH ENGINE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
