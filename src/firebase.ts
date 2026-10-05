import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { 
  UserProfile, Task, AIMessage, Workspace, 
  WorkspaceMember, WorkspaceTask, WorkspaceMessage, 
  WorkspaceInvite, ACHIEVEMENTS, Goal, Project, 
  SmartNotification, FocusBlock, KnowledgeArticle 
} from './types';
import { safeStorage } from './utils/safeStorage';
import { persistenceSyncService } from './services/persistenceSyncService';

// Standard Firebase Config interface
export interface SavedFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Check if there is a saved custom firebase config in localStorage
const STORAGE_CONFIG_KEY = 'catalyx_firebase_config';
export const getSavedFirebaseConfig = (): SavedFirebaseConfig | null => {
  try {
    const parsed = safeStorage.get<SavedFirebaseConfig | null>(STORAGE_CONFIG_KEY, null);
    if (parsed && parsed.apiKey && parsed.projectId) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading saved firebase config', e);
  }
  return null;
};

export const saveFirebaseConfig = (config: SavedFirebaseConfig | null) => {
  if (config) {
    safeStorage.set(STORAGE_CONFIG_KEY, config);
  } else {
    safeStorage.remove(STORAGE_CONFIG_KEY);
  }
  // Force reload to apply config if in browser
  if (typeof window !== 'undefined' && window.location) {
    window.location.reload();
  }
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let usingRealFirebase = false;

// Attempt to initialize using either env variables OR user-saved configuration
try {
  const savedConfig = getSavedFirebaseConfig();
  
  // Use env variables if present, otherwise custom config
  const metaEnv = (import.meta as any).env || {};
  const firebaseConfig = savedConfig || {
    apiKey: metaEnv.VITE_FIREBASE_API_KEY || "",
    authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: metaEnv.VITE_FIREBASE_APP_ID || ""
  };

  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    usingRealFirebase = true;
    console.log('[FIREBASE] Real cloud services initialized.');
  } else {
    const isProd = metaEnv.PROD || metaEnv.MODE === 'production';
    if (isProd) {
      console.info('[FIREBASE] Cloud Firebase credentials unconfigured (optional). Operating on sovereign CATALYX Server substrate.');
    } else {
      console.info('[FIREBASE] Local development mode: Operating on sovereign CATALYX Server substrate (Cloud Firebase optional).');
    }
  }
} catch (e) {
  console.warn('Firebase initialization error. Operating on sovereign CATALYX Server substrate.', e);
}

export { auth, firestore, usingRealFirebase };

// -------------------------------------------------------------
// SECURE SIMULATED ENGINE FOR LOCAL PREVIEW (Robust Fallback)
// -------------------------------------------------------------

const SIM_KEY_PREFIX = 'catalyx_sim_';

export const getSimData = <T>(collectionName: string): T[] => {
  return safeStorage.getArray<T>(`${SIM_KEY_PREFIX}${collectionName}`, []);
};

export const saveSimData = <T>(collectionName: string, data: T[]) => {
  safeStorage.set(`${SIM_KEY_PREFIX}${collectionName}`, data);
};

// Initialize mock DB structure if empty
if (getSimData<UserProfile>('users').length === 0) {
  const defaultUser: UserProfile = {
    uid: 'vine_demo_user',
    username: 'vine_executor',
    email: 'anesthonest81@gmail.com',
    xp: 220,
    level: 3,
    title: 'Strategic Commander',
    streak: 3,
    executionScore: 84,
    focusScore: 78,
    consistencyScore: 82,
    momentumScore: 80,
    premium: true,
    achievements: ['first_xp', 'level_up', 'consistency', 'elite_executor'],
    createdAt: new Date().toISOString()
  };
  saveSimData('users', [defaultUser]);
  
  const defaultTasks: Task[] = [
    {
      id: 'task_1',
      text: 'Analyze team task completion rate for June',
      completed: true,
      priority: 'high',
      category: 'work',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 'task_2',
      text: 'Draft the CATALYX V2 strategic execution roadmap',
      completed: false,
      priority: 'high',
      category: 'growth',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_3',
      text: 'Schedule AI simulation for Vinexsah core engines',
      completed: false,
      priority: 'medium',
      category: 'personal',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('tasks_vine_demo_user', defaultTasks);

  const defaultWorkspaces: Workspace[] = [
    {
      id: 'ws_1',
      name: 'VINEXSAH Core Dev Workspace',
      ownerId: 'vine_demo_user',
      memberIds: ['vine_demo_user', 'member_alex'],
      teamProductivityScore: 85,
      burnoutRisk: 'Low',
      teamMomentum: 'Optimal',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('workspaces', defaultWorkspaces);

  const defaultWorkspaceMembers: WorkspaceMember[] = [
    {
      uid: 'vine_demo_user',
      email: 'anesthonest81@gmail.com',
      username: 'vine_executor',
      role: 'owner',
      joinedAt: new Date().toISOString()
    },
    {
      uid: 'member_alex',
      email: 'alex@vinexsah.com',
      username: 'alex_dev',
      role: 'member',
      joinedAt: new Date().toISOString()
    }
  ];
  saveSimData('members_ws_1', defaultWorkspaceMembers);

  const defaultWorkspaceTasks: WorkspaceTask[] = [
    {
      id: 'wt_1',
      text: 'Implement core authentication services',
      completed: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completedBy: 'vine_demo_user'
    },
    {
      id: 'wt_2',
      text: 'Optimize model execution pipelines in real-time',
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('tasks_ws_1', defaultWorkspaceTasks);

  const defaultWorkspaceMessages: WorkspaceMessage[] = [
    {
      id: 'msg_1',
      text: 'Welcome to VINEXSAH Core Dev Workspace! Let\'s scale CATALYX to 100% execution score.',
      username: 'vine_executor',
      userId: 'vine_demo_user',
      ai: false,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'msg_2',
      text: 'Systems initialized. Team speed is optimal, let\'s execute the remaining microservices.',
      username: 'CATALYX AI Scout',
      userId: 'ai',
      ai: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('messages_ws_1', defaultWorkspaceMessages);

  const defaultInvites: WorkspaceInvite[] = [
    {
      id: 'invite_1',
      workspaceId: 'ws_1',
      workspaceName: 'VINEXSAH Core Dev Workspace',
      email: 'guest@vinexsah.com',
      senderEmail: 'anesthonest81@gmail.com',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('invites', defaultInvites);
  
  const defaultAIChat: AIMessage[] = [
    {
      id: 'm1',
      role: 'ai',
      message: 'Hello, Commander. I am CATALYX, your strategic Execution Intelligence Coach. I analyze execution indicators, outputting recommendations and momentum metrics. What objective are we destroying today?',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('aiMemory_vine_demo_user', defaultAIChat);

  // V2 default elements
  const defaultGoals: Goal[] = [
    {
      id: 'g1',
      title: 'Build CATALYX V2 Platform',
      description: 'Upgrade system architecture to full AI-powered Execution OS.',
      targetDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
      progress: 60,
      status: 'active',
      type: 'short_term',
      createdAt: new Date().toISOString()
    },
    {
      id: 'g2',
      title: 'Establish Vinexsah Enterprise Market Cap',
      description: 'Deploy 10 independent intelligence workflows for production validation.',
      targetDate: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
      progress: 15,
      status: 'active',
      type: 'long_term',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('goals_vine_demo_user', defaultGoals);

  const defaultProjects: Project[] = [
    {
      id: 'p1',
      title: 'Project Antigravity Framework',
      description: 'Autonomous execution validation engine deployment.',
      status: 'active',
      progress: 45,
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('projects_vine_demo_user', defaultProjects);

  const defaultNotifications: SmartNotification[] = [
    {
      id: 'notif_1',
      title: 'Execution Command Center Live',
      message: 'Secure channel initialized. All telemetry grids online.',
      read: false,
      type: 'focus_reminder',
      createdAt: new Date().toISOString()
    }
  ];
  saveSimData('notifications_vine_demo_user', defaultNotifications);

  const defaultFocus: FocusBlock[] = [
    {
      id: 'f1',
      taskName: 'Refactor state hooks',
      durationMinutes: 25,
      efficiencyRating: 5,
      soundscape: 'Interstellar Synth',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];
  saveSimData('focusBlocks_vine_demo_user', defaultFocus);

  const defaultWikis: KnowledgeArticle[] = [
    {
      id: 'w1',
      title: 'CATALYX Standard Operating Procedure',
      content: 'This wiki outlines the strict operational guidelines for team compliance. 1. Break tasks into under-30-minute intervals. 2. Lock in streaks proactively. 3. Tag AI Scout for immediate burnout profile analysis.',
      authorName: 'vine_executor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  saveSimData('wiki_ws_1', defaultWikis);
}

// Live triggers callback for alerts (e.g. Level Up, Achievements)
let scoreBadgeTrigger: ((achievementTitle: string, emoji: string) => void) | null = null;
let levelUpTrigger: ((newLevel: number) => void) | null = null;

export const registerNotifications = (
  onAchievement: (title: string, emoji: string) => void,
  onLevelUp: (level: number) => void
) => {
  scoreBadgeTrigger = onAchievement;
  levelUpTrigger = onLevelUp;
};

// HELPER FOR LEVEL-UPS AND RECALCULATING METRICS
const runRuleEngine = (user: UserProfile, tasks: Task[]): UserProfile => {
  // 1. Recalculate Level based on XP
  let level = 1;
  let remainingXP = user.xp;
  while (remainingXP >= level * 100) {
    remainingXP -= level * 100;
    level++;
  }
  
  const oldLevel = user.level;
  user.level = level;

  if (level > oldLevel && levelUpTrigger) {
    setTimeout(() => levelUpTrigger?.(level), 500);
  }

  // 2. Recalculate Execution Score
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const tRate = totalCount > 0 ? (completedCount / totalCount) : 0;
  
  const streakTerm = Math.min(user.streak * 10, 100) * 0.3;
  const xpTerm = Math.min(user.xp / 5, 100) * 0.3;
  const compTerm = tRate * 100 * 0.4;
  
  user.executionScore = Math.min(100, Math.max(0, Math.floor(compTerm + streakTerm + xpTerm)));

  // V2 calculations
  const focusList = getSimData<FocusBlock>(`focusBlocks_${user.uid}`);
  user.focusScore = Math.min(100, Math.max(0, Math.floor(focusList.length * 15 + user.executionScore * 0.4)));
  user.consistencyScore = Math.min(100, Math.max(0, Math.floor((user.streak * 12) + (tRate * 40))));
  user.momentumScore = Math.min(100, Math.max(0, Math.floor((user.streak * 10) + (user.executionScore * 0.7))));

  // Earned titles
  let earnedTitle = 'Novice Executor';
  if (user.executionScore >= 85) earnedTitle = 'Strategic Commander';
  else if (user.executionScore >= 70) earnedTitle = 'Execution General';
  else if (user.executionScore >= 50) earnedTitle = 'Discipline Operator';
  else if (user.executionScore >= 30) earnedTitle = 'Focus Recruit';
  user.title = earnedTitle;

  // 3. Real-time Achievement Checker
  const achievements = [...user.achievements];

  const triggerAchievement = (id: string, name: string, emoji: string) => {
    if (!achievements.includes(id)) {
      achievements.push(id);
      if (scoreBadgeTrigger) {
        setTimeout(() => scoreBadgeTrigger?.(name, emoji), 1000);
      }
    }
  };

  if (user.xp > 0) {
    triggerAchievement('first_xp', 'First XP Earned', '🏅');
  }
  if (user.level >= 2) {
    triggerAchievement('level_up', 'Level Up Achiever', '⚡');
  }
  if (user.streak >= 3) {
    triggerAchievement('consistency', 'Consistency Warrior', '🔥');
  }
  if (user.executionScore >= 80) {
    triggerAchievement('elite_executor', 'Elite Executor', '👑');
  }
  if (user.xp >= 500) {
    triggerAchievement('xp_master', 'XP Master', '🚀');
  }
  if (focusList.length >= 1) {
    triggerAchievement('focus_pioneer', 'Focus Pioneer', '🧘');
  }
  const goalsList = getSimData<Goal>(`goals_${user.uid}`);
  if (goalsList.length >= 1) {
    triggerAchievement('strategic_planner', 'Strategic Planner', '🎯');
  }

  user.achievements = achievements;
  return user;
};


// -------------------------------------------------------------
// CORE DATABASE UNIFIED SERVICE
// -------------------------------------------------------------

export const dbService = {
  // --- AUTH SERVICES ---
  getCurrentUserId(): string | null {
    return safeStorage.getActiveSession();
  },

  async registerUser(username: string, email: string, explicitUid?: string): Promise<UserProfile> {
    const users = getSimData<UserProfile>('users');
    const existingIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingIdx !== -1) {
      const existing = users[existingIdx];
      if (explicitUid && existing.uid !== explicitUid) {
        // Self-heal and migrate collections from old random UID to canonical server UID
        const oldUid = existing.uid;
        existing.uid = explicitUid;
        users[existingIdx] = existing;
        saveSimData('users', users);

        const oldTasks = getSimData<Task>(`tasks_${oldUid}`);
        if (oldTasks.length > 0) saveSimData(`tasks_${explicitUid}`, oldTasks);
        const oldGoals = getSimData<Goal>(`goals_${oldUid}`);
        if (oldGoals.length > 0) saveSimData(`goals_${explicitUid}`, oldGoals);
        const oldProjects = getSimData<Project>(`projects_${oldUid}`);
        if (oldProjects.length > 0) saveSimData(`projects_${explicitUid}`, oldProjects);

        // Update workspace ownership if any
        const wsList = getSimData<Workspace>('workspaces');
        let wsModified = false;
        for (const ws of wsList) {
          if (ws.ownerId === oldUid) {
            ws.ownerId = explicitUid;
            wsModified = true;
          }
          if (ws.memberIds.includes(oldUid)) {
            ws.memberIds = ws.memberIds.map(m => m === oldUid ? explicitUid : m);
            wsModified = true;
          }
        }
        if (wsModified) saveSimData('workspaces', wsList);
      }
      safeStorage.setActiveSession(existing.uid);
      return existing;
    }

    const uid = explicitUid || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    const newUser: UserProfile = {
      uid,
      username,
      email,
      xp: 0,
      level: 1,
      title: 'Novice Executor',
      streak: 1,
      executionScore: 0,
      focusScore: 0,
      consistencyScore: 0,
      momentumScore: 0,
      premium: false,
      achievements: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveSimData('users', users);
    
    // Set active session
    safeStorage.setActiveSession(newUser.uid);
    
    // Initialize default tables
    saveSimData(`tasks_${newUser.uid}`, []);
    saveSimData(`goals_${newUser.uid}`, []);
    saveSimData(`projects_${newUser.uid}`, []);
    saveSimData(`notifications_${newUser.uid}`, []);
    saveSimData(`focusBlocks_${newUser.uid}`, []);
    saveSimData(`aiMemory_${newUser.uid}`, [
      {
        id: 'welcome_m',
        role: 'ai',
        message: `Hello Commander ${username}. Welcome to CATALYX V2. I am your Strategic Intelligence Coach. Connect team workspaces, establish deep focus sessions, and plan strategic goals to scale your productivity score!`,
        createdAt: new Date().toISOString()
      }
    ]);

    return newUser;
  },

  async loginUser(): Promise<UserProfile> {
    throw new Error('Direct unauthenticated loginUser is disabled. Use authoritative authService.login({ email, password }).');
  },

  async logout(): Promise<void> {
    safeStorage.clearActiveSession();
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const users = getSimData<UserProfile>('users');
    const found = users.find(u => u.uid === uid);
    if (!found) return null;
    
    // Refresh rule metrics in real-time
    const tasks = getSimData<Task>(`tasks_${uid}`);
    const updated = runRuleEngine({ ...found }, tasks);
    
    // Sync back
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx] = updated;
      saveSimData('users', users);
    }
    
    return updated;
  },

  async updateUserTermsAcceptance(uid: string, version: string): Promise<UserProfile> {
    return this.updateUserProfile(uid, {
      termsAcceptedVersion: version,
      termsAcceptedAt: new Date().toISOString()
    });
  },

  async updateUserProfile(uid: string, fields: Partial<UserProfile>): Promise<UserProfile> {
    const users = getSimData<UserProfile>('users');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx === -1) {
      throw new Error('User profile not found');
    }
    const current = users[idx];
    const updated = { ...current, ...fields, updatedAt: new Date().toISOString() };
    
    // Apply rule validations
    const tasks = getSimData<Task>(`tasks_${uid}`);
    const final = runRuleEngine(updated, tasks);
    
    users[idx] = final;
    saveSimData('users', users);
    return final;
  },

  // --- RECONCILIATION & DURABLE PERSISTENCE REHYDRATION ---
  async syncWithServer(uid: string): Promise<boolean> {
    try {
      const res = await persistenceSyncService.hydrateFromServer();
      if (res.success && res.data) {
        this.hydrateFromSyncedData(uid, res.data);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[DB] syncWithServer failed, relying on local cached state:', err);
      return false;
    }
  },

  hydrateFromSyncedData(uid: string, data: {
    workspaces?: Workspace[];
    projects?: Project[];
    tasks?: Task[];
    goals?: Goal[];
    studios?: any[];
  }) {
    if (Array.isArray(data.workspaces) && data.workspaces.length > 0) {
      const existing = getSimData<Workspace>('workspaces');
      const wsMap = new Map<string, Workspace>();
      existing.forEach(w => wsMap.set(w.id, w));
      data.workspaces.forEach(w => wsMap.set(w.id, w));
      saveSimData('workspaces', Array.from(wsMap.values()));
    }

    if (Array.isArray(data.projects)) {
      saveSimData(`projects_${uid}`, data.projects);
    }

    if (Array.isArray(data.tasks)) {
      saveSimData(`tasks_${uid}`, data.tasks);
    }

    if (Array.isArray(data.goals)) {
      saveSimData(`goals_${uid}`, data.goals);
    }

    if (Array.isArray(data.studios) && data.studios.length > 0) {
      safeStorage.set('catalyx_studios', data.studios);
    }

    // Refresh user score / level
    const users = getSimData<UserProfile>('users');
    const uIdx = users.findIndex(u => u.uid === uid);
    if (uIdx !== -1) {
      const currentTasks = data.tasks || getSimData<Task>(`tasks_${uid}`);
      const updated = runRuleEngine(users[uIdx], currentTasks);
      users[uIdx] = updated;
      saveSimData('users', users);
    }
  },

  // --- TASK SERVICES ---
  async getTasks(uid: string): Promise<Task[]> {
    let tasks = getSimData<Task>(`tasks_${uid}`);
    if (tasks.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch('/api/tasks', {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverTasks = await res.json();
            if (Array.isArray(serverTasks) && serverTasks.length > 0) {
              tasks = serverTasks;
              saveSimData(`tasks_${uid}`, tasks);
            }
          }
        } catch {
          // offline fallback
        }
      }
    }
    return tasks;
  },

  async addTask(uid: string, text: string, priority?: Task['priority'], category?: Task['category'], dueDate?: string): Promise<Task[]> {
    const tasks = getSimData<Task>(`tasks_${uid}`);
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      priority: priority || 'medium',
      category: category || 'work',
      dueDate,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveSimData(`tasks_${uid}`, tasks);
    persistenceSyncService.queueSync({ tasks });

    // Immediate direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newTask.id, text, priority, category, dueDate })
      }).catch(err => console.warn('[DB] Direct task save fallback to queue:', err));
    }

    // Reward Create Task: +5 XP
    const profile = await this.getUserProfile(uid);
    if (profile) {
      await this.updateUserProfile(uid, { xp: profile.xp + 5 });
    }

    return tasks;
  },

  async completeTask(uid: string, taskId: string): Promise<Task[]> {
    const tasks = getSimData<Task>(`tasks_${uid}`);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      const alreadyCompleted = tasks[idx].completed;
      tasks[idx].completed = true;
      tasks[idx].completedAt = new Date().toISOString();
      saveSimData(`tasks_${uid}`, tasks);
      persistenceSyncService.queueSync({ tasks });

      // Immediate direct REST write
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionToken,
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ completed: true, completedAt: tasks[idx].completedAt })
        }).catch(err => console.warn('[DB] Direct task update fallback to queue:', err));
      }

      // Reward Complete Task: +20 XP (only if not already completed)
      if (!alreadyCompleted) {
        const profile = await this.getUserProfile(uid);
        if (profile) {
          await this.updateUserProfile(uid, { xp: profile.xp + 20 });
        }
      }
    }
    return tasks;
  },

  async deleteTask(uid: string, taskId: string): Promise<Task[]> {
    let tasks = getSimData<Task>(`tasks_${uid}`);
    tasks = tasks.filter(t => t.id !== taskId);
    saveSimData(`tasks_${uid}`, tasks);
    persistenceSyncService.queueSync({ tasks });

    // Immediate direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'DELETE',
        headers: {
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        }
      }).catch(err => console.warn('[DB] Direct task delete fallback to queue:', err));
    }
    
    // Trigger recalculation of execution scores
    const profile = await this.getUserProfile(uid);
    if (profile) {
      await this.updateUserProfile(uid, { xp: profile.xp });
    }
    
    return tasks;
  },

  // --- AI COACH MEMORY ---
  async getAIMessages(uid: string): Promise<AIMessage[]> {
    return getSimData<AIMessage>(`aiMemory_${uid}`);
  },

  async addAIMessage(uid: string, role: 'user' | 'ai', message: string): Promise<AIMessage> {
    const list = getSimData<AIMessage>(`aiMemory_${uid}`);
    const newMessage: AIMessage = {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      role,
      message,
      createdAt: new Date().toISOString()
    };
    list.push(newMessage);
    saveSimData(`aiMemory_${uid}`, list);
    return newMessage;
  },

  async clearAIMessages(uid: string): Promise<void> {
    saveSimData(`aiMemory_${uid}`, [
      {
        id: 'welcome_m',
        role: 'ai',
        message: 'Understood, Commander. Execution memory buffer recycled. Ready for fresh intelligence cycles.',
        createdAt: new Date().toISOString()
      }
    ]);
  },

  // --- GOAL SYSTEM (V2 addition) ---
  async getGoals(uid: string): Promise<Goal[]> {
    let list = getSimData<Goal>(`goals_${uid}`);
    if (list.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch('/api/goals', {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverGoals = await res.json();
            if (Array.isArray(serverGoals) && serverGoals.length > 0) {
              list = serverGoals;
              saveSimData(`goals_${uid}`, list);
            }
          }
        } catch {
          // offline fallback
        }
      }
    }
    return list;
  },

  async addGoal(uid: string, title: string, description: string, targetDate: string, type: 'short_term' | 'long_term'): Promise<Goal[]> {
    const list = getSimData<Goal>(`goals_${uid}`);
    const newItem: Goal = {
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      targetDate,
      progress: 0,
      status: 'active',
      type,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    saveSimData(`goals_${uid}`, list);
    persistenceSyncService.queueSync({ goals: list });

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newItem.id, title, description, targetDate, type })
      }).catch(err => console.warn('[DB] Direct goal save fallback to queue:', err));
    }

    // Reward creating strategic targets: +15 XP
    const profile = await this.getUserProfile(uid);
    if (profile) {
      await this.updateUserProfile(uid, { xp: profile.xp + 15 });
    }
    return list;
  },

  async updateGoalProgress(uid: string, goalId: string, progress: number, status?: Goal['status']): Promise<Goal[]> {
    const list = getSimData<Goal>(`goals_${uid}`);
    const idx = list.findIndex(g => g.id === goalId);
    if (idx !== -1) {
      list[idx].progress = progress;
      if (status) list[idx].status = status;
      if (progress >= 100) {
        list[idx].status = 'completed';
        // Bonus for completed strategic target: +50 XP
        const profile = await this.getUserProfile(uid);
        if (profile) {
          await this.updateUserProfile(uid, { xp: profile.xp + 50 });
        }
      }
      saveSimData(`goals_${uid}`, list);
      persistenceSyncService.queueSync({ goals: list });

      // Direct REST write
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        fetch(`/api/goals/${encodeURIComponent(goalId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionToken,
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ progress, status: list[idx].status })
        }).catch(err => console.warn('[DB] Direct goal update fallback to queue:', err));
      }
    }
    return list;
  },

  async deleteGoal(uid: string, goalId: string): Promise<Goal[]> {
    const list = getSimData<Goal>(`goals_${uid}`);
    const filtered = list.filter(g => g.id !== goalId);
    saveSimData(`goals_${uid}`, filtered);
    persistenceSyncService.queueSync({ goals: filtered });

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/goals/${encodeURIComponent(goalId)}`, {
        method: 'DELETE',
        headers: {
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        }
      }).catch(err => console.warn('[DB] Direct goal delete fallback to queue:', err));
    }

    return filtered;
  },

  // --- PROJECT MANAGEMENT (V2 addition) ---
  async getProjects(uid: string): Promise<Project[]> {
    let list = getSimData<Project>(`projects_${uid}`);
    if (list.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch('/api/projects', {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverProjects = await res.json();
            if (Array.isArray(serverProjects) && serverProjects.length > 0) {
              list = serverProjects;
              saveSimData(`projects_${uid}`, list);
            }
          }
        } catch {
          // offline fallback
        }
      }
    }
    return list;
  },

  async addProject(uid: string, title: string, description: string): Promise<Project[]> {
    const list = getSimData<Project>(`projects_${uid}`);
    const newItem: Project = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      status: 'planning',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    saveSimData(`projects_${uid}`, list);
    persistenceSyncService.queueSync({ projects: list });

    // Direct REST write for zero latency
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newItem.id, title, description })
      }).catch(err => console.warn('[DB] Direct project save fallback to queue:', err));
    }

    return list;
  },

  async updateProjectProgress(uid: string, projectId: string, progress: number, status?: Project['status']): Promise<Project[]> {
    const list = getSimData<Project>(`projects_${uid}`);
    const idx = list.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      list[idx].progress = progress;
      if (status) list[idx].status = status;
      saveSimData(`projects_${uid}`, list);
      persistenceSyncService.queueSync({ projects: list });

      // Direct REST write
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionToken,
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ progress, status: list[idx].status })
        }).catch(err => console.warn('[DB] Direct project update fallback to queue:', err));
      }
    }
    return list;
  },

  async deleteProject(uid: string, projectId: string): Promise<Project[]> {
    const list = getSimData<Project>(`projects_${uid}`);
    const filtered = list.filter(p => p.id !== projectId);
    saveSimData(`projects_${uid}`, filtered);
    persistenceSyncService.queueSync({ projects: filtered });

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
        headers: {
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        }
      }).catch(err => console.warn('[DB] Direct project delete fallback to queue:', err));
    }

    return filtered;
  },

  // --- SMART SYSTEM NOTIFICATIONS (V2 addition) ---
  async getNotifications(uid: string): Promise<SmartNotification[]> {
    return getSimData<SmartNotification>(`notifications_${uid}`);
  },

  async addNotification(uid: string, title: string, message: string, type: SmartNotification['type']): Promise<SmartNotification[]> {
    const list = getSimData<SmartNotification>(`notifications_${uid}`);
    const newItem: SmartNotification = {
      id: 'not_ ' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    saveSimData(`notifications_${uid}`, list);
    return list;
  },

  async markNotificationAsRead(uid: string, notifId: string): Promise<SmartNotification[]> {
    const list = getSimData<SmartNotification>(`notifications_${uid}`);
    const idx = list.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      list[idx].read = true;
      saveSimData(`notifications_${uid}`, list);
    }
    return list;
  },

  async clearNotifications(uid: string): Promise<void> {
    saveSimData(`notifications_${uid}`, []);
  },

  // --- DEEP FOCUS SESSIONS (V2 addition) ---
  async getFocusBlocks(uid: string): Promise<FocusBlock[]> {
    return getSimData<FocusBlock>(`focusBlocks_${uid}`);
  },

  async addFocusBlock(uid: string, taskName: string, durationMinutes: number, efficiencyRating: number, soundscape: string): Promise<FocusBlock[]> {
    const list = getSimData<FocusBlock>(`focusBlocks_${uid}`);
    const newItem: FocusBlock = {
      id: 'fb_' + Math.random().toString(36).substring(2, 9),
      taskName,
      durationMinutes,
      efficiencyRating,
      soundscape,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    saveSimData(`focusBlocks_${uid}`, list);

    // Reward focus: +25 XP
    const profile = await this.getUserProfile(uid);
    if (profile) {
      await this.updateUserProfile(uid, { xp: profile.xp + 25 });
    }
    return list;
  },

  // --- LEADERBOARD & PUBLIC ---
  async getLeaderboard(): Promise<UserProfile[]> {
    const users = getSimData<UserProfile>('users');
    
    // Refresh score of each leaderboard user
    const refreshed = await Promise.all(users.map(async u => {
      const t = getSimData<Task>(`tasks_${u.uid}`);
      return runRuleEngine({ ...u }, t);
    }));
    
    // Sort desc of score
    return refreshed.sort((a, b) => b.executionScore - a.executionScore).slice(0, 10);
  },

  // --- WORKSPACE SYSTEMS ---
  async getWorkspaces(uid: string): Promise<Workspace[]> {
    let list = getSimData<Workspace>('workspaces');
    let userWorkspaces = list.filter(w => w.ownerId === uid || w.memberIds.includes(uid));
    if (userWorkspaces.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch('/api/workspaces', {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverWs = await res.json();
            if (Array.isArray(serverWs) && serverWs.length > 0) {
              const wsMap = new Map<string, Workspace>();
              list.forEach(w => wsMap.set(w.id, w));
              serverWs.forEach((w: Workspace) => wsMap.set(w.id, w));
              list = Array.from(wsMap.values());
              saveSimData('workspaces', list);
              userWorkspaces = list.filter(w => w.ownerId === uid || w.memberIds.includes(uid));
            }
          }
        } catch {
          // offline fallback
        }
      }
    }
    return userWorkspaces;
  },

  async createWorkspace(ownerId: string, name: string): Promise<Workspace> {
    const list = getSimData<Workspace>('workspaces');
    const newWS: Workspace = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      name,
      ownerId,
      memberIds: [ownerId],
      teamProductivityScore: 70,
      burnoutRisk: 'Low',
      teamMomentum: 'Moderate',
      createdAt: new Date().toISOString()
    };
    list.push(newWS);
    saveSimData('workspaces', list);
    persistenceSyncService.queueSync({ workspaces: list });

    // Setup default workspace collections
    const ownerProfile = await this.getUserProfile(ownerId);
    const firstMember: WorkspaceMember = {
      uid: ownerId,
      email: ownerProfile?.email || 'user@catalyx.io',
      username: ownerProfile?.username || 'Commander',
      role: 'owner',
      joinedAt: new Date().toISOString()
    };
    saveSimData(`members_${newWS.id}`, [firstMember]);
    saveSimData(`tasks_${newWS.id}`, []);
    saveSimData(`wiki_${newWS.id}`, [
      {
        id: 'wik_init',
        title: 'Workspace Executive Overview',
        content: `Welcome to the general Knowledge wiki of "${name}". Set up workflow strategies, execution guidelines, and SOP structures here.`,
        authorName: ownerProfile?.username || 'Commander',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
    saveSimData(`messages_${newWS.id}`, [
      {
        id: 'init_chat_1',
        text: `Secured. Workspace "${name}" established. Initializing team feedback channels.`,
        username: 'CATALYX AI Platform',
        userId: 'ai',
        ai: true,
        createdAt: new Date().toISOString()
      }
    ]);

    // Direct REST write for zero-latency durable persistence
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newWS.id, name })
      }).catch(err => console.warn('[DB] Direct workspace write fallback to queue:', err));
    }

    return newWS;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    let list = getSimData<WorkspaceMember>(`members_${workspaceId}`);
    if (list.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/members`, {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverMembers = await res.json();
            if (Array.isArray(serverMembers) && serverMembers.length > 0) {
              list = serverMembers;
              saveSimData(`members_${workspaceId}`, list);
            }
          }
        } catch {}
      }
    }
    return list;
  },

  async inviteToWorkspace(workspaceId: string, email: string, senderEmail: string, workspaceName: string): Promise<WorkspaceInvite> {
    const list = getSimData<WorkspaceInvite>('invites') || [];
    const newInvite: WorkspaceInvite = {
      id: 'invite_' + Math.random().toString(36).substring(2, 9),
      workspaceId,
      workspaceName,
      email,
      senderEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    list.push(newInvite);
    saveSimData('invites', list);
    return newInvite;
  },

  async getInvites(email: string): Promise<WorkspaceInvite[]> {
    const list = getSimData<WorkspaceInvite>('invites') || [];
    return list.filter(inv => inv.email.toLowerCase() === email.toLowerCase() && inv.status === 'pending');
  },

  async acceptInvite(inviteId: string, uid: string): Promise<void> {
    const invites = getSimData<WorkspaceInvite>('invites') || [];
    const idx = invites.findIndex(i => i.id === inviteId);
    if (idx !== -1) {
      invites[idx].status = 'accepted';
      saveSimData('invites', invites);
      
      const invite = invites[idx];
      const workspaces = getSimData<Workspace>('workspaces');
      const wsIdx = workspaces.findIndex(w => w.id === invite.workspaceId);
      if (wsIdx !== -1) {
        if (!workspaces[wsIdx].memberIds.includes(uid)) {
          workspaces[wsIdx].memberIds.push(uid);
          saveSimData('workspaces', workspaces);
        }
        
        // Add member profile to workspace members subcollection
        const userProf = await this.getUserProfile(uid);
        const membersList = getSimData<WorkspaceMember>(`members_${invite.workspaceId}`);
        if (!membersList.some(m => m.uid === uid)) {
          membersList.push({
            uid,
            email: userProf?.email || '',
            username: userProf?.username || 'new_member',
            role: 'member',
            joinedAt: new Date().toISOString()
          });
          saveSimData(`members_${invite.workspaceId}`, membersList);
        }
      }
    }
  },

  async declineInvite(inviteId: string): Promise<void> {
    const invites = getSimData<WorkspaceInvite>('invites') || [];
    const idx = invites.findIndex(i => i.id === inviteId);
    if (idx !== -1) {
      invites[idx].status = 'declined';
      saveSimData('invites', invites);
    }
  },

  // --- WORKSPACE TASKS ---
  async getWorkspaceTasks(workspaceId: string): Promise<WorkspaceTask[]> {
    let tasks = getSimData<WorkspaceTask>(`tasks_${workspaceId}`);
    if (tasks.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/tasks`, {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverTasks = await res.json();
            if (Array.isArray(serverTasks) && serverTasks.length > 0) {
              tasks = serverTasks;
              saveSimData(`tasks_${workspaceId}`, tasks);
            }
          }
        } catch {}
      }
    }
    return tasks;
  },

  async addWorkspaceTask(workspaceId: string, text: string, priority?: 'high' | 'medium' | 'low', assignedTo?: string): Promise<WorkspaceTask[]> {
    const tasks = getSimData<WorkspaceTask>(`tasks_${workspaceId}`);
    const newTask: WorkspaceTask = {
      id: 'wt_' + Math.random().toString(36).substring(2, 9),
      text,
      completed: false,
      priority: priority || 'medium',
      assignedTo: assignedTo || '',
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveSimData(`tasks_${workspaceId}`, tasks);

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newTask.id, text, priority, assignedTo })
      }).catch(err => console.warn('[DB] Direct workspace task write fallback:', err));
    }

    return tasks;
  },

  async completeWorkspaceTask(workspaceId: string, taskId: string, uid: string): Promise<WorkspaceTask[]> {
    const tasks = getSimData<WorkspaceTask>(`tasks_${workspaceId}`);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      const alreadyCompleted = tasks[idx].completed;
      tasks[idx].completed = true;
      tasks[idx].completedAt = new Date().toISOString();
      tasks[idx].completedBy = uid;
      saveSimData(`tasks_${workspaceId}`, tasks);

      // Direct REST write
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}/complete`, {
          method: 'POST',
          headers: {
            'x-session-token': sessionToken,
            'Authorization': `Bearer ${sessionToken}`
          }
        }).catch(err => console.warn('[DB] Direct workspace task complete fallback:', err));
      }

      // Reward Workspace Task Completion: +15 XP (only if not already completed)
      if (!alreadyCompleted) {
        const profile = await this.getUserProfile(uid);
        if (profile) {
          await this.updateUserProfile(uid, { xp: profile.xp + 15 });
        }
      }
    }
    return tasks;
  },

  // --- WORKSPACE CHAT ---
  async getWorkspaceMessages(workspaceId: string): Promise<WorkspaceMessage[]> {
    let messages = getSimData<WorkspaceMessage>(`messages_${workspaceId}`);
    if (messages.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/messages`, {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverMsgs = await res.json();
            if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
              messages = serverMsgs;
              saveSimData(`messages_${workspaceId}`, messages);
            }
          }
        } catch {}
      }
    }
    return messages;
  },

  async addWorkspaceMessage(workspaceId: string, userId: string, username: string, text: string, ai = false): Promise<WorkspaceMessage[]> {
    const messages = getSimData<WorkspaceMessage>(`messages_${workspaceId}`);
    const newMsg: WorkspaceMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      text,
      username,
      userId,
      ai,
      emojiReactions: [],
      createdAt: new Date().toISOString()
    };
    messages.push(newMsg);
    saveSimData(`messages_${workspaceId}`, messages);

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newMsg.id, text, username })
      }).catch(err => console.warn('[DB] Direct workspace message write fallback:', err));
    }

    return messages;
  },

  async addWorkspaceMessageReaction(workspaceId: string, messageId: string, emoji: string, userId: string): Promise<WorkspaceMessage[]> {
    const messages = getSimData<WorkspaceMessage>(`messages_${workspaceId}`);
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      const msg = messages[idx];
      if (!msg.emojiReactions) msg.emojiReactions = [];
      const reactIdx = msg.emojiReactions.findIndex(e => e.emoji === emoji);
      if (reactIdx !== -1) {
        const reaction = msg.emojiReactions[reactIdx];
        if (!reaction.users.includes(userId)) {
          reaction.users.push(userId);
          reaction.count += 1;
        }
      } else {
        msg.emojiReactions.push({
          emoji,
          count: 1,
          users: [userId]
        });
      }
      saveSimData(`messages_${workspaceId}`, messages);
    }
    return messages;
  },

  // --- KNOWLEDGE VAULT / WIKI (V2 addition) ---
  async getKnowledgeWiki(workspaceId: string): Promise<KnowledgeArticle[]> {
    let list = getSimData<KnowledgeArticle>(`wiki_${workspaceId}`);
    if (!list || list.length === 0) {
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        try {
          const res = await fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/wikis`, {
            headers: {
              'x-session-token': sessionToken,
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          if (res.ok) {
            const serverWikis = await res.json();
            if (Array.isArray(serverWikis) && serverWikis.length > 0) {
              list = serverWikis;
              saveSimData(`wiki_${workspaceId}`, list);
            }
          }
        } catch {}
      }
    }
    return list || [];
  },

  async addKnowledgeWikiItem(workspaceId: string, title: string, content: string, authorName: string): Promise<KnowledgeArticle[]> {
    const list = getSimData<KnowledgeArticle>(`wiki_${workspaceId}`) || [];
    const newItem: KnowledgeArticle = {
      id: 'wik_' + Math.random().toString(36).substring(2, 9),
      title,
      content,
      authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newItem);
    saveSimData(`wiki_${workspaceId}`, list);

    // Direct REST write
    const sessionToken = safeStorage.getSessionToken();
    if (sessionToken) {
      fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/wikis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ id: newItem.id, title, content })
      }).catch(err => console.warn('[DB] Direct wiki save fallback:', err));
    }

    return list;
  },

  async updateKnowledgeWikiItem(workspaceId: string, itemId: string, title: string, content: string): Promise<KnowledgeArticle[]> {
    const list = getSimData<KnowledgeArticle>(`wiki_${workspaceId}`) || [];
    const idx = list.findIndex(w => w.id === itemId);
    if (idx !== -1) {
      list[idx].title = title;
      list[idx].content = content;
      list[idx].updatedAt = new Date().toISOString();
      saveSimData(`wiki_${workspaceId}`, list);

      // Direct REST write
      const sessionToken = safeStorage.getSessionToken();
      if (sessionToken) {
        fetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/wikis/${encodeURIComponent(itemId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sessionToken,
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ title, content })
        }).catch(err => console.warn('[DB] Direct wiki update fallback:', err));
      }
    }
    return list;
  },

  // --- ADMIN PORTAL SANITARY CONTROLS (V2 addition) ---
  async setAdminMetrics(uid: string, xp: number, streak: number, premium: boolean): Promise<UserProfile> {
    const users = getSimData<UserProfile>('users');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx].xp = xp;
      users[idx].streak = streak;
      users[idx].premium = premium;
      
      const tasks = getSimData<Task>(`tasks_${uid}`);
      const updated = runRuleEngine(users[idx], tasks);
      users[idx] = updated;
      saveSimData('users', users);
      return updated;
    }
    throw new Error('User details could not be found to administer');
  },

  async resetAllData(uid: string): Promise<void> {
    saveSimData(`tasks_${uid}`, []);
    saveSimData(`goals_${uid}`, []);
    saveSimData(`projects_${uid}`, []);
    saveSimData(`notifications_${uid}`, []);
    saveSimData(`focusBlocks_${uid}`, []);
    saveSimData(`aiMemory_${uid}`, [
      {
        id: 'welcome_m',
        role: 'ai',
        message: 'System databases successfully purged. Offline caches recertified.',
        createdAt: new Date().toISOString()
      }
    ]);
    
    const users = getSimData<UserProfile>('users');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx].xp = 0;
      users[idx].streak = 1;
      users[idx].executionScore = 0;
      users[idx].focusScore = 0;
      users[idx].consistencyScore = 0;
      users[idx].momentumScore = 0;
      saveSimData('users', users);
    }
  }
};
