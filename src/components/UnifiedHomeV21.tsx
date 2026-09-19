import React, { useState } from 'react';
import { 
  UserProfile, 
  Task, 
  UserPersonaRole, 
  V21DashboardWidgetConfig, 
  V21PriorityAction 
} from '../types';
import { v21ExperienceService } from '../services/v21ExperienceService';
import { 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Compass, 
  SlidersHorizontal, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  X, 
  Plus, 
  Search, 
  Zap, 
  Bot, 
  Globe, 
  Shield, 
  CheckSquare, 
  Activity, 
  Calendar,
  Eye,
  EyeOff,
  Briefcase,
  MessageSquare,
  ShoppingBag,
  Plug,
  Award,
  Presentation,
  Video,
  FileText,
  Play
} from 'lucide-react';
import { EnterpriseActivityFeed } from './EnterpriseActivityFeed';
import { CatalyxSystemGuideView } from './CatalyxSystemGuideView';

interface UnifiedHomeV21Props {
  user: UserProfile;
  tasks: Task[];
  activeRole: UserPersonaRole;
  onRoleChange: (role: UserPersonaRole) => void;
  onNavigate: (tab: string) => void;
  onOpenAskAi: (initialPrompt?: string) => void;
  onOpenCommandPalette: () => void;
}

export const UnifiedHomeV21: React.FC<UnifiedHomeV21Props> = ({
  user,
  tasks,
  activeRole,
  onRoleChange,
  onNavigate,
  onOpenAskAi,
  onOpenCommandPalette
}) => {
  // Widget customization state
  const [widgetConfig, setWidgetConfig] = useState<V21DashboardWidgetConfig>(() => {
    try {
      const saved = localStorage.getItem('catalyx_v21_widgets');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      welcomeCard: true,
      roleMetrics: true,
      priorityActions: true,
      askCatalyx: true,
      activeWork: true,
      intelligenceRadar: true,
      quickActions: true,
      recentActivity: true
    };
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [askAiQuery, setAskAiQuery] = useState('');
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    return localStorage.getItem('catalyx_v21_hide_welcome') !== 'true';
  });

  const roleProfile = v21ExperienceService.getRoleProfile(activeRole);
  const allPriorityActions = v21ExperienceService.getPriorityActions();
  const priorityActions = allPriorityActions.filter(a => !dismissedActions.includes(a.id));

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);

  const toggleWidget = (key: keyof V21DashboardWidgetConfig) => {
    const updated = { ...widgetConfig, [key]: !widgetConfig[key] };
    setWidgetConfig(updated);
    try {
      localStorage.setItem('catalyx_v21_widgets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDismissWelcome = () => {
    setShowWelcomeGuide(false);
    localStorage.setItem('catalyx_v21_hide_welcome', 'true');
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askAiQuery.trim()) return;
    onOpenAskAi(askAiQuery);
    setAskAiQuery('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. TOP HERO BAR: Role Lens & Context Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-brand-purple/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 font-bold">
              CATALYX V24
            </span>
            <span className="text-xs text-gray-400 font-mono">
              OPERATIONAL COMMAND CENTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">{user.username || 'Commander'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            {roleProfile.subtitle}
          </p>
        </div>

        {/* Role Lens & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Role View:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
              className="bg-transparent text-xs font-semibold text-brand-cyan focus:outline-none cursor-pointer"
              aria-label="Select Operational Role Perspective"
            >
              <option value="EXECUTIVE" className="bg-slate-900 text-white">Executive (Strategic Command)</option>
              <option value="MANAGER" className="bg-slate-900 text-white">Manager (Operations & Tasks)</option>
              <option value="OPERATOR" className="bg-slate-900 text-white">Operator (Real-Time Control)</option>
              <option value="DEVELOPER" className="bg-slate-900 text-white">Developer (APIs & Sandbox)</option>
              <option value="RESEARCHER" className="bg-slate-900 text-white">Researcher (Data & Models)</option>
              <option value="FINANCE" className="bg-slate-900 text-white">Finance (Commerce & Ledger)</option>
              <option value="ADMIN" className="bg-slate-900 text-white">Admin (Governance & Safety)</option>
            </select>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-950/80 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Configure Dashboard Widgets"
            aria-label="Configure widgets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-purple" />
            <span className="hidden sm:inline">Customize</span>
          </button>
        </div>
      </div>

      {/* 2. OPTIONAL WELCOME & ORIENTATION GUIDE (What is CATALYX?) */}
      {showWelcomeGuide && widgetConfig.welcomeCard && (
        <div className="glass-panel p-5 rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-brand-cyan/10 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
          <button
            onClick={handleDismissWelcome}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            title="Dismiss Guide"
            aria-label="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="p-3 bg-brand-cyan/15 rounded-xl border border-brand-cyan/40 shrink-0 text-brand-cyan">
              <Compass className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-base sm:text-lg font-display font-semibold text-white">
                  What is CATALYX?
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                  CATALYX is your <strong className="text-white">Human-Centered Autonomous Operating System</strong>. It consolidates work management, strategic missions, multi-agent automation, knowledge synthesis, and financial integrity into a single unified interface.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-brand-cyan font-bold block mb-0.5">1. What can I do here?</span>
                  <p className="text-xs text-gray-400">Launch projects, coordinate autonomous AI agent specialists, track goals, and run planetary simulations.</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-brand-purple font-bold block mb-0.5">2. What is happening?</span>
                  <p className="text-xs text-gray-400">Observe real-time team velocity, agent queue throughput, and planetary intelligence risk alerts.</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">3. What should I do next?</span>
                  <p className="text-xs text-gray-400">Act on high-priority items below, review pending approvals, or ask the AI assistant for contextual guidance.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('tasks')}
                  className="px-3 py-1.5 bg-brand-cyan text-slate-950 text-xs font-bold rounded-lg hover:bg-brand-cyan/90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAskAi("Give me a strategic overview of my active workspace.")}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Ask CATALYX AI</span>
                </button>
                <button
                  onClick={onOpenCommandPalette}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <span>Search Everything (Cmd+K)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATALYX SYSTEM GUIDE AI (V26 Deep Grounded Intelligence) */}
      {widgetConfig.askCatalyx && (
        <CatalyxSystemGuideView
          activeTab="home"
          activeRole={activeRole}
          userEmail={user.email}
          onNavigate={onNavigate}
          onOpenAskAiModal={onOpenAskAi}
        />
      )}

      {/* 4. ROLE TELEMETRY & LIVE OPERATIONAL PULSE (What is happening?) */}
      {widgetConfig.roleMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleProfile.metrics.map((metric, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  {metric.label}
                </span>
                {metric.change && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    metric.isPositive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {metric.change}
                  </span>
                )}
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {metric.value}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 5. MAIN SPLIT: What needs my attention right now? vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Actions Queue */}
        {widgetConfig.priorityActions && (
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                  What Needs Attention Right Now?
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {priorityActions.length} Pending
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Real-Time Sentinel
              </span>
            </div>

            {priorityActions.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-950/40 border border-dashed border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white">All Clear — Zero Critical Bottlenecks</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  All active missions, approvals, and firewall actions are currently operating within nominal parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {priorityActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      action.severity === 'HIGH' || action.severity === 'CRITICAL'
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                          action.severity === 'HIGH' || action.severity === 'CRITICAL'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {action.category} • {action.severity}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {action.timestamp}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onNavigate(action.targetTab)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{action.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDismissedActions(prev => [...prev, action.id])}
                        className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        title="Dismiss Action"
                        aria-label="Dismiss action"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Col: Quick Actions Launcher (What can I do here?) */}
        {widgetConfig.quickActions && (
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-cyan" />
                Quick Actions
              </h3>
              <span className="text-[10px] font-mono text-gray-500 uppercase">One-Click</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-brand-purple/10 border border-white/5 hover:border-brand-purple/30 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-purple/15 text-brand-purple group-hover:scale-105 transition-transform">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-brand-purple transition-colors">Create or Log Task</h4>
                    <p className="text-[11px] text-gray-400">Add deliverable to personal backlog</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('project-board')}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-brand-cyan/10 border border-white/5 hover:border-brand-cyan/30 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-brand-cyan transition-colors">Start New Initiative</h4>
                    <p className="text-[11px] text-gray-400">Open Kanban project board</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('civilization')}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">Civilization Command</h4>
                    <p className="text-[11px] text-gray-400">Planetary missions & roadmaps</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('ai-firewall')}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 group-hover:scale-105 transition-transform">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-rose-400 transition-colors">AI Action Firewall</h4>
                    <p className="text-[11px] text-gray-400">8-stage safety controls & quarantine</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* V23 CONSOLIDATED OPERATING SYSTEM HUB */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-emerald-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              V23 Production Hub
            </span>
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
              Universal Operating System Domains
            </h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            Real integrations • Zero fabrication
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Worker Center */}
          <button
            onClick={() => onNavigate('worker-center')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-brand-cyan/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-brand-cyan/15 text-brand-cyan mb-2 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">Worker Center</h4>
              <p className="text-[11px] text-gray-400 mt-1">Assigned tasks, who I report to & team blockers</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-brand-cyan pt-2 border-t border-white/5">
              <span>Accountability</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Social Inbox */}
          <button
            onClick={() => onNavigate('social-inbox')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-emerald-500/15 text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Social Inbox</h4>
              <p className="text-[11px] text-gray-400 mt-1">WhatsApp, Messenger, Email & SMS unified queue</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-white/5">
              <span>Omnichannel</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Unified Commerce */}
          <button
            onClick={() => onNavigate('unified-commerce')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-brand-purple/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-brand-purple/15 text-brand-purple mb-2 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors">Unified Commerce</h4>
              <p className="text-[11px] text-gray-400 mt-1">Orders lifecycle, customer CRM & products catalog</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-brand-purple pt-2 border-t border-white/5">
              <span>Integer Ledger</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Connections Center */}
          <button
            onClick={() => onNavigate('connections')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-amber-500/15 text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <Plug className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Connections Center</h4>
              <p className="text-[11px] text-gray-400 mt-1">Connector fabric, honest statuses & webhook relays</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-amber-400 pt-2 border-t border-white/5">
              <span>Fabric</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Presentations & Slides */}
          <button
            onClick={() => onNavigate('presentations')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-brand-purple/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-brand-purple/15 text-brand-purple mb-2 group-hover:scale-105 transition-transform">
                <Presentation className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors">Presentations Studio</h4>
              <p className="text-[11px] text-gray-400 mt-1">Slide decks, presenter notes & interactive present mode</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-brand-purple pt-2 border-t border-white/5">
              <span>Decks & Slides</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Media Studio */}
          <button
            onClick={() => onNavigate('media')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-400/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-rose-500/15 text-rose-400 mb-2 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Media & Podcasts</h4>
              <p className="text-[11px] text-gray-400 mt-1">Video streams, speed controls & timestamp chapters</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-rose-400 pt-2 border-t border-white/5">
              <span>Streaming</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Meetings Hub */}
          <button
            onClick={() => onNavigate('meetings')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-blue-400/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-blue-500/15 text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Unified Meetings</h4>
              <p className="text-[11px] text-gray-400 mt-1">Scheduler, agendas, decisions & task conversion</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-blue-400 pt-2 border-t border-white/5">
              <span>Collaboration</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Universal Files */}
          <button
            onClick={() => onNavigate('files')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-400/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-cyan-500/15 text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Files & Documents</h4>
              <p className="text-[11px] text-gray-400 mt-1">Universal document previewer, code syntax & storage</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-cyan-400 pt-2 border-t border-white/5">
              <span>Storage Vault</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Demos & Prototypes */}
          <button
            onClick={() => onNavigate('demos')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-amber-400/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-amber-500/15 text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Demos & Prototypes</h4>
              <p className="text-[11px] text-gray-400 mt-1">Live sandboxes, test runners & epistemic badges</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-amber-400 pt-2 border-t border-white/5">
              <span>Sandboxes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* V24 Final Production Certification */}
          <button
            onClick={() => onNavigate('v24-certification')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400/70 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-emerald-500/20 text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">V24 Certification</h4>
              <p className="text-[11px] text-gray-400 mt-1">12 verification gates, link integrity & zero dead ends</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-white/5">
              <span>Final Sign-Off</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 6. RECOMMENDED ACTIONS (What should I do next?) */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-purple" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
              What Should I Do Next? (Role Recommendations)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            Tailored for <strong className="text-brand-cyan">{roleProfile.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleProfile.recommendedActions.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-brand-purple/40 transition-all flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {rec.subtext}
                </p>
              </div>
              <button
                onClick={() => onNavigate(rec.targetTab)}
                className="py-2 px-3 bg-brand-purple/15 hover:bg-brand-purple/25 border border-brand-purple/30 text-brand-purple text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{rec.btnLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. ENTERPRISE COLLABORATION & ACTIVITY STREAM */}
      <EnterpriseActivityFeed
        onNavigateToArtifact={(type, id) => {
          if (type === 'FILE') onNavigate('files');
          else if (type === 'PRESENTATION') onNavigate('presentations');
          else if (type === 'MEDIA') onNavigate('media');
          else if (type === 'DEMO') onNavigate('demos');
          else onNavigate('meetings');
        }}
      />

      {/* 8. WIDGET CUSTOMIZATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-heavy p-6 rounded-2xl max-w-md w-full border border-white/15 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-purple" />
                Customize Command Center
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Configure which modules and widgets appear on your primary Home Command Center. Preferences persist automatically.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {[
                { key: 'welcomeCard', label: 'Welcome & Orientation Card', desc: 'Overview of platform architecture' },
                { key: 'askCatalyx', label: 'Contextual AI Query Prompt', desc: 'Quick natural language consultation' },
                { key: 'roleMetrics', label: 'Operational Telemetry Metrics', desc: 'Role-adaptive performance indicators' },
                { key: 'priorityActions', label: 'Priority Attention Queue', desc: 'High-severity risks and approvals' },
                { key: 'quickActions', label: 'Quick Actions Launcher', desc: 'One-click shortcuts to primary tasks' },
                { key: 'activeWork', label: 'Recommended Next Steps', desc: 'Contextual cognitive directives' }
              ].map(({ key, label, desc }) => {
                const isEnabled = widgetConfig[key as keyof V21DashboardWidgetConfig];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleWidget(key as keyof V21DashboardWidgetConfig)}
                    className="w-full p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 flex items-center justify-between text-left transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">{label}</span>
                      <span className="text-[11px] text-gray-400">{desc}</span>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${
                      isEnabled 
                        ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan' 
                        : 'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                      {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="py-2 px-5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
