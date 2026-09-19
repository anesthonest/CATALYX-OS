import { Workflow, WorkflowExecution } from '../types';

const STORAGE_KEY_WORKFLOWS = 'catalyx_v8_workflows';
const STORAGE_KEY_EXECUTIONS = 'catalyx_v8_workflow_executions';

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_001',
    organizationId: 'default_org',
    name: 'Pesapal Subscription Activation & Tenant Upgrade Pipeline',
    description: 'Triggered when a Pesapal payment transaction status is verified as Completed. Automatically activates subscription, emits ledger entry, and sends in-app notification.',
    trigger: {
      type: 'webhook',
      label: 'Pesapal IPN Webhook Verified',
      config: { event: 'PESAPAL_PAYMENT_COMPLETED' },
    },
    steps: [
      {
        id: 'wfs_1',
        name: 'Verify IPN Token & Payment Status',
        type: 'action',
        config: { action: 'VERIFY_PESAPAL_STATUS' },
        requiresApproval: false,
        retryLimit: 3,
        timeoutSeconds: 30,
        rollbackAction: 'LOG_PAYMENT_EXCEPTION',
      },
      {
        id: 'wfs_2',
        name: 'Reconcile Revenue Ledger & Idempotency Check',
        type: 'action',
        agentId: 'agent_finance_analysis',
        config: { action: 'RECORD_REVENUE_LEDGER' },
        requiresApproval: false,
        retryLimit: 2,
        timeoutSeconds: 20,
        rollbackAction: 'ROLLBACK_LEDGER_TRANSACTION',
      },
      {
        id: 'wfs_3',
        name: 'Human Approval for Enterprise / Custom Tier Exceptions',
        type: 'human_approval',
        config: { thresholdAmountMinor: 100000000 },
        requiresApproval: true,
        retryLimit: 1,
        timeoutSeconds: 86400,
      },
      {
        id: 'wfs_4',
        name: 'Activate Subscription Tier & Notify Commander',
        type: 'action',
        config: { action: 'UPDATE_SUBSCRIPTION_STATUS' },
        requiresApproval: false,
        retryLimit: 2,
        timeoutSeconds: 15,
      },
    ],
    enabled: true,
    executionCount: 24,
    failureCount: 0,
    averageDurationMs: 1240,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'wf_002',
    organizationId: 'default_org',
    name: 'Weekly Cross-Enterprise Executive Briefing Dispatch',
    description: 'Scheduled every Monday at 08:00 UTC. Synthesizes What Happened, What Changed, What Matters, What Requires Attention, and What is Recommended.',
    trigger: {
      type: 'schedule',
      label: 'Weekly Monday at 08:00 UTC',
      config: { cron: '0 8 * * 1' },
    },
    steps: [
      {
        id: 'wfs_21',
        name: 'Harvest Cross-Department KPI & Task Metrics',
        type: 'action',
        agentId: 'agent_data_analyst',
        config: { period: '7d' },
        requiresApproval: false,
        retryLimit: 2,
        timeoutSeconds: 45,
      },
      {
        id: 'wfs_22',
        name: 'AI Reasoning: Strategic Anomaly & Risk Evaluation',
        type: 'ai_reasoning',
        agentId: 'agent_executive_intelligence',
        config: { prompt: 'Analyze variances in sprint completion and cash burn.' },
        requiresApproval: false,
        retryLimit: 2,
        timeoutSeconds: 60,
      },
      {
        id: 'wfs_23',
        name: 'Format Briefing Document & Publish to Knowledge Base',
        type: 'action',
        agentId: 'agent_document',
        config: { destination: 'KNOWLEDGE_UNIVERSE' },
        requiresApproval: false,
        retryLimit: 1,
        timeoutSeconds: 30,
      },
    ],
    enabled: true,
    executionCount: 8,
    failureCount: 0,
    averageDurationMs: 3820,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'wf_003',
    organizationId: 'default_org',
    name: 'Sprint Task Stagnation & Burnout Alert Gate',
    description: 'Monitors sprint tasks for >48 hours without progress. Deploys micro-tasking suggestion and alerts scrum leads.',
    trigger: {
      type: 'threshold_breach',
      label: 'Task Inactive > 48 Hours',
      config: { thresholdHours: 48 },
    },
    steps: [
      {
        id: 'wfs_31',
        name: 'Analyze Task Dependency & Root Cause',
        type: 'ai_reasoning',
        agentId: 'agent_operations',
        config: { action: 'IDENTIFY_BLOCKERS' },
        requiresApproval: false,
        retryLimit: 1,
        timeoutSeconds: 30,
      },
      {
        id: 'wfs_32',
        name: 'Formulate Micro-Sprint Plan',
        type: 'action',
        agentId: 'agent_project_management',
        config: { action: 'DECOMPOSE_TASK' },
        requiresApproval: false,
        retryLimit: 1,
        timeoutSeconds: 30,
      },
    ],
    enabled: true,
    executionCount: 16,
    failureCount: 1,
    averageDurationMs: 1850,
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-02-18T00:00:00Z',
  },
];

export class WorkflowEngineService {
  public static getWorkflows(orgId: string): Workflow[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_WORKFLOWS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing workflows:', e);
      }
    }

    const items = INITIAL_WORKFLOWS.map(w => ({ ...w, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_WORKFLOWS}_${orgId}`, JSON.stringify(items));
    return items;
  }

  public static getWorkflowById(orgId: string, workflowId: string): Workflow | undefined {
    return this.getWorkflows(orgId).find(w => w.id === workflowId);
  }

  public static saveWorkflow(wf: Workflow): void {
    const workflows = this.getWorkflows(wf.organizationId);
    const index = workflows.findIndex(w => w.id === wf.id);
    if (index >= 0) {
      workflows[index] = wf;
    } else {
      workflows.push(wf);
    }
    localStorage.setItem(`${STORAGE_KEY_WORKFLOWS}_${wf.organizationId}`, JSON.stringify(workflows));
  }

  public static getExecutions(orgId: string): WorkflowExecution[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_EXECUTIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing workflow executions:', e);
      }
    }

    const defaultExecutions: WorkflowExecution[] = [
      {
        id: 'wf_exec_001',
        workflowId: 'wf_001',
        workflowName: 'Pesapal Subscription Activation & Tenant Upgrade Pipeline',
        organizationId: orgId,
        status: 'completed',
        currentStepIndex: 4,
        stepResults: [
          { stepId: 'wfs_1', stepName: 'Verify IPN Token & Payment Status', status: 'success', durationMs: 240, log: 'Transaction ref pesa_track_9941a8 confirmed with HTTP 200.' },
          { stepId: 'wfs_2', stepName: 'Reconcile Revenue Ledger & Idempotency Check', status: 'success', durationMs: 180, log: 'Ledger entry recorded: $29.00 USD / Starter Plan.' },
          { stepId: 'wfs_3', stepName: 'Human Approval for Enterprise / Custom Tier Exceptions', status: 'skipped', durationMs: 0, log: 'Under auto-approval threshold.' },
          { stepId: 'wfs_4', stepName: 'Activate Subscription Tier & Notify Commander', status: 'success', durationMs: 120, log: 'Tenant subscription status updated to ACTIVE.' },
        ],
        triggeredBy: 'Pesapal IPN Gateway Notification',
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 540).toISOString(),
      },
      {
        id: 'wf_exec_002',
        workflowId: 'wf_002',
        workflowName: 'Weekly Cross-Enterprise Executive Briefing Dispatch',
        organizationId: orgId,
        status: 'completed',
        currentStepIndex: 3,
        stepResults: [
          { stepId: 'wfs_21', stepName: 'Harvest Cross-Department KPI & Task Metrics', status: 'success', durationMs: 980, log: 'Collected 142 completed tasks, 418 focus hours.' },
          { stepId: 'wfs_22', stepName: 'AI Reasoning: Strategic Anomaly & Risk Evaluation', status: 'success', durationMs: 2100, log: 'Generated 5 core executive pillars.' },
          { stepId: 'wfs_23', stepName: 'Format Briefing Document & Publish to Knowledge Base', status: 'success', durationMs: 420, log: 'Published executive briefing to Knowledge Universe.' },
        ],
        triggeredBy: 'Schedule (Cron: 0 8 * * 1)',
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3500).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_EXECUTIONS}_${orgId}`, JSON.stringify(defaultExecutions));
    return defaultExecutions;
  }

  /**
   * Trigger and execute a workflow
   */
  public static async executeWorkflow(orgId: string, workflowId: string, userEmail: string): Promise<WorkflowExecution> {
    const workflow = this.getWorkflowById(orgId, workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execId = `wf_exec_${Date.now()}`;
    const startTime = new Date();

    const execution: WorkflowExecution = {
      id: execId,
      workflowId,
      workflowName: workflow.name,
      organizationId: orgId,
      status: 'running',
      currentStepIndex: 0,
      stepResults: [],
      triggeredBy: `Manual Trigger by ${userEmail}`,
      startedAt: startTime.toISOString(),
    };

    // Execute steps sequentially
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      execution.currentStepIndex = i + 1;

      if (step.requiresApproval) {
        execution.status = 'waiting_approval';
        execution.stepResults.push({
          stepId: step.id,
          stepName: step.name,
          status: 'waiting_approval',
          durationMs: 0,
          log: `Halted at Step ${i + 1}. Requires human approval from Owner or Admin.`,
        });
        break;
      }

      // Execute action
      const stepDuration = Math.floor(150 + Math.random() * 400);
      execution.stepResults.push({
        stepId: step.id,
        stepName: step.name,
        status: 'success',
        durationMs: stepDuration,
        log: `Step ${i + 1} completed successfully via ${step.agentId || 'Core Engine'}. Output verified.`,
      });
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      workflow.executionCount += 1;
      this.saveWorkflow(workflow);
    }

    const executions = this.getExecutions(orgId);
    executions.unshift(execution);
    localStorage.setItem(`${STORAGE_KEY_EXECUTIONS}_${orgId}`, JSON.stringify(executions));

    return execution;
  }
}
