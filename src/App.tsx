import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, Task, AIMessage, Workspace, 
  WorkspaceMember, WorkspaceTask, WorkspaceMessage, 
  WorkspaceInvite, ACHIEVEMENTS, Achievement,
  PrimaryDomainId, UserPersonaRole
} from './types';
import { dbService, registerNotifications } from './firebase';
import { v21ExperienceService } from './services/v21ExperienceService';
import { authService } from './services/authService';
import { AuthLandingPage } from './components/auth/AuthLandingPage';

// V21 Unified Intelligence Experience Components
import { UnifiedHomeV21 } from './components/UnifiedHomeV21';
import { UnifiedNavigationV21 } from './components/UnifiedNavigationV21';
import { DomainSubNavV21 } from './components/DomainSubNavV21';
import { AskCatalyxContextualModal } from './components/AskCatalyxContextualModal';

// V22 Reality, Explainability & User Trust Components
import { UserTrustCenterModal } from './components/UserTrustCenterModal';
import { UniversalObjectInspectorModal } from './components/UniversalObjectInspectorModal';
import { realityEngineService } from './services/realityEngineService';

// Tab Components
import { DashboardTab } from './components/DashboardTab';
import { TasksTab } from './components/TasksTab';
import { AICoachTab } from './components/AICoachTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { ProfileTab } from './components/ProfileTab';
import { CivilizationConsole } from './components/CivilizationConsole';

// Work Submodules
import { FocusCabin } from './components/FocusCabin';
import { GoalCenter } from './components/GoalCenter';
import { ProjectBoard } from './components/ProjectBoard';
import { AdminPortal } from './components/AdminPortal';

// V8 Universal Intelligence Infrastructure Components
import { ExecutiveIntelligenceTab } from './components/ExecutiveIntelligenceTab';
import { AIWorkforceTab } from './components/AIWorkforceTab';
import { OrchestrationTab } from './components/OrchestrationTab';
import { WorkflowsTab } from './components/WorkflowsTab';
import { ApprovalsQueueTab } from './components/ApprovalsQueueTab';
import { BusinessTwinTab } from './components/BusinessTwinTab';
import { KnowledgeUniverseTab } from './components/KnowledgeUniverseTab';
import { BillingPesapalTab } from './components/BillingPesapalTab';
import { GovernanceAuditTab } from './components/GovernanceAuditTab';
import { IntegrationsTab } from './components/IntegrationsTab';

// V8.1 Commercial & Governance Intelligence Components
import { CommercialIntelligenceTab } from './components/CommercialIntelligenceTab';
import { AISafetyFirewallTab } from './components/AISafetyFirewallTab';
import { FinancialReconciliationTab } from './components/FinancialReconciliationTab';
import { MarketplaceApiTab } from './components/MarketplaceApiTab';

// V9 Autonomous Enterprise Intelligence & Execution
import { AutonomousIntelligenceV9Tab } from './components/AutonomousIntelligenceV9Tab';

// V10 Global Intelligence Ecosystem & Autonomous Coordination Platform
import { GlobalIntelligenceV10Tab } from './components/GlobalIntelligenceV10Tab';

// V11 Autonomous Economic & Organizational Intelligence Platform
import { EconomicIntelligenceV11Tab } from './components/EconomicIntelligenceV11Tab';

// V12 Global Intelligence Commerce & Platform Infrastructure
import { GlobalCommerceV12Tab } from './components/GlobalCommerceV12Tab';

// V13 Global Autonomous Enterprise Network
import { GlobalAutonomousEnterpriseNetworkV13Tab } from './components/GlobalAutonomousEnterpriseNetworkV13Tab';

// V14 Global Intelligence Economy
import { GlobalIntelligenceEconomyV14Tab } from './components/GlobalIntelligenceEconomyV14Tab';

// V15 Global Autonomous Intelligence Infrastructure
import { GlobalAutonomousIntelligenceInfrastructureV15Tab } from './components/GlobalAutonomousIntelligenceInfrastructureV15Tab';

// V16 Global Autonomous Industry & Scientific Intelligence
import { GlobalAutonomousIndustryScientificIntelligenceV16Tab } from './components/GlobalAutonomousIndustryScientificIntelligenceV16Tab';

// V17 Global Autonomous Intelligence Network
import { GlobalAutonomousIntelligenceNetworkV17Tab } from './components/GlobalAutonomousIntelligenceNetworkV17Tab';

// V18 Global Intelligence Coordination & Autonomous Ecosystem OS
import { GlobalEcosystemOperatingSystemV18Tab } from './components/GlobalEcosystemOperatingSystemV18Tab';

// V19 Planetary-Scale Intelligence, Simulation & Autonomous Coordination Platform
import { PlanetaryIntelligenceFabricV19Tab } from './components/PlanetaryIntelligenceFabricV19Tab';

// V20 Final Production Release & Certification
import { ProductionCertificationV20Tab } from './components/ProductionCertificationV20Tab';

// V23 Universal Operating System Components
import { WorkerCenterView } from './components/WorkerCenterView';
import { UnifiedSocialInboxView } from './components/UnifiedSocialInboxView';
import { UnifiedCommerceView } from './components/UnifiedCommerceView';
import { ConnectionsCenterView } from './components/ConnectionsCenterView';
import { V23ProductionCertificationDossier } from './components/V23ProductionCertificationDossier';

// V24 Final Universal Navigation, Collaboration, Sharing & Link-Integrity Components
import { PresentationsHubView } from './components/PresentationsHubView';
import { MediaStudioView } from './components/MediaStudioView';
import { DemosPrototypesView } from './components/DemosPrototypesView';
import { MeetingsHubView } from './components/MeetingsHubView';
import { UniversalFilesHubView } from './components/UniversalFilesHubView';
import { V24CertificationView } from './components/V24CertificationView';
import { navigationRouterService } from './services/navigationRouterService';

// V25 Universal Work, Collaboration & Certification Components
import { UniversalWorkHubView } from './components/UniversalWorkHubView';
import { PartnershipCollaborationView } from './components/PartnershipCollaborationView';
import { V25CertificationView } from './components/V25CertificationView';
import { MarketplaceHubView } from './components/MarketplaceHubView';
import { DeepResearchView } from './components/research/DeepResearchView';
import { AdvertisingHubView } from './components/advertising/AdvertisingHubView';
import { ProfessionalServicesView } from './components/services/ProfessionalServicesView';
import { MarketplaceSettingsTab } from './components/marketplace/MarketplaceSettingsTab';

// Production Legal, Governance & Compliance Components
import { TermsAcceptanceGuard } from './components/legal/TermsAcceptanceGuard';
import { LegalDocumentView } from './components/legal/LegalDocumentView';
import { LegalCenterTab } from './components/legal/LegalCenterTab';
import { AppFooter } from './components/legal/AppFooter';
import { LegalPolicyService } from './services/legal/legalPolicyService';
import { MissionControlView } from './components/MissionControlView';

// V2 Common Components
import { CommandPalette } from './components/CommandPalette';
import { SmartNotifications } from './components/SmartNotifications';

// Icons
import { 
  Bot, CheckSquare, BarChart3, Users, Trophy, User, 
  LogOut, Plus, ChevronRight, Sparkles, Brain, Zap, Trash2, ShieldAlert, Award, Globe,
  Cpu, Sliders, ShieldCheck, Layers, BookOpen, CreditCard, Plug, Shield, GitBranch, Activity,
  TrendingUp, ShoppingBag, Receipt, Scale, Compass, DollarSign, Network, Radio, Microscope
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuestBrowsingMarketplace, setIsGuestBrowsingMarketplace] = useState(false);

  // V21 Unified Navigation Architecture state
  const [activeDomain, setActiveDomain] = useState<PrimaryDomainId>('home');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeRole, setActiveRole] = useState<UserPersonaRole>(() => {
    try {
      const saved = localStorage.getItem('catalyx_v21_role');
      if (saved) return saved as UserPersonaRole;
    } catch {
      // ignore
    }
    return 'EXECUTIVE';
  });
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [askAiPrompt, setAskAiPrompt] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // V22 Reality Engine & Trust Center state
  const [isTrustCenterOpen, setIsTrustCenterOpen] = useState(false);
  const [inspectedObject, setInspectedObject] = useState<any | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('catalyx_v22_advanced_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAdvancedMode = () => {
    setIsAdvancedMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('catalyx_v22_advanced_mode', String(next));
      } catch {}
      return next;
    });
  };

  const handleRoleChange = (role: UserPersonaRole) => {
    setActiveRole(role);
    try {
      localStorage.setItem('catalyx_v21_role', role);
    } catch {
      // ignore
    }
  };

  const handleSelectTab = (tabId: string, itemId?: string) => {
    setActiveTab(tabId);
    const domain = v21ExperienceService.getDomainForTab(tabId);
    setActiveDomain(domain);
    navigationRouterService.pushRoute({ domain, tab: tabId, item: itemId });
  };

  const handleSelectDomain = (domainId: PrimaryDomainId) => {
    setActiveDomain(domainId);
    const group = v21ExperienceService.domainGroups.find(g => g.id === domainId);
    if (group && group.subItems.length > 0) {
      const primary = group.subItems.find(s => s.isPrimary) || group.subItems[0];
      setActiveTab(primary.id);
      navigationRouterService.pushRoute({ domain: domainId, tab: primary.id });
    }
  };

  // Business state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [activeMembers, setActiveMembers] = useState<WorkspaceMember[]>([]);
  const [activeTasks, setActiveTasks] = useState<WorkspaceTask[]>([]);
  const [activeMessages, setWorkspaceMessages] = useState<WorkspaceMessage[]>([]);
  const [listOfInvites, setListOfInvites] = useState<WorkspaceInvite[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);

  // Telemetry AI state
  const [activeQuote, setActiveQuote] = useState({ quote: 'To execute is to command circumstance itself.', tip: 'Commit to completing any pending tasks in your planner right now.' });
  const [isCoachSending, setIsCoachSending] = useState(false);

  // Micro Notification/Gamification Overlays
  const [achievementAlert, setAchievementAlert] = useState<{ show: boolean; name: string; badge: string }>({ show: false, name: '', badge: '' });
  const [levelUpAlert, setLevelUpAlert] = useState<{ show: boolean; level: number }>({ show: false, level: 1 });

  // 1. Initial State mount & setup
  useEffect(() => {
    // Register real-time alert hooks
    registerNotifications(
      (title, emoji) => {
        setAchievementAlert({ name: title, badge: emoji, show: true });
        setTimeout(() => setAchievementAlert(prev => ({ ...prev, show: false })), 4000);
      },
      (lvl) => {
        setLevelUpAlert({ level: lvl, show: true });
        setTimeout(() => setLevelUpAlert(prev => ({ ...prev, show: false })), 5000);
      }
    );

    // Auto load current session or verify via authoritative auth endpoint
    const initSession = async () => {
      try {
        const sessionToken = localStorage.getItem('catalyx_session_token');
        if (sessionToken) {
          const res = await fetch('/api/auth/me', {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              const prof = await dbService.getUserProfile(data.user.uid) || await dbService.registerUser(data.user.username, data.user.email);
              setUser(prof);
              loadUserData(prof.uid);
              return;
            }
          }
        }
      } catch {
        // Fallback to local session if server offline
      }

      const currentId = dbService.getCurrentUserId();
      if (currentId) {
        loadUserData(currentId);
      }
    };

    initSession();

    // Subscribe to browser navigation events
    const unsubRouter = navigationRouterService.onPopState((route) => {
      setActiveDomain(route.domain);
      setActiveTab(route.tab);
    });

    // Check initial route params (e.g. ?domain=work&tab=presentations or ?shareToken=xyz)
    const initialRoute = navigationRouterService.getCurrentRoute();
    if (initialRoute.tab && initialRoute.tab !== 'home') {
      setActiveTab(initialRoute.tab);
      setActiveDomain(initialRoute.domain);
    }

    return () => {
      unsubRouter();
    };
  }, []);

  // 2. Fetch/Refreshes all relevant records for logged executive
  const loadUserData = async (uid: string) => {
    const prof = await dbService.getUserProfile(uid);
    if (prof) {
      setUser(prof);
      
      // Personal task archives
      const userTasks = await dbService.getTasks(uid);
      setTasks(userTasks);

      // AI Coach context
      const chatLogs = await dbService.getAIMessages(uid);
      setAiMessages(chatLogs);

      // Workspaces logs
      const wsList = await dbService.getWorkspaces(uid);
      setWorkspaces(wsList);
      
      // Load global workspace invites targeting this user's mail
      const invites = await dbService.getInvites(prof.email);
      setListOfInvites(invites);

      // Leaderboard rankings list
      const ranking = await dbService.getLeaderboard();
      setLeaderboard(ranking);

      // Load Daily Advice Metrics
      try {
        const response = await fetch('/api/daily-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: prof.username, score: prof.executionScore, level: prof.level })
        });
        const quoteObj = await response.json();
        if (quoteObj && quoteObj.quote) {
          setActiveQuote(quoteObj);
        }
      } catch (err) {
        console.warn('Daily intelligence microservice offline. Using heuristic fallback.', err);
      }
    }
  };

  // Sync workspace subcollections when an active room selection changes
  useEffect(() => {
    if (activeWorkspace) {
      refreshWorkspaceData(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const refreshWorkspaceData = async (wsId: string) => {
    const members = await dbService.getWorkspaceMembers(wsId);
    const wTasks = await dbService.getWorkspaceTasks(wsId);
    const wMsg = await dbService.getWorkspaceMessages(wsId);
    setActiveMembers(members);
    setActiveTasks(wTasks);
    setWorkspaceMessages(wMsg);
  };

  // --- ACTIONS TRICOLOR DISPATCHERS ---

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('catalyx_session_token');
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-session-token': sessionToken }
        });
      }
    } catch {}
    localStorage.removeItem('catalyx_session_token');
    await authService.logout();
    setUser(null);
    setIsGuestBrowsingMarketplace(false);
    setActiveWorkspace(null);
    navigationRouterService.pushRoute({ domain: 'home', tab: 'home' });
  };

  // --- PERSONAL TASKS INTERFACES ---
  const handleAddTask = async (text: string) => {
    if (!user) return;
    const newTasks = await dbService.addTask(user.uid, text);
    setTasks(newTasks);
    refreshLeaderboardAndProfile();
  };

  const handleCompleteTask = async (id: string) => {
    if (!user) return;
    const newTasks = await dbService.completeTask(user.uid, id);
    setTasks(newTasks);
    refreshLeaderboardAndProfile();
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    const newTasks = await dbService.deleteTask(user.uid, id);
    setTasks(newTasks);
    refreshLeaderboardAndProfile();
  };

  // --- UTILS TO KEEP GRAPH INDEX FRESH ---
  const refreshLeaderboardAndProfile = async () => {
    if (!user) return;
    const updatedUser = await dbService.getUserProfile(user.uid);
    if (updatedUser) {
      setUser(updatedUser);
    }
    const list = await dbService.getLeaderboard();
    setLeaderboard(list);
  };

  // --- AI COACH DIRECT DIALOG INTERFACE ---
  const handleSendMessageToCoach = async (text: string, agentId?: string) => {
    if (!user) return;
    
    // Add user message to state & storage
    const userMsg = await dbService.addAIMessage(user.uid, 'user', text);
    setAiMessages(prev => [...prev, userMsg]);
    setIsCoachSending(true);

    try {
      const historyPayload = aiMessages.map(m => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        text: m.message
      }));

      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          message: text,
          history: historyPayload,
          username: user.username,
          level: user.level,
          xp: user.xp,
          score: user.executionScore,
          streak: user.streak,
          agentId
        })
      });

      const body = await res.json();
      const aiReplyText = body.aiMessage || "Analysis sequence timing expired. Secure physical tracking.";
      
      const aiMsg = await dbService.addAIMessage(user.uid, 'ai', aiReplyText);
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errReply = await dbService.addAIMessage(user.uid, 'ai', "Strategic desynchronization. Ensure net connection is secure before pinging CATALYX AI again.");
      setAiMessages(prev => [...prev, errReply]);
    } finally {
      setIsCoachSending(false);
    }
  };

  const handleClearCoachHistory = async () => {
    if (!user) return;
    await dbService.clearAIMessages(user.uid);
    const cleanLogs = await dbService.getAIMessages(user.uid);
    setAiMessages(cleanLogs);
  };

  // --- TEAM WORKSPACES INTERFACES ---
  const handleCreateWorkspaceInApp = async (name: string) => {
    if (!user) return;
    const newWSObj = await dbService.createWorkspace(user.uid, name);
    setWorkspaces(prev => [...prev, newWSObj]);
    setActiveWorkspace(newWSObj); // Auto Open
  };

  const handleAddWorkspaceTaskInApp = async (text: string) => {
    if (!activeWorkspace) return;
    const list = await dbService.addWorkspaceTask(activeWorkspace.id, text);
    setActiveTasks(list);
  };

  const handleCompleteWorkspaceTaskInApp = async (taskId: string) => {
    if (!activeWorkspace || !user) return;
    const list = await dbService.completeWorkspaceTask(activeWorkspace.id, taskId, user.uid);
    setActiveTasks(list);
    
    // Send auto messaging feedback in Team chat indicating progress secured
    const progressText = `🎯 MICRO-SPRINT ACHIEVED! User "${user.username}" successfully completed workspace sprint: "${list.find(t => t.id === taskId)?.text || ''}". Platform distributed +15 XP.`;
    const chatList = await dbService.addWorkspaceMessage(activeWorkspace.id, 'ai', 'CATALYX AI Scout', progressText, true);
    setWorkspaceMessages(chatList);

    refreshLeaderboardAndProfile();
  };

  const handleSendWorkspaceMsgInApp = async (text: string) => {
    if (!activeWorkspace || !user) return;
    const chatList = await dbService.addWorkspaceMessage(activeWorkspace.id, user.uid, user.username, text);
    setWorkspaceMessages(chatList);
  };

  // --- INVITION HANDLERS ---
  const handleAcceptInvite = async (inviteId: string) => {
    if (!user) return;
    await dbService.acceptInvite(inviteId, user.uid);
    
    // Refresh workspaces list
    const list = await dbService.getWorkspaces(user.uid);
    setWorkspaces(list);

    // Refresh active invites list
    const invites = await dbService.getInvites(user.email);
    setListOfInvites(invites);
  };

  const handleDeclineInvite = async (inviteId: string) => {
    if (!user) return;
    await dbService.declineInvite(inviteId);
    const invites = await dbService.getInvites(user.email);
    setListOfInvites(invites);
  };

  // --- PREMIUM UPGRADES FLAG ---
  const handleUpgradeAccount = async () => {
    if (!user) return;
    // Set premium: true
    const profObj = await dbService.updateUserProfile(user.uid, { premium: true });
    setUser(profObj);
  };

  // --- CHANGE USERNAME IN-APP ---
  const handleUpdateUsernameInApp = async (newName: string) => {
    if (!user) return;
    const profObj = await dbService.updateUserProfile(user.uid, { username: newName });
    setUser(profObj);
  };

  // --- RENDER APP LAYOUT VIEWS ---
  const renderActiveViewContent = () => {
    if (!user) return null;
    
    switch (activeTab) {
      case 'home':
        return (
          <UnifiedHomeV21
            user={user}
            tasks={tasks}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onNavigate={handleSelectTab}
            onOpenAskAi={(prompt) => {
              setAskAiPrompt(prompt || '');
              setIsAskAiOpen(true);
            }}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        );
      case 'project-board':
        return <ProjectBoard userId={user.uid} />;
      case 'goals':
        return <GoalCenter userId={user.uid} onGoalUpdated={() => loadUserData(user.uid)} />;
      case 'focus':
        return <FocusCabin userId={user.uid} onFocusLogged={() => loadUserData(user.uid)} />;
      case 'admin-portal':
        return <AdminPortal user={user} onRefreshProfileAndSystem={() => loadUserData(user.uid)} />;
      case 'civilization':
        return (
          <CivilizationConsole
            user={user}
            onRefreshSystem={() => loadUserData(user.uid)}
          />
        );
      case 'dashboard':
        return (
          <DashboardTab
            user={user}
            activeQuote={activeQuote}
            completedCount={tasks.filter(t => t.completed).length}
            totalCount={tasks.length}
            onNavigate={handleSelectTab}
            onRefreshSystem={() => loadUserData(user.uid)}
          />
        );
      case 'tasks':
        return (
          <TasksTab
            tasks={tasks}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            username={user.username}
          />
        );
      case 'ai-coach':
        return (
          <AICoachTab
            user={user}
            aiMessages={aiMessages}
            onSendMessage={handleSendMessageToCoach}
            onClearHistory={handleClearCoachHistory}
            isSending={isCoachSending}
          />
        );
      case 'analytics':
        return (
          <AnalyticsTab
            user={user}
            tasks={tasks}
          />
        );
      case 'workspace':
        return (
          <WorkspaceTab
            user={user}
            workspaces={workspaces}
            onCreateWorkspace={handleCreateWorkspaceInApp}
            onSelectWorkspace={(ws) => setActiveWorkspace(ws)}
            activeWorkspace={activeWorkspace}
            activeMembers={activeMembers}
            activeTasks={activeTasks}
            activeMessages={activeMessages}
            onAddWorkspaceTask={handleAddWorkspaceTaskInApp}
            onCompleteWorkspaceTask={handleCompleteWorkspaceTaskInApp}
            onSendWorkspaceMessage={handleSendWorkspaceMsgInApp}
            listOfInvites={listOfInvites}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
          />
        );
      case 'leaderboard':
        return <LeaderboardTab leaderboard={leaderboard} />;
      case 'profile':
        return (
          <ProfileTab
            user={user}
            onUpgrade={handleUpgradeAccount}
            onUpdateUsername={handleUpdateUsernameInApp}
            onUserUpdated={(updated) => setUser(updated)}
            onLogout={handleLogout}
          />
        );
      // V8 Universal Intelligence Infrastructure Modules
      case 'executive-brief':
        return <ExecutiveIntelligenceTab orgId={user.uid} />;
      case 'ai-workforce':
        return <AIWorkforceTab orgId={user.uid} />;
      case 'orchestration':
        return <OrchestrationTab orgId={user.uid} userEmail={user.email} />;
      case 'workflows':
        return <WorkflowsTab orgId={user.uid} userEmail={user.email} />;
      case 'approvals':
        return <ApprovalsQueueTab orgId={user.uid} userEmail={user.email} />;
      case 'digital-twin':
        return <BusinessTwinTab orgId={user.uid} />;
      case 'knowledge':
        return <KnowledgeUniverseTab orgId={user.uid} userEmail={user.email} />;
      case 'billing':
        return <BillingPesapalTab orgId={user.uid} userEmail={user.email} />;
      case 'governance':
        return <GovernanceAuditTab orgId={user.uid} userEmail={user.email} />;
      case 'legal-center':
        return <LegalCenterTab currentUserEmail={user.email} onViewDocument={(slug) => handleSelectTab(slug)} />;
      case 'legal':
      case 'terms':
      case 'privacy':
      case 'refunds':
      case 'payments':
      case 'payouts':
      case 'acceptable-use':
      case 'intellectual-property':
      case 'copyright':
      case 'community-guidelines':
      case 'marketplace-policy':
        return (
          <LegalDocumentView
            initialSlug={activeTab === 'legal' ? 'terms' : activeTab}
            userEmail={user.email}
            onNavigateToDocument={(slug) => handleSelectTab(slug)}
            onClose={() => handleSelectTab('home')}
          />
        );
      case 'mission-control':
      case 'system-health':
      case 'operations-center':
      case 'system-status':
        return (
          <MissionControlView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'integrations':
        return <IntegrationsTab orgId={user.uid} />;
      // V8.1 Commercial, Economic & Safety Infrastructure
      case 'commercial-ops':
        return <CommercialIntelligenceTab organizationId={user.uid} />;
      case 'ai-firewall':
        return <AISafetyFirewallTab organizationId={user.uid} currentUserEmail={user.email} />;
      case 'reconciliation':
        return <FinancialReconciliationTab organizationId={user.uid} currentUserEmail={user.email} />;
      case 'marketplace':
      case 'marketplace-hub':
        return (
          <MarketplaceHubView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'marketplace-api':
        return <MarketplaceApiTab organizationId={user.uid} currentUserEmail={user.email} />;
      case 'deep-research':
      case 'research':
        return (
          <DeepResearchView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'advertising':
      case 'ads':
        return (
          <AdvertisingHubView
            user={user}
            activeRole={activeRole}
          />
        );
      case 'services':
      case 'professional-services':
        return (
          <ProfessionalServicesView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'marketplace-settings':
      case 'rate-policy':
        return (
          <MarketplaceSettingsTab
            user={user}
            activeRole={activeRole}
          />
        );
      // V23 Universal Workspace, Workforce, Social Connectivity, Commerce & Intelligence OS
      case 'worker-center':
        return (
          <WorkerCenterView
            user={user}
            tasks={tasks}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
            onTaskToggle={handleCompleteTask}
          />
        );
      case 'social-inbox':
        return (
          <UnifiedSocialInboxView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
            onOpenTaskModal={() => {
              handleSelectTab('tasks');
            }}
          />
        );
      case 'unified-commerce':
        return (
          <UnifiedCommerceView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'connections':
        return (
          <ConnectionsCenterView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      // V25 Universal Work, Collaboration & Certification Release
      case 'universal-work':
        return (
          <UniversalWorkHubView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'partnerships':
        return (
          <PartnershipCollaborationView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'v25-certification':
        return (
          <V25CertificationView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      // V24 Final Universal Navigation, Collaboration, Sharing & Link-Integrity Release
      case 'presentations':
        return (
          <PresentationsHubView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'media':
        return (
          <MediaStudioView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'demos':
        return (
          <DemosPrototypesView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'meetings':
        return (
          <MeetingsHubView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
            onTaskCreated={() => {
              loadUserData(user.uid);
            }}
          />
        );
      case 'files':
        return (
          <UniversalFilesHubView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'v24-certification':
        return (
          <V24CertificationView
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      case 'v23-certification':
        return (
          <V23ProductionCertificationDossier
            user={user}
            activeRole={activeRole}
            onNavigate={handleSelectTab}
          />
        );
      // V20 Final Production Release & Certification
      case 'v20-production-release':
        return <ProductionCertificationV20Tab />;
      // V19 Planetary-Scale Intelligence, Simulation & Autonomous Coordination Platform
      case 'v19-planetary-fabric':
        return <PlanetaryIntelligenceFabricV19Tab />;
      // V18 Global Intelligence Coordination & Autonomous Ecosystem OS
      case 'v18-ecosystem-os':
        return <GlobalEcosystemOperatingSystemV18Tab />;
      // V17 Global Autonomous Intelligence Network
      case 'v17-global-network':
        return <GlobalAutonomousIntelligenceNetworkV17Tab organizationId={user.uid} userEmail={user.email} />;
      // V16 Global Autonomous Industry & Scientific Intelligence
      case 'v16-industry-science':
        return <GlobalAutonomousIndustryScientificIntelligenceV16Tab organizationId={user.uid} userEmail={user.email} />;
      // V15 Global Autonomous Intelligence Infrastructure
      case 'v15-infrastructure':
        return <GlobalAutonomousIntelligenceInfrastructureV15Tab organizationId={user.uid} userEmail={user.email} />;
      // V14 Global Intelligence Economy
      case 'v14-economy':
        return <GlobalIntelligenceEconomyV14Tab organizationId={user.uid} userEmail={user.email} />;
      // V13 Global Autonomous Enterprise Network (GAEN)
      case 'v13-network':
        return <GlobalAutonomousEnterpriseNetworkV13Tab organizationId={user.uid} userEmail={user.email} />;
      // V12 Global Intelligence Commerce & Platform Infrastructure
      case 'v12-commerce':
        return <GlobalCommerceV12Tab organizationId={user.uid} userEmail={user.email} />;
      // V11 Autonomous Economic & Organizational Intelligence Platform
      case 'v11-intelligence':
        return <EconomicIntelligenceV11Tab organizationId={user.uid} userEmail={user.email} />;
      // V10 Global Intelligence Ecosystem & Autonomous Coordination Platform
      case 'global-intelligence':
        return <GlobalIntelligenceV10Tab organizationId={user.uid} userEmail={user.email} />;
      // V9 Autonomous Enterprise Intelligence & Execution
      case 'autonomous-os':
        return <AutonomousIntelligenceV9Tab organizationId={user.uid} userEmail={user.email} />;
      default:
        return (
          <UnifiedHomeV21
            user={user}
            tasks={tasks}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onNavigate={handleSelectTab}
            onOpenAskAi={(prompt) => {
              setAskAiPrompt(prompt || '');
              setIsAskAiOpen(true);
            }}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        );
    }
  };

  const renderActiveView = () => {
    return (
      <TermsAcceptanceGuard
        currentUser={user}
        onTermsAccepted={async (version) => {
          if (!user) return;
          const updated = await dbService.updateUserTermsAcceptance(user.uid, version);
          setUser(updated);
        }}
        onNavigateToLegal={(slug) => handleSelectTab(slug)}
      >
        <div className="space-y-4">
          {activeTab !== 'home' && (
            <DomainSubNavV21
              activeDomain={activeDomain}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
            />
          )}
          {renderActiveViewContent()}
        </div>
      </TermsAcceptanceGuard>
    );
  };

  // --- AUTHENTICATION INTERFACE IF NO ACTIVE SESSION ---
  if (!user) {
    if (isGuestBrowsingMarketplace) {
      const guestUser: UserProfile = {
        uid: 'guest_observer',
        username: 'Guest Observer',
        email: 'guest@catalyx.vinexsah.io',
        createdAt: new Date().toISOString(),
        executionScore: 0,
        streak: 0,
        focusScore: 0,
        consistencyScore: 0,
        momentumScore: 0,
        xp: 0,
        premium: false,
        level: 1,
        achievements: [],
        termsAcceptedVersion: LegalPolicyService.CURRENT_VERSION,
        termsAcceptedAt: new Date().toISOString()
      };
      return (
        <div className="min-h-screen bg-[#020617] text-gray-200 flex flex-col font-sans">
          {/* Guest Marketplace Navigation Bar */}
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#030712]/90 border-b border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1px]">
                  <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-cyan" />
                  </div>
                </div>
                <div>
                  <div className="font-display font-bold text-base text-white tracking-widest leading-none">
                    CATA<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">LYX</span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                    PUBLIC INTELLIGENCE MARKETPLACE
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsGuestBrowsingMarketplace(false)}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow transition-all cursor-pointer"
                >
                  SIGN IN / REGISTER TO TRANSACT
                </button>
              </div>
            </div>
          </header>

          {/* Guest Advisory Banner */}
          <div className="bg-brand-purple/10 border-b border-brand-purple/20 px-4 py-2.5 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-brand-purple" />
            <span>Public Catalog Preview Mode: You are viewing verified intelligence items and agents. Authenticate to purchase or deploy.</span>
            <button
              onClick={() => setIsGuestBrowsingMarketplace(false)}
              className="text-brand-cyan font-bold hover:underline cursor-pointer ml-1"
            >
              Sign In Now →
            </button>
          </div>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
            <MarketplaceHubView
              user={guestUser}
              activeRole={activeRole}
              onNavigate={(tab) => {
                if (tab !== 'marketplace') {
                  setIsGuestBrowsingMarketplace(false);
                }
              }}
            />
          </main>
          <AppFooter onNavigateToLegal={() => {}} />
        </div>
      );
    }

    return (
      <AuthLandingPage
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          loadUserData(authenticatedUser.uid);
        }}
        onExploreMarketplace={() => setIsGuestBrowsingMarketplace(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 flex flex-col font-sans">
      {/* 1. V21/V22 UNIFIED NAVIGATION (TOP HEADER & DESKTOP SIDEBAR & MOBILE DOCK) */}
      <UnifiedNavigationV21
        user={user}
        activeDomain={activeDomain}
        activeTab={activeTab}
        activeRole={activeRole}
        onSelectDomain={handleSelectDomain}
        onSelectTab={handleSelectTab}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onOpenAskAi={(prompt) => {
          setAskAiPrompt(prompt || "");
          setIsAskAiOpen(true);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTrustCenter={() => setIsTrustCenterOpen(true)}
        isAdvancedMode={isAdvancedMode}
        onToggleAdvancedMode={handleToggleAdvancedMode}
        tasks={tasks}
      >
        <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-53px)] overflow-y-auto pb-16 md:pb-6">
          <section className="flex-1 p-4 sm:p-6 relative max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </section>
          <AppFooter onNavigateToLegal={(slug) => handleSelectTab(slug)} />
        </main>
      </UnifiedNavigationV21>

      {/* 3. CONTEXTUAL ASK CATALYX MODAL (V22 REALITY & EXECUTION ENABLED) */}
      <AskCatalyxContextualModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        activeTab={activeTab}
        activeRole={activeRole}
        initialPrompt={askAiPrompt}
        onNavigate={handleSelectTab}
        onDataMutated={() => {
          if (user) loadUserData(user.uid);
        }}
        userEmail={user?.email}
        userId={user?.uid}
      />

      {/* 4. COMMAND PALETTE MODAL */}
      <CommandPalette
        tasks={tasks}
        onNavigate={handleSelectTab}
        onSelectTask={() => handleSelectTab("tasks")}
        isOpenExternal={isCommandPaletteOpen}
        onCloseExternal={() => setIsCommandPaletteOpen(false)}
      />

      {/* 5. V22 USER TRUST CENTER MODAL */}
      <UserTrustCenterModal
        isOpen={isTrustCenterOpen}
        onClose={() => setIsTrustCenterOpen(false)}
        userEmail={user?.email || 'admin@catalyx.io'}
        userRole={activeRole}
        onNavigate={handleSelectTab}
      />

      {/* 6. V22 UNIVERSAL OBJECT INSPECTOR MODAL */}
      {inspectedObject && (
        <UniversalObjectInspectorModal
          isOpen={!!inspectedObject}
          onClose={() => setInspectedObject(null)}
          object={inspectedObject}
          onNavigate={handleSelectTab}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GAMIFICATION TRIGGER POPUPS (LEVEL UP & ACHIEVEMENT) */}
      {/* ------------------------------------------------------------- */}

      {/* Level Up Micro-Popup Alert */}
      <AnimatePresence>
        {levelUpAlert.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel-heavy p-8 rounded-3xl text-center relative overflow-hidden ring-2 ring-brand-purple"
            >
              <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none"></div>

              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <span className="px-3 py-1 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-mono font-black uppercase rounded-full">
                PLATFORM UPDATE
              </span>
              <h2 className="text-3xl font-display font-semibold text-white mt-4 mb-2">COMPLIANCE LEVEL-UP!</h2>
              <p className="text-sm text-gray-300 max-w-xs mx-auto mb-6">
                Excellent! You progressed to <span className="text-[#00f5d4] font-bold">Level {levelUpAlert.level}</span>. Your execution capacity indices have expanded.
              </p>

              <button 
                onClick={() => setLevelUpAlert(prev => ({ ...prev, show: false }))}
                className="py-2.5 px-6 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center mx-auto cursor-pointer"
              >
                SECURE UPGRADE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Secured Micro-Popup alert */}
      <AnimatePresence>
        {achievementAlert.show && (
          <motion.div 
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 md:right-12 z-50 glass-panel p-5 rounded-2xl max-w-xs md:max-w-sm flex gap-3.5 border border-brand-pink/30 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-pink/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="text-4xl shrink-0 p-2 bg-brand-pink/10 rounded-xl flex items-center justify-center">{achievementAlert.badge}</div>
            <div>
              <span className="text-[9px] font-mono text-brand-pink uppercase tracking-widest block font-bold mb-0.5">Tactical Achievement Discovered</span>
              <h4 className="text-sm font-semibold text-white tracking-tight">{achievementAlert.name}</h4>
              <p className="text-xs text-gray-400 mt-1">Excellent! Performance merit is now registered to active user achievements ledger.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
