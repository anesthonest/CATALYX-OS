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
  Play,
  Plus,
  MessageSquare,
  Building,
  DollarSign,
  Network
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
import { SystemHealthTruthWidget } from './SystemHealthTruthWidget';
import { QuickCreateModal } from './design-system/QuickCreateModal';
import { UniversalSearchModal } from './design-system/UniversalSearchModal';
import { OnboardingModal } from './design-system/OnboardingModal';

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
  tasks?: any[];
  children?: React.ReactNode;
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
  tasks,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    [activeDomain]: true
  });
  const [expandedSubsystems, setExpandedSubsystems] = useState(false);

  const domainGroups = v21ExperienceService.domainGroups;

  // Sync expanded domain with active domain
  useEffect(() => {
    setExpandedDomains(prev => ({
      ...prev,
      [activeDomain]: true
    }));
  }, [activeDomain]);

  // Keyboard shortcut listener: Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  // Render icons dynamically based on domain ID
  const renderDomainIcon = (id: PrimaryDomainId, className: string = 'w-4 h-4') => {
    switch (id) {
      case 'home': return <LayoutDashboard className={className} />;
      case 'work': return <Briefcase className={className} />;
      case 'collaborate': return <Users className={className} />;
      case 'business': return <Receipt className={className} />;
      case 'marketplace': return <ShoppingBag className={className} />;
      case 'intelligence': return <Brain className={className} />;
      case 'connections': return <Plug className={className} />;
      case 'system': return <Shield className={className} />;
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
  const currentSubItem = currentGroup?.subItems.find(s => s.id === activeTab) || currentGroup?.subItems[0];

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
      {/* 1. TOP HEADER BAR WITH CLEAN BREADCRUMBS, SEARCH, CREATE, & ROLE */}
      {/* ============================================================== */}
      <header className="px-4 sm:px-6 py-2.5 border-b border-white/10 flex justify-between items-center catalyx-surface-elevated sticky top-0 z-30 shrink-0">
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
              title="Navigate Back"
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
              title="Navigate Forward"
              aria-label="Go Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Logo & Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs font-mono truncate">
            <button
              onClick={() => onSelectDomain('home')}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group"
            >
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                C
              </span>
              <span className="font-display font-bold text-white tracking-wider text-sm">CATALYX</span>
              <span className="text-[9px] px-1 py-0.2 rounded catalyx-badge-gold">V26</span>
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
                <span className="text-amber-400 truncate font-semibold">
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
              className="bg-black/40 border border-white/10 text-gray-300 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
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

        {/* Right Controls: Create, Search, Ask AI, Health, Role, Notifications, Help, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Universal Search Trigger (Cmd + K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
            title="Search CATALYX (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-gray-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick "+ Create" Action Button (Gold Brand) */}
          <button
            onClick={() => setQuickCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl catalyx-btn-gold text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Create New Item (Project, Task, Document, Presentation, Store...)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>

          {/* Contextual Ask AI Button */}
          <button
            onClick={() => onOpenAskAi()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Ask CATALYX AI (Contextual & Actionable)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ask AI</span>
          </button>

          {/* Live System Health Truth Widget */}
          <SystemHealthTruthWidget />

          {/* User Trust Center Trigger */}
          {onOpenTrustCenter && (
            <button
              onClick={onOpenTrustCenter}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-all cursor-pointer shadow-sm"
              title="Open User Trust Center (Data Transparency & Integrity)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Trust</span>
            </button>
          )}

          {/* Advanced Mode Toggle */}
          {onToggleAdvancedMode && (
            <button
              onClick={onToggleAdvancedMode}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                isAdvancedMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-gray-200'
              }`}
              title="Toggle Advanced Telemetry"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdvancedMode ? 'ADVANCED' : 'SIMPLE'}</span>
            </button>
          )}

          {/* Role Lens Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
              className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
              aria-label="Current Role Lens"
            >
              <option value="EXECUTIVE" className="bg-slate-950 text-white">Executive</option>
              <option value="MANAGER" className="bg-slate-950 text-white">Manager</option>
              <option value="OPERATOR" className="bg-slate-950 text-white">Operator</option>
              <option value="DEVELOPER" className="bg-slate-950 text-white">Developer</option>
              <option value="RESEARCHER" className="bg-slate-950 text-white">Researcher</option>
              <option value="FINANCE" className="bg-slate-950 text-white">Finance</option>
              <option value="ADMIN" className="bg-slate-950 text-white">Admin</option>
            </select>
          </div>

          {/* Smart Notifications Bell */}
          <SmartNotifications userId={user.uid} />

          {/* Quick Help (?) Guide */}
          <button
            onClick={() => setOnboardingOpen(true)}
            className="p-1.5 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Getting Started & Platform Guide"
            aria-label="Help & Getting Started"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar / Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <button
              onClick={() => onSelectTab('profile')}
              className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
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
      {/* 2. DESKTOP UNIFIED BODY (LEFT SIDEBAR & MAIN VIEWPORT)         */}
      {/* ============================================================== */}
      <div className="flex-1 flex min-h-0 relative">
        <aside className="w-64 border-r border-white/10 catalyx-surface-card flex flex-col justify-between p-3.5 shrink-0 hidden md:flex h-[calc(100vh-53px)] sticky top-[53px]">
        {/* Navigation Group Items with Collapsible Progressive Disclosure */}
        <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 px-2.5 block mb-1.5">
              Work & Operations
            </span>

            {domainGroups.map((group) => {
              const isActiveDomain = activeDomain === group.id;
              const isExpanded = expandedDomains[group.id] ?? isActiveDomain;

              // Separate deep planetary foundation subsystems under Intelligence for progressive disclosure
              const isIntelligence = group.id === 'intelligence';
              const primaryItems = isIntelligence 
                ? group.subItems.slice(0, 9) 
                : group.subItems;
              const foundationSubsystems = isIntelligence 
                ? group.subItems.slice(9) 
                : [];

              return (
                <div key={group.id} className="space-y-0.5">
                  {/* Category Header Button */}
                  <button
                    onClick={() => {
                      onSelectDomain(group.id);
                      toggleDomain(group.id);
                    }}
                    className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActiveDomain
                        ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                        : 'bg-transparent border-transparent text-gray-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {renderDomainIcon(group.id, `w-4 h-4 ${isActiveDomain ? 'text-amber-400' : 'text-gray-400'}`)}
                      <span className="truncate">{group.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {group.badge && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          isActiveDomain 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {group.badge}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                    </div>
                  </button>

                  {/* Progressive Disclosure Sub-items */}
                  {isExpanded && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-white/10 ml-3.5 animate-fadeIn">
                      {primaryItems.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onSelectTab(sub.id)}
                            className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            {sub.versionBadge && (
                              <span className="text-[8px] font-mono px-1 rounded bg-black/40 text-gray-400 border border-white/10">
                                {sub.versionBadge}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Expandable Advanced Subsystems for Intelligence */}
                      {foundationSubsystems.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSubsystems(prev => !prev);
                            }}
                            className="w-full text-left py-1 px-2 rounded text-[11px] font-mono text-gray-500 hover:text-amber-400 flex items-center justify-between cursor-pointer hover:bg-white/5"
                          >
                            <span>Subsystems (V9–V19)</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedSubsystems ? 'rotate-180' : ''}`} />
                          </button>

                          {expandedSubsystems && (
                            <div className="pl-2 space-y-0.5 pt-0.5">
                              {foundationSubsystems.map((sub) => {
                                const isSubActive = activeTab === sub.id;
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => onSelectTab(sub.id)}
                                    className={`w-full flex items-center justify-between py-1 px-2 rounded text-[11px] text-left transition-all cursor-pointer ${
                                      isSubActive
                                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate">{sub.label}</span>
                                    {sub.versionBadge && (
                                      <span className="text-[7px] font-mono px-1 rounded bg-black/50 text-gray-500">
                                        {sub.versionBadge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: User status, Reality badge & Trust Center */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div>
              <span className="text-white font-semibold flex items-center gap-1 leading-tight">
                {user.username || 'Commander'}
                {user.premium && '👑'}
              </span>
              <span className="text-[9px] font-mono text-gray-500 tracking-wide uppercase">
                {activeRole} • Lvl {user.level}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {user.streak}d Streak
            </span>
          </div>

          <button
            onClick={onOpenTrustCenter}
            className="w-full p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-emerald-500/25 flex items-center justify-between text-[9px] font-mono text-gray-300 transition-colors cursor-pointer"
            title="Open User Trust Center"
          >
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM VERIFIED
            </span>
            <span className="text-gray-500 font-semibold">V26 RELEASE</span>
          </button>
        </div>
      </aside>

        {/* Main Viewport Content Area */}
        {children}
      </div>

      {/* ============================================================== */}
      {/* 3. MOBILE SLIDE-OUT DRAWER FOR ALL 8 DOMAINS */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex">
          <div className="w-72 catalyx-surface-elevated h-full p-4 flex flex-col justify-between border-r border-white/10 shadow-2xl animate-slideRight">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs">
                    C
                  </span>
                  <span className="font-display font-bold text-white tracking-wider">
                    CATALYX <span className="text-amber-400 text-xs font-mono">V26</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Create Button in Mobile Menu */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQuickCreateOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Item</span>
              </button>

              {/* Role Switcher in Mobile Drawer */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Perspective Lens</span>
                <select
                  value={activeRole}
                  onChange={(e) => onRoleChange(e.target.value as UserPersonaRole)}
                  className="w-full bg-slate-900 text-xs font-semibold text-amber-400 border border-white/10 rounded-lg p-1.5"
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
                            ? 'bg-amber-500/20 border-amber-500/50 text-white'
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
                                  ? 'text-amber-400 font-bold bg-amber-500/10' 
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

            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOnboardingOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Platform Guide & Help</span>
              </button>

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
      <nav aria-label="Mobile Navigation Dock" className="md:hidden fixed bottom-0 left-0 right-0 z-40 catalyx-surface-elevated border-t border-white/10 px-3 py-1.5 flex justify-around items-center">
        <button
          onClick={() => onSelectDomain('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
            activeDomain === 'home' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeDomain === 'home' ? 'text-amber-400 scale-110' : 'text-gray-400'}`} />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectDomain('work')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
            activeDomain === 'work' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeDomain === 'work' ? 'text-amber-400 scale-110' : 'text-gray-400'}`} />
          <span>Work</span>
        </button>

        {/* Center Prominent Create Button */}
        <button
          onClick={() => setQuickCreateOpen(true)}
          className="flex flex-col items-center gap-0.5 -mt-3 py-1 px-2.5 cursor-pointer group"
          title="Create New"
        >
          <div className="w-10 h-10 rounded-full catalyx-btn-gold flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">Create</span>
        </button>

        <button
          onClick={() => onSelectDomain('collaborate')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
            activeDomain === 'collaborate' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className={`w-4 h-4 ${activeDomain === 'collaborate' ? 'text-amber-400 scale-110' : 'text-gray-400'}`} />
          <span>Teams</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-mono text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <Menu className="w-4 h-4 text-gray-400" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      <QuickCreateModal 
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onNavigate={(tab) => {
          onSelectTab(tab);
          setQuickCreateOpen(false);
        }}
      />

      <UniversalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => {
          onSelectTab(tab);
          setSearchOpen(false);
        }}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onNavigate={(tab) => {
          onSelectTab(tab);
          setOnboardingOpen(false);
        }}
        onOpenAskAi={onOpenAskAi}
        userName={user.username || 'Commander'}
      />
    </>
  );
};
