import { PredictiveSignal, PredictionType } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  PREDICTIONS: 'catalyx_v9_predictive_signals',
};

export class PredictiveInfrastructureService {
  /**
   * Fetch all active predictive signals for an organization
   */
  public static getSignals(orgId: string): PredictiveSignal[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PREDICTIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing predictive signals:', e);
      }
    }

    const defaultSignals: PredictiveSignal[] = [
      {
        id: 'pred_v9_001',
        organizationId: orgId,
        predictionType: 'revenue_trend',
        title: 'Q3 East Africa B2B Recurring Revenue Run-Rate Trajectory',
        confidencePercent: 88,
        evidence: [
          '4 active enterprise subscriptions renew on Day 28 with 0 delinquency flags',
          'Pesapal Mobile Money checkout conversion rate up +14% over trailing 14 days',
          'Pipeline velocity in regional sales indicates 3 pending quotes in negotiation'
        ],
        predictionHorizon: 'Next 45 Days (End of Q3)',
        modelVersion: 'Empirical-Regression-v9.2',
        uncertaintyRange: '± 6.5% variance due to foreign exchange rate fluctuations',
        explanation: 'Based on trailing 60-day renewal telemetry and committed annual contracts, projected quarterly revenue will reach $74,200 (target: $75,000).',
        suggestedIntervention: 'Execute timely renewals outreach with Enterprise Sales Agent 10 days prior to billing cycle.',
        generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pred_v9_002',
        organizationId: orgId,
        predictionType: 'resource_shortage',
        title: 'Customer Support Load Surge during Regional Marketing Rollout',
        confidencePercent: 82,
        evidence: [
          'Marketing campaign schedule includes 3 regional East Africa tech webinars',
          'Historical campaign correlations demonstrate a 2.4x inbound ticket multiplier within 48h of marketing push'
        ],
        predictionHorizon: 'Next 14 Days',
        modelVersion: 'TimeSeries-Prophet-v9.1',
        uncertaintyRange: '± 12% depending on actual webinar attendance conversion',
        explanation: 'Support queue is predicted to experience a 58% surge in ticket arrivals, potentially pushing first-response times from 4.2 mins to 22 mins if unassisted.',
        suggestedIntervention: 'Pre-arm Customer Support Agent with Autonomy Level 2 FAQ resolution workflows for event attendees.',
        generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pred_v9_003',
        organizationId: orgId,
        predictionType: 'project_delay',
        title: 'Sprint 14 Schema Migration Dependency Bottleneck',
        confidencePercent: 79,
        evidence: [
          'PostgreSQL migration script #MIG-884 requires CTO schema sign-off',
          'CTO calendar occupancy is 92% this sprint week'
        ],
        predictionHorizon: 'Next 5 Days',
        modelVersion: 'MonteCarlo-Gantt-v9.0',
        uncertaintyRange: '± 1.5 business days',
        explanation: 'If the migration script is not approved within 36 hours, downstream analytics indexing tasks will miss the sprint staging cut-off.',
        suggestedIntervention: 'Escalate schema approval request directly to CTO via high-priority Slack notification.',
        generatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pred_v9_004',
        organizationId: orgId,
        predictionType: 'customer_churn',
        title: 'Account Inactivity Alert on Pro Tier Tenant #ORG-9921',
        confidencePercent: 74,
        evidence: [
          'Zero agent executions or user logins recorded in the past 16 days',
          'Previous 3-month average usage was 42 task runs/week'
        ],
        predictionHorizon: 'Next 30 Days (Upcoming Renewal)',
        modelVersion: 'Logistic-Survival-v8.4',
        uncertaintyRange: '± 8% predictive confidence interval',
        explanation: 'Abrupt drop in telemetry activity signals high churn risk prior to the next Pesapal recurring payment cycle.',
        suggestedIntervention: 'Dispatch proactive customer success check-in with executive summary of untapped platform features.',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.PREDICTIONS}_${orgId}`, JSON.stringify(defaultSignals));
    return defaultSignals;
  }

  /**
   * Register a new predictive signal
   */
  public static addSignal(orgId: string, signal: Omit<PredictiveSignal, 'id' | 'generatedAt'>): PredictiveSignal {
    const signals = this.getSignals(orgId);
    const newSignal: PredictiveSignal = {
      ...signal,
      id: `pred_v9_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      generatedAt: new Date().toISOString(),
    };

    signals.unshift(newSignal);
    localStorage.setItem(`${STORAGE_KEYS.PREDICTIONS}_${orgId}`, JSON.stringify(signals));

    GovernanceService.addAuditLog({
      id: `audit_pred_${Date.now()}`,
      organizationId: orgId,
      actorId: 'predictive_infrastructure',
      actorName: 'Predictive Infrastructure Service',
      actorRole: 'system',
      action: `PREDICTION_GENERATED: [${newSignal.predictionType.toUpperCase()}] ${newSignal.title}`,
      resourceType: 'predictive_signal',
      resourceId: newSignal.id,
      outcome: 'success',
      details: {
        confidence: newSignal.confidencePercent,
        horizon: newSignal.predictionHorizon,
        modelVersion: newSignal.modelVersion,
      },
      timestamp: new Date().toISOString(),
    });

    return newSignal;
  }
}
