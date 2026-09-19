import { BusinessDigitalTwin, ScenarioSimulation } from '../types';

const STORAGE_KEY_TWIN = 'catalyx_v8_business_digital_twin';
const STORAGE_KEY_SIMULATIONS = 'catalyx_v8_scenario_simulations';

export class DigitalTwinService {
  public static getTwin(orgId: string): BusinessDigitalTwin {
    const raw = localStorage.getItem(`${STORAGE_KEY_TWIN}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing business twin:', e);
      }
    }

    const defaultTwin: BusinessDigitalTwin = {
      organizationId: orgId,
      operationalModel: {
        departmentsCount: 4,
        headcountTotal: 18,
        activeProjectsCount: 7,
        activeGoalsCount: 12,
        monthlyBurnUsd: 14500,
        monthlyRevenueUsd: 22400,
        runwayMonths: 19.5,
        operationalEfficiencyScore: 84,
      },
      observedData: {
        completedTasksLast30Days: 142,
        avgCycleTimeDays: 3.2,
        teamVelocity: 88,
        focusHoursLogged: 418,
      },
      calculatedMetrics: {
        burnoutRiskIndex: 28, // Low to moderate (0-100)
        productivityVariance: 14.5, // +14.5% lift over baseline
        riskDistribution: { financial: 18, operational: 24, technical: 16 },
      },
      forecasts: {
        projectedQuarterlyRevenue: 74200,
        projectedGoalCompletionRate: 91.2,
        estimatedCapacityShortfall: 2.1, // 2.1 FTE capacity shortfall in Q4
      },
      aiRecommendations: [
        'Automate client onboarding workflows to reclaim ~14 engineering hours per sprint.',
        'Shift high-priority database query optimization to off-peak slots to minimize API latency spikes.',
        'Activate Pesapal recurring billing IPN retries to protect subscription cash flow continuity.',
      ],
      userProvidedData: {
        strategicPriorityQuarter: 'Scale East Africa B2B Subscriptions & Multi-Currency Rail',
        growthTargetPercent: 35,
        riskTolerance: 'moderate',
      },
      lastCalibratedAt: new Date().toISOString(),
    };

    localStorage.setItem(`${STORAGE_KEY_TWIN}_${orgId}`, JSON.stringify(defaultTwin));
    return defaultTwin;
  }

  public static getSimulations(orgId: string): ScenarioSimulation[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_SIMULATIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing scenario simulations:', e);
      }
    }

    const defaultSimulations: ScenarioSimulation[] = [
      {
        id: 'sim_001',
        title: 'Scenario: +35% Marketing Spend in Regional East Africa',
        hypothesis: 'What happens if we increase regional paid acquisition in Uganda & Kenya by 35%?',
        inputChanges: [
          { dimension: 'Regional Marketing Spend', deltaPercent: 35 },
          { dimension: 'Customer Acquisition Budget', deltaPercent: 25 },
        ],
        projectedOutcomes: [
          {
            metric: 'Monthly Inbound Trials',
            beforeValue: '420 trials/mo',
            estimatedAfterValue: '585 trials/mo (+39%)',
            confidenceLevel: '86% Empirical Confidence',
            impactDirection: 'positive',
          },
          {
            metric: 'Pesapal Paid Conversions',
            beforeValue: '48 paid/mo',
            estimatedAfterValue: '66 paid/mo (+37.5%)',
            confidenceLevel: '81% Confidence',
            impactDirection: 'positive',
          },
          {
            metric: 'Customer Support Load',
            beforeValue: '12 tickets/day',
            estimatedAfterValue: '19 tickets/day (+58%)',
            confidenceLevel: '79% Confidence',
            impactDirection: 'negative',
          },
          {
            metric: 'Net Monthly Margin',
            beforeValue: '$7,900 USD',
            estimatedAfterValue: '$9,850 USD (+24.7%)',
            confidenceLevel: '84% Confidence',
            impactDirection: 'positive',
          },
        ],
        risksIdentified: [
          'Customer support queue latency could jump by 40% without Level 2 Support Agent automation.',
          'Early cohort churn risk if local mobile money checkout friction is encountered on low-bandwidth networks.',
        ],
        opportunities: [
          'Rapid capture of SME software market in Kampala and Nairobi ahead of legacy competitors.',
          'Increased annual upfront subscription prepayments lowering capital cost.',
        ],
        isEstimate: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sim_002',
        title: 'Scenario: Hiring 3 Additional Senior Engineers & 1 QA Specialist',
        hypothesis: 'What happens if we expand engineering capacity to accelerate the Autonomous Orchestrator roadmap?',
        inputChanges: [
          { dimension: 'Engineering Headcount', deltaPercent: 22 },
          { dimension: 'Monthly Payroll Burn', deltaPercent: 28 },
        ],
        projectedOutcomes: [
          {
            metric: 'Sprint Task Velocity',
            beforeValue: '88 pts/sprint',
            estimatedAfterValue: '124 pts/sprint (+41%)',
            confidenceLevel: '88% Confidence',
            impactDirection: 'positive',
          },
          {
            metric: 'Roadmap Time-to-Market',
            beforeValue: '14 weeks',
            estimatedAfterValue: '9.5 weeks (-32%)',
            confidenceLevel: '82% Confidence',
            impactDirection: 'positive',
          },
          {
            metric: 'Monthly Cash Runway',
            beforeValue: '19.5 months',
            estimatedAfterValue: '14.8 months (-4.7 mos)',
            confidenceLevel: '95% Actuarial Confidence',
            impactDirection: 'negative',
          },
        ],
        risksIdentified: [
          'Onboarding ramp delay of 3-4 weeks may temporarily reduce existing senior engineer throughput.',
        ],
        opportunities: [
          'Enables parallel delivery of Developer API Platform and Enterprise Custom Integrations.',
        ],
        isEstimate: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEY_SIMULATIONS}_${orgId}`, JSON.stringify(defaultSimulations));
    return defaultSimulations;
  }

  /**
   * Run a strategic scenario simulation
   */
  public static runScenario(
    orgId: string, 
    hypothesis: string,
    dimensionName: string,
    deltaPercent: number
  ): ScenarioSimulation {
    const twin = this.getTwin(orgId);
    const absDelta = Math.abs(deltaPercent);
    const isIncrease = deltaPercent >= 0;

    // Deterministic simulation modeling based on actual organizational twin data
    const baselineRev = twin.operationalModel.monthlyRevenueUsd;
    const baselineBurn = twin.operationalModel.monthlyBurnUsd;
    const baselineVelocity = twin.observedData.teamVelocity;

    let revenueImpact = isIncrease ? absDelta * 0.75 : -absDelta * 0.65;
    let burnImpact = isIncrease ? absDelta * 0.55 : -absDelta * 0.45;
    let velocityImpact = isIncrease ? absDelta * 0.40 : -absDelta * 0.35;

    if (dimensionName.toLowerCase().includes('staff') || dimensionName.toLowerCase().includes('hire') || dimensionName.toLowerCase().includes('headcount')) {
      burnImpact = isIncrease ? absDelta * 0.95 : -absDelta * 0.85;
      velocityImpact = isIncrease ? absDelta * 0.80 : -absDelta * 0.60;
      revenueImpact = isIncrease ? absDelta * 0.40 : -absDelta * 0.30;
    } else if (dimensionName.toLowerCase().includes('automate') || dimensionName.toLowerCase().includes('ai')) {
      burnImpact = isIncrease ? -absDelta * 0.25 : absDelta * 0.15;
      velocityImpact = isIncrease ? absDelta * 0.60 : -absDelta * 0.40;
      revenueImpact = isIncrease ? absDelta * 0.30 : -absDelta * 0.20;
    }

    const estAfterRev = Math.round(baselineRev * (1 + revenueImpact / 100));
    const estAfterBurn = Math.round(baselineBurn * (1 + burnImpact / 100));
    const estAfterVelocity = Math.round(baselineVelocity * (1 + velocityImpact / 100));

    const sim: ScenarioSimulation = {
      id: `sim_${Date.now()}`,
      title: `Scenario: ${dimensionName} ${isIncrease ? '+' : ''}${deltaPercent}%`,
      hypothesis,
      inputChanges: [{ dimension: dimensionName, deltaPercent }],
      projectedOutcomes: [
        {
          metric: 'Monthly Revenue',
          beforeValue: `$${baselineRev.toLocaleString()} USD`,
          estimatedAfterValue: `$${estAfterRev.toLocaleString()} USD (${revenueImpact >= 0 ? '+' : ''}${revenueImpact.toFixed(1)}%)`,
          confidenceLevel: '83% Model Confidence',
          impactDirection: revenueImpact >= 0 ? 'positive' : 'negative',
        },
        {
          metric: 'Monthly Operational Burn',
          beforeValue: `$${baselineBurn.toLocaleString()} USD`,
          estimatedAfterValue: `$${estAfterBurn.toLocaleString()} USD (${burnImpact >= 0 ? '+' : ''}${burnImpact.toFixed(1)}%)`,
          confidenceLevel: '91% Budget Confidence',
          impactDirection: burnImpact <= 0 ? 'positive' : 'negative',
        },
        {
          metric: 'Sprint Task Velocity',
          beforeValue: `${baselineVelocity} pts`,
          estimatedAfterValue: `${estAfterVelocity} pts (${velocityImpact >= 0 ? '+' : ''}${velocityImpact.toFixed(1)}%)`,
          confidenceLevel: '78% Process Confidence',
          impactDirection: velocityImpact >= 0 ? 'positive' : 'negative',
        },
      ],
      risksIdentified: [
        `Variance tolerance threshold: ensure cash reserve cushions operational fluctuations exceeding 15%.`,
        `Capacity strain on secondary dependencies during high-velocity transition cycles.`,
      ],
      opportunities: [
        `Compounding operational leverage if efficiency gains are reinvested into autonomous workflows.`,
      ],
      isEstimate: true,
      createdAt: new Date().toISOString(),
    };

    const simulations = this.getSimulations(orgId);
    simulations.unshift(sim);
    localStorage.setItem(`${STORAGE_KEY_SIMULATIONS}_${orgId}`, JSON.stringify(simulations));

    return sim;
  }
}
