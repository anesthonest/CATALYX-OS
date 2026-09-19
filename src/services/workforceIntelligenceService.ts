import { WorkforceCapacityMetric } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  WORKFORCE_INTELLIGENCE: 'catalyx_v9_workforce_intelligence',
};

export class WorkforceIntelligenceService {
  /**
   * Fetch departmental workforce capacity metrics (privacy-audited)
   */
  public static getMetrics(orgId: string): WorkforceCapacityMetric[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WORKFORCE_INTELLIGENCE}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing workforce metrics:', e);
      }
    }

    const now = new Date().toISOString();
    const defaultMetrics: WorkforceCapacityMetric[] = [
      {
        id: 'wf_eng_01',
        organizationId: orgId,
        department: 'Engineering & QA',
        workloadPercent: 78,
        taskDistributionCount: 42,
        capacityHoursAvailable: 65,
        bottlenecksIdentified: [
          'Static analysis review queue peaking before sprint freeze',
          'PR review concentration in single senior maintainer'
        ],
        deadlinesApproachingCount: 4,
        productivitySignal: 'optimal',
        skillCoverageGaps: ['Distributed Actor Model', 'Rust Native Extensions'],
        privacyAudited: true,
        lastCalculatedAt: now,
      },
      {
        id: 'wf_ops_02',
        organizationId: orgId,
        department: 'Operations & Reliability',
        workloadPercent: 62,
        taskDistributionCount: 28,
        capacityHoursAvailable: 95,
        bottlenecksIdentified: [
          'Manual staging environment reset scripts'
        ],
        deadlinesApproachingCount: 2,
        productivitySignal: 'optimal',
        skillCoverageGaps: ['Multi-Region Kubernetes Failover'],
        privacyAudited: true,
        lastCalculatedAt: now,
      },
      {
        id: 'wf_fin_03',
        organizationId: orgId,
        department: 'Finance & Compliance',
        workloadPercent: 54,
        taskDistributionCount: 19,
        capacityHoursAvailable: 110,
        bottlenecksIdentified: [],
        deadlinesApproachingCount: 1,
        productivitySignal: 'optimal',
        skillCoverageGaps: ['East Africa Cross-Border Tax Treaty Modeling'],
        privacyAudited: true,
        lastCalculatedAt: now,
      },
      {
        id: 'wf_sup_04',
        organizationId: orgId,
        department: 'Customer Support & Success',
        workloadPercent: 72,
        taskDistributionCount: 36,
        capacityHoursAvailable: 70,
        bottlenecksIdentified: [
          'High ticket arrivals following regional webinar events'
        ],
        deadlinesApproachingCount: 3,
        productivitySignal: 'optimal',
        skillCoverageGaps: ['Swahili & Luganda Technical Localization'],
        privacyAudited: true,
        lastCalculatedAt: now,
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.WORKFORCE_INTELLIGENCE}_${orgId}`, JSON.stringify(defaultMetrics));
    return defaultMetrics;
  }

  /**
   * Recalibrate workforce capacity metrics
   */
  public static updateMetric(metric: WorkforceCapacityMetric): void {
    const metrics = this.getMetrics(metric.organizationId);
    const index = metrics.findIndex(m => m.id === metric.id);
    if (index >= 0) {
      metrics[index] = { ...metric, lastCalculatedAt: new Date().toISOString() };
    } else {
      metrics.unshift({ ...metric, lastCalculatedAt: new Date().toISOString() });
    }

    localStorage.setItem(`${STORAGE_KEYS.WORKFORCE_INTELLIGENCE}_${metric.organizationId}`, JSON.stringify(metrics));

    GovernanceService.addAuditLog({
      id: `audit_wf_${Date.now()}`,
      organizationId: metric.organizationId,
      actorId: 'workforce_intelligence',
      actorName: 'Workforce Intelligence Service',
      actorRole: 'system',
      action: `WORKFORCE_CAPACITY_RECALIBRATED: ${metric.department}`,
      resourceType: 'workforce_metric',
      resourceId: metric.id,
      outcome: 'success',
      details: {
        workloadPercent: metric.workloadPercent,
        signal: metric.productivitySignal,
        privacyAudited: true,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
