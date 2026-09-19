import { EmergencyControlsMasterState } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  EMERGENCY_MASTER: 'catalyx_v9_emergency_controls_master',
};

export class EmergencyControlService {
  /**
   * Fetch the current Emergency Controls Master Registry state
   */
  public static getMasterState(orgId: string): EmergencyControlsMasterState {
    const raw = localStorage.getItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing emergency controls master state:', e);
      }
    }

    const defaultState: EmergencyControlsMasterState = {
      organizationId: orgId,
      globalAiSuspended: false,
      organizationAiSuspended: false,
      suspendedAgentIds: [],
      suspendedConnectorIds: [],
      suspendedMarketplaceItemIds: [],
      paymentProcessingSuspended: false,
      workflowExecutionSuspended: false,
      lastUpdatedBy: 'System Initializer',
      lastUpdatedAt: new Date().toISOString(),
      lastReason: 'Initial baseline state (All systems operational)',
    };

    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${orgId}`, JSON.stringify(defaultState));
    return defaultState;
  }

  /**
   * Toggle global or organization-level AI suspension
   */
  public static toggleAiSuspension(params: {
    organizationId: string;
    target: 'global' | 'organization';
    suspend: boolean;
    actorName: string;
    reason: string;
  }): EmergencyControlsMasterState {
    const state = this.getMasterState(params.organizationId);
    if (params.target === 'global') {
      state.globalAiSuspended = params.suspend;
    } else {
      state.organizationAiSuspended = params.suspend;
    }
    state.lastUpdatedBy = params.actorName;
    state.lastUpdatedAt = new Date().toISOString();
    state.lastReason = params.reason;

    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${params.organizationId}`, JSON.stringify(state));

    GovernanceService.addAuditLog({
      id: `audit_emg_ai_${Date.now()}`,
      organizationId: params.organizationId,
      actorId: params.actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.actorName,
      actorRole: 'admin',
      action: params.suspend ? `EMERGENCY_SUSPEND_${params.target.toUpperCase()}_AI` : `RESUME_${params.target.toUpperCase()}_AI`,
      resourceType: 'emergency_controls',
      resourceId: params.organizationId,
      outcome: 'success',
      details: {
        target: params.target,
        suspend: params.suspend,
        reason: params.reason,
      },
      timestamp: state.lastUpdatedAt,
    });

    return state;
  }

  /**
   * Suspend or reinstate an individual agent
   */
  public static setAgentSuspension(params: {
    organizationId: string;
    agentId: string;
    suspend: boolean;
    actorName: string;
    reason: string;
  }): EmergencyControlsMasterState {
    const state = this.getMasterState(params.organizationId);
    if (params.suspend) {
      if (!state.suspendedAgentIds.includes(params.agentId)) {
        state.suspendedAgentIds.push(params.agentId);
      }
    } else {
      state.suspendedAgentIds = state.suspendedAgentIds.filter(id => id !== params.agentId);
    }
    state.lastUpdatedBy = params.actorName;
    state.lastUpdatedAt = new Date().toISOString();
    state.lastReason = params.reason;

    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${params.organizationId}`, JSON.stringify(state));

    GovernanceService.addAuditLog({
      id: `audit_emg_agent_${Date.now()}`,
      organizationId: params.organizationId,
      actorId: params.actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.actorName,
      actorRole: 'admin',
      action: params.suspend ? 'EMERGENCY_SUSPEND_AGENT' : 'REINSTATE_AGENT',
      resourceType: 'agent',
      resourceId: params.agentId,
      outcome: 'success',
      details: { agentId: params.agentId, reason: params.reason },
      timestamp: state.lastUpdatedAt,
    });

    return state;
  }

  /**
   * Suspend or reinstate an external connector in the Integration Mesh
   */
  public static setConnectorSuspension(params: {
    organizationId: string;
    connectorId: string;
    suspend: boolean;
    actorName: string;
    reason: string;
  }): EmergencyControlsMasterState {
    const state = this.getMasterState(params.organizationId);
    if (params.suspend) {
      if (!state.suspendedConnectorIds.includes(params.connectorId)) {
        state.suspendedConnectorIds.push(params.connectorId);
      }
    } else {
      state.suspendedConnectorIds = state.suspendedConnectorIds.filter(id => id !== params.connectorId);
    }
    state.lastUpdatedBy = params.actorName;
    state.lastUpdatedAt = new Date().toISOString();
    state.lastReason = params.reason;

    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${params.organizationId}`, JSON.stringify(state));

    GovernanceService.addAuditLog({
      id: `audit_emg_conn_${Date.now()}`,
      organizationId: params.organizationId,
      actorId: params.actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.actorName,
      actorRole: 'admin',
      action: params.suspend ? 'EMERGENCY_SUSPEND_CONNECTOR' : 'REINSTATE_CONNECTOR',
      resourceType: 'connector',
      resourceId: params.connectorId,
      outcome: 'success',
      details: { connectorId: params.connectorId, reason: params.reason },
      timestamp: state.lastUpdatedAt,
    });

    return state;
  }

  /**
   * Emergency freeze payment processing or workflow executions
   */
  public static setOperationalKillswitch(params: {
    organizationId: string;
    subsystem: 'payments' | 'workflows';
    suspend: boolean;
    actorName: string;
    reason: string;
  }): EmergencyControlsMasterState {
    const state = this.getMasterState(params.organizationId);
    if (params.subsystem === 'payments') {
      state.paymentProcessingSuspended = params.suspend;
    } else {
      state.workflowExecutionSuspended = params.suspend;
    }
    state.lastUpdatedBy = params.actorName;
    state.lastUpdatedAt = new Date().toISOString();
    state.lastReason = params.reason;

    localStorage.setItem(`${STORAGE_KEYS.EMERGENCY_MASTER}_${params.organizationId}`, JSON.stringify(state));

    GovernanceService.addAuditLog({
      id: `audit_emg_ops_${Date.now()}`,
      organizationId: params.organizationId,
      actorId: params.actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.actorName,
      actorRole: 'admin',
      action: params.suspend ? `EMERGENCY_FREEZE_${params.subsystem.toUpperCase()}` : `RESUME_${params.subsystem.toUpperCase()}`,
      resourceType: 'emergency_subsystem',
      resourceId: params.subsystem,
      outcome: 'success',
      details: { subsystem: params.subsystem, suspend: params.suspend, reason: params.reason },
      timestamp: state.lastUpdatedAt,
    });

    return state;
  }
}
