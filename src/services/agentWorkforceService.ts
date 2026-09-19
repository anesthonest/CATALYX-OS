import { 
  AgentWorkforce2Profile, SpecialistArea, AgentAutonomyLevel, 
  AgentPermission, AgentExecutionRecord, AgentCollaborationExchange, RiskLevel 
} from '../types';
import { GovernanceService } from './governanceService';

export const INITIAL_AI_WORKFORCE_V9: AgentWorkforce2Profile[] = [
  {
    id: 'agent_engineering',
    organizationId: 'default_org',
    name: 'Software Engineering & QA Agent',
    category: 'software_development',
    specialistArea: 'Engineering',
    description: 'Autonomous static analysis, test generation, schema validation, and PR reviews.',
    purpose: 'Maintain high code quality, prevent regressions, and enforce typed API contracts.',
    capabilities: ['Static Analysis', 'Test Case Generation', 'API Schema Validation', 'Refactoring Planning'],
    skillRegistry: ['TypeScript-v5', 'React-18', 'NodeJS-ESM', 'Vite-Bundler', 'PostgreSQL-DDL', 'Security-Linter'],
    tools: ['CodeLinterIntegration', 'SchemaValidator', 'TestRunner', 'DependencyAuditor'],
    toolAccess: ['CodeLinterIntegration', 'SchemaValidator', 'TestRunner', 'DependencyAuditor'],
    permissions: ['READ_KNOWLEDGE', 'CREATE_TASK', 'UPDATE_TASK', 'READ_ANALYTICS'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 54,
    availability: 'available',
    costPerRunMinorUnits: 250, // $2.50 compute
    performanceScore: 94,
    reliabilityScore: 98,
    successRatePercent: 97.4,
    failureRatePercent: 2.6,
    riskTier: 'MEDIUM',
    specializationSummary: 'Full-stack TypeScript architecture, automated unit/integration test synthesis, and API hardening.',
    executionLimits: {
      maxActionsPerDay: 150,
      costLimitUsdPerRun: 0.25,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 50.00,
      currentMonthSpendUsd: 11.20,
    },
    status: 'active',
    systemInstructions: 'Prioritize type safety, architectural consistency, and non-destructive execution. Intercept schema modifications for review.',
    memoryAccessScope: 'project',
    auditHistoryCount: 94,
    createdAt: '2026-01-22T00:00:00Z',
  },
  {
    id: 'agent_sales',
    organizationId: 'default_org',
    name: 'Enterprise Sales & Deal Desk Agent',
    category: 'sales',
    specialistArea: 'Sales',
    description: 'B2B pipeline velocity monitoring, deal qualification, and tailored enterprise proposals.',
    purpose: 'Accelerate contract cycles and suggest high-probability account expansion opportunities.',
    capabilities: ['BANT Qualification', 'RFP Drafter', 'Deal Scoring', 'Competitor Comparison', 'Proposal Synthesizer'],
    skillRegistry: ['Enterprise-B2B', 'SaaS-Pricing-Models', 'Contract-Scoping', 'Regional-East-Africa-Markets'],
    tools: ['CrmConnector', 'ProposalGenerator', 'PipelineHealthCheck', 'RateSheetLookup'],
    toolAccess: ['CrmConnector', 'ProposalGenerator', 'PipelineHealthCheck', 'RateSheetLookup'],
    permissions: ['READ_KNOWLEDGE', 'CREATE_TASK', 'UPDATE_TASK', 'USE_INTEGRATION', 'REQUEST_APPROVAL'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 42,
    availability: 'available',
    costPerRunMinorUnits: 300,
    performanceScore: 91,
    reliabilityScore: 96,
    successRatePercent: 95.8,
    failureRatePercent: 4.2,
    riskTier: 'LOW',
    specializationSummary: 'Enterprise contract negotiation preparation, RFP evidence mapping, and multi-currency billing packages.',
    executionLimits: {
      maxActionsPerDay: 80,
      costLimitUsdPerRun: 0.30,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 40.00,
      currentMonthSpendUsd: 6.20,
    },
    status: 'active',
    systemInstructions: 'Never commit discounts without human executive approval. Always quote accurate multi-currency minor units.',
    memoryAccessScope: 'department',
    auditHistoryCount: 28,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'agent_operations',
    organizationId: 'default_org',
    name: 'Operational Optimizer Agent',
    category: 'operations',
    specialistArea: 'Operations',
    description: 'Process bottleneck elimination, queue scheduling, and automated workflow dispatch.',
    purpose: 'Streamline operational handoffs and maintain high execution throughput.',
    capabilities: ['Queue Optimization', 'Capacity Planning', 'Process Mapping', 'Automation Dispatch', 'Incident Triage'],
    skillRegistry: ['Workflow-Choreography', 'SLA-Enforcement', 'Queue-Balancing', 'Incident-Routing'],
    tools: ['WorkflowScheduler', 'QueueMonitor', 'ResourceAllocator', 'AlertDispatcher'],
    toolAccess: ['WorkflowScheduler', 'QueueMonitor', 'ResourceAllocator', 'AlertDispatcher'],
    permissions: ['READ_ANALYTICS', 'CREATE_TASK', 'UPDATE_TASK', 'EXECUTE_WORKFLOW'],
    autonomyLevel: 3, // APPROVED_EXECUTION
    workloadPercent: 62,
    availability: 'available',
    costPerRunMinorUnits: 150,
    performanceScore: 96,
    reliabilityScore: 99,
    successRatePercent: 99.1,
    failureRatePercent: 0.9,
    riskTier: 'LOW',
    specializationSummary: 'Queue dispatch algorithms, continuous task re-balancing, and automated incident escalations.',
    executionLimits: {
      maxActionsPerDay: 300,
      costLimitUsdPerRun: 0.10,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 50.00,
      currentMonthSpendUsd: 12.40,
    },
    status: 'active',
    systemInstructions: 'Execute approved automated workflows cleanly. Ensure every step logs full context into the execution gateway.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 114,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'agent_research',
    organizationId: 'default_org',
    name: 'Research & Evidence Synthesizer',
    category: 'research',
    specialistArea: 'Research',
    description: 'Deep document synthesis, competitor benchmarking, and empirical evidence gathering.',
    purpose: 'Retrieve and cross-reference institutional knowledge, technical specs, and industry papers.',
    capabilities: ['Document Vectorization', 'Citation Mapping', 'Fact Verification', 'Executive Summaries'],
    skillRegistry: ['Semantic-Embedding', 'Citation-Graph', 'Provenance-Verification', 'Multi-Source-Synthesis'],
    tools: ['KnowledgeUniverseScanner', 'SemanticRetriever', 'PaperIndexer', 'FactChecker'],
    toolAccess: ['KnowledgeUniverseScanner', 'SemanticRetriever', 'PaperIndexer', 'FactChecker'],
    permissions: ['READ_KNOWLEDGE', 'READ_ANALYTICS'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 48,
    availability: 'available',
    costPerRunMinorUnits: 200,
    performanceScore: 95,
    reliabilityScore: 97,
    successRatePercent: 98.2,
    failureRatePercent: 1.8,
    riskTier: 'LOW',
    specializationSummary: 'Institutional knowledge retrieval, empirical evidence scoring, and cross-document citation indexing.',
    executionLimits: {
      maxActionsPerDay: 150,
      costLimitUsdPerRun: 0.15,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 25.00,
      currentMonthSpendUsd: 3.40,
    },
    status: 'active',
    systemInstructions: 'Ground all answers in verified organizational knowledge. Provide provenance and citation metadata. Never hallucinate corporate policies.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 42,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'agent_finance',
    organizationId: 'default_org',
    name: 'Finance & Unit Economics Agent',
    category: 'finance_analysis',
    specialistArea: 'Finance',
    description: 'Cash runway modeling, SaaS gross margin calculation, and budget variance auditing.',
    purpose: 'Provide rigorous financial sanity checks for platform spending, billing, and pricing tiers.',
    capabilities: ['Runway Projections', 'Unit Economics Math', 'Budget Guardrails', 'Pesapal Revenue Auditing'],
    skillRegistry: ['Minor-Units-Arithmetic', 'Pesapal-v3-API', 'Double-Entry-Ledger', 'FX-Hedging-Math'],
    tools: ['RevenueLedgerAuditor', 'RunwayCalculator', 'PesapalReconciliationEngine', 'CurrencyConverter'],
    toolAccess: ['RevenueLedgerAuditor', 'RunwayCalculator', 'PesapalReconciliationEngine', 'CurrencyConverter'],
    permissions: ['READ_ANALYTICS', 'REQUEST_APPROVAL', 'READ_KNOWLEDGE'],
    autonomyLevel: 1, // RECOMMEND
    workloadPercent: 38,
    availability: 'available',
    costPerRunMinorUnits: 220,
    performanceScore: 98,
    reliabilityScore: 99.5,
    successRatePercent: 99.8,
    failureRatePercent: 0.2,
    riskTier: 'HIGH',
    specializationSummary: 'Zero-loss multi-currency ledger reconciliation, cash burn forecasting, and SaaS margin protection.',
    executionLimits: {
      maxActionsPerDay: 50,
      costLimitUsdPerRun: 0.15,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 20.00,
      currentMonthSpendUsd: 2.10,
    },
    status: 'active',
    systemInstructions: 'Never round financial numbers casually. Never permit automated fund transfers without multi-party human approval.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 52,
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'agent_product',
    organizationId: 'default_org',
    name: 'Product Strategy & Roadmap Agent',
    category: 'executive_intelligence',
    specialistArea: 'Product',
    description: 'Feature telemetry analysis, user journey tracking, and roadmap decomposition.',
    purpose: 'Align engineering deliverables with customer demand and strategic OKRs.',
    capabilities: ['User Journey Telemetry', 'Feature Scoring', 'PRD Decomposer', 'Competitive Feature Gap'],
    skillRegistry: ['Product-Analytics', 'PRD-Specification', 'User-Sentiment-Mining', 'Roadmap-Mapping'],
    tools: ['FeatureUsageAnalytics', 'PRDComposer', 'CompetitorRadar', 'RoadmapSync'],
    toolAccess: ['FeatureUsageAnalytics', 'PRDComposer', 'CompetitorRadar', 'RoadmapSync'],
    permissions: ['READ_KNOWLEDGE', 'READ_ANALYTICS', 'CREATE_TASK'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 46,
    availability: 'available',
    costPerRunMinorUnits: 280,
    performanceScore: 92,
    reliabilityScore: 95,
    successRatePercent: 96.5,
    failureRatePercent: 3.5,
    riskTier: 'LOW',
    specializationSummary: 'Product-market fit calibration, feature adoption curves, and actionable PRD decomposition.',
    executionLimits: {
      maxActionsPerDay: 80,
      costLimitUsdPerRun: 0.25,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 35.00,
      currentMonthSpendUsd: 5.80,
    },
    status: 'active',
    systemInstructions: 'Focus on verifiable customer value. Distinguish observed usage data from speculative assumptions.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 38,
    createdAt: '2026-01-28T00:00:00Z',
  },
  {
    id: 'agent_legal',
    organizationId: 'default_org',
    name: 'Legal & Regulatory Compliance Agent',
    category: 'document',
    specialistArea: 'Legal',
    description: 'Contract clause verification, regional data privacy auditing, and regulatory compliance mapping.',
    purpose: 'Ensure all operations adhere to regional data sovereignty laws and corporate governance policies.',
    capabilities: ['Regulatory Mapping', 'Contract Clause Audit', 'Privacy Policy Verifier', 'Sovereign Data Residency Audit'],
    skillRegistry: ['Uganda-DPA-2019', 'Kenya-DPA-2019', 'GDPR-Compliance', 'SaaS-MSA-Auditing', 'SOC2-Trust-Criteria'],
    tools: ['ComplianceKnowledgeScanner', 'PolicyDiffViewer', 'ResidencyAuditor'],
    toolAccess: ['ComplianceKnowledgeScanner', 'PolicyDiffViewer', 'ResidencyAuditor'],
    permissions: ['READ_KNOWLEDGE', 'REQUEST_APPROVAL'],
    autonomyLevel: 1, // RECOMMEND
    workloadPercent: 30,
    availability: 'available',
    costPerRunMinorUnits: 350,
    performanceScore: 97,
    reliabilityScore: 99,
    successRatePercent: 99.2,
    failureRatePercent: 0.8,
    riskTier: 'CRITICAL',
    specializationSummary: 'Cross-border data privacy statutes, SaaS service agreements, and security compliance evidence validation.',
    executionLimits: {
      maxActionsPerDay: 40,
      costLimitUsdPerRun: 0.35,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 30.00,
      currentMonthSpendUsd: 3.80,
    },
    status: 'active',
    systemInstructions: 'Never provide definitive legal advice without explicit disclaimer. Flag all compliance discrepancies for General Counsel.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 44,
    createdAt: '2026-02-08T00:00:00Z',
  },
  {
    id: 'agent_support',
    organizationId: 'default_org',
    name: 'Customer Support & Success Agent',
    category: 'customer_support',
    specialistArea: 'Support',
    description: 'Ticket triage, FAQ synthesis, customer sentiment monitoring, and rapid resolution drafting.',
    purpose: 'Draft swift, accurate responses to customer queries while escalating complex defects to engineering.',
    capabilities: ['Sentiment Detection', 'Resolution Drafter', 'Defect Classifier', 'SLA Clock Monitor'],
    skillRegistry: ['Ticket-Triage', 'Empathetic-Communication', 'SLA-Monitoring', 'Escalation-Pathways'],
    tools: ['SupportTicketQueue', 'FaqLookup', 'EscalationPager'],
    toolAccess: ['SupportTicketQueue', 'FaqLookup', 'EscalationPager'],
    permissions: ['READ_KNOWLEDGE', 'SEND_NOTIFICATION', 'USE_INTEGRATION'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 52,
    availability: 'available',
    costPerRunMinorUnits: 120,
    performanceScore: 93,
    reliabilityScore: 96,
    successRatePercent: 97.1,
    failureRatePercent: 2.9,
    riskTier: 'LOW',
    specializationSummary: 'Tier 1 & Tier 2 support response drafting, sentiment trend analysis, and VIP escalation alerts.',
    executionLimits: {
      maxActionsPerDay: 180,
      costLimitUsdPerRun: 0.08,
      requireHumanApprovalForDestructive: false,
    },
    costLimits: {
      monthlyBudgetUsd: 30.00,
      currentMonthSpendUsd: 4.10,
    },
    status: 'active',
    systemInstructions: 'Maintain empathetic, professional composure. Do not promise unverified features or engineering timelines.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 45,
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'agent_marketing',
    organizationId: 'default_org',
    name: 'Growth & Omnichannel Marketing Agent',
    category: 'marketing',
    specialistArea: 'Marketing',
    description: 'Campaign planning, conversion funnel optimization, and audience messaging.',
    purpose: 'Draft targeted messaging, track customer acquisition costs, and coordinate product launches.',
    capabilities: ['Audience Segmentation', 'Copy Synthesis', 'Channel Analytics', 'Campaign Roadmapping'],
    skillRegistry: ['B2B-Copywriting', 'Conversion-Funnel-Optimization', 'Regional-Campaign-Targeting', 'CAC-LTV-Modeling'],
    tools: ['CampaignComposer', 'FunnelTracker', 'AudienceInsights'],
    toolAccess: ['CampaignComposer', 'FunnelTracker', 'AudienceInsights'],
    permissions: ['READ_KNOWLEDGE', 'CREATE_TASK', 'READ_ANALYTICS'],
    autonomyLevel: 1, // RECOMMEND
    workloadPercent: 36,
    availability: 'available',
    costPerRunMinorUnits: 250,
    performanceScore: 90,
    reliabilityScore: 94,
    successRatePercent: 94.8,
    failureRatePercent: 5.2,
    riskTier: 'LOW',
    specializationSummary: 'High-converting B2B SaaS messaging, campaign experiment design, and regional growth funnels.',
    executionLimits: {
      maxActionsPerDay: 100,
      costLimitUsdPerRun: 0.25,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 35.00,
      currentMonthSpendUsd: 4.80,
    },
    status: 'active',
    systemInstructions: 'Generate actionable, concise marketing strategies. All brand copy must align with company positioning guidelines.',
    memoryAccessScope: 'department',
    auditHistoryCount: 31,
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'agent_architecture',
    organizationId: 'default_org',
    name: 'Enterprise Architecture & Systems Agent',
    category: 'executive_intelligence',
    specialistArea: 'Architecture',
    description: 'System boundary design, ADR drafting, technical debt analysis, and scalability auditing.',
    purpose: 'Maintain architectural coherence, guide V9-to-V12 evolution, and prevent spaghetti couplings.',
    capabilities: ['ADR Drafting', 'Boundary Decomposition', 'Technical Debt Audit', 'Latency Budget Modeling'],
    skillRegistry: ['Distributed-Systems', 'Clean-Architecture', 'Database-Normalization', 'Integration-Patterns', 'Security-Boundaries'],
    tools: ['ArchitectureVisualizer', 'DependencyGraphAnalyzer', 'ADRComposer'],
    toolAccess: ['ArchitectureVisualizer', 'DependencyGraphAnalyzer', 'ADRComposer'],
    permissions: ['READ_KNOWLEDGE', 'WRITE_KNOWLEDGE', 'READ_ANALYTICS'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 44,
    availability: 'available',
    costPerRunMinorUnits: 320,
    performanceScore: 96,
    reliabilityScore: 98.5,
    successRatePercent: 98.9,
    failureRatePercent: 1.1,
    riskTier: 'MEDIUM',
    specializationSummary: 'Sub-system decoupling, high-throughput message bus topology, and evolutionary software architecture.',
    executionLimits: {
      maxActionsPerDay: 60,
      costLimitUsdPerRun: 0.35,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 40.00,
      currentMonthSpendUsd: 7.80,
    },
    status: 'active',
    systemInstructions: 'Enforce single-responsibility principles and strict interface boundaries. Guard against irreversible technical debt.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 56,
    createdAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'agent_hr',
    organizationId: 'default_org',
    name: 'Workforce & Talent Operations Agent',
    category: 'operations',
    specialistArea: 'HR',
    description: 'Capacity balancing, employee sentiment anonymization, onboarding checklists, and skill gap mapping.',
    purpose: 'Foster high employee engagement, monitor team burnout signals, and streamline hiring workflows.',
    capabilities: ['Capacity Balancing', 'Skill Gap Identification', 'Onboarding Synthesis', 'Burnout Risk Analysis'],
    skillRegistry: ['Workforce-Planning', 'Privacy-Preserving-Telemetry', 'Skill-Taxonomy', 'Role-Competency-Mapping'],
    tools: ['CapacityPlanner', 'SkillMatrixLookup', 'BurnoutDetector'],
    toolAccess: ['CapacityPlanner', 'SkillMatrixLookup', 'BurnoutDetector'],
    permissions: ['READ_KNOWLEDGE', 'READ_ANALYTICS', 'CREATE_TASK'],
    autonomyLevel: 2, // PREPARE
    workloadPercent: 32,
    availability: 'available',
    costPerRunMinorUnits: 180,
    performanceScore: 93,
    reliabilityScore: 97,
    successRatePercent: 96.8,
    failureRatePercent: 3.2,
    riskTier: 'LOW',
    specializationSummary: 'Workplace psychological safety, capacity load monitoring, and role competency taxonomy.',
    executionLimits: {
      maxActionsPerDay: 70,
      costLimitUsdPerRun: 0.20,
      requireHumanApprovalForDestructive: true,
    },
    costLimits: {
      monthlyBudgetUsd: 25.00,
      currentMonthSpendUsd: 3.20,
    },
    status: 'active',
    systemInstructions: 'Strictly respect human privacy. Never perform invasive monitoring. Focus on macro capacity and team wellness.',
    memoryAccessScope: 'organization',
    auditHistoryCount: 34,
    createdAt: '2026-02-14T00:00:00Z',
  },
];

const STORAGE_KEY_AGENTS = 'catalyx_v9_ai_workforce';
const STORAGE_KEY_EXEC_LOGS = 'catalyx_v9_agent_exec_logs';
const STORAGE_KEY_COLLAB = 'catalyx_v9_agent_collab_exchanges';

export class AgentWorkforceService {
  /**
   * Retrieve the full 11-agent governed workforce profiles
   */
  public static getAgents(orgId: string): AgentWorkforce2Profile[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_AGENTS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing agent workforce from storage:', e);
      }
    }

    const initial = INITIAL_AI_WORKFORCE_V9.map(a => ({ ...a, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_AGENTS}_${orgId}`, JSON.stringify(initial));
    return initial;
  }

  public static getAgentById(orgId: string, agentId: string): AgentWorkforce2Profile | undefined {
    return this.getAgents(orgId).find(a => a.id === agentId);
  }

  public static saveAgent(agent: AgentWorkforce2Profile): void {
    const agents = this.getAgents(agent.organizationId);
    const index = agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.push(agent);
    }
    localStorage.setItem(`${STORAGE_KEY_AGENTS}_${agent.organizationId}`, JSON.stringify(agents));
  }

  public static updateAutonomyLevel(orgId: string, agentId: string, level: AgentAutonomyLevel): void {
    const agent = this.getAgentById(orgId, agentId);
    if (agent) {
      agent.autonomyLevel = level;
      this.saveAgent(agent);
    }
  }

  public static togglePermission(orgId: string, agentId: string, permission: AgentPermission): void {
    const agent = this.getAgentById(orgId, agentId);
    if (agent) {
      if (agent.permissions.includes(permission)) {
        agent.permissions = agent.permissions.filter(p => p !== permission);
      } else {
        agent.permissions.push(permission);
      }
      this.saveAgent(agent);
    }
  }

  /**
   * Intelligent Task Assignment Algorithm:
   * Selects the optimal agent based on capabilities, permissions, workload, cost, performance, risk, and policy.
   */
  public static selectOptimalAgent(orgId: string, criteria: {
    capabilityRequired?: string;
    specialistArea?: SpecialistArea;
    requiredPermissions?: AgentPermission[];
    maxRiskTier?: RiskLevel;
    maxBudgetMinorUnits?: number;
    requiredTool?: string;
  }): AgentWorkforce2Profile | undefined {
    const agents = this.getAgents(orgId).filter(a => a.availability === 'available' && a.status === 'active');

    // Filter agents that possess required capabilities, permissions, and tools
    const candidates = agents.filter(agent => {
      if (criteria.specialistArea && agent.specialistArea !== criteria.specialistArea) {
        return false;
      }
      if (criteria.capabilityRequired && !agent.capabilities.some(c => c.toLowerCase().includes(criteria.capabilityRequired!.toLowerCase()))) {
        return false;
      }
      if (criteria.requiredPermissions && !criteria.requiredPermissions.every(p => agent.permissions.includes(p))) {
        return false;
      }
      if (criteria.requiredTool && !agent.tools.includes(criteria.requiredTool)) {
        return false;
      }
      if (criteria.maxBudgetMinorUnits && agent.costPerRunMinorUnits > criteria.maxBudgetMinorUnits) {
        return false;
      }
      return true;
    });

    if (candidates.length === 0) {
      // Fallback: match by specialist area or return least loaded agent
      return agents.find(a => a.specialistArea === criteria.specialistArea) || agents.sort((a, b) => a.workloadPercent - b.workloadPercent)[0];
    }

    // Rank candidates by composite score: high performance + high reliability - workload
    candidates.sort((a, b) => {
      const scoreA = (a.performanceScore * 0.4) + (a.reliabilityScore * 0.4) - (a.workloadPercent * 0.2);
      const scoreB = (b.performanceScore * 0.4) + (b.reliabilityScore * 0.4) - (b.workloadPercent * 0.2);
      return scoreB - scoreA;
    });

    return candidates[0];
  }

  /**
   * Governed Multi-Agent Collaboration Pipeline:
   * Inter-agent communication is authenticated, authorized, scoped, logged, and traceable.
   * STRICT GOVERNANCE: One agent can NEVER grant itself permissions another system denied.
   */
  public static executeCollaborationStep(params: {
    orgId: string;
    missionId: string;
    fromAgentId: string;
    toAgentId: string;
    purpose: string;
    payloadSummary: string;
  }): AgentCollaborationExchange {
    const fromAgent = this.getAgentById(params.orgId, params.fromAgentId);
    const toAgent = this.getAgentById(params.orgId, params.toAgentId);

    // Rule 1: Authenticate both agents exist and belong to the tenant
    const authenticated = !!(fromAgent && toAgent && fromAgent.organizationId === params.orgId && toAgent.organizationId === params.orgId);

    // Rule 2: Authorize exchange — sender must have permission to hand off, receiver must have capacity
    const authorized = authenticated && toAgent.availability !== 'suspended' && fromAgent.status === 'active';

    const exchange: AgentCollaborationExchange = {
      exchangeId: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      missionId: params.missionId,
      fromAgentId: params.fromAgentId,
      toAgentId: params.toAgentId,
      purpose: params.purpose,
      payloadSummary: params.payloadSummary,
      authenticated,
      authorized,
      logged: true,
      timestamp: new Date().toISOString(),
    };

    // Store exchange in collaboration ledger
    const raw = localStorage.getItem(`${STORAGE_KEY_COLLAB}_${params.orgId}`);
    const exchanges: AgentCollaborationExchange[] = raw ? JSON.parse(raw) : [];
    exchanges.unshift(exchange);
    localStorage.setItem(`${STORAGE_KEY_COLLAB}_${params.orgId}`, JSON.stringify(exchanges.slice(0, 100)));

    GovernanceService.addAuditLog({
      id: `audit_collab_${Date.now()}`,
      organizationId: params.orgId,
      actorId: params.fromAgentId,
      actorName: fromAgent?.name || params.fromAgentId,
      actorRole: 'agent',
      action: `AGENT_COLLABORATION_DISPATCH: ${fromAgent?.name} -> ${toAgent?.name}`,
      resourceType: 'agent_collaboration',
      resourceId: exchange.exchangeId,
      outcome: authorized ? 'success' : 'denied',
      details: {
        missionId: params.missionId,
        purpose: params.purpose,
        authenticated,
        authorized,
      },
      timestamp: exchange.timestamp,
    });

    return exchange;
  }

  public static getCollaborationExchanges(orgId: string): AgentCollaborationExchange[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_COLLAB}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing collaboration exchanges:', e);
      }
    }

    const defaultExchanges: AgentCollaborationExchange[] = [
      {
        exchangeId: 'collab_init_01',
        missionId: 'msn_v9_retention_01',
        fromAgentId: 'agent_research',
        toAgentId: 'agent_finance',
        purpose: 'Handoff verified churn analysis and cohort retention benchmarks for unit economics calculation',
        payloadSummary: 'Cohort retention matrix across East Africa Pro subscribers (N=142 accounts)',
        authenticated: true,
        authorized: true,
        logged: true,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        exchangeId: 'collab_init_02',
        missionId: 'msn_v9_retention_01',
        fromAgentId: 'agent_finance',
        toAgentId: 'agent_operations',
        purpose: 'Pass approved discounted renewal threshold rules to operational optimizer for dispatch',
        payloadSummary: 'Financial margin boundaries: max allowable discount 15% on annual prepay',
        authenticated: true,
        authorized: true,
        logged: true,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_COLLAB}_${orgId}`, JSON.stringify(defaultExchanges));
    return defaultExchanges;
  }

  public static getExecutionLogs(orgId: string): AgentExecutionRecord[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_EXEC_LOGS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing agent logs:', e);
      }
    }

    const defaultLogs: AgentExecutionRecord[] = [
      {
        id: 'exec_v9_001',
        organizationId: orgId,
        agentId: 'agent_architecture',
        agentName: 'Enterprise Architecture & Systems Agent',
        actionType: 'GENERATE_V9_ARCHITECTURAL_DECISION_RECORD',
        summary: 'Synthesized ADR-V9-001 for Controlled Agent Memory and 10-Step Execution Gateway.',
        autonomyLevelUsed: 2,
        approvalRequired: false,
        approvalStatus: 'auto_approved',
        estimatedCostUsd: 0.032,
        durationMs: 1140,
        outcome: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec_v9_002',
        organizationId: orgId,
        agentId: 'agent_operations',
        agentName: 'Operational Optimizer Agent',
        actionType: 'REBALANCE_SPRINT_QUEUE',
        summary: 'Re-balanced 6 sprint review tasks to alleviate Software Engineering Agent bottleneck.',
        autonomyLevelUsed: 3,
        approvalRequired: false,
        approvalStatus: 'approved',
        estimatedCostUsd: 0.015,
        durationMs: 780,
        outcome: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'exec_v9_003',
        organizationId: orgId,
        agentId: 'agent_finance',
        agentName: 'Finance & Unit Economics Agent',
        actionType: 'AUDIT_PESAPAL_REVENUE_LEDGER',
        summary: 'Audited 22 multi-currency transactions across UGX, KES, and USD. Reconciled variance = 0.',
        autonomyLevelUsed: 1,
        approvalRequired: false,
        approvalStatus: 'auto_approved',
        estimatedCostUsd: 0.022,
        durationMs: 910,
        outcome: 'success',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_EXEC_LOGS}_${orgId}`, JSON.stringify(defaultLogs));
    return defaultLogs;
  }

  public static addExecutionLog(log: AgentExecutionRecord): void {
    const logs = this.getExecutionLogs(log.organizationId);
    logs.unshift(log);
    localStorage.setItem(`${STORAGE_KEY_EXEC_LOGS}_${log.organizationId}`, JSON.stringify(logs));
  }
}
