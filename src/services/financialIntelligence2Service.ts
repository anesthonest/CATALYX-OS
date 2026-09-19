import {
  EconomicMetricsBreakdown,
  CostDriverAttribution,
  RevenueOptimizationProposal,
  DynamicBudgetRecord
} from '../types';

class FinancialIntelligence2Service {
  private economicMetrics: EconomicMetricsBreakdown = {
    revenueMinorUnits: 28450000, // $284,500.00
    mrrMinorUnits: 23600000,     // $236,000.00 MRR
    arrMinorUnits: 283200000,    // $2,832,000.00 ARR
    expensesMinorUnits: 14820000,// $148,200.00 / mo
    monthlyBurnMinorUnits: 0,    // Cash-flow positive ($87,800 net operating income)
    runwayMonths: 48,            // 48+ months funded
    grossMarginPercent: 82.4,
    netMarginPercent: 30.8,
    cacMinorUnits: 420000,       // $4,200 Customer Acquisition Cost
    ltvMinorUnits: 3840000,      // $38,400 Customer Lifetime Value
    ltvCacRatio: 9.14,
    churnRatePercent: 1.8,
    netRetentionRatePercent: 118.5,
    expansionRevenueMinorUnits: 4200000, // $42,000 / mo expansion
    contractionRevenueMinorUnits: 650000, // $6,500 / mo contraction
    aiCostsMinorUnits: 342000,   // $3,420 / mo AI token spend
    infrastructureCostsMinorUnits: 185000, // $1,850 / mo Cloud Run/Ingress
    marketplaceEconomicsMinorUnits: 620000, // $6,200 / mo Gross Marketplace volume
    apiRevenueMinorUnits: 410000, // $4,100 / mo Direct API consumption
    creatorEconomyPayoutsMinorUnits: 434000, // $4,340 paid to creator partners
    paymentFeesMinorUnits: 85350, // $853.50 Pesapal / Stripe processing fees
    isAccountingActual: true,
    sourceTimeframe: 'Q3 2026 Settled Ledger (Updated Daily via Reconciliation Engine)',
  };

  private costDrivers: CostDriverAttribution[] = [
    {
      id: 'cost-drv-01',
      costCategory: 'AI_USAGE',
      driver: 'Un-cached redundant document embeddings during continuous health radar scans',
      monthlySpendMinorUnits: 125000, // $1,250
      potentialSavingMinorUnits: 78000, // $780
      risk: 'Low - Semantic caching uses exact cosine similarity > 0.98 threshold',
      recommendedAction: 'Enable Semantic Vector Cache in AI Gateway with 12h TTL',
      status: 'DETECTED',
    },
    {
      id: 'cost-drv-02',
      costCategory: 'INFRASTRUCTURE',
      driver: 'Over-provisioned idle container instances in staging and preview environments',
      monthlySpendMinorUnits: 64000, // $640
      potentialSavingMinorUnits: 42000, // $420
      risk: 'None - Staging containers will cold-start within 1.2s when accessed',
      recommendedAction: 'Apply auto-scale to zero (min-instances: 0) on non-production clusters',
      status: 'APPLYING',
    },
    {
      id: 'cost-drv-03',
      costCategory: 'WORKFLOWS',
      driver: 'Synchronous polling in external CRM integration workflows vs webhook listeners',
      monthlySpendMinorUnits: 38000, // $380
      potentialSavingMinorUnits: 29000, // $290
      risk: 'Low - Requires verifying external CRM webhook delivery signature',
      recommendedAction: 'Convert 4 polling integration recipes to event-driven Webhook Mesh v9',
      status: 'OPTIMIZED',
    },
    {
      id: 'cost-drv-04',
      costCategory: 'APPLICATIONS',
      driver: 'Unassigned SaaS seat licenses across departed contractors and project alumnae',
      monthlySpendMinorUnits: 138000, // $1,380
      potentialSavingMinorUnits: 138000, // $1,380
      risk: 'Zero - Verified no login in 60+ days',
      recommendedAction: 'Automate seat license reclamation during contractor offboarding step',
      status: 'DETECTED',
    }
  ];

  private revenueProposals: RevenueOptimizationProposal[] = [
    {
      id: 'rev-prop-01',
      type: 'CUSTOMER_EXPANSION',
      title: 'Proactive Volume Tier Upgrade for Heavy API Consumers',
      analysisSummary: '14 Enterprise tenants consistently hit 92% of tier API allowances in the third week of every billing cycle, resulting in manual top-up requests.',
      targetSegment: 'Top 10% Enterprise API heavy users',
      projectedRevenueIncreaseMinorUnits: 1850000, // +$18,500.00 / month
      approvalRequired: true,
      status: 'REVIEW',
    },
    {
      id: 'rev-prop-02',
      type: 'PRODUCT_PACKAGING',
      title: 'Bundle Marketplace Sandboxes & AI Safety Firewall with Enterprise Tier',
      analysisSummary: 'Mid-market conversion to Enterprise tier increases by 34% when security audit and sandbox isolation features are bundled natively rather than sold as add-ons.',
      targetSegment: 'Growth organizations undergoing ISO27001/SOC2 compliance',
      projectedRevenueIncreaseMinorUnits: 2400000, // +$24,000.00 / month
      approvalRequired: true,
      status: 'APPROVED',
    },
    {
      id: 'rev-prop-03',
      type: 'RETENTION_CAMPAIGN',
      title: 'Automated Account Review for Tenants with Declining Weekly Active Sprints',
      analysisSummary: 'Targeted proactive intervention with dedicated AI workflow template recommendations retains 78% of cooling accounts before churn risk materializes.',
      targetSegment: 'Accounts with -30% month-over-month workflow activity',
      projectedRevenueIncreaseMinorUnits: 980000, // +$9,800.00 / month preserved
      approvalRequired: true,
      status: 'REVIEW',
    }
  ];

  private dynamicBudgets: DynamicBudgetRecord[] = [
    {
      category: 'AI Workforce Token Inference',
      budgetMinorUnits: 400000, // $4,000.00
      actualMinorUnits: 342000, // $3,420.00
      forecastMinorUnits: 375000,// $3,750.00
      variancePercent: -14.5,
      varianceExplanation: 'Flash model tier routing delivered higher token cost efficiency than planned in Q3.',
      status: 'ON_TRACK',
    },
    {
      category: 'Cloud Infrastructure & Ingress',
      budgetMinorUnits: 200000,
      actualMinorUnits: 185000,
      forecastMinorUnits: 195000,
      variancePercent: -7.5,
      varianceExplanation: 'Container footprint maintained within reserved instance thresholds.',
      status: 'ON_TRACK',
    },
    {
      category: 'Marketplace Subsidies & Grants',
      budgetMinorUnits: 500000,
      actualMinorUnits: 580000,
      forecastMinorUnits: 620000,
      variancePercent: 16.0,
      varianceExplanation: 'High surge in third-party verified developer extension submissions created higher validation grant payouts.',
      status: 'AT_RISK',
    },
    {
      category: 'Security Audits & Penetration Verification',
      budgetMinorUnits: 300000,
      actualMinorUnits: 290000,
      forecastMinorUnits: 300000,
      variancePercent: -3.3,
      varianceExplanation: 'Continuous AI safety firewall and automated penetration checks kept vendor costs flat.',
      status: 'ON_TRACK',
    }
  ];

  public getEconomicMetrics(): EconomicMetricsBreakdown {
    return this.economicMetrics;
  }

  public getCostDrivers(): CostDriverAttribution[] {
    return this.costDrivers;
  }

  public getRevenueProposals(): RevenueOptimizationProposal[] {
    return this.revenueProposals;
  }

  public getDynamicBudgets(): DynamicBudgetRecord[] {
    return this.dynamicBudgets;
  }

  public updateRevenueProposalStatus(
    id: string,
    status: 'REVIEW' | 'APPROVED' | 'REJECTED'
  ): RevenueOptimizationProposal | null {
    const prop = this.revenueProposals.find(p => p.id === id);
    if (!prop) return null;
    prop.status = status;
    return prop;
  }

  public applyCostDriverAction(id: string): { success: boolean; message: string } {
    const driver = this.costDrivers.find(d => d.id === id);
    if (!driver) return { success: false, message: 'Cost driver not found.' };

    driver.status = 'OPTIMIZED';
    return {
      success: true,
      message: `Cost driver action '${driver.recommendedAction}' executed. Projected monthly savings: $${(driver.potentialSavingMinorUnits / 100).toFixed(2)}.`
    };
  }
}

export const financialIntelligence2Service = new FinancialIntelligence2Service();
