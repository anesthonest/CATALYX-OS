import { DecisionComparisonRecord, DecisionOption } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  DECISIONS: 'catalyx_v9_decision_comparisons',
};

export class DecisionIntelligenceService {
  /**
   * Fetch all decision comparison records
   */
  public static getDecisions(orgId: string): DecisionComparisonRecord[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DECISIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing decision records:', e);
      }
    }

    const defaultDecisions: DecisionComparisonRecord[] = [
      {
        id: 'dec_v9_001',
        organizationId: orgId,
        title: 'Payment Clearing Rail Selection for East Africa B2B Subscriptions',
        businessContext: 'Need to maximize subscription conversion while minimizing cross-border settlement fees and compliance overhead across Uganda and Kenya.',
        options: [
          {
            optionId: 'opt_pesapal_direct',
            optionName: 'Option A: Direct Pesapal API v3 Multi-Currency Gateway',
            description: 'Route all UGX and KES transactions through direct Pesapal v3 clearing with native Mobile Money and local card support.',
            estimatedCostMinorUnits: 25000, // $250.00 integration test budget
            estimatedBenefit: 'Eliminates 3.8% FX conversion penalty; unlocks 84% customer preference for MTN/Airtel/M-Pesa rails.',
            riskScore: 18,
            requiredResources: ['Finance Agent', 'Pesapal Connector v3'],
            timeline: '3 days deployment',
            dependencies: ['Pesapal IPN Webhook verification'],
            predictedOutcome: '+$16,800 annual margin retention; zero failed international card declines.',
            strategicAlignmentScore: 96,
          },
          {
            optionId: 'opt_intl_stripe_only',
            optionName: 'Option B: Retain International Card Rail Only (USD Only)',
            description: 'Force all African enterprise clients to pay in USD via international payment rails.',
            estimatedCostMinorUnits: 0,
            estimatedBenefit: 'Zero engineering effort; uses legacy single-currency billing pipeline.',
            riskScore: 68,
            requiredResources: ['None'],
            timeline: 'Immediate (status quo)',
            dependencies: ['None'],
            predictedOutcome: '35% checkout abandonment rate due to bank FX blocks on international corporate cards.',
            strategicAlignmentScore: 42,
          },
          {
            optionId: 'opt_manual_invoicing',
            optionName: 'Option C: Hybrid Manual Bank Wire & Custom Invoicing',
            description: 'Provide manual PDF invoices with direct swift bank routing for every regional subscription.',
            estimatedCostMinorUnits: 80000, // $800.00/mo ongoing human manual labor
            estimatedBenefit: 'Supports bespoke wire transfers for very large tier enterprises.',
            riskScore: 54,
            requiredResources: ['Billing Operations Staff', 'Manual Reconciliation'],
            timeline: '2 weeks setup',
            dependencies: ['Manual bank account reconciliation'],
            predictedOutcome: 'High operational overhead; accounts receivable cycle exceeds 38 days.',
            strategicAlignmentScore: 58,
          },
        ],
        selectedOptionId: 'opt_pesapal_direct',
        humanDecisionMaker: 'Chief Financial Officer & Executive Committee',
        decisionRationale: 'Option A delivers superior customer conversion, native currency settlement, and integrates directly with our automated ledger.',
        decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        trackedOutcome: 'Pesapal integration active; processed 4 subscriptions with 0 foreign exchange loss.',
        outcomeVerified: true,
        outcomeEvaluation: 'Exceeded expected performance: zero settlement failures and instant customer activation.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dec_v9_002',
        organizationId: orgId,
        title: 'Autonomous Code Review & QA Gate Enforcement Policy',
        businessContext: 'Determine safety boundaries for Software Engineering & QA Agent when reviewing and merging pull requests to staging environments.',
        options: [
          {
            optionId: 'opt_level2_prepare',
            optionName: 'Option A: Autonomy Level 2 (PREPARE) — AI pre-checks, Human signs off',
            description: 'Agent runs linter, test suite, and security audit, presenting a comprehensive report. Human lead performs merge.',
            estimatedCostMinorUnits: 5000, // $50 compute cost
            estimatedBenefit: '100% human accountability with 80% time saved on repetitive code reviews.',
            riskScore: 12,
            requiredResources: ['Software Engineering Agent', 'GitHub Connector'],
            timeline: 'Active today',
            dependencies: ['CI/CD Pipeline webhook'],
            predictedOutcome: 'Zero regression escapes; developer turnaround reduced by 45 minutes per PR.',
            strategicAlignmentScore: 94,
          },
          {
            optionId: 'opt_level4_full_auto',
            optionName: 'Option B: Autonomy Level 4 (FULL AUTO) — Direct autonomous merge to staging',
            description: 'Agent automatically merges pull requests if test coverage and linter pass with 100% green status.',
            estimatedCostMinorUnits: 5000,
            estimatedBenefit: 'Zero human latency in staging deployments.',
            riskScore: 72,
            requiredResources: ['Software Engineering Agent'],
            timeline: 'Requires policy override',
            dependencies: ['Automated test suite'],
            predictedOutcome: 'High risk of subtle architectural anti-patterns escaping into shared staging environment.',
            strategicAlignmentScore: 52,
          },
        ],
        selectedOptionId: 'opt_level2_prepare',
        humanDecisionMaker: 'Chief Technology Officer',
        decisionRationale: 'Maintains strict compliance with CATALYX autonomy principle: high-impact code changes require human sign-off.',
        decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        trackedOutcome: '18 pull requests reviewed; 0 regressions in staging.',
        outcomeVerified: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.DECISIONS}_${orgId}`, JSON.stringify(defaultDecisions));
    return defaultDecisions;
  }

  /**
   * Create a new decision comparison record
   */
  public static addDecision(orgId: string, decision: Omit<DecisionComparisonRecord, 'id' | 'createdAt' | 'outcomeVerified'>): DecisionComparisonRecord {
    const decisions = this.getDecisions(orgId);
    const newDecision: DecisionComparisonRecord = {
      ...decision,
      id: `dec_v9_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      outcomeVerified: false,
      createdAt: new Date().toISOString(),
    };

    decisions.unshift(newDecision);
    localStorage.setItem(`${STORAGE_KEYS.DECISIONS}_${orgId}`, JSON.stringify(decisions));

    GovernanceService.addAuditLog({
      id: `audit_dec_${Date.now()}`,
      organizationId: orgId,
      actorId: 'decision_intelligence',
      actorName: 'Decision Intelligence Engine',
      actorRole: 'system',
      action: `DECISION_COMPARISON_CREATED: ${newDecision.title}`,
      resourceType: 'decision_comparison',
      resourceId: newDecision.id,
      outcome: 'success',
      details: {
        optionsCount: newDecision.options.length,
        context: newDecision.businessContext,
      },
      timestamp: new Date().toISOString(),
    });

    return newDecision;
  }

  /**
   * Record human decision selection and rationale
   */
  public static recordDecisionChoice(params: {
    orgId: string;
    decisionId: string;
    selectedOptionId: string;
    humanDecisionMaker: string;
    decisionRationale: string;
  }): boolean {
    const decisions = this.getDecisions(params.orgId);
    const dec = decisions.find(d => d.id === params.decisionId);
    if (!dec) return false;

    dec.selectedOptionId = params.selectedOptionId;
    dec.humanDecisionMaker = params.humanDecisionMaker;
    dec.decisionRationale = params.decisionRationale;
    dec.decidedAt = new Date().toISOString();

    localStorage.setItem(`${STORAGE_KEYS.DECISIONS}_${params.orgId}`, JSON.stringify(decisions));

    GovernanceService.addAuditLog({
      id: `audit_decision_choice_${Date.now()}`,
      organizationId: params.orgId,
      actorId: params.humanDecisionMaker.toLowerCase().replace(/\s+/g, '_'),
      actorName: params.humanDecisionMaker,
      actorRole: 'executive',
      action: `DECISION_RATIFIED: Option [${params.selectedOptionId}] selected`,
      resourceType: 'decision_comparison',
      resourceId: params.decisionId,
      outcome: 'success',
      details: {
        selectedOptionId: params.selectedOptionId,
        rationale: params.decisionRationale,
      },
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Track eventual outcome and verify organizational learning
   */
  public static verifyOutcome(params: {
    orgId: string;
    decisionId: string;
    trackedOutcome: string;
    outcomeEvaluation: string;
  }): boolean {
    const decisions = this.getDecisions(params.orgId);
    const dec = decisions.find(d => d.id === params.decisionId);
    if (!dec) return false;

    dec.trackedOutcome = params.trackedOutcome;
    dec.outcomeEvaluation = params.outcomeEvaluation;
    dec.outcomeVerified = true;

    localStorage.setItem(`${STORAGE_KEYS.DECISIONS}_${params.orgId}`, JSON.stringify(decisions));
    return true;
  }
}
