import { CrossOrgBenchmarkMetric } from '../types';

const STORAGE_KEY = 'catalyx_v10_cross_org_benchmarks';

export class CrossOrgIntelligenceService {
  public static getBenchmarks(tenantId: string): CrossOrgBenchmarkMetric[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultBenchmarks: CrossOrgBenchmarkMetric[] = [
      {
        metricId: 'bench_op_eff_01',
        category: 'operational_efficiency',
        metricName: 'Sprint Delivery Velocity Ratio',
        sampleSize: 1840,
        timeframe: 'Trailing 90 Days (Q2-Q3 2026)',
        methodology: 'Anonymized geometric mean of committed vs. accepted story points across enterprise tenants with >20 active contributors.',
        limitations: 'Excludes stealth startups with <5 users and teams utilizing non-standard Kanban cycle times.',
        industryAverage: 74.2,
        topQuartile: 88.5,
        unit: '%',
        orgValue: 86.4,
        percentileRank: 78,
        status: 'COMPETITIVE',
      },
      {
        metricId: 'bench_wf_auto_02',
        category: 'workflow_automation',
        metricName: 'Autonomous Workflow Execution Rate',
        sampleSize: 1560,
        timeframe: 'Trailing 90 Days',
        methodology: 'Percentage of repetitive workflow runs executed through Autonomy Level 3 without requiring human intervention.',
        limitations: 'Financial disbursements and destructive operations are excluded due to mandatory 10-step human approval gates.',
        industryAverage: 42.0,
        topQuartile: 68.0,
        unit: '%',
        orgValue: 71.5,
        percentileRank: 84,
        status: 'OPTIMAL',
      },
      {
        metricId: 'bench_ai_util_03',
        category: 'ai_utilization',
        metricName: 'Governed AI Inference Efficiency',
        sampleSize: 2200,
        timeframe: 'Trailing 60 Days',
        methodology: 'Ratio of productive mission tasks completed per 10,000 prompt tokens under AI Firewall supervision.',
        limitations: 'Varies by domain complexity; creative exploration workflows consume 2.1x more tokens than structured reconciliation.',
        industryAverage: 65.0,
        topQuartile: 82.0,
        unit: 'Tasks/10k Tokens',
        orgValue: 79.2,
        percentileRank: 75,
        status: 'COMPETITIVE',
      },
      {
        metricId: 'bench_cost_eff_04',
        category: 'cost_efficiency',
        metricName: 'Infrastructure Cost Per Completed Mission',
        sampleSize: 1290,
        timeframe: 'Trailing 90 Days',
        methodology: 'Normalized compute and inference cost per multi-stage completed autonomous mission in integer cents.',
        limitations: 'Self-hosted on-premise deployments excluded from cloud infrastructure normalization.',
        industryAverage: 145, // $1.45
        topQuartile: 85,  // $0.85
        unit: 'Cents ($USD)',
        orgValue: 78,
        percentileRank: 88,
        status: 'OPTIMAL',
      },
      {
        metricId: 'bench_resp_time_05',
        category: 'response_time',
        metricName: 'Critical Incident Mitigation Latency',
        sampleSize: 940,
        timeframe: 'Trailing 180 Days',
        methodology: 'Duration in seconds between circuit breaker trip event and automated human-escalated mitigation routing.',
        limitations: 'Calculated only for high-severity P0/P1 production incidents.',
        industryAverage: 120, // 2 minutes
        topQuartile: 45,  // 45 seconds
        unit: 'Seconds',
        orgValue: 28,
        percentileRank: 94,
        status: 'OPTIMAL',
      },
      {
        metricId: 'bench_proj_comp_06',
        category: 'project_completion',
        metricName: 'Strategic Goal-to-Execution Lineage Retention',
        sampleSize: 1100,
        timeframe: 'Trailing 90 Days',
        methodology: 'Proportion of completed tasks that explicitly trace back to an approved Corporate Objective/OKR.',
        limitations: 'Unplanned ad-hoc operational tasks reduce lineage scores if not tagged properly.',
        industryAverage: 58.0,
        topQuartile: 79.0,
        unit: '%',
        orgValue: 84.0,
        percentileRank: 82,
        status: 'OPTIMAL',
      },
    ];

    this.saveBenchmarks(defaultBenchmarks);
    return defaultBenchmarks;
  }

  private static saveBenchmarks(metrics: CrossOrgBenchmarkMetric[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }
}
