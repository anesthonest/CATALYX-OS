import { SandboxExecutionRequest, SandboxExecutionResult } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  SANDBOX_RESULTS: 'catalyx_v8_sandbox_results',
};

export class DeveloperSandboxService {
  /**
   * Fetch recent sandbox execution records
   */
  public static getHistory(orgId: string): SandboxExecutionResult[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SANDBOX_RESULTS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse sandbox execution history:', e);
      }
    }

    const defaultResults: SandboxExecutionResult[] = [
      {
        executionId: 'sbx_exec_9012',
        targetId: 'agent_strategy_exec',
        status: 'success',
        durationMs: 310,
        syntheticComputeCostMinorUnits: 4, // $0.04 synthetic cost
        output: {
          recommendation: 'Synthetic portfolio allocation synthesized without external network impact.',
          riskEvaluated: 'LOW',
          mockTokensConsumed: 620,
        },
        policyEvaluations: [
          'SANDBOX_TENANT_DATA_ISOLATION: PASSED',
          'PAYMENT_GATEWAY_MUTATION_PREVENTION: PASSED',
          'EXTERNAL_SOCKET_INTERCEPTION: ENFORCED',
        ],
        networkCallsBlocked: 2,
        isolatedDataIntegrityVerified: true,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.SANDBOX_RESULTS}_${orgId}`, JSON.stringify(defaultResults));
    return defaultResults;
  }

  /**
   * Execute an isolated test in the developer sandbox
   */
  public static async executeSandboxTest(
    orgId: string,
    request: SandboxExecutionRequest,
    actorName: string
  ): Promise<SandboxExecutionResult> {
    const history = this.getHistory(orgId);
    const startTime = Date.now();

    // Verify sandbox isolation rules
    const policyEvaluations: string[] = [
      'SANDBOX_TENANT_DATA_ISOLATION: PASSED',
      'READ_ONLY_PERSISTENCE_ENFORCED: PASSED',
      'SIMULATED_FINANCIAL_GUARD: PASSED',
    ];

    let status: 'success' | 'failed' | 'policy_blocked' = 'success';
    let networkCallsBlocked = 0;

    // Detect if input payload attempts unsafe operations
    const payloadStr = JSON.stringify(request.inputPayload);
    if (payloadStr.includes('__proto__') || payloadStr.includes('exec(') || payloadStr.includes('DROP TABLE')) {
      status = 'policy_blocked';
      policyEvaluations.push('CODE_INJECTION_DETECTION: BLOCKED');
    }

    if (payloadStr.includes('http://') || payloadStr.includes('https://external')) {
      networkCallsBlocked = 1;
      policyEvaluations.push('UNAUTHORIZED_EXTERNAL_EGRESS: INTERCEPTED');
    }

    const durationMs = Math.floor(180 + Math.random() * 220);
    const syntheticComputeCostMinorUnits = Math.max(1, Math.floor(Math.random() * 8));

    const result: SandboxExecutionResult = {
      executionId: `sbx_exec_${Date.now()}`,
      targetId: request.targetId,
      status,
      durationMs,
      syntheticComputeCostMinorUnits,
      output: {
        dryRun: request.dryRun,
        status,
        mockResult: `Execution of ${request.targetType} [${request.targetId}] completed successfully in synthetic sandbox container.`,
        syntheticLatencyMs: durationMs,
        appliedPayloadKeys: Object.keys(request.inputPayload),
      },
      policyEvaluations,
      networkCallsBlocked,
      isolatedDataIntegrityVerified: true,
      timestamp: new Date().toISOString(),
    };

    history.unshift(result);
    // Keep max 30 records
    localStorage.setItem(`${STORAGE_KEYS.SANDBOX_RESULTS}_${orgId}`, JSON.stringify(history.slice(0, 30)));

    GovernanceService.addAuditLog({
      id: `audit_sbx_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'developer',
      action: 'RUN_SANDBOX_SIMULATION',
      resourceType: 'sandbox_container',
      resourceId: request.targetId,
      outcome: status === 'success' ? 'success' : 'denied',
      details: {
        targetType: request.targetType,
        dryRun: request.dryRun,
        networkCallsBlocked,
      },
      timestamp: new Date().toISOString(),
    });

    return result;
  }
}
