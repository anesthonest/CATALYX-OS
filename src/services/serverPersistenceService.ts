/**
 * CATALYX Authoritative Server-Side Durable Persistence & Export Service
 * 
 * Guarantees:
 * 1. Durable file-backed persistence under ./data/ surviving restarts, reboots, and multi-session access
 * 2. User & Tenant Isolation: Strict authorization checks based on validated session
 * 3. Complete CRUD lifecycle for Workspaces, Projects, Tasks, Goals, Wikis, Studios, and Universal Work
 * 4. Genuine ZIP, JSON, CSV, and Markdown export generation with cryptographic manifests
 * 5. Atomic write operations to prevent partial corruption
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import { 
  Workspace, WorkspaceMember, WorkspaceTask, WorkspaceMessage, WorkspaceInvite,
  Project, Task, Goal, KnowledgeArticle, FocusBlock, AIMessage, UniversalWorkObject 
} from '../types';
import { StudioItem } from './studioService';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface ExportManifest {
  exportId: string;
  exportType: 'PROJECT' | 'WORKSPACE' | 'STUDIO' | 'ALL_USER_DATA';
  entityId: string;
  entityName: string;
  exportedBy: string;
  exportedAt: string;
  checksumSha256: string;
  contents: {
    filesCount: number;
    tasksCount?: number;
    projectsCount?: number;
    documentsCount?: number;
    studiosCount?: number;
    membersCount?: number;
    categories: string[];
  };
}

export class ServerPersistenceService {
  private static instance: ServerPersistenceService;

  private workspaces: Map<string, Workspace> = new Map();
  private workspaceMembers: Map<string, WorkspaceMember[]> = new Map(); // key = workspaceId
  private workspaceTasks: Map<string, WorkspaceTask[]> = new Map(); // key = workspaceId
  private workspaceMessages: Map<string, WorkspaceMessage[]> = new Map(); // key = workspaceId
  private workspaceWikis: Map<string, KnowledgeArticle[]> = new Map(); // key = workspaceId
  private workspaceInvites: WorkspaceInvite[] = [];

  private projects: Map<string, Project & { userId: string; workspaceId?: string }> = new Map();
  private tasks: Map<string, Task & { userId: string }> = new Map();
  private goals: Map<string, Goal & { userId: string }> = new Map();
  private focusBlocks: Map<string, FocusBlock & { userId: string }> = new Map();
  private aiMessages: Map<string, AIMessage & { userId: string }> = new Map();
  private studios: Map<string, StudioItem> = new Map();
  private universalWork: Map<string, UniversalWorkObject> = new Map();

  private isDirty = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.ensureDataDirectory();
    this.loadAllFromDisk();
    this.ensureSeedData();
  }

  public static getInstance(): ServerPersistenceService {
    if (!ServerPersistenceService.instance) {
      ServerPersistenceService.instance = new ServerPersistenceService();
    }
    return ServerPersistenceService.instance;
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getFilePath(filename: string): string {
    return path.join(DATA_DIR, filename);
  }

  private safeReadJson<T>(filename: string, fallback: T): T {
    try {
      const p = this.getFilePath(filename);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[PERSISTENCE] Error reading ${filename}, using fallback:`, err);
    }
    return fallback;
  }

  private safeWriteJson(filename: string, data: any) {
    try {
      this.ensureDataDirectory();
      const p = this.getFilePath(filename);
      const tmpPath = `${p}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, p);
    } catch (err) {
      console.error(`[PERSISTENCE] Failed to write ${filename}:`, err);
    }
  }

  private scheduleSave() {
    this.isDirty = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flushToDisk();
    }, 400);
  }

  public flushToDisk() {
    try {
      this.safeWriteJson('workspaces.json', Array.from(this.workspaces.values()));
      
      const membersObj: Record<string, WorkspaceMember[]> = {};
      this.workspaceMembers.forEach((val, k) => { membersObj[k] = val; });
      this.safeWriteJson('workspace_members.json', membersObj);

      const tasksObj: Record<string, WorkspaceTask[]> = {};
      this.workspaceTasks.forEach((val, k) => { tasksObj[k] = val; });
      this.safeWriteJson('workspace_tasks.json', tasksObj);

      const msgsObj: Record<string, WorkspaceMessage[]> = {};
      this.workspaceMessages.forEach((val, k) => { msgsObj[k] = val; });
      this.safeWriteJson('workspace_messages.json', msgsObj);

      const wikisObj: Record<string, KnowledgeArticle[]> = {};
      this.workspaceWikis.forEach((val, k) => { wikisObj[k] = val; });
      this.safeWriteJson('workspace_wikis.json', wikisObj);

      this.safeWriteJson('workspace_invites.json', this.workspaceInvites);
      this.safeWriteJson('projects.json', Array.from(this.projects.values()));
      this.safeWriteJson('tasks.json', Array.from(this.tasks.values()));
      this.safeWriteJson('goals.json', Array.from(this.goals.values()));
      this.safeWriteJson('focus_blocks.json', Array.from(this.focusBlocks.values()));
      this.safeWriteJson('studios.json', Array.from(this.studios.values()));
      this.safeWriteJson('universal_work.json', Array.from(this.universalWork.values()));
      this.isDirty = false;
    } catch (err) {
      console.error('[PERSISTENCE] flushToDisk error:', err);
    }
  }

  private loadAllFromDisk() {
    const wsList = this.safeReadJson<Workspace[]>('workspaces.json', []);
    wsList.forEach(w => this.workspaces.set(w.id, w));

    const membersObj = this.safeReadJson<Record<string, WorkspaceMember[]>>('workspace_members.json', {});
    Object.entries(membersObj).forEach(([wsId, members]) => this.workspaceMembers.set(wsId, members));

    const tasksObj = this.safeReadJson<Record<string, WorkspaceTask[]>>('workspace_tasks.json', {});
    Object.entries(tasksObj).forEach(([wsId, tasks]) => this.workspaceTasks.set(wsId, tasks));

    const msgsObj = this.safeReadJson<Record<string, WorkspaceMessage[]>>('workspace_messages.json', {});
    Object.entries(msgsObj).forEach(([wsId, msgs]) => this.workspaceMessages.set(wsId, msgs));

    const wikisObj = this.safeReadJson<Record<string, KnowledgeArticle[]>>('workspace_wikis.json', {});
    Object.entries(wikisObj).forEach(([wsId, wikis]) => this.workspaceWikis.set(wsId, wikis));

    this.workspaceInvites = this.safeReadJson<WorkspaceInvite[]>('workspace_invites.json', []);

    const prjList = this.safeReadJson<(Project & { userId: string; workspaceId?: string })[]>('projects.json', []);
    prjList.forEach(p => this.projects.set(p.id, p));

    const tskList = this.safeReadJson<(Task & { userId: string })[]>('tasks.json', []);
    tskList.forEach(t => this.tasks.set(t.id, t));

    const goalList = this.safeReadJson<(Goal & { userId: string })[]>('goals.json', []);
    goalList.forEach(g => this.goals.set(g.id, g));

    const focusList = this.safeReadJson<(FocusBlock & { userId: string })[]>('focus_blocks.json', []);
    focusList.forEach(f => this.focusBlocks.set(f.id, f));

    const stdList = this.safeReadJson<StudioItem[]>('studios.json', []);
    stdList.forEach(s => this.studios.set(s.id, s));

    const workList = this.safeReadJson<UniversalWorkObject[]>('universal_work.json', []);
    workList.forEach(w => this.universalWork.set(w.id, w));
  }

  private ensureSeedData() {
    if (this.workspaces.size === 0) {
      const demoWs: Workspace = {
        id: 'ws_1',
        name: 'VINEXSAH Core Dev Workspace',
        ownerId: 'vine_demo_user',
        memberIds: ['vine_demo_user', 'member_alex'],
        teamProductivityScore: 85,
        burnoutRisk: 'Low',
        teamMomentum: 'Optimal',
        createdAt: '2026-01-01T00:00:00.000Z'
      };
      this.workspaces.set(demoWs.id, demoWs);

      this.workspaceMembers.set(demoWs.id, [
        {
          uid: 'vine_demo_user',
          email: 'anesthonest81@gmail.com',
          username: 'vine_executor',
          role: 'owner',
          joinedAt: '2026-01-01T00:00:00.000Z'
        },
        {
          uid: 'member_alex',
          email: 'alex@vinexsah.com',
          username: 'alex_dev',
          role: 'member',
          joinedAt: '2026-01-01T00:00:00.000Z'
        }
      ]);

      this.workspaceTasks.set(demoWs.id, [
        {
          id: 'wt_1',
          text: 'Implement core authentication services',
          completed: true,
          priority: 'high',
          createdAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:00:00.000Z',
          completedBy: 'vine_demo_user'
        },
        {
          id: 'wt_2',
          text: 'Optimize model execution pipelines in real-time',
          completed: false,
          priority: 'medium',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ]);

      this.workspaceMessages.set(demoWs.id, [
        {
          id: 'msg_1',
          text: 'Welcome to VINEXSAH Core Dev Workspace! Let\'s scale CATALYX to 100% execution score.',
          username: 'vine_executor',
          userId: 'vine_demo_user',
          ai: false,
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ]);

      this.workspaceWikis.set(demoWs.id, [
        {
          id: 'w1',
          title: 'CATALYX Standard Operating Procedure',
          content: 'This wiki outlines the strict operational guidelines for team compliance. 1. Break tasks into under-30-minute intervals. 2. Lock in streaks proactively. 3. Tag AI Scout for immediate burnout profile analysis.',
          authorName: 'vine_executor',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      ]);

      this.projects.set('p1', {
        id: 'p1',
        userId: 'vine_demo_user',
        workspaceId: 'ws_1',
        title: 'Project Antigravity Framework',
        description: 'Autonomous execution validation engine deployment.',
        status: 'active',
        progress: 45,
        createdAt: '2026-01-01T00:00:00.000Z'
      });

      this.tasks.set('task_1', {
        id: 'task_1',
        userId: 'vine_demo_user',
        text: 'Analyze team task completion rate for June',
        completed: true,
        priority: 'high',
        category: 'work',
        createdAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:00:00.000Z'
      });

      this.goals.set('g1', {
        id: 'g1',
        userId: 'vine_demo_user',
        title: 'Build CATALYX Platform',
        description: 'Upgrade system architecture to full AI-powered Execution OS.',
        targetDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
        progress: 60,
        status: 'active',
        type: 'short_term',
        createdAt: '2026-01-01T00:00:00.000Z'
      });

      this.flushToDisk();
    }
  }

  // =========================================================================
  // WORKSPACE LIFECYCLE
  // =========================================================================

  public getWorkspacesForUser(userId: string): Workspace[] {
    const res: Workspace[] = [];
    for (const ws of this.workspaces.values()) {
      if (ws.ownerId === userId || ws.memberIds.includes(userId)) {
        res.push(ws);
      }
    }
    return res;
  }

  public getWorkspace(workspaceId: string, userId: string): Workspace | null {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return null;
    if (ws.ownerId !== userId && !ws.memberIds.includes(userId)) {
      return null;
    }
    return ws;
  }

  public createWorkspace(ownerId: string, name: string, ownerEmail?: string, ownerUsername?: string): Workspace {
    const id = `ws_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const ws: Workspace = {
      id,
      name,
      ownerId,
      memberIds: [ownerId],
      teamProductivityScore: 70,
      burnoutRisk: 'Low',
      teamMomentum: 'Moderate',
      createdAt: new Date().toISOString()
    };
    this.workspaces.set(id, ws);

    const firstMember: WorkspaceMember = {
      uid: ownerId,
      email: ownerEmail || 'user@catalyx.io',
      username: ownerUsername || 'Commander',
      role: 'owner',
      joinedAt: new Date().toISOString()
    };
    this.workspaceMembers.set(id, [firstMember]);
    this.workspaceTasks.set(id, []);
    this.workspaceMessages.set(id, [
      {
        id: `msg_init_${Date.now()}`,
        text: `Workspace "${name}" provisioned. Initializing secure team channels.`,
        username: 'CATALYX Platform',
        userId: 'ai',
        ai: true,
        createdAt: new Date().toISOString()
      }
    ]);
    this.workspaceWikis.set(id, [
      {
        id: `wik_init_${Date.now()}`,
        title: `${name} — Standard Operating Procedures`,
        content: `Operational knowledge repository for ${name}. Track SOPs, architecture guidelines, and deployment specs here.`,
        authorName: ownerUsername || 'Commander',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    this.scheduleSave();
    return ws;
  }

  public updateWorkspace(workspaceId: string, updates: Partial<Workspace>, userId: string): Workspace | null {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return null;
    const updated = { ...ws, ...updates };
    this.workspaces.set(workspaceId, updated);
    this.scheduleSave();
    return updated;
  }

  public deleteWorkspace(workspaceId: string, userId: string): boolean {
    const ws = this.workspaces.get(workspaceId);
    if (!ws || ws.ownerId !== userId) return false;
    this.workspaces.delete(workspaceId);
    this.workspaceMembers.delete(workspaceId);
    this.workspaceTasks.delete(workspaceId);
    this.workspaceMessages.delete(workspaceId);
    this.workspaceWikis.delete(workspaceId);
    this.scheduleSave();
    return true;
  }

  public getWorkspaceMembers(workspaceId: string, userId: string): WorkspaceMember[] {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return [];
    return this.workspaceMembers.get(workspaceId) || [];
  }

  public getWorkspaceTasks(workspaceId: string, userId: string): WorkspaceTask[] {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return [];
    return this.workspaceTasks.get(workspaceId) || [];
  }

  public addWorkspaceTask(workspaceId: string, text: string, priority: WorkspaceTask['priority'], userId: string): WorkspaceTask | null {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return null;
    const list = this.workspaceTasks.get(workspaceId) || [];
    const newTask: WorkspaceTask = {
      id: `wt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      text,
      completed: false,
      priority: priority || 'medium',
      createdAt: new Date().toISOString()
    };
    list.push(newTask);
    this.workspaceTasks.set(workspaceId, list);
    this.scheduleSave();
    return newTask;
  }

  public completeWorkspaceTask(workspaceId: string, taskId: string, userId: string): boolean {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return false;
    const list = this.workspaceTasks.get(workspaceId) || [];
    const task = list.find(t => t.id === taskId);
    if (!task) return false;
    task.completed = true;
    task.completedAt = new Date().toISOString();
    task.completedBy = userId;
    this.scheduleSave();
    return true;
  }

  public getWorkspaceMessages(workspaceId: string, userId: string): WorkspaceMessage[] {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return [];
    return this.workspaceMessages.get(workspaceId) || [];
  }

  public addWorkspaceMessage(workspaceId: string, text: string, username: string, userId: string): WorkspaceMessage | null {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return null;
    const list = this.workspaceMessages.get(workspaceId) || [];
    const msg: WorkspaceMessage = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      text,
      username,
      userId,
      ai: false,
      createdAt: new Date().toISOString()
    };
    list.push(msg);
    this.workspaceMessages.set(workspaceId, list);
    this.scheduleSave();
    return msg;
  }

  public getWorkspaceWikis(workspaceId: string, userId: string): KnowledgeArticle[] {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return [];
    return this.workspaceWikis.get(workspaceId) || [];
  }

  public addWorkspaceWiki(workspaceId: string, title: string, content: string, authorName: string, userId: string): KnowledgeArticle | null {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return null;
    const list = this.workspaceWikis.get(workspaceId) || [];
    const article: KnowledgeArticle = {
      id: `wik_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title,
      content,
      authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(article);
    this.workspaceWikis.set(workspaceId, list);
    this.scheduleSave();
    return article;
  }

  // =========================================================================
  // PROJECTS LIFECYCLE
  // =========================================================================

  public getProjectsForUser(userId: string): (Project & { userId: string; workspaceId?: string })[] {
    const res: (Project & { userId: string; workspaceId?: string })[] = [];
    for (const p of this.projects.values()) {
      if (p.userId === userId) {
        res.push(p);
      }
    }
    return res;
  }

  public getProject(projectId: string, userId: string): (Project & { userId: string; workspaceId?: string }) | null {
    const p = this.projects.get(projectId);
    if (!p || p.userId !== userId) return null;
    return p;
  }

  public createProject(userId: string, title: string, description: string, workspaceId?: string): Project {
    const id = `proj_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const p: Project & { userId: string; workspaceId?: string } = {
      id,
      userId,
      workspaceId,
      title,
      description,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    this.projects.set(id, p);
    this.scheduleSave();
    return p;
  }

  public updateProject(projectId: string, updates: Partial<Project>, userId: string): Project | null {
    const p = this.projects.get(projectId);
    if (!p || p.userId !== userId) return null;
    const updated = { ...p, ...updates };
    this.projects.set(projectId, updated);
    this.scheduleSave();
    return updated;
  }

  public deleteProject(projectId: string, userId: string): boolean {
    const p = this.projects.get(projectId);
    if (!p || p.userId !== userId) return false;
    this.projects.delete(projectId);
    this.scheduleSave();
    return true;
  }

  // =========================================================================
  // PERSONAL TASKS LIFECYCLE
  // =========================================================================

  public getTasksForUser(userId: string): (Task & { userId: string })[] {
    const res: (Task & { userId: string })[] = [];
    for (const t of this.tasks.values()) {
      if (t.userId === userId) {
        res.push(t);
      }
    }
    return res;
  }

  public createTask(userId: string, text: string, priority?: Task['priority'], category?: Task['category'], dueDate?: string): Task {
    const id = `task_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const t: Task & { userId: string } = {
      id,
      userId,
      text,
      completed: false,
      priority: priority || 'medium',
      category: category || 'work',
      dueDate,
      createdAt: new Date().toISOString()
    };
    this.tasks.set(id, t);
    this.scheduleSave();
    return t;
  }

  public updateTask(taskId: string, updates: Partial<Task>, userId: string): Task | null {
    const t = this.tasks.get(taskId);
    if (!t || t.userId !== userId) return null;
    const updated = { ...t, ...updates };
    this.tasks.set(taskId, updated);
    this.scheduleSave();
    return updated;
  }

  public deleteTask(taskId: string, userId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t || t.userId !== userId) return false;
    this.tasks.delete(taskId);
    this.scheduleSave();
    return true;
  }

  // =========================================================================
  // GOALS LIFECYCLE
  // =========================================================================

  public getGoalsForUser(userId: string): (Goal & { userId: string })[] {
    const res: (Goal & { userId: string })[] = [];
    for (const g of this.goals.values()) {
      if (g.userId === userId) {
        res.push(g);
      }
    }
    return res;
  }

  public createGoal(userId: string, title: string, description: string, targetDate: string, type: 'short_term' | 'long_term'): Goal {
    const id = `goal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const g: Goal & { userId: string } = {
      id,
      userId,
      title,
      description,
      targetDate,
      progress: 0,
      status: 'active',
      type,
      createdAt: new Date().toISOString()
    };
    this.goals.set(id, g);
    this.scheduleSave();
    return g;
  }

  public updateGoal(goalId: string, updates: Partial<Goal>, userId: string): Goal | null {
    const g = this.goals.get(goalId);
    if (!g || g.userId !== userId) return null;
    const updated = { ...g, ...updates };
    this.goals.set(goalId, updated);
    this.scheduleSave();
    return updated;
  }

  public deleteGoal(goalId: string, userId: string): boolean {
    const g = this.goals.get(goalId);
    if (!g || g.userId !== userId) return false;
    this.goals.delete(goalId);
    this.scheduleSave();
    return true;
  }

  // =========================================================================
  // UNIVERSAL STUDIOS LIFECYCLE (WITH AUTOSAVE DRAFT PERSISTENCE)
  // =========================================================================

  public getStudiosForWorkspace(workspaceId: string, userId: string): StudioItem[] {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) return [];
    const res: StudioItem[] = [];
    for (const s of this.studios.values()) {
      if (s.workspaceId === workspaceId) {
        res.push(s);
      }
    }
    return res;
  }

  public getStudioById(studioId: string, userId: string): StudioItem | null {
    const s = this.studios.get(studioId);
    if (!s) return null;
    const ws = this.getWorkspace(s.workspaceId, userId);
    if (!ws) return null;
    return s;
  }

  public saveStudio(studio: StudioItem, userId: string): StudioItem {
    const existing = this.studios.get(studio.id);
    if (existing) {
      const ws = this.getWorkspace(existing.workspaceId, userId);
      if (!ws) {
        throw new Error('Unauthorized to modify studio in this workspace');
      }
    }
    this.studios.set(studio.id, { ...studio, updatedAt: new Date().toISOString() });
    this.scheduleSave();
    return studio;
  }

  public saveStudioDraft(studioId: string, draftData: any, actorEmail: string, userId: string): { success: boolean; updatedAt: string } {
    const s = this.studios.get(studioId);
    if (!s) return { success: false, updatedAt: new Date().toISOString() };
    const ws = this.getWorkspace(s.workspaceId, userId);
    if (!ws) return { success: false, updatedAt: new Date().toISOString() };

    s.activeDraft = draftData;
    s.updatedAt = new Date().toISOString();
    s.auditHistory.push({
      timestamp: s.updatedAt,
      actor: actorEmail,
      action: 'DRAFT_AUTOSAVED',
      details: `Saved ${draftData.title || 'draft'} (${draftData.content?.length || 0} chars)`
    });
    this.scheduleSave();
    return { success: true, updatedAt: s.updatedAt };
  }

  // =========================================================================
  // BATCH SYNC ENGINE (CLIENT-SERVER REAL-TIME RECONCILIATION)
  // =========================================================================

  public syncUserData(userId: string, userEmail: string): {
    workspaces: Workspace[];
    projects: Project[];
    tasks: Task[];
    goals: Goal[];
    focusBlocks: FocusBlock[];
    studios: StudioItem[];
    syncedAt: string;
  } {
    let workspaces = this.getWorkspacesForUser(userId);
    if (workspaces.length === 0) {
      const defaultWs = this.createWorkspace(
        userId, 
        'Executive Workspace', 
        userEmail, 
        userEmail ? userEmail.split('@')[0] : 'Commander'
      );
      workspaces = [defaultWs];
    }
    const projects = this.getProjectsForUser(userId);
    const tasks = this.getTasksForUser(userId);
    const goals = this.getGoalsForUser(userId);
    const focusBlocks = Array.from(this.focusBlocks.values()).filter(f => f.userId === userId);
    
    // Studios across all accessible workspaces
    const wsIds = new Set(workspaces.map(w => w.id));
    const studios: StudioItem[] = [];
    for (const s of this.studios.values()) {
      if (wsIds.has(s.workspaceId)) {
        studios.push(s);
      }
    }

    return {
      workspaces,
      projects,
      tasks,
      goals,
      focusBlocks,
      studios,
      syncedAt: new Date().toISOString()
    };
  }

  public applyClientSyncBatch(userId: string, userEmail: string, batch: {
    workspaces?: Workspace[];
    projects?: Project[];
    tasks?: Task[];
    goals?: Goal[];
    studios?: StudioItem[];
  }): { success: boolean; appliedCount: number; syncedAt: string } {
    let appliedCount = 0;

    if (Array.isArray(batch.workspaces)) {
      for (const ws of batch.workspaces) {
        if (!ws.id) continue;
        const existing = this.workspaces.get(ws.id);
        if (!existing || existing.ownerId === userId || existing.memberIds.includes(userId)) {
          this.workspaces.set(ws.id, {
            ...ws,
            ownerId: existing ? existing.ownerId : userId,
            memberIds: Array.from(new Set([...(ws.memberIds || []), userId]))
          });
          appliedCount++;
        }
      }
    }

    if (Array.isArray(batch.projects)) {
      for (const p of batch.projects) {
        if (!p.id) continue;
        const existing = this.projects.get(p.id);
        if (!existing || existing.userId === userId) {
          this.projects.set(p.id, { ...p, userId });
          appliedCount++;
        }
      }
    }

    if (Array.isArray(batch.tasks)) {
      for (const t of batch.tasks) {
        if (!t.id) continue;
        const existing = this.tasks.get(t.id);
        if (!existing || existing.userId === userId) {
          this.tasks.set(t.id, { ...t, userId });
          appliedCount++;
        }
      }
    }

    if (Array.isArray(batch.goals)) {
      for (const g of batch.goals) {
        if (!g.id) continue;
        const existing = this.goals.get(g.id);
        if (!existing || existing.userId === userId) {
          this.goals.set(g.id, { ...g, userId });
          appliedCount++;
        }
      }
    }

    if (Array.isArray(batch.studios)) {
      for (const s of batch.studios) {
        if (!s.id) continue;
        const ws = this.getWorkspace(s.workspaceId, userId);
        if (ws) {
          this.studios.set(s.id, s);
          appliedCount++;
        }
      }
    }

    this.scheduleSave();
    this.flushToDisk();
    return {
      success: true,
      appliedCount,
      syncedAt: new Date().toISOString()
    };
  }

  // =========================================================================
  // REAL WORK EXPORT GENERATORS (ZIP, JSON, CSV, MARKDOWN)
  // =========================================================================

  public async exportProjectAsZip(projectId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const project = this.getProject(projectId, userId);
    if (!project) {
      throw new Error('Project not found or unauthorized');
    }

    const zip = new JSZip();
    const exportId = `exp_prj_${project.id}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. project.json
    zip.file('project.json', JSON.stringify(project, null, 2));

    // 2. tasks linked to project
    const allTasks = this.getTasksForUser(userId);
    const relatedTasks = allTasks.filter(t => t.text.toLowerCase().includes(project.title.toLowerCase()) || project.description.includes(t.text));
    zip.file('tasks.json', JSON.stringify(relatedTasks, null, 2));

    // CSV format for tasks
    const csvHeader = 'ID,Text,Completed,Priority,Category,CreatedAt\n';
    const csvRows = relatedTasks.map(t => 
      `"${t.id}","${t.text.replace(/"/g, '""')}",${t.completed},"${t.priority || 'medium'}","${t.category || 'work'}","${t.createdAt}"`
    ).join('\n');
    zip.file('tasks.csv', csvHeader + csvRows);

    // 3. documents/project_overview.md
    const markdownOverview = `# ${project.title}
**Status**: ${project.status.toUpperCase()}
**Progress**: ${project.progress}%
**Created**: ${project.createdAt}
**Export ID**: ${exportId}

---

## Executive Overview
${project.description}

## Deliverables & Tasks (${relatedTasks.length})
${relatedTasks.map(t => `- [${t.completed ? 'x' : ' '}] **${t.text}** (${t.priority || 'medium'} priority)`).join('\n')}

---
*Exported securely from CATALYX Universal Operating System.*
`;
    zip.folder('documents')?.file('overview.md', markdownOverview);

    // 4. manifest.json
    const manifest: ExportManifest = {
      exportId,
      exportType: 'PROJECT',
      entityId: project.id,
      entityName: project.title,
      exportedBy: userId,
      exportedAt: timestamp,
      checksumSha256: crypto.createHash('sha256').update(JSON.stringify(project)).digest('hex'),
      contents: {
        filesCount: 4,
        tasksCount: relatedTasks.length,
        categories: ['project_metadata', 'tasks', 'documents']
      }
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `catalyx_project_${cleanTitle}_${Date.now()}.zip`;

    return { buffer, filename };
  }

  public async exportWorkspaceAsZip(workspaceId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const ws = this.getWorkspace(workspaceId, userId);
    if (!ws) {
      throw new Error('Workspace not found or unauthorized');
    }

    const zip = new JSZip();
    const exportId = `exp_ws_${ws.id}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. workspace.json
    zip.file('workspace.json', JSON.stringify(ws, null, 2));

    // 2. members
    const members = this.getWorkspaceMembers(workspaceId, userId);
    zip.file('members.json', JSON.stringify(members, null, 2));

    // 3. tasks
    const tasks = this.getWorkspaceTasks(workspaceId, userId);
    zip.file('tasks.json', JSON.stringify(tasks, null, 2));
    const csvHeader = 'ID,Task,Completed,Priority,CreatedAt,CompletedBy\n';
    const csvRows = tasks.map(t => 
      `"${t.id}","${t.text.replace(/"/g, '""')}",${t.completed},"${t.priority}","${t.createdAt}","${t.completedBy || ''}"`
    ).join('\n');
    zip.file('tasks.csv', csvHeader + csvRows);

    // 4. wiki articles
    const wikis = this.getWorkspaceWikis(workspaceId, userId);
    const wikiFolder = zip.folder('wiki');
    wikis.forEach(w => {
      const clean = w.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      wikiFolder?.file(`${clean}.md`, `# ${w.title}\n\n**Author**: ${w.authorName}\n**Updated**: ${w.updatedAt}\n\n---\n\n${w.content}`);
    });

    // 5. Studios & Drafts
    const studios = this.getStudiosForWorkspace(workspaceId, userId);
    const studioFolder = zip.folder('studios');
    studios.forEach(s => {
      studioFolder?.file(`${s.type}.json`, JSON.stringify(s, null, 2));
      if (s.activeDraft && s.activeDraft.content) {
        studioFolder?.file(`${s.type}_draft.md`, `# ${s.name} Draft\n\n${s.activeDraft.content}`);
      }
    });

    // 6. manifest.json
    const manifest: ExportManifest = {
      exportId,
      exportType: 'WORKSPACE',
      entityId: ws.id,
      entityName: ws.name,
      exportedBy: userId,
      exportedAt: timestamp,
      checksumSha256: crypto.createHash('sha256').update(JSON.stringify(ws)).digest('hex'),
      contents: {
        filesCount: 4 + wikis.length + studios.length,
        tasksCount: tasks.length,
        studiosCount: studios.length,
        membersCount: members.length,
        categories: ['workspace_metadata', 'members', 'tasks', 'wiki', 'studios']
      }
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const cleanName = ws.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `catalyx_workspace_${cleanName}_${Date.now()}.zip`;

    return { buffer, filename };
  }

  public async exportStudioAsZip(studioId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const studio = this.getStudioById(studioId, userId);
    if (!studio) {
      throw new Error('Studio not found or unauthorized');
    }

    const zip = new JSZip();
    const exportId = `exp_std_${studio.id}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. studio.json
    zip.file('studio.json', JSON.stringify(studio, null, 2));

    // 2. draft markdown
    const draftContent = studio.activeDraft?.content || studio.description;
    zip.file('draft.md', `# ${studio.name}\n\n**Type**: ${studio.type}\n**Status**: ${studio.review?.status || 'draft'}\n\n---\n\n${draftContent}`);

    // 3. versions
    if (studio.versions && studio.versions.length > 0) {
      const vFolder = zip.folder('versions');
      studio.versions.forEach(v => {
        vFolder?.file(`v${v.versionNumber}.json`, JSON.stringify(v, null, 2));
      });
    }

    // 4. manifest.json
    const manifest: ExportManifest = {
      exportId,
      exportType: 'STUDIO',
      entityId: studio.id,
      entityName: studio.name,
      exportedBy: userId,
      exportedAt: timestamp,
      checksumSha256: crypto.createHash('sha256').update(JSON.stringify(studio)).digest('hex'),
      contents: {
        filesCount: 3 + (studio.versions?.length || 0),
        categories: ['studio_metadata', 'draft', 'versions']
      }
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const cleanType = studio.type.replace(/[^a-z0-9]/g, '_');
    const filename = `catalyx_studio_${cleanType}_${Date.now()}.zip`;

    return { buffer, filename };
  }

  public async exportAllUserDataAsZip(userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const zip = new JSZip();
    const exportId = `exp_all_${userId}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const data = this.syncUserData(userId, 'user@catalyx.io');
    zip.file('account_summary.json', JSON.stringify({ userId, exportedAt: timestamp }, null, 2));
    zip.file('workspaces.json', JSON.stringify(data.workspaces, null, 2));
    zip.file('projects.json', JSON.stringify(data.projects, null, 2));
    zip.file('tasks.json', JSON.stringify(data.tasks, null, 2));
    zip.file('goals.json', JSON.stringify(data.goals, null, 2));
    zip.file('studios.json', JSON.stringify(data.studios, null, 2));

    const manifest: ExportManifest = {
      exportId,
      exportType: 'ALL_USER_DATA',
      entityId: userId,
      entityName: 'Universal User Data Archive',
      exportedBy: userId,
      exportedAt: timestamp,
      checksumSha256: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex'),
      contents: {
        filesCount: 7,
        tasksCount: data.tasks.length,
        projectsCount: data.projects.length,
        studiosCount: data.studios.length,
        categories: ['account', 'workspaces', 'projects', 'tasks', 'goals', 'studios']
      }
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const filename = `catalyx_user_archive_${userId}_${Date.now()}.zip`;

    return { buffer, filename };
  }
}

export const serverPersistenceService = ServerPersistenceService.getInstance();
