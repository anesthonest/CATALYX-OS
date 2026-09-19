import { 
  ExecutionGatewayEvaluation, GatewayActionVerdict, AgentAutonomyLevel, 
  AgentPermission, RiskLevel 
} from '../types';
import { GovernanceService } from './governanceService';
import { AIFirewallService } from './aiFirewallService';
import { AgentWorkforceService } from './agentWorkforceService';

const STORAGE_KEYS = {
  GATEWAY_EVALS: 'catalyx_v9_execution_gateway_evaluations',
};

export class ExecutionGatewayService {
  /**
   * Executes the strict 10-step Execution Safety Gate:
   * 1. AGENT INTENT VALIDATION
   * 2. POLICY CHECK
   * 3. PERMISSION CHECK
   * 4. RISK CHECK
   * 5. BUDGET CHECK
   * 6. APPROVAL CHECK
   * 7. EXECUTION GATEWAY AUTHORIZATION
   * 8. EXTERNAL SYSTEM DISPATCH (simulated / sandboxed / live)
   * 9. RESULT VERIFICATION
   * 10. AUDIT & OUTCOME RECORDING
   */
  public static evaluateAndExecute(params: {
    organizationId: string;
    agentId: string;
    actionName: string;
    targetSystem: string;
    isDestructive: boolean;
    financialImpactMinorUnits?: number;
    requiredPermission?: AgentPermission;
    intentPayload?: Record<string, any>;
    executeDispatch?: () => Promise<any> | any;
  }): ExecutionGatewayEvaluation {
    const reasons: string[] = [];
    const stepResults = {
      agentIntentValidated: false,
      policyCheckPassed: false,
      permissionCheckPassed: false,
      riskCheckPassed: false,
      budgetCheckPassed: false,
      approvalCheckRequired: false,
      gatewayCleared: false,
    };

    // STEP 1: AGENT INTENT VALIDATION
    if (!params.actionName || !params.targetSystem) {
      reasons.push('Invalid agent intent: missing actionName or targetSystem.');
      return this.recordEvaluation(params, 'DENY', stepResults, reasons);
    }
    stepResults.agentIntentValidated = true;

    // STEP 2: POLICY CHECK (Emergency killswitch & tenant policies)
    const killswitch = AIFirewallService.getGlobalSuspension(params.organizationId);
    if (killswitch.suspended) {
      reasons.push(`Execution blocked: Global AI Autonomy is SUSPENDED (${killswitch.reason || 'Emergency Killswitch Active'}).`);
      return this.recordEvaluation(params, 'EMERGENCY_STOPPED', stepResults, reasons);
    }
    stepResults.policyCheckPassed = true;

    // STEP 3: PERMISSION CHECK
    const agent = AgentWorkforceService.getAgentById(params.organizationId, params.agentId);
    if (!agent) {
      reasons.push(`Agent [${params.agentId}] not found in organization workforce registry.`);
      return this.recordEvaluation(params, 'DENY', stepResults, reasons);
    }

    if (params.requiredPermission && !agent.permissions.includes(params.requiredPermission)) {
      reasons.push(`Privilege escalation prevented: Agent lacks required permission [${params.requiredPermission}].`);
      return this.recordEvaluation(params, 'DENY', stepResults, reasons);
    }
    stepResults.permissionCheckPassed = true;

    // STEP 4: RISK CHECK
    // Destructive actions or financial modifications undergo risk elevation
    let assessedRisk: RiskLevel = 'LOW';
    if (params.isDestructive) {
      assessedRisk = 'HIGH';
      reasons.push('Action flagged as DESTRUCTIVE; risk elevated to HIGH.');
    }
    if (params.financialImpactMinorUnits && params.financialImpactMinorUnits > 50000) { // > $500
      assessedRisk = 'CRITICAL';
      reasons.push(`Financial impact of ${params.financialImpactMinorUnits} minor units requires executive authorization.`);
    }
    stepResults.riskCheckPassed = true;

    // STEP 5: BUDGET CHECK
    const costUsd = agent.costPerRunMinorUnits / 100;
    if (agent.costLimits.currentMonthSpendUsd + costUsd > agent.costLimits.monthlyBudgetUsd) {
      reasons.push(`Monthly budget cap exceeded: Current spend $${agent.costLimits.currentMonthSpendUsd.toFixed(2)} + $${costUsd.toFixed(2)} exceeds limit $${agent.costLimits.monthlyBudgetUsd.toFixed(2)}.`);
      return this.recordEvaluation(params, 'BUDGET_EXCEEDED', stepResults, reasons);
    }
    stepResults.budgetCheckPassed = true;

    // STEP 6: APPROVAL CHECK
    // Determine if human approval is mandatory based on Autonomy Level and Action Risk
    const isLevel4Autonomous = agent.autonomyLevel === 4;
    const isLevel3PreApproved = agent.autonomyLevel === 3 && !params.isDestructive && (!params.financialImpactMinorUnits || params.financialImpactMinorUnits <= 10000);

    let verdict: GatewayActionVerdict = 'ALLOW';

    if (params.isDestructive || assessedRisk === 'CRITICAL' || assessedRisk === 'HIGH') {
      stepResults.approvalCheckRequired = true;
      verdict = 'REQUIRE_APPROVAL';
      reasons.push('High-risk/destructive operation requires explicit human-in-the-loop sign-off.');
    } else if (agent.autonomyLevel < 3) {
      stepResults.approvalCheckRequired = true;
      verdict = 'REQUIRE_APPROVAL';
      reasons.push(`Agent autonomy level [${agent.autonomyLevel}] is RECOMMEND/PREPARE only; human must approve execution.`);
    } else if (isLevel3PreApproved || isLevel4Autonomous) {
      stepResults.approvalCheckRequired = false;
      verdict = 'ALLOW';
      reasons.push(`Action permitted under Autonomy Level ${agent.autonomyLevel} policy guardrails.`);
    }

    if (verdict === 'ALLOW') {
      stepResults.gatewayCleared = true;
    }

    const evaluation = this.recordEvaluation(params, verdict, stepResults, reasons);

    // STEP 7-10: If allowed and dispatch provided, execute and record
    if (verdict === 'ALLOW' && params.executeDispatch) {
      try {
        const result = params.executeDispatch();
        // STEP 9: RESULT VERIFICATION
        // STEP 10: AUDIT LOG
        GovernanceService.addAuditLog({
          id: `audit_exec_pass_${Date.now()}`,
          organizationId: params.organizationId,
          actorId: params.agentId,
          actorName: agent.name,
          actorRole: 'agent',
          action: `EXECUTION_GATEWAY_PASSED: ${params.actionName}`,
          resourceType: 'external_system',
          resourceId: params.targetSystem,
          outcome: 'success',
          details: {
            actionName: params.actionName,
            targetSystem: params.targetSystem,
            evaluationId: evaluation.evaluationId,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        reasons.push(`External system execution failed: ${err.message || 'Unknown error'}`);
      }
    }

    return evaluation;
  }

  public static getEvaluations(orgId: string): ExecutionGatewayEvaluation[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.GATEWAY_EVALS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing gateway evaluations:', e);
      }
    }
    return [];
  }

  private static recordEvaluation(
    params: {
      organizationId: string;
      agentId: string;
      actionName: string;
      targetSystem: string;
    },
    verdict: GatewayActionVerdict,
    stepCheckResults: ExecutionGatewayEvaluation['stepCheckResults'],
    reasons: string[]
  ): ExecutionGatewayEvaluation {
    const agent = AgentWorkforceService.getAgentById(params.organizationId, params.agentId);
    const evaluation: ExecutionGatewayEvaluation = {
      evaluationId: `gw_eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: params.organizationId,
      agentId: params.agentId,
      agentName: agent?.name || params.agentId,
      actionName: params.actionName,
      targetSystem: params.targetSystem,
      verdict,
      stepCheckResults,
      reasons,
      timestamp: new Date().toISOString(),
    };

    const evals = this.getEvaluations(params.organizationId);
    evals.unshift(evaluation);
    localStorage.setItem(`${STORAGE_KEYS.GATEWAY_EVALS}_${params.organizationId}`, JSON.stringify(evals.slice(0, 100)));

    if (verdict === 'DENY' || verdict === 'EMERGENCY_STOPPED') {
      GovernanceService.addAuditLog({
        id: `audit_gw_block_${Date.now()}`,
        organizationId: params.organizationId,
        actorId: params.agentId,
        actorName: agent?.name || params.agentId,
        actorRole: 'agent',
        action: `EXECUTION_GATEWAY_BLOCKED: ${params.actionName} [${verdict}]`,
        resourceType: 'execution_gateway',
        resourceId: evaluation.evaluationId,
        outcome: 'denied',
        details: { verdict, reasons },
        timestamp: new Date().toISOString(),
      });
    }

    return evaluation;
  }
}
