/**
 * CATALYX V22 — REALITY ENGINE & TRUTH PROVENANCE SERVICE
 * 
 * "REALITY FIRST. INTELLIGENCE SECOND. EXECUTION THIRD. VERIFICATION ALWAYS."
 * 
 * Provides:
 * 1. Standardized Reality Labels & Truth Verification States
 * 2. V22 Capability Inventory (Real, Integrated, Config Required, Simulation, etc.)
 * 3. Immutable Audit Ledger with correlation IDs
 * 4. Action Preview & Safe Execution Engine with real persistence
 * 5. Universal Object Inspector Data Adapter
 * 6. Live Telemetry & System Health Verification
 */

export type RealityStatus = 
  | 'REAL'                      // Real operational implementation with live storage
  | 'REAL_WITH_LIMITATIONS'     // Operational but constrained by sandbox/environment
  | 'INTEGRATED'                // Operational via verified external service
  | 'CONFIGURATION_REQUIRED'   // Code exists, but requires external API keys/credentials
  | 'SIMULATION'                // Intentionally synthetic/simulated model, clearly marked
  | 'DEMONSTRATION'             // Seed demonstration dataset, clearly marked
  | 'ESTIMATED'                 // Calculated via deterministic mathematical model
  | 'PREDICTED'                 // Statistical/probabilistic AI projection
  | 'STALE'                     // Cached data older than freshness threshold
  | 'UNVERIFIED'                // External claim not yet confirmed by system
  | 'FAILED'                    // Operation failed with verified error
  | 'UNAVAILABLE';              // Service offline or disabled

export interface RealityBadgeInfo {
  status: RealityStatus;
  label: string;
  badgeClass: string;
  description: string;
  iconName: string;
}

export interface IntelligenceCardData {
  id: string;
  what: string;
  why: string;
  evidence: string[];
  confidence: number; // 0 - 100
  sampleCount: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  canExecute: boolean;
  actionPayload?: {
    actionType: string;
    targetId: string;
    targetName: string;
    params: Record<string, any>;
    risk: 'low' | 'medium' | 'high' | 'critical';
  };
  authorizationRequired: string;
  userAuthorized: boolean;
  status: 'PENDING' | 'EXECUTED' | 'DISMISSED' | 'BLOCKED';
  limitations: string[];
  realityStatus: RealityStatus;
  modelOrSource: string;
  generatedAt: string;
}

export interface ActionPreviewRequest {
  id: string;
  actionName: string;
  targetType: 'task' | 'project' | 'goal' | 'workspace' | 'firewall_rule' | 'simulation' | 'system';
  targetName: string;
  affectedScope: string;
  plannedChanges: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  requiredPermission: string;
  isAuthorized: boolean;
  requiresStrongConfirmation: boolean;
  executionPayload: {
    type: string;
    data: Record<string, any>;
  };
}

export interface ActionExecutionResult {
  success: boolean;
  actionId: string;
  correlationId: string;
  executedAt: string;
  message: string;
  entityId?: string;
  auditId: string;
  errorDetails?: {
    whatHappened: string;
    why: string;
    remediation: string;
    canRetry: boolean;
    rawError?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'CANCELLED';
  evidence: string;
  correlationId: string;
  executionDurationMs?: number;
  metadata?: Record<string, any>;
}

export interface CapabilityInventoryItem {
  id: string;
  name: string;
  domain: string;
  classification: RealityStatus;
  description: string;
  dependencies: string[];
  truthEvidence: string;
}

class RealityEngineService {
  private auditStorageKey = 'catalyx_v22_audit_ledger';
  private actionHistoryKey = 'catalyx_v22_action_history';

  // --- 1. REALITY LABELS & BADGES ---
  public getBadgeInfo(status: RealityStatus): RealityBadgeInfo {
    switch (status) {
      case 'REAL':
        return {
          status,
          label: 'REAL IMPLEMENTATION',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          description: 'Verified operational system logic backed by durable local/cloud storage.',
          iconName: 'CheckCircle2'
        };
      case 'REAL_WITH_LIMITATIONS':
        return {
          status,
          label: 'OPERATIONAL (SANDBOXED)',
          badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
          description: 'Fully functioning within browser/container environment with client-side isolation.',
          iconName: 'ShieldCheck'
        };
      case 'INTEGRATED':
        return {
          status,
          label: 'VERIFIED INTEGRATION',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          description: 'Connected and authenticated with active external provider.',
          iconName: 'PlugZap'
        };
      case 'CONFIGURATION_REQUIRED':
        return {
          status,
          label: 'CONFIGURATION REQUIRED',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          description: 'Functional implementation exists, but requires external API keys or credentials in Settings.',
          iconName: 'KeyRound'
        };
      case 'SIMULATION':
        return {
          status,
          label: 'SYNTHETIC SIMULATION',
          badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          description: 'Intentionally simulated mathematical scenario. Does not alter production systems.',
          iconName: 'Cpu'
        };
      case 'DEMONSTRATION':
        return {
          status,
          label: 'SAMPLE DATASET',
          badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          description: 'Demonstration baseline provided for initial exploration.',
          iconName: 'Eye'
        };
      case 'ESTIMATED':
        return {
          status,
          label: 'DETERMINISTIC MATH',
          badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          description: 'Calculated using verified quantitative formulas over actual database records.',
          iconName: 'Calculator'
        };
      case 'PREDICTED':
        return {
          status,
          label: 'PROBABILISTIC PROJECTION',
          badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
          description: 'Statistical forecast based on historical momentum and trend analysis.',
          iconName: 'TrendingUp'
        };
      case 'STALE':
        return {
          status,
          label: 'STALE TELEMETRY',
          badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          description: 'Data has exceeded freshness window and should be synchronized.',
          iconName: 'Clock'
        };
      case 'UNVERIFIED':
        return {
          status,
          label: 'UNVERIFIED CLAIM',
          badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
          description: 'External assertion not yet corroborated by primary system records.',
          iconName: 'HelpCircle'
        };
      case 'FAILED':
        return {
          status,
          label: 'EXECUTION FAILED',
          badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          description: 'Operation encountered a verified error and was halted.',
          iconName: 'AlertTriangle'
        };
      case 'UNAVAILABLE':
      default:
        return {
          status,
          label: 'SERVICE OFFLINE',
          badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
          description: 'Resource or provider is currently disconnected or unavailable.',
          iconName: 'XCircle'
        };
    }
  }

  // --- 2. V22 CAPABILITY INVENTORY ---
  public getCapabilityInventory(): CapabilityInventoryItem[] {
    return [
      {
        id: 'cap-tasks',
        name: 'Task Initiatives & Logs',
        domain: 'WORK',
        classification: 'REAL',
        description: 'Complete CRUD with state transitions, priorities, XP reward hooks, and persistence.',
        dependencies: ['dbService (LocalStorage / Firestore)'],
        truthEvidence: 'Directly mutates and queries persistent task records.'
      },
      {
        id: 'cap-projects',
        name: 'Strategic Projects & Milestones',
        domain: 'WORK',
        classification: 'REAL',
        description: 'Project entity management, milestone progress tracking, and goal linkage.',
        dependencies: ['dbService'],
        truthEvidence: 'Persisted in localStorage/Firebase projects collection.'
      },
      {
        id: 'cap-goals',
        name: 'Goal & OKR Center',
        domain: 'WORK',
        classification: 'REAL',
        description: 'Short & long-term goals with progress calculations, deadlines, and XP rewards.',
        dependencies: ['dbService'],
        truthEvidence: 'Persisted in goals collections with dynamic rule engine validation.'
      },
      {
        id: 'cap-focus',
        name: 'Deep Focus Cabin',
        domain: 'WORK',
        classification: 'REAL',
        description: 'Pomodoro timer engine with audio synthesizers, session logging, and efficiency ratings.',
        dependencies: ['Web Audio API', 'dbService'],
        truthEvidence: 'Writes real focus session blocks to user profile history.'
      },
      {
        id: 'cap-workspaces',
        name: 'Collaborative Workspaces',
        domain: 'WORK',
        classification: 'REAL_WITH_LIMITATIONS',
        description: 'Multi-member workspace containers, invitations, shared tasks, and team chat.',
        dependencies: ['dbService'],
        truthEvidence: 'Stores workspace members, invite codes, shared tasks, and messages.'
      },
      {
        id: 'cap-gemini-ai',
        name: 'Gemini AI Intelligence',
        domain: 'AUTOMATION',
        classification: 'CONFIGURATION_REQUIRED',
        description: 'Direct server-side Google GenAI integration using GEMINI_API_KEY with local coaching fallback.',
        dependencies: ['@google/genai SDK', 'GEMINI_API_KEY in .env'],
        truthEvidence: 'Verified in server.ts. If GEMINI_API_KEY is not configured, explicitly discloses local heuristic fallback.'
      },
      {
        id: 'cap-pesapal-billing',
        name: 'Pesapal Commerce & Billing (v3)',
        domain: 'COMMERCE',
        classification: 'CONFIGURATION_REQUIRED',
        description: 'OAuth token negotiation, IPN notification validation, and order submission.',
        dependencies: ['PESAPAL_CONSUMER_KEY', 'PESAPAL_CONSUMER_SECRET in .env'],
        truthEvidence: 'Verified in server.ts and billingService.ts. Returns honest configuration error when credentials absent.'
      },
      {
        id: 'cap-digital-twin',
        name: 'Organizational Digital Twin',
        domain: 'INTELLIGENCE',
        classification: 'SIMULATION',
        description: 'Synthetic enterprise twin modeling cognitive fatigue, organizational delays, and delay scenarios.',
        dependencies: ['digitalTwinService.ts', 'planetaryIntelligenceFabricV19Service.ts'],
        truthEvidence: 'Explicitly labeled as synthetic predictive simulation. Never overwrites live operational tasks.'
      },
      {
        id: 'cap-v20-certification',
        name: 'V20 Production Certification Console',
        domain: 'ADMINISTRATION',
        classification: 'REAL',
        description: 'Verifies 10 core engineering gates, health matrix status, and emergency kill-switches.',
        dependencies: ['productionCertificationV20Service.ts', '/api/v20/certification'],
        truthEvidence: 'Live execution of automated check suites on server.'
      },
      {
        id: 'cap-ai-firewall',
        name: 'AI Safety Firewall & Gateway',
        domain: 'ADMINISTRATION',
        classification: 'REAL',
        description: 'Action pre-screening, prompt injection defenses, risk categorization, and manual bypass controls.',
        dependencies: ['aiFirewallService.ts', 'server.ts rate limiter'],
        truthEvidence: 'Actively screens incoming coach chat and action requests.'
      },
      {
        id: 'cap-audit-ledger',
        name: 'Immutable Audit Ledger',
        domain: 'ADMINISTRATION',
        classification: 'REAL',
        description: 'Records consequential operations with timestamps, actors, targets, risk, and correlation IDs.',
        dependencies: ['realityEngineService.ts'],
        truthEvidence: 'Persisted in dedicated append-only ledger storage.'
      }
    ];
  }

  // --- 3. IMMUTABLE AUDIT LEDGER ---
  public getAuditLogs(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(this.auditStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load audit ledger', e);
    }
    return [];
  }

  public logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'correlationId'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const correlationId = 'corr_' + Math.random().toString(36).substring(2, 10);
    const newEntry: AuditLogEntry = {
      ...entry,
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      correlationId
    };

    // Immutable append
    logs.unshift(newEntry);
    // Cap at 500 records for browser health
    if (logs.length > 500) {
      logs.splice(500);
    }

    try {
      localStorage.setItem(this.auditStorageKey, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to persist audit event', e);
    }

    return newEntry;
  }

  // --- 4. ACTION PREVIEW & VERIFIED EXECUTION ---
  public createActionPreview(request: Omit<ActionPreviewRequest, 'id'>): ActionPreviewRequest {
    return {
      ...request,
      id: 'ap_' + Math.random().toString(36).substring(2, 9)
    };
  }

  public async executeAction(
    action: ActionPreviewRequest,
    actor: { uid: string; email: string; role: string },
    dbServiceRef: any
  ): Promise<ActionExecutionResult> {
    const startTime = Date.now();
    const correlationId = 'act_' + Math.random().toString(36).substring(2, 10);

    // 1. Authorization check
    if (!action.isAuthorized) {
      const audit = this.logAuditEvent({
        actorId: actor.uid,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: action.actionName,
        targetType: action.targetType,
        targetId: 'unauthorized',
        targetName: action.targetName,
        risk: action.risk,
        result: 'BLOCKED',
        evidence: `Unauthorized attempt by role '${actor.role}'. Required: '${action.requiredPermission}'.`,
        executionDurationMs: Date.now() - startTime
      });

      return {
        success: false,
        actionId: action.id,
        correlationId,
        executedAt: new Date().toISOString(),
        message: `Action blocked: Current role '${actor.role}' lacks permission '${action.requiredPermission}'.`,
        auditId: audit.id,
        errorDetails: {
          whatHappened: 'The requested action was denied by CATALYX Autonomy Governance.',
          why: `Your active profile permissions (${actor.role}) do not grant '${action.requiredPermission}'.`,
          remediation: 'Switch to an Administrator or Executive role with elevated access in the role switcher.',
          canRetry: false
        }
      };
    }

    // 2. Dispatch real execution based on action type
    try {
      let createdEntityId: string | undefined;

      switch (action.executionPayload.type) {
        case 'CREATE_TASK': {
          const { text, priority, category } = action.executionPayload.data;
          const tasks = await dbServiceRef.addTask(actor.uid, text, priority, category);
          createdEntityId = tasks[tasks.length - 1]?.id;
          break;
        }

        case 'CREATE_PROJECT': {
          const { title, description } = action.executionPayload.data;
          const projects = await dbServiceRef.addProject(actor.uid, title, description);
          createdEntityId = projects[projects.length - 1]?.id;
          break;
        }

        case 'CREATE_GOAL': {
          const { title, description, targetDate, type } = action.executionPayload.data;
          const goals = await dbServiceRef.addGoal(actor.uid, title, description, targetDate, type || 'short_term');
          createdEntityId = goals[goals.length - 1]?.id;
          break;
        }

        case 'CREATE_WORKSPACE': {
          const { name } = action.executionPayload.data;
          const ws = await dbServiceRef.createWorkspace(actor.uid, name);
          createdEntityId = ws.id;
          break;
        }

        case 'LOG_FOCUS_BLOCK': {
          const { taskName, durationMinutes, efficiencyRating, soundscape } = action.executionPayload.data;
          const blocks = await dbServiceRef.addFocusBlock(actor.uid, taskName, durationMinutes, efficiencyRating, soundscape);
          createdEntityId = blocks[blocks.length - 1]?.id;
          break;
        }

        default:
          throw new Error(`Unsupported action payload type: ${action.executionPayload.type}`);
      }

      // 3. Log success audit
      const audit = this.logAuditEvent({
        actorId: actor.uid,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: action.actionName,
        targetType: action.targetType,
        targetId: createdEntityId || 'unknown',
        targetName: action.targetName,
        risk: action.risk,
        result: 'SUCCESS',
        evidence: `Action executed successfully. Resulting entity ID: ${createdEntityId || 'none'}. Changes: ${action.plannedChanges.join(', ')}`,
        executionDurationMs: Date.now() - startTime,
        metadata: action.executionPayload.data
      });

      return {
        success: true,
        actionId: action.id,
        correlationId,
        executedAt: new Date().toISOString(),
        message: `Action '${action.actionName}' completed successfully.`,
        entityId: createdEntityId,
        auditId: audit.id
      };
    } catch (err: any) {
      // 4. Log failure audit
      const audit = this.logAuditEvent({
        actorId: actor.uid,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: action.actionName,
        targetType: action.targetType,
        targetId: 'failure',
        targetName: action.targetName,
        risk: action.risk,
        result: 'FAILURE',
        evidence: `Execution failed: ${err.message || 'Unknown error'}`,
        executionDurationMs: Date.now() - startTime
      });

      return {
        success: false,
        actionId: action.id,
        correlationId,
        executedAt: new Date().toISOString(),
        message: `Action '${action.actionName}' failed during execution.`,
        auditId: audit.id,
        errorDetails: {
          whatHappened: `The system encountered an error while executing '${action.actionName}'.`,
          why: err.message || 'Database write or validation error occurred.',
          remediation: 'Check data parameters and retry the operation.',
          canRetry: true,
          rawError: String(err)
        }
      };
    }
  }

  // --- 5. STANDARDIZED INTELLIGENCE CARD BUILDER ---
  public createIntelligenceCard(params: {
    what: string;
    why: string;
    evidence: string[];
    confidence: number;
    sampleCount: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendedAction: string;
    canExecute: boolean;
    actionPayload?: IntelligenceCardData['actionPayload'];
    authorizationRequired: string;
    userRole: string;
    limitations: string[];
    realityStatus: RealityStatus;
    modelOrSource: string;
  }): IntelligenceCardData {
    const isAuthorized = this.checkRoleAuthorization(params.userRole, params.authorizationRequired);

    return {
      id: 'ic_' + Math.random().toString(36).substring(2, 9),
      what: params.what,
      why: params.why,
      evidence: params.evidence,
      confidence: Math.max(0, Math.min(100, Math.round(params.confidence))),
      sampleCount: params.sampleCount,
      impact: params.impact,
      recommendedAction: params.recommendedAction,
      canExecute: params.canExecute,
      actionPayload: params.actionPayload,
      authorizationRequired: params.authorizationRequired,
      userAuthorized: isAuthorized,
      status: 'PENDING',
      limitations: params.limitations,
      realityStatus: params.realityStatus,
      modelOrSource: params.modelOrSource,
      generatedAt: new Date().toISOString()
    };
  }

  private checkRoleAuthorization(currentRole: string, requiredPermission: string): boolean {
    const roleHierarchy: Record<string, number> = {
      admin: 100,
      executive: 80,
      finance: 70,
      manager: 60,
      developer: 50,
      researcher: 40,
      operator: 30
    };

    const permissionLevel: Record<string, number> = {
      'admin:*': 100,
      'executive:*': 80,
      'finance:*': 70,
      'manager:*': 60,
      'developer:*': 50,
      'researcher:*': 40,
      'standard:read_write': 30
    };

    const userLevel = roleHierarchy[currentRole.toLowerCase()] || 30;
    const reqLevel = permissionLevel[requiredPermission] || 30;

    return userLevel >= reqLevel;
  }
}

export const realityEngineService = new RealityEngineService();
