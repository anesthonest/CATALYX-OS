import {
  AgentEconomicMetrics,
  UnifiedWorkforceResource,
  TaskDispatchPlan,
  ExecutionResourceType
} from '../types';

class UnifiedWorkforceService {
  private agentMetrics: AgentEconomicMetrics[] = [
    {
      agentId: 'agent-strategic',
      agentName: 'Strategic Agent',
      specialization: 'Enterprise OKR Lineage & Roadmap Breakdown',
      utilizationRate: 0.74,
      successRate: 0.98,
      failureRate: 0.02,
      averageLatencyMs: 840,
      costPerTaskMinorUnits: 12, // $0.12
      totalCostIncurredMinorUnits: 18400, // $184.00
      valueGeneratedMinorUnits: 1420000, // $14,200.00 estimated strategic velocity
      roiMultiplier: 77.1,
      reliabilityScore: 0.99,
      taskComplexityTiers: ['HIGH', 'CRITICAL'],
      outcomeQualityScore: 96,
      efficiencyTrend: 'IMPROVING',
    },
    {
      agentId: 'agent-operations',
      agentName: 'Operations Agent',
      specialization: 'Queue Automation & Operational Optimization',
      utilizationRate: 0.88,
      successRate: 0.99,
      failureRate: 0.01,
      averageLatencyMs: 320,
      costPerTaskMinorUnits: 4, // $0.04
      totalCostIncurredMinorUnits: 29800,
      valueGeneratedMinorUnits: 2150000,
      roiMultiplier: 72.1,
      reliabilityScore: 0.99,
      taskComplexityTiers: ['LOW', 'MEDIUM', 'HIGH'],
      outcomeQualityScore: 94,
      efficiencyTrend: 'STABLE',
    },
    {
      agentId: 'agent-research',
      agentName: 'Research & Grounding Agent',
      specialization: 'Deep Document & SOP Grounding Embeddings',
      utilizationRate: 0.68,
      successRate: 0.96,
      failureRate: 0.04,
      averageLatencyMs: 1240,
      costPerTaskMinorUnits: 18,
      totalCostIncurredMinorUnits: 21000,
      valueGeneratedMinorUnits: 980000,
      roiMultiplier: 46.6,
      reliabilityScore: 0.96,
      taskComplexityTiers: ['MEDIUM', 'HIGH'],
      outcomeQualityScore: 91,
      efficiencyTrend: 'STABLE',
    },
    {
      agentId: 'agent-financial',
      agentName: 'Financial Agent',
      specialization: 'SaaS Economics & Capacity Allocation',
      utilizationRate: 0.62,
      successRate: 0.99,
      failureRate: 0.01,
      averageLatencyMs: 510,
      costPerTaskMinorUnits: 8,
      totalCostIncurredMinorUnits: 9400,
      valueGeneratedMinorUnits: 1850000,
      roiMultiplier: 196.8,
      reliabilityScore: 0.99,
      taskComplexityTiers: ['HIGH', 'CRITICAL'],
      outcomeQualityScore: 98,
      efficiencyTrend: 'IMPROVING',
    },
    {
      agentId: 'agent-risk',
      agentName: 'Risk & Burnout Guardian Agent',
      specialization: 'Threat Audit & Velocity Burnout Sentinel',
      utilizationRate: 0.81,
      successRate: 0.97,
      failureRate: 0.03,
      averageLatencyMs: 410,
      costPerTaskMinorUnits: 6,
      totalCostIncurredMinorUnits: 14200,
      valueGeneratedMinorUnits: 1240000,
      roiMultiplier: 87.3,
      reliabilityScore: 0.98,
      taskComplexityTiers: ['MEDIUM', 'HIGH', 'CRITICAL'],
      outcomeQualityScore: 95,
      efficiencyTrend: 'IMPROVING',
    }
  ];

  private unifiedResources: UnifiedWorkforceResource[] = [
    {
      resourceId: 'res-human-01',
      name: 'Elena Rostova (Lead Architect)',
      type: 'HUMAN',
      roleOrSkill: 'Distributed Systems & Database Governance',
      availability: 'AVAILABLE',
      permissionsLevel: 'CRITICAL_SYSTEMS',
      unitCostMinorUnits: 9500, // $95.00/hr
      riskProfile: 'MINIMAL',
      laborPolicyGuaranteed: true,
    },
    {
      resourceId: 'res-human-02',
      name: 'Marcus Vance (FinOps Director)',
      type: 'HUMAN',
      roleOrSkill: 'Financial Audit & Commercial Ledger Sign-off',
      availability: 'AVAILABLE',
      permissionsLevel: 'CRITICAL_SYSTEMS',
      unitCostMinorUnits: 11000, // $110.00/hr
      riskProfile: 'MINIMAL',
      laborPolicyGuaranteed: true,
    },
    {
      resourceId: 'res-ai-01',
      name: 'CATALYX Operations Agent',
      type: 'AI_AGENT',
      roleOrSkill: 'Queue Routing, Self-Healing & Telemetry Triage',
      availability: 'AVAILABLE',
      permissionsLevel: 'STANDARD',
      unitCostMinorUnits: 4, // $0.04/action
      riskProfile: 'LOW',
      laborPolicyGuaranteed: true,
    },
    {
      resourceId: 'res-ai-02',
      name: 'CATALYX Strategic Agent',
      type: 'AI_AGENT',
      roleOrSkill: 'OKR Synthesis & Mission Decomposition',
      availability: 'AVAILABLE',
      permissionsLevel: 'ELEVATED',
      unitCostMinorUnits: 12,
      riskProfile: 'LOW',
      laborPolicyGuaranteed: true,
    },
    {
      resourceId: 'res-auto-01',
      name: 'Git Webhook CI/CD Dispatcher',
      type: 'AUTOMATION',
      roleOrSkill: 'Deterministic Build & Test Pipeline',
      availability: 'AVAILABLE',
      permissionsLevel: 'STANDARD',
      unitCostMinorUnits: 1, // $0.01/run
      riskProfile: 'MINIMAL',
      laborPolicyGuaranteed: true,
    },
    {
      resourceId: 'res-ext-01',
      name: 'Pesapal IPN Settlement Gateway',
      type: 'EXTERNAL_SERVICE',
      roleOrSkill: 'Regional Mobile Money & Card Clearing',
      availability: 'AVAILABLE',
      permissionsLevel: 'CRITICAL_SYSTEMS',
      unitCostMinorUnits: 250, // $2.50 flat/settlement
      riskProfile: 'LOW',
      laborPolicyGuaranteed: true,
    }
  ];

  private taskDispatches: TaskDispatchPlan[] = [
    {
      taskId: 'task-disp-01',
      taskName: 'Daily Ingress Log Anomaly Scan',
      urgency: 'ROUTINE',
      complexity: 'LOW',
      assignedResourceType: 'AI_AGENT',
      assignedResourceId: 'res-ai-01',
      assignedResourceName: 'CATALYX Operations Agent',
      economicJustification: 'AI Agent accomplishes 500k-log pattern extraction in 1.4s at $0.04 cost vs 45 human minutes at $71.25.',
      estimatedCostMinorUnits: 4,
      humanSupervisionRequired: false,
    },
    {
      taskId: 'task-disp-02',
      taskName: 'Production Database Primary Failover Approval',
      urgency: 'CRITICAL',
      complexity: 'HIGH',
      assignedResourceType: 'HUMAN',
      assignedResourceId: 'res-human-01',
      assignedResourceName: 'Elena Rostova (Lead Architect)',
      economicJustification: 'High-blast-radius infrastructure state mutation requires human accountability under CATALYX Safety Gate policy.',
      estimatedCostMinorUnits: 9500,
      humanSupervisionRequired: true,
    },
    {
      taskId: 'task-disp-03',
      taskName: 'Automated Test Matrix Execution on PR Submit',
      urgency: 'ROUTINE',
      complexity: 'LOW',
      assignedResourceType: 'AUTOMATION',
      assignedResourceId: 'res-auto-01',
      assignedResourceName: 'Git Webhook CI/CD Dispatcher',
      economicJustification: 'Deterministic rule engine with zero model hallucination risk at lowest cost.',
      estimatedCostMinorUnits: 1,
      humanSupervisionRequired: false,
    }
  ];

  public getAgentMetrics(): AgentEconomicMetrics[] {
    return this.agentMetrics;
  }

  public getUnifiedResources(): UnifiedWorkforceResource[] {
    return this.unifiedResources;
  }

  public getTaskDispatches(): TaskDispatchPlan[] {
    return this.taskDispatches;
  }

  public dispatchTask(task: {
    taskName: string;
    urgency: 'ROUTINE' | 'HIGH' | 'CRITICAL';
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  }): TaskDispatchPlan {
    // Intelligent dispatch decision tree
    let assignedType: ExecutionResourceType = 'AI_AGENT';
    let assignedId = 'res-ai-01';
    let assignedName = 'CATALYX Operations Agent';
    let cost = 4;
    let justification = 'Automated AI execution chosen for fast turnaround and optimal cost efficiency.';
    let humanSupervision = false;

    if (task.urgency === 'CRITICAL' || task.complexity === 'HIGH') {
      assignedType = 'HUMAN';
      assignedId = 'res-human-01';
      assignedName = 'Elena Rostova (Lead Architect)';
      cost = 9500;
      justification = 'Critical operational risk mandates human governance and supervision under policy.';
      humanSupervision = true;
    } else if (task.urgency === 'ROUTINE' && task.complexity === 'LOW') {
      assignedType = 'AUTOMATION';
      assignedId = 'res-auto-01';
      assignedName = 'Git Webhook CI/CD Dispatcher';
      cost = 1;
      justification = 'Deterministic automation pipeline chosen for lowest cost and zero variance.';
    }

    const newDispatch: TaskDispatchPlan = {
      taskId: `disp-${Date.now().toString(36)}`,
      taskName: task.taskName,
      urgency: task.urgency,
      complexity: task.complexity,
      assignedResourceType: assignedType,
      assignedResourceId: assignedId,
      assignedResourceName: assignedName,
      economicJustification: justification,
      estimatedCostMinorUnits: cost,
      humanSupervisionRequired: humanSupervision,
    };

    this.taskDispatches.unshift(newDispatch);
    return newDispatch;
  }
}

export const unifiedWorkforceService = new UnifiedWorkforceService();
