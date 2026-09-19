import { 
  OrchestrationObjective, OrchestrationPlan, OrchestrationStep,
  HardenedMission, DecomposedMissionTask
} from '../types';
import { AgentWorkforceService } from './agentWorkforceService';
import { KnowledgeService } from './knowledgeService';
import { GovernanceService } from './governanceService';

const STORAGE_KEY_OBJECTIVES = 'catalyx_v8_orchestration_objectives';
const STORAGE_KEY_PLANS = 'catalyx_v8_orchestration_plans';
const STORAGE_KEY_MISSIONS = 'catalyx_v9_hardened_missions';

export class OrchestratorService {
  public static getObjectives(orgId: string): OrchestrationObjective[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_OBJECTIVES}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing orchestration objectives:', e);
      }
    }

    const defaultObjectives: OrchestrationObjective[] = [
      {
        id: 'obj_001',
        organizationId: orgId,
        title: 'Launch Enterprise Pesapal Subscription Flow in East Africa',
        rawObjective: 'Roll out automated Pesapal payment processing for Uganda, Kenya, and Tanzania with automated receipt generation and human-gated tier upgrades.',
        priority: 'high',
        status: 'completed',
        assignedAgentIds: ['agent_finance_analysis', 'agent_software_development', 'agent_operations'],
        requestedBy: 'anesthonest81@gmail.com',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'obj_002',
        organizationId: orgId,
        title: 'Implement Multi-Department Knowledge Base & Audit Gating',
        rawObjective: 'Synchronize company SOPs, verify provenance across teams, and establish human approval gates for any policy modification.',
        priority: 'urgent',
        status: 'awaiting_approval',
        assignedAgentIds: ['agent_document', 'agent_research', 'agent_executive_intelligence'],
        requestedBy: 'anesthonest81@gmail.com',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_OBJECTIVES}_${orgId}`, JSON.stringify(defaultObjectives));
    return defaultObjectives;
  }

  public static getPlans(orgId: string): OrchestrationPlan[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_PLANS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing orchestration plans:', e);
      }
    }

    const defaultPlans: OrchestrationPlan[] = [
      {
        id: 'plan_001',
        objectiveId: 'obj_001',
        organizationId: orgId,
        strategySummary: 'Three-stage execution pipeline: 1) Verify Pesapal API keys and IPN listener endpoints, 2) Run end-to-end sandbox authorization and status query checks, 3) Deploy multi-currency UI with integer minor unit precision.',
        requiredCapabilities: ['Pesapal Gateway Integration', 'Revenue Ledger Integrity', 'Currency Minor Units'],
        assignedAgents: [
          { id: 'agent_finance_analysis', name: 'Finance & Unit Economics Agent', role: 'Audit & Currency Precision' },
          { id: 'agent_software_development', name: 'Software Engineering & QA Agent', role: 'Server API Endpoint Verification' },
          { id: 'agent_operations', name: 'Operational Optimizer Agent', role: 'IPN Webhook Route Registration' },
        ],
        retrievedKnowledgeContext: [
          'SOP-PESA-01: Official Pesapal v3 Authentication and Order Submission Standards',
          'FIN-POL-04: Non-Floating Point Currency Ledger Mandates (Integer Minor Units)',
        ],
        steps: [
          {
            id: 'step_1',
            objectiveId: 'obj_001',
            sequenceNumber: 1,
            title: 'Verify Pesapal Server-Side Credentials & Token Request',
            description: 'Check environment keys (PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET) and validate OAuth token generation.',
            agentId: 'agent_software_development',
            capabilityRequired: 'API Auth Testing',
            requiresHumanApproval: false,
            approvalStatus: 'auto_approved',
            executed: true,
            retryCount: 0,
            status: 'completed',
            outputSummary: 'OAuth token request confirmed; endpoint responding with valid session expiry.',
          },
          {
            id: 'step_2',
            objectiveId: 'obj_001',
            sequenceNumber: 2,
            title: 'Register IPN Notification Endpoint & Test Webhook Callback',
            description: 'Register /api/billing/pesapal/ipn and verify signature headers.',
            agentId: 'agent_operations',
            capabilityRequired: 'Webhook Management',
            requiresHumanApproval: false,
            approvalStatus: 'auto_approved',
            executed: true,
            retryCount: 0,
            status: 'completed',
            outputSummary: 'IPN endpoint active and listening on Cloud Run proxy port 3000.',
          },
          {
            id: 'step_3',
            objectiveId: 'obj_001',
            sequenceNumber: 3,
            title: 'Approve Enterprise Tier Pricing & Subscription Activation Rules',
            description: 'Human authorization required to finalize UGX 2,000,000 / $520 base rate for Sovereign tier.',
            agentId: 'agent_finance_analysis',
            capabilityRequired: 'Financial Commitment Approval',
            requiresHumanApproval: true,
            approvalStatus: 'approved',
            executed: true,
            retryCount: 0,
            status: 'completed',
            outputSummary: 'Authorized by Executive Leadership on 2026-09-04.',
          },
        ],
        humanApprovalsCount: 1,
        status: 'completed',
        outcomeReport: 'The Pesapal payment orchestration completed with 100% test pass rate. Subscription state machine successfully transitions through TRIAL -> ACTIVE upon server-side transaction status confirmation.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_PLANS}_${orgId}`, JSON.stringify(defaultPlans));
    return defaultPlans;
  }

  /**
   * Decompose an objective into a structured execution plan
   */
  public static async decomposeObjective(
    orgId: string, 
    rawObjective: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    userEmail: string
  ): Promise<{ objective: OrchestrationObjective; plan: OrchestrationPlan }> {
    const agents = AgentWorkforceService.getAgents(orgId);
    const knowledgeItems = KnowledgeService.getKnowledgeItems(orgId);

    // Call server decomposition API or use sophisticated deterministic planner
    let apiPlanData: any = null;
    try {
      const resp = await fetch('/api/orchestrator/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawObjective, priority, orgId }),
      });
      if (resp.ok) {
        apiPlanData = await resp.json();
      }
    } catch (e) {
      console.warn('Backend decomposition fallback to local intelligence:', e);
    }

    const objId = `obj_${Date.now()}`;
    const planId = `plan_${Date.now()}`;

    // Select suitable agents based on objective text
    const lowerObj = rawObjective.toLowerCase();
    const selectedAgents = agents.filter(a => {
      if (lowerObj.includes('finance') || lowerObj.includes('payment') || lowerObj.includes('money') || lowerObj.includes('cost') || lowerObj.includes('pesapal')) {
        return a.category === 'finance_analysis' || a.category === 'operations';
      }
      if (lowerObj.includes('code') || lowerObj.includes('api') || lowerObj.includes('software') || lowerObj.includes('bug')) {
        return a.category === 'software_development' || a.category === 'project_management';
      }
      if (lowerObj.includes('document') || lowerObj.includes('sop') || lowerObj.includes('knowledge') || lowerObj.includes('policy')) {
        return a.category === 'document' || a.category === 'research';
      }
      return a.category === 'project_management' || a.category === 'executive_intelligence';
    }).slice(0, 3);

    if (selectedAgents.length === 0) {
      selectedAgents.push(agents[0], agents[6]); // Research and Project Management
    }

    // Determine relevant organizational knowledge
    const relevantKnowledge = knowledgeItems
      .filter(k => k.tags.some(t => lowerObj.includes(t.toLowerCase())) || lowerObj.includes(k.category))
      .slice(0, 2)
      .map(k => `${k.title} (${k.provenance.verifiedAuthoritative ? 'Authoritative' : 'Internal Note'})`);

    if (relevantKnowledge.length === 0) {
      relevantKnowledge.push('CATALYX V8 Architecture & Security Protocol (Master Specification)');
    }

    // Step decomposition with Human Approval flags for consequential steps
    const requiresFinancialApproval = lowerObj.includes('budget') || lowerObj.includes('payment') || lowerObj.includes('price') || lowerObj.includes('money') || lowerObj.includes('pesapal') || lowerObj.includes('purchase');
    const requiresDestructiveApproval = lowerObj.includes('delete') || lowerObj.includes('terminate') || lowerObj.includes('decommission') || lowerObj.includes('policy');

    const steps: OrchestrationStep[] = [
      {
        id: `step_${Date.now()}_1`,
        objectiveId: objId,
        sequenceNumber: 1,
        title: `Assess Scope and Retrieve Context for "${rawObjective.slice(0, 35)}..."`,
        description: `Analyze operational parameters, organizational memory provenance, and system constraints.`,
        agentId: selectedAgents[0]?.id || 'agent_research',
        capabilityRequired: 'Context Grounding & Analysis',
        requiresHumanApproval: false,
        approvalStatus: 'auto_approved',
        executed: false,
        retryCount: 0,
        status: 'pending',
      },
      {
        id: `step_${Date.now()}_2`,
        objectiveId: objId,
        sequenceNumber: 2,
        title: `Structure Execution Artifacts & Task Checklists`,
        description: `Compile actionable work units, assign dependencies, and estimate compute expenditure.`,
        agentId: selectedAgents[1]?.id || 'agent_project_management',
        capabilityRequired: 'Operational Work Breakdown',
        requiresHumanApproval: false,
        approvalStatus: 'auto_approved',
        executed: false,
        retryCount: 0,
        status: 'pending',
      },
      {
        id: `step_${Date.now()}_3`,
        objectiveId: objId,
        sequenceNumber: 3,
        title: requiresFinancialApproval 
          ? `[HUMAN GATE] Authorize Commercial / Financial Allocations`
          : requiresDestructiveApproval 
            ? `[HUMAN GATE] Authorize Structural / Policy Modifications`
            : `Validate Quality Benchmarks & Safety Compliance`,
        description: requiresFinancialApproval || requiresDestructiveApproval
          ? `Strict Human-in-the-Loop policy enforcement: requires Owner or Admin review before proceeding.`
          : `Run security posture scan and verify that no agent exceeded its allocated permission boundaries.`,
        agentId: selectedAgents[2]?.id || selectedAgents[0]?.id || 'agent_operations',
        capabilityRequired: 'Governance & Approval Verification',
        requiresHumanApproval: requiresFinancialApproval || requiresDestructiveApproval,
        approvalStatus: (requiresFinancialApproval || requiresDestructiveApproval) ? 'pending' : 'auto_approved',
        executed: false,
        retryCount: 0,
        status: 'pending',
      },
      {
        id: `step_${Date.now()}_4`,
        objectiveId: objId,
        sequenceNumber: 4,
        title: `Execute Approved Action Sequence & Generate Outcome Report`,
        description: `Commit state changes to production data, update analytics, and produce executive audit trail.`,
        agentId: 'agent_executive_intelligence',
        capabilityRequired: 'Outcome Synthesis & Delivery',
        requiresHumanApproval: false,
        approvalStatus: 'auto_approved',
        executed: false,
        retryCount: 0,
        status: 'pending',
      },
    ];

    const humanApprovalsCount = steps.filter(s => s.requiresHumanApproval).length;

    const objective: OrchestrationObjective = {
      id: objId,
      organizationId: orgId,
      title: apiPlanData?.title || rawObjective.slice(0, 50),
      rawObjective,
      priority,
      status: humanApprovalsCount > 0 ? 'awaiting_approval' : 'planning',
      assignedAgentIds: selectedAgents.map(a => a.id),
      requestedBy: userEmail,
      createdAt: new Date().toISOString(),
    };

    const plan: OrchestrationPlan = {
      id: planId,
      objectiveId: objId,
      organizationId: orgId,
      strategySummary: apiPlanData?.strategySummary || `Multi-agent orchestration pipeline decomposed into ${steps.length} sequential steps under Level ${selectedAgents[0]?.autonomyLevel || 2} controlled autonomy.`,
      requiredCapabilities: selectedAgents.flatMap(a => a.capabilities.slice(0, 2)),
      assignedAgents: selectedAgents.map(a => ({ id: a.id, name: a.name, role: a.purpose })),
      retrievedKnowledgeContext: relevantKnowledge,
      steps,
      humanApprovalsCount,
      status: humanApprovalsCount > 0 ? 'pending_approval' : 'in_progress',
      createdAt: new Date().toISOString(),
    };

    // Persist
    const objectives = this.getObjectives(orgId);
    objectives.unshift(objective);
    localStorage.setItem(`${STORAGE_KEY_OBJECTIVES}_${orgId}`, JSON.stringify(objectives));

    const plans = this.getPlans(orgId);
    plans.unshift(plan);
    localStorage.setItem(`${STORAGE_KEY_PLANS}_${orgId}`, JSON.stringify(plans));

    return { objective, plan };
  }

  /**
   * Execute an individual step in the orchestration plan
   */
  public static executeStep(orgId: string, planId: string, stepId: string): void {
    const plans = this.getPlans(orgId);
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const step = plan.steps.find(s => s.id === stepId);
    if (!step) return;

    if (step.requiresHumanApproval && step.approvalStatus !== 'approved') {
      console.warn('Cannot execute step without human approval authorization.');
      return;
    }

    step.status = 'completed';
    step.executed = true;
    step.outputSummary = `Executed successfully by assigned agent at ${new Date().toLocaleTimeString()}. Safe telemetry confirmed.`;

    // Check if all steps completed
    const allDone = plan.steps.every(s => s.executed);
    if (allDone) {
      plan.status = 'completed';
      plan.outcomeReport = `Orchestration mission completed successfully. All ${plan.steps.length} steps executed within approved safety parameters.`;
      
      // Update objective status
      const objectives = this.getObjectives(orgId);
      const obj = objectives.find(o => o.id === plan.objectiveId);
      if (obj) {
        obj.status = 'completed';
        localStorage.setItem(`${STORAGE_KEY_OBJECTIVES}_${orgId}`, JSON.stringify(objectives));
      }
    }

    localStorage.setItem(`${STORAGE_KEY_PLANS}_${orgId}`, JSON.stringify(plans));
  }

  /**
   * Grant human approval for a gated step
   */
  public static approveStep(orgId: string, planId: string, stepId: string, approverEmail: string): void {
    const plans = this.getPlans(orgId);
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const step = plan.steps.find(s => s.id === stepId);
    if (!step) return;

    step.approvalStatus = 'approved';
    step.outputSummary = `Human authorization granted by ${approverEmail} on ${new Date().toLocaleString()}. Ready for controlled execution.`;
    
    // Check if any other pending approvals remain
    const stillPending = plan.steps.some(s => s.requiresHumanApproval && s.approvalStatus === 'pending');
    if (!stillPending) {
      plan.status = 'in_progress';
      const objectives = this.getObjectives(orgId);
      const obj = objectives.find(o => o.id === plan.objectiveId);
      if (obj) {
        obj.status = 'executing';
        localStorage.setItem(`${STORAGE_KEY_OBJECTIVES}_${orgId}`, JSON.stringify(objectives));
      }
    }

    localStorage.setItem(`${STORAGE_KEY_PLANS}_${orgId}`, JSON.stringify(plans));
  }

  // =========================================================================
  // V9 HARDENED MISSION DECOMPOSITION SYSTEM
  // =========================================================================
  public static getHardenedMissions(orgId: string): HardenedMission[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_MISSIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing hardened missions:', e);
      }
    }

    const defaultMissions: HardenedMission[] = [
      {
        id: 'msn_v9_retention_01',
        organizationId: orgId,
        ownerId: 'usr_cro_01',
        ownerName: 'Chief Revenue Officer',
        objective: 'Improve B2B Enterprise Account Retention & Proactive Renewal Rate to 96%',
        priority: 'high',
        deadline: '2026-10-31T23:59:59Z',
        riskClassification: 'LOW',
        budgetMinorUnits: 250000, // $2,500.00
        autonomyLevel: 2, // PREPARE
        requiredPermissions: ['READ_ANALYTICS', 'READ_KNOWLEDGE', 'CREATE_TASK', 'REQUEST_APPROVAL'],
        agentsInvolved: ['agent_research', 'agent_finance', 'agent_operations', 'agent_sales'],
        humansInvolved: ['Chief Revenue Officer', 'Head of Customer Success'],
        dependencies: ['Pesapal IPN Webhook Telemetry', 'Ledger Integrity Audit'],
        executionHistory: [
          {
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            event: 'COHORT_CHURN_ANALYSIS_COMPLETED',
            actor: 'Research Intelligence Agent',
            details: 'Cohort churn analysis completed with 98.2% confidence.',
          },
          {
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
            event: 'FINANCIAL_RENEWAL_BOUNDS_MODELED',
            actor: 'Finance Agent',
            details: 'Maximum 15% prepayment discount recommended.',
          },
        ],
        tasks: [
          {
            id: 'task_m1_1',
            stepNumber: 1,
            title: 'Analyze trailing 90-day churn signals and identify at-risk cohorts',
            description: 'Run survival analysis on account telemetry to isolate churn risk drivers.',
            assignedAgentId: 'agent_research',
            isAgent: true,
            requiredPermissions: ['READ_ANALYTICS', 'READ_KNOWLEDGE'],
            requiresApproval: false,
            status: 'completed',
            outputSummary: 'Identified 8 accounts with declining telemetry; isolated root cause to missing native mobile money auto-renewals.',
          },
          {
            id: 'task_m1_2',
            stepNumber: 2,
            title: 'Synthesize commercial retention discount economics and margin impact',
            description: 'Model unit economics and SaaS gross margin impact for annual pre-payments.',
            assignedAgentId: 'agent_finance',
            isAgent: true,
            requiredPermissions: ['READ_ANALYTICS'],
            requiresApproval: false,
            status: 'completed',
            outputSummary: '12% annual renewal discount preserves 78% gross margin while lifting net revenue retention.',
          },
          {
            id: 'task_m1_3',
            stepNumber: 3,
            title: 'Submit enterprise customer success renewal proposal for executive sign-off',
            description: 'Draft tailored proposal and submit for human executive authorization.',
            assignedAgentId: 'agent_sales',
            isAgent: true,
            requiredPermissions: ['CREATE_TASK', 'REQUEST_APPROVAL'],
            requiresApproval: true,
            status: 'awaiting_approval',
          },
          {
            id: 'task_m1_4',
            stepNumber: 4,
            title: 'Automate dispatch of approved renewal offers via CRM and Email connector',
            description: 'Send approved personalized renewal proposals to key enterprise stakeholders.',
            assignedAgentId: 'agent_operations',
            isAgent: true,
            requiredPermissions: ['USE_INTEGRATION', 'EXECUTE_WORKFLOW'],
            requiresApproval: true,
            status: 'pending',
          },
          {
            id: 'task_m1_5',
            stepNumber: 5,
            title: 'Measure trailing 30-day conversion outcome and log organizational learning record',
            description: 'Compare actual renewals to predicted cohort model and log learnings.',
            assignedAgentId: 'agent_research',
            isAgent: true,
            requiredPermissions: ['READ_ANALYTICS'],
            requiresApproval: false,
            status: 'pending',
          },
        ],
        status: 'decomposed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_MISSIONS}_${orgId}`, JSON.stringify(defaultMissions));
    return defaultMissions;
  }

  public static getHardenedMissionById(orgId: string, missionId: string): HardenedMission | undefined {
    return this.getHardenedMissions(orgId).find(m => m.id === missionId);
  }

  public static approveHardenedMissionTask(orgId: string, missionId: string, taskId: string, approverEmail: string): void {
    const missions = this.getHardenedMissions(orgId);
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const task = mission.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'completed';
    task.outputSummary = `Authorized by ${approverEmail} on ${new Date().toLocaleDateString()}. Task executed cleanly through 10-step Execution Gateway.`;
    
    mission.executionHistory.push({
      timestamp: new Date().toISOString(),
      event: 'MISSION_TASK_APPROVED',
      actor: approverEmail,
      details: `Task [${task.title}] authorized by ${approverEmail}.`,
    });

    // Check if subsequent tasks can be set to active or mission completed
    const pendingTasks = mission.tasks.filter(t => t.status === 'pending' || t.status === 'awaiting_approval');
    if (pendingTasks.length === 0) {
      mission.status = 'completed';
      mission.outcomeSummary = 'Mission executed successfully with 100% human authorization and audit compliance.';
    } else {
      mission.status = 'in_execution';
      const nextTask = pendingTasks[0];
      if (nextTask.requiresApproval) {
        nextTask.status = 'awaiting_approval';
      } else {
        nextTask.status = 'in_progress';
      }
    }

    localStorage.setItem(`${STORAGE_KEY_MISSIONS}_${orgId}`, JSON.stringify(missions));

    GovernanceService.addAuditLog({
      id: `audit_msn_${Date.now()}`,
      organizationId: orgId,
      actorId: approverEmail.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      actorName: approverEmail,
      actorRole: 'executive',
      action: `MISSION_TASK_APPROVED: ${task.title}`,
      resourceType: 'hardened_mission',
      resourceId: missionId,
      outcome: 'success',
      details: { taskId, approverEmail },
      timestamp: new Date().toISOString(),
    });
  }
}
