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

// Production Legal, Governance & Compliance Components
import { TermsAcceptanceGuard } from './components/legal/TermsAcceptanceGuard';
import { LegalDocumentView } from './components/legal/LegalDocumentView';
import { LegalCenterTab } from './components/legal/LegalCenterTab';
import { AppFooter } from './components/legal/AppFooter';
import { LegalPolicyService } from './services/legal/legalPolicyService';

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
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState(''); // Simulated validation
  const [isRegistering, setIsRegistering] = useState(false);
  const [authTermsChecked, setAuthTermsChecked] = useState(false);
  const [authError, setAuthError] = useState('');

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

    // Auto load current session or default dev user
    const currentId = dbService.getCurrentUserId();
    if (currentId) {
      loadUserData(currentId);
    }

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authTermsChecked) {
      setAuthError('Mandatory Agreement: You must review and agree to the Terms of Service, Privacy Policy, and creator fee structure before creating an account.');
      return;
    }
    if (!authEmail.trim() || !authUsername.trim() || !authPassword.trim()) {
      setAuthError('All parameters required for registration.');
      return;
    }
    try {
      const newUserProfile = await dbService.registerUser(authUsername.trim(), authEmail.trim());
      // Authoritatively record terms acceptance on server audit ledger
      await fetch('/api/legal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUserProfile.uid,
          userEmail: newUserProfile.email,
          termsVersion: LegalPolicyService.CURRENT_VERSION,
        }),
      }).catch(err => console.warn('Terms audit recording notice:', err));

      const compliantProfile = await dbService.updateUserTermsAcceptance(newUserProfile.uid, LegalPolicyService.CURRENT_VERSION);
      setUser(compliantProfile);
      loadUserData(compliantProfile.uid);
    } catch (e: any) {
      setAuthError(e.message || 'Unable to secure token profile.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Email and Password must be validation checked.');
      return;
    }
    try {
      const loginProfile = await dbService.loginUser(authEmail.trim());
      setUser(loginProfile);
      loadUserData(loginProfile.uid);
    } catch (e: any) {
      setAuthError(e.message || 'Incorrect credentials verified.');
    }
  };

  const handleLogout = async () => {
    await dbService.logout();
    setUser(null);
    setActiveWorkspace(null);
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
      case 'integrations':
        return <IntegrationsTab orgId={user.uid} />;
      // V8.1 Commercial, Economic & Safety Infrastructure
      case 'commercial-ops':
        return <CommercialIntelligenceTab organizationId={user.uid} />;
      case 'ai-firewall':
        return <AISafetyFirewallTab organizationId={user.uid} currentUserEmail={user.email} />;
      case 'reconciliation':
        return <FinancialReconciliationTab organizationId={user.uid} currentUserEmail={user.email} />;
      case 'marketplace-api':
        return <MarketplaceApiTab organizationId={user.uid} currentUserEmail={user.email} />;
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
    return (
      <div className="min-h-screen bg-[#030712] text-gray-200 flex items-center justify-center p-4 relative font-sans overflow-hidden">
        {/* Futuristic glowing grids */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(157,78,221,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative overflow-hidden z-10 glow-brand">
          <div className="text-center mb-6">
            <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 rounded-full uppercase">
              VINEXSAH TECHNOLOGIES INTEGRATED COMMAND
            </span>
            <h1 className="text-4xl font-display font-medium text-white tracking-widest mt-4">
              CATA<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">LYX</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Activate your Executive profile portal to align checklists, real-time scrums, and AI coach analytics.
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">COMMAND USERNAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vine_executor"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-700 focus:outline-[#9d4edd] focus:outline-1 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">SECURE ELECTRONIC MAIL</label>
              <input
                type="email"
                required
                placeholder="anesthonest81@gmail.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">SECURITY ACCESS TOKEN</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-indigo-500 focus:outline-1 transition-all"
              />
            </div>

            {isRegistering && (
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/10 text-left cursor-pointer hover:border-brand-purple/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={authTermsChecked}
                    onChange={(e) => setAuthTermsChecked(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-slate-900 text-brand-purple focus:ring-brand-purple accent-[#9d4edd] cursor-pointer"
                  />
                  <span className="text-xs text-gray-300 leading-snug">
                    I agree unconditionally to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUser({
                          uid: 'preview-visitor',
                          username: 'Guest Visitor',
                          email: 'visitor@catalyx.io',
                          termsAcceptedVersion: '',
                          accountType: 'INDIVIDUAL',
                          role: 'EXECUTIVE',
                          createdAt: new Date().toISOString()
                        } as any);
                        setActiveTab('terms');
                      }}
                      className="text-brand-cyan hover:underline font-semibold"
                    >
                      Terms of Service
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUser({
                          uid: 'preview-visitor',
                          username: 'Guest Visitor',
                          email: 'visitor@catalyx.io',
                          termsAcceptedVersion: '',
                          accountType: 'INDIVIDUAL',
                          role: 'EXECUTIVE',
                          createdAt: new Date().toISOString()
                        } as any);
                        setActiveTab('privacy');
                      }}
                      className="text-brand-cyan hover:underline font-semibold"
                    >
                      Privacy Policy
                    </button>
                    , and platform revenue sharing schedule (10% Creator / 15% Organization under Vinexsah Technologies).
                  </span>
                </label>
              </div>
            )}

            {authError && (
              <p className="text-xs text-brand-pink font-mono text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold hover:opacity-95 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all font-display mt-6 cursor-pointer"
            >
              <span>{isRegistering ? 'INITIALIZE NEW MATRIX' : 'SECURE SECRETS ACCESS'}</span>
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/5 pt-4 space-y-3">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
              }}
              className="text-xs text-brand-cyan hover:underline hover:text-brand-purple font-mono cursor-pointer block mx-auto"
            >
              {isRegistering ? 'Already unified? Access active secrets' : 'New Commander profile? Register credentials'}
            </button>

            <div className="text-[10px] text-gray-500 leading-relaxed pt-2 border-t border-white/5">
              <p>
                By proceeding, you acknowledge the binding{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUser({
                      uid: 'preview-visitor',
                      username: 'Guest Visitor',
                      email: 'visitor@catalyx.io',
                      termsAcceptedVersion: '',
                      accountType: 'INDIVIDUAL',
                      role: 'EXECUTIVE',
                      createdAt: new Date().toISOString()
                    } as any);
                    setActiveTab('terms');
                  }}
                  className="text-indigo-400 hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUser({
                      uid: 'preview-visitor',
                      username: 'Guest Visitor',
                      email: 'visitor@catalyx.io',
                      termsAcceptedVersion: '',
                      accountType: 'INDIVIDUAL',
                      role: 'EXECUTIVE',
                      createdAt: new Date().toISOString()
                    } as any);
                    setActiveTab('privacy');
                  }}
                  className="text-indigo-400 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                , and Creator IP Covenants.
              </p>
              <p className="text-[9px] text-gray-600 mt-1">
                CATALYX is developed & operated under the <strong className="text-gray-400">VINEXSAH TECHNOLOGIES</strong> project name.
              </p>
            </div>
          </div>
        </div>
      </div>
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
      />

      {/* 2. BODY VIEWPORT */}
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-53px)] overflow-y-auto pb-16 md:pb-6">
          <section className="flex-1 p-4 sm:p-6 relative max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </section>
          <AppFooter onNavigateToLegal={(slug) => handleSelectTab(slug)} />
        </main>
      </div>

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
