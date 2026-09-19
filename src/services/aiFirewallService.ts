import { 
  FirewallActionEvaluation, RiskLevel, GlobalEmergencySuspension, 
  AgentAutonomyLevel, AgentPermission 
} from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  FIREWALL_EVALS: 'catalyx_v8_firewall_evaluations',
  EMERGENCY_KILLSWITCH: 'catalyx_v8_global_autonomy_killswitch',
};

export class AIFirewallService {
  /**
   * Check if global emergency autonomy suspension is active
   */
  public static getGlobalSuspension(orgId: string): GlobalEmergencySuspension {
    const raw = localStorage.getItem(`${STORAGE_KEYS.EMERGENCY_KILLSWITCH}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse killswitch state:', e);
      }
    }
    return { suspended: false };
  }

  /**
   * Toggle the global emergency suspension switch
   */
  public static setGlobalSuspension(
    orgId: string, 
    suspended: boolean, 
    actorId: string, 
    actorName: string, 
    reason: string
  ): GlobalEmergencySuspension {
    const state: GlobalEmergencySuspension = {
      suspended,
      suspendedBy: actorName,
      suspendedAt: new Date().toISOString(),
      reason,
    };
    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_KILLSWITCH}_${orgId}`, JSON.stringify(state));

    GovernanceService.addAuditLog({
      id: `audit_killswitch_${Date.now()}`,
      organizationId: orgId,
      actorId,
      actorName,
      actorRole: 'admin',
      action: suspended ? 'EMERGENCY_SUSPEND_AUTONOMOUS_EXECUTION' : 'RESUME_AUTONOMOUS_EXECUTION',
      resourceType: 'autonomous_firewall',
      resourceId: orgId,
      outcome: 'success',
      details: { suspended, reason },
      timestamp: new Date().toISOString(),
    });

    return state;
  }

  /**
   * Evaluate an agent's intended action against tenant policies & safety boundaries
   */
  public static evaluateAction(params: {
    organizationId: string;
    agentId: string;
    agentName: string;
    autonomyLevel: AgentAutonomyLevel;
    grantedPermissions: AgentPermission[];
    actionName: string;
    targetSystem: string;
    isDestructive: boolean;
    financialImpactUsd?: number;
    requiresApprovalByConfig: boolean;
  }): FirewallActionEvaluation {
    const orgId = params.organizationId;
    const checkedRules: string[] = [];
    let riskScore = 15; // Baseline low risk
    let allowed = true;
    let requiresApproval = false;
    let denialReason: string | undefined;

    // RULE 1: Global Emergency Suspension Check
    checkedRules.push('CHECK_GLOBAL_EMERGENCY_KILLSWITCH');
    const killswitch = this.getGlobalSuspension(orgId);
    if (killswitch.suspended) {
      allowed = false;
      denialReason = `Global Autonomous Execution is currently SUSPENDED by ${killswitch.suspendedBy || 'Administrator'}: "${killswitch.reason || 'Emergency Safety Gate Active'}"`;
      return this.recordEvaluation({
        id: `firewall_${Date.now()}`,
        organizationId: orgId,
        agentId: params.agentId,
        actionName: params.actionName,
        targetSystem: params.targetSystem,
        riskScore: 100,
        riskLevel: 'CRITICAL',
        allowed: false,
        requiresHumanApproval: true,
        denialReason,
        financialImpactEstimatedUsd: params.financialImpactUsd || 0,
        checkedRules,
        timestamp: new Date().toISOString(),
      });
    }

    // RULE 2: Autonomy Level Capabilities Boundary
    checkedRules.push('CHECK_AUTONOMY_LEVEL_BOUNDARY');
    if (params.autonomyLevel < 3) {
      // Level 0-2 agents can NEVER execute external actions autonomously
      requiresApproval = true;
      riskScore += 25;
      checkedRules.push('AUTONOMY_L0_L2_REQUIRES_HUMAN_CONFIRMATION');
    }

    // RULE 3: Financial Action Authority
    checkedRules.push('CHECK_FINANCIAL_ACTION_AUTHORITY');
    const finAmount = params.financialImpactUsd || 0;
    if (finAmount > 0) {
      riskScore += Math.min(45, Math.round(finAmount / 20));
      if (!params.grantedPermissions.includes('FINANCIAL_ACTION')) {
        allowed = false;
        denialReason = `Agent lacks required FINANCIAL_ACTION permission for action impacting $${finAmount}.`;
      } else if (finAmount > 500) {
        requiresApproval = true; // Any spend > $500 strictly mandates human-in-the-loop gate
      }
    }

    // RULE 4: Destructive Operation Guard
    checkedRules.push('CHECK_DESTRUCTIVE_OPERATIONAL_IMPACT');
    if (params.isDestructive) {
      riskScore += 35;
      requiresApproval = true;
      checkedRules.push('DESTRUCTIVE_ACTION_FORCED_APPROVAL');
    }

    // RULE 5: Explicit Configuration Approval Gate
    if (params.requiresApprovalByConfig) {
      requiresApproval = true;
    }

    // Determine Risk Level Categorization
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 80) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MEDIUM';

    const evaluation: FirewallActionEvaluation = {
      id: `firewall_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      agentId: params.agentId,
      actionName: params.actionName,
      targetSystem: params.targetSystem,
      riskScore,
      riskLevel,
      allowed,
      requiresHumanApproval: requiresApproval,
      denialReason,
      financialImpactEstimatedUsd: finAmount,
      checkedRules,
      timestamp: new Date().toISOString(),
    };

    return this.recordEvaluation(evaluation);
  }

  private static recordEvaluation(evalRecord: FirewallActionEvaluation): FirewallActionEvaluation {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FIREWALL_EVALS}_${evalRecord.organizationId}`);
    let list: FirewallActionEvaluation[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse firewall evals:', e);
      }
    }
    list.unshift(evalRecord);
    if (list.length > 200) list.pop();
    localStorage.setItem(`${STORAGE_KEYS.FIREWALL_EVALS}_${evalRecord.organizationId}`, JSON.stringify(list));
    return evalRecord;
  }

  public static getEvaluations(orgId: string): FirewallActionEvaluation[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FIREWALL_EVALS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse firewall evals:', e);
      }
    }

    const now = Date.now();
    const seeds: FirewallActionEvaluation[] = [
      {
        id: 'firewall_seed_1',
        organizationId: orgId,
        agentId: 'operations',
        actionName: 'Deploy Stage Image to Canary Cluster',
        targetSystem: 'Kubernetes Production Gateway',
        riskScore: 45,
        riskLevel: 'MEDIUM',
        allowed: true,
        requiresHumanApproval: true,
        financialImpactEstimatedUsd: 0,
        checkedRules: ['CHECK_AUTONOMY_LEVEL_BOUNDARY', 'DESTRUCTIVE_ACTION_FORCED_APPROVAL'],
        timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'firewall_seed_2',
        organizationId: orgId,
        agentId: 'financial',
        actionName: 'Auto-Renew Enterprise CDN Reservation',
        targetSystem: 'Cloud Billing Subsystem',
        riskScore: 68,
        riskLevel: 'HIGH',
        allowed: true,
        requiresHumanApproval: true,
        financialImpactEstimatedUsd: 750,
        checkedRules: ['CHECK_FINANCIAL_ACTION_AUTHORITY', 'FINANCIAL_THRESHOLD_EXCEEDED'],
        timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.FIREWALL_EVALS}_${orgId}`, JSON.stringify(seeds));
    return seeds;
  }
}
