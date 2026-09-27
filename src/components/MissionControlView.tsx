import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  KeyRound,
  Cpu,
  Microscope,
  ShoppingBag,
  Radio,
  Sliders,
  Play,
  Check,
  Clock,
  Terminal,
  FileText,
  AlertOctagon,
  Layers,
  ChevronRight,
  Download,
  HelpCircle,
  X,
  Lock,
  Archive,
  Eye
} from 'lucide-react';
import {
  missionControlService,
  SubsystemDiagnostic,
  SystemConditionScore,
  OperationalAlert,
  OperationalEvent,
  RemediationRunbook,
  HealthStatus
} from '../services/missionControlService';
import { UserProfile, UserPersonaRole } from '../types';

interface MissionControlViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate?: (tabId: string) => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'subsystems' | 'alerts' | 'runbooks' | 'events' | 'inquiry' | 'policies'>('subsystems');
  const [score, setScore] = useState<SystemConditionScore | null>(null);
  const [subsystems, setSubsystems] = useState<SubsystemDiagnostic[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [runbooks, setRunbooks] = useState<RemediationRunbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [executingRunbookId, setExecutingRunbookId] = useState<string | null>(null);
  const [runbookOutput, setRunbookOutput] = useState<{ id: string; success: boolean; text: string; time: string } | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemDiagnostic | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Inquiry state (Section 20: Owner-Friendly Explanation)
  const [inquiryQuestion, setInquiryQuestion] = useState<string>('');
  const [inquiryAnswer, setInquiryAnswer] = useState<string | null>(null);

  // RBAC Access Check (Section 8)
  const isAuthorized = missionControlService.isAuthorizedOperator(activeRole);

  const loadData = async (forceFresh = false) => {
    try {
      if (forceFresh) setIsRefreshing(true);
      const condition = await missionControlService.getSystemCondition(forceFresh);
      setScore(condition.score);
      setSubsystems(condition.diagnostics);
      setAlerts(condition.alerts);
      setEvents(condition.recentEvents);
      setRunbooks(missionControlService.getAvailableRunbooks());
      setLastUpdatedTime(new Date());
      setSecondsAgo(0);
    } catch (e) {
      console.error('Failed to load mission control data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Freshness timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdatedTime.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdatedTime]);

  const handleAcknowledgeAlert = (alertId: string) => {
    missionControlService.acknowledgeAlert(alertId, user.email);
    setAlerts(missionControlService.getAlerts());
    setEvents(missionControlService.getRecentEvents(30));
  };

  const handleResolveAlert = (alertId: string) => {
    missionControlService.resolveAlert(alertId, user.email);
    setAlerts(missionControlService.getAlerts());
    setEvents(missionControlService.getRecentEvents(30));
  };

  const handleRunRunbook = async (runbookId: string) => {
    setExecutingRunbookId(runbookId);
    try {
      const res = await missionControlService.executeRunbook(runbookId, user.email);
      setRunbookOutput({
        id: runbookId,
        success: res.success,
        text: res.output,
        time: new Date().toLocaleTimeString()
      });
      await loadData(true);
    } finally {
      setExecutingRunbookId(null);
    }
  };

  const handleInquiry = (question: string) => {
    setInquiryQuestion(question);
    const ans = missionControlService.askSystemCondition(question);
    setInquiryAnswer(ans);
  };

  const handleExportTelemetry = () => {
    const data = {
      score,
      subsystems,
      alerts,
      events,
      exportedAt: new Date().toISOString(),
      exportedBy: user.email
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalyx-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE / HEALTHY
          </span>
        );
      case 'CONFIG_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-3.5 h-3.5" /> CONFIG REQUIRED (FALLBACK ACTIVE)
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> AT RISK
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> DEGRADED
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'TELEMETRY_UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> TELEMETRY UNAVAILABLE
          </span>
        );
      case 'UNKNOWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> UNKNOWN / INSUFFICIENT DATA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            MAINTENANCE
          </span>
        );
    }
  };

  const getSubsystemIcon = (id: string) => {
    switch (id) {
      case 'api_gateway':
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'database_persistence':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'auth_security':
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case 'payment_monetization':
        return <KeyRound className="w-5 h-5 text-amber-400" />;
      case 'ai_intelligence':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'deep_research':
        return <Microscope className="w-5 h-5 text-blue-400" />;
      case 'marketplace_commerce':
        return <ShoppingBag className="w-5 h-5 text-rose-400" />;
      case 'background_webhooks':
        return <Radio className="w-5 h-5 text-teal-400" />;
      case 'backup_recovery':
        return <Archive className="w-5 h-5 text-sky-400" />;
      case 'monitoring_self_health':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'system_resources':
        return <Activity className="w-5 h-5 text-cyan-300" />;
      default:
        return <Layers className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredEvents = events.filter(e => {
    if (eventFilter === 'ALL') return true;
    return e.severity === eventFilter;
  });

  const isStale = secondsAgo > 60;

  // RBAC Access Guard
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">ACCESS RESTRICTED — MISSION CONTROL</h2>
          <p className="text-sm text-slate-400">
            Mission Control requires <strong className="text-slate-200">OPERATOR, ADMIN, AUDITOR, or EXECUTIVE</strong> authorization. Your current role is <span className="font-mono text-cyan-400 font-bold">{activeRole}</span>.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-white/5 font-mono">
            Tenant Isolation & Role-Based Access Control Enforced.
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Return to Workspace
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  CATALYX MISSION CONTROL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                  REAL-TELEMETRY V26
                </span>
                {isStale ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    STALE ({secondsAgo}s ago)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    LIVE ({secondsAgo}s ago)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Authoritative platform health, real-time subsystem diagnostics, incident response & runbooks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Run Diagnostics
          </button>

          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry
          </button>
        </div>
      </div>

      {/* Top Level Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Composite Health Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SYSTEM INTEGRITY</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                score?.overallStatus === 'HEALTHY' ? 'bg-emerald-400' : score?.overallStatus === 'CRITICAL' ? 'bg-rose-400' : 'bg-cyan-400'
              } opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                score?.overallStatus === 'HEALTHY' ? 'bg-emerald-500' : score?.overallStatus === 'CRITICAL' ? 'bg-rose-500' : 'bg-cyan-500'
              }`}></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {score ? `${score.compositeScore}%` : '---'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Composite Score</span>
          </div>
          <div className="pt-1">
            {score && getStatusBadge(score.overallStatus)}
          </div>
        </div>

        {/* Subsystems Health Count */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SUBSYSTEMS STATUS</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {score?.healthyCount ?? 0}/{score?.totalSubsystems ?? subsystems.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Fully Operational</span>
          </div>
          <div className="text-xs text-slate-400">
            {score?.configRequiredCount ?? 0} with local fallback mode
          </div>
        </div>

        {/* Operational Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {alerts.filter(a => a.status === 'ACTIVE').length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Active Notices</span>
          </div>
          <div className="text-xs text-slate-400">
            {alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'CRITICAL').length} Critical / {alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'HIGH').length} High
          </div>
        </div>

        {/* Authoritative Rails Security */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PAYMENT RAILS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 text-emerald-400 font-bold text-lg">
            <span>PESAPAL V3 + BANK</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            STRIPE: <span className="text-rose-400 font-bold">DECOMMISSIONED</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('subsystems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'subsystems'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          Subsystem Diagnostics ({subsystems.length})
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'alerts'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alert Desk ({alerts.filter(a => a.status === 'ACTIVE').length})
        </button>

        <button
          onClick={() => setActiveSubTab('runbooks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'runbooks'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Remediation Runbooks ({runbooks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'events'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Audit Stream ({events.length})
        </button>

        <button
          onClick={() => setActiveSubTab('inquiry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'inquiry'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Executive Condition Inquiry
        </button>

        <button
          onClick={() => setActiveSubTab('policies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'policies'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Policies & Rates Truth
        </button>
      </div>

      {/* Sub-Tab 1: Subsystems Diagnostics Matrix */}
      {activeSubTab === 'subsystems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Click any subsystem card to view detailed evidence, historical alerts, and runbook triggers.</span>
            <span className="font-mono">FRESHNESS: {secondsAgo}s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsystems.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubsystem(sub)}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all shadow-md space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-800 border border-white/5 group-hover:bg-slate-700 transition-colors">
                        {getSubsystemIcon(sub.id)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                          {sub.name}
                          <Eye className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{sub.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {sub.latencyMs}ms
                    </span>
                  </div>

                  <div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {sub.statusMessage}
                  </p>

                  {/* Key Metrics Key-Values */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 text-[11px] font-mono">
                    {Object.entries(sub.metrics).slice(0, 4).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-slate-400">
                        <span className="truncate pr-2">{k}:</span>
                        <span className="text-slate-200 font-semibold truncate max-w-[180px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Checked: {new Date(sub.lastChecked).toLocaleTimeString()}</span>
                  <span className="text-cyan-400 group-hover:underline">Drill-Down &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill-Down Subsystem Modal (Section 19) */}
      {selectedSubsystem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-800 border border-white/10">
                  {getSubsystemIcon(selectedSubsystem.id)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedSubsystem.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-slate-400 text-[10px]">ID: {selectedSubsystem.id}</span>
                    <span className="font-mono text-slate-400 text-[10px]">&bull;</span>
                    <span className="font-mono text-slate-400 text-[10px]">CATEGORY: {selectedSubsystem.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubsystem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Current Subsystem Status</div>
                  <div className="mt-1">{getStatusBadge(selectedSubsystem.status)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Response Latency</div>
                  <div className="font-mono font-bold text-slate-200 mt-1">{selectedSubsystem.latencyMs}ms</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Status Reason & Diagnostic Truth</div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-slate-200 leading-relaxed font-mono">
                  {selectedSubsystem.statusMessage}
                </div>
              </div>

              {/* Evidence Log */}
              {selectedSubsystem.evidence && selectedSubsystem.evidence.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Telemetry Evidence:</div>
                  <ul className="space-y-1 p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    {selectedSubsystem.evidence.map((ev, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Metrics */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Diagnostic Telemetry Variables:</div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5 font-mono text-[11px]">
                  {Object.entries(selectedSubsystem.metrics).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-slate-400">{k}</span>
                      <span className="text-slate-200 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Checklist */}
              {selectedSubsystem.configRequirements.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Required Parameters:</div>
                  <div className="space-y-1">
                    {selectedSubsystem.configRequirements.map(req => (
                      <div key={req.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
                        <span className="text-slate-300 font-mono">{req.description} ({req.key})</span>
                        {req.satisfied ? (
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> SATISFIED
                          </span>
                        ) : (
                          <span className="text-cyan-400 font-mono font-bold">
                            LOCAL FALLBACK
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Trigger */}
              {selectedSubsystem.mitigationRunbookId && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Suggested Remediation:</span>
                  <button
                    onClick={() => {
                      const id = selectedSubsystem.mitigationRunbookId!;
                      setSelectedSubsystem(null);
                      setActiveSubTab('runbooks');
                      handleRunRunbook(id);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer"
                  >
                    Execute Runbook ({selectedSubsystem.mitigationRunbookId})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Operational Alert Desk */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Operational Incidents & Advisory Notices ({alerts.length})
            </h2>
          </div>

          {alerts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold">Zero active alerts</p>
              <p className="text-xs text-slate-500 mt-1">Platform operating smoothly within normal parameters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.status === 'RESOLVED' || alert.status === 'CLOSED'
                      ? 'bg-slate-900/30 border-white/5 opacity-60'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-900/70 border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300'
                            : alert.severity === 'MEDIUM'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {alert.severity}
                        </span>

                        <span className="text-xs font-mono text-slate-400 uppercase">
                          [{alert.subsystemId}]
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alert.status === 'ACTIVE'
                            ? 'bg-rose-500/10 text-rose-400'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {alert.status}
                        </span>

                        <span className="text-[11px] text-slate-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                      {alert.evidence && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Evidence: <span className="text-slate-300">{alert.evidence}</span>
                        </div>
                      )}

                      {alert.suggestedAction && (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-cyan-300">
                          <span className="font-semibold text-slate-200">Recommended Action: </span>
                          {alert.suggestedAction}
                        </div>
                      )}

                      {alert.acknowledgedBy && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Acknowledged by: {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt || '').toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Remediation Runbooks */}
      {activeSubTab === 'runbooks' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Operational Runbooks & Automated Diagnostics
            </h2>
            <p className="text-xs text-slate-400">
              Self-healing routines, provider connectivity probes, and security audit verifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {runbooks.map(rb => (
              <div
                key={rb.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      [{rb.subsystemId}]
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 text-slate-400">
                      IMPACT: {rb.impactLevel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{rb.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{rb.description}</p>
                </div>

                <button
                  onClick={() => handleRunRunbook(rb.id)}
                  disabled={executingRunbookId === rb.id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {executingRunbookId === rb.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing Runbook...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Execute Runbook
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Terminal Output Console */}
          {runbookOutput && (
            <div className="rounded-2xl bg-slate-950 border border-white/10 p-5 space-y-3 font-mono shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>RUNBOOK OUTPUT CONSOLE</span>
                  <span className="text-[10px] text-slate-500">[{runbookOutput.time}]</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  runbookOutput.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {runbookOutput.success ? 'EXIT: 0 (SUCCESS)' : 'EXIT: 1 (FAILED)'}
                </span>
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {runbookOutput.text}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Live Event Audit Stream */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Operational Event Audit Stream ({filteredEvents.length})
            </h2>

            {/* Severity Filter */}
            <div className="flex items-center gap-1">
              {['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setEventFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    eventFilter === filter
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/10 divide-y divide-white/5 font-mono text-xs shadow-inner">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    evt.severity === 'CRITICAL' || evt.severity === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-300'
                      : evt.severity === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {evt.severity}
                  </span>

                  <span className="text-slate-400 text-[10px]">
                    [{evt.subsystemId}]
                  </span>

                  <span className="text-slate-200">
                    {evt.message}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Executive Condition Inquiry (Section 20) */}
      {activeSubTab === 'inquiry' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Executive System Condition Inquiries
            </h2>
            <p className="text-xs text-slate-400">
              Immediate, telemetry-grounded operational answers for platform leadership. Zero hallucinations.
            </p>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              'How is CATALYX right now?',
              'Are payments working?',
              'Are subscriptions working?',
              'Are users safe?',
              'Are AI agents working?',
              'Are backups working?',
              'Is there any critical problem?'
            ].map(chip => (
              <button
                key={chip}
                onClick={() => handleInquiry(chip)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Answer Card */}
          {inquiryAnswer && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>QUERY: "{inquiryQuestion}"</span>
              </div>
              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                {inquiryAnswer}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>EVALUATED AGAINST 11 REAL TELEMETRY SUBSYSTEMS</span>
                <span>ZERO SYNTHETIC DATA</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 6: Authoritative Policies & Rates Truth */}
      {activeSubTab === 'policies' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Authoritative Platform Policies & Rate Truth Table
            </h2>
            <p className="text-xs text-slate-400">
              Server-enforced, tamper-proof rates, payment providers, and subscription pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Subscription Table */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <FileText className="w-4 h-4" />
                MANDATORY SUBSCRIPTIONS
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Individual:</span>
                  <span className="font-bold text-white font-mono">$10.00 / month</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Group / Team:</span>
                  <span className="font-bold text-white font-mono">$13.00 / month</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Organization:</span>
                  <span className="font-bold text-white font-mono">$25.00 / month</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Billing interval: Monthly recurring. Server-authoritative locks active.
              </div>
            </div>

            {/* Platform Commission Schedule */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                REVENUE SHARE SCHEDULE
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Individual Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">0.25% (25 bps)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Group Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">0.27% (27 bps)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="font-semibold text-slate-300">Organization Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">0.50% (50 bps)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Historical 10% and 15% commissions retired. Creator keeps 99.50% - 99.75%.
              </div>
            </div>

            {/* Creator IP Guarantee */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
                <Shield className="w-4 h-4" />
                IP & SOVEREIGNTY GUARANTEE
              </div>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">100% Creator IP Retention:</strong> All workflows, models, designs, code, and deliverables created on CATALYX remain 100% creator property.
                </p>
                <p>
                  <strong className="text-white">CATALYX Architecture:</strong> All platform engine rights reserved by CATALYX and Vinexsah Technologies.
                </p>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Legal document: /intellectual-property (v2026.3.2)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
