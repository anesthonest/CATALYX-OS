import { ExecutiveBriefing } from '../types';

const STORAGE_KEY_BRIEFINGS = 'catalyx_v8_executive_briefings';

export class ExecutiveIntelligenceService {
  public static getBriefings(orgId: string): ExecutiveBriefing[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_BRIEFINGS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing briefings:', e);
      }
    }

    const defaultBriefings: ExecutiveBriefing[] = [
      {
        id: 'brief_001',
        organizationId: orgId,
        period: 'daily',
        generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        whatHappened: [
          '38 automated agent micro-actions executed across the engineering and operations pipeline.',
          'Pesapal subscription verification pipeline processed 3 renewals with 0 settlement errors.',
          'Sprint throughput reached 88 velocity points with 142 tasks closed over the 30-day trailing window.',
        ],
        whatChanged: [
          'Sovereign enterprise pricing plan ratified into official catalog (UGX 2,000,000 / $520 USD).',
          'Autonomy Level 3 granted to Operational Optimizer Agent for internal queue re-balancing.',
          'Focus Cabin logs increased by 22% among core platform contributors.',
        ],
        whatMatters: [
          'Regional East Africa SaaS expansion is maintaining strong gross margins (+24.7% projected).',
          'Cash runway remains sturdy at 19.5 months based on current $14,500/mo net operational burn.',
          'Organizational memory adherence is currently at 94% across all automated task breakdown steps.',
        ],
        whatRequiresAttention: [
          'Pending Human Approval: Knowledge Agent requests compliance sign-off on SEC-GOV-09.',
          'Pending Human Approval: Payment gateway retry authorization for 4 queued callbacks.',
          'Customer support inbound volume projected to rise by 58% if marketing spend increases by 35%.',
        ],
        whatIsRecommended: [
          'Review and approve SEC-GOV-09 in the Approvals Queue to lock in authoritative status.',
          'Pre-configure Level 2 Customer Support Agent workflows before launching the regional marketing blitz.',
          'Conduct quarterly unit economics audit with Finance Agent to confirm Pesapal mobile money fee absorption.',
        ],
        metricsSnapshot: {
          executionVelocity: 88,
          activeRiskAlerts: 2,
          pendingApprovals: 2,
          budgetUsedPercent: 28.5,
          aiCostMonthToDateUsd: 18.42,
        },
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_BRIEFINGS}_${orgId}`, JSON.stringify(defaultBriefings));
    return defaultBriefings;
  }

  public static generateBriefing(orgId: string, period: 'daily' | 'weekly'): ExecutiveBriefing {
    const briefing: ExecutiveBriefing = {
      id: `brief_${Date.now()}`,
      organizationId: orgId,
      period,
      generatedAt: new Date().toISOString(),
      whatHappened: [
        `Executed multi-point operational scan across all active workspaces and departments.`,
        `Autonomous Orchestrator validated 2 complex initiatives under controlled safety boundaries.`,
        `Revenue ledger confirmed healthy multi-currency transactions across UGX, KES, and USD.`,
      ],
      whatChanged: [
        `Operational efficiency score calibrated at 84% based on recent task completion telemetry.`,
        `AI Workforce allocated compute load balanced evenly across 11 active specializations.`,
      ],
      whatMatters: [
        `Core platform stability index is operating at 99.98% across all micro-services.`,
        `Zero unauthorized tool invocations or un-gated financial expenditures detected.`,
      ],
      whatRequiresAttention: [
        `Ensure human approvers review pending policy updates in the Governance Queue.`,
      ],
      whatIsRecommended: [
        `Proceed with regular sprint execution and maintain continuous digital twin calibration.`,
      ],
      metricsSnapshot: {
        executionVelocity: 91,
        activeRiskAlerts: 1,
        pendingApprovals: 2,
        budgetUsedPercent: 31.2,
        aiCostMonthToDateUsd: 21.15,
      },
    };

    const briefings = this.getBriefings(orgId);
    briefings.unshift(briefing);
    localStorage.setItem(`${STORAGE_KEY_BRIEFINGS}_${orgId}`, JSON.stringify(briefings));

    return briefing;
  }
}
