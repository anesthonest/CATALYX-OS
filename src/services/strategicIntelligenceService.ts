import { StrategicObjective } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  STRATEGIC_OBJECTIVES: 'catalyx_v9_strategic_objectives',
};

export class StrategicIntelligenceService {
  /**
   * Fetch all active strategic objectives with their lineage
   */
  public static getObjectives(orgId: string): StrategicObjective[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.STRATEGIC_OBJECTIVES}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing strategic objectives from storage:', e);
      }
    }

    const defaultObjectives: StrategicObjective[] = [
      {
        id: 'strat_v9_001',
        organizationId: orgId,
        goalId: 'goal_q3_autonomy',
        title: 'Establish Enterprise Autonomous Execution with Zero Un-Gated Financial Risk',
        strategy: 'Govern AI workforce using 10-step Execution Safety Gate and immutable minor-unit ledgers.',
        initiatives: [
          'Deploy AI Safety Firewall v9 with multi-party human approval queue',
          'Calibrate 11 specialist agent capability profiles and skill registry',
          'Integrate Pesapal reconciliation idempotency verification engine',
        ],
        targetMetric: '100% compliance across all autonomous agent actions; 0 unapproved expenditures',
        baselineValue: '85% automated safety coverage; 2 manual audit escapes/mo',
        currentStateValue: '100% safety gate coverage; 0 unapproved expenditures',
        progressPercent: 94,
        probabilityOfSuccessPercent: 96,
        dependencies: [
          'AIFirewallService v9 active',
          'GovernanceService audit logging'
        ],
        risks: [
          'Potential review queue latency if human approval volume surges'
        ],
        resources: [
          'Operational Optimizer Agent',
          'Finance & Unit Economics Agent',
          'Security Committee'
        ],
        projectedCompletionDate: '2026-09-30',
        actualOutcome: 'Zero unauthorized actions recorded; financial safety compliance certified.',
        isDiverging: false,
        status: 'on_track',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'strat_v9_002',
        organizationId: orgId,
        goalId: 'goal_q3_expansion',
        title: 'Accelerate East Africa Commercial SaaS Adoption via Sovereign Payment Rails',
        strategy: 'Position CATALYX as the trusted local & pan-African operating system supporting UGX, KES, and USD.',
        initiatives: [
          'Ratify Sovereign Enterprise plan pricing (UGX 2,000,000 / month)',
          'Integrate Pesapal Mobile Money and card checkout in marketplace',
          'Deploy Developer Sandbox for regional enterprise ISV testing',
        ],
        targetMetric: '$75,000 Quarterly Run-Rate across East African enterprise accounts',
        baselineValue: '$22,400 Monthly Revenue ($67,200 Q-Run-Rate)',
        currentStateValue: '$24,800 Monthly Revenue ($74,400 Q-Run-Rate)',
        progressPercent: 88,
        probabilityOfSuccessPercent: 91,
        dependencies: [
          'Pesapal Payment Connector v3',
          'Developer Sandbox Service'
        ],
        risks: [
          'Foreign exchange fluctuations between UGX/KES and USD base currency'
        ],
        resources: [
          'Enterprise Sales Agent',
          'Growth & Marketing Agent',
          'Regional Account Executive Squad'
        ],
        projectedCompletionDate: '2026-10-15',
        isDiverging: false,
        status: 'on_track',
        createdAt: '2026-08-10T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'strat_v9_003',
        organizationId: orgId,
        goalId: 'goal_q3_workforce',
        title: 'Institutionalize Continuous Intelligence and Cross-Departmental Knowledge Reuse',
        strategy: 'Transform fragmented task lists into a self-calibrating institutional memory loop.',
        initiatives: [
          'Ingest and vectorize all company SOPs, ADRs, and post-mortems',
          'Deploy Workforce Intelligence Monitor to prevent squad burnout',
          'Synthesize Executive Briefings for real-time situational awareness',
        ],
        targetMetric: '>90% Knowledge Universe recall precision; <25 burnout risk index',
        baselineValue: '72% recall precision; 38 burnout risk index',
        currentStateValue: '94% recall precision; 24 burnout risk index',
        progressPercent: 91,
        probabilityOfSuccessPercent: 94,
        dependencies: [
          'KnowledgeUniverseScanner',
          'ExecutiveIntelligenceService'
        ],
        risks: [
          'Stale documentation if engineering teams bypass ADR publication'
        ],
        resources: [
          'Research Intelligence Agent',
          'Knowledge & Documentation Agent',
          'Head of Engineering'
        ],
        projectedCompletionDate: '2026-09-25',
        isDiverging: false,
        status: 'on_track',
        createdAt: '2026-08-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.STRATEGIC_OBJECTIVES}_${orgId}`, JSON.stringify(defaultObjectives));
    return defaultObjectives;
  }

  /**
   * Evaluate whether execution is diverging from strategic objectives
   */
  public static evaluateDivergence(orgId: string): Array<{ objectiveId: string; title: string; isDiverging: boolean; explanation?: string }> {
    const objectives = this.getObjectives(orgId);
    return objectives.map(obj => {
      // Divergence condition: progress falling significantly behind schedule or high risk factor
      let isDiverging = false;
      let explanation: string | undefined;

      if (obj.probabilityOfSuccessPercent < 70) {
        isDiverging = true;
        explanation = `Success probability dropped to ${obj.probabilityOfSuccessPercent}%. Task dependencies are lagging behind target timeline.`;
      } else if (obj.status === 'diverged') {
        isDiverging = true;
        explanation = obj.divergenceExplanation || 'Execution path has strayed from original OKR milestones.';
      }

      return {
        objectiveId: obj.id,
        title: obj.title,
        isDiverging,
        explanation,
      };
    });
  }

  /**
   * Add or update a strategic objective
   */
  public static saveObjective(objective: StrategicObjective): void {
    const objectives = this.getObjectives(objective.organizationId);
    const index = objectives.findIndex(o => o.id === objective.id);
    if (index >= 0) {
      objectives[index] = { ...objective, updatedAt: new Date().toISOString() };
    } else {
      objectives.unshift({ ...objective, updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(`${STORAGE_KEYS.STRATEGIC_OBJECTIVES}_${objective.organizationId}`, JSON.stringify(objectives));

    GovernanceService.addAuditLog({
      id: `audit_strat_${Date.now()}`,
      organizationId: objective.organizationId,
      actorId: 'strategy_engine',
      actorName: 'Strategic Intelligence Layer',
      actorRole: 'system',
      action: `STRATEGIC_OBJECTIVE_SAVED: ${objective.title}`,
      resourceType: 'strategic_objective',
      resourceId: objective.id,
      outcome: 'success',
      details: {
        progress: objective.progressPercent,
        probability: objective.probabilityOfSuccessPercent,
        status: objective.status,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
