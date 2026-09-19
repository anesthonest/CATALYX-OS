import {
  SignificantDecisionRecord,
  OrganizationalLearningRecord,
  RootCauseAnalysisItem,
  StrategyTradeoffEvaluation
} from '../types';

class DecisionLearningService {
  private decisions: SignificantDecisionRecord[] = [
    {
      decisionId: 'dec-2026-001',
      title: 'Adoption of Differential Privacy Noise Injection for Cross-Org Benchmarking',
      decisionMaker: 'Elena Rostova (Chief Security Architect) & Executive Governance Committee',
      optionsConsidered: [
        {
          optionName: 'Option A: Raw Aggregated Averages with Tenant Masking',
          projectedRoiPercent: 12.0,
          costMinorUnits: 15000,
          riskSummary: 'High vulnerability to membership inference and reconstruction attacks on small cohorts.',
          confidence: 0.45,
        },
        {
          optionName: 'Option B: Laplace Differential Privacy (epsilon=0.5) with Formal Noise Bounds (Selected)',
          projectedRoiPercent: 38.5,
          costMinorUnits: 45000,
          riskSummary: 'Mathematically provable privacy guarantee with strict tenant isolation guarantees.',
          confidence: 0.98,
        }
      ],
      chosenOption: 'Option B: Laplace Differential Privacy (epsilon=0.5)',
      evidenceGathered: [
        'Adversarial membership reconstruction audit demonstrated 99.4% privacy protection against re-identification',
        'Compliance review verified full conformity with GDPR Art. 25 & HIPAA De-identification standards'
      ],
      coreAssumptions: [
        'Ecosystem tenant count exceeds minimum cohort threshold (k >= 5)',
        'Noise injection does not distort rank accuracy by more than +/- 2.5%'
      ],
      expectedOutcome: 'Zero cross-tenant privacy leaks while publishing weekly industry benchmarks.',
      actualOutcome: 'Successfully generated 14 weekly benchmark releases with zero tenant re-identification anomalies.',
      authorizedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      status: 'EVALUATED_SUCCESS',
    },
    {
      decisionId: 'dec-2026-002',
      title: 'Migration from Periodic Batch Settlement to Real-Time Pesapal v3 Webhook Ledger',
      decisionMaker: 'Marcus Vance (FinOps Director)',
      optionsConsidered: [
        {
          optionName: 'Option 1: Overnight Cron Settlement Batching',
          projectedRoiPercent: 8.0,
          costMinorUnits: 10000,
          riskSummary: 'Delayed creator earnings availability and 18-hour lag in refund tracking.',
          confidence: 0.70,
        },
        {
          optionName: 'Option 2: Instant Dual-Entry Asynchronous Ledger with Circuit Breakers (Selected)',
          projectedRoiPercent: 44.0,
          costMinorUnits: 65000,
          riskSummary: 'Requires high-throughput queue idempotency to prevent double credits.',
          confidence: 0.95,
        }
      ],
      chosenOption: 'Option 2: Instant Dual-Entry Asynchronous Ledger with Circuit Breakers',
      evidenceGathered: [
        'Idempotency key enforcement on all IPN webhooks prevented 100% of duplicate callback entries during testing'
      ],
      coreAssumptions: [
        'Payment gateway webhook delivery SLA maintains 99.9% uptime'
      ],
      expectedOutcome: 'Sub-second subscription entitlement updates and zero financial drift between gateway and ledger.',
      actualOutcome: 'Zero ledger variance recorded over $284,500 in transactional volume.',
      authorizedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      status: 'EVALUATED_SUCCESS',
    }
  ];

  private learnings: OrganizationalLearningRecord[] = [
    {
      learningId: 'lrn-strat-01',
      category: 'STRATEGY',
      subject: 'Self-Service Upgrades vs Sales Rep Intervention for Mid-Market Expansion',
      predictionOrRecommendation: 'Predicted that dedicated sales call outreach would yield 15% higher upgrade conversion.',
      actualResult: 'In-app frictionless 1-click upgrade yielded 4.2x higher conversion velocity (1.8 days vs 26 days) with 0% margin discount requests.',
      varianceExplanation: 'Enterprise developers and engineering leads strongly prefer immediate automated self-service unblocking over scheduling procurement calls.',
      status: 'VALIDATED_IMPROVEMENT',
      confidenceWeight: 0.96,
      appliedToFutureRecommendations: true,
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      learningId: 'lrn-agent-02',
      category: 'AGENT',
      subject: 'Specialized Flash Model Routing vs General Flagship Model for Queue Operations',
      predictionOrRecommendation: 'Flagship model presumed necessary for complex queue priority classification.',
      actualResult: 'Specialized prompt with Flash model achieved identical 99.1% classification accuracy with 82% lower latency and 88% lower cost.',
      varianceExplanation: 'Well-structured schemas and enum output constraints eliminate the need for multi-billion parameter reasoning on structured classification tasks.',
      status: 'VALIDATED_IMPROVEMENT',
      confidenceWeight: 0.98,
      appliedToFutureRecommendations: true,
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      learningId: 'lrn-wf-03',
      category: 'WORKFLOW',
      subject: 'Synchronous API Polling on External CRM Leads',
      predictionOrRecommendation: 'Predicted polling every 5 minutes would detect status updates with minimal overhead.',
      actualResult: 'Resulted in 28,800 redundant empty HTTP calls/month and occasional rate-limit backoffs.',
      varianceExplanation: 'Webhooks with cryptographic signature verification are far more reliable and cost-effective than continuous polling.',
      status: 'RECURRING_FAILURE',
      confidenceWeight: 0.99,
      appliedToFutureRecommendations: true,
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    }
  ];

  private rootCauseAnalyses: RootCauseAnalysisItem[] = [
    {
      incidentOrProblemId: 'rca-2026-088',
      symptom: 'Spike in API 429 Rate Limit Errors and Customer Support Tickets on First Monday of Month',
      signals: [
        'Ingress proxy logged 412 status 429 events in a 20-minute window (09:00 - 09:20 UTC)',
        'Three enterprise tenants contacted CS via high-priority chat',
        'CPU and memory metrics on backend nodes remained below 35% utilization'
      ],
      possibleCauses: [
        'Distributed Denial of Service (DDoS) attack',
        'Backend node failure causing cascading connection pool exhaustion',
        'Automated monthly batch billing jobs running concurrently with regular tenant morning workflows'
      ],
      evidence: [
        'Ingress source IPs matched verified customer corporate VPNs, ruling out external DDoS',
        'Job queue logs confirmed 14 bulk billing reconciliations initiated simultaneously at 09:00 UTC'
      ],
      observedFacts: [
        'Fact: 412 rate-limit triggers recorded between 09:00 and 09:20 UTC',
        'Fact: 14 bulk billing reconciliation jobs started exactly at 09:00:00 UTC',
        'Fact: Server CPU remained below 35%'
      ],
      inferences: [
        'Inference: Rate limits were triggered by tenant API quota ceilings, not infrastructure exhaustion',
        'Inference: Scheduling conflict between customer scheduled scripts and internal platform monthly jobs'
      ],
      hypotheses: [
        'Hypothesis: Staggering monthly reconciliation jobs across a 4-hour window and alerting tenants at 80% usage will completely eliminate 429 bursts'
      ],
      validatedRootCause: 'Batch reconciliation job scheduler lacked jitter and token bucket isolation from tenant interactive API allowances.',
      recommendedAction: 'Apply random jitter (0-60 min) to monthly automated cron tasks and separate internal system worker rate pools from customer API pools.',
      confidence: 0.98,
    }
  ];

  private tradeoffs: StrategyTradeoffEvaluation[] = [
    {
      scenarioTitle: 'Hiring vs AI Autonomous Workforce Expansion (Platform Operations)',
      strategyA: {
        name: 'Strategy A: Hire 3 Full-Time Operations Site Reliability Engineers',
        expectedRoiPercent: 18.0,
        costMinorUnits: 42000000, // $420,000/yr salary + benefits
        risk: 'MEDIUM',
        resourceDemand: 'High recruitment & 3-month onboarding cycle',
        timeline: '90 - 120 Days',
        uncertainty: 28,
      },
      strategyB: {
        name: 'Strategy B: Deploy Governed Self-Healing AI Workforce + 1 Senior Lead SRE',
        expectedRoiPercent: 94.5,
        costMinorUnits: 17500000, // $175,000/yr total
        risk: 'LOW',
        resourceDemand: 'Configuration of predefined self-healing policies and execution safety gates',
        timeline: '14 Days',
        uncertainty: 10,
      },
      recommendation: 'Strategy B is strongly recommended. It saves $245,000 annually while providing 24/7 sub-second self-healing response with human lead supervisory sign-off.',
      tradeoffSummary: 'Human governance is maintained through the Senior SRE role while offloading 95% of routine triage and mitigation to governed deterministic automation.'
    },
    {
      scenarioTitle: 'Infrastructure Upgrade vs Query & Vector Cache Optimization',
      strategyA: {
        name: 'Strategy A: Double Kubernetes Cluster Node Size & GPU Count',
        expectedRoiPercent: 10.0,
        costMinorUnits: 3600000, // +$36,000/yr
        risk: 'LOW',
        resourceDemand: 'Minimal dev effort, pure financial expenditure',
        timeline: '1 Day',
        uncertainty: 5,
      },
      strategyB: {
        name: 'Strategy B: Implement Semantic Vector Cache + Redis Indexing',
        expectedRoiPercent: 120.0,
        costMinorUnits: 300000, // $3,000 one-time setup
        risk: 'LOW',
        resourceDemand: '2 days engineering to configure cache invalidation hooks',
        timeline: '3 Days',
        uncertainty: 8,
      },
      recommendation: 'Strategy B achieves a 62% reduction in compute demand at 1/12th the cost of expanding hardware nodes.',
      tradeoffSummary: 'Optimizing software-level semantic caching permanently resolves root-cause token waste, whereas scaling hardware merely increases monthly burn.'
    }
  ];

  public getDecisions(): SignificantDecisionRecord[] {
    return this.decisions;
  }

  public getLearnings(): OrganizationalLearningRecord[] {
    return this.learnings;
  }

  public getRootCauses(): RootCauseAnalysisItem[] {
    return this.rootCauseAnalyses;
  }

  public getTradeoffs(): StrategyTradeoffEvaluation[] {
    return this.tradeoffs;
  }

  public recordDecision(decision: Omit<SignificantDecisionRecord, 'decisionId' | 'authorizedAt'>): SignificantDecisionRecord {
    const newDec: SignificantDecisionRecord = {
      ...decision,
      decisionId: `dec-${Date.now().toString(36)}`,
      authorizedAt: new Date().toISOString(),
    };
    this.decisions.unshift(newDec);
    return newDec;
  }

  public recordLearning(learning: Omit<OrganizationalLearningRecord, 'learningId' | 'timestamp'>): OrganizationalLearningRecord {
    const newLrn: OrganizationalLearningRecord = {
      ...learning,
      learningId: `lrn-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    this.learnings.unshift(newLrn);
    return newLrn;
  }
}

export const decisionLearningService = new DecisionLearningService();
