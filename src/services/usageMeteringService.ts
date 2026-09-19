import { DetailedUsageEvent, CurrencyCode, BillableUsage } from '../types';
import { BillingService } from './billingService';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  DETAILED_EVENTS: 'catalyx_v8_detailed_usage_events',
  BUDGET_CONTROLS: 'catalyx_v8_org_budget_controls',
};

export interface BudgetControlConfig {
  organizationId: string;
  monthlyLimitUsd: number;
  dailyLimitUsd: number;
  agentBudgetUsd: number;
  emergencyCutoffTriggered: boolean;
  alertThresholdPercent: number; // e.g. 85%
}

export class UsageMeteringService {
  /**
   * Record a metered usage event with strict idempotency protection
   */
  public static recordEvent(event: DetailedUsageEvent): { recorded: boolean; duplicate: boolean; message: string } {
    const orgId = event.organizationId;
    const events = this.getEvents(orgId);

    // 1. Idempotency Check: prevent duplicate counting of same request/execution
    const existing = events.find(e => e.idempotencyKey === event.idempotencyKey);
    if (existing) {
      return {
        recorded: false,
        duplicate: true,
        message: `Idempotent duplicate usage event suppressed (${event.idempotencyKey}).`,
      };
    }

    // 2. Budget Controls & Emergency Cutoff Check
    const budget = this.getBudgetConfig(orgId);
    if (budget.emergencyCutoffTriggered) {
      return {
        recorded: false,
        duplicate: false,
        message: `Execution blocked: Emergency spending cutoff is ACTIVE for organization ${orgId}.`,
      };
    }

    // 3. Append to persistent ledger of usage events
    events.unshift(event);
    // Keep max 500 recent events per org in local store
    if (events.length > 500) events.pop();
    localStorage.setItem(`${STORAGE_KEYS.DETAILED_EVENTS}_${orgId}`, JSON.stringify(events));

    // 4. Update aggregated billable usage
    const billable = BillingService.getBillableUsage(orgId);
    if (event.resourceType === 'ai_token') {
      billable.aiTokensUsed += event.quantity;
      billable.totalCostEstimatedUsd += (event.quantity / 1000) * 0.002;
    } else if (event.resourceType === 'agent_execution' || event.resourceType === 'mission') {
      billable.agentExecutions += event.quantity;
      billable.totalCostEstimatedUsd += (event.estimatedCostMinorUnits / 100);
    } else if (event.resourceType === 'workflow_execution') {
      billable.workflowRuns += event.quantity;
      billable.totalCostEstimatedUsd += (event.estimatedCostMinorUnits / 100);
    } else if (event.resourceType === 'api_call') {
      billable.apiCallsCount += event.quantity;
      billable.totalCostEstimatedUsd += (event.quantity * 0.0001);
    }

    // 5. Check if threshold reached
    if (billable.totalCostEstimatedUsd >= budget.monthlyLimitUsd * (budget.alertThresholdPercent / 100)) {
      billable.budgetAlertTriggered = true;
      if (billable.totalCostEstimatedUsd >= budget.monthlyLimitUsd) {
        budget.emergencyCutoffTriggered = true;
        this.saveBudgetConfig(budget);

        GovernanceService.addAuditLog({
          id: `audit_cutoff_${Date.now()}`,
          organizationId: orgId,
          actorId: 'usage_metering_engine',
          actorName: 'AI Usage Economy Engine',
          actorRole: 'system',
          action: 'EMERGENCY_SPENDING_CUTOFF_TRIGGERED',
          resourceType: 'billing_budget',
          resourceId: orgId,
          outcome: 'success',
          details: {
            spend: billable.totalCostEstimatedUsd,
            limit: budget.monthlyLimitUsd,
            triggerEvent: event.action,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    localStorage.setItem(`catalyx_v8_usage_${orgId}_${currentMonth}`, JSON.stringify(billable));

    return {
      recorded: true,
      duplicate: false,
      message: `Usage event successfully registered with correlation ID ${event.correlationId}`,
    };
  }

  /**
   * Get detailed usage events for an organization
   */
  public static getEvents(orgId: string): DetailedUsageEvent[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DETAILED_EVENTS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse detailed usage events:', e);
      }
    }

    // Seed realistic audit records
    const now = Date.now();
    const seed: DetailedUsageEvent[] = [
      {
        id: `use_ev_01`,
        idempotencyKey: `idemp_token_sync_01`,
        organizationId: orgId,
        agentId: 'research',
        action: 'Grounding Spec Semantic Ingestion',
        resourceType: 'ai_token',
        quantity: 12500,
        estimatedCostMinorUnits: 25, // $0.25
        currency: 'USD',
        requestId: `req_${now - 100000}`,
        correlationId: `corr_${now - 100000}`,
        billingPeriod: new Date().toISOString().substring(0, 7),
        timestamp: new Date(now - 1200000).toISOString(),
      },
      {
        id: `use_ev_02`,
        idempotencyKey: `idemp_agent_exec_02`,
        organizationId: orgId,
        agentId: 'operations',
        action: 'Autonomous Queue Prioritization Sprints',
        resourceType: 'agent_execution',
        quantity: 4,
        estimatedCostMinorUnits: 40, // $0.40
        currency: 'USD',
        requestId: `req_${now - 80000}`,
        correlationId: `corr_${now - 80000}`,
        billingPeriod: new Date().toISOString().substring(0, 7),
        timestamp: new Date(now - 900000).toISOString(),
      },
      {
        id: `use_ev_03`,
        idempotencyKey: `idemp_workflow_run_03`,
        organizationId: orgId,
        workflowId: 'wf_failover_01',
        action: 'Continuous High-Availability Health Pulse',
        resourceType: 'workflow_execution',
        quantity: 1,
        estimatedCostMinorUnits: 15,
        currency: 'USD',
        requestId: `req_${now - 50000}`,
        correlationId: `corr_${now - 50000}`,
        billingPeriod: new Date().toISOString().substring(0, 7),
        timestamp: new Date(now - 300000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.DETAILED_EVENTS}_${orgId}`, JSON.stringify(seed));
    return seed;
  }

  /**
   * Get AI Usage Economics Breakdown
   */
  public static getAIEconomicsBreakdown(orgId: string): {
    totalSpentUsd: number;
    budgetLimitUsd: number;
    spendingMarginPercent: number;
    costByAgent: Record<string, number>;
    costByResourceType: Record<string, number>;
    anomaliesCount: number;
  } {
    const events = this.getEvents(orgId);
    const budget = this.getBudgetConfig(orgId);

    const costByAgent: Record<string, number> = {};
    const costByResourceType: Record<string, number> = {};
    let totalSpentMinor = 0;
    let anomaliesCount = 0;

    events.forEach(e => {
      const cost = e.estimatedCostMinorUnits / 100;
      totalSpentMinor += e.estimatedCostMinorUnits;

      if (e.agentId) {
        costByAgent[e.agentId] = (costByAgent[e.agentId] || 0) + cost;
      }
      costByResourceType[e.resourceType] = (costByResourceType[e.resourceType] || 0) + cost;

      // Anomaly detection: single execution costing more than $2.00 or token burst > 25k
      if (cost > 2.0 || (e.resourceType === 'ai_token' && e.quantity > 25000)) {
        anomaliesCount++;
      }
    });

    const totalSpentUsd = parseFloat((totalSpentMinor / 100).toFixed(2));
    const grossMargin = budget.monthlyLimitUsd > 0
      ? Math.max(0, Math.round(((budget.monthlyLimitUsd - totalSpentUsd) / budget.monthlyLimitUsd) * 100))
      : 80;

    return {
      totalSpentUsd,
      budgetLimitUsd: budget.monthlyLimitUsd,
      spendingMarginPercent: grossMargin,
      costByAgent,
      costByResourceType,
      anomaliesCount,
    };
  }

  /**
   * Get or set organization budget limits
   */
  public static getBudgetConfig(orgId: string): BudgetControlConfig {
    const raw = localStorage.getItem(`${STORAGE_KEYS.BUDGET_CONTROLS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse budget config:', e);
      }
    }

    const initial: BudgetControlConfig = {
      organizationId: orgId,
      monthlyLimitUsd: 150.0,
      dailyLimitUsd: 25.0,
      agentBudgetUsd: 30.0,
      emergencyCutoffTriggered: false,
      alertThresholdPercent: 85,
    };
    localStorage.setItem(`${STORAGE_KEYS.BUDGET_CONTROLS}_${orgId}`, JSON.stringify(initial));
    return initial;
  }

  public static saveBudgetConfig(config: BudgetControlConfig): void {
    localStorage.setItem(`${STORAGE_KEYS.BUDGET_CONTROLS}_${config.organizationId}`, JSON.stringify(config));
  }

  public static resetEmergencyCutoff(orgId: string): void {
    const cfg = this.getBudgetConfig(orgId);
    cfg.emergencyCutoffTriggered = false;
    this.saveBudgetConfig(cfg);
  }
}
