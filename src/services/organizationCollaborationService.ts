import { OrgCollaborationWorkspace } from '../types';

const STORAGE_KEY = 'catalyx_v10_org_collaboration_workspaces';

export class OrganizationCollaborationService {
  public static getWorkspaces(primaryOrgId: string): OrgCollaborationWorkspace[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultWorkspaces: OrgCollaborationWorkspace[] = [
      {
        workspaceId: 'collab_ws_supplier_pesapal',
        primaryOrgId,
        partnerOrgId: 'org_pesapal_payments_ke',
        partnerOrgName: 'Pesapal Payments Group Africa',
        collaborationType: 'PARTNER',
        status: 'ACTIVE',
        sharedMissionsCount: 3,
        sharedWorkflows: ['wf_financial_reconciliation', 'wf_ipn_health_monitor'],
        delegatedTasksCount: 14,
        governancePolicy: 'Strict financial SLA: Encrypted telemetry sharing only. Zero customer PII shared.',
        expiresAt: '2027-01-01T00:00:00Z',
        createdAt: '2026-02-10T00:00:00Z',
      },
      {
        workspaceId: 'collab_ws_dev_partner_alpha',
        primaryOrgId,
        partnerOrgId: 'org_partner_alpha',
        partnerOrgName: 'Pan-African Developer Innovation Guild',
        collaborationType: 'DEVELOPMENT_PARTNER',
        status: 'ACTIVE',
        sharedMissionsCount: 2,
        sharedWorkflows: ['wf_agent_delegation'],
        delegatedTasksCount: 8,
        governancePolicy: 'Developer Sandbox Sandbox Policy: Read-only access to synthetic mock datasets.',
        expiresAt: '2026-12-31T00:00:00Z',
        createdAt: '2026-06-01T00:00:00Z',
      },
      {
        workspaceId: 'collab_ws_ngo_climate',
        primaryOrgId,
        partnerOrgId: 'org_green_east_africa',
        partnerOrgName: 'East African Renewable Alliance',
        collaborationType: 'NGO',
        status: 'INVITED',
        sharedMissionsCount: 1,
        sharedWorkflows: ['wf_soc2_compliance'],
        delegatedTasksCount: 0,
        governancePolicy: 'Impact tracking: Aggregate carbon-offset telemetry data.',
        expiresAt: '2026-11-30T00:00:00Z',
        createdAt: '2026-08-25T00:00:00Z',
      },
    ];

    this.saveWorkspaces(defaultWorkspaces);
    return defaultWorkspaces;
  }

  public static invitePartner(workspace: Omit<OrgCollaborationWorkspace, 'workspaceId' | 'status' | 'sharedMissionsCount' | 'delegatedTasksCount' | 'createdAt'>): OrgCollaborationWorkspace {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: OrgCollaborationWorkspace[] = raw ? JSON.parse(raw) : [];
    const newWs: OrgCollaborationWorkspace = {
      ...workspace,
      workspaceId: `collab_ws_${Date.now()}`,
      status: 'INVITED',
      sharedMissionsCount: 0,
      delegatedTasksCount: 0,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newWs);
    this.saveWorkspaces(list);
    return newWs;
  }

  public static updateStatus(workspaceId: string, status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: OrgCollaborationWorkspace[] = JSON.parse(raw);
    const item = list.find(w => w.workspaceId === workspaceId);
    if (item) {
      item.status = status;
      this.saveWorkspaces(list);
    }
  }

  private static saveWorkspaces(workspaces: OrgCollaborationWorkspace[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }
}
