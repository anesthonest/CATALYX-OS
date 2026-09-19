import { GovernedAgentRegistryEntry, InterAgentTaskContract } from '../types';

const STORAGE_KEYS = {
  AGENTS: 'catalyx_v10_governed_agent_registry',
  TASK_CONTRACTS: 'catalyx_v10_inter_agent_task_contracts',
};

export class AgentEcosystemService {
  public static getRegistry(): GovernedAgentRegistryEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENTS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultAgents: GovernedAgentRegistryEntry[] = [
      {
        agentId: 'agent_internal_orchestrator',
        name: 'Master Mission Orchestrator',
        agentType: 'INTERNAL',
        ownerId: 'catalyx_system',
        creatorId: 'vinexsah_core_ai',
        version: '10.0.0',
        capabilities: ['mission_decomposition', 'cross_agent_delegation', 'safety_gate_validation'],
        permissions: ['ORCHESTRATE_WORKFORCE', 'SCHEDULE_TASKS', 'EVALUATE_SAFETY_GATE'],
        supportedTools: ['task_planner', 'dependency_resolver', 'risk_scorer'],
        costPer1kTokensMinorUnits: 2,
        reliabilityScore: 99.4,
        reputationScore: 98,
        securityStatus: 'TRUSTED',
        autonomyLevel: 3,
        verifiedOutcomesCount: 14200,
        incidentCount: 0,
        lastActiveAt: new Date().toISOString(),
      },
      {
        agentId: 'agent_org_financial_controller',
        name: 'Enterprise Financial Controller',
        agentType: 'ORGANIZATION',
        ownerId: 'default_org',
        creatorId: 'vinexsah_fintech',
        version: '9.4.2',
        capabilities: ['ledger_reconciliation', 'minor_unit_arithmetic', 'vat_withholding_calc'],
        permissions: ['READ_LEDGER', 'PREPARE_DISBURSEMENT', 'EMIT_FINANCIAL_ALERTS'],
        supportedTools: ['pesapal_api_client', 'currency_converter', 'reconciliation_matrix'],
        costPer1kTokensMinorUnits: 4,
        reliabilityScore: 99.8,
        reputationScore: 99,
        securityStatus: 'TRUSTED',
        autonomyLevel: 3, // Requires Level 3 approval for payment execution
        verifiedOutcomesCount: 28900,
        incidentCount: 0,
        lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        agentId: 'agent_mkt_finops_sentinel',
        name: 'Marketplace FinOps Cost Sentinel',
        agentType: 'MARKETPLACE',
        ownerId: 'org_vinexsah_core',
        creatorId: 'dev_vinexsah_sec',
        version: '3.1.0',
        capabilities: ['cloud_spend_audit', 'reserved_instance_negotiation', 'anomaly_detection'],
        permissions: ['READ_CLOUD_BILLING', 'GENERATE_RECOMMENDATIONS'],
        supportedTools: ['aws_cost_explorer_client', 'gcp_billing_client'],
        costPer1kTokensMinorUnits: 5,
        reliabilityScore: 98.1,
        reputationScore: 96,
        securityStatus: 'TRUSTED',
        autonomyLevel: 2, // Prepares suggestions, human approves
        verifiedOutcomesCount: 8400,
        incidentCount: 0,
        lastActiveAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        agentId: 'agent_dev_sentiment_analyzer',
        name: 'Developer Partner Customer Sentiment Agent',
        agentType: 'DEVELOPER',
        ownerId: 'org_partner_alpha',
        creatorId: 'dev_external_partner_99',
        version: '1.0.0-rc1',
        capabilities: ['sentiment_scoring', 'churn_probability_forecast'],
        permissions: ['READ_SUPPORT_TICKETS'],
        supportedTools: ['nlp_tokenizer', 'sentiment_classifier'],
        costPer1kTokensMinorUnits: 3,
        reliabilityScore: 94.5,
        reputationScore: 89,
        securityStatus: 'VERIFIED',
        autonomyLevel: 1, // Advisory only
        verifiedOutcomesCount: 450,
        incidentCount: 0,
        lastActiveAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
    ];

    this.saveRegistry(defaultAgents);
    return defaultAgents;
  }

  public static getTaskContracts(): InterAgentTaskContract[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASK_CONTRACTS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultContracts: InterAgentTaskContract[] = [
      {
        contractId: 'contract_task_001',
        initiatorAgentId: 'agent_internal_orchestrator',
        delegatedAgentId: 'agent_org_financial_controller',
        missionId: 'mission_monthly_close_august_2026',
        taskScope: 'Execute automated reconciliation between Pesapal IPN settlements and PostgreSQL ledger.',
        inputContract: 'JSON { startDate: "2026-08-01", endDate: "2026-08-31", toleranceMinorUnits: 0 }',
        expectedOutputFormat: 'JSON { matchedRecords: number, discrepanciesCount: number, auditHash: string }',
        authTicket: 'jwt_ticket_signed_by_safety_gate_9921',
        timeoutMs: 30000,
        retryPolicy: { maxRetries: 3, backoffMs: 1000 },
        status: 'VALIDATED',
        auditTraceId: 'trace_rec_fin_99182',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        contractId: 'contract_task_002',
        initiatorAgentId: 'agent_internal_orchestrator',
        delegatedAgentId: 'agent_mkt_finops_sentinel',
        missionId: 'mission_infra_optimization_q3',
        taskScope: 'Scan all container clusters and cloud database IOPS for idle capacity.',
        inputContract: 'JSON { clusterIds: ["prod-cloudsql-01", "worker-nodes-pool"], lookbackDays: 14 }',
        expectedOutputFormat: 'JSON { potentialSavingsMinorUnits: number, recommendedActions: Array<string> }',
        authTicket: 'jwt_ticket_signed_by_safety_gate_8812',
        timeoutMs: 45000,
        retryPolicy: { maxRetries: 2, backoffMs: 2000 },
        status: 'IN_PROGRESS',
        auditTraceId: 'trace_finops_scan_7721',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
    ];

    this.saveTaskContracts(defaultContracts);
    return defaultContracts;
  }

  public static dispatchTask(contract: Omit<InterAgentTaskContract, 'contractId' | 'status' | 'auditTraceId' | 'timestamp'>): InterAgentTaskContract {
    const list = this.getTaskContracts();
    const newContract: InterAgentTaskContract = {
      ...contract,
      contractId: `contract_task_${Date.now()}`,
      status: 'IN_PROGRESS',
      auditTraceId: `trace_agent_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    list.unshift(newContract);
    this.saveTaskContracts(list);
    return newContract;
  }

  private static saveRegistry(agents: GovernedAgentRegistryEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  }

  private static saveTaskContracts(contracts: InterAgentTaskContract[]): void {
    localStorage.setItem(STORAGE_KEYS.TASK_CONTRACTS, JSON.stringify(contracts));
  }
}
