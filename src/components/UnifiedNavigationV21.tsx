import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Brain, 
  Compass, 
  Bot, 
  Cpu, 
  Globe, 
  Receipt, 
  Shield, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Search, 
  HelpCircle,
  FolderKanban,
  CheckSquare,
  Target,
  Clock,
  Users,
  Activity,
  BarChart3,
  Sliders,
  BookOpen,
  Flag,
  GitBranch,
  ShieldCheck,
  Layers,
  Microscope,
  Trophy,
  Radio,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Coins,
  ShieldAlert,
  Award,
  Command,
  Plug,
  Zap,
  Presentation,
  Video,
  Calendar,
  FileText,
  Play
} from 'lucide-react';
import { 
  PrimaryDomainId, 
  UserProfile, 
  UserPersonaRole, 
  V21DomainNavGroup 
} from '../types';
import { v21ExperienceService } from '../services/v21ExperienceService';
import { navigationRouterService } from '../services/navigationRouterService';
import { SmartNotifications } from './SmartNotifications';
import { CommandPalette } from './CommandPalette';
import { SystemHealthTruthWidget } from './SystemHealthTruthWidget';

interface UnifiedNavigationV21Props {
  user: UserProfile;
  activeDomain: PrimaryDomainId;
  activeTab: string;
  activeRole: UserPersonaRole;
  onSelectDomain: (domainId: PrimaryDomainId) => void;
  onSelectTab: (tabId: string) => void;
  onRoleChange: (role: UserPersonaRole) => void;
  onLogout: () => void;
  onOpenAskAi: (initialPrompt?: string) => void;
  onOpenCommandPalette: () => void;
  onOpenTrustCenter?: () => void;
  isAdvancedMode?: boolean;
  onToggleAdvancedMode?: () => void;
  tasks: any[];
}

export const UnifiedNavigationV21: React.FC<UnifiedNavigationV21Props> = ({
  user,
  activeDomain,
  activeTab,
  activeRole,
  onSelectDomain,
  onSelectTab,
  onRoleChange,
  onLogout,
  onOpenAskAi,
  onOpenCommandPalette,
  onOpenTrustCenter,
  isAdvancedMode = false,
  onToggleAdvancedMode,
  tasks
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const domainGroups = v21ExperienceService.domainGroups;

  // Render icons dynamically
  const renderDomainIcon = (id: PrimaryDomainId, className: string = 'w-4 h-4') => {
    switch (id) {
      case 'home': return <LayoutDashboard className={className} />;
      case 'work': return <Briefcase className={className} />;
      case 'intelligence': return <Brain className={className} />;
      case 'missions': return <Compass className={className} />;
      case 'automation': return <Bot className={className} />;
      case 'resources': return <Cpu className={className} />;
      case 'ecosystem': return <Globe className={className} />;
      case 'commerce': return <Receipt className={className} />;
      case 'admin': return <Shield className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const currentGroup = domainGroups.find(g => g.id === activeDomain) || domainGroups[0];
  const currentSubItem = currentGroup.subItems.find(s => s.id === activeTab) || currentGroup.subItems[0];

  const canGoBack = navigationRouterService.canGoBack();
  const canGoForward = navigationRouterService.canGoForward();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(navigationRouterService.getCurrentWorkspaceId());

  const handleBack = () => {
    const prev = navigationRouterService.goBack();
    if (prev) {
      onSelectDomain(prev.domain);
      onSelectTab(prev.tab);
    }
  };

  const handleForward = () => {
    const next = navigationRouterService.goForward();
    if (next) {
      onSelectDomain(next.domain);
      onSelectTab(next.tab);
    }
  };

  const handleWorkspaceChange = (wsId: string) => {
    setActiveWorkspaceId(wsId);
    navigationRouterService.setWorkspace(wsId);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR WITH BREADCRUMBS, SEARCH, ROLE, & STATUS */}
      {/* ============================================================== */}
      <header className="px-4 sm:px-6 py-3 border-b border-white/10 flex justify-between items-center bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 shrink-0">
        {/* Left: Mobile hamburger, History Nav, & Clickable Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Browser-style In-App History Back & Forward */}
          <div className="hidden sm:flex items-center gap-1 border-r border-white/10 pr-2">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                canGoBack
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 opacity-40 cursor-not-allowed'
              }`}
              title="Navigate Back (In-App History)"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                canGoForward
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 opacity-40 cursor-not-allowed'
              }`}
              title="Navigate Forward (In-App History)"
              aria-label="Go Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs font-mono truncate">
            <button
              onClick={() => onSelectDomain('home')}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="font-display font-bold text-white tracking-wide">CATALYX</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">V24</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />

            <button
              onClick={() => onSelectDomain(currentGroup.id)}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer capitalize font-semibold"
            >
              {currentGroup.label}
            </button>

            {currentSubItem && currentSubItem.id !== currentGroup.id && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <span className="text-brand-cyan truncate">
                  {currentSubItem.label}
                </span>
              </>
            )}
          </nav>

          {/* Workspace Switcher */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-2 border-l border-white/10">
            <select
              value={activeWorkspaceId}
              onChange={(e) => handleWorkspaceChange(e.target.value)}
              className="bg-slate-900 border border-white/10 text-gray-300 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-brand-cyan cursor-pointer"
              title="Active Enterprise Workspace"
            >
              {navigationRouterService.getWorkspaces().map((ws) => (
                <option key={ws.id} value={ws.id} className="bg-slate-950 text-white">
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Health Widget, Trust Center, Advanced Mode, Role Selector, Search, Ask AI, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* V22 Live System Health Truth Widget */}
          <SystemHealthTruthWidget />

          {/* V22 User Trust Center Trigger */}
          {onOpenTrustCenter && (
            <button
              onClick={onOpenTrustCenter}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-all cursor-pointer shadow-sm"
              title="Open User Trust Center (Data Transparency & Integrity)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Trust Center</span>
            </button>
          )}

          {/* V22 Advanced Mode Toggle */}
          {onToggleAdvancedMode && (
            <button
              onClick={onToggleAdvancedMode}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                isAdvancedMode
                  ? 'bg-brand-purple/25 text-white border-brand-purple/60 shadow-sm'
                  : 'bg-slate-900/80 text-gray-400 border-white/10 hover:text-gray-200'
              }`}
              title="Toggle Advanced Operational View (Telemetry, Raw Traces, Correlation IDs)"
            >
              <Sliders className="w-3.5 h-3.5 text-brand-cyan" />
              <span>{isAdvancedMode ? 'ADVANCED: ON' : 'ADVANCED: OFF'}</span>
            </button>
          )}

          {/* Universal Search Trigger (Cmd + K) */}
          <CommandPalette 
            tasks={tasks}
            onNavigate={(tab) => onSelectTab(tab)}
            onSelectTask={() => onSelectTab('tasks')}
          />

          {/* Contextual Ask AI Button */}
          <button
            onClick={() => onOpenAskAi()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-purple/15 hover:bg-brand-purple/25 border border-brand-purple/30 text-brand-purple text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Ask CATALYX AI (Contextual & Actionable)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Role Lens Switcher Pill */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
              className="bg-transparent text-xs font-semibold text-brand-cyan focus:outline-none cursor-pointer"
              aria-label="Current Role Lens"
            >
              <option value="EXECUTIVE" className="bg-slate-900 text-white">Executive</option>
              <option value="MANAGER" className="bg-slate-900 text-white">Manager</option>
              <option value="OPERATOR" className="bg-slate-900 text-white">Operator</option>
              <option value="DEVELOPER" className="bg-slate-900 text-white">Developer</option>
              <option value="RESEARCHER" className="bg-slate-900 text-white">Researcher</option>
              <option value="FINANCE" className="bg-slate-900 text-white">Finance</option>
              <option value="ADMIN" className="bg-slate-900 text-white">Admin</option>
            </select>
          </div>

          {/* Smart Notifications Bell */}
          <SmartNotifications userId={user.uid} />

          {/* User Profile avatar / menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => onSelectTab('profile')}
              className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-slate-950 font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
              title={`${user.username} (Lvl ${user.level})`}
              aria-label="User Profile"
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. DESKTOP UNIFIED SIDEBAR (CANONICAL 9-DOMAIN ARCHITECTURE) */}
      {/* ============================================================== */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 hidden md:flex h-[calc(100vh-53px)] sticky top-[53px]">
        {/* Navigation Group Items */}
        <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 px-2 block mb-1">
              Primary Domains (9)
            </span>

            {domainGroups.map((group) => {
              const isActiveDomain = activeDomain === group.id;
              return (
                <div key={group.id} className="space-y-1">
                  {/* Top-Level Domain Button */}
                  <button
                    onClick={() => onSelectDomain(group.id)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActiveDomain
                        ? 'bg-gradient-to-r from-brand-purple/25 via-brand-purple/15 to-brand-cyan/10 border-brand-purple/50 text-white shadow-md'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {renderDomainIcon(group.id, `w-4 h-4 ${isActiveDomain ? 'text-brand-cyan' : 'text-gray-400'}`)}
                      <span className="truncate">{group.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {group.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10">
                          {group.badge}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isActiveDomain ? 'rotate-180 text-brand-purple' : ''}`} />
                    </div>
                  </button>

                  {/* Progressive Disclosure Sub-items: expanded only for active domain */}
                  {isActiveDomain && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-brand-purple/30 ml-3 animate-fadeIn">
                      {group.subItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onSelectTab(sub.id)}
                            className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-brand-cyan/15 text-brand-cyan font-bold border border-brand-cyan/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            {sub.versionBadge && (
                              <span className="text-[8px] font-mono px-1 rounded bg-slate-900 text-gray-400 border border-white/10">
                                {sub.versionBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: User compliance & Platform State */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div>
              <span className="text-white font-semibold flex items-center gap-1 leading-tight text-brand-purple">
                {user.username || 'Commander'}
                {user.premium && '👑'}
              </span>
              <span className="text-[9px] font-mono text-gray-500 tracking-wide uppercase">
                {activeRole} • Lvl {user.level}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {user.streak}d Streak
            </span>
          </div>

          <button
            onClick={onOpenTrustCenter}
            className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-500/20 flex items-center justify-between text-[9px] font-mono text-gray-300 transition-colors cursor-pointer"
            title="Open User Trust Center"
          >
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              REALITY VERIFIED
            </span>
            <span className="text-gray-500">V24 CERTIFIED</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 3. MOBILE SLIDE-OUT DRAWER FOR ALL 9 DOMAINS */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md md:hidden flex">
          <div className="w-72 bg-slate-900 h-full p-4 flex flex-col justify-between border-r border-white/10 shadow-2xl animate-slideRight">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-display font-bold text-white tracking-wider flex items-center gap-2">
                  CATALYX <span className="text-brand-cyan text-xs font-mono">V24</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Switcher in Mobile Drawer */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Perspective Lens</span>
                <select
                  value={activeRole}
                  onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
                  className="w-full bg-slate-900 text-xs font-semibold text-brand-cyan border border-white/10 rounded-lg p-1.5"
                >
                  <option value="EXECUTIVE">Executive</option>
                  <option value="MANAGER">Manager</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="FINANCE">Finance</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Mobile Domain List */}
              <div className="space-y-1">
                {domainGroups.map((group) => {
                  const isActive = activeDomain === group.id;
                  return (
                    <div key={group.id} className="space-y-1">
                      <button
                        onClick={() => {
                          onSelectDomain(group.id);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isActive
                            ? 'bg-brand-purple/20 border-brand-purple/50 text-white'
                            : 'bg-transparent border-transparent text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {renderDomainIcon(group.id)}
                          <span>{group.label}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      </button>

                      {isActive && (
                        <div className="pl-6 space-y-1 py-1">
                          {group.subItems.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectTab(sub.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left py-1.5 px-2 rounded-lg text-xs ${
                                activeTab === sub.id 
                                  ? 'text-brand-cyan font-bold bg-brand-cyan/10' 
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION DOCK (Instant 1-Thumb Navigation) */}
      {/* ============================================================== */}
      <nav aria-label="Mobile Navigation Dock" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 px-3 py-2 flex justify-around items-center backdrop-blur-xl">
        {[
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'work', label: 'Work', icon: Briefcase },
          { id: 'intelligence', label: 'Intel', icon: Brain },
          { id: 'missions', label: 'Missions', icon: Compass },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectDomain(tab.id as PrimaryDomainId)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
                isActive ? 'text-brand-cyan font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? 'text-brand-cyan scale-110' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-mono text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <Menu className="w-4 h-4 text-gray-400" />
          <span>More (5)</span>
        </button>
      </nav>
    </>
  );
};
