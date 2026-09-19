import { ProposedOptimization, OptimizationDomain } from '../types';

class OrganizationalOptimizationService {
  private proposals: ProposedOptimization[] = [
    {
      id: 'opt-prod-001',
      organizationId: 'org-enterprise-main',
      domain: 'PRODUCTIVITY',
      title: 'Automated Cross-Department Sprint Alignment & Dependency Synchronization',
      currentBaseline: 'Cross-functional engineering and design handoffs take 3.8 days with 24% manual status checking overhead.',
      problem: 'Information silos and asynchronous milestone drifts create 14 hours of weekly status meeting overhead across 6 squads.',
      evidence: [
        'Bi-weekly scrum log audits show 41 delayed handoffs between squads',
        '28% of mission PRs blocked waiting for downstream approval tickets',
        'Calendar telemetry shows 14.2 hours per developer spent in synchronization syncs'
      ],
      proposedChange: 'Deploy an autonomous event-driven sprint alignment hook that auto-synthesizes ticket blockers, reconciles PR dependencies, and provides morning asynchronous briefings.',
      expectedBenefit: '+24% sprint delivery velocity, reduction of 9 meeting hours/week per team lead, zero unnotified dependency breaks.',
      estimatedCostMinorUnits: 45000, // $450.00
      currency: 'USD',
      implementationTime: '3 business days',
      risks: [
        'Initial squad resistance to automated blocker escalations',
        'Edge-case external vendor ticket format discrepancies'
      ],
      dependencies: ['Git webhook mesh', 'Jira/Linear connector active', 'Execution Gateway v9 enabled'],
      confidenceScore: 0.94,
      approvalRequirements: {
        requiresHumanAuth: true,
        requiredRole: 'VP of Engineering / Product Director',
        status: 'PENDING_APPROVAL',
      },
      measurementCriteria: [
        'Average sprint cycle time reduction from 14 days to 10.5 days',
        'Blocked PR idle time < 3 hours',
        'Meeting load reduction verified via calendar analytics'
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opt-cost-002',
      organizationId: 'org-enterprise-main',
      domain: 'COST_EFFICIENCY',
      title: 'Dynamic AI Model Tier Routing & Semantic Cache Consolidation',
      currentBaseline: 'Flat routing of all summarization and classification queries to flagship Tier-1 LLM at $0.025/1k tokens ($3,420/month).',
      problem: '82% of routine extraction, classification, and validation tasks do not require flagship models and can be served by sub-cent specialized models with caching.',
      evidence: [
        'Token analysis shows 74,000 repetitive query embeddings in 30 days',
        'Mean latency for classification is 1,840ms on Tier-1 vs 210ms on specialized Flash models',
        'Semantic similarity audit reveals 48% cache-hit capability'
      ],
      proposedChange: 'Implement semantic vector cache for identical prompts (TTL 12h) and dynamic 3-tier routing: Heuristic/Regex -> Flash/Specialized -> Flagship.',
      expectedBenefit: '62% reduction in monthly AI inference expenditures (-$2,120/mo savings) and 4.2x faster response latency.',
      estimatedCostMinorUnits: 25000, // $250.00
      currency: 'USD',
      implementationTime: '1 business day',
      risks: [
        'Semantic cache invalidation lag on rapidly changing product pricing docs'
      ],
      dependencies: ['AI Safety Firewall 2.0', 'Usage Metering Service v8'],
      confidenceScore: 0.97,
      approvalRequirements: {
        requiresHumanAuth: true,
        requiredRole: 'Head of Infrastructure / FinOps Lead',
        status: 'PENDING_APPROVAL',
      },
      measurementCriteria: [
        'Monthly GenAI invoice reduction >= 50%',
        'Semantic cache hit rate >= 40%',
        'Zero regression on accuracy benchmark (<0.1% drift)'
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opt-rev-003',
      organizationId: 'org-enterprise-main',
      domain: 'REVENUE',
      title: 'Autonomous Mid-Market Enterprise Seat Expansion & Usage-Triggered Upgrades',
      currentBaseline: 'Manual sales account outreach triggering upgrades only after customer hits 100% capacity and encounters hard blocks.',
      problem: 'Customers hitting 100% quota encounter sudden 429 rate-limit errors, causing frustration and a 12% churn rate upon tier threshold.',
      evidence: [
        '18 high-growth accounts saturated 90%+ seats for 3 consecutive weeks without sales contact',
        'Average upgrade latency was 26 days after initial capacity saturation',
        '3 mid-market clients downgraded after encountering unexpected API lockouts'
      ],
      proposedChange: 'Introduce proactive smart entitlement warnings at 80% and 90% utilization with frictionless in-app 1-click self-service expansion and volume discounts.',
      expectedBenefit: '+18% Net Revenue Retention (NRR) expansion, shortening upgrade cycle from 26 days to 1.8 days.',
      estimatedCostMinorUnits: 15000, // $150.00
      currency: 'USD',
      implementationTime: '2 business days',
      risks: [
        'Must preserve strict commercial ledger integrity and customer billing agreement terms'
      ],
      dependencies: ['Commercial Billing Engine v8.1', 'Pesapal Ledger v3'],
      confidenceScore: 0.91,
      approvalRequirements: {
        requiresHumanAuth: true,
        requiredRole: 'Chief Revenue Officer / VP of Sales',
        status: 'APPROVED',
        approvedBy: 'cro@catalyx.vinexsah.internal',
        approvedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      measurementCriteria: [
        'Upgrade velocity improved to < 3 days',
        'Threshold-induced customer churn reduced to 0%',
        '+$14,200 MRR addition within 60 days'
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opt-ret-004',
      organizationId: 'org-enterprise-main',
      domain: 'CUSTOMER_RETENTION',
      title: 'Predictive Health Score Early-Warning Intervention for At-Risk Enterprise Tenants',
      currentBaseline: 'Customer churn discovered post-facto when cancellation notices or non-renewals are received at contract expiration.',
      problem: 'Silent degradation in daily active user login frequency and API call depth 45 days prior to contract renewal.',
      evidence: [
        'Historical churn analysis of 9 accounts showed 65% drop in weekly workflow runs 6 weeks prior to churn',
        'Support ticket sentiment analysis showed unexpressed frustration in 4 instances with no proactive escalation'
      ],
      proposedChange: 'Connect continuous health score radar with autonomous CS playbooks: automatic executive sponsorship outreach and dedicated solutions engineer check-in.',
      expectedBenefit: 'Save estimated 4 enterprise accounts annually (~$96,000 ARR protected), reducing annual logo churn below 3%.',
      estimatedCostMinorUnits: 30000,
      currency: 'USD',
      implementationTime: '4 business days',
      risks: [
        'Tone of automated outreach must feel bespoke and highly consultative'
      ],
      dependencies: ['Organizational Health Radar v9', 'Decision Intelligence 2.0'],
      confidenceScore: 0.89,
      approvalRequirements: {
        requiresHumanAuth: true,
        requiredRole: 'VP of Customer Success',
        status: 'PENDING_APPROVAL',
      },
      measurementCriteria: [
        'At-risk accounts flagged at least 40 days in advance',
        'Resolution of sentiment friction in >= 75% of intervened accounts'
      ],
      createdAt: new Date().toISOString(),
    }
  ];

  public getProposals(orgId?: string): ProposedOptimization[] {
    return this.proposals;
  }

  public getProposalById(id: string): ProposedOptimization | undefined {
    return this.proposals.find(p => p.id === id);
  }

  public updateProposalStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'REALIZED',
    actor: string,
    rejectionReason?: string
  ): ProposedOptimization | null {
    const prop = this.proposals.find(p => p.id === id);
    if (!prop) return null;

    prop.approvalRequirements.status = status;
    if (status === 'APPROVED') {
      prop.approvalRequirements.approvedBy = actor;
      prop.approvalRequirements.approvedAt = new Date().toISOString();
    } else if (status === 'REJECTED') {
      prop.approvalRequirements.rejectionReason = rejectionReason || 'Rejected by authorized executive';
    }
    return prop;
  }

  public addProposal(item: Omit<ProposedOptimization, 'id' | 'createdAt'>): ProposedOptimization {
    const newProp: ProposedOptimization = {
      ...item,
      id: `opt-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.proposals.unshift(newProp);
    return newProp;
  }
}

export const organizationalOptimizationService = new OrganizationalOptimizationService();
