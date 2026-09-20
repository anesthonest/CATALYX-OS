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
  Play,
  Users
} from 'lucide-react';
import { EnterpriseActivityFeed } from './EnterpriseActivityFeed';
import { CatalyxSystemGuideView } from './CatalyxSystemGuideView';
import { PageHeader } from './design-system/PageHeader';
import { MetricCard } from './design-system/MetricCard';
import { ActionCard } from './design-system/ActionCard';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. STANDARDIZED PAGE HEADER WITH ROLE LENS & CUSTOMIZATION */}
      <PageHeader
        title={`Welcome, ${user.username || 'Commander'}`}
        subtitle={roleProfile.subtitle}
        badge="V26 RELEASE"
        roleLens={
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
              className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
              aria-label="Select Operational Role Perspective"
            >
              <option value="EXECUTIVE" className="bg-slate-950 text-white">Executive (Strategic Command)</option>
              <option value="MANAGER" className="bg-slate-950 text-white">Manager (Operations & Tasks)</option>
              <option value="OPERATOR" className="bg-slate-950 text-white">Operator (Real-Time Control)</option>
              <option value="DEVELOPER" className="bg-slate-950 text-white">Developer (APIs & Runtimes)</option>
              <option value="RESEARCHER" className="bg-slate-950 text-white">Researcher (Models & Proofs)</option>
              <option value="FINANCE" className="bg-slate-950 text-white">Finance (Commerce & Ledger)</option>
              <option value="ADMIN" className="bg-slate-950 text-white">Admin (Governance & Safety)</option>
            </select>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAskAi()}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Ask CATALYX AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask AI</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Customize Command Center"
              aria-label="Customize widgets"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Customize</span>
            </button>
          </div>
        }
      />

      {/* 2. ONBOARDING & ORIENTATION GUIDE (What is CATALYX? 3-Question Clarity) */}
      {showWelcomeGuide && widgetConfig.welcomeCard && (
        <div className="catalyx-surface-card p-5 sm:p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden shadow-lg">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <button
            onClick={handleDismissWelcome}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            title="Dismiss Guide"
            aria-label="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="p-3 bg-amber-500/15 rounded-xl border border-amber-500/30 shrink-0 text-amber-400">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-base sm:text-lg font-display font-semibold text-white">
                  What is CATALYX?
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                  CATALYX is your <strong className="text-white">all-in-one professional platform</strong> for managing work, collaborating with teams, utilizing AI, and growing your business.
                </p>
              </div>

              {/* 3 Core Orientation Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">1. What can I do here?</span>
                  <p className="text-xs text-gray-300 leading-relaxed">Create projects, write documents, build slide decks, coordinate AI agents, and run commercial operations.</p>
                </div>
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">2. What is happening?</span>
                  <p className="text-xs text-gray-300 leading-relaxed">Track active team deliverables, agent execution metrics, system health, and real-time ledger settlements.</p>
                </div>
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">3. What should I do next?</span>
                  <p className="text-xs text-gray-300 leading-relaxed">Resolve priority action items below, open your assigned tasks backlog, or ask the AI assistant for advice.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('universal-work')}
                  className="px-3.5 py-1.5 catalyx-btn-gold text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Explore Work Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAskAi("Give me a brief overview of my active workspace and priority recommendations.")}
                  className="px-3.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ask CATALYX AI</span>
                </button>
                <button
                  onClick={onOpenCommandPalette}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-mono rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <span>Search (Cmd+K)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATALYX SYSTEM GUIDE AI (V26 Grounded Intelligence) */}
      {widgetConfig.askCatalyx && (
        <CatalyxSystemGuideView
          activeTab="home"
          activeRole={activeRole}
          userEmail={user.email}
          onNavigate={onNavigate}
          onOpenAskAiModal={onOpenAskAi}
        />
      )}

      {/* 4. ROLE TELEMETRY & LIVE OPERATIONAL PULSE (MetricCards) */}
      {widgetConfig.roleMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleProfile.metrics.map((metric, idx) => (
            <MetricCard
              key={idx}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              isPositive={metric.isPositive}
              subtext={metric.subtext}
              icon={<Activity className="w-4 h-4 text-amber-400" />}
            />
          ))}
        </div>
      )}

      {/* 5. MAIN SPLIT: Priority Attention Queue vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Actions Queue (What needs attention right now?) */}
        {widgetConfig.priorityActions && (
          <div className="lg:col-span-2 catalyx-surface-card p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                  What Needs Attention Right Now?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {priorityActions.length} Pending
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                Real-Time Sentinel
              </span>
            </div>

            {priorityActions.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-black/30 border border-dashed border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white">All Clear — Zero Critical Bottlenecks</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  All active initiatives, approvals, and security policies are currently operating within nominal parameters.
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
                        : 'bg-black/30 border-white/10 hover:border-white/20'
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
          <div className="catalyx-surface-card p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Actions
              </h3>
              <span className="text-[10px] font-mono text-gray-500 uppercase">One-Click</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <ActionCard
                title="Create or Log Task"
                description="Add deliverable to personal backlog"
                icon={<CheckSquare className="w-4 h-4 text-amber-400" />}
                onClick={() => onNavigate('tasks')}
              />

              <ActionCard
                title="Start New Project"
                description="Open Kanban board and milestones"
                icon={<Layers className="w-4 h-4 text-blue-400" />}
                onClick={() => onNavigate('project-board')}
              />

              <ActionCard
                title="Draft Document or Slide Deck"
                description="Create presentations, notes, or media"
                icon={<Presentation className="w-4 h-4 text-purple-400" />}
                onClick={() => onNavigate('presentations')}
              />

              <ActionCard
                title="AI Action Firewall"
                description="8-stage safety controls & quarantine"
                icon={<Shield className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('ai-firewall')}
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. CONSOLIDATED UNIVERSAL WORK & OPERATING SYSTEM HUB */}
      <div className="catalyx-surface-card p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase catalyx-badge-gold">
              Core Capabilities
            </span>
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
              Work, Collaboration & Business Hub
            </h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            Click any domain to jump directly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Universal Work Hub */}
          <button
            onClick={() => onNavigate('universal-work')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-amber-500/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-amber-500/15 text-amber-400 mb-2.5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Universal Work Hub</h4>
              <p className="text-[11px] text-gray-400 mt-1">Polymorphic work schemas across 60+ digital work types</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-amber-400 pt-2 border-t border-white/5">
              <span>Work Management</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Team Workspaces */}
          <button
            onClick={() => onNavigate('workspace')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-blue-500/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-blue-500/15 text-blue-400 mb-2.5 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Team Workspaces</h4>
              <p className="text-[11px] text-gray-400 mt-1">Collaborative rooms, team chat & shared backlogs</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-blue-400 pt-2 border-t border-white/5">
              <span>Collaboration</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Social Inbox */}
          <button
            onClick={() => onNavigate('social-inbox')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-emerald-500/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-emerald-500/15 text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Messages & Inbox</h4>
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
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-purple-500/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-purple-500/15 text-purple-400 mb-2.5 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Commerce & CRM</h4>
              <p className="text-[11px] text-gray-400 mt-1">Orders lifecycle, customer CRM & products catalog</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-purple-400 pt-2 border-t border-white/5">
              <span>Business</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Presentations & Slides */}
          <button
            onClick={() => onNavigate('presentations')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-amber-500/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-amber-500/15 text-amber-400 mb-2.5 group-hover:scale-105 transition-transform">
                <Presentation className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Presentations Studio</h4>
              <p className="text-[11px] text-gray-400 mt-1">Slide decks, presenter notes & interactive present mode</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-amber-400 pt-2 border-t border-white/5">
              <span>Decks & Slides</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Media & Podcasts */}
          <button
            onClick={() => onNavigate('media')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-rose-400/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-rose-500/15 text-rose-400 mb-2.5 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Media Studio</h4>
              <p className="text-[11px] text-gray-400 mt-1">Video streams, audio podcasts & chapter timestamps</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-rose-400 pt-2 border-t border-white/5">
              <span>Streaming</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Unified Meetings */}
          <button
            onClick={() => onNavigate('meetings')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-blue-400/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-blue-500/15 text-blue-400 mb-2.5 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Unified Meetings</h4>
              <p className="text-[11px] text-gray-400 mt-1">Scheduler, agendas, decisions & task conversion</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-blue-400 pt-2 border-t border-white/5">
              <span>Schedule</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Universal Files & Docs */}
          <button
            onClick={() => onNavigate('files')}
            className="p-4 rounded-xl catalyx-surface-elevated hover:border-cyan-400/40 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-cyan-500/15 text-cyan-400 mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Files & Documents</h4>
              <p className="text-[11px] text-gray-400 mt-1">Universal document previewer, code syntax & storage</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-cyan-400 pt-2 border-t border-white/5">
              <span>Vault</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 7. ROLE RECOMMENDATIONS (What should I do next?) */}
      <div className="catalyx-surface-card p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
              Recommended Next Steps
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            Tailored for <strong className="text-amber-400">{roleProfile.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleProfile.recommendedActions.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl catalyx-surface-elevated border border-white/5 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
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
                className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{rec.btnLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 8. ENTERPRISE ACTIVITY FEED */}
      <EnterpriseActivityFeed
        onNavigateToArtifact={(type, id) => {
          if (type === 'FILE') onNavigate('files');
          else if (type === 'PRESENTATION') onNavigate('presentations');
          else if (type === 'MEDIA') onNavigate('media');
          else if (type === 'DEMO') onNavigate('demos');
          else onNavigate('meetings');
        }}
      />

      {/* 9. WIDGET CUSTOMIZATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="catalyx-surface-elevated p-6 rounded-2xl max-w-md w-full border border-white/15 space-y-4 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                Customize Command Center
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Choose which modules appear on your primary Home Command Center. Preferences persist in your local session.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {[
                { key: 'welcomeCard', label: 'Welcome & Orientation Guide', desc: 'Platform definition and core questions' },
                { key: 'askCatalyx', label: 'Grounded AI Assistant Prompt', desc: 'Natural language strategic consultation' },
                { key: 'roleMetrics', label: 'Operational Telemetry Metrics', desc: 'Role-adaptive indicators' },
                { key: 'priorityActions', label: 'Priority Attention Queue', desc: 'Real-time risks, approvals & blockers' },
                { key: 'quickActions', label: 'Quick Actions Launcher', desc: 'One-click shortcuts to primary tasks' },
                { key: 'activeWork', label: 'Recommended Next Steps', desc: 'Contextual cognitive guidance' }
              ].map(({ key, label, desc }) => {
                const isEnabled = widgetConfig[key as keyof V21DashboardWidgetConfig];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleWidget(key as keyof V21DashboardWidgetConfig)}
                    className="w-full p-3 rounded-xl catalyx-surface-card border border-white/5 hover:border-white/15 flex items-center justify-between text-left transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">{label}</span>
                      <span className="text-[11px] text-gray-400">{desc}</span>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${
                      isEnabled 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
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
                className="py-2 px-5 catalyx-btn-gold text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
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
