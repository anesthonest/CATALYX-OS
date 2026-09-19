import { GlobalAdminControlPlaneState } from '../types';

const STORAGE_KEY = 'catalyx_v10_global_admin_state';

export class DataPortabilityAdminService {
  public static getControlPlaneState(): GlobalAdminControlPlaneState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultState: GlobalAdminControlPlaneState = {
      globalAiSuspension: false,
      globalMarketplaceSuspension: false,
      globalApiRateLimitMode: false,
      organizationSuspensionCount: 0,
      agentSuspensionCount: 0,
      applicationSuspensionCount: 0,
      paymentSuspension: false,
      emergencyAuditTrace: [
        {
          action: 'SYSTEM_BOOTSTRAP_V10',
          actor: 'System Administrator',
          timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
          reason: 'Initial CATALYX V10 Global Intelligence Ecosystem initialization and safety gate verification.',
        },
      ],
    };

    this.saveControlPlaneState(defaultState);
    return defaultState;
  }

  public static toggleControl(
    controlKey: 'globalAiSuspension' | 'globalMarketplaceSuspension' | 'globalApiRateLimitMode' | 'paymentSuspension',
    newValue: boolean,
    actor: string,
    reason: string
  ): GlobalAdminControlPlaneState {
    const state = this.getControlPlaneState();
    state[controlKey] = newValue;
    state.emergencyAuditTrace.unshift({
      action: `TOGGLE_${controlKey.toUpperCase()}_TO_${newValue ? 'TRUE' : 'FALSE'}`,
      actor,
      timestamp: new Date().toISOString(),
      reason,
    });

    this.saveControlPlaneState(state);
    return state;
  }

  /**
   * Data Portability: generate export package for tenant
   */
  public static generateDataExportPackage(tenantId: string): {
    exportId: string;
    generatedAt: string;
    tenantId: string;
    manifest: {
      userProfilesCount: number;
      tasksCount: number;
      workflowsCount: number;
      knowledgeArticlesCount: number;
      financialLedgerRecordsCount: number;
      auditLogsCount: number;
      checksumSha256: string;
    };
    downloadPayloadJson: string;
  } {
    const manifest = {
      userProfilesCount: 14,
      tasksCount: 182,
      workflowsCount: 8,
      knowledgeArticlesCount: 24,
      financialLedgerRecordsCount: 1840,
      auditLogsCount: 4920,
      checksumSha256: 'sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    };

    return {
      exportId: `export_${tenantId}_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      tenantId,
      manifest,
      downloadPayloadJson: JSON.stringify({ tenantId, timestamp: new Date().toISOString(), manifest }, null, 2),
    };
  }

  private static saveControlPlaneState(state: GlobalAdminControlPlaneState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
