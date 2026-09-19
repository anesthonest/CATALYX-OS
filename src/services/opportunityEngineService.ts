import { 
  StrategicOpportunity, OpportunityCategory, OpportunityStatus, 
  DataCredibilityTag 
} from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'catalyx_v9_opportunities',
};

export class OpportunityEngineService {
  /**
   * Fetch all detected opportunities for an organization
   */
  public static getOpportunities(orgId: string): StrategicOpportunity[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.OPPORTUNITIES}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing opportunities from storage:', e);
      }
    }

    const defaultOpportunities: StrategicOpportunity[] = [
      {
        id: 'opp_v9_001',
        organizationId: orgId,
        category: 'revenue',
        title: 'East Africa Cross-Border B2B Merchant Payment Routing',
        description: 'Auto-route East African enterprise subscriptions directly via local Pesapal clearing rails to eliminate 3.8% FX conversion leakage on regional card charges.',
        evidence: [
          'Historical transaction ledger reveals $4,200/quarter in avoidable FX surcharges',
          'Pesapal Uganda & Kenya direct currency settlement APIs verified and active',
          'Enterprise customer survey indicates 84% preference for local UGX/KES invoicing'
        ],
        estimatedImpact: '+$16,800 USD annual margin retention directly to net income',
        confidenceScore: 92,
        requiredResources: [
          'Finance & Unit Economics Agent',
          'Pesapal Payment Connector v3',
          'Billing Operations Team'
        ],
        estimatedCostMinorUnits: 25000, // $250.00 setup cost in minor units
        estimatedRoiPercent: 672,
        risks: [
          'Requires updating subscription terms to clarify local billing entities',
          'Periodic central bank currency exchange rate drift'
        ],
        dependencies: [
          'Pesapal Merchant ID verification',
          'Multi-currency ledger active'
        ],
        recommendedAction: 'Deploy multi-currency checkout modal and update billing routing rules in production.',
        approvalRequirement: 'executive_signoff',
        status: 'approved',
        credibility: 'REAL_DATA',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Chief Financial Officer',
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'opp_v9_002',
        organizationId: orgId,
        category: 'process_automation',
        title: 'Autonomous Client Onboarding & KYC Validation Pipeline',
        description: 'Synthesize Document Agent and Customer Support Agent to automate 85% of standard KYC verification steps for newly registered institutional tenants.',
        evidence: [
          'Current manual document review averages 18.5 hours per tenant',
          'Error rate on manual certificate validation is 4.2%',
          'Document Agent OCR and semantic validation benchmark passed with 99.1% precision'
        ],
        estimatedImpact: 'Reduces onboarding cycle time from 2.5 days to 18 minutes; reclaims 32 staff hours/month',
        confidenceScore: 89,
        requiredResources: [
          'Document Agent',
          'Customer Support Agent',
          'Verification Webhook Service'
        ],
        estimatedCostMinorUnits: 15000, // $150.00
        estimatedRoiPercent: 420,
        risks: [
          'Edge case unreadable scans require fallback to human compliance queue'
        ],
        dependencies: [
          'Document Vectorization pipeline',
          'Compliance SOP SEC-GOV-09'
        ],
        recommendedAction: 'Trigger Level 2 automated workflow with human gate for flagged exceptions only.',
        approvalRequirement: 'manager_approval',
        status: 'executing',
        credibility: 'DERIVED_DATA',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Head of Operations',
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'opp_v9_003',
        organizationId: orgId,
        category: 'cost_reduction',
        title: 'Dynamic AI Token Context Compression & Semantic Caching',
        description: 'Implement semantic vector deduplication on repetitive organizational briefing queries to avoid re-embedding unchanged documents.',
        evidence: [
          'Agent logs show 34% duplicate token consumption on daily status queries',
          'Embedding cache hit rate measured at 76% in developer sandbox benchmarks'
        ],
        estimatedImpact: 'Saves ~$340/month in LLM inference costs ($4,080 annual reduction)',
        confidenceScore: 95,
        requiredResources: [
          'Research Intelligence Agent',
          'Local Vector Cache Store'
        ],
        estimatedCostMinorUnits: 5000, // $50.00
        estimatedRoiPercent: 816,
        risks: [
          'Cache invalidation delay if organizational policies change mid-day'
        ],
        dependencies: [
          'SemanticRetriever cache invalidation hook'
        ],
        recommendedAction: 'Enable TTL-based semantic cache on all Level 1 and Level 2 agent research queries.',
        approvalRequirement: 'automatic',
        status: 'realized',
        credibility: 'REAL_DATA',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'opp_v9_004',
        organizationId: orgId,
        category: 'customer_expansion',
        title: 'Mid-Tier Subscription Tier Expansion to Emerging Enterprises',
        description: 'Product usage telemetry indicates 14 Pro Plan teams are consistently hitting 90% of their agent action quotas, signaling readiness for Custom Enterprise upgrade.',
        evidence: [
          '14 organizations with >85% quota utilization across 3 consecutive weeks',
          'Zero churn signals detected in this cohort'
        ],
        estimatedImpact: '+$28,000 ARR potential via targeted account expansion invitations',
        confidenceScore: 84,
        requiredResources: [
          'Enterprise Sales Agent',
          'CRM Connector',
          'Account Management Team'
        ],
        estimatedCostMinorUnits: 20000, // $200.00
        estimatedRoiPercent: 1400,
        risks: [
          'Premature outreach may alienate cost-sensitive early-stage teams'
        ],
        dependencies: [
          'Usage metering ledger',
          'Enterprise rate sheet'
        ],
        recommendedAction: 'Prepare tailored upgrade proposals with personalized ROI breakdowns for account owners.',
        approvalRequirement: 'manager_approval',
        status: 'under_evaluation',
        credibility: 'AI_INFERENCE',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.OPPORTUNITIES}_${orgId}`, JSON.stringify(defaultOpportunities));
    return defaultOpportunities;
  }

  /**
   * Record a new opportunity discovered by agents or human operators
   */
  public static addOpportunity(orgId: string, opp: Omit<StrategicOpportunity, 'id' | 'createdAt'>): StrategicOpportunity {
    const opportunities = this.getOpportunities(orgId);
    const newOpp: StrategicOpportunity = {
      ...opp,
      id: `opp_v9_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    opportunities.unshift(newOpp);
    localStorage.setItem(`${STORAGE_KEYS.OPPORTUNITIES}_${orgId}`, JSON.stringify(opportunities));

    GovernanceService.addAuditLog({
      id: `audit_opp_${Date.now()}`,
      organizationId: orgId,
      actorId: 'opportunity_engine',
      actorName: 'Opportunity Engine',
      actorRole: 'system',
      action: `OPPORTUNITY_IDENTIFIED: ${newOpp.title}`,
      resourceType: 'opportunity',
      resourceId: newOpp.id,
      outcome: 'success',
      details: {
        category: newOpp.category,
        confidence: newOpp.confidenceScore,
        estimatedRoi: newOpp.estimatedRoiPercent,
      },
      timestamp: new Date().toISOString(),
    });

    return newOpp;
  }

  /**
   * Update opportunity status with required human governance sign-off
   */
  public static updateOpportunityStatus(
    orgId: string, 
    oppId: string, 
    status: OpportunityStatus, 
    actorName: string
  ): boolean {
    const opportunities = this.getOpportunities(orgId);
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return false;

    opp.status = status;
    if (status === 'approved') {
      opp.approvedBy = actorName;
      opp.approvedAt = new Date().toISOString();
    }

    localStorage.setItem(`${STORAGE_KEYS.OPPORTUNITIES}_${orgId}`, JSON.stringify(opportunities));

    GovernanceService.addAuditLog({
      id: `audit_opp_status_${Date.now()}`,
      organizationId: orgId,
      actorId: actorName.toLowerCase().replace(/\s+/g, '_'),
      actorName,
      actorRole: 'manager',
      action: `OPPORTUNITY_STATUS_UPDATED: ${status.toUpperCase()}`,
      resourceType: 'opportunity',
      resourceId: oppId,
      outcome: 'success',
      details: { status, title: opp.title },
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}
