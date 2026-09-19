import { 
  EnterpriseRiskItem, RiskDomain, RiskLifecycleStage, RiskLevel 
} from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  ENTERPRISE_RISKS: 'catalyx_v9_enterprise_risks',
};

export class RiskEngineService {
  /**
   * Fetch all enterprise risk items
   */
  public static getRisks(orgId: string): EnterpriseRiskItem[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ENTERPRISE_RISKS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing risks from storage:', e);
      }
    }

    const defaultRisks: EnterpriseRiskItem[] = [
      {
        id: 'risk_v9_001',
        organizationId: orgId,
        domain: 'financial',
        title: 'Multi-Currency Settlement Gateway Reconciliation Drift',
        description: 'Potential for un-reconciled currency conversion discrepancies if regional IPN callbacks experience transient packet loss during peak network congestion.',
        severity: 'MEDIUM',
        probability: 25,
        impactScore: 60,
        riskScore: 15,
        lifecycleState: 'MONITORING',
        detectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        affectedEntity: 'Pesapal IPN Webhook Listener',
        proposedMitigation: 'Implement exponential backoff retry worker with automated ledger reconciliation audit every 15 minutes.',
        mitigationOwner: 'Finance & Unit Economics Agent',
        humanApprovalRequired: false,
        approvalStatus: 'approved',
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'DETECTED',
            toStage: 'ANALYZED',
            actor: 'Continuous Intelligence Loop',
            note: 'Detected 2 missed webhook acknowledgments during stress simulation.',
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'ANALYZED',
            toStage: 'MITIGATION_PROPOSED',
            actor: 'Finance & Unit Economics Agent',
            note: 'Proposed automated reconciliation worker with idempotent deduplication key.',
          },
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'MITIGATION_PROPOSED',
            toStage: 'MONITORING',
            actor: 'Chief Financial Officer',
            note: 'Reconciliation worker deployed to production; monitoring active.',
          },
        ],
      },
      {
        id: 'risk_v9_002',
        organizationId: orgId,
        domain: 'cybersecurity',
        title: 'Agent Tool Invocation Egress to Non-Allowlisted External Endpoints',
        description: 'Autonomous agents possessing web search or external connector tools attempting outbound network requests to unverified third-party hosts.',
        severity: 'CRITICAL',
        probability: 10,
        impactScore: 95,
        riskScore: 9.5,
        lifecycleState: 'APPROVAL_REQUIRED',
        detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        affectedEntity: 'AI Safety Firewall & Gateway',
        proposedMitigation: 'Enforce strict host allowlisting, egress proxy filtering, and automated session termination for egress anomalies.',
        mitigationOwner: 'Chief Information Security Officer',
        humanApprovalRequired: true,
        approvalStatus: 'pending',
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'DETECTED',
            toStage: 'SCORED',
            actor: 'AI Safety Firewall',
            note: 'Attempted egress outside sandboxed domain boundaries intercepted.',
          },
          {
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            fromStage: 'SCORED',
            toStage: 'APPROVAL_REQUIRED',
            actor: 'AIFirewallService',
            note: 'Requires human security officer sign-off before unblocking connector.',
          },
        ],
      },
      {
        id: 'risk_v9_003',
        organizationId: orgId,
        domain: 'compliance',
        title: 'Document Retention & Cross-Border Sovereign Data Residency Policy',
        description: 'Ensuring financial ledger entries and customer personal data adhere to regional East African data protection regulations (Uganda Data Protection and Privacy Act, Kenya DPA).',
        severity: 'HIGH',
        probability: 30,
        impactScore: 75,
        riskScore: 22.5,
        lifecycleState: 'MITIGATION_EXECUTING',
        detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        affectedEntity: 'Customer Records Database & Ledger',
        proposedMitigation: 'Implement immutable tenant-isolated cryptographic partitions and regional geo-tagging.',
        mitigationOwner: 'Knowledge & Documentation Agent',
        humanApprovalRequired: true,
        approvalStatus: 'approved',
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'DETECTED',
            toStage: 'MITIGATION_PROPOSED',
            actor: 'Compliance Engine',
            note: 'Identified cross-border jurisdiction boundary requirements.',
          },
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            fromStage: 'MITIGATION_PROPOSED',
            toStage: 'MITIGATION_EXECUTING',
            actor: 'General Counsel',
            note: 'Approved sovereign data partitioning policy SEC-GOV-09.',
          },
        ],
      },
      {
        id: 'risk_v9_004',
        organizationId: orgId,
        domain: 'operational',
        title: 'Single-Agent Dependency Bottleneck in Software Engineering Squad',
        description: 'Software Engineering & QA Agent is currently assigned 82% of all automated test and lint validation runs, creating a single point of queuing delay during peak deployments.',
        severity: 'MEDIUM',
        probability: 40,
        impactScore: 50,
        riskScore: 20,
        lifecycleState: 'MITIGATION_PROPOSED',
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        affectedEntity: 'Agent Workforce Task Scheduler',
        proposedMitigation: 'Introduce Architecture Agent and Document Agent load-sharing for schema and markdown validation.',
        mitigationOwner: 'Operational Optimizer Agent',
        humanApprovalRequired: false,
        approvalStatus: 'none',
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            fromStage: 'DETECTED',
            toStage: 'MITIGATION_PROPOSED',
            actor: 'Workforce Intelligence Monitor',
            note: 'Detected workload imbalance during sprint burndown.',
          },
        ],
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.ENTERPRISE_RISKS}_${orgId}`, JSON.stringify(defaultRisks));
    return defaultRisks;
  }

  /**
   * Register a new enterprise risk across any of the 11 domains
   */
  public static addRisk(orgId: string, risk: Omit<EnterpriseRiskItem, 'id' | 'detectedAt' | 'auditTrail'>): EnterpriseRiskItem {
    const risks = this.getRisks(orgId);
    const now = new Date().toISOString();
    const newRisk: EnterpriseRiskItem = {
      ...risk,
      id: `risk_v9_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      detectedAt: now,
      auditTrail: [
        {
          timestamp: now,
          fromStage: 'DETECTED',
          toStage: risk.lifecycleState || 'DETECTED',
          actor: 'Risk Engine',
          note: 'Risk item registered into Enterprise Risk Engine.',
        },
      ],
    };

    risks.unshift(newRisk);
    localStorage.setItem(`${STORAGE_KEYS.ENTERPRISE_RISKS}_${orgId}`, JSON.stringify(risks));

    GovernanceService.addAuditLog({
      id: `audit_risk_${Date.now()}`,
      organizationId: orgId,
      actorId: 'risk_engine',
      actorName: 'Enterprise Risk Engine',
      actorRole: 'system',
      action: `ENTERPRISE_RISK_REGISTERED: [${newRisk.domain.toUpperCase()}] ${newRisk.title}`,
      resourceType: 'enterprise_risk',
      resourceId: newRisk.id,
      outcome: 'success',
      details: {
        domain: newRisk.domain,
        severity: newRisk.severity,
        riskScore: newRisk.riskScore,
        lifecycleState: newRisk.lifecycleState,
      },
      timestamp: now,
    });

    return newRisk;
  }

  /**
   * Advance a risk through its 9-stage lifecycle with governance checks
   */
  public static transitionRiskStage(params: {
    orgId: string;
    riskId: string;
    toStage: RiskLifecycleStage;
    actorName: string;
    note: string;
    approvalDecision?: 'approved' | 'rejected';
  }): boolean {
    const risks = this.getRisks(params.orgId);
    const risk = risks.find(r => r.id === params.riskId);
    if (!risk) return false;

    // Safety enforcement: Transitioning out of APPROVAL_REQUIRED requires explicit approval
    if (risk.lifecycleState === 'APPROVAL_REQUIRED' && params.toStage !== 'APPROVAL_REQUIRED') {
      if (risk.humanApprovalRequired && params.approvalDecision !== 'approved') {
        console.warn('Cannot transition risk without human approval');
        return false;
      }
    }

    const fromStage = risk.lifecycleState;
    risk.lifecycleState = params.toStage;
    if (params.approvalDecision) {
      risk.approvalStatus = params.approvalDecision;
    }
    if (params.toStage === 'RESOLVED' || params.toStage === 'CLOSED') {
      risk.resolvedAt = new Date().toISOString();
    }

    risk.auditTrail.push({
      timestamp: new Date().toISOString(),
      fromStage,
      toStage: params.toStage,
      actor: params.actorName,
      note: params.note,
    });

    localStorage.setItem(`${STORAGE_KEYS.ENTERPRISE_RISKS}_${params.orgId}`, JSON.stringify(risks));

    GovernanceService.addAuditLog({
      id: `audit_risk_transition_${Date.now()}`,
      organizationId: params.orgId,
      actorId: params.actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.actorName,
      actorRole: 'compliance_officer',
      action: `RISK_LIFECYCLE_TRANSITION: ${fromStage} -> ${params.toStage}`,
      resourceType: 'enterprise_risk',
      resourceId: risk.id,
      outcome: 'success',
      details: {
        fromStage,
        toStage: params.toStage,
        note: params.note,
        title: risk.title,
      },
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}
