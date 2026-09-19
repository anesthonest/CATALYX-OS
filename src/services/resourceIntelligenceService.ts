import { ResourceModelItem, ResourceAllocationRecommendation } from '../types';

class ResourceIntelligenceService {
  private resources: ResourceModelItem[] = [
    {
      resourceId: 'res-ppl-eng-01',
      name: 'Core Platform Engineering Squad',
      category: 'PEOPLE',
      totalCapacity: 160, // 4 engineers x 40h/wk
      allocatedCapacity: 184, // Over-allocated
      unit: 'Engineering Hours/Week',
      utilizationRate: 1.15,
      status: 'OVER_ALLOCATED',
      wasteDetected: '18 hours/week consumed triaging repetitive manual infrastructure tickets and environment resets.',
      competingPriorities: [
        'Q3 Database Migration to CockroachDB/Postgres',
        'Emergency Hotfixes for Legacy Auth Connector',
        'Marketplace Sandbox Expansion'
      ]
    },
    {
      resourceId: 'res-ppl-cs-02',
      name: 'Enterprise Customer Success Specialists',
      category: 'PEOPLE',
      totalCapacity: 120,
      allocatedCapacity: 92,
      unit: 'Consultation Hours/Week',
      utilizationRate: 0.76,
      status: 'OPTIMAL',
      wasteDetected: null,
      competingPriorities: [
        'Tier-1 Customer Quarterly Business Reviews',
        'Onboarding Mid-Market Cohort'
      ]
    },
    {
      resourceId: 'res-ai-compute-03',
      name: 'Cluster GPU/TPU & Model Token Pipeline',
      category: 'AI_COMPUTE',
      totalCapacity: 100000000, // 100M tokens/month ceiling
      allocatedCapacity: 89400000,
      unit: 'Tokens/Month',
      utilizationRate: 0.89,
      status: 'BOTTLENECK',
      wasteDetected: '14.2M un-cached identical prompt evaluations during peak hours (14:00 - 18:00 UTC).',
      competingPriorities: [
        'Autonomous Workflow Execution Gate Verifications',
        'Continuous Organizational Intelligence Health Scans',
        'Deep Document SOP Grounding Embeddings'
      ]
    },
    {
      resourceId: 'res-infra-cluster-04',
      name: 'Cloud Run & Kubernetes Container Ingress',
      category: 'INFRASTRUCTURE',
      totalCapacity: 50,
      allocatedCapacity: 21,
      unit: 'Serverless CPU Instances',
      utilizationRate: 0.42,
      status: 'UNDERUTILIZED',
      wasteDetected: 'Stale staging environment worker nodes running 24/7 on high memory profiles.',
      competingPriorities: [
        'Production Ingress Proxy',
        'Async Background Queue Processing'
      ]
    },
    {
      resourceId: 'res-money-budget-05',
      name: 'Monthly Discretionary R&D Automation Budget',
      category: 'MONEY',
      totalCapacity: 2500000, // $25,000.00
      allocatedCapacity: 1980000, // $19,800.00
      unit: 'Cents (USD)',
      utilizationRate: 0.79,
      status: 'OPTIMAL',
      wasteDetected: null,
      competingPriorities: [
        'Marketplace Developer Grant Subsidies',
        'Adversarial Security Penetration Audits'
      ]
    },
    {
      resourceId: 'res-soft-licenses-06',
      name: 'Third-Party SaaS Seat Subscriptions',
      category: 'SOFTWARE',
      totalCapacity: 150,
      allocatedCapacity: 104,
      unit: 'Active User Seats',
      utilizationRate: 0.69,
      status: 'UNDERUTILIZED',
      wasteDetected: '46 inactive Figma and Datadog enterprise seats unassigned for > 60 days ($1,380/mo).',
      competingPriorities: [
        'Product Design Expansion',
        'Security Operations Telemetry'
      ]
    }
  ];

  private recommendations: ResourceAllocationRecommendation[] = [
    {
      recommendationId: 'rec-alloc-01',
      resourceId: 'res-ppl-eng-01',
      resourceName: 'Core Platform Engineering Squad',
      actionType: 'AUTOMATE',
      summary: 'Offload environment resets and manual schema migration verifications to Governed Self-Healing scripts, releasing 18 engineering hours/week.',
      expectedImpact: 'Lowers squad allocation from 115% to a healthy 96% and prevents burnout drift without changing team headcount.',
      humanGovernanceMandatory: true,
      status: 'PROPOSED'
    },
    {
      recommendationId: 'rec-alloc-02',
      resourceId: 'res-ai-compute-03',
      resourceName: 'Cluster GPU/TPU & Model Token Pipeline',
      actionType: 'SCHEDULE_OPTIMIZATION',
      summary: 'Re-route non-urgent batch knowledge document embeddings to off-peak hours (02:00 - 06:00 UTC) with semantic cache pre-warming.',
      expectedImpact: 'Eliminates peak token throttling and reduces burst inference latency by 45%.',
      humanGovernanceMandatory: false,
      status: 'PROPOSED'
    },
    {
      recommendationId: 'rec-alloc-03',
      resourceId: 'res-soft-licenses-06',
      resourceName: 'Third-Party SaaS Seat Subscriptions',
      actionType: 'CAPACITY_EXPANSION',
      summary: 'Reclaim 46 inactive enterprise software seats and downgrade plan tier at upcoming renewal.',
      expectedImpact: 'Recovers $16,560 annual software expenditure with zero operational friction.',
      humanGovernanceMandatory: true,
      status: 'APPROVED'
    }
  ];

  public getResourceModels(): ResourceModelItem[] {
    return this.resources;
  }

  public getRecommendations(): ResourceAllocationRecommendation[] {
    return this.recommendations;
  }

  public updateRecommendationStatus(
    id: string,
    status: 'APPROVED' | 'DISMISSED',
    actor: string
  ): ResourceAllocationRecommendation | null {
    const rec = this.recommendations.find(r => r.recommendationId === id);
    if (!rec) return null;
    rec.status = status;
    return rec;
  }

  public executeRebalance(resourceId: string): { success: boolean; message: string } {
    const target = this.resources.find(r => r.resourceId === resourceId);
    if (!target) {
      return { success: false, message: 'Resource target not found.' };
    }

    if (target.category === 'PEOPLE') {
      return {
        success: false,
        message: 'CATALYX Rule Enforcement: Human workforce decisions require explicit human supervisory approval and cannot be modified autonomously.'
      };
    }

    if (target.status === 'UNDERUTILIZED' || target.status === 'BOTTLENECK') {
      target.allocatedCapacity = Math.round(target.totalCapacity * 0.75);
      target.utilizationRate = 0.75;
      target.status = 'OPTIMAL';
      target.wasteDetected = null;
      return {
        success: true,
        message: `Resource '${target.name}' capacity rebalanced to optimal 75% load safely.`
      };
    }

    return {
      success: true,
      message: `Resource '${target.name}' checked; operating within normal tolerances.`
    };
  }
}

export const resourceIntelligenceService = new ResourceIntelligenceService();
