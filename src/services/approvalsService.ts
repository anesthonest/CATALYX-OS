import { HumanApprovalRequest, ApprovalCategory } from '../types';

const STORAGE_KEY_APPROVALS = 'catalyx_v8_approvals';

export const INITIAL_APPROVALS: HumanApprovalRequest[] = [
  {
    id: 'appr_001',
    organizationId: 'default_org',
    requesterType: 'agent',
    requesterId: 'agent_finance_analysis',
    requesterName: 'Finance & Unit Economics Agent',
    title: 'Approve Enterprise Sovereign Tier Custom Rate (UGX 2,000,000 / $520 USD)',
    description: 'Finance agent requests C-suite authorization to establish the Enterprise Sovereign tier in Pesapal catalog with dedicated Cloud Run VPC limits.',
    category: 'financial',
    impactLevel: 'high',
    payload: {
      planId: 'plan_enterprise',
      priceMinorUGX: 200000000,
      priceMinorUSD: 52000,
      currency: 'USD',
    },
    status: 'approved',
    reviewedBy: 'anesthonest81@gmail.com',
    reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    decisionNotes: 'Approved based on Q3 sovereign infrastructure expansion directive.',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'appr_002',
    organizationId: 'default_org',
    requesterType: 'agent',
    requesterId: 'agent_document',
    requesterName: 'Knowledge & Documentation Agent',
    title: 'Publish Updated SEC-GOV-09: Human-In-The-Loop Governance Policy',
    description: 'Agent prepared updated governance policy with strict Autonomy Level 0-4 matrix and requests compliance officer review before publishing to company-wide authoritative status.',
    category: 'legal',
    impactLevel: 'critical',
    payload: {
      policyId: 'kb_003',
      classification: 'Authoritative',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'appr_003',
    organizationId: 'default_org',
    requesterType: 'workflow',
    requesterId: 'wf_001',
    requesterName: 'Pesapal Subscription Activation Pipeline',
    title: 'High-Volume Payment Gateway Retry Authorization',
    description: 'Workflow requests approval to re-attempt 4 queued merchant callbacks following transient network latency spike.',
    category: 'workflow_gate',
    impactLevel: 'medium',
    payload: {
      retryAttempts: 4,
      targetEndpoint: '/api/billing/pesapal/verify',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export class ApprovalsService {
  public static getApprovals(orgId: string): HumanApprovalRequest[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_APPROVALS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing approvals:', e);
      }
    }

    const defaultItems = INITIAL_APPROVALS.map(a => ({ ...a, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_APPROVALS}_${orgId}`, JSON.stringify(defaultItems));
    return defaultItems;
  }

  public static addApproval(appr: HumanApprovalRequest): void {
    const approvals = this.getApprovals(appr.organizationId);
    approvals.unshift(appr);
    localStorage.setItem(`${STORAGE_KEY_APPROVALS}_${appr.organizationId}`, JSON.stringify(approvals));
  }

  public static reviewApproval(
    orgId: string, 
    approvalId: string, 
    decision: 'approved' | 'rejected', 
    reviewerEmail: string, 
    notes?: string
  ): HumanApprovalRequest | undefined {
    const approvals = this.getApprovals(orgId);
    const item = approvals.find(a => a.id === approvalId);
    if (!item) return undefined;

    item.status = decision;
    item.reviewedBy = reviewerEmail;
    item.reviewedAt = new Date().toISOString();
    item.decisionNotes = notes || (decision === 'approved' ? 'Approved by authorized human operator.' : 'Rejected by authorized human operator.');

    localStorage.setItem(`${STORAGE_KEY_APPROVALS}_${orgId}`, JSON.stringify(approvals));
    return item;
  }
}
