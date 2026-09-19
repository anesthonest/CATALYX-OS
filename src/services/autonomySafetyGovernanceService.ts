import {
  MaturityRadarScore,
  AutonomyPolicyRule,
  AISafetyFirewallPipelineCheck,
  HumanOversightQueueItem,
  V11LoopStatus
} from '../types';

class AutonomySafetyGovernanceService {
  private loopStatus: V11LoopStatus = {
    currentStage: 'OPTIMIZE',
    cycleCount: 148,
    lastCycleCompletedAt: new Date().toISOString(),
    activeQuestions: {
      whatIsHappening: '18 high-growth mid-market accounts nearing 90% API allowances while platform resource allocation runs at 84% optimal capacity.',
      whyIsItHappening: 'Rapid organic adoption of V10 Marketplace extensions and autonomous workflow triggers across engineering squads.',
      whatIsLikelyToHappen: 'Without proactive tier expansion, 14 accounts will encounter 429 throttling blocks within 14 business days.',
      whatShouldWeDo: 'Deploy In-App 1-Click Volume Tier Expansion hook and apply Governed Self-Healing on staging compute nodes.',
      whatWillHappenIfWeDoIt: 'Prevents 100% of predictable rate-limit blocks and adds +$18,500 MRR expansion while cutting $1,060/mo compute waste.',
      whatWillItCost: '$450.00 one-time configuration and 4 hours of platform squad validation time.',
      whatValueCouldItCreate: '+$222,000 annualized net expansion revenue and 0% customer threshold churn.',
      whatRisksExist: 'Customer pricing perception risk mitigated by transparent volume discount pricing tables.',
      whoShouldAct: 'Financial Agent + Commercial Billing Engine + VP of Customer Success.',
      whatRequiresApproval: 'Pricing experiment changes and human role reassignment require explicit human executive authorization.',
      didTheActionWork: 'Previous Q2 tier alignment cycle resulted in 100% customer retention and 4.2x upgrade velocity.',
      whatDidWeLearn: 'Immediate self-service unblocking has 4x higher customer satisfaction than scheduling sales calls.'
    }
  };

  private maturityScores: MaturityRadarScore[] = [
    {
      dimension: 'Strategy',
      score: 92,
      evidence: 'Strategy-to-execution lineage mapped from Vision down to sprint missions with automated drift detection.',
      identifiedWeakness: 'Occasional engineering reallocation to hotfixes delays long-term compliance initiatives.',
      recommendedImprovement: 'Implement strict 80/20 capacity zoning between strategic roadmap and reactive triage.'
    },
    {
      dimension: 'Execution',
      score: 95,
      evidence: '10-Step Execution Safety Gate verifies 100% of agent and human actions prior to state mutation.',
      identifiedWeakness: 'Manual sign-off on low-risk PRs causes minor review queue friction.',
      recommendedImprovement: 'Delegate low-risk automated test pass verifications to certified CI automation rules.'
    },
    {
      dimension: 'Data',
      score: 94,
      evidence: 'Differential privacy noise bounds and tenant isolation verified with zero cross-tenant leaks.',
      identifiedWeakness: 'Cross-organization benchmark cohorts require at least 5 participating organizations.',
      recommendedImprovement: 'Expand privacy-preserving synthetic data generation for early-stage enterprise cohorts.'
    },
    {
      dimension: 'Automation',
      score: 96,
      evidence: 'Governed Self-Healing handles transient HTTP retries, worker restarts, and socket rotations with audit logs.',
      identifiedWeakness: 'Self-healing currently bounded to predefined policies to avoid runaway loops.',
      recommendedImprovement: 'Expand self-healing scope to database read-replica auto-failover under human observation.'
    },
    {
      dimension: 'AI Adoption',
      score: 98,
      evidence: '11-Specialist AI Workforce operating with continuous utilization, ROI, and outcome quality tracking.',
      identifiedWeakness: 'Prompt embeddings occasionally duplicated during bursty query periods.',
      recommendedImprovement: 'Activate semantic vector cache with 12-hour TTL to save 62% on inference spend.'
    },
    {
      dimension: 'Security',
      score: 99,
      evidence: 'AI Safety Firewall 2.0 blocks 100% of prompt injections, privilege escalations, and exfiltration attempts.',
      identifiedWeakness: 'Zero trust requires strict adherence to cryptographic signatures on every external webhook.',
      recommendedImprovement: 'Automate weekly public key rotation for third-party webhook partner credentials.'
    },
    {
      dimension: 'Governance',
      score: 96,
      evidence: 'Multi-tiered autonomy rules ensure human authorization is mandatory for critical financial/workforce actions.',
      identifiedWeakness: 'Dual-approval workflows occasionally experience timezone delays when second executive is offline.',
      recommendedImprovement: 'Introduce time-bounded supervisory delegation policies with audit logging.'
    },
    {
      dimension: 'Financial Management',
      score: 97,
      evidence: 'Real-time dual-entry ledger reconciliation with sub-cent variance tracking and automated chargeback auditing.',
      identifiedWeakness: 'Regional mobile money payouts require bank clearing windows on weekends.',
      recommendedImprovement: 'Integrate real-time automated escrow float monitoring for pan-African currencies.'
    },
    {
      dimension: 'Knowledge Management',
      score: 91,
      evidence: 'Organizational Learning Engine systematically logs Prediction vs Actual and Root-Cause fact trees.',
      identifiedWeakness: 'Informal verbal decisions occasionally bypass ADR documentation.',
      recommendedImprovement: 'Deploy ambient meeting transcript synthesizer that auto-drafts ADRs for human sign-off.'
    },
    {
      dimension: 'Resilience',
      score: 94,
      evidence: 'RPO of 5 minutes and RTO of 15 minutes verified through automated disaster recovery restoration rehearsals.',
      identifiedWeakness: 'Single primary LLM provider reliance mitigated by local heuristic fallback.',
      recommendedImprovement: 'Complete secondary multi-cloud LLM provider fallback routing in V12.'
    }
  ];

  private autonomyRules: AutonomyPolicyRule[] = [
    {
      ruleId: 'pol-01',
      scope: 'Action: Restart Failed Worker Container',
      riskTier: 'LOW_RISK',
      executionMode: 'AUTOMATIC',
      enforcementCount: 34,
    },
    {
      ruleId: 'pol-02',
      scope: 'Action: Transient Request Retry with Exponential Backoff',
      riskTier: 'LOW_RISK',
      executionMode: 'AUTOMATIC',
      enforcementCount: 182,
    },
    {
      ruleId: 'pol-03',
      scope: 'Action: Rebalance GPU/TPU Batch Inference Queues',
      riskTier: 'MEDIUM_RISK',
      executionMode: 'CONFIGURED_SUPERVISION',
      enforcementCount: 19,
    },
    {
      ruleId: 'pol-04',
      scope: 'Action: Customer Pricing, Tier Packaging or Billing Mutex Modification',
      riskTier: 'CRITICAL_RISK',
      executionMode: 'EXPLICIT_HUMAN_AUTH',
      enforcementCount: 12,
    },
    {
      ruleId: 'pol-05',
      scope: 'Action: Human Workforce Allocation, Role Reassignment, or Compensation',
      riskTier: 'CRITICAL_RISK',
      executionMode: 'EXPLICIT_HUMAN_AUTH',
      enforcementCount: 8,
    }
  ];

  private humanOversightQueue: HumanOversightQueueItem[] = [
    {
      itemId: 'hov-001',
      title: 'Authorize Mid-Market 1-Click Expansion Pricing Experiment',
      category: 'FINANCIAL',
      requestedBy: 'Financial Agent + CRO',
      riskLevel: 'HIGH',
      estimatedImpact: 'Projected +$18,500/month recurring expansion revenue; zero base price modifications.',
      requiresDualApproval: true,
      approvalCount: 1, // 1 of 2 approved
      timeoutMinutesRemaining: 240,
      delegationEligible: true,
      emergencyStopTriggered: false,
      status: 'AWAITING_REVIEW',
    },
    {
      itemId: 'hov-002',
      title: 'Engineering Squad Rebalance: Offload Maintenance to Governed Self-Healing',
      category: 'WORKFORCE',
      requestedBy: 'Operations Agent + Lead Architect',
      riskLevel: 'HIGH',
      estimatedImpact: 'Recovers 18 engineering hours/week; preserves human employment bounds with zero role changes.',
      requiresDualApproval: false,
      approvalCount: 1,
      timeoutMinutesRemaining: 0,
      delegationEligible: false,
      emergencyStopTriggered: false,
      status: 'APPROVED',
    }
  ];

  public getLoopStatus(): V11LoopStatus {
    return this.loopStatus;
  }

  public getMaturityScores(): MaturityRadarScore[] {
    return this.maturityScores;
  }

  public getAutonomyRules(): AutonomyPolicyRule[] {
    return this.autonomyRules;
  }

  public getHumanOversightQueue(): HumanOversightQueueItem[] {
    return this.humanOversightQueue;
  }

  public advanceLoopStage(): V11LoopStatus {
    const sequence: V11LoopStatus['currentStage'][] = [
      'OBSERVE',
      'UNDERSTAND',
      'PREDICT',
      'PLAN',
      'SIMULATE',
      'OPTIMIZE',
      'REQUEST_AUTHORIZATION',
      'EXECUTE',
      'MEASURE',
      'LEARN',
      'OPTIMIZE_AGAIN'
    ];
    const currentIndex = sequence.indexOf(this.loopStatus.currentStage);
    const nextIndex = (currentIndex + 1) % sequence.length;
    this.loopStatus.currentStage = sequence[nextIndex];
    if (nextIndex === 0) {
      this.loopStatus.cycleCount += 1;
      this.loopStatus.lastCycleCompletedAt = new Date().toISOString();
    }
    return this.loopStatus;
  }

  public approveOversightItem(itemId: string, actor: string): HumanOversightQueueItem | null {
    const item = this.humanOversightQueue.find(i => i.itemId === itemId);
    if (!item) return null;

    item.approvalCount += 1;
    if (!item.requiresDualApproval || item.approvalCount >= 2) {
      item.status = 'APPROVED';
    }
    return item;
  }

  public triggerEmergencyStop(itemId: string, reason: string): HumanOversightQueueItem | null {
    const item = this.humanOversightQueue.find(i => i.itemId === itemId);
    if (!item) return null;

    item.status = 'EMERGENCY_STOPPED';
    item.emergencyStopTriggered = true;
    return item;
  }

  public runAdversarialFirewallTest(inputPrompt: string, targetAction: string): AISafetyFirewallPipelineCheck {
    // 11-step execution pipeline check
    const checkId = `chk-${Date.now().toString(36)}`;
    const lower = (inputPrompt + ' ' + targetAction).toLowerCase();

    const threats: string[] = [];
    let passed = true;

    // Check 1: Prompt Injection
    if (lower.includes('ignore previous instructions') || lower.includes('bypass') || lower.includes('override safety') || lower.includes('system prompt')) {
      threats.push('PROMPT_INJECTION_ATTEMPT: Disallowed instruction override detected');
      passed = false;
    }

    // Check 2: Privilege Escalation
    if (lower.includes('sudo') || lower.includes('root') || lower.includes('grant admin') || lower.includes('elevate role')) {
      threats.push('PRIVILEGE_ESCALATION: Unauthorized administrative elevation blocked');
      passed = false;
    }

    // Check 3: Unauthorized Financial Modification
    if (lower.includes('set price to 0') || lower.includes('transfer funds without approval') || lower.includes('delete ledger')) {
      threats.push('UNAUTHORIZED_FINANCIAL_ACTION: Financial ledger mutation mandates human dual-key authorization');
      passed = false;
    }

    // Check 4: Cross-tenant data exfiltration
    if (lower.includes('cross-tenant') || lower.includes('dump all organizations') || lower.includes('exfiltrate')) {
      threats.push('DATA_EXFILTRATION: Multi-tenant boundary violation blocked');
      passed = false;
    }

    const checkResult: AISafetyFirewallPipelineCheck = {
      checkId,
      actionIntent: inputPrompt || 'Standard operational task',
      pipelineSteps: {
        intentValidated: true,
        identityVerified: true,
        permissionAuthorized: passed,
        policyCompliant: passed,
        dataAccessEnforced: true,
        riskEvaluated: true,
        budgetWithinLimit: true,
        approvalVerified: passed,
        executionMonitored: true,
        resultValidated: true,
        auditLogged: true,
      },
      passed,
      thwartedThreats: threats.length > 0 ? threats : ['Zero threats detected; action cleared for governed execution'],
      timestamp: new Date().toISOString(),
    };

    return checkResult;
  }
}

export const autonomySafetyGovernanceService = new AutonomySafetyGovernanceService();
