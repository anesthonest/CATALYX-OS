export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  title?: string; // e.g. Novice Executor, Strategic Commander
  streak: number;
  executionScore: number;
  focusScore: number;       // V2 addition
  consistencyScore: number; // V2 addition
  momentumScore: number;   // V2 addition
  premium: boolean;
  achievements: string[]; // ids of unlocked achievements
  termsAcceptedVersion?: string;
  termsAcceptedAt?: string;
  accountType?: 'INDIVIDUAL' | 'ORGANIZATION';
  role?: 'user' | 'creator' | 'admin' | 'superadmin';
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;                      // V2 addition
  priority?: 'high' | 'medium' | 'low';  // V2 addition
  category?: 'work' | 'personal' | 'growth' | 'finance'; // V2 addition
  createdAt: string;
  completedAt?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  message: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  type: 'short_term' | 'long_term';
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  progress: number;
  createdAt: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'streak_risk' | 'achievement' | 'team_report' | 'focus_reminder';
  createdAt: string;
}

export interface FocusBlock {
  id: string;
  taskName: string;
  durationMinutes: number;
  efficiencyRating: number; // 1 to 5 stars
  soundscape: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  teamProductivityScore?: number; // V2 addition
  burnoutRisk?: 'Low' | 'Moderate' | 'High'; // V2 addition
  teamMomentum?: 'Low' | 'Moderate' | 'Optimal'; // V2 addition
  createdAt: string;
}

export interface WorkspaceUser {
  uid: string;
  email: string;
  username: string;
}

export interface WorkspaceMember {
  uid: string;
  email: string;
  username: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface WorkspaceTask {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  assignedTo?: string; // username or UID
  createdAt: string;
  completedAt?: string;
  completedBy?: string; // UID of user
}

export interface WorkspaceMessage {
  id: string;
  text: string;
  username: string;
  userId: string;
  ai: boolean;
  emojiReactions?: { emoji: string; count: number; users: string[] }[]; // V2 addition
  createdAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  senderEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  requirement: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_xp',
    title: 'First XP Earned',
    description: 'Earn your first points by planning or completing tasks.',
    badge: '🏅',
    requirement: 'Earn any amount of XP'
  },
  {
    id: 'level_up',
    title: 'Level Up Achiever',
    description: 'Unlock level 2 and progress in executive rank.',
    badge: '⚡',
    requirement: 'Reach Level 2 or higher'
  },
  {
    id: 'consistency',
    title: 'Consistency Warrior',
    description: 'Establish an execution streak to lock in your momentum.',
    badge: '🔥',
    requirement: 'Execution streak of 3+ days'
  },
  {
    id: 'elite_executor',
    title: 'Elite Executor',
    description: 'Reach high consistent discipline execution performance.',
    badge: '👑',
    requirement: 'Execution Score of 80+'
  },
  {
    id: 'xp_master',
    title: 'XP Master',
    description: 'Amass a total of 500 XP across your execution lifetime.',
    badge: '🚀',
    requirement: 'Accumulate 500+ total XP'
  },
  {
    id: 'focus_pioneer',
    title: 'Focus Pioneer',
    description: 'Log your first dedicated deep work session in Focus Cabin.',
    badge: '🧘',
    requirement: 'Complete 1 focus block'
  },
  {
    id: 'strategic_planner',
    title: 'Strategic Planner',
    description: 'Create multi-week execution milestones inside the Goal System.',
    badge: '🎯',
    requirement: 'Create any strategic growth goal'
  }
];

// ============================================================================
// CATALYX V8 ENTERPRISE DOMAIN TYPES (VINEXSAH TECHNOLOGIES)
// ============================================================================

// 1. Identity & Multi-Tenant RBAC Layer
export type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: BillingTier;
  ownerId: string;
  createdAt: string;
  settings: {
    enforceMfa: boolean;
    allowedDomains: string[];
    defaultAutonomyLevel: AgentAutonomyLevel;
    budgetLimitMonthlyUsd: number;
    currency: CurrencyCode;
  };
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  leaderId: string;
  headcount: number;
  budgetAllocated: number;
}

export interface OrgMembership {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  username: string;
  role: OrgRole;
  departmentId?: string;
  status: 'active' | 'invited' | 'suspended';
  joinedAt: string;
}

// 2. AI Workforce & Controlled Autonomy Layer
export type AgentCategory = 
  | 'research'
  | 'data_analyst'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance_analysis'
  | 'project_management'
  | 'customer_support'
  | 'document'
  | 'executive_intelligence'
  | 'software_development';

export type AgentAutonomyLevel = 
  | 0 // LEVEL 0 — OBSERVE: AI can analyze
  | 1 // LEVEL 1 — RECOMMEND: AI proposes actions
  | 2 // LEVEL 2 — PREPARE: AI prepares actions awaiting approval
  | 3 // LEVEL 3 — APPROVED_EXECUTION: AI executes predefined approved actions
  | 4; // LEVEL 4 — CONTROLLED_AUTONOMOUS: Operates inside explicitly defined policies & budgets

export type AgentPermission = 
  | 'READ_KNOWLEDGE'
  | 'WRITE_KNOWLEDGE'
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'READ_ANALYTICS'
  | 'EXECUTE_WORKFLOW'
  | 'SEND_NOTIFICATION'
  | 'USE_INTEGRATION'
  | 'REQUEST_APPROVAL'
  | 'FINANCIAL_ACTION'
  | 'ADMIN_OVERRIDE'
  | 'MANAGE_AGENTS'
  | 'MANAGE_MISSIONS';

export interface AgentProfile {
  id: string;
  organizationId: string;
  name: string;
  category: AgentCategory;
  description: string;
  purpose: string;
  capabilities: string[];
  tools: string[];
  permissions: AgentPermission[];
  autonomyLevel: AgentAutonomyLevel;
  executionLimits: {
    maxActionsPerDay: number;
    costLimitUsdPerRun: number;
    requireHumanApprovalForDestructive: boolean;
  };
  costLimits: {
    monthlyBudgetUsd: number;
    currentMonthSpendUsd: number;
  };
  status: 'active' | 'idle' | 'paused' | 'executing' | 'error';
  systemInstructions: string;
  memoryAccessScope: 'organization' | 'department' | 'project' | 'sandboxed';
  auditHistoryCount: number;
  createdAt: string;
  lastActiveAt?: string;
}

export interface AgentExecutionRecord {
  id: string;
  organizationId: string;
  agentId: string;
  agentName: string;
  actionType: string;
  summary: string;
  autonomyLevelUsed: AgentAutonomyLevel;
  approvalRequired: boolean;
  approvalStatus: 'approved' | 'rejected' | 'auto_approved' | 'pending';
  approvedBy?: string;
  estimatedCostUsd: number;
  durationMs: number;
  outcome: 'success' | 'failed' | 'halted';
  timestamp: string;
}

// 3. Central Autonomous Orchestration Engine
export interface OrchestrationObjective {
  id: string;
  organizationId: string;
  title: string;
  rawObjective: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'analyzing' | 'planning' | 'awaiting_approval' | 'executing' | 'completed' | 'failed';
  assignedAgentIds: string[];
  requestedBy: string;
  createdAt: string;
}

export interface OrchestrationStep {
  id: string;
  objectiveId: string;
  sequenceNumber: number;
  title: string;
  description: string;
  agentId: string;
  capabilityRequired: string;
  requiresHumanApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  executed: boolean;
  retryCount: number;
  outputSummary?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'halted';
}

export interface OrchestrationPlan {
  id: string;
  objectiveId: string;
  organizationId: string;
  strategySummary: string;
  requiredCapabilities: string[];
  assignedAgents: Array<{ id: string; name: string; role: string }>;
  retrievedKnowledgeContext: string[];
  steps: OrchestrationStep[];
  humanApprovalsCount: number;
  status: 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'failed';
  outcomeReport?: string;
  createdAt: string;
}

// 4. Human Approval Governance Layer (Human-In-The-Loop)
export type ApprovalCategory = 
  | 'financial'
  | 'destructive'
  | 'external_commitment'
  | 'legal'
  | 'security'
  | 'workflow_gate';

export interface HumanApprovalRequest {
  id: string;
  organizationId: string;
  requesterType: 'agent' | 'workflow' | 'system' | 'user';
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  category: ApprovalCategory;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  decisionNotes?: string;
  createdAt: string;
  expiresAt?: string;
}

// 5. Intelligent Workflow Engine
export type WorkflowTriggerType = 
  | 'manual'
  | 'schedule'
  | 'task_created'
  | 'goal_milestone'
  | 'threshold_breach'
  | 'webhook';

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: Record<string, any>;
  label: string;
}

export type WorkflowStepType = 
  | 'action'
  | 'ai_reasoning'
  | 'human_approval'
  | 'integration'
  | 'condition';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  agentId?: string;
  config: Record<string, any>;
  requiresApproval: boolean;
  retryLimit: number;
  timeoutSeconds: number;
  rollbackAction?: string;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  enabled: boolean;
  executionCount: number;
  failureCount: number;
  averageDurationMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  organizationId: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_approval' | 'rolled_back';
  currentStepIndex: number;
  stepResults: Array<{
    stepId: string;
    stepName: string;
    status: 'success' | 'failed' | 'skipped' | 'waiting_approval';
    durationMs: number;
    log: string;
  }>;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// 6. Business Digital Twin & Strategic Scenario Simulator
export interface BusinessDigitalTwin {
  organizationId: string;
  operationalModel: {
    departmentsCount: number;
    headcountTotal: number;
    activeProjectsCount: number;
    activeGoalsCount: number;
    monthlyBurnUsd: number;
    monthlyRevenueUsd: number;
    runwayMonths: number;
    operationalEfficiencyScore: number;
  };
  observedData: {
    completedTasksLast30Days: number;
    avgCycleTimeDays: number;
    teamVelocity: number;
    focusHoursLogged: number;
  };
  calculatedMetrics: {
    burnoutRiskIndex: number; // 0-100
    productivityVariance: number; // -100 to +100
    riskDistribution: { financial: number; operational: number; technical: number };
  };
  forecasts: {
    projectedQuarterlyRevenue: number;
    projectedGoalCompletionRate: number;
    estimatedCapacityShortfall: number;
  };
  aiRecommendations: string[];
  userProvidedData: {
    strategicPriorityQuarter: string;
    growthTargetPercent: number;
    riskTolerance: 'low' | 'moderate' | 'aggressive';
  };
  lastCalibratedAt: string;
}

export interface ScenarioSimulation {
  id: string;
  title: string;
  hypothesis: string;
  inputChanges: Array<{
    dimension: string; // e.g. 'Marketing Spend', 'Engineering Headcount', 'Automation Coverage'
    deltaPercent: number; // e.g. +25%
  }>;
  projectedOutcomes: Array<{
    metric: string;
    beforeValue: string;
    estimatedAfterValue: string;
    confidenceLevel: string; // e.g. '82% Confidence'
    impactDirection: 'positive' | 'negative' | 'neutral';
  }>;
  risksIdentified: string[];
  opportunities: string[];
  isEstimate: true; // Mandatory flag confirming non-fabricated estimate
  createdAt: string;
}

// 7. Organizational Memory & Knowledge Universe
export interface KnowledgeItem {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  category: 'policy' | 'procedure' | 'document' | 'lesson_learned' | 'decision' | 'research';
  tags: string[];
  provenance: {
    author: string;
    authorRole: string;
    sourceSystem: string;
    verifiedAuthoritative: boolean; // Authoritative company policies vs notes
    isAiGenerated: boolean;         // Clearly distinguished AI generation
  };
  searchKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

// 8. Executive Intelligence Layer
export interface ExecutiveBriefing {
  id: string;
  organizationId: string;
  period: 'daily' | 'weekly';
  generatedAt: string;
  whatHappened: string[];
  whatChanged: string[];
  whatMatters: string[];
  whatRequiresAttention: string[];
  whatIsRecommended: string[];
  metricsSnapshot: {
    executionVelocity: number;
    activeRiskAlerts: number;
    pendingApprovals: number;
    budgetUsedPercent: number;
    aiCostMonthToDateUsd: number;
  };
}

// 9. Billing, Pesapal Subscription Engine & Revenue Ledger
export type BillingTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
export type BillingPeriod = 'monthly' | 'annually';
export type CurrencyCode = 'UGX' | 'KES' | 'TZS' | 'RWF' | 'NGN' | 'GHS' | 'ZAR' | 'USD' | 'EUR' | 'GBP';

export type SubscriptionStatus = 
  | 'trial'
  | 'active'
  | 'payment_pending'
  | 'past_due'
  | 'grace_period'
  | 'expired'
  | 'cancelled';

export interface BillingPlan {
  id: string;
  tier: BillingTier;
  name: string;
  description: string;
  pricesMinorUnits: Record<CurrencyCode, number>; // Minor units e.g. 15000000 minor units = 150,000 UGX
  billingPeriod: BillingPeriod;
  limits: {
    maxUsers: number;
    maxAgents: number;
    maxWorkflows: number;
    aiComputeUnitsPerMonth: number;
    storageGb: number;
  };
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  tier: BillingTier;
  status: SubscriptionStatus;
  currency: CurrencyCode;
  amountMinorUnits: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentProvider: 'pesapal' | 'invoice' | 'free';
  pesapalOrderTrackingId?: string;
  pesapalMerchantReference?: string;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueLedgerEntry {
  id: string;
  organizationId: string;
  transactionReference: string;
  idempotencyKey: string;
  provider: 'pesapal' | 'manual_credit' | 'invoice';
  type: 'subscription' | 'usage' | 'marketplace_commission' | 'refund';
  amountMinorUnits: number; // Integer minor units to prevent float precision drift
  currency: CurrencyCode;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  description: string;
  customerEmail: string;
  pesapalTrackingId?: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  subscriptionId: string;
  amountMinorUnits: number;
  currency: CurrencyCode;
  status: 'paid' | 'pending' | 'failed';
  periodStart: string;
  periodEnd: string;
  paymentMethod: string;
  createdAt: string;
  receiptUrl?: string;
  pesapalOrderTrackingId?: string;
  pesapalMerchantReference?: string;
  issuedAt?: string;
}

export interface PesapalPaymentInitRequest {
  planId: string;
  tier: BillingTier;
  currency: CurrencyCode;
  billingPeriod: BillingPeriod;
  customerEmail: string;
  customerPhone?: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
}

export interface PesapalOrderResult {
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
  status: string;
  isSimulated?: boolean;
}

export interface BillableUsage {
  organizationId: string;
  periodMonth: string; // YYYY-MM
  aiTokensUsed: number;
  agentExecutions: number;
  workflowRuns: number;
  apiCallsCount: number;
  totalCostEstimatedUsd: number;
  budgetLimitUsd: number;
  budgetAlertTriggered: boolean;
}

// 10. Integration Framework & Connectors
export interface IntegrationConnection {
  id: string;
  organizationId: string;
  serviceId: string; // e.g. 'slack', 'jira', 'github', 'hubspot', 'postgresql', 'webhooks'
  name: string;
  category: 'communication' | 'issue_tracker' | 'code_repo' | 'crm' | 'database' | 'cloud';
  status: 'connected' | 'disconnected' | 'error';
  health: 'healthy' | 'degraded' | 'offline';
  permissionsGranted: string[];
  lastSyncAt?: string;
  errorMessage?: string;
  configMasked: Record<string, string>; // Never exposing real secrets to frontend
}

// 11. Security, Audit & Governance
export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: 'success' | 'denied' | 'failed';
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

// ============================================================================
// CATALYX V8.1 COMMERCIAL & ECONOMIC LAYER TYPES
// ============================================================================

// 12. Entitlements & Policy Enforcement
export type EntitlementKey =
  | 'AI_AGENTS'
  | 'AUTONOMOUS_EXECUTION'
  | 'WORKFLOWS'
  | 'ADVANCED_SIMULATION'
  | 'DIGITAL_TWIN'
  | 'API_ACCESS'
  | 'CONNECTORS'
  | 'KNOWLEDGE_UNIVERSE'
  | 'EXECUTIVE_INTELLIGENCE'
  | 'ADVANCED_ANALYTICS'
  | 'MARKETPLACE'
  | 'ENTERPRISE_GOVERNANCE'
  | 'CUSTOM_ROLES'
  | 'SSO'
  | 'AUDIT_EXPORT'
  | 'PRIORITY_SUPPORT';

export interface EntitlementEvaluation {
  entitlement: EntitlementKey;
  granted: boolean;
  source: 'plan' | 'addon' | 'override' | 'trial';
  reason: string;
  limit?: number;
  usage?: number;
  remaining?: number;
}

// 13. Outcome Engine & Catalyx Value Index (CVI)
export type OutcomeCategory =
  | 'revenue_generated'
  | 'revenue_protected'
  | 'cost_reduced'
  | 'time_saved'
  | 'risk_reduced'
  | 'productivity_increased'
  | 'customer_retention_improved'
  | 'conversion_improved'
  | 'operational_delay_reduced'
  | 'error_rate_reduced'
  | 'compliance_improved';

export type OutcomeMeasurementMethod = 'observed' | 'calculated' | 'estimated' | 'predicted';

export interface BusinessOutcome {
  id: string;
  organizationId: string;
  missionId?: string;
  taskId?: string;
  agentId?: string;
  actionSummary: string;
  category: OutcomeCategory;
  title: string;
  description: string;
  measurementMethod: OutcomeMeasurementMethod;
  baselineValue: number;
  resultingValue: number;
  metricUnit: string; // '$', 'hours', '%', 'incidents'
  financialImpactMinorUnits: number; // integer minor currency units
  confidenceScore: number; // 0 - 100
  supportingEvidence: string[];
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: string;
}

export interface CatalyxValueDimension {
  score: number; // 0 - 100
  rawValue: string;
  weight: number;
  label: string;
}

export interface CatalyxValueIndex {
  organizationId: string;
  overallScore: number; // 0 - 100
  tier: 'Elite' | 'Advanced' | 'Established' | 'Emerging';
  calculatedAt: string;
  dimensions: {
    executionEfficiency: CatalyxValueDimension;
    automationRate: CatalyxValueDimension;
    timeSavedHours: CatalyxValueDimension;
    costReductionUsd: CatalyxValueDimension;
    successfulMissionsRate: CatalyxValueDimension;
    outcomeValueUsd: CatalyxValueDimension;
    systemReliabilityRate: CatalyxValueDimension;
    aiCostEfficiency: CatalyxValueDimension;
  };
  trendDeltaPercent: number; // e.g. +4.2%
}

// 14. AI Safety Firewall & Commercial Risk Engine
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FirewallActionEvaluation {
  id: string;
  organizationId: string;
  agentId: string;
  actionName: string;
  targetSystem: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  allowed: boolean;
  requiresHumanApproval: boolean;
  denialReason?: string;
  financialImpactEstimatedUsd: number;
  checkedRules: string[];
  timestamp: string;
}

export interface GlobalEmergencySuspension {
  suspended: boolean;
  suspendedBy?: string;
  suspendedAt?: string;
  reason?: string;
}

// 15. Granular Usage Metering & AI Economics
export interface DetailedUsageEvent {
  id: string;
  idempotencyKey: string;
  organizationId: string;
  userId?: string;
  agentId?: string;
  workflowId?: string;
  action: string;
  resourceType: 'ai_token' | 'agent_execution' | 'workflow_execution' | 'mission' | 'api_call' | 'connector_sync' | 'simulation_run' | 'knowledge_op';
  quantity: number;
  estimatedCostMinorUnits: number;
  actualCostMinorUnits?: number;
  currency: CurrencyCode;
  requestId: string;
  correlationId: string;
  billingPeriod: string; // YYYY-MM
  timestamp: string;
}

export interface CustomerEconomicMetric {
  organizationId: string;
  organizationName: string;
  planTier: BillingTier;
  mrrUsd: number;
  aiCostUsd: number;
  estimatedGrossMarginPercent: number;
  featureUtilizationPercent: number;
  agentUtilizationPercent: number;
  workflowUtilizationPercent: number;
  outcomeValueUsd: number;
  expansionOpportunity: 'High' | 'Medium' | 'Low';
  churnRisk: 'Low' | 'Medium' | 'High';
  status: 'healthy' | 'at_risk' | 'expanding';
}

// 16. Financial Reconciliation Engine
export interface ReconciliationDiscrepancy {
  id: string;
  type: 
    | 'missing_transaction' 
    | 'duplicate_transaction' 
    | 'amount_mismatch' 
    | 'currency_mismatch' 
    | 'subscription_mismatch' 
    | 'orphan_payment' 
    | 'entitlement_unpaid' 
    | 'paid_unactivated';
  severity: 'warning' | 'critical' | 'info';
  ledgerId?: string;
  pesapalTrackingId?: string;
  organizationId: string;
  details: string;
  resolved: boolean;
  resolutionAction?: string;
  detectedAt: string;
}

export interface ReconciliationReport {
  generatedAt: string;
  totalLedgerTransactions: number;
  totalPesapalTransactions: number;
  matchedTransactions: number;
  discrepanciesCount: number;
  discrepancies: ReconciliationDiscrepancy[];
  status: 'reconciled' | 'discrepancy_detected' | 'critical_mismatch';
}

// 17. Marketplace & Developer API Foundation (V8.2 / V27 Unified Digital Work Marketplace)
export type MarketplaceCategory =
  | 'agent'
  | 'workflow'
  | 'automation'
  | 'integration'
  | 'knowledge_pack'
  | 'industry_solution'
  | 'template'
  | 'analytics_pack'
  | 'simulation_model'
  | 'video'
  | 'video_demo'
  | 'product_demo'
  | 'presentation'
  | 'pitch_deck'
  | 'course'
  | 'training'
  | 'design'
  | 'document'
  | 'report'
  | 'research'
  | 'software'
  | 'application'
  | 'dataset'
  | 'audio'
  | 'podcast'
  | 'website'
  | 'prototype'
  | 'business_material'
  | 'consulting_deliverable'
  | 'creative_work';

export type MarketplaceLifecycleStatus =
  | 'draft'
  | 'submitted'
  | 'security_review'
  | 'approved'
  | 'published'
  | 'suspended'
  | 'retired';

export type MarketplacePricingModel =
  | 'free'
  | 'one_time'
  | 'subscription'
  | 'usage_based'
  | 'enterprise'
  | 'paid_download'
  | 'licensing'
  | 'paid_access'
  | 'creator_service';

export type SoftwareExecutionStage = 
  | 'DEMONSTRATION' 
  | 'PROTOTYPE' 
  | 'PRODUCTION_SOFTWARE' 
  | 'NOT_APPLICABLE';

export interface MarketplaceLicensingTerms {
  licenseType: 
    | 'COMMERCIAL_EXCLUSIVE' 
    | 'COMMERCIAL_NON_EXCLUSIVE' 
    | 'PERSONAL_USE' 
    | 'OPEN_SOURCE' 
    | 'ENTERPRISE_ORGANIZATIONAL';
  allowedSeats?: number;
  redistributionAllowed: boolean;
  modificationAllowed: boolean;
  attributionRequired: boolean;
  termsSummary: string;
}

export interface MarketplaceReview {
  id: string;
  reviewerEmail: string;
  reviewerName: string;
  rating: number; // 1 - 5
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface MarketplaceDisputeReport {
  id: string;
  assetId: string;
  assetTitle: string;
  reporterEmail: string;
  reason: 'COPYRIGHT_INFRINGEMENT' | 'MISLEADING_FUNCTIONALITY' | 'MALICIOUS_CODE' | 'POLICY_VIOLATION' | 'OTHER';
  details: string;
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolutionNotes?: string;
  // Compatibility fields
  complianceReferenceId?: string;
  complainantName?: string;
  evidenceDetails?: string;
}

export type MarketplaceDisputeRecord = MarketplaceDisputeReport;

export interface WorkQualityReviewReport {
  reportId: string;
  targetId: string;
  targetType: 'presentation' | 'demo' | 'document' | 'video' | 'marketplace_listing' | 'work_object' | 'research' | string;
  targetTitle: string;
  analyzedAt: string;
  overallScore: number; // 0 - 100
  readinessRating: 'EXCELLENT' | 'MARKET_READY' | 'NEEDS_POLISH' | 'INCOMPLETE';
  dimensionScores: {
    clarity: number;
    structure: number;
    audienceSuitability: number;
    consistency: number;
    commercialViability: number;
    missingInformationRisk: number;
  };
  keyStrengths: string[];
  recommendedImprovements: {
    category: string;
    finding: string;
    suggestion: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  audienceSuitabilityAnalysis: string;
  metadataRecommendations: {
    suggestedTags: string[];
    suggestedCategory: MarketplaceCategory;
    suggestedPricingModel: MarketplacePricingModel;
    optimizedDescription: string;
  };
  isAiGenerated: true;
  modelUsed?: string;
  // Backward and cross-view compatibility fields
  executiveSummary?: string;
  source?: string;
  dimensions?: {
    clarity: number;
    structure: number;
    audienceSuitability: number;
    consistency: number;
    commercialViability: number;
    missingInformationRisk?: number;
    securityBaseline?: number;
  };
  strengths?: string[];
  prioritizedImprovements?: { category: string; finding: string; suggestion: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  recommendations?: string[];
  criteriaBreakdown?: {
    clarity?: number;
    completeness?: number;
    commercialAppeal?: number;
    securityGovernance?: number;
    technicalQuality?: number;
    marketReadiness?: number;
    securityCompliance?: number;
    documentationCompleteness?: number;
  };
}

export interface ImmutableCommerceLedgerEntry {
  id: string;
  idempotencyKey: string;
  transactionReference: string;
  orderId?: string;
  assetId: string;
  assetTitle: string;
  assetCategory: MarketplaceCategory;
  buyerEmail: string;
  buyerName: string;
  buyerOrganizationId: string;
  sellerEmail: string;
  sellerName: string;
  sellerOrganizationId?: string;
  amountMinorUnits: number;
  grossPriceMinorUnits?: number;
  currency: CurrencyCode;
  platformCommissionMinorUnits: number;
  platformFeeMinorUnits?: number;
  creatorPayoutMinorUnits: number;
  paymentProvider: 'PESAPAL' | 'CATALYX_INTERNAL_BALANCE' | 'CORPORATE_INVOICE' | 'STRIPE' | 'INTERNAL_ESCROW';
  paymentState: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'SETTLED' | 'REFUNDED' | 'DISPUTED' | 'REVERSED' | 'FAILED';
  settlementStatus?: string;
  reconciliationState: 'UNRECONCILED' | 'MATCHED' | 'SETTLED' | 'FLAGGED';
  cryptographicSignature: string;
  ledgerSignature?: string;
  createdAt: string;
  settledAt?: string;
}

export type CommerceLedgerEntry = ImmutableCommerceLedgerEntry;

export interface SecurityReviewReport {
  reviewId: string;
  assetId: string;
  assetVersion: string;
  scannedAt: string;
  manifestValid: boolean;
  staticAnalysisPassed: boolean;
  permissionsAudit: {
    permission: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    justificationValid: boolean;
  }[];
  networkAccessDetected: boolean;
  externalEndpointsFound: string[];
  dataBoundaryCompliant: boolean;
  sandboxRequired: boolean;
  overallRiskScore: number; // 0 - 100 (0 = pristine, 100 = dangerous)
  verdict: 'approved' | 'requires_changes' | 'quarantined';
  findings: string[];
}

export interface MarketplaceAsset {
  id: string;
  type: MarketplaceCategory;
  title: string;
  version: string;
  description: string;
  author: string;
  developerId?: string;
  organizationId?: string;
  workObjectId?: string; // Link to source Universal Work Object (Work-to-Market bridge)
  workspaceId?: string;
  pricingModel: MarketplacePricingModel;
  priceMinorUnits: number;
  currency: CurrencyCode;
  commissionRatePercent: number; // e.g. 15% platform commission, 85% creator
  securityStatus: 'verified' | 'sandboxed' | 'in_review' | 'quarantined';
  lifecycleStatus: MarketplaceLifecycleStatus;
  permissionsRequired: AgentPermission[];
  installCount: number;
  activeExecutionsCount?: number;
  rating: number;
  published: boolean;
  tags: string[];
  manifestCode?: string; // Sandboxed manifest payload
  securityReport?: SecurityReviewReport;
  createdAt: string;
  updatedAt?: string;

  // V27 Work & Digital-Content Media-Commerce Fields
  mediaUrl?: string; // For videos, podcasts, interactive previews
  thumbnailUrl?: string;
  durationSeconds?: number;
  chapters?: { title: string; timestampSeconds: number }[];
  transcript?: string;
  softwareStage?: SoftwareExecutionStage;
  demoType?: 'LIVE' | 'RECORDING' | 'INTERACTIVE_SANDBOX' | 'DOWNLOADABLE';
  slideCount?: number;
  fileFormat?: string; // e.g. PDF, MP4, PPTX, JSON, ZIP
  fileSizeBytes?: number;
  licensingTerms?: MarketplaceLicensingTerms;
  visibility?: 'PUBLIC' | 'UNLISTED' | 'RESTRICTED' | 'COMMERCIAL_CATALOG';
  creatorVerified?: boolean;
  verifiedSalesCount?: number;
  reviews?: MarketplaceReview[];
  disputeReports?: MarketplaceDisputeReport[];
  metadata?: Record<string, any>;
}

export interface DeveloperAccount {
  id: string;
  organizationId: string;
  developerName: string;
  email: string;
  verifiedBadge: boolean;
  payoutMethod: 'pesapal' | 'bank_wire' | 'mobile_money';
  payoutAccountIdentifier: string; // e.g. Pesapal Merchant Ref or Phone/IBAN
  currency: CurrencyCode;
  totalEarnedMinorUnits: number;
  pendingPayoutMinorUnits: number;
  lifetimeGmvMinorUnits: number;
  publishedAssetsCount: number;
  totalInstallsCount: number;
  sandboxQuotaPerDay: number;
  sandboxCallsToday: number;
  createdAt: string;
}

export interface ApiKeyCredential {
  id: string;
  organizationId: string;
  name: string;
  prefix: string; // e.g. cx_live_7a9f...
  maskedKey: string;
  scopes: string[];
  rateLimitPerMinute: number;
  requestsThisMonth: number;
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
  createdAt: string;
}

// 18. Outbound Webhook Subscriptions (V8.2)
export type WebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'payment.completed'
  | 'payment.failed'
  | 'invoice.created'
  | 'mission.completed'
  | 'workflow.completed'
  | 'agent.completed'
  | 'marketplace.purchase'
  | 'marketplace.published';

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  url: string;
  description: string;
  events: WebhookEventType[];
  secret: string; // Used for HMAC-SHA256 signature
  status: 'active' | 'failing' | 'disabled';
  failureCount: number;
  lastDeliveryAt?: string;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  subscriptionId: string;
  organizationId: string;
  eventType: WebhookEventType;
  payloadSummary: string;
  statusCode?: number;
  responseBody?: string;
  success: boolean;
  durationMs: number;
  attempt: number;
  signatureHeader: string;
  timestamp: string;
}

// 19. Developer Sandbox Environment (V8.2)
export interface SandboxExecutionRequest {
  targetType: 'agent' | 'workflow' | 'marketplace_asset';
  targetId: string;
  inputPayload: Record<string, any>;
  dryRun: boolean;
}

export interface SandboxExecutionResult {
  executionId: string;
  targetId: string;
  status: 'success' | 'failed' | 'policy_blocked';
  durationMs: number;
  syntheticComputeCostMinorUnits: number;
  output: any;
  policyEvaluations: string[];
  networkCallsBlocked: number;
  isolatedDataIntegrityVerified: boolean;
  timestamp: string;
}

// ============================================================================
// CATALYX V9 AUTONOMOUS ENTERPRISE INTELLIGENCE & EXECUTION PLATFORM
// ============================================================================

// 20. Data Credibility Classification
export type DataCredibilityTag = 
  | 'REAL_DATA'
  | 'DERIVED_DATA'
  | 'AI_INFERENCE'
  | 'PREDICTION'
  | 'RECOMMENDATION';

// 21. Continuous Intelligence Loop & Intelligent Events
export type IntelligentEventType =
  | 'risk_detected'
  | 'deadline_approaching'
  | 'project_delay'
  | 'budget_anomaly'
  | 'revenue_anomaly'
  | 'churn_signal'
  | 'resource_bottleneck'
  | 'workforce_overload'
  | 'opportunity_detected'
  | 'workflow_failure'
  | 'integration_failure'
  | 'strategy_deviation'
  | 'ai_cost_anomaly';

export interface IntelligentEvent {
  id: string;
  organizationId: string;
  eventType: IntelligentEventType;
  source: string;
  timestamp: string;
  confidence: number; // 0 - 100
  severity: RiskLevel;
  affectedEntity: string;
  explanation: string;
  recommendedAction: string;
  requiredAuthority: 'automatic' | 'manager' | 'executive' | 'board';
  auditReference: string;
  credibility: DataCredibilityTag;
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// 22. Organizational Intelligence Engine Health Metrics
export interface HealthDimensionScore {
  score: number; // 0 - 100
  status: 'healthy' | 'warning' | 'critical' | 'optimal';
  headline: string;
  keyDrivers: string[];
  credibility: DataCredibilityTag;
  lastEvaluatedAt: string;
}

export interface OrganizationalHealthSnapshot {
  organizationId: string;
  calculatedAt: string;
  overallScore: number; // 0 - 100
  dimensions: {
    organizationalHealth: HealthDimensionScore;
    operationalHealth: HealthDimensionScore;
    financialHealth: HealthDimensionScore;
    executionHealth: HealthDimensionScore;
    workforceHealth: HealthDimensionScore;
    customerHealth: HealthDimensionScore;
    projectHealth: HealthDimensionScore;
    riskPosture: HealthDimensionScore;
    opportunityPosture: HealthDimensionScore;
    strategicPriorities: HealthDimensionScore;
  };
  continuousLoopSummary: {
    whatChanged: string[];
    whatMatters: string[];
    whatIsAtRisk: string[];
    whatIsImproving: string[];
    whatIsGettingWorse: string[];
    whatOpportunitiesAppeared: string[];
    whatActionRequired: string[];
  };
}

// 23. Opportunity Engine
export type OpportunityCategory =
  | 'revenue'
  | 'cost_reduction'
  | 'process_automation'
  | 'customer_expansion'
  | 'product'
  | 'market'
  | 'operational'
  | 'resource'
  | 'partnership'
  | 'workflow_opt'
  | 'knowledge_reuse';

export type OpportunityStatus = 
  | 'identified'
  | 'under_evaluation'
  | 'approved'
  | 'executing'
  | 'realized'
  | 'dismissed';

export interface StrategicOpportunity {
  id: string;
  organizationId: string;
  category: OpportunityCategory;
  title: string;
  description: string;
  evidence: string[];
  estimatedImpact: string;
  confidenceScore: number; // 0 - 100
  requiredResources: string[];
  estimatedCostMinorUnits: number; // In minor currency units
  estimatedRoiPercent: number;
  risks: string[];
  dependencies: string[];
  recommendedAction: string;
  approvalRequirement: 'automatic' | 'manager_approval' | 'executive_signoff';
  status: OpportunityStatus;
  credibility: DataCredibilityTag;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// 24. Organization-Wide Risk Engine (11 Domains & 9-Stage Lifecycle)
export type RiskDomain =
  | 'operational'
  | 'financial'
  | 'cybersecurity'
  | 'compliance'
  | 'project'
  | 'workforce'
  | 'customer'
  | 'vendor'
  | 'technology'
  | 'ai'
  | 'strategic';

export type RiskLifecycleStage =
  | 'DETECTED'
  | 'ANALYZED'
  | 'SCORED'
  | 'MITIGATION_PROPOSED'
  | 'APPROVAL_REQUIRED'
  | 'MITIGATION_EXECUTING'
  | 'MONITORING'
  | 'RESOLVED'
  | 'CLOSED';

export interface EnterpriseRiskItem {
  id: string;
  organizationId: string;
  domain: RiskDomain;
  title: string;
  description: string;
  severity: RiskLevel; // LOW | MEDIUM | HIGH | CRITICAL
  probability: number; // 0 - 100%
  impactScore: number; // 0 - 100
  riskScore: number;   // 0 - 100 (probability * impact / 100)
  lifecycleState: RiskLifecycleStage;
  detectedAt: string;
  affectedEntity: string;
  proposedMitigation: string;
  mitigationOwner?: string;
  humanApprovalRequired: boolean;
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  auditTrail: Array<{
    timestamp: string;
    fromStage: RiskLifecycleStage;
    toStage: RiskLifecycleStage;
    actor: string;
    note: string;
  }>;
}

// 25. Strategic Intelligence Layer (Goal -> Strategy -> Initiatives -> Missions -> Workflows -> Tasks -> Outcomes)
export interface StrategicObjective {
  id: string;
  organizationId: string;
  goalId?: string;
  title: string;
  strategy: string;
  initiatives: string[];
  targetMetric: string;
  baselineValue: string;
  currentStateValue: string;
  progressPercent: number;
  probabilityOfSuccessPercent: number;
  dependencies: string[];
  risks: string[];
  resources: string[];
  projectedCompletionDate: string;
  actualOutcome?: string;
  isDiverging: boolean;
  divergenceExplanation?: string;
  status: 'on_track' | 'at_risk' | 'diverged' | 'achieved';
  createdAt: string;
  updatedAt: string;
}

// 26. Hardened Mission Decomposition
export interface DecomposedMissionTask {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  assignedAgentId?: string;
  assignedHumanRole?: string;
  isAgent: boolean;
  requiredPermissions: AgentPermission[];
  requiresApproval: boolean;
  status: 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed';
  outputSummary?: string;
}

export interface HardenedMission {
  id: string;
  ownerId: string;
  ownerName: string;
  organizationId: string;
  objective: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  riskClassification: RiskLevel;
  budgetMinorUnits: number;
  autonomyLevel: AgentAutonomyLevel;
  requiredPermissions: AgentPermission[];
  agentsInvolved: string[];
  humansInvolved: string[];
  dependencies: string[];
  tasks: DecomposedMissionTask[];
  executionHistory: Array<{
    timestamp: string;
    event: string;
    actor: string;
    details?: string;
  }>;
  outcomeSummary?: string;
  status: 'planning' | 'decomposed' | 'in_execution' | 'blocked' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// 27. Governed AI Workforce 2.0 (11 Specialist Areas & Intelligent Assignment)
export type SpecialistArea =
  | 'Engineering'
  | 'Sales'
  | 'Operations'
  | 'Research'
  | 'Finance'
  | 'Product'
  | 'Legal'
  | 'Support'
  | 'Marketing'
  | 'Architecture'
  | 'HR';

export interface AgentWorkforce2Profile extends AgentProfile {
  specialistArea: SpecialistArea;
  skillRegistry: string[];
  workloadPercent: number; // Current assigned load (0-100%)
  availability: 'available' | 'busy' | 'maintenance' | 'suspended';
  costPerRunMinorUnits: number;
  performanceScore: number; // 0 - 100
  reliabilityScore: number; // 0 - 100
  successRatePercent: number;
  failureRatePercent: number;
  riskTier: RiskLevel;
  toolAccess: string[];
  specializationSummary: string;
}

export interface AgentCollaborationExchange {
  exchangeId: string;
  missionId: string;
  fromAgentId: string;
  toAgentId: string;
  purpose: string;
  payloadSummary: string;
  authenticated: boolean;
  authorized: boolean;
  logged: boolean;
  timestamp: string;
}

// 28. Controlled Agent Memory Model
export type AgentMemoryScope = 'organizational' | 'mission' | 'agent_specific';
export type MemoryClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface AgentMemoryRecord {
  id: string;
  organizationId: string;
  scope: AgentMemoryScope;
  ownerId: string;
  tenantId: string;
  classification: MemoryClassification;
  retentionDays: number;
  provenance: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: string;
  lastUsedAt: string;
  deletionPolicy: 'auto_purge' | 'retain_indefinitely' | 'compliance_lock';
  hashSignature: string;
}

// 29. Execution Safety Gate (10-Step Execution Gateway)
export type GatewayActionVerdict =
  | 'ALLOW'
  | 'DENY'
  | 'REQUIRE_APPROVAL'
  | 'RATE_LIMITED'
  | 'BUDGET_EXCEEDED'
  | 'EMERGENCY_STOPPED';

export interface ExecutionGatewayEvaluation {
  evaluationId: string;
  organizationId: string;
  agentId: string;
  agentName: string;
  actionName: string;
  targetSystem: string;
  verdict: GatewayActionVerdict;
  stepCheckResults: {
    agentIntentValidated: boolean;
    policyCheckPassed: boolean;
    permissionCheckPassed: boolean;
    riskCheckPassed: boolean;
    budgetCheckPassed: boolean;
    approvalCheckRequired: boolean;
    gatewayCleared: boolean;
  };
  reasons: string[];
  timestamp: string;
}

// 30. Institutional Memory (ADRs, Decisions, Policies, Lessons)
export interface InstitutionalMemoryItem {
  id: string;
  organizationId: string;
  type: 'decision' | 'adr' | 'policy' | 'lesson_learned' | 'incident_record' | 'standard';
  title: string;
  context: string;
  whatHappenedBefore: string;
  whatWasDecided: string;
  whyDecided: string;
  whatHappenedAfter?: string;
  whatWeLearned?: string;
  provenance: {
    author: string;
    role: string;
    verifiedBy: string;
    authorityLevel: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 31. Decision Intelligence
export interface DecisionOption {
  optionId: string;
  optionName: string;
  description: string;
  estimatedCostMinorUnits: number;
  estimatedBenefit: string;
  riskScore: number; // 0 - 100
  requiredResources: string[];
  timeline: string;
  dependencies: string[];
  predictedOutcome: string;
  strategicAlignmentScore: number; // 0 - 100
}

export interface DecisionComparisonRecord {
  id: string;
  organizationId: string;
  title: string;
  businessContext: string;
  options: DecisionOption[];
  selectedOptionId?: string;
  humanDecisionMaker?: string;
  decisionRationale?: string;
  decidedAt?: string;
  trackedOutcome?: string;
  outcomeVerified: boolean;
  outcomeEvaluation?: string;
  createdAt: string;
}

// 32. Predictive Infrastructure
export type PredictionType =
  | 'project_delay'
  | 'customer_churn'
  | 'budget_overrun'
  | 'resource_shortage'
  | 'workflow_failure'
  | 'revenue_trend'
  | 'demand_trend'
  | 'operational_bottleneck';

export interface PredictiveSignal {
  id: string;
  organizationId: string;
  predictionType: PredictionType;
  title: string;
  confidencePercent: number; // 0 - 100
  evidence: string[];
  predictionHorizon: string; // e.g. "Next 30 Days", "Q3 Sprint 4"
  modelVersion: string;
  uncertaintyRange: string;
  explanation: string;
  suggestedIntervention: string;
  generatedAt: string;
}

// 33. Workforce Intelligence (Privacy-Respecting Operational Capacity)
export interface WorkforceCapacityMetric {
  id: string;
  organizationId: string;
  department: string;
  workloadPercent: number; // 0 - 100
  taskDistributionCount: number;
  capacityHoursAvailable: number;
  bottlenecksIdentified: string[];
  deadlinesApproachingCount: number;
  productivitySignal: 'optimal' | 'moderate' | 'overloaded';
  skillCoverageGaps: string[];
  privacyAudited: true;
  lastCalculatedAt: string;
}

// 34. Emergency Controls Master Registry
export interface EmergencyControlsMasterState {
  organizationId: string;
  globalAiSuspended: boolean;
  organizationAiSuspended: boolean;
  suspendedAgentIds: string[];
  suspendedConnectorIds: string[];
  suspendedMarketplaceItemIds: string[];
  paymentProcessingSuspended: boolean;
  workflowExecutionSuspended: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  lastReason?: string;
}

// 35. Integration Mesh Circuit Breaker
export type CircuitBreakerStatus = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerState {
  serviceId: string;
  organizationId: string;
  status: CircuitBreakerStatus;
  consecutiveFailures: number;
  failureThreshold: number;
  cooldownPeriodMs: number;
  lastFailureAt?: string;
  lastStateChangeAt: string;
  trippedReason?: string;
}

// ============================================================
// CATALYX V10: GLOBAL INTELLIGENCE ECOSYSTEM TYPES
// ============================================================

export type DataClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type DataAccessScope = 'TENANT_ONLY' | 'CROSS_ORG_AUTHORIZED' | 'GLOBAL_PUBLIC';

// 36. Global Intelligence Fabric Signal
export interface GlobalIntelligenceFabricSignal {
  id: string;
  sourceType: 'ORGANIZATIONAL' | 'APPLICATION' | 'KNOWLEDGE' | 'WORKFLOW' | 'EVENT' | 'MARKETPLACE' | 'INTEGRATION' | 'DEVELOPER' | 'ANALYTICAL';
  sourceName: string;
  tenantId: string;
  dataClassification: DataClassificationLevel;
  retentionDays: number;
  accessScope: DataAccessScope;
  confidencePercent: number;
  provenanceSignature: string;
  timestamp: string;
  originSystem: string;
  payloadSummary: string;
  crossTenantAuthorized: boolean;
}

// 37. Global Knowledge Graph
export type KnowledgeGraphCategory = 
  | 'organization'
  | 'industry'
  | 'product'
  | 'technology'
  | 'application'
  | 'workflow'
  | 'agent'
  | 'developer'
  | 'knowledge'
  | 'market'
  | 'event'
  | 'outcome';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: KnowledgeGraphCategory;
  tenantId: string; // 'GLOBAL' or specific tenant ID
  isPrivate: boolean;
  metadata: {
    technologyStack?: string[];
    riskScore?: number;
    maturityTier?: string;
    verifiedAuthority?: boolean;
    description?: string;
  };
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 
    | 'supports_workflow'
    | 'executes_task'
    | 'integrates_with'
    | 'provides_solution_for'
    | 'partnered_with'
    | 'developed_by'
    | 'governs_policy'
    | 'produces_outcome';
  weight: number;
  bidirectional: boolean;
}

// 38. Cross-Organization Benchmarks (Controlled & Privacy-Safe)
export interface CrossOrgBenchmarkMetric {
  metricId: string;
  category: 'operational_efficiency' | 'project_completion' | 'customer_retention' | 'ai_utilization' | 'cost_efficiency' | 'workflow_automation' | 'response_time';
  metricName: string;
  sampleSize: number; // e.g. 1420 organizations
  timeframe: string; // e.g. "Trailing 90 Days (Q2-Q3)"
  methodology: string;
  limitations: string;
  industryAverage: number;
  topQuartile: number;
  unit: string;
  orgValue: number;
  percentileRank: number;
  status: 'OPTIMAL' | 'COMPETITIVE' | 'OPPORTUNITY';
}

// 39. Ecosystem Intelligence Discovery Item
export type EcosystemItemCategory = 
  | 'AI AGENTS'
  | 'APPLICATIONS'
  | 'WORKFLOWS'
  | 'CONNECTORS'
  | 'AUTOMATION PACKAGES'
  | 'KNOWLEDGE PACKAGES'
  | 'TEMPLATES'
  | 'ANALYTICS'
  | 'INDUSTRY SOLUTIONS'
  | 'DEVELOPER SERVICES';

export type EcosystemTrustLevel = 'UNVERIFIED' | 'VERIFIED' | 'TRUSTED' | 'SUSPENDED' | 'REVOKED';

export interface EcosystemDiscoveryItem {
  id: string;
  category: EcosystemItemCategory;
  title: string;
  description: string;
  creatorName: string;
  creatorVerification: EcosystemTrustLevel;
  version: string;
  rating: number; // 0 - 5.0
  reviewsCount: number;
  activeInstalls: number;
  securityAuditStatus: 'PASSED' | 'PENDING' | 'REVISE';
  pricingModel: 'free' | 'one_time' | 'subscription' | 'usage_based' | 'enterprise';
  priceMinorUnits: number;
  currency: string;
  tags: string[];
  compatibilityScore: number; // 0 - 100
  lastAuditedAt: string;
}

// 40. Marketplace 2.0 Item with Sandbox Isolation
export type MarketplaceLifecycleState = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SECURITY_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UPDATED'
  | 'SUSPENDED'
  | 'RETIRED';

export interface Marketplace2Item {
  id: string;
  creatorId: string;
  ownerId: string;
  version: string;
  category: EcosystemItemCategory;
  title: string;
  description: string;
  permissionsManifest: string[];
  dependencies: string[];
  compatibility: string[];
  lifecycleState: MarketplaceLifecycleState;
  pricingModel: string;
  priceMinorUnits: number;
  currency: string;
  sandboxProfile: {
    memoryLimitMb: number;
    networkRestrictions: string[];
    secretIsolationVerified: boolean;
    malwareScanPassed: boolean;
    zeroCustomerPrivilegeInheritance: true;
  };
  changelog: { version: string; releaseDate: string; notes: string }[];
  supportContact: string;
  usageMetrics: {
    totalInstalls: number;
    runsLast30Days: number;
    errorRatePercent: number;
  };
}

// 41. Developer Platform & Extension Contract
export interface DeveloperProject {
  projectId: string;
  developerId: string;
  name: string;
  environment: 'sandbox' | 'staging' | 'production';
  apiKeySnippet: string;
  oauthClientId: string;
  scopes: string[];
  rateLimitRpm: number;
  webhookUrl: string;
  webhookSecret: string;
  monthlyUsageCredits: number;
  activeTokensCount: number;
  registeredAppsCount: number;
  createdAt: string;
}

export interface ExtensionContract {
  contractId: string;
  name: string;
  extensionType: 'agent' | 'workflow' | 'application' | 'connector' | 'tool' | 'datasource' | 'analytics_module';
  declaredCapabilities: string[];
  requiredPermissions: string[];
  dependencies: string[];
  supportedVersions: string[];
  securityRequirements: string[];
  resourceQuotas: {
    maxMemoryMb: number;
    maxTimeoutSec: number;
  };
}

// 42. Governed Agent Registry (Internal, Org, Marketplace, Developer)
export interface GovernedAgentRegistryEntry {
  agentId: string;
  name: string;
  agentType: 'INTERNAL' | 'ORGANIZATION' | 'MARKETPLACE' | 'DEVELOPER';
  ownerId: string;
  creatorId: string;
  version: string;
  capabilities: string[];
  permissions: string[];
  supportedTools: string[];
  costPer1kTokensMinorUnits: number;
  reliabilityScore: number; // 0 - 100
  reputationScore: number; // 0 - 100
  securityStatus: EcosystemTrustLevel;
  autonomyLevel: number;
  verifiedOutcomesCount: number;
  incidentCount: number;
  lastActiveAt: string;
}

// 43. Standardized Inter-Agent Task Contract
export interface InterAgentTaskContract {
  contractId: string;
  initiatorAgentId: string;
  delegatedAgentId: string;
  missionId: string;
  taskScope: string;
  inputContract: string;
  expectedOutputFormat: string;
  authTicket: string;
  timeoutMs: number;
  retryPolicy: { maxRetries: number; backoffMs: number };
  status: 'NEGOTIATED' | 'DISPATCHED' | 'IN_PROGRESS' | 'VALIDATED' | 'FAILED' | 'ESCALATED_TO_HUMAN';
  auditTraceId: string;
  timestamp: string;
}

// 44. Inter-Organization Collaboration Workspace
export interface OrgCollaborationWorkspace {
  workspaceId: string;
  primaryOrgId: string;
  partnerOrgId: string;
  partnerOrgName: string;
  collaborationType: 'SUPPLIER' | 'PARTNER' | 'CONTRACTOR' | 'CUSTOMER' | 'NGO' | 'DEVELOPMENT_PARTNER';
  status: 'INVITED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  sharedMissionsCount: number;
  sharedWorkflows: string[];
  delegatedTasksCount: number;
  governancePolicy: string;
  expiresAt: string;
  createdAt: string;
}

// 45. Intelligence Exchange Listing & Creator Revenue
export interface IntelligenceExchangeListing {
  id: string;
  title: string;
  publisher: string;
  classification: 'PUBLIC' | 'LICENSED' | 'PRIVATE' | 'ORGANIZATION_ONLY' | 'OPT_IN_SHARED';
  category: 'REPORT' | 'BENCHMARK' | 'TEMPLATE' | 'OPERATIONAL_MODEL' | 'RESEARCH' | 'MARKET_DATA' | 'FRAMEWORK';
  priceMinorUnits: number;
  currency: string;
  verifiedProvenance: boolean;
  downloadCount: number;
  summary: string;
}

export interface CreatorRevenueAccounting {
  creatorId: string;
  grossSalesMinorUnits: number;
  platformCommissionMinorUnits: number;
  taxesAndFeesMinorUnits: number;
  creatorEarningsMinorUnits: number;
  pendingPayoutMinorUnits: number;
  settledPayoutMinorUnits: number;
  refundsCount: number;
  payoutHistory: {
    payoutId: string;
    amountMinorUnits: number;
    currency: string;
    method: string;
    status: 'PAID' | 'PROCESSING';
    date: string;
  }[];
}

// 46. Ecosystem Trust, Governance & Abuse Alerts
export interface EcosystemVerificationRecord {
  entityId: string;
  entityType: 'DEVELOPER' | 'ORGANIZATION' | 'APPLICATION' | 'AGENT' | 'CONNECTOR' | 'MARKETPLACE_PRODUCT';
  name: string;
  status: EcosystemTrustLevel;
  evidenceSummary: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface AbuseAlertRecord {
  alertId: string;
  targetType: 'PAYMENT' | 'MARKETPLACE' | 'API' | 'CREDENTIALS' | 'REVIEWS' | 'AUTOMATED_ATTACK' | 'ACCOUNT_TAKEOVER';
  entityId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  automatedDecision: 'FLAG_FOR_REVIEW' | 'RATE_LIMIT' | 'TEMPORARY_FREEZE';
  reviewedByHuman: boolean;
  timestamp: string;
}

// 47. Ecosystem Digital Twin Scenario
export interface EcosystemDigitalTwinScenario {
  scenarioId: string;
  title: string;
  scope: 'MARKET_EXPANSION' | 'SUPPLY_CHAIN' | 'TECH_ADOPTION' | 'PRICING_SHIFTS' | 'PARTNER_EVOLUTION';
  baselineFact: string;
  simulationModel: string;
  projectedOutcome: string;
  uncertaintyVariancePercent: number;
  distinction: {
    fact: string;
    assumption: string;
    simulation: string;
    prediction: string;
  };
}

// 48. Global Admin Control Plane Master
export interface GlobalAdminControlPlaneState {
  globalAiSuspension: boolean;
  globalMarketplaceSuspension: boolean;
  globalApiRateLimitMode: boolean;
  organizationSuspensionCount: number;
  agentSuspensionCount: number;
  applicationSuspensionCount: number;
  paymentSuspension: boolean;
  emergencyAuditTrace: {
    action: string;
    actor: string;
    timestamp: string;
    reason: string;
  }[];
}

// =========================================================================
// CATALYX V11: AUTONOMOUS ECONOMIC & ORGANIZATIONAL INTELLIGENCE TYPES
// =========================================================================

// 49. Central V11 Loop State
export type V11LoopStage =
  | 'OBSERVE'
  | 'UNDERSTAND'
  | 'PREDICT'
  | 'PLAN'
  | 'SIMULATE'
  | 'OPTIMIZE'
  | 'REQUEST_AUTHORIZATION'
  | 'EXECUTE'
  | 'MEASURE'
  | 'LEARN'
  | 'OPTIMIZE_AGAIN';

export interface V11LoopStatus {
  currentStage: V11LoopStage;
  cycleCount: number;
  lastCycleCompletedAt: string;
  activeQuestions: {
    whatIsHappening: string;
    whyIsItHappening: string;
    whatIsLikelyToHappen: string;
    whatShouldWeDo: string;
    whatWillHappenIfWeDoIt: string;
    whatWillItCost: string;
    whatValueCouldItCreate: string;
    whatRisksExist: string;
    whoShouldAct: string;
    whatRequiresApproval: string;
    didTheActionWork: string;
    whatDidWeLearn: string;
  };
}

// 50. Organizational Optimization Engine
export type OptimizationDomain =
  | 'PRODUCTIVITY'
  | 'COST_EFFICIENCY'
  | 'REVENUE'
  | 'CUSTOMER_RETENTION'
  | 'PROJECT_DELIVERY'
  | 'WORKFORCE_ALLOCATION'
  | 'AUTOMATION'
  | 'RESOURCE_UTILIZATION'
  | 'WORKFLOW_EFFICIENCY'
  | 'TECHNOLOGY_USAGE'
  | 'AI_USAGE'
  | 'OPERATIONAL_RESILIENCE';

export interface ProposedOptimization {
  id: string;
  organizationId: string;
  domain: OptimizationDomain;
  title: string;
  currentBaseline: string;
  problem: string;
  evidence: string[];
  proposedChange: string;
  expectedBenefit: string;
  estimatedCostMinorUnits: number;
  currency: string;
  implementationTime: string;
  risks: string[];
  dependencies: string[];
  confidenceScore: number; // 0.0 - 1.0
  approvalRequirements: {
    requiresHumanAuth: boolean;
    requiredRole: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'REALIZED';
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
  };
  measurementCriteria: string[];
  createdAt: string;
}

// 51. Resource Intelligence Engine
export type ResourceCategory =
  | 'PEOPLE'
  | 'MONEY'
  | 'TIME'
  | 'INFRASTRUCTURE'
  | 'AI_COMPUTE'
  | 'SOFTWARE'
  | 'INVENTORY_CAPACITY';

export interface ResourceModelItem {
  resourceId: string;
  name: string;
  category: ResourceCategory;
  totalCapacity: number;
  allocatedCapacity: number;
  unit: string;
  utilizationRate: number; // 0.0 - 1.0
  status: 'OPTIMAL' | 'UNDERUTILIZED' | 'OVER_ALLOCATED' | 'BOTTLENECK' | 'CAPACITY_SHORTAGE';
  wasteDetected: string | null;
  competingPriorities: string[];
}

export interface ResourceAllocationRecommendation {
  recommendationId: string;
  resourceId: string;
  resourceName: string;
  actionType: 'REALLOCATE' | 'SCHEDULE_OPTIMIZATION' | 'AUTOMATE' | 'PRIORITIZE' | 'CAPACITY_EXPANSION';
  summary: string;
  expectedImpact: string;
  humanGovernanceMandatory: boolean;
  status: 'PROPOSED' | 'APPROVED' | 'DISMISSED';
}

// 52. Economic & Financial Intelligence 2.0
export interface EconomicMetricsBreakdown {
  revenueMinorUnits: number;
  mrrMinorUnits: number;
  arrMinorUnits: number;
  expensesMinorUnits: number;
  monthlyBurnMinorUnits: number;
  runwayMonths: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  cacMinorUnits: number; // Customer Acquisition Cost
  ltvMinorUnits: number; // Lifetime Value
  ltvCacRatio: number;
  churnRatePercent: number;
  netRetentionRatePercent: number;
  expansionRevenueMinorUnits: number;
  contractionRevenueMinorUnits: number;
  aiCostsMinorUnits: number;
  infrastructureCostsMinorUnits: number;
  marketplaceEconomicsMinorUnits: number;
  apiRevenueMinorUnits: number;
  creatorEconomyPayoutsMinorUnits: number;
  paymentFeesMinorUnits: number;
  isAccountingActual: boolean; // clearly distinguished from predictions
  sourceTimeframe: string;
}

export interface CostDriverAttribution {
  id: string;
  costCategory: 'INFRASTRUCTURE' | 'AI_USAGE' | 'WORKFLOWS' | 'INTEGRATIONS' | 'APPLICATIONS' | 'OPERATIONS';
  driver: string;
  monthlySpendMinorUnits: number;
  potentialSavingMinorUnits: number;
  risk: string;
  recommendedAction: string;
  status: 'DETECTED' | 'APPLYING' | 'OPTIMIZED';
}

export interface RevenueOptimizationProposal {
  id: string;
  type: 'PRICING_EXPERIMENT' | 'RETENTION_CAMPAIGN' | 'PRODUCT_PACKAGING' | 'CUSTOMER_EXPANSION' | 'RESOURCE_ALLOCATION';
  title: string;
  analysisSummary: string;
  targetSegment: string;
  projectedRevenueIncreaseMinorUnits: number;
  approvalRequired: boolean;
  status: 'REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface DynamicBudgetRecord {
  category: string;
  budgetMinorUnits: number;
  actualMinorUnits: number;
  forecastMinorUnits: number;
  variancePercent: number;
  varianceExplanation: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET';
}

// 53. AI Workforce Optimization & Unified Workforce
export interface AgentEconomicMetrics {
  agentId: string;
  agentName: string;
  specialization: string;
  utilizationRate: number; // 0.0 - 1.0
  successRate: number; // 0.0 - 1.0
  failureRate: number;
  averageLatencyMs: number;
  costPerTaskMinorUnits: number;
  totalCostIncurredMinorUnits: number;
  valueGeneratedMinorUnits: number;
  roiMultiplier: number;
  reliabilityScore: number;
  taskComplexityTiers: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  outcomeQualityScore: number; // 0 - 100
  efficiencyTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

export type ExecutionResourceType = 'HUMAN' | 'AI_AGENT' | 'AUTOMATION' | 'EXTERNAL_SERVICE';

export interface UnifiedWorkforceResource {
  resourceId: string;
  name: string;
  type: ExecutionResourceType;
  roleOrSkill: string;
  availability: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OFFLINE';
  permissionsLevel: 'STANDARD' | 'ELEVATED' | 'CRITICAL_SYSTEMS';
  unitCostMinorUnits: number;
  riskProfile: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  laborPolicyGuaranteed: boolean; // Respects privacy, legal labor bounds
}

export interface TaskDispatchPlan {
  taskId: string;
  taskName: string;
  urgency: 'ROUTINE' | 'HIGH' | 'CRITICAL';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedResourceType: ExecutionResourceType;
  assignedResourceId: string;
  assignedResourceName: string;
  economicJustification: string;
  estimatedCostMinorUnits: number;
  humanSupervisionRequired: boolean;
}

// 54. Strategy-to-Execution Lineage & Autonomous Planning Engine
export interface StrategicObjectiveLineage {
  vision: string;
  strategicObjectiveId: string;
  strategicObjectiveName: string;
  initiatives: {
    initiativeId: string;
    title: string;
    missionsCount: number;
    completionPercent: number;
    underfunded: boolean;
    strategicDriftDetected: boolean;
    driftDescription?: string;
  }[];
  resourceConflicts: string[];
  executionBottlenecks: string[];
}

export interface AutonomousPlan {
  planId: string;
  approvedObjective: string;
  currentBaselineAnalysis: string;
  churnOrProblemDrivers: string[];
  recommendedStrategy: string;
  simulatedAlternatives: {
    alternativeName: string;
    expectedBenefit: string;
    estimatedCostMinorUnits: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    timeline: string;
  }[];
  generatedMissions: {
    missionId: string;
    title: string;
    assignedTo: string;
    budgetMinorUnits: number;
    kpis: string[];
    riskControls: string[];
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'IN_FLIGHT' | 'COMPLETED';
  adjustedConditionsDetected: boolean;
  adjustmentProposal?: string;
}

// 55. Decision Intelligence 2.0 & Organizational Learning
export interface SignificantDecisionRecord {
  decisionId: string;
  title: string;
  decisionMaker: string;
  optionsConsidered: {
    optionName: string;
    projectedRoiPercent: number;
    costMinorUnits: number;
    riskSummary: string;
    confidence: number;
  }[];
  chosenOption: string;
  evidenceGathered: string[];
  coreAssumptions: string[];
  expectedOutcome: string;
  actualOutcome?: string;
  authorizedAt: string;
  status: 'PENDING_OUTCOME' | 'EVALUATED_SUCCESS' | 'EVALUATED_FAILURE';
}

export interface OrganizationalLearningRecord {
  learningId: string;
  category: 'STRATEGY' | 'AGENT' | 'WORKFLOW' | 'PREDICTION';
  subject: string;
  predictionOrRecommendation: string;
  actualResult: string;
  varianceExplanation: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'RECURRING_FAILURE' | 'VALIDATED_IMPROVEMENT';
  confidenceWeight: number;
  appliedToFutureRecommendations: boolean;
  timestamp: string;
}

export interface RootCauseAnalysisItem {
  incidentOrProblemId: string;
  symptom: string;
  signals: string[];
  possibleCauses: string[];
  evidence: string[];
  observedFacts: string[]; // Explicitly separated
  inferences: string[];    // Explicitly separated
  hypotheses: string[];    // Explicitly separated
  validatedRootCause: string;
  recommendedAction: string;
  confidence: number;
}

export interface StrategyTradeoffEvaluation {
  scenarioTitle: string; // e.g. "Hiring vs AI Automation", "Expansion vs Consolidation"
  strategyA: {
    name: string;
    expectedRoiPercent: number;
    costMinorUnits: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    resourceDemand: string;
    timeline: string;
    uncertainty: number; // 0 - 100%
  };
  strategyB: {
    name: string;
    expectedRoiPercent: number;
    costMinorUnits: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    resourceDemand: string;
    timeline: string;
    uncertainty: number;
  };
  recommendation: string;
  tradeoffSummary: string;
}

// 56. Opportunity Portfolio & Strategic Risk Portfolio
export type OpportunityLifecycleStatus =
  | 'DISCOVERED'
  | 'VALIDATING'
  | 'PRIORITIZED'
  | 'APPROVED'
  | 'EXECUTING'
  | 'REALIZED'
  | 'CLOSED';

export interface OpportunityPortfolioItem {
  id: string;
  title: string;
  expectedValueMinorUnits: number;
  confidenceScore: number;
  implementationCostMinorUnits: number;
  strategicImportance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  resourceRequirements: string[];
  status: OpportunityLifecycleStatus;
  actualValueRealizedMinorUnits: number;
  createdAt: string;
}

export type StrategicRiskDomain =
  | 'OPERATIONAL'
  | 'FINANCIAL'
  | 'TECHNOLOGY'
  | 'CYBERSECURITY'
  | 'AI_SYSTEMIC'
  | 'PROJECT'
  | 'ECOSYSTEM';

export interface StrategicRiskPortfolioItem {
  id: string;
  domain: StrategicRiskDomain;
  title: string;
  exposureMinorUnits: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  mitigationStatus: 'UNMITIGATED' | 'IN_PROGRESS' | 'MITIGATED';
  concentration: string;
  owner: string;
  uncertaintyDisclosed: string;
}

// 57. Workflow Optimization & Governed Self-Healing
export interface WorkflowOptimizationReport {
  workflowId: string;
  workflowName: string;
  unnecessarySteps: string[];
  repeatedWorkDetected: string[];
  bottleneckStage: string;
  averageDelayMinutes: number;
  expensiveOperationDetails: string;
  automationOpportunity: string;
  proposedImprovement: string;
  approvalRequiredBeforeProduction: boolean;
}

export interface SelfHealingActionRecord {
  actionId: string;
  actionType:
    | 'RESTART_FAILED_WORKER'
    | 'RETRY_TRANSIENT_REQUEST'
    | 'REOPEN_FAILED_QUEUE_CONSUMER'
    | 'ROTATE_TEMPORARY_CONNECTION'
    | 'DISABLE_UNHEALTHY_CONNECTOR'
    | 'REROUTE_ELIGIBLE_WORKLOAD';
  targetSystem: string;
  predefinedPolicy: string;
  scope: string;
  rateLimitQuota: string;
  executedAt: string;
  result: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  rollbackMechanism: string;
  emergencyDisablementActive: boolean;
}

export type IncidentLifecycleState =
  | 'DETECTED'
  | 'CLASSIFIED'
  | 'PRIORITIZED'
  | 'INVESTIGATED'
  | 'CONTAINMENT_PROPOSED'
  | 'APPROVAL'
  | 'MITIGATION'
  | 'VERIFIED'
  | 'RECOVERED'
  | 'POSTMORTEM'
  | 'LEARNING';

export interface IncidentIntelligenceRecord {
  incidentId: string;
  title: string;
  severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  currentState: IncidentLifecycleState;
  automatedLowRiskContainmentExecuted: boolean;
  humanAuthorizationObtained: boolean;
  containmentActionTaken?: string;
  rootCauseSummary?: string;
  lessonsLearned?: string[];
  detectedAt: string;
  recoveredAt?: string;
}

// 58. Continuity, Dependency & Ecosystem Economy
export interface BusinessContinuityAssessment {
  overallResilienceScore: number; // 0 - 100
  criticalServicesAudited: number;
  singlePointsOfFailure: {
    category: 'SERVICE' | 'VENDOR' | 'INFRASTRUCTURE' | 'ROLE' | 'AI_PROVIDER';
    name: string;
    impactDescription: string;
    concentrationRisk: string;
    continuityAlternative: string;
  }[];
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
}

export interface InternalResourceMarketListing {
  listingId: string;
  resourceType: 'AI_AGENT' | 'WORKFLOW' | 'APPLICATION' | 'DEVELOPER_SERVICE' | 'EXPERTISE' | 'INTEGRATION';
  name: string;
  providerOrg: string;
  capabilitySummary: string;
  availability: 'AVAILABLE' | 'ON_DEMAND' | 'QUEUED';
  costModel: string;
  performanceScore: number;
  securityAuditPassed: boolean;
  compatibilityTags: string[];
}

export interface AICapacityForecast {
  currentMonthlyTokensConsumed: number;
  expectedMissionsGrowthPercent: number;
  projectedMonthlySpendMinorUnits: number;
  latencyTrendMs: number;
  recommendedCapacityCeilingMinorUnits: number;
  uncontrolledSpendPrevented: boolean;
}

export interface ValueOptimizationRecord {
  metricId: string;
  period: string;
  valueCreatedMinorUnits: number;
  valueProtectedMinorUnits: number;
  valueLostMinorUnits: number;
  costAvoidedMinorUnits: number;
  timeSavedHours: number;
  revenueGeneratedMinorUnits: number;
  productivityImprovementPercent: number;
  riskReducedScore: number;
  verifiedEvidence: string;
}

// 59. Organizational Maturity Engine & Autonomy Governance 2.0
export interface MaturityRadarScore {
  dimension:
    | 'Strategy'
    | 'Execution'
    | 'Data'
    | 'Automation'
    | 'AI Adoption'
    | 'Security'
    | 'Governance'
    | 'Financial Management'
    | 'Knowledge Management'
    | 'Resilience';
  score: number; // 0 - 100
  evidence: string;
  identifiedWeakness: string;
  recommendedImprovement: string;
}

export type AutonomyRiskTier = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';

export interface AutonomyPolicyRule {
  ruleId: string;
  scope: string; // e.g. "Department: Finance", "Action: Reallocate Compute", "Financial > $1000"
  riskTier: AutonomyRiskTier;
  executionMode: 'AUTOMATIC' | 'CONFIGURED_SUPERVISION' | 'REQUIRES_APPROVAL' | 'EXPLICIT_HUMAN_AUTH';
  enforcementCount: number;
}

export interface AISafetyFirewallPipelineCheck {
  checkId: string;
  actionIntent: string;
  pipelineSteps: {
    intentValidated: boolean;
    identityVerified: boolean;
    permissionAuthorized: boolean;
    policyCompliant: boolean;
    dataAccessEnforced: boolean;
    riskEvaluated: boolean;
    budgetWithinLimit: boolean;
    approvalVerified: boolean;
    executionMonitored: boolean;
    resultValidated: boolean;
    auditLogged: boolean;
  };
  passed: boolean;
  thwartedThreats: string[]; // e.g. "Prompt Injection prevented", "Unauthorized cross-tenant leaked"
  timestamp: string;
}

export interface HumanOversightQueueItem {
  itemId: string;
  title: string;
  category: 'FINANCIAL' | 'WORKFORCE' | 'STRATEGIC' | 'INFRASTRUCTURE' | 'POLICY';
  requestedBy: string;
  riskLevel: 'HIGH' | 'CRITICAL';
  estimatedImpact: string;
  requiresDualApproval: boolean;
  approvalCount: number;
  timeoutMinutesRemaining: number;
  delegationEligible: boolean;
  emergencyStopTriggered: boolean;
  status: 'AWAITING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EMERGENCY_STOPPED';
}

// ============================================================================
// CATALYX V12 GLOBAL INTELLIGENCE COMMERCE & PLATFORM INFRASTRUCTURE TYPES
// ============================================================================

export interface EconomicEngine2Metrics {
  totalGrossRevenueMinor: number;       // In integer minor units (cents / KES minor)
  netRevenueMinor: number;
  marketplaceGMVMinor: number;
  platformTakeRatePct: number;
  creatorPayoutsMinor: number;
  partnerPayoutsMinor: number;
  apiRevenueMinor: number;
  aiRevenueMinor: number;
  enterpriseRevenueMinor: number;
  aiComputeCostMinor: number;
  infraCostMinor: number;
  paymentProcessingCostMinor: number;
  taxesFeesMinor: number;
  grossMarginPct: number;
  contributionMarginPct: number;
  activeOrgsCount: number;
  activeUsersCount: number;
  activeDevelopersCount: number;
  registeredApplicationsCount: number;
  activeAgentsCount: number;
  activeWorkflowsCount: number;
  mrrMinor: number;
  arrMinor: number;
  currency: string;
}

export interface FinancialEventRecord {
  eventId: string;
  idempotencyKey: string;
  tenantId: string;
  timestamp: string;
  eventType: 
    | 'SUBSCRIPTION_CHARGE'
    | 'USAGE_CHARGE'
    | 'MARKETPLACE_PURCHASE'
    | 'API_USAGE'
    | 'AGENT_TASK_FEE'
    | 'CREDIT_PURCHASE'
    | 'CREATOR_PAYOUT'
    | 'PARTNER_SHARE'
    | 'REFUND'
    | 'TAX_FEE';
  amountMinor: number;
  currency: string;
  customerValueMinor: number;
  platformShareMinor: number;
  creatorShareMinor: number;
  partnerShareMinor: number;
  aiCostMinor: number;
  infraCostMinor: number;
  taxMinor: number;
  status: 'SETTLED' | 'PENDING' | 'REFUNDED' | 'DISPUTED';
  auditHash: string;
}

export interface MarketplaceProduct2 {
  productId: string;
  title: string;
  description: string;
  category: 
    | 'APPLICATION'
    | 'AI_AGENT'
    | 'WORKFLOW'
    | 'CONNECTOR'
    | 'ANALYTICS'
    | 'KNOWLEDGE_PACKAGE'
    | 'INDUSTRY_SOLUTION'
    | 'DEVELOPER_TOOL'
    | 'ENTERPRISE_SERVICE';
  providerId: string;
  providerName: string;
  providerType: 'PLATFORM' | 'DEVELOPER' | 'AI_CREATOR' | 'PARTNER' | 'ENTERPRISE';
  pricingModel: 'FREE' | 'SUBSCRIPTION' | 'USAGE_BASED' | 'ONE_TIME' | 'OUTCOME_BASED';
  priceMinor: number;
  currency: string;
  securityRating: 'A+' | 'A' | 'B' | 'PENDING';
  verifiedOutcomesCount: number;
  rating: number;
  reviewCount: number;
  activeInstalls: number;
  version: string;
  permissionsRequired: string[];
  dataRequirements: string;
  slaGuarantee?: string;
  publishedAt: string;
}

export interface IntelligenceServiceProduct {
  serviceId: string;
  name: string;
  category: 
    | 'MARKET_INTELLIGENCE'
    | 'OPERATIONAL_ANALYSIS'
    | 'FINANCIAL_FORECAST'
    | 'STRATEGIC_ANALYSIS'
    | 'WORKFLOW_OPTIMIZATION'
    | 'COMPLIANCE_AUDIT'
    | 'CHURN_DIAGNOSIS';
  provider: string;
  scope: string;
  inputsRequired: string[];
  deliverableOutputs: string[];
  priceMinor: number;
  currency: string;
  slaTurnaroundHours: number;
  securityClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED_ENTERPRISE';
  humanApprovalRequired: boolean;
}

export interface GovernedAgentCommerceTransaction {
  transactionId: string;
  buyerAgentId: string;
  buyerAgentName: string;
  sellerAgentId: string;
  sellerAgentName: string;
  taskCapabilityRequested: string;
  priceMinor: number;
  currency: string;
  budgetAuthorizedMinor: number;
  status: 
    | 'DISCOVERED'
    | 'VERIFIED'
    | 'CAPABILITY_CHECKED'
    | 'PRICE_CHECKED'
    | 'PERMISSION_AUTHORIZED'
    | 'EXECUTING'
    | 'RESULT_VERIFIED'
    | 'TRANSACTION_RECORDED'
    | 'REJECTED_BUDGET';
  verificationHash: string;
  timestamp: string;
}

export interface CommercialApiProduct {
  apiId: string;
  name: string;
  endpointPrefix: string;
  tier: 'FREE' | 'GROWTH' | 'ENTERPRISE';
  pricePerThousandCallsMinor: number;
  currency: string;
  quotaMonthly: number;
  rateLimitRPS: number;
  activeSubscribers: number;
  uptime30d: number;
  documentationUrl: string;
}

export interface DeveloperApplicationManifest {
  appId: string;
  developerId: string;
  name: string;
  version: string;
  manifestVersion: string;
  capabilities: string[];
  permissions: string[];
  dependencies: string[];
  sandboxIsolated: boolean;
  pricing: string;
  status: 'DEVELOPMENT' | 'SANDBOX_TESTING' | 'IN_SECURITY_REVIEW' | 'PUBLISHED' | 'DEPRECATED';
  createdAt: string;
}

export interface IndustrySolutionPackage {
  solutionId: string;
  industry: 'FINANCE' | 'HEALTHCARE' | 'EDUCATION' | 'AGRICULTURE' | 'LOGISTICS' | 'RETAIL' | 'MANUFACTURING' | 'GOVERNMENT';
  title: string;
  description: string;
  bundledApps: string[];
  bundledAgents: string[];
  bundledWorkflows: string[];
  bundledConnectors: string[];
  knowledgePackages: string[];
  compliancePolicies: string[];
  priceMonthlyMinor: number;
  currency: string;
  activeEnterpriseDeployments: number;
}

export interface PlatformUsageCreditLedger {
  accountId: string;
  organizationId: string;
  realCurrencyBalanceMinor: number;
  platformCreditBalanceUnits: number; // Prepaid internal units, distinct from real currency
  creditExchangeRate: number;        // e.g. 100 units = $1.00 USD
  recentConsumptions: {
    consumptionId: string;
    serviceType: 'AI_INFERENCE' | 'API_CALL' | 'WORKFLOW_STEP' | 'INTELLIGENCE_SERVICE';
    creditsDebited: number;
    timestamp: string;
  }[];
}

export interface UnifiedBillingStatement {
  invoiceId: string;
  organizationId: string;
  billingPeriod: string;
  grossChargesMinor: number;
  discountsAppliedMinor: number;
  taxesFeesMinor: number;
  creditsAppliedMinor: number;
  refundsDeductedMinor: number;
  netPayableMinor: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentProvider: 'PESAPAL_V3' | 'GLOBAL_CARD_RAIL' | 'ENTERPRISE_WIRE';
  issuedAt: string;
}

export interface CreatorPayoutRecord {
  payoutId: string;
  recipientId: string;
  recipientName: string;
  role: 'CREATOR' | 'PARTNER' | 'DEVELOPER';
  grossEarningsMinor: number;
  platformCommissionMinor: number;
  taxesWithheldMinor: number;
  payableBalanceMinor: number;
  currency: string;
  status: 'SETTLED' | 'PROCESSING' | 'ON_HOLD';
  payoutMethod: 'PESAPAL_EFT' | 'SWIFT_WIRE' | 'LOCAL_BANK';
  processedAt: string;
}

export interface EcosystemDemandOpportunity {
  opportunityId: string;
  trendTitle: string;
  category: string;
  demandVelocityScore: number;       // 0-100
  supplyFulfillmentRatio: number;     // e.g. 0.22 (indicates unmet demand)
  targetAudience: string;
  projectedMarketGMVMinor: number;
  recommendedDeveloperAction: string;
}

export interface CapitalAllocationComparison {
  comparisonId: string;
  title: string;
  options: {
    optionId: string;
    name: string;
    capitalRequiredMinor: number;
    projectedRoiMultiplier: number;
    estimatedBreakevenMonths: number;
    confidenceScore: number;
    riskDomain: string;
    keyAssumptions: string[];
  }[];
  recommendation: string;
  humanAuthorizationRequired: boolean;
}

export interface ScaleEconomicModelScenario {
  scenarioName: string;
  organizationCount: number;
  userCount: number;
  projectedAnnualRevenueMinor: number;
  projectedAiCostMinor: number;
  projectedInfraCostMinor: number;
  projectedSupportCostMinor: number;
  projectedPaymentCostMinor: number;
  projectedMarketplaceGMVMinor: number;
  projectedCreatorPayoutsMinor: number;
  projectedGrossMarginPct: number;
}

export interface V12ProductionCertificationReport {
  reportTitle: string;
  version: string;
  certifiedAt: string;
  overallVerdict: 'PASS - CERTIFIED GLOBAL INTELLIGENCE COMMERCE PLATFORM';
  extensionPointsPrepared: {
    targetVersion: 'V13' | 'V14' | 'V15+';
    codename: string;
    architecturalReadiness: string;
  }[];
  pillarsAudited: {
    pillar: string;
    status: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT IMPLEMENTED' | 'REQUIRES CONFIGURATION' | 'BLOCKED';
    score: string;
    evidence: string;
  }[];
  nonFunctionalAudit: {
    tenantIsolationEnforced: boolean;
    financialDoubleEntryReconciled: boolean;
    aiFirewallActive: boolean;
    gracefulDegradationVerified: boolean;
    disasterRecoveryRPO_RTO: string;
  };
}

// ============================================================================
// CATALYX V13: GLOBAL AUTONOMOUS ENTERPRISE NETWORK (GAEN) TYPES
// ============================================================================

export type EnterpriseFederationTier = 'SOVEREIGN_NODE' | 'ENTERPRISE_PARTNER' | 'CONSORTIUM_MEMBER' | 'GUEST_VALIDATOR';
export type InterOrgContractStatus = 'DRAFT' | 'NEGOTIATING' | 'SIGNED_ACTIVE' | 'EXECUTING' | 'DISPUTED' | 'COMPLETED' | 'TERMINATED';
export type InterOrgContractType = 
  | 'BILATERAL_SLA'
  | 'CONSORTIUM_AGREEMENT'
  | 'DATA_FEDERATION_COVENANT'
  | 'CROSS_BORDER_SETTLEMENT'
  | 'AGENT_SWARM_FEDERATION'
  | 'SUPPLY_CHAIN_ESCROW';

export interface AutonomousEnterpriseNode {
  nodeId: string;
  organizationId: string;
  organizationName: string;
  sovereignDid: string;                    // e.g. "did:catalyx:org_acme_corp"
  jurisdiction: string;                    // e.g. "Kenya / East Africa", "EU / Germany", "US / Delaware"
  federationTier: EnterpriseFederationTier;
  trustScore: number;                      // 0 - 100
  securityClearance: 'TIER_1_DEFENSE' | 'TIER_2_FINANCIAL' | 'TIER_3_ENTERPRISE' | 'TIER_4_COMMERCIAL';
  endpoint: string;                        // Sovereign Federation Gateway URL
  activeInterOrgConnectionsCount: number;
  totalSettlementVolumeMinor: number;
  lastHeartbeat: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'ISOLATED';
}

export interface AutonomousInterOrgContract {
  contractId: string;
  contractTitle: string;
  initiatingOrgId: string;
  initiatingOrgName: string;
  counterpartyOrgIds: string[];
  counterpartyOrgNames: string[];
  contractType: InterOrgContractType;
  termsSummary: string;
  budgetAuthorizedMinor: number;
  currency: string;
  escrowDepositMinor: number;
  escrowStatus: 'NONE' | 'HELD_IN_ESCROW' | 'RELEASED_PARTIAL' | 'RELEASED_FULL' | 'LOCKED_DISPUTED';
  performanceCriteria: {
    metric: string;
    targetValue: string;
    verificationMethod: 'TELEMETRY_PROOF' | 'ORACLE_ATTESTATION' | 'MUTUAL_SIGN_OFF';
    currentValue?: string;
    verified: boolean;
  }[];
  penaltyClauses: string[];
  signatures: {
    orgId: string;
    signerDid: string;
    signatureHash: string;
    signedAt: string;
  }[];
  status: InterOrgContractStatus;
  effectiveFrom: string;
  expiresAt: string;
  executionHash: string;
}

export interface InterOrgSettlementRecord {
  settlementId: string;
  batchId: string;
  sourceOrgId: string;
  sourceOrgName: string;
  destinationOrgId: string;
  destinationOrgName: string;
  contractId: string;
  grossAmountMinor: number;
  netClearingOffsetMinor: number;           // Multi-lateral netting deduction
  finalPayableMinor: number;
  currency: string;
  rail: 'PESAPAL_INTER_ENTERPRISE' | 'RTGS_CROSS_BORDER' | 'SWIFT_ISO20022' | 'SOVEREIGN_CLEARING_UNIT';
  status: 'PENDING_CLEARING' | 'ESCROWED' | 'NETTED' | 'SETTLED' | 'DISPUTE_FROZEN';
  timestamp: string;
  auditSignature: string;
}

export interface BilateralNettingSummary {
  cycleId: string;
  periodStart: string;
  periodEnd: string;
  participatingOrgsCount: number;
  grossTransactionsVolumeMinor: number;
  nettedSettlementVolumeMinor: number;
  liquidityEfficiencyPct: number;           // e.g. 74.5% less cash needed to settle
  status: 'RECONCILED' | 'SETTLEMENT_IN_PROGRESS' | 'CLOSED';
}

export interface AutonomousConsortium {
  consortiumId: string;
  name: string;
  domain: 'SUPPLY_CHAIN_TRADE' | 'SYNDICATE_FINANCE' | 'CLINICAL_TRIAL_FEDERATION' | 'AGRO_COMMODITY_EXCHANGE' | 'ESG_CROSS_VERIFICATION';
  description: string;
  foundingMembersCount: number;
  memberOrgIds: string[];
  memberOrgNames: string[];
  governingCharterSummary: string;
  consensusMechanism: 'PROOF_OF_AUTHORITY' | 'STAKE_WEIGHTED' | 'UNANIMOUS_CONSENT' | 'AUTONOMOUS_ARBITRATION';
  activeJointWorkflowsCount: number;
  jointTreasuryMinor: number;
  currency: string;
  createdDate: string;
  status: 'ACTIVE' | 'FORMING' | 'GOVERNANCE_PAUSED';
}

export interface BilateralNegotiationSession {
  sessionId: string;
  initiatorOrgId: string;
  initiatorOrgName: string;
  initiatorAgentName: string;
  responderOrgId: string;
  responderOrgName: string;
  responderAgentName: string;
  negotiationTopic: string;
  parameters: {
    parameterName: string;
    initiatorPreference: string;
    responderPreference: string;
    currentConvergencePct: number;        // 0-100%
  }[];
  roundsCount: number;
  maxRounds: number;
  status: 'NEGOTIATING' | 'CONVERGED_AGREED' | 'DEADLOCK_REJECTED' | 'HUMAN_ESCALATION_REQUIRED';
  lastProposalTimestamp: string;
  agreedDraftContractId?: string;
}

export interface SovereignEnterpriseCredential {
  credentialId: string;
  subjectOrgId: string;
  subjectOrgName: string;
  issuerAuthority: string;                 // e.g. "ISO Global Standards Authority", "Central Bank Digital Registry", "Nexus Trust Network"
  credentialType: 'SOC2_TYPE_II' | 'ISO_27001' | 'REGULATORY_FINANCIAL_LICENSE' | 'CARBON_AUDIT_ATTESTATION' | 'HIPAA_COMPLIANCE' | 'AML_CFT_TIER_1';
  issuedAt: string;
  validUntil: string;
  zeroKnowledgeProofHash: string;          // ZKP proof of compliance without disclosing proprietary internal logs
  verifiedOnChain: boolean;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
}

export interface FederatedResourcePool {
  poolId: string;
  providerOrgId: string;
  providerOrgName: string;
  resourceType: 'SPECIALIZED_AGENT_SWARM' | 'COMPUTE_CLUSTER' | 'FEDERATED_MODEL_INFERENCE' | 'EPHEMERAL_KNOWLEDGE_PARTITION';
  title: string;
  totalCapacityUnits: number;
  allocatedCapacityUnits: number;
  unitMeasurement: string;                  // e.g. "Agent Hours / Day", "GPU TFLOPS / Hr", "Query Shards"
  priceMinorPerUnit: number;
  currency: string;
  privacyProtocol: 'DIFFERENTIAL_PRIVACY' | 'SECURE_MULTI_PARTY_COMPUTE' | 'FEDERATED_LEARNING' | 'ZERO_PERSISTENCE_EPHEMERAL';
  activeConsumerOrgsCount: number;
  status: 'AVAILABLE' | 'SATURATED' | 'OFFLINE';
}

export interface NetworkDisputeCase {
  caseId: string;
  contractId: string;
  claimantOrgId: string;
  claimantOrgName: string;
  respondentOrgId: string;
  respondentOrgName: string;
  disputeCategory: 'SLA_BREACH' | 'UNAUTHORIZED_DATA_ACCESS' | 'PAYMENT_DEFAULT' | 'COMPUTATIONAL_DRIFT';
  claimAmountMinor: number;
  currency: string;
  evidenceHashes: string[];
  arbitrationCourtStatus: 'FILED' | 'EVIDENCE_ASSESSMENT' | 'AUTONOMOUS_VERDICT_RENDERED' | 'APPEALED' | 'SETTLED_ENFORCED';
  arbitratorVerdict?: {
    verdictSummary: string;
    awardedAmountMinor: number;
    penaltyAssessedMinor: number;
    actionEnforced: string;
    signedTimestamp: string;
  };
}

export interface NetworkRiskContagionModel {
  systemicResilienceIndex: number;          // 0 - 100
  networkVulnerabilityScore: number;        // 0 - 100
  totalCrossOrgActiveValueMinor: number;
  highCentralityNodes: {
    orgId: string;
    orgName: string;
    centralityScore: number;
    connectedPeersCount: number;
    contagionRiskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  counterpartyExposureCapMinor: number;
  cascadeFailureContainmentActive: boolean;
  lastSimulatedStressTest: string;
}

export interface V13ProductionCertificationReport {
  reportTitle: string;
  version: string;
  certifiedAt: string;
  overallVerdict: 'PASS - CERTIFIED GLOBAL AUTONOMOUS ENTERPRISE NETWORK';
  extensionPointsPrepared: {
    targetVersion: 'V14' | 'V15+';
    codename: string;
    architecturalReadiness: string;
  }[];
  pillarsAudited: {
    pillar: string;
    status: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT IMPLEMENTED' | 'REQUIRES CONFIGURATION' | 'BLOCKED';
    score: string;
    evidence: string;
  }[];
  networkAuditSummary: {
    activeFederatedEnterpriseNodes: number;
    activeInterOrgContracts: number;
    bilateralNettingEfficiencyPct: number;
    sovereignIdentityZkpActive: boolean;
    multiPartyConsortiumsActive: number;
    systemicResilienceScore: number;
    zeroCrossTenantDataLeakageVerified: boolean;
  };
}

// ============================================================================
// CATALYX V14: GLOBAL INTELLIGENCE ECONOMY (GIE) TYPES
// ============================================================================

export type IntelligenceProductCategory =
  | 'AI_AGENT'
  | 'AGENT_TEAM'
  | 'WORKFLOW_AUTOMATION'
  | 'APPLICATION'
  | 'INTELLIGENCE_API'
  | 'CONNECTOR'
  | 'KNOWLEDGE_PRODUCT'
  | 'ANALYTICS_MODEL'
  | 'INDUSTRY_SOLUTION'
  | 'ENTERPRISE_SERVICE';

export type ProductPricingModel =
  | 'USAGE_BASED'
  | 'OUTCOME_BASED'
  | 'SUBSCRIPTION'
  | 'PERPETUAL_LICENSE';

export interface UniversalIntelligenceProduct {
  productId: string;
  title: string;
  category: IntelligenceProductCategory;
  creatorId: string;
  creatorName: string;
  creatorOrgId: string;
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  permissionsRequired: string[];
  pricingModel: ProductPricingModel;
  priceMinor: number;                           // Cents / integer minor
  outcomeMetric?: string;                       // e.g. "per verified legal covenant resolved"
  outcomeProofType?: string;                    // e.g. "CRYPTOGRAPHIC_ORACLE_TELEMETRY"
  currency: string;
  supportedRegions: string[];
  securityClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'FEDERATED_AIRGAPPED';
  riskClassification: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceCertifications: string[];           // SOC2, ISO27001, HIPAA, GDPR
  usageLimits: {
    maxRequestsPerMin: number;
    maxComputeUnitsPerCall: number;
    maxConcurrentJobs: number;
  };
  provenanceHash: string;                       // Immutable SHA-256 code/model hash
  licenseType: string;                          // e.g. "CATALYX Commercial Dual-Sovereign License 2.0"
  refundPolicyDays: number;
  verificationState: 'UNVERIFIED' | 'SECURITY_SCANNED' | 'ENTERPRISE_CERTIFIED';
  status: 'DRAFT' | 'IN_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
  rating: number;                               // 0.0 - 5.0
  reviewCount: number;
  totalDeployments: number;
  monthlyGrossMinor: number;
}

export type AutonomyLevel =
  | 'L0_MANUAL'
  | 'L1_ASSISTED'
  | 'L2_CONDITIONAL'
  | 'L3_SUPERVISED_AUTONOMOUS'
  | 'L4_GOVERNED_FULL_AUTONOMY'
  | 'L0_OBSERVE'
  | 'L1_RECOMMEND'
  | 'L2_PREPARE'
  | 'L3_APPROVED_EXECUTION'
  | 'L4_GOVERNED_AUTONOMOUS';

export interface AutonomousEconomicAgent {
  agentId: string;
  name: string;
  role: string;
  ownerOrgId: string;
  ownerOrgName: string;
  autonomyLevel: AutonomyLevel;
  costProfileMinorPerTask: number;
  monthlyBudgetCapMinor: number;
  currentMonthSpentMinor: number;
  reputationScore: number;                       // 0 - 100
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  activePolicyBindings: string[];
  allowedExecutionTools: string[];
  status: 'ACTIVE' | 'FROZEN_BY_EMERGENCY' | 'DRAINING';
  totalTasksExecuted: number;
  successRatePct: number;
  lastAuditCheckpoint: string;
}

export interface AgentToAgentTransactionRecord {
  transactionId: string;
  requestingAgentId: string;
  requestingAgentName: string;
  requestingOrgName: string;
  executingAgentId: string;
  executingAgentName: string;
  executingOrgName: string;
  taskDescription: string;
  authorizationGateStatus: 'POLICY_VALIDATED' | 'IDENTITY_VERIFIED' | 'BUDGET_APPROVED' | 'HUMAN_OVERRIDE_APPROVED' | 'SETTLED';
  authorizedSpendMinor: number;
  actualSettledMinor: number;
  outcomeVerified: boolean;
  auditSignatureSha256: string;
  timestamp: string;
}

export interface IntelligenceAsAServiceTier {
  serviceId: string;
  serviceName: string;
  serviceDomain: 'FORECASTING' | 'OPTIMIZATION' | 'DOCUMENT_INTELLIGENCE' | 'FINANCIAL_MODELING' | 'RISK_INTELLIGENCE' | 'ENTERPRISE_DECISION_SUPPORT';
  modelInferenceCostMinor: number;
  platformInfraCostMinor: number;
  creatorMarginMinor: number;
  customerPriceMinor: number;
  platformGrossMarginPct: number;
  slaLatencyMs: number;
  activeTenantsCount: number;
}

export interface CatalyxValueIndexMetrics {
  organizationId: string;
  organizationName: string;
  measuredPeriod: string;
  timeSavedHours: number;
  operationalCostReductionMinor: number;
  revenueGeneratedMinor: number;
  riskAvoidedValueMinor: number;
  productivityImprovementPct: number;
  workflowAccelerationMultiplier: number;
  decisionLatencyReductionHours: number;
  automationRatePct: number;
  humanWorkloadReductionPct: number;
  totalEconomicROIValueMinor: number;
  netSubscriptionCostMinor: number;
  roiMultiple: number;                           // e.g. 8.4x
}

export interface OutcomeMarketContract {
  outcomeContractId: string;
  buyerOrgName: string;
  sellerProviderName: string;
  outcomeDefinition: string;
  outcomeVerificationProof: 'API_TELEMETRY' | 'ORACLE_ATTESTATION' | 'DUAL_HUMAN_SIGN_OFF' | 'AUTOMATED_BENCHMARK';
  pricePerOutcomeMinor: number;
  targetQuantity: number;
  deliveredQuantity: number;
  totalEscrowLockedMinor: number;
  totalPaidOutMinor: number;
  disputeCount: number;
  status: 'ACTIVE' | 'FULFILLED' | 'IN_DISPUTE' | 'COMPLETED';
}

export interface EnterpriseProcurementWorkflow {
  procurementRequestId: string;
  requestingOrgId: string;
  requestingOrgName: string;
  requestingDepartment: string;
  productId: string;
  productTitle: string;
  estimatedAnnualCostMinor: number;
  vendorSecurityClearance: string;
  budgetApprovalStatus: 'PENDING' | 'APPROVED' | 'ESCALATED_FINANCE' | 'REJECTED';
  legalComplianceSignOff: boolean;
  technicalEvaluationScore: number;              // 0 - 100
  currentWorkflowStage: 'DISCOVERY' | 'SECURITY_REVIEW' | 'BUDGET_APPROVAL' | 'EXECUTIVE_SIGN_OFF' | 'CONTRACT_SEALED';
  requiredApprovers: {
    role: string;
    email: string;
    approved: boolean;
    signedAt?: string;
  }[];
}

export interface GlobalEmergencyControlPlaneState {
  emergencyModeActive: boolean;
  readOnlyMode: boolean;
  agentsSuspended: boolean;
  workflowsSuspended: boolean;
  marketplaceTransactionsFrozen: boolean;
  payoutsFrozen: boolean;
  apiRateLimitsRestricted: boolean;
  emergencyActivatedBy: string;
  emergencyReason: string;
  activatedAt: string;
  auditLog: {
    timestamp: string;
    action: string;
    triggeredBy: string;
    target: string;
    ipAddress: string;
  }[];
}

export interface V14GlobalIntelligenceEconomyMetrics {
  monthlyRecurringRevenueMinor: number;
  annualRecurringRevenueMinor: number;
  grossMerchandiseValueMinor: number;
  creatorPayoutsMinor: number;
  platformNetRevenueMinor: number;
  platformTakeRatePct: number;
  customerCount: number;
  activeAgentsCount: number;
  activeWorkflowsCount: number;
  developerEcosystemCount: number;
  avgCustomerRoiMultiple: number;
  overallSystemicResilienceIndex: number;
}

export interface V14ProductionCertificationReport {
  reportTitle: string;
  version: string;
  certifiedAt: string;
  overallVerdict: 'PASS - CERTIFIED GLOBAL INTELLIGENCE ECONOMY';
  extensionPointsPrepared: {
    targetVersion: 'V15+';
    codename: string;
    architecturalReadiness: string;
  }[];
  pillarsAudited: {
    pillar: string;
    status: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT IMPLEMENTED' | 'REQUIRES CONFIGURATION' | 'BLOCKED';
    score: string;
    evidence: string;
  }[];
  economyAuditSummary: {
    activeIntelligenceProducts: number;
    governedEconomicAgents: number;
    monthlyGrossMerchandiseValueMinor: number;
    platformTakeRatePct: number;
    catalyxValueIndexAvgRoiMultiple: number;
    emergencyCircuitBreakersTested: boolean;
    zeroCrossTenantDataLeakageVerified: boolean;
    financialLedgerDoubleEntryVerified: boolean;
  };
}

// ==========================================
// V15 GLOBAL AUTONOMOUS INTELLIGENCE INFRASTRUCTURE TYPES
// ==========================================

export type V15LoopPhase =
  | 'OBSERVE'
  | 'UNDERSTAND'
  | 'MODEL'
  | 'PREDICT'
  | 'DISCOVER'
  | 'PLAN'
  | 'SIMULATE'
  | 'OPTIMIZE'
  | 'AUTHORIZE'
  | 'EXECUTE'
  | 'VERIFY'
  | 'MEASURE'
  | 'LEARN'
  | 'ADAPT';

export type V15EpistemicClassification =
  | 'OBSERVATION'
  | 'INFERENCE'
  | 'PREDICTION'
  | 'RECOMMENDATION'
  | 'DECISION'
  | 'AUTHORIZED_ACTION'
  | 'EXECUTED_ACTION'
  | 'MEASURED_OUTCOME';

export type MissionState =
  | 'DRAFT'
  | 'PLANNING'
  | 'SIMULATION'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'MONITORING'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type AgentSpecialistRole =
  | 'SPECIALIST'
  | 'SUPERVISORY'
  | 'PLANNING'
  | 'VERIFICATION'
  | 'MONITORING'
  | 'RESEARCH'
  | 'EXECUTION';

export type FabricEntityType =
  | 'ORGANIZATION'
  | 'AGENT'
  | 'APPLICATION'
  | 'WORKFLOW'
  | 'API'
  | 'KNOWLEDGE_SYSTEM'
  | 'ECONOMIC_SYSTEM'
  | 'INFRASTRUCTURE'
  | 'PARTNER'
  | 'MARKETPLACE'
  | 'SERVICE';

export type TwinDomain =
  | 'ENTERPRISE'
  | 'MARKET'
  | 'SUPPLY_NETWORK'
  | 'PARTNER_ECOSYSTEM'
  | 'TECHNOLOGY_ECOSYSTEM'
  | 'SERVICE_NETWORK';

export type TwinDataLabel = 'LIVE' | 'ESTIMATED' | 'FORECAST' | 'SIMULATED';

export interface GlobalFabricEntity {
  entityId: string;
  entityName: string;
  entityType: FabricEntityType;
  organizationId: string;
  organizationName: string;
  discoveryStatus: 'ACTIVE_DISCOVERABLE' | 'RESTRICTED' | 'QUARANTINED';
  permissionScopes: string[];
  protocolVersion: string;
  endpoints: {
    grpcUri?: string;
    restUri?: string;
    eventTopic?: string;
  };
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  lastPingTimestamp: string;
  cryptographicSignature: string;
}

export interface DurableMission {
  missionId: string;
  ownerId: string;
  ownerEmail: string;
  organizationId: string;
  organizationName: string;
  title: string;
  objective: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  budgetMinor: number;
  spendMinor: number;
  deadline: string;
  dependencies: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 - 100
  autonomyLevel: AutonomyLevel;
  assignedAgents: {
    agentId: string;
    agentName: string;
    role: AgentSpecialistRole;
    verified: boolean;
  }[];
  workflowsTriggered: string[];
  state: MissionState;
  progressPct: number;
  currentLoopPhase: V15LoopPhase;
  outcomes: {
    metric: string;
    targetValue: string;
    achievedValue?: string;
    verifiedProofSha256?: string;
  }[];
  approvals: {
    requiredRole: string;
    approverEmail?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    signedAt?: string;
  }[];
  auditHistory: {
    timestamp: string;
    fromState: MissionState;
    toState: MissionState;
    triggeredBy: string;
    reason: string;
    epistemicType: V15EpistemicClassification;
  }[];
  faultToleranceMetadata: {
    survivesWorkerRestart: boolean;
    checkpointRevision: number;
    lastStateSaveTimestamp: string;
  };
}

export interface AutonomousCoordinationStep {
  stepId: string;
  title: string;
  actionType: 'DECOMPOSE' | 'CAPABILITY_MATCH' | 'RESOURCE_CHECK' | 'SIMULATION' | 'RISK_ASSESS' | 'AUTHORIZE' | 'DISPATCH' | 'MEASURE';
  epistemicClass: V15EpistemicClassification;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'FAILED';
  assignedEntityId: string;
  assignedEntityName: string;
  estimatedCostMinor: number;
  actualCostMinor: number;
  confidenceScore: number;
  evidenceSummary: string;
  deviationDetected: boolean;
  remediationAction?: string;
}

export interface AgentNegotiationSession {
  sessionId: string;
  missionId: string;
  initiatingAgentId: string;
  initiatingAgentName: string;
  targetAgentId: string;
  targetAgentName: string;
  taskScope: string;
  proposedDeadline: string;
  agreedDeadline?: string;
  requestedComputeUnits: number;
  offeredPriceMinor: number;
  agreedPriceMinor?: number;
  status: 'PROPOSED' | 'COUNTER_OFFERED' | 'AGREED' | 'REJECTED_POLICY' | 'EXECUTED';
  policyValidationPassed: boolean;
  governanceConstraintChecked: string;
  timestamp: string;
}

export interface AgentVerificationGateRecord {
  verificationId: string;
  taskId: string;
  primaryAgentId: string;
  primaryAgentName: string;
  primaryAgentOutput: string;
  independentVerifierAgentId: string;
  independentVerifierAgentName: string;
  verificationVerdict: 'PASS_CONFIRMED' | 'FLAGGED_RISK' | 'REJECTED_ANOMALY';
  riskScore: number;
  humanApprovalRequired: boolean;
  humanApprovalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  executionAllowed: boolean;
  timestamp: string;
  targetAction?: string;
  status?: 'VERIFIED_SAFE' | 'AWAITING_VERIFICATION' | 'BLOCKED_RISK';
  verifierAgentName?: string;
  auditFindings?: string;
  cryptographicSignature?: string;
}

export interface CollectiveIntelligenceRecord {
  synthesisId: string;
  topic: string;
  epistemicType: V15EpistemicClassification;
  sourcesEvaluated: {
    sourceType: 'INTERNAL_KNOWLEDGE' | 'EXTERNAL_API' | 'ANALYTICS_MODEL' | 'AGENT_SWARM' | 'HISTORICAL_OUTCOME' | 'USER_TELEMETRY';
    sourceName: string;
    reliabilityScore: number;
    weightPct: number;
  }[];
  consensusConfidencePct: number;
  disagreementIdentified: boolean;
  disagreementSummary?: string;
  humanReviewRequested: boolean;
  synthesizedConclusion: string;
  traceableProvenanceChain: string[];
  timestamp: string;
  confidenceScore?: number;
  synthesizedConsensus?: string;
  contributingEntities?: string[] | number;
  epistemicDisagreementsNoted?: string[] | string;
  uncertaintyInterval?: string;
}

export interface GlobalKnowledgeGraphNodeV15 {
  id: string;
  label: string;
  category: 'ORGANIZATION' | 'ROLE' | 'PRODUCT' | 'SERVICE' | 'AGENT' | 'CAPABILITY' | 'WORKFLOW' | 'MARKET' | 'TECHNOLOGY' | 'RISK' | 'DEPENDENCY' | 'OUTCOME';
  confidence: number;
  accessControlTag: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED_SOVEREIGN';
  provenance: string;
  properties: Record<string, string | number | boolean>;
  updatedAt: string;
  nodeId?: string;
  tenantAccessTag?: string;
  confidenceScore?: number;
  provenanceOrigin?: string;
}

export interface GlobalKnowledgeGraphEdgeV15 {
  sourceId: string;
  targetId: string;
  relationship: string;
  confidence: number;
  provenance: string;
  timestamp: string;
  edgeId?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  evidenceProofSha256?: string;
}

export interface OrganizationalMemoryRecordV15 {
  memoryId: string;
  organizationId: string;
  category: 'DECISION' | 'POLICY' | 'LESSON' | 'STRATEGY' | 'FAILURE' | 'WORKFLOW' | 'ARCHITECTURAL_DECISION';
  title: string;
  content: string;
  context: string;
  immutableHashSha256: string;
  retentionUntil: string;
  confidentialityLevel: 'INTERNAL' | 'BOARD_ONLY' | 'SOVEREIGN_RESTRICTED';
  wasVerifiedByHuman: boolean;
  createdAt: string;
  classification?: string;
  decisionContext?: string;
  whatHappened?: string;
  lessonsLearned?: string;
  tamperProofHash?: string;
}

export interface GlobalDigitalTwin3Entity {
  twinId: string;
  domain: TwinDomain;
  targetName: string;
  dataLabel: TwinDataLabel;
  healthIndexPct: number;
  simulationFidelityPct: number;
  parameters: {
    key: string;
    currentValue: string | number;
    projectedValue: string | number;
    unit: string;
  }[];
  activeDisruptionsIdentified: string[];
  lastSynchronizedAt: string;
  twinName?: string;
  healthScore?: number;
  stateMetrics?: Record<string, any>;
}

export interface GlobalScenarioEngine2Simulation {
  scenarioId: string;
  scenarioName: string;
  shockFactor: 'DEMAND_SURGE' | 'SUPPLY_CHAIN_COLLAPSE' | 'COMPUTE_PRICE_HIKE' | 'AI_AGENT_MALFUNCTION' | 'REGULATORY_RESTRICTION' | 'MARKET_ENTRY_RIVAL';
  severityMagnitude: 'MILD' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
  simulatedImpacts: {
    dimension: string;
    projectedChangePct: number;
    mitigationStrategy: string;
  }[];
  confidenceIntervalPct: number;
  isGuaranteedOutcome: false; // strictly false per V15 directive
  disclaimerNote: string;
  recommendedPreemptiveAction: string;
}

export interface AIComputeEconomyMetrics {
  inferenceRequests24h: number;
  totalTokensProcessed: number;
  avgInferenceLatencyMs: number;
  p99LatencyMs: number;
  infrastructureCostMinor: number;
  customerAttributedSpendMinor: number;
  platformNetMarginMinor: number;
  platformGrossMarginPct: number;
  lowRiskAutonomousSavingsMinor: number;
  pendingHighImpactOptimizationsCount: number;
  grossMarginPct?: number;
  totalTokensConsumed24h?: number;
  blendedCostPer1kTokensMinor?: number;
  aiSpend24hMinor?: number;
}

export interface CapitalAllocationOpportunity {
  opportunityId: string;
  title: string;
  domain: 'AI_AGENT_DEPLOYMENT' | 'WORKFLOW_AUTOMATION' | 'MARKET_EXPANSION' | 'TALENT_ACQUISITION' | 'INFRASTRUCTURE_SCALING';
  expectedImpactMinor: number;
  estimatedCostMinor: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScorePct: number;
  alternativeOptions: string[];
  aiRecommendation: string;
  humanAuthorizationStatus: 'PENDING_EXECUTIVE_APPROVAL' | 'APPROVED' | 'DECLINED';
}

export interface GlobalOpportunityMatchRecord {
  matchId: string;
  problemStatement: string;
  marketNeed: string;
  capabilityGap: string;
  matchedDeveloperOrAgent: string;
  solutionProposed: string;
  prospectiveCustomerOrg: string;
  estimatedEconomicValueMinor: number;
  status: 'IDENTIFIED' | 'INCUBATING' | 'COMMERCIALLY_DEPLOYED';
}

export interface AIDepartmentConfig {
  deptId: string;
  departmentName: 'FINANCE' | 'OPERATIONS' | 'CUSTOMER_SUPPORT' | 'AI_RESEARCH' | 'SALES_INTELLIGENCE' | 'ENGINEERING' | 'SUPPLY_CHAIN';
  autonomyLevel: AutonomyLevel;
  monthlyBudgetCapMinor: number;
  currentSpendMinor: number;
  leadSupervisorAgentId: string;
  leadSupervisorAgentName: string;
  subordinateAgentsCount: number;
  escalationRole: string;
  kpis: {
    kpiName: string;
    currentValue: string;
    targetValue: string;
    status: 'ON_TRACK' | 'AT_RISK' | 'EXCEEDED';
  }[];
}

export interface DigitalWorkforce3Overview {
  humanEmployeesCount: number;
  governedAIAgentsCount: number;
  hybridWorkflowsCount: number;
  workforceUtilizationPct: number;
  costEfficiencyGainPct: number;
  avgTaskCompletionHours: number;
  qualityAssuranceScorePct: number;
  sustainableValueIndex: number; // 0 - 100
}

export interface GovernedDecisionRecordV15 {
  decisionId: string;
  decisionTitle: string;
  organizationId: string;
  dataEvidenceInputs: string[];
  causalFactorsIdentified: {
    factor: string;
    classification: 'CORRELATION' | 'ASSOCIATION' | 'LIKELY_CAUSAL' | 'CONFIRMED_CAUSAL';
    evidenceStrength: number;
  }[];
  simulationOutcomesExamined: string[];
  optionsConsidered: {
    optionName: string;
    riskScore: number;
    projectedReturnMinor: number;
  }[];
  selectedOption: string;
  aiRecommendation: string;
  authorizedBy: string;
  status: 'PENDING_HUMAN_SIGN' | 'AUTHORIZED' | 'EXECUTING' | 'EXECUTED_MONITORED';
  postDecisionEvaluatedSuccess?: boolean;
  lessonsLearned?: string;
  timestamp: string;
}

export interface RootCauseInvestigationV15 {
  incidentId: string;
  eventDescription: string;
  symptomObserved: string;
  dependencyAnalysisSummary: string;
  possibleCausesRanked: {
    cause: string;
    probabilityPct: number;
    evidenceProof: string;
  }[];
  confirmedRootCause: string;
  remediationActionTaken: string;
  automatedSelfHealingApplied: boolean;
  verificationOutcome: 'RESOLVED_VERIFIED' | 'MONITORING_RECOVERY' | 'ESCALATED_SRE';
  timestamp: string;
}

export interface DefensiveSecurityStatusV15 {
  systemDefenseShieldActive: boolean;
  promptInjectionAttacksBlocked24h: number;
  indirectInjectionProbesNeutralized: number;
  toolPoisoningAttemptsCaught: number;
  unauthorizedCredentialAccessesBlocked: number;
  quarantinedAgentsCount: number;
  agentSandboxEnforcement: {
    networkIsolated: boolean;
    filesystemRestricted: boolean;
    secretsMasked: boolean;
    maxExecutionTimeSeconds: number;
  };
  zeroTrustIsolationIntegrityPct: number;
  lastAdversarialPenTestTimestamp: string;
}

export interface GlobalPolicyRuleV15 {
  policyId: string;
  name: string;
  scope: 'ALL_TENANTS' | 'CROSS_ORG' | 'A2A_COMMERCE' | 'AI_COMPUTE' | 'MISSION_ORCHESTRATION';
  ruleDescription: string;
  enforcementMode: 'BLOCKING_STRICT' | 'LOG_AND_ALERT' | 'SIMULATION_ONLY';
  version: string;
  affectedEntitiesCount: number;
  active: boolean;
  lastAuditedAt: string;
}

export interface PolicySimulationImpact {
  policyId: string;
  simulatedScenario: string;
  affectedTenantsCount: number;
  affectedWorkflowsCount: number;
  blockedActionsProjectedCount: number;
  estimatedCostImpactMinor: number;
  systemRiskReductionPct: number;
  recommendedAction: 'PROCEED_WITH_ACTIVATION' | 'RESTRICT_SCOPE' | 'REJECT_EXCESSIVE_FRICTION';
}

export interface SystemHealthScoreV15 {
  compositeScore: number; // 0 - 100 e.g. 98.6
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  dimensions: {
    name: string;
    score: number;
    status: 'OPTIMAL' | 'NORMAL' | 'WARNING';
    metricValue: string;
  }[];
  calculatedAt: string;
}

export interface V15ProductionCertificationReport {
  reportTitle: string;
  version: string;
  certifiedAt: string;
  overallVerdict: 'PASS - CERTIFIED GLOBAL AUTONOMOUS INTELLIGENCE INFRASTRUCTURE';
  forwardExtensionPointsReady: {
    version: 'V16+';
    domain: string;
    readinessStatus: 'READY_ARCHITECTURAL_STUB' | 'ACTIVE_SPECIFICATION';
    notes: string;
  }[];
  coreLoopAudited: {
    phase: V15LoopPhase;
    status: 'ACTIVE_VERIFIED' | 'GOVERNED';
    implementationProof: string;
  }[];
  pillarsAudited: {
    pillar: string;
    status: 'PASS' | 'PARTIAL' | 'FAIL' | 'REQUIRES CONFIGURATION';
    score: string;
    evidence: string;
  }[];
  infrastructureSummary: {
    registeredFabricEntities: number;
    durableMissionsActive: number;
    governedAgentNegotiationsCompleted: number;
    independentVerificationsPerformed: number;
    aiDepartmentsConfigured: number;
    causalDecisionsLogged: number;
    defensiveAttacksNeutralized: number;
    zeroCrossTenantLeakageVerified: boolean;
    selfHealingActionsExecuted: number;
    compositeSystemHealthScore: number;
  };
}

// ==========================================
// V16 GLOBAL AUTONOMOUS INDUSTRY & SCIENTIFIC INTELLIGENCE TYPES
// ==========================================

export type IndustryDomainId =
  | 'MANUFACTURING'
  | 'AGRICULTURE'
  | 'LOGISTICS'
  | 'ENERGY'
  | 'TELECOMMUNICATIONS'
  | 'RETAIL_COMMERCE'
  | 'FINANCE'
  | 'EDUCATION'
  | 'HEALTHCARE'
  | 'CONSTRUCTION'
  | 'TECHNOLOGY'
  | 'SCIENTIFIC_RESEARCH';

export type DomainAutonomyMode =
  | 'ADVISORY_RECOMMEND_ONLY'
  | 'VERIFIED_HUMAN_IN_THE_LOOP'
  | 'SANDBOX_SIMULATION_ONLY'
  | 'GOVERNED_EXECUTION_AUTHORIZED';

export interface DomainEntityDefinition {
  entityId: string;
  domainId: IndustryDomainId;
  name: string;
  type: string;
  status: 'ACTIVE' | 'CALIBRATING' | 'OFFLINE' | 'SIMULATED';
  dataOrigin: 'LIVE_TELEMETRY' | 'ANALYTICAL_MODEL' | 'SIMULATION_SYNTHETIC';
  verifiedIntegrations: string[];
  operationalConstraints: string[];
  metrics: Record<string, number | string>;
  lastHeartbeat: string;
}

export interface DomainWorkflowDefinition {
  workflowId: string;
  domainId: IndustryDomainId;
  title: string;
  description: string;
  requiredRoles: string[];
  governanceLevel: DomainAutonomyMode;
  executionSteps: {
    stepIndex: number;
    name: string;
    actionType: 'READ_ANALYTICS' | 'OPTIMIZE' | 'SIMULATE' | 'PROPOSE_PLAN' | 'EXECUTE_INTEGRATION';
    requiresHumanSignature: boolean;
    verificationGateId?: string;
  }[];
  regulatoryComplianceTags: string[];
  activeRunsCount: number;
}

export interface IndustryModulePackage {
  moduleId: string;
  domainId: IndustryDomainId;
  name: string;
  version: string;
  ownerOrganization: string;
  summary: string;
  capabilities: string[];
  certifiedIntegrations: string[];
  securityProfile: 'CRITICAL_INFRASTRUCTURE' | 'HIGH_GOVERNANCE' | 'STANDARD_ENTERPRISE';
  regulatoryStandard: string[];
  pricingModel: {
    licenseTier: 'COMMUNITY' | 'PRO_ENTERPRISE' | 'FEDERATED_SOVEREIGN';
    monthlyBaseUsdMinor: number;
    usagePerUnitMinor: number;
    unitDescription: string;
  };
  supportedRegions: string[];
  installed: boolean;
  installedAt?: string;
}

// Scientific Intelligence Engine Types
export type ScientificResearchPhase =
  | 'QUESTION_FORMULATION'
  | 'LITERATURE_SYNTHESIS'
  | 'DATA_ACQUISITION'
  | 'HYPOTHESIS_GENERATION'
  | 'EXPERIMENT_DESIGN'
  | 'SIMULATION_EXECUTION'
  | 'STATISTICAL_ANALYSIS'
  | 'INDEPENDENT_VALIDATION'
  | 'PEER_VERIFICATION'
  | 'REPRODUCIBILITY_CERTIFICATION';

export interface ScientificHypothesisRecord {
  hypothesisId: string;
  projectId: string;
  title: string;
  claimStatement: string;
  epistemicType: 'FORMAL_HYPOTHESIS' | 'INFERENCE' | 'EMPIRICAL_OBSERVATION';
  confidenceScore: number; // 0.00 - 1.00
  generatedByAgent: string;
  literatureCitationsCount: number;
  falsificationCriteria: string[];
  validationStatus: 'UNTESTED' | 'TESTING_IN_PROGRESS' | 'SUPPORTED_BY_SIMULATION' | 'FALSIFIED' | 'REPRODUCED';
  createdAt: string;
}

export interface ScientificExperimentRecord {
  experimentId: string;
  projectId: string;
  hypothesisId: string;
  name: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'VALIDATION_FAILED' | 'REPRODUCED';
  methodology: 'AGENT_BASED_SIMULATION' | 'MONTE_CARLO' | 'PDE_SOLVER' | 'CAUSAL_INFERENCE' | 'SURROGATE_NN';
  inputsDatasetVersion: string;
  parameters: Record<string, any>;
  codeRepositoryVersion: string;
  executionEnvironmentHash: string; // SHA-256 container/env seal
  expectedOutcome: string;
  actualOutcome?: string;
  statisticalSignificancePValue?: number;
  confidenceInterval?: string;
  provenanceSignature: string;
  reproducibilityScorePct: number;
  computeSecondsConsumed: number;
  startedAt: string;
  completedAt?: string;
}

export interface ScientificEvidenceNode {
  nodeId: string;
  type: 'CLAIM' | 'SOURCE_PAPER' | 'DATASET' | 'METHOD' | 'RESULT' | 'REPRODUCIBILITY_PROOF';
  title: string;
  doiOrUri?: string;
  authorsOrAgents: string[];
  confidence: number;
  provenanceHash: string;
  verificationLevel: 'UNVERIFIED' | 'PEER_REVIEWED' | 'REPRODUCED_IN_SILICO' | 'FORMALLY_PROVEN';
}

export interface ScientificEvidenceEdge {
  sourceId: string;
  targetId: string;
  relationship: 'SUPPORTS' | 'FALSIFIES' | 'DERIVED_FROM' | 'CITES' | 'CORROBORATES' | 'DISAGREES_WITH';
  strength: number; // 0.00 - 1.00
  notes: string;
}

// Multi-Model Intelligence & Routing 2.0
export interface MultiModelEngineSpec {
  modelId: string;
  provider: 'GOOGLE_DEEPMIND_GEMINI' | 'ANTHROPIC_CLAUDE' | 'OPENAI_GPT' | 'OPEN_SOURCE_LLAMA' | 'SPECIALIZED_SCIENTIFIC_SURROGATE';
  modelFamily: string;
  contextWindowTokens: number;
  costPer1kInputTokensMinor: number;
  costPer1kOutputTokensMinor: number;
  latencyP95Ms: number;
  safetyTier: 'TIER_1_DEFENSE_HARDENED' | 'TIER_2_GENERAL' | 'TIER_3_SANDBOX_ISOLATED';
  specializationStrengths: string[];
  status: 'ACTIVE' | 'DEGRADED' | 'FAILOVER_STANDBY';
  failoverPriority: number;
}

export interface ModelRoutingDecisionLog {
  routingId: string;
  requestCategory: 'REASONING' | 'LITERATURE_SEARCH' | 'CODE_SYNTHESIS' | 'MATHEMATICAL_MODEL' | 'COMPLIANCE_AUDIT';
  policyApplied: string;
  selectedModelId: string;
  fallbackModelId?: string;
  privacyClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'HIPAA_FERPA_ISOLATED';
  costOptimizationFactor: number;
  latencyAchievedMs: number;
  verificationStatus: 'VERIFIED_SAFE' | 'SANDBOX_CHECKED';
  timestamp: string;
}

// Scientific Compute & Orchestration
export interface ScientificComputeJob {
  jobId: string;
  projectId: string;
  jobName: string;
  workloadType: 'SIMULATION_SWARM' | 'BAYESIAN_OPTIMIZATION' | 'MOLECULAR_SCREENING' | 'LOGISTICS_NETWORK_SOLVER';
  nodesRequested: number;
  computeUnitCostMinor: number;
  priority: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_DEADLINE';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PREEMPTED';
  progressPct: number;
  allocatedHardware: string;
  tenantId: string;
  startedAt: string;
}

// Global Industry Cloud Package
export interface IndustryCloudPackage {
  packageId: string;
  name: string;
  industryCode: IndustryDomainId;
  coreTierIncluded: boolean;
  activeTenantsCount: number;
  baseMonthlyUsd: number;
  activeWorkflowsRunning: number;
  complianceCertifications: string[];
  keyCapabilities: string[];
}

// V16 Master Production Acceptance Gate Report
export interface V16AcceptanceGateReport {
  reportId: string;
  platformVersion: 'V16.0-ENTERPRISE';
  generatedAt: string;
  verdict: 'PASS - CERTIFIED GLOBAL AUTONOMOUS INDUSTRY & SCIENTIFIC INTELLIGENCE';
  coreChecklist: {
    checkId: string;
    title: string;
    status: 'VERIFIED_PASS' | 'RESTRICTED_BY_POLICY';
    evidence: string;
  }[];
  domainReadinessScorecard: {
    domainId: IndustryDomainId;
    domainName: string;
    readinessPct: number;
    autonomousSafetyEnforced: boolean;
    physicalControlSafeguard: 'STRICT_AIRGAP_OR_AUTHORIZED_ONLY' | 'GOVERNED_API_ONLY';
    evidenceSummary: string;
  }[];
  scientificIntegrityScorecard: {
    researchReproducibilityScorePct: number;
    evidenceProvenanceAuditedCount: number;
    epistemicCategorizationIntegrity: boolean;
    falsificationRigourEnforced: boolean;
  };
  securityAndMultiTenancyScorecard: {
    zeroCrossTenantLeakageVerified: boolean;
    sandboxedExecutionContained: boolean;
    adversarialInjectionProtectionPct: number;
    criticalInfrastructureSafetyLock: boolean;
  };
  economicIntegrityScorecard: {
    transparentComputeMetering: boolean;
    noFabricatedMetricsConfirmed: boolean;
    verifiableUnitEconomicsActive: boolean;
  };
}

// ============================================================================
// CATALYX V17: GLOBAL AUTONOMOUS INTELLIGENCE NETWORK TYPES
// ============================================================================

// 1. 20 Architectural Fabrics
export type FabricLayerId =
  | 'IDENTITY_FABRIC'
  | 'ORGANIZATION_FABRIC'
  | 'INTELLIGENCE_FABRIC'
  | 'KNOWLEDGE_FABRIC'
  | 'DATA_FABRIC'
  | 'AGENT_FABRIC'
  | 'MISSION_FABRIC'
  | 'WORKFLOW_FABRIC'
  | 'SIMULATION_FABRIC'
  | 'DIGITAL_TWIN_FABRIC'
  | 'EXECUTION_FABRIC'
  | 'TRUST_FABRIC'
  | 'POLICY_FABRIC'
  | 'COMMERCE_FABRIC'
  | 'RESOURCE_FABRIC'
  | 'EVENT_FABRIC'
  | 'OBSERVABILITY_FABRIC'
  | 'SECURITY_FABRIC'
  | 'DEVELOPER_FABRIC'
  | 'GOVERNANCE_FABRIC';

export interface FabricHealthStatus {
  layerId: FabricLayerId;
  name: string;
  category: 'CORE_EXECUTION' | 'INTELLIGENCE_DATA' | 'SECURITY_GOVERNANCE' | 'COMMERCE_ECOSYSTEM';
  status: 'OPTIMAL' | 'DEGRADED' | 'ISOLATED' | 'FAILOVER_ACTIVE';
  uptimePct: number;
  activeTransactionsPerSec: number;
  securityPolicyEnforced: boolean;
  auditProvenanceVerified: boolean;
  description: string;
}

// 2. Global Intelligence Fabric 3.0 & Epistemic Quality Engine
export type IntelligenceEpistemicCategory =
  | 'VERIFIED_FACT'
  | 'SOURCE_REPORTED_INFORMATION'
  | 'INFERENCE'
  | 'ESTIMATE'
  | 'PREDICTION'
  | 'SIMULATION'
  | 'HYPOTHESIS'
  | 'USER_PROVIDED_INFORMATION'
  | 'UNVERIFIED_INFORMATION';

export type IntelligenceDomainCategory =
  | 'ORGANIZATIONAL'
  | 'SCIENTIFIC'
  | 'INDUSTRIAL'
  | 'FINANCIAL'
  | 'MARKET'
  | 'INFRASTRUCTURE'
  | 'OPERATIONAL'
  | 'ENGINEERING'
  | 'ENVIRONMENTAL';

export interface IntelligenceQualityAssessment {
  intelligenceId: string;
  domain: IntelligenceDomainCategory;
  epistemicClass: IntelligenceEpistemicCategory;
  title: string;
  contentSummary: string;
  confidenceScore: number; // 0.00 - 1.00
  freshnessStatus: 'CURRENT' | 'STALE' | 'EXPIRED' | 'UNKNOWN';
  sourceReliability: 'PRIMARY_SENSORY_OR_LAB' | 'PEER_REVIEWED' | 'FEDERATED_PARTNER' | 'AI_GENERATED_MODEL' | 'UNAUTHENTICATED';
  supportingEvidenceCount: number;
  contradictoryEvidenceCount: number;
  originTenantId: string;
  visibilityScope: 'PRIVATE' | 'ORG_SHARED' | 'PARTNER_SHARED' | 'PUBLIC' | 'AGGREGATED_ANONYMIZED';
  provenanceHash: string; // SHA-256 cryptographic seal
  capturedAt: string;
  lastValidatedAt: string;
}

// 3. Global Knowledge Graph 3.0 & Cross-Domain Federation
export type GraphEntityTypeV17 =
  | 'ORGANIZATION'
  | 'PERSON'
  | 'TEAM'
  | 'AGENT'
  | 'PRODUCT'
  | 'SERVICE'
  | 'COMPANY'
  | 'FACILITY'
  | 'MACHINE'
  | 'INFRASTRUCTURE'
  | 'SCIENTIFIC_PAPER'
  | 'DATASET'
  | 'EXPERIMENT'
  | 'PROJECT'
  | 'MARKET'
  | 'SUPPLIER'
  | 'CUSTOMER'
  | 'ASSET'
  | 'RISK'
  | 'OPPORTUNITY'
  | 'EVENT'
  | 'WORKFLOW'
  | 'MISSION'
  | 'POLICY';

export interface GraphNodeV17 {
  id: string;
  entityType: GraphEntityTypeV17;
  label: string;
  tenantId: string;
  visibility: 'PRIVATE' | 'ORG_SHARED' | 'PARTNER_SHARED' | 'PUBLIC';
  properties: Record<string, any>;
  provenanceHash: string;
  createdAt: string;
}

export interface GraphRelationshipV17 {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  confidence: number;
  provenanceHash: string;
  tenantId: string;
  accessClassification: 'RESTRICTED' | 'CONFIDENTIAL' | 'SHARED';
}

export interface FederationReleaseTicket {
  ticketId: string;
  sourceTenantId: string;
  targetAudience: 'PARTNER_SHARED' | 'ANONYMIZED_NETWORK' | 'PUBLIC_COMMERCE';
  dataClassification: 'ANONYMIZED_TELEMETRY' | 'DERIVED_BENCHMARK' | 'AGGREGATE_STATISTICS';
  optInConfirmedBy: string;
  policyCheckPassed: boolean;
  privacyAnonymizationPassed: boolean;
  differentialPrivacyEpsilon: number;
  auditLogId: string;
  releasedAt: string;
}

// 4. Autonomous Agent Network 3.0 & Agent Interoperability Protocol (AIP)
export type AgentRiskTier = 'TIER_1_LOW_READONLY' | 'TIER_2_MODERATE_ASSISTED' | 'TIER_3_HIGH_RESTRICTED' | 'TIER_4_CRITICAL_AIRGAPPED';

export interface AgentNetworkNode {
  agentId: string;
  name: string;
  role: string;
  organizationId: string;
  ownerUserId: string;
  version: string;
  riskTier: AgentRiskTier;
  trustScore: number; // 0.0 - 100.0 (dynamic, contextual)
  hourlyCostBudgetMinor: number;
  financialSpendLimitMinor: number;
  currentCycleSpendMinor: number;
  activeStatus: 'ONLINE_ACTIVE' | 'SANDBOXED' | 'QUARANTINED' | 'OFFLINE';
  permittedTools: string[];
  restrictedPaths: string[];
  executionTimeLimitSeconds: number;
  memoryLimitMb: number;
  networkEgressAllowed: boolean;
  domainCompetencies: string[];
  successCount: number;
  failureCount: number;
  policyViolationsCount: number;
}

export interface AgentInteroperabilityMessage {
  messageId: string;
  timestamp: string;
  senderAgentId: string;
  recipientAgentId: string;
  intent: 'CAPABILITY_QUERY' | 'TASK_DELEGATION' | 'BUDGET_NEGOTIATION' | 'RESULT_EXCHANGE' | 'VERIFICATION_REQUEST' | 'SAFETY_ESCALATION';
  requestedCapability: string;
  authorizationToken: string;
  taskBudgetMinor: number;
  deadlineIso: string;
  payload: Record<string, any>;
  verificationHash: string;
  deliveryStatus: 'DELIVERED' | 'SANDBOX_BLOCKED' | 'POLICY_REJECTED';
}

export interface AgentNegotiationProposal {
  proposalId: string;
  proposingAgentId: string;
  counterpartyAgentId: string;
  taskScope: string;
  proposedBudgetMinor: number;
  proposedDeadlineHours: number;
  proposedSequenceIndex: number;
  governanceComplianceVerified: boolean;
  requiresHumanSignature: boolean;
  status: 'PENDING_EVALUATION' | 'ACCEPTED_BY_POLICY' | 'REJECTED_OVER_BUDGET' | 'RATIFIED';
}

// 5. Mission Intelligence 3.0 & Durable Recovery Engine
export type MissionStateV17 =
  | 'DRAFT'
  | 'PLANNED'
  | 'SIMULATING'
  | 'WAITING_APPROVAL'
  | 'AUTHORIZED'
  | 'EXECUTING'
  | 'PAUSED'
  | 'DEGRADED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface DurableMissionRecordV17 {
  missionId: string;
  ownerId: string;
  organizationId: string;
  title: string;
  objectiveStatement: string;
  scopeBoundaries: string[];
  constraints: string[];
  budgetAuthorizedMinor: number;
  budgetConsumedMinor: number;
  deadline: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  successCriteria: string[];
  assignedAgentIds: string[];
  assignedWorkflowIds: string[];
  status: MissionStateV17;
  healthScorePct: number; // 0 - 100
  evidenceHashes: string[];
  recoveryAttemptCount: number;
  maxPermittedRecoveries: number;
  auditTrailLength: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionRecoveryLog {
  recoveryId: string;
  missionId: string;
  failureClassification: 'TRANSIENT_NETWORK' | 'MODEL_DEGRADATION' | 'SAFETY_POLICY_TRIP' | 'BUDGET_EXCEEDED' | 'UNCAUGHT_EXCEPTION';
  actionTaken: 'SAFE_RETRY' | 'ISOLATE_AGENT' | 'FAILOVER_PROVIDER' | 'FREEZE_MISSION_FOR_HUMAN';
  evidencePreservedHash: string;
  safetyConditionsSatisfied: boolean;
  executedBy: string;
  timestamp: string;
}

// 6. Global Resource Intelligence & AI Economics 3.0
export interface GlobalResourcePool {
  poolId: string;
  organizationId: string;
  humanCapacityFte: number;
  aiAgentCapacitySlots: number;
  allocatedComputeGpuHours: number;
  usedComputeGpuHours: number;
  storageTerabytesAvailable: number;
  storageTerabytesUsed: number;
  capitalBudgetMonthlyMinor: number;
  capitalBudgetRemainingMinor: number;
  energyMegawattHoursAllocated?: number;
  efficiencyRatingPct: number;
  lastOptimizedAt: string;
}

export interface ComputeAiExpenseRecord {
  expenseId: string;
  organizationId: string;
  workloadType: 'INFERENCE' | 'AGENT_SWARM' | 'WORKFLOW_AUTOMATION' | 'SIMULATION_HPC' | 'EVALUATION_AUDIT';
  modelId: string;
  tokensConsumed: number;
  computeSeconds: number;
  costMinor: number;
  budgetImpactPct: number;
  withinQuota: boolean;
  timestamp: string;
}

// 7. Intelligence Routing Engine 3.0 & Model Governance
export interface ModelGovernanceProfile {
  modelId: string;
  version: string;
  provider: string;
  capabilities: string[];
  limitations: string[];
  domainSuitability: string[];
  evaluationScoreBenchmark: number; // e.g. 94.8%
  costPer1kInputTokensMinor: number;
  costPer1kOutputTokensMinor: number;
  latencyP95Ms: number;
  privacyComplianceTier: 'PUBLIC' | 'CONFIDENTIAL' | 'ISOLATED_RESIDENCY';
  safetyRating: 'HIGH_RESILIENCE' | 'STANDARD' | 'RESTRICTED';
  lifecycleStatus: 'EVALUATION' | 'APPROVED' | 'DEPLOYED' | 'ROLLBACK_CANDIDATE' | 'RETIRED';
}

export interface RoutingDecisionV17 {
  routingId: string;
  requestFingerprint: string;
  securityCheckPassed: boolean;
  dataClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED_AIRGAP';
  policyMatched: string;
  candidateModelsEvaluated: number;
  selectedModel: string;
  failoverStandbyModel: string;
  expectedCostMinor: number;
  expectedLatencyMs: number;
  verificationSha256: string;
  executedAt: string;
}

// 8. Industrial Digital Twin Network 4.0
export interface DigitalTwinNodeV17 {
  twinId: string;
  organizationId: string;
  domain: IndustryDomainId;
  name: string;
  category: 'PHYSICAL_FACILITY' | 'SUPPLY_CHAIN_LINK' | 'FLEET_ASSET' | 'ENERGY_GRID' | 'WAREHOUSE';
  stateMode: 'LIVE_DATA' | 'MATHEMATICAL_MODEL' | 'SYNTHETIC_SIMULATION';
  freshnessTimestamp: string;
  confidenceScore: number;
  telemetryIngressProtocol: string;
  airgapSafetyEnforced: boolean;
  realtimeSensors: {
    sensorKey: string;
    reading: number | string;
    unit: string;
    thresholdCeiling?: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  }[];
  activeAnomaliesCount: number;
  recommendedAction?: string;
  requiresHumanAuthorization: boolean;
}

// 9. Global Supply Network & Opportunity Network 3.0
export interface SupplyChainNodeV17 {
  nodeId: string;
  role: 'SUPPLIER' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER_TIER';
  name: string;
  geographicRegion: string;
  leadTimeDays: number;
  riskIndexPct: number; // 0 - 100
  alternativeSuppliersAvailable: number;
  disruptionScenarioTested: boolean;
  bottleneckDetected: boolean;
  capacityUtilizationPct: number;
}

export interface GlobalOpportunityListingV17 {
  opportunityId: string;
  domain: string;
  title: string;
  description: string;
  category: 'BUSINESS' | 'RESEARCH' | 'INDUSTRIAL' | 'PARTNERSHIP' | 'PROCUREMENT' | 'DEVELOPER';
  supportingEvidenceSummary: string;
  keyAssumptions: string[];
  estimatedUpsideStatement: string;
  estimatedCostMinor: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertaintyMarginPct: number;
  requiredCapabilities: string[];
  discoveredAt: string;
  status: 'DISCOVERED' | 'EVALUATING' | 'SIMULATING' | 'RATIFIED' | 'DISMISSED';
}

export interface ComplexProblemDecomposition {
  problemId: string;
  rawDescription: string;
  decomposedSubProblems: {
    subId: string;
    title: string;
    requiredExpertise: string[];
    assignedAgentId?: string;
    dependencySubIds: string[];
    simulatedSuccessLikelihoodPct: number;
  }[];
  candidateApproachesCount: number;
  highestRankedApproach: string;
  estimatedResourceCostMinor: number;
  requiresHumanAuthorization: boolean;
  status: 'DECOMPOSED' | 'SIMULATING' | 'READY_FOR_APPROVAL' | 'EXECUTING';
}

// 10. Solution Marketplace 3.0 & Security Scanner
export interface MarketplaceArtifactV17 {
  artifactId: string;
  title: string;
  category: 'APPLICATION' | 'AI_AGENT' | 'WORKFLOW' | 'CONNECTOR' | 'DATASET' | 'INDUSTRY_MODULE' | 'SCIENTIFIC_TOOL';
  creatorName: string;
  creatorTenantId: string;
  version: string;
  securityStatus: 'CLEARED_SECURE' | 'SCANNING' | 'VULNERABILITY_FLAGGED' | 'QUARANTINED';
  packageSha256: string;
  dependencyVulnerabilitiesDetected: number;
  malwareDetected: boolean;
  requestedPermissions: string[];
  pricingModel: 'FREE_OPEN' | 'USAGE_METERED' | 'SUBSCRIPTION' | 'ENTERPRISE_CUSTOM';
  priceMinor: number;
  provenanceLineage: string;
  installedTenantsCount: number;
  trustScorePct: number;
}

// 11. Developer Cloud 4.0 & Event Fabric 3.0
export interface DeveloperProjectV17 {
  projectId: string;
  organizationId: string;
  name: string;
  apiKeysCount: number;
  serviceIdentitiesCount: number;
  webhookEndpointsCount: number;
  activeEnvironment: 'DEVELOPMENT' | 'SANDBOX' | 'PRODUCTION';
  monthlyApiCalls: number;
  monthlyApiQuota: number;
  rateLimitPerSecond: number;
  status: 'ACTIVE' | 'THROTTLED' | 'SUSPENDED';
}

export interface GlobalEventRecordV17 {
  eventId: string;
  timestamp: string;
  producerType: 'USER' | 'ORGANIZATION' | 'AGENT' | 'WORKFLOW' | 'MISSION' | 'SECURITY' | 'FINANCE' | 'SCIENTIFIC';
  tenantId: string;
  eventType: string;
  payloadSummary: string;
  schemaVersion: string;
  correlationId: string;
  causationId: string;
  idempotencyToken: string;
  replayed: boolean;
  replaySafe: boolean; // false for charges, deletions, destructive side-effects
}

// 12. Zero-Trust Identity Fabric & AI Security 5.0
export interface ZeroTrustAssessmentV17 {
  assessmentId: string;
  subjectWho: string;
  actionWhat: string;
  rationaleWhy: string;
  sourceWhere: string;
  authorityProof: string;
  targetResource: string;
  governingPolicy: string;
  riskEvaluation: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict: 'PERMITTED' | 'BLOCKED_POLICY' | 'BLOCKED_RISK' | 'STEP_UP_MFA_REQUIRED' | 'HUMAN_APPROVAL_QUEUED';
  timestamp: string;
}

export interface ExecutionSafetyGateRecordV17 {
  gateId: string;
  actionTitle: string;
  targetSubsystem: 'FINANCE' | 'INDUSTRIAL_PHYSICAL' | 'HEALTHCARE' | 'SECURITY_IAM' | 'DATABASE_DELETION' | 'INFRASTRUCTURE';
  riskClassification: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  intentVerified: boolean;
  identityVerified: boolean;
  authorityVerified: boolean;
  policySatisfied: boolean;
  costAuthorized: boolean;
  safetyCheckPassed: boolean;
  humanSignatureCollected: boolean;
  auditorId?: string;
  executionStatus: 'QUEUED_FOR_REVIEW' | 'APPROVED_READY' | 'EXECUTED_VERIFIED' | 'REJECTED_SAFETY_VIOLATION';
  timestamp: string;
}

// 13. Financial Intelligence & Commerce Fabric
export interface PaymentGatewayAdapterStatus {
  adapterId: string;
  providerName: 'PESAPAL' | 'STRIPE' | 'GENERIC_ISO20022' | 'BANK_ACH';
  status: 'OPERATIONAL' | 'DEGRADED' | 'STANDBY';
  serverSideVerificationMandatory: boolean;
  idempotencyVerified: boolean;
  supportedCurrencies: string[];
  reconciliationAuditMatched: boolean;
}

export interface ReconciliationDiscrepancyCase {
  caseId: string;
  transactionId: string;
  providerReportedAmountMinor: number;
  ledgerReportedAmountMinor: number;
  varianceMinor: number;
  currency: string;
  discrepancyType: 'GATEWAY_TIMEOUT' | 'FEE_MISMATCH' | 'REFUND_IN_FLIGHT' | 'ROUNDING_DIFFERENTIAL';
  investigationStatus: 'DETECTED' | 'UNDER_REVIEW' | 'RECONCILED' | 'MANUAL_ESCALATION';
  detectedAt: string;
}

// 14. Global Simulation Network & Scenario Competition
export interface ScenarioPlanOption {
  planId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  planName: string;
  strategicObjective: string;
  inputsAndAssumptions: string[];
  estimatedCostMinor: number;
  riskScorePct: number;
  expectedOutcomeStatement: string;
  uncertaintyRangePct: number;
  resourceRequirements: string[];
  confidenceRank: number;
}

export interface ScenarioCompetitionSimulation {
  simulationId: string;
  title: string;
  competingPlans: ScenarioPlanOption[];
  recommendedPlanId: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  recommendationRationale: string;
  monteCarloIterations: number;
  simulatedAt: string;
}

// 15. Unified Command Center View Surface
export type CommandCenterSurface =
  | 'GLOBAL_ADMIN'
  | 'CUSTOMER_COMMAND'
  | 'DEVELOPER_COMMAND'
  | 'RESEARCH_COMMAND'
  | 'INDUSTRY_COMMAND'
  | 'GOVERNANCE_SAFETY';

// 16. V17 Master Production Acceptance Gate Report
export interface V17AcceptanceGateReport {
  reportId: string;
  platformVersion: 'V17.0-ENTERPRISE-GLOBAL-NETWORK';
  generatedAt: string;
  verdict: 'PASS - CERTIFIED GLOBAL AUTONOMOUS INTELLIGENCE NETWORK';
  architectureAudit: {
    fabricsActiveCount: number; // 20/20
    v1ToV16RegressionsCount: number; // 0
    modularityDecoupled: boolean;
    zeroDirectHardwareControlConfirmed: boolean;
  };
  securityAudit: {
    zeroTrustAssessmentsPassed: number;
    aiInjectionResistancePct: number;
    sandboxedAgentsVerifiedPct: number;
    emergencyControlPlaneVerified: boolean;
  };
  epistemicQualityAudit: {
    epistemicCategorizationActive: boolean;
    unverifiedFactsTreatedAsFactsCount: number; // 0
    cryptographicProvenanceVerifiedPct: number;
  };
  scientificIntegrityAudit: {
    tenPhaseResearchPipelineEnforced: boolean;
    falsificationCriteriaMandated: boolean;
    experimentReproducibilityVerifiedPct: number;
  };
  industrialIntegrityAudit: {
    liveVsSimSeparationConfirmed: boolean;
    twinsAirgapSafetyLocksActive: boolean;
  };
  commerceIntegrityAudit: {
    serverSidePaymentVerificationEnforced: boolean;
    immutableLedgerAudited: boolean;
    discrepanciesAutoFlagged: boolean;
    fiatVsCreditSegregationConfirmed: boolean;
  };
  gateChecklist: {
    checkId: string;
    section: string;
    requirement: string;
    status: 'VERIFIED_PASS' | 'RESTRICTED_BY_POLICY';
    evidence: string;
  }[];
}

// ============================================================================
// CATALYX V18 GLOBAL INTELLIGENCE COORDINATION & AUTONOMOUS ECOSYSTEM OS TYPES
// ============================================================================

export type EcosystemHierarchyLevel =
  | 'INDIVIDUAL'
  | 'TEAM'
  | 'ORGANIZATION'
  | 'ENTERPRISE'
  | 'PARTNER_NETWORK'
  | 'INDUSTRY_ECOSYSTEM'
  | 'GLOBAL_INTELLIGENCE_NETWORK';

export interface EcosystemEntityNode {
  entityId: string;
  level: EcosystemHierarchyLevel;
  name: string;
  entityType: 
    | 'HUMAN'
    | 'ORGANIZATION'
    | 'AI_AGENT'
    | 'APPLICATION'
    | 'WORKFLOW'
    | 'SCIENTIFIC_RESEARCH'
    | 'INDUSTRIAL_ASSET'
    | 'MARKET'
    | 'RESOURCE'
    | 'DIGITAL_TWIN'
    | 'SERVICE_PROVIDER';
  parentId?: string;
  tenantId: string;
  trustScore: number;
  permissionBoundary: string[];
  status: 'ACTIVE' | 'ISOLATED' | 'QUARANTINED' | 'SUSPENDED';
  metadataSummary: string;
}

export interface EcosystemGraphEdge {
  edgeId: string;
  sourceId: string;
  targetId: string;
  relationshipType: 
    | 'DEPENDS_ON'
    | 'PROVIDES_SERVICE'
    | 'PARTNER_WITH'
    | 'GOVERNS'
    | 'COMMERCE_FLOW'
    | 'DATA_LINEAGE'
    | 'FEDERATED_TO';
  weight: number;
  permissionScope: string;
  verifiedProvenanceHash: string;
}

export interface EcosystemDigitalTwinLayer {
  twinId: string;
  name: string;
  targetDomain: 'MANUFACTURING' | 'AGRICULTURE' | 'LOGISTICS' | 'ENERGY' | 'TELECOM' | 'FINANCE' | 'RESEARCH';
  epistemicState: 'REALITY' | 'LIVE_DATA' | 'MODEL' | 'SIMULATION' | 'PREDICTION';
  liveTelemetryFreshnessSeconds: number;
  simulationConfidencePct: number;
  airgapSafetyEnforced: boolean;
  realityVariancePct: number;
  lastSynchronizedAt: string;
}

export interface GlobalSituation {
  situationId: string;
  title: string;
  category: 'OPERATIONAL' | 'SUPPLY_CHAIN' | 'SECURITY' | 'INFRASTRUCTURE' | 'FINANCIAL' | 'RESOURCE' | 'SCIENTIFIC';
  affectedEntityIds: string[];
  geographicLocation?: string;
  timestamp: string;
  evidenceItems: { evidenceId: string; source: string; confidencePct: number; hash: string }[];
  confidencePct: number;
  impactSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[];
  riskAssessment: string;
  possibleResponses: { responseId: string; action: string; requiredApproval: boolean; estimatedRisk: string }[];
  isPrediction: boolean;
}

export interface EventCorrelationInsight {
  correlationId: string;
  correlatedEventIds: string[];
  description: string;
  correlationStrengthPct: number;
  causationVerified: boolean;
  emergingPattern: 'RISK' | 'OPERATIONAL_PROBLEM' | 'OPPORTUNITY' | 'ANOMALY';
  detectedAt: string;
}

export interface EarlyWarningSignal {
  warningId: string;
  domain: 'OPERATIONAL' | 'SUPPLY_CHAIN' | 'SECURITY' | 'INFRASTRUCTURE' | 'FINANCIAL' | 'RESOURCE' | 'PROJECT_FAILURE';
  title: string;
  evidenceSummary: string;
  confidencePct: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  uncertaintyMarginPct: number;
  recommendedMitigation: string;
  triggeredAt: string;
}

export interface CascadeRiskScenario {
  scenarioId: string;
  rootFailureEvent: string;
  cascadeChain: {
    stage: number;
    impactDescription: string;
    affectedNode: string;
    propagationProbabilityPct: number;
    lagTimeHours: number;
  }[];
  overallImpactSeverity: 'HIGH' | 'CRITICAL';
  simulatedMitigationOptions: string[];
  certaintyWarning: string;
}

export interface SystemicRiskNode {
  nodeId: string;
  entityName: string;
  concentrationScorePct: number;
  dependentCount: number;
  isSinglePointOfFailure: boolean;
  criticalResourceTies: string[];
  riskCategory: 'SUPPLIER' | 'INFRASTRUCTURE' | 'AI_MODEL' | 'FINANCIAL_GATEWAY' | 'LOGISTICS_CHOKEPOINT';
}

export interface EcosystemOpportunity {
  opportunityId: string;
  title: string;
  driver: 'UNMET_DEMAND' | 'CAPABILITY_GAP' | 'RESOURCE_AVAILABILITY' | 'TECHNOLOGY_SHIFT' | 'RESEARCH_DEVELOPMENT' | 'MARKET_TREND';
  evidenceBase: string[];
  assumptions: string[];
  estimatedValueMinor: number;
  requiredResources: string[];
  identifiedRisks: string[];
  uncertaintyMarginPct: number;
  outcomesDisclaimer: string;
}

export interface EcosystemProblemListing {
  problemId: string;
  publisherOrgId: string;
  title: string;
  description: string;
  domain: string;
  constraints: string[];
  budgetAuthorizedMinor: number;
  requiredCapabilities: string[];
  deadline: string;
  securityClassification: 'PUBLIC' | 'FEDERATED' | 'RESTRICTED' | 'SECRET';
  eligibilityCriteria: string[];
  matchedSolutionsCount: number;
  status: 'OPEN' | 'ORCHESTRATING' | 'SOLVED' | 'CLOSED';
}

export interface SolutionOrchestrationPipeline {
  orchestrationId: string;
  problemId: string;
  currentStage: 
    | 'UNDERSTAND' 
    | 'DECOMPOSE' 
    | 'FIND_CAPABILITIES' 
    | 'FORM_SOLUTION_TEAM' 
    | 'SIMULATE' 
    | 'ESTIMATE_COST' 
    | 'REQUEST_APPROVAL' 
    | 'EXECUTE' 
    | 'VERIFY' 
    | 'MEASURE';
  decomposedSubtasks: { taskId: string; title: string; assignedCapability: string; status: string }[];
  formedTeamId?: string;
  estimatedCostMinor: number;
  simulatedSuccessRatePct: number;
  humanApprovalGranted: boolean;
  verificationEvidenceHash?: string;
  measuredOutcomeScorePct?: number;
}

export interface IntelligenceTeamMember {
  memberId: string;
  name: string;
  kind: 'AI_AGENT' | 'HUMAN_EXPERT' | 'APPLICATION' | 'DOMAIN_SERVICE';
  role: string;
  permissionBoundary: string[];
  verifiedCredentials?: string[];
}

export interface IntelligenceTeam {
  teamId: string;
  name: string;
  missionStatement: string;
  members: IntelligenceTeamMember[];
  budgetAllocatedMinor: number;
  budgetConsumedMinor: number;
  deadline: string;
  authorityLevel: 'ADVISORY' | 'BOUNDED_EXECUTION' | 'FULL_SUPERVISED';
  successCriteria: string[];
  status: 'MOBILIZING' | 'ACTIVE' | 'PEER_REVIEW' | 'COMPLETED' | 'DISBANDED';
}

export interface IntelligencePeerReview {
  reviewId: string;
  outputClaimId: string;
  reviewerKind: 'AUTOMATED_VALIDATION' | 'AGENT_REVIEW' | 'HUMAN_REVIEW' | 'DOMAIN_EXPERT_REVIEW';
  reviewerId: string;
  reviewStatus: 'APPROVED' | 'CHALLENGED' | 'REQUESTED_REVISION' | 'REJECTED';
  critiqueComments: string;
  verifiedEvidenceAttached: string[];
  timestamp: string;
}

export interface DisputeRecord {
  disputeId: string;
  subjectTopic: string;
  positionA: { partyId: string; positionSummary: string; evidence: string[]; assumptions: string[]; confidencePct: number };
  positionB: { partyId: string; positionSummary: string; evidence: string[]; assumptions: string[]; confidencePct: number };
  status: 'OPEN_DEBATE' | 'MEDIATION' | 'RESOLVED_BY_CONSENSUS' | 'RETAINED_AS_ALTERNATIVE_HYPOTHESIS';
  resolutionSummary?: string;
}

export interface ClaimGraphNode {
  claimId: string;
  statement: string;
  sourceOrigin: string;
  attachedEvidence: string[];
  methodology: string;
  testResult: string;
  peerReviewCount: number;
  confidencePct: number;
  historicalVersions: { version: number; statement: string; timestamp: string; supersededReason?: string }[];
  currentStatus: 'ACTIVE' | 'SUPERSEDED' | 'RETRACTED' | 'CORRECTED';
}

export interface ScientificResearchEcosystem {
  projectId: string;
  title: string;
  domain: 'QUANTUM' | 'BIOPHARMA' | 'MATERIALS' | 'CLIMATE_GEO' | 'ASTROPHYSICS';
  leadInstitution: string;
  collaborationTeams: string[];
  datasetVersionTag: string;
  codeRepositoryHash: string;
  runtimeEnvironment: string;
  experimentalParameters: Record<string, string | number>;
  hypothesisStatement: string;
  isHypothesisOnly: boolean;
  reproducibilityScorePct: number;
  publishedOutputs: { docId: string; hash: string; timestamp: string }[];
}

export interface GlobalSupplyChainTwinNode {
  id: string;
  tier: 'TIER_1' | 'TIER_2' | 'MANUFACTURER' | 'LOGISTICS' | 'DISTRIBUTOR' | 'RETAILER';
  name: string;
  location: string;
  capacityUsagePct: number;
  bottleneckRisk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  alternativeSuppliersAvailable: number;
}

export interface GlobalSupplyChainTwin {
  supplyChainId: string;
  name: string;
  nodes: GlobalSupplyChainTwinNode[];
  simulatedDisruptionEffect?: string;
  demandForecastVariancePct: number;
}

export interface InfrastructureResilienceModel {
  modelId: string;
  sector: 'ENERGY' | 'TRANSPORTATION' | 'TELECOM' | 'INDUSTRIAL_WATER' | 'COMPUTE_GRID';
  activeOutagesCount: number;
  capacityConstraintPct: number;
  simulatedFailureImpact: string;
  recommendationsOnlyNotice: string;
  resilienceScorePct: number;
}

export interface CapabilityMarketItem {
  itemId: string;
  title: string;
  capabilityType: 'AI_AGENT' | 'HUMAN_EXPERT' | 'APPLICATION' | 'WORKFLOW' | 'API' | 'SERVICE' | 'RESEARCH_TOOL';
  providerName: string;
  providerTrustScore: number;
  costStructure: string;
  availabilityStatus: 'INSTANT' | 'QUEUED' | 'RESERVED';
  privacyGuarantee: 'ZERO_KNOWLEDGE_COMPATIBLE' | 'TENANT_ISOLATED' | 'ENCRYPTED_IN_FLIGHT';
  authorizationRequired: string[];
}

export interface AgentServiceContract {
  contractId: string;
  requesterAgentId: string;
  providerAgentId: string;
  capabilityRequested: string;
  scopeOfWork: string;
  agreedBudgetMinor: number;
  deadlineIso: string;
  verificationCriteria: string[];
  status: 'PROPOSED' | 'AUTHORIZED_BY_HUMAN_GOVERNOR' | 'EXECUTING' | 'VERIFIED_COMPLETED' | 'DISPUTED';
  executionProofHash?: string;
}

export interface GlobalWorkflowExchangeItem {
  workflowId: string;
  title: string;
  authorOrgId: string;
  version: string;
  lifecycleStage: 'DRAFT' | 'SUBMITTED' | 'REVIEW' | 'SECURITY_CHECK' | 'APPROVED' | 'PUBLISHED' | 'UPDATED' | 'SUSPENDED' | 'RETIRED';
  verifiedToolDependencies: string[];
  sandboxExecutionPassed: boolean;
  optimizationProposal?: { fasterExecutionPct: number; costReductionPct: number; proposedChanges: string };
}

export interface IncidentResponseTicket {
  incidentId: string;
  title: string;
  stage: 'DETECT' | 'CLASSIFY' | 'CONTAIN' | 'INVESTIGATE' | 'RECOVER' | 'VERIFY' | 'DOCUMENT' | 'LEARN';
  affectedServices: string[];
  severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MODERATE' | 'P4_LOW';
  containmentActionTaken: string;
  rootCauseAnalysis?: string;
  resolutionVerified: boolean;
  retrospectiveLessonsLearned: string[];
}

export interface AIActionFirewallRecord {
  actionId: string;
  agentId: string;
  requestedAction: string;
  pipelineStagesPassed: {
    classified: boolean;
    verified: boolean;
    policyChecked: boolean;
    riskEvaluated: boolean;
    authorityConfirmed: boolean;
    humanApprovalObtained: boolean;
    executionMonitored: boolean;
    postVerificationDone: boolean;
  };
  decision: 'APPROVED_AND_EXECUTED' | 'HELD_FOR_HUMAN_SIGNATURE' | 'BLOCKED_BY_POLICY';
  blockedThreatReason?: string;
  timestamp: string;
}

export interface EmergencyGlobalStopControl {
  activeGlobalStop: boolean;
  frozenSubsystems: ('ALL_AGENTS' | 'MISSIONS' | 'COMMERCE' | 'MARKETPLACE' | 'THIRD_PARTY_INTEGRATIONS')[];
  triggeredByEmail: string;
  triggeredAt?: string;
  reason: string;
  cryptographicAuthSeal: string;
}

export interface DecisionMemoryItem {
  decisionId: string;
  decisionTitle: string;
  optionsConsidered: string[];
  chosenOption: string;
  evidenceBasis: string[];
  assumptions: string[];
  predictedOutcome: string;
  predictedConfidencePct: number;
  actualObservedOutcome?: string;
  actualOutcomeVerified: boolean;
  calibrationVariancePct?: number;
  decisionTimestamp: string;
  outcomeEvaluationTimestamp?: string;
}

export interface PlatformMaturityAssessment {
  organizationMaturityScorePct: number;
  agentMaturityScorePct: number;
  workflowMaturityScorePct: number;
  securityMaturityScorePct: number;
  dataProvenanceScorePct: number;
  aiGovernanceMaturityScorePct: number;
  operationalResilienceScorePct: number;
  overallEcosystemHealthScorePct: number;
}

export interface V18AcceptanceGateReport {
  reportId: string;
  platformVersion: 'V18.0-AUTONOMOUS-ECOSYSTEM-OS';
  generatedAt: string;
  certificationVerdict: 'PASS - CERTIFIED GLOBAL INTELLIGENCE COORDINATION & AUTONOMOUS ECOSYSTEM OPERATING SYSTEM';
  audits: {
    v1ToV17PreservationConfirmed: boolean;
    ecosystemHierarchyEnforced: boolean;
    epistemicRealitySeparationEnforced: boolean;
    humanAuthorityPreserved: boolean;
    zeroTrust7VectorEnforced: boolean;
    emergencyStopOperational: boolean;
    scientificReproducibilityEnforced: boolean;
    cascadeRiskModelFunctional: boolean;
    solutionOrchestrationVerified: boolean;
    decisionCalibrationVerified: boolean;
  };
  auditChecklist: {
    checkId: string;
    category: string;
    requirement: string;
    status: 'VERIFIED_COMPLIANT' | 'GOVERNED_BY_POLICY';
    evidenceDetails: string;
  }[];
}

// ============================================================================
// CATALYX V19: PLANETARY-SCALE INTELLIGENCE, SIMULATION & AUTONOMOUS COORDINATION
// ============================================================================

export type EpistemicTruthClassification =
  | 'OBSERVED'
  | 'INFERRED'
  | 'PREDICTED'
  | 'SIMULATED'
  | 'HYPOTHETICAL';

export type CausalRelationshipType =
  | 'CORRELATION'
  | 'ASSOCIATION'
  | 'DEPENDENCY'
  | 'CAUSAL_HYPOTHESIS'
  | 'VALIDATED_CAUSAL_RELATIONSHIP';

export type PlanetaryEventType =
  | 'REAL_TIME'
  | 'HISTORICAL'
  | 'SCHEDULED'
  | 'DERIVED'
  | 'ANOMALY'
  | 'RISK'
  | 'OPERATIONAL'
  | 'SCIENTIFIC'
  | 'MARKET'
  | 'INFRASTRUCTURE'
  | 'SECURITY';

export interface UniversalWorldEntity {
  entityId: string;
  category:
    | 'PERSON'
    | 'ORGANIZATION'
    | 'LOCATION'
    | 'INFRASTRUCTURE'
    | 'INDUSTRY'
    | 'MARKET'
    | 'RESOURCE'
    | 'ASSET'
    | 'SERVICE'
    | 'PRODUCT'
    | 'WORKFLOW'
    | 'EVENT'
    | 'RISK'
    | 'OPPORTUNITY'
    | 'SCIENTIFIC'
    | 'ENVIRONMENTAL';
  name: string;
  temporalState: string;
  geographicState: string;
  ownership: string;
  dependencies: string[];
  confidencePct: number;
  provenance: {
    source: string;
    timestamp: string;
    method: string;
    authorOrProvider: string;
  };
  freshnessMinutes: number;
  uncertaintyRange: { min: number; max: number; stdDev: number };
  version: string;
  epistemicStatus: EpistemicTruthClassification;
}

export interface PlanetaryDigitalTwin {
  twinId: string;
  twinType:
    | 'ORGANIZATION'
    | 'ENTERPRISE'
    | 'CITY'
    | 'CAMPUS'
    | 'FACTORY'
    | 'SUPPLY_CHAIN'
    | 'INFRASTRUCTURE'
    | 'LOGISTICS'
    | 'ENERGY_GRID'
    | 'ECOSYSTEM'
    | 'MARKET'
    | 'RESEARCH_PROGRAM'
    | 'OPERATIONAL_ENV';
  name: string;
  currentState: Record<string, any>;
  historicalSnapshotsCount: number;
  dependencies: string[];
  constraints: string[];
  risks: string[];
  objectives: string[];
  scenarios: string[];
  interventions: string[];
  confidencePct: number;
  provenance: {
    source: string;
    lastUpdated: string;
  };
  epistemicStatus: EpistemicTruthClassification;
}

export interface SimulationScenario {
  scenarioId: string;
  title: string;
  scenarioType:
    | 'BASELINE'
    | 'ALTERNATIVE'
    | 'STRESS'
    | 'WORST_CASE'
    | 'OPTIMISTIC'
    | 'RECOVERY';
  inputParameters: Record<string, any>;
  perturbations: string[];
  simulatedOutcomes: {
    metric: string;
    baselineVal: number;
    simulatedVal: number;
    variancePct: number;
    uncertaintyBand: [number, number];
  }[];
  monteCarloIterations: number;
  sensitivityRankings: { factor: string; impactPct: number }[];
  overallScore: number;
  epistemicStatus: 'SIMULATED';
}

export interface CausalGraphRelationship {
  relationshipId: string;
  causeEntityId: string;
  effectEntityId: string;
  causeDescription: string;
  effectDescription: string;
  relationshipType: CausalRelationshipType;
  confidencePct: number;
  evidenceBasis: string[];
  counterfactualHypothesis: string;
  cascadingImpactScorePct: number;
  uncertaintyPropagationPct: number;
}

export interface PlanetaryEventRecord {
  eventId: string;
  eventType: PlanetaryEventType;
  sourceIdentity: string;
  provenance: string;
  confidencePct: number;
  timestamp: string;
  correlationId: string;
  idempotencyKey: string;
  schemaVersion: string;
  payload: Record<string, any>;
  deadLetterStatus: 'OK' | 'DEAD_LETTERED';
}

export interface SituationalIntelligenceDigest {
  situationId: string;
  domain: string;
  summary: string;
  source: string;
  timestamp: string;
  confidencePct: number;
  evidence: string[];
  assumptions: string[];
  uncertaintyPct: number;
  modelOrMethod: string;
  lastUpdated: string;
  severity: 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export interface GlobalResilienceAssessment {
  sector: string;
  resilienceScorePct: number;
  vulnerabilityMapping: {
    assetId: string;
    name: string;
    criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    primaryThreat: string;
  }[];
  recoveryPlans: {
    disruptionScenario: string;
    rtoHours: number;
    rpoHours: number;
    restorationSequences: string[];
  }[];
  alternativeResourceOptions: string[];
}

export interface GlobalResourceGraphItem {
  resourceId: string;
  resourceType:
    | 'COMPUTE'
    | 'STORAGE'
    | 'NETWORK'
    | 'HUMAN_EXPERTISE'
    | 'MANUFACTURING'
    | 'LOGISTICS'
    | 'INVENTORY'
    | 'ENERGY'
    | 'FINANCIAL'
    | 'SOFTWARE'
    | 'RESEARCH'
    | 'SERVICE';
  name: string;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  unit: string;
  geographicalRegion: string;
  costPerUnitMinor: number;
  complianceTags: string[];
}

export interface UniversalCapabilityRecord {
  capabilityId: string;
  title: string;
  providerName: string;
  inputsSchema: string;
  outputsSchema: string;
  costStructure: string;
  latencyMs: number;
  qualityScorePct: number;
  trustScorePct: number;
  location: string;
  availability: 'INSTANT' | 'QUEUED' | 'RESERVED';
  permissionsRequired: string[];
  slaGuarantee: string;
  compliance: string[];
}

export interface GovernedProblemCase {
  problemId: string;
  title: string;
  description: string;
  evidence: string[];
  affectedEcosystem: string;
  urgency: 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  scale: 'LOCAL' | 'ENTERPRISE' | 'REGIONAL' | 'PLANETARY';
  constraints: string[];
  requiredCapabilities: string[];
  potentialValueMinor: number;
  pipelineStage:
    | 'UNDERSTAND'
    | 'DECOMPOSE'
    | 'IDENTIFY_CAPABILITIES'
    | 'FORM_TEAM'
    | 'GATHER_EVIDENCE'
    | 'SIMULATE'
    | 'EVALUATE'
    | 'PLAN'
    | 'AUTHORIZE'
    | 'EXECUTE'
    | 'VERIFY'
    | 'LEARN';
  assignedTeam: string[];
}

export interface AdvancedAgentCollective {
  collectiveId: string;
  name: string;
  memberAgents: {
    agentId: string;
    name: string;
    role: string;
    trustScore: number;
    autonomyLevel:
      | 'L0_MANUAL'
      | 'L1_ASSISTED'
      | 'L2_SUPERVISED'
      | 'L3_CONDITIONAL'
      | 'L4_HIGH'
      | 'L5_GOVERNED_SYSTEM';
    executionBudgetMinor: number;
    timeBudgetSec: number;
    sandboxStrictness: 'STRICT_AIRGAP' | 'NETWORK_RESTRICTED' | 'MONITORED_STANDARD';
    toolAllowlist: string[];
    toolDenylist: string[];
  }[];
  collaborationConsensusScore: number;
  activeDisputeCount: number;
}

export interface PhysicalSystemsGatewayRequest {
  requestId: string;
  deviceType:
    | 'ROBOTICS'
    | 'FACTORY_ASSET'
    | 'LOGISTICS_FLEET'
    | 'INFRASTRUCTURE_SWITCH'
    | 'IOT_EDGE'
    | 'INDUSTRIAL_CONTROL';
  targetDeviceId: string;
  requestedCommand: string;
  riskClassification: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME_SAFETY_CRITICAL';
  pipelineState:
    | 'REQUEST'
    | 'IDENTITY_VERIFIED'
    | 'AUTHORIZATION_CONFIRMED'
    | 'SAFETY_POLICY_CHECKED'
    | 'RISK_CLASSIFIED'
    | 'HUMAN_APPROVAL'
    | 'EXECUTING'
    | 'TELEMETRY_VERIFIED'
    | 'AUDIT_LOGGED';
  humanApprovalGranted: boolean;
  executionTelemetrySummary?: string;
  timestamp: string;
}

export interface ScientificResearchArtifact {
  artifactId: string;
  title: string;
  researchDomain: string;
  hypothesisStatement: string;
  literatureReferences: string[];
  experimentRegistryId: string;
  statusTag:
    | 'HYPOTHESIS'
    | 'SIMULATION'
    | 'EXPERIMENT'
    | 'OBSERVATION'
    | 'VALIDATED_RESULT';
  reproducibilityScorePct: number;
  contradictionChecksPassed: boolean;
}

export interface PlanetaryClaimGraphNode {
  claimId: string;
  claimStatement: string;
  evidenceLinks: string[];
  contradictionFlagsCount: number;
  confidencePct: number;
  knowledgeDecayPct: number;
  lastVerifiedDate: string;
  sourceReputationScore: number;
}

export interface PredictionCalibrationRecord {
  predictionId: string;
  predictedMetric: string;
  predictionTimestamp: string;
  predictedDistribution: {
    mean: number;
    p10: number;
    p50: number;
    p90: number;
    confidenceIntervalPct: number;
  };
  actualObservedValue?: number;
  calibrationErrorPct?: number;
  modelDriftDetected: boolean;
  retrospectLessons: string;
}

export interface DecisionIntelligenceCase {
  caseId: string;
  decisionTitle: string;
  optionsConsidered: {
    optionName: string;
    simulatedOutcome: string;
    costBenefitRatio: number;
    riskScorePct: number;
  }[];
  recommendation: string;
  authorizingBody: string;
  chosenOption: string;
  decisionRationale: string;
  outcomeResult?: string;
  timestamp: string;
}

export interface MultiObjectiveOptimizationProfile {
  profileId: string;
  targetDomain: string;
  weights: {
    cost: number;
    quality: number;
    speed: number;
    reliability: number;
    risk: number;
    sustainability: number;
    capacity: number;
  };
  paretoFrontierSummary: string;
  selectedOptimalConfiguration: string;
  constraintViolationsCount: 0;
}

export interface ImmutableLedgerEntry {
  entryId: string;
  transactionId: string;
  timestamp: string;
  integerMinorUnits: number;
  currency: string;
  provider: string;
  customerId: string;
  tenantId: string;
  revenueType:
    | 'SUBSCRIPTION'
    | 'USAGE'
    | 'AGENT_EXECUTION'
    | 'WORKFLOW_COMMISSION'
    | 'DATASET_LICENSE'
    | 'MANAGED_SERVICE';
  feeMinorUnits: number;
  taxMinorUnits: number;
  netAmountMinorUnits: number;
  status: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'DISPUTED' | 'REFUNDED';
  idempotencyKey: string;
  reconciliationVerified: boolean;
  immutableHash: string;
}

export interface DeveloperCloudProject {
  projectId: string;
  name: string;
  tenantId: string;
  apiKeyId: string;
  quotas: {
    apiCallsLimitMonthly: number;
    apiCallsUsedMonthly: number;
    maxRpm: number;
  };
  sandboxEnvironmentEnabled: boolean;
  registeredWebhooksCount: number;
  registeredApplications: string[];
}

export interface WorkflowMarketplaceItem {
  workflowId: string;
  title: string;
  authorOrg: string;
  version: string;
  securityAuditState: 'PASSED' | 'REVIEW_PENDING' | 'BLOCKED';
  trustScorePct: number;
  permissionsRequired: string[];
  installsCount: number;
  pricePerRunMinorUnits: number;
  isolatedWorkerSandbox: boolean;
}

export interface AIActionFirewallV19Record {
  actionId: string;
  callerAgentId: string;
  targetSystem: string;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verificationChecks: {
    classified: boolean;
    callerIdentitySigned: boolean;
    policyAllowlistChecked: boolean;
    blastRadiusEstimated: boolean;
    nonEscalationVerified: boolean;
    dualCustodyApproved: boolean;
    executionSandboxed: boolean;
    immutableLogStored: boolean;
  };
  approvalVerdict: 'PERMITTED' | 'BLOCKED' | 'PENDING_HUMAN_SIGNATURE';
  reason: string;
  timestamp: string;
}

export interface EmergencySystemControlV19 {
  activeMasterHalt: boolean;
  haltedSubsystems: string[];
  authorizedOfficer: string;
  timestamp: string;
  cryptographicSealHash: string;
  safeRecoveryRunbookReady: boolean;
  reason?: string;
}

export interface PlatformHealthMatrixV19 {
  systemHealthPct: number;
  intelligenceHealthPct: number;
  agentHealthPct: number;
  missionHealthPct: number;
  dataHealthPct: number;
  securityHealthPct: number;
  financialHealthPct: number;
  integrationHealthPct: number;
  marketplaceHealthPct: number;
  resilienceHealthPct: number;
}

export interface V19AcceptanceGateReport {
  reportId: string;
  platformVersion: 'V19.0-PLANETARY-INTELLIGENCE-FABRIC';
  generatedAt: string;
  certificationVerdict: 'PASS - CERTIFIED PLANETARY-SCALE INTELLIGENCE, SIMULATION & AUTONOMOUS COORDINATION PLATFORM';
  audits: {
    v1ToV18Preserved: boolean;
    planetaryIntelligenceFabricActive: boolean;
    universalWorldModelFunctional: boolean;
    planetaryDigitalTwinsOperational: boolean;
    simulationScenarioEngineVerified: boolean;
    causalIntelligenceDistinguishedFromCorrelation: boolean;
    planetaryEventFabricIdempotent: boolean;
    globalSituationalIntelligenceSourced: boolean;
    defensiveResilienceEngineTested: boolean;
    resourceAndCapabilityMatchingAccurate: boolean;
    governedProblemSolving12StagesEnforced: boolean;
    agentCollectivesIsolatedAndBounded: boolean;
    physicalSystemsSafetyConservative: boolean;
    scientificIntelligenceArtifactsReproducible: boolean;
    claimGraphEvidenced: boolean;
    predictionEngineCalibratedWithMemory: boolean;
    decisionIntelligenceAuditable: boolean;
    multiObjectiveOptimizationNonDegrading: boolean;
    immutableLedgerIntegerMinorUnitsExact: boolean;
    developerCloudAndMarketplaceSandboxed: boolean;
    aiActionFirewall8StagesOperational: boolean;
    emergencyGlobalStopCryptographicallySealed: boolean;
  };
  auditChecklist: {
    checkId: string;
    subsystem: string;
    requirement: string;
    status: 'VERIFIED_COMPLIANT' | 'GOVERNED_BY_POLICY';
    evidenceDetails: string;
  }[];
}

// ============================================================
// CATALYX V20: FINAL PRODUCTION RELEASE & CERTIFICATION TYPES
// ============================================================

export type V20FinalDecision = 
  | 'READY FOR PRODUCTION DEPLOYMENT'
  | 'READY WITH DOCUMENTED CONFIGURATION REQUIREMENTS'
  | 'NOT READY — DEPLOYMENT BLOCKED';

export interface V20SubsystemAudit {
  feature: string;
  status: 'READY' | 'READY WITH CONFIGURATION' | 'PARTIAL' | 'NOT READY' | 'BLOCKED';
  evidence: string;
  tested: boolean;
  knownLimitations: string;
  externalConfiguration: string;
  deploymentImpact: string;
}

export interface V20AcceptanceCheck {
  gateId: string;
  name: string;
  category: 'CODE_BUILD' | 'SECURITY' | 'INTEGRITY' | 'AI_AGENT' | 'FINANCE' | 'RECOVERY' | 'OPS';
  passed: boolean;
  evidence: string;
}

export interface V20ProductionScorecard {
  category: string;
  score: number;
  maxScore: number;
  grade: 'A+' | 'A' | 'A-';
  rationale: string;
}

export interface V20OperationalRunbook {
  preFlightChecklist: { id: string; task: string; verified: boolean; notes: string }[];
  smokeTestSteps: { step: number; title: string; action: string; expectedResult: string; automatedCheck: string }[];
  rollbackSteps: { order: number; stage: string; action: string; safetyValidation: string }[];
  rtoTargetMinutes: number;
  rpoTargetMinutes: number;
}

export interface V20ProductionReadinessCertification {
  releaseId: 'CATALYX-V20.0.0-FINAL-PRODUCTION';
  releaseName: 'CATALYX V20 FINAL PRODUCTION RELEASE';
  subtitle: 'GLOBAL INTELLIGENCE, SIMULATION, COORDINATION & AUTONOMOUS EXECUTION PLATFORM';
  certifiedAt: string;
  finalDecision: V20FinalDecision;
  executiveSummary: string;
  architectureStatus: string;
  v1ToV19PreservationStatus: string;
  scorecards: V20ProductionScorecard[];
  subsystemAudits: V20SubsystemAudit[];
  acceptanceChecks: V20AcceptanceCheck[];
  runbook: V20OperationalRunbook;
  zeroBlockersCertified: boolean;
}

// =========================================================================
// CATALYX V21: UNIFIED INTELLIGENCE EXPERIENCE & HUMAN-CENTERED OS TYPES
// =========================================================================

export type UserPersonaRole = 
  | 'EXECUTIVE'
  | 'MANAGER'
  | 'OPERATOR'
  | 'DEVELOPER'
  | 'RESEARCHER'
  | 'FINANCE'
  | 'ADMIN';

export type PrimaryDomainId = 
  | 'home'
  | 'work'
  | 'intelligence'
  | 'missions'
  | 'automation'
  | 'resources'
  | 'ecosystem'
  | 'commerce'
  | 'admin';

export interface V21DomainNavGroup {
  id: PrimaryDomainId;
  label: string;
  tagline: string;
  iconName: string;
  badge?: string;
  subItems: {
    id: string;
    label: string;
    description: string;
    iconName: string;
    versionBadge?: string;
    isPrimary?: boolean;
  }[];
}

export interface V21PriorityAction {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetTab: string;
  actionLabel: string;
  category: 'APPROVAL' | 'RISK' | 'DEADLINE' | 'GOVERNANCE' | 'INCIDENT';
  timestamp: string;
}

export interface V21DashboardWidgetConfig {
  welcomeCard: boolean;
  roleMetrics: boolean;
  priorityActions: boolean;
  askCatalyx: boolean;
  activeWork: boolean;
  intelligenceRadar: boolean;
  quickActions: boolean;
  recentActivity: boolean;
}

export interface V21RoleDashboardProfile {
  role: UserPersonaRole;
  title: string;
  subtitle: string;
  primaryQuestions: string[];
  metrics: {
    label: string;
    value: string;
    change?: string;
    isPositive?: boolean;
    subtext: string;
  }[];
  recommendedActions: {
    title: string;
    subtext: string;
    targetTab: string;
    btnLabel: string;
  }[];
  featuredDomains: PrimaryDomainId[];
}

export interface V21SearchItem {
  id: string;
  title: string;
  domain: PrimaryDomainId;
  tabId: string;
  category: 'PAGE' | 'TOOL' | 'DATA' | 'GOVERNANCE' | 'INTELLIGENCE' | 'ACTION';
  description: string;
  keywords: string[];
}

export interface V21UXCertification {
  version: '21.0.0';
  certifiedAt: string;
  status: 'CERTIFIED_PRODUCTION_UX';
  acceptanceGates: {
    id: string;
    title: string;
    category: 'INFORMATION_ARCHITECTURE' | 'ACCESSIBILITY' | 'PERFORMANCE' | 'PRESERVATION' | 'ROLE_ADAPTATION';
    passed: boolean;
    verificationDetails: string;
  }[];
  summary: string;
}

// ============================================================================
// CATALYX V24: UNIVERSAL NAVIGATION, COLLABORATION & SHARING SYSTEM TYPES
// ============================================================================

export type ShareableArtifactType = 
  | 'project' 
  | 'presentation' 
  | 'document' 
  | 'report' 
  | 'spreadsheet' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'demo' 
  | 'prototype' 
  | 'dashboard' 
  | 'meeting' 
  | 'task' 
  | 'mission' 
  | 'workflow' 
  | 'dataset' 
  | 'file';

export type SharePermission = 'VIEW' | 'COMMENT' | 'EDIT' | 'MANAGE';

export type ShareTargetType = 'user' | 'team' | 'workspace' | 'organization' | 'external' | 'link';

export interface ShareRecord {
  id: string;
  artifactId: string;
  artifactTitle: string;
  artifactType: ShareableArtifactType;
  createdByEmail: string;
  createdAt: string;
  targetType: ShareTargetType;
  targetIdentifier: string; // email, teamId, workspaceId, or 'public_link'
  permission: SharePermission;
  expiresAt?: string; // ISO date
  revoked: boolean;
  revokedAt?: string;
  passcodeProtected: boolean;
  passcodeHash?: string;
  downloadAllowed: boolean;
  shareToken: string; // cryptographically secure token
  accessCount: number;
  lastAccessedAt?: string;
}

export interface ShareAuditLog {
  id: string;
  shareId: string;
  artifactId: string;
  action: 'CREATED' | 'ACCESSED' | 'REVOKED' | 'EXPIRED' | 'PERMISSION_CHANGED' | 'DOWNLOAD_SUCCESS' | 'BLOCKED_ATTEMPT';
  actorEmail: string;
  timestamp: string;
  details: string;
}

// 1. First-Class Presentations
export interface WorkSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  notes?: string;
  layout: 'title' | 'bullets' | 'split' | 'quote' | 'metrics';
  metrics?: { label: string; value: string; delta?: string }[];
}

export interface WorkPresentation {
  id: string;
  title: string;
  description: string;
  category: 'STRATEGY' | 'ENGINEERING' | 'PRODUCT' | 'FINANCE' | 'MISSION';
  slides: WorkSlide[];
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
}

// 2. First-Class Videos and Media
export interface MediaChapter {
  title: string;
  timestampSeconds: number;
}

export interface WorkMediaItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  mimeType: string;
  sizeBytes: number;
  chapters: MediaChapter[];
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  ownerEmail: string;
  createdAt: string;
  transcript?: string;
}

// 3. First-Class Product & Application Demos
export interface WorkDemo {
  id: string;
  title: string;
  description: string;
  demoType: 'LIVE' | 'DEMO' | 'PROTOTYPE' | 'RECORDING' | 'EXTERNAL_LINK';
  url: string;
  version: string;
  ownerEmail: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'MAINTENANCE';
  tags: string[];
  createdAt: string;
  interactivePreviewUrl?: string;
}

// 4. Unified Meetings System
export interface MeetingAttendee {
  email: string;
  name: string;
  role?: string;
  status: 'accepted' | 'tentative' | 'declined';
}

export interface MeetingActionItem {
  id: string;
  text: string;
  assigneeEmail: string;
  dueDate?: string;
  convertedToTaskId?: string;
}

export interface WorkMeeting {
  id: string;
  title: string;
  agenda: string;
  description: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  timeZone: string;
  attendees: MeetingAttendee[];
  meetingLink: string;
  provider: 'DIRECT' | 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS' | 'EXTERNAL';
  workspaceId?: string;
  projectId?: string;
  customerId?: string;
  notes?: string;
  decisions: string[];
  actionItems: MeetingActionItem[];
  aiSummary?: {
    summary: string;
    keyTakeaways: string[];
    isAiGenerated: true;
    model: string;
    timestamp: string;
  };
}

// 5. Universal Files & Documents
export interface WorkFileItem {
  id: string;
  name: string;
  extension: string;
  sizeBytes: number;
  mimeType: string;
  category: 'pdf' | 'doc' | 'sheet' | 'code' | 'image' | 'audio' | 'video' | 'archive' | 'other';
  previewAvailable: boolean;
  contentUrl: string;
  sampleContent?: string;
  uploadedByEmail: string;
  createdAt: string;
  tags: string[];
  securityStatus: 'CLEAN_VERIFIED' | 'SCANNING' | 'ISOLATED';
}

// 6. Universal Comments Layer
export interface UniversalComment {
  id: string;
  targetType: ShareableArtifactType;
  targetId: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // for threaded replies
  reactions?: { emoji: string; count: number; users: string[] }[];
}

// 7. Universal Enterprise Activity Timeline
export interface EnterpriseActivityItem {
  id: string;
  eventType: 
    | 'PROJECT_CREATED' 
    | 'MEMBER_JOINED' 
    | 'FILE_SHARED' 
    | 'PRESENTATION_UPDATED' 
    | 'TASK_ASSIGNED' 
    | 'MEETING_CREATED' 
    | 'COMMENT_ADDED' 
    | 'ORDER_CREATED' 
    | 'PAYMENT_VERIFIED' 
    | 'WORKFLOW_EXECUTED'
    | 'SHARE_LINK_CREATED'
    | 'SHARE_REVOKED'
    | 'WORK_OBJECT_CREATED'
    | 'WORK_OBJECT_UPDATED'
    | 'PARTNER_PROPOSAL_CREATED'
    | 'PARTNERSHIP_AGREED'
    | 'DELIVERABLE_SUBMITTED'
    | 'DECISION_LOGGED';
  title: string;
  description: string;
  actor: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  targetTab?: string;
}

// ============================================================================
// CATALYX V25: UNIVERSAL WORK, PARTNERSHIP COLLABORATION & QUALITY CERTIFICATION
// ============================================================================

export type UniversalWorkType =
  | 'PROJECT'
  | 'TASK'
  | 'MISSION'
  | 'GOAL'
  | 'PROGRAM'
  | 'INITIATIVE'
  | 'OPERATION'
  | 'CAMPAIGN'
  | 'RESEARCH'
  | 'BUSINESS_PLAN'
  | 'PARTNERSHIP'
  | 'PARTNERSHIP_PROPOSAL'
  | 'JOINT_VENTURE'
  | 'CONTRACT'
  | 'AGREEMENT'
  | 'MEETING'
  | 'DIGITAL_MEETING'
  | 'WORKSHOP'
  | 'EVENT'
  | 'PRESENTATION'
  | 'PRESENTATION_DECK'
  | 'PITCH_DECK'
  | 'DEMO'
  | 'PRODUCT_DEMO'
  | 'SOFTWARE_DEMO'
  | 'PROTOTYPE'
  | 'MOCKUP'
  | 'DESIGN'
  | 'WEBSITE'
  | 'APPLICATION'
  | 'SOFTWARE_PROJECT'
  | 'DATASET'
  | 'SPREADSHEET'
  | 'REPORT'
  | 'DOCUMENT'
  | 'POLICY'
  | 'PROPOSAL'
  | 'TENDER'
  | 'CUSTOMER_CASE'
  | 'CUSTOMER_PROJECT'
  | 'SALES_OPPORTUNITY'
  | 'CRM_WORK'
  | 'MARKETING_WORK'
  | 'MEDIA_PROJECT'
  | 'VIDEO'
  | 'AUDIO'
  | 'PODCAST'
  | 'IMAGE'
  | 'GRAPHIC'
  | 'SOCIAL_CONTENT'
  | 'CONTENT_CAMPAIGN'
  | 'PRODUCT'
  | 'ORDER'
  | 'COMMERCE_WORK'
  | 'INVENTORY'
  | 'FINANCIAL_WORK'
  | 'ANALYTICS'
  | 'FORECAST'
  | 'STRATEGIC_PLAN'
  | 'RESEARCH_STUDY'
  | 'EXPERIMENT'
  | 'WORKFLOW'
  | 'AUTOMATION'
  | 'AI_MISSION'
  | 'AI_AGENT_MISSION'
  | 'ENGINEERING_WORK'
  | 'DESIGN_WORK'
  | 'EDUCATION_WORK'
  | 'TRAINING'
  | 'CERTIFICATION_PROJECT'
  | 'PARTNERSHIP_ACTIVITY'
  | 'COMMUNITY_PROJECT'
  | 'COMPLIANCE_ACTIVITY'
  | 'AUDIT'
  | 'REVIEW'
  | 'APPROVAL'
  | 'DECISION_PROCESS'
  | 'CUSTOM';

export type WorkStatus = 
  | 'DRAFT' 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'UNDER_REVIEW' 
  | 'BLOCKED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'ARCHIVED';

export type WorkPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface WorkPermissionEntry {
  email: string;
  role: 'VIEWER' | 'COMMENTER' | 'EDITOR' | 'OWNER';
}

export interface WorkMilestone {
  id: string;
  title: string;
  targetDate: string;
  reached: boolean;
  notes?: string;
}

export interface WorkSubtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

export interface WorkDecisionRecord {
  id: string;
  decision: string;
  deciderEmail: string;
  decidedAt: string;
  rationale?: string;
  status: 'PROPOSED' | 'FINALIZED' | 'SUPERSEDED';
}

export interface WorkApprovalRecord {
  id: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt?: string;
  comments?: string;
}

export interface WorkFinancialInfo {
  budgetMinorUnits?: number; // integer minor units (e.g., cents)
  costMinorUnits?: number;
  revenueMinorUnits?: number;
  currency?: string;
}

export interface WorkActivityLog {
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface WorkAuditEntry {
  timestamp: string;
  actor: string;
  checksum: string;
  changeSummary: string;
}

export interface WorkVersionEntry {
  version: number;
  updatedAt: string;
  updatedBy: string;
  changeLog: string;
}

export interface UniversalWorkObject {
  id: string;
  title: string;
  description: string;
  workType: UniversalWorkType;
  owner: string;
  creator: string;
  organization: string;
  workspace: string;
  team: string;
  participants: string[];
  collaborators: string[];
  partners: string[];
  customers: string[];
  stakeholders: string[];
  permissions: WorkPermissionEntry[];
  status: WorkStatus;
  priority: WorkPriority;
  deadlines: { label: string; dueDate: string; completed?: boolean }[];
  milestones: WorkMilestone[];
  dependencies: string[];
  tasks: { id: string; title: string; completed: boolean; assignee?: string }[];
  subtasks: WorkSubtask[];
  documents: { id: string; name: string; url: string; mimeType: string }[];
  files: string[]; // references to WorkFileItem IDs
  images: string[];
  videos: string[]; // references to WorkMediaItem IDs
  audio: string[];
  presentations: string[]; // references to WorkPresentation IDs
  demos: string[]; // references to WorkDemo IDs
  meetings: string[]; // references to WorkMeeting IDs
  messages: string[];
  comments: UniversalComment[];
  decisions: WorkDecisionRecord[];
  approvals: WorkApprovalRecord[];
  financialInfo?: WorkFinancialInfo;
  relatedCustomers: string[];
  relatedProducts: string[];
  relatedOrders: string[];
  relatedMissions: string[];
  relatedAiAgents: string[];
  activityHistory: WorkActivityLog[];
  auditHistory: WorkAuditEntry[];
  versionHistory: WorkVersionEntry[];
  links: { label: string; url: string }[];
  externalReferences: { system: string; refId: string; url?: string }[];
  metadata: Record<string, any>;
  tags: string[];
  customFields: Record<string, any>;
  workflowState: string;
  securityClassification: SecurityClassification;
  retentionPolicy: string;
  sharingPolicy: {
    publicShareAllowed: boolean;
    requirePasscode: boolean;
    maxAccessLevel: SharePermission;
  };
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Partnership Collaboration Architecture
// ----------------------------------------------------------------------------

export type PartnerType = 
  | 'COMPANY' 
  | 'ORGANIZATION' 
  | 'TEAM' 
  | 'INDIVIDUAL' 
  | 'INVESTOR' 
  | 'SUPPLIER' 
  | 'CUSTOMER' 
  | 'DEVELOPER' 
  | 'INSTITUTION' 
  | 'STRATEGIC_PARTNER' 
  | 'EXTERNAL_COLLABORATOR';

export type PartnershipStatus = 
  | 'PROPOSAL' 
  | 'NEGOTIATION' 
  | 'ACTIVE' 
  | 'ON_HOLD' 
  | 'COMPLETED' 
  | 'TERMINATED';

export interface PartnerDeliverable {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  owner: string;
  status: 'PENDING' | 'IN_REVIEW' | 'ACCEPTED' | 'REVISED';
  submittedAt?: string;
  verificationEvidence?: string;
}

export interface PartnerAgreement {
  id: string;
  title: string;
  effectiveDate: string;
  expirationDate?: string;
  signed: boolean;
  signedBy: string[];
  documentUrl?: string;
  termsSummary: string;
}

export interface PartnerProfile {
  id: string;
  name: string;
  partnerType: PartnerType;
  organization: string;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  status: PartnershipStatus;
  agreedTermsSummary: string;
  startDate: string;
  renewalDate?: string;
  sharedObjectives: string[];
  responsibilities: { partnerName: string; items: string[] }[];
  milestones: { id: string; title: string; dueDate: string; completed: boolean; deliverableRef?: string }[];
  deliverables: PartnerDeliverable[];
  sharedWorkObjectIds: string[];
  sharedDocumentIds: string[];
  sharedPresentationIds: string[];
  sharedDemoIds: string[];
  sharedMeetingIds: string[];
  sharedCommunicationsCount: number;
  approvals: { id: string; topic: string; requestedBy: string; approvedBy?: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; date: string }[];
  decisions: { id: string; summary: string; decidedAt: string; parties: string[] }[];
  agreements: PartnerAgreement[];
  actionItems: { id: string; title: string; assignee: string; dueDate: string; completed: boolean }[];
  partnerPermissions: { email: string; accessLevel: 'READ_ONLY' | 'COLLABORATOR' | 'ADMIN'; authorizedDomain: string }[];
  activityHistory: { timestamp: string; actor: string; event: string }[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// V25 Production Certification & Forensic Quality Assurance
// ----------------------------------------------------------------------------

export interface V25CertificationGate {
  id: string;
  number: number;
  title: string;
  category: 
    | 'UNIVERSAL_WORK' 
    | 'PARTNERSHIPS' 
    | 'COLLABORATION' 
    | 'PRESENTATIONS' 
    | 'DEMOS' 
    | 'MEETINGS' 
    | 'FILES' 
    | 'SHARING' 
    | 'NAVIGATION' 
    | 'SECURITY' 
    | 'AI_SAFETY' 
    | 'COMMERCE' 
    | 'RESILIENCE' 
    | 'PERFORMANCE';
  description: string;
  status: 'PASS' | 'FIXED' | 'PARTIAL' | 'FAILED' | 'EXTERNAL_VALIDATION_REQUIRED';
  verificationMethod: string;
  evidence: string;
  timestamp: string;
}

export interface V25CertificationDossier {
  version: '25.0.0-final';
  releaseTitle: 'CATALYX V25: FINAL UNIVERSAL WORK, COLLABORATION & RESILIENCE RELEASE';
  certifiedAt: string;
  certifyingAuthority: 'CATALYX Senior Forensic Quality Assurance & Systems Architecture';
  cryptographicSignature: string;
  totalGates: number;
  passedGates: number;
  fixedGates: number;
  externalValidationGates: number;
  gates: V25CertificationGate[];
  runtimeHealth: {
    memoryHeapMB: number;
    activeServices: number;
    errorBubbleRate: number;
    deadButtonsFound: number;
    deadLinksFound: number;
  };
  summary: string;
}
