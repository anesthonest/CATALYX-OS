import { Organization, OrgMembership, Department, AuditLogEntry, OrgRole } from '../types';

const STORAGE_KEY_ORGS = 'catalyx_v8_organizations';
const STORAGE_KEY_MEMBERS = 'catalyx_v8_org_members';
const STORAGE_KEY_DEPTS = 'catalyx_v8_departments';
const STORAGE_KEY_AUDIT = 'catalyx_v8_audit_logs';

export const DEFAULT_ORG: Organization = {
  id: 'org_vinexsah_main',
  name: 'VINEXSAH TECHNOLOGIES HQ',
  slug: 'vinexsah',
  tier: 'professional',
  ownerId: 'user_anesthonest',
  createdAt: '2026-01-01T00:00:00Z',
  settings: {
    enforceMfa: true,
    allowedDomains: ['vinexsah.com', 'catalyx.ai'],
    defaultAutonomyLevel: 2, // Default PREPARE
    budgetLimitMonthlyUsd: 150.00,
    currency: 'USD',
  },
};

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept_eng', organizationId: 'org_vinexsah_main', name: 'Engineering & AI Systems', leaderId: 'user_anesthonest', headcount: 8, budgetAllocated: 8500 },
  { id: 'dept_ops', organizationId: 'org_vinexsah_main', name: 'Global Operations & Scaling', leaderId: 'user_ops_lead', headcount: 4, budgetAllocated: 3200 },
  { id: 'dept_fin', organizationId: 'org_vinexsah_main', name: 'Finance & Pesapal Gateway', leaderId: 'user_fin_lead', headcount: 3, budgetAllocated: 2000 },
  { id: 'dept_prod', organizationId: 'org_vinexsah_main', name: 'Product & UX Design', leaderId: 'user_prod_lead', headcount: 3, budgetAllocated: 2500 },
];

export const INITIAL_MEMBERS: OrgMembership[] = [
  {
    id: 'mem_001',
    organizationId: 'org_vinexsah_main',
    userId: 'user_anesthonest',
    email: 'anesthonest81@gmail.com',
    username: 'Commander Anesth',
    role: 'owner',
    departmentId: 'dept_eng',
    status: 'active',
    joinedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem_002',
    organizationId: 'org_vinexsah_main',
    userId: 'user_alex_dev',
    email: 'alex.lead@vinexsah.com',
    username: 'Alex Lead Dev',
    role: 'admin',
    departmentId: 'dept_eng',
    status: 'active',
    joinedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'mem_003',
    organizationId: 'org_vinexsah_main',
    userId: 'user_sarah_ops',
    email: 'sarah.ops@vinexsah.com',
    username: 'Sarah Operations',
    role: 'manager',
    departmentId: 'dept_ops',
    status: 'active',
    joinedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'mem_004',
    organizationId: 'org_vinexsah_main',
    userId: 'user_david_fin',
    email: 'david.fin@vinexsah.com',
    username: 'David Finance',
    role: 'member',
    departmentId: 'dept_fin',
    status: 'active',
    joinedAt: '2026-02-01T00:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_001',
    organizationId: 'org_vinexsah_main',
    actorId: 'user_anesthonest',
    actorName: 'Commander Anesth',
    actorRole: 'owner',
    action: 'UPGRADE_TIER_PLAN',
    resourceType: 'BILLING_SUBSCRIPTION',
    resourceId: 'sub_org_vinexsah_main_default',
    outcome: 'success',
    details: { plan: 'professional', currency: 'USD', provider: 'pesapal' },
    ipAddress: '102.89.44.12',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit_002',
    organizationId: 'org_vinexsah_main',
    actorId: 'agent_software_development',
    actorName: 'Software Engineering & QA Agent',
    actorRole: 'autonomous_agent',
    action: 'EXECUTE_API_HEALTH_TEST',
    resourceType: 'INTEGRATION',
    resourceId: 'int_webhooks',
    outcome: 'success',
    details: { endpoint: '/api/billing/pesapal/ipn', responseStatus: 200 },
    ipAddress: 'internal_agent_sandbox',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit_003',
    organizationId: 'org_vinexsah_main',
    actorId: 'user_david_fin',
    actorName: 'David Finance',
    actorRole: 'member',
    action: 'DOWNLOAD_REVENUE_LEDGER',
    resourceType: 'FINANCIAL_REPORTS',
    resourceId: 'ledger_export_q1',
    outcome: 'success',
    details: { recordsCount: 19, format: 'json' },
    ipAddress: '197.239.8.19',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit_004',
    organizationId: 'org_vinexsah_main',
    actorId: 'agent_marketing',
    actorName: 'Growth & Marketing Agent',
    actorRole: 'autonomous_agent',
    action: 'UNAUTHORIZED_FINANCIAL_DISBURSEMENT_ATTEMPT',
    resourceType: 'PAYMENT_RAIL',
    resourceId: 'pesapal_direct_payout',
    outcome: 'denied',
    details: { reason: 'Agent lacks FINANCIAL_ACTION permission and exceeds Autonomy Level 1 guardrail.' },
    ipAddress: 'internal_agent_sandbox',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export class GovernanceService {
  public static getOrganization(orgId: string): Organization {
    const raw = localStorage.getItem(`${STORAGE_KEY_ORGS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing organization:', e);
      }
    }

    const org = { ...DEFAULT_ORG, id: orgId };
    localStorage.setItem(`${STORAGE_KEY_ORGS}_${orgId}`, JSON.stringify(org));
    return org;
  }

  public static getMembers(orgId: string): OrgMembership[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_MEMBERS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing members:', e);
      }
    }

    const members = INITIAL_MEMBERS.map(m => ({ ...m, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_MEMBERS}_${orgId}`, JSON.stringify(members));
    return members;
  }

  public static addMember(member: OrgMembership): void {
    const members = this.getMembers(member.organizationId);
    members.push(member);
    localStorage.setItem(`${STORAGE_KEY_MEMBERS}_${member.organizationId}`, JSON.stringify(members));
  }

  public static updateMemberRole(orgId: string, memberId: string, role: OrgRole): void {
    const members = this.getMembers(orgId);
    const m = members.find(item => item.id === memberId);
    if (m) {
      m.role = role;
      localStorage.setItem(`${STORAGE_KEY_MEMBERS}_${orgId}`, JSON.stringify(members));
    }
  }

  public static getDepartments(orgId: string): Department[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_DEPTS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing departments:', e);
      }
    }

    const depts = INITIAL_DEPARTMENTS.map(d => ({ ...d, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_DEPTS}_${orgId}`, JSON.stringify(depts));
    return depts;
  }

  public static getAuditLogs(orgId: string): AuditLogEntry[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_AUDIT}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing audit logs:', e);
      }
    }

    const logs = INITIAL_AUDIT_LOGS.map(l => ({ ...l, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_AUDIT}_${orgId}`, JSON.stringify(logs));
    return logs;
  }

  public static logAudit(entry: AuditLogEntry): void {
    const logs = this.getAuditLogs(entry.organizationId);
    logs.unshift(entry);
    localStorage.setItem(`${STORAGE_KEY_AUDIT}_${entry.organizationId}`, JSON.stringify(logs));
  }

  public static addAuditLog(entry: AuditLogEntry): void {
    this.logAudit(entry);
  }
}
