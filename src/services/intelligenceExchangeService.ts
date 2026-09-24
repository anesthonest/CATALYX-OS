import { IntelligenceExchangeListing, CreatorRevenueAccounting } from '../types';

const STORAGE_KEYS = {
  LISTINGS: 'catalyx_v10_intelligence_exchange_listings',
  CREATOR_REVENUE: 'catalyx_v10_creator_revenue_accounting',
};

export class IntelligenceExchangeService {
  public static getListings(): IntelligenceExchangeListing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultListings: IntelligenceExchangeListing[] = [
      {
        id: 'intel_report_fintech_2026',
        title: 'East Africa Digital Payments & Mobile Money Benchmark Report 2026',
        publisher: 'Pan-African Sovereign Fintech Institute',
        classification: 'LICENSED',
        category: 'REPORT',
        priceMinorUnits: 4900, // $49.00
        currency: 'USD',
        verifiedProvenance: true,
        downloadCount: 380,
        summary: 'Aggregated empirical analysis of settlement latencies, merchant drop-offs, and fraud mitigation across 12 million transactions in Kenya, Uganda, and Rwanda.',
      },
      {
        id: 'intel_model_saas_churn',
        title: 'B2B Enterprise SaaS Predictive Churn & Retention Operational Model',
        publisher: 'Vinexsah Growth Intelligence',
        classification: 'PUBLIC',
        category: 'OPERATIONAL_MODEL',
        priceMinorUnits: 0,
        currency: 'USD',
        verifiedProvenance: true,
        downloadCount: 1420,
        summary: 'Mathematical formulation and automated SQL scripts for identifying enterprise accounts trending toward inactivity 60 days before contract expiry.',
      },
      {
        id: 'intel_benchmark_iso42001',
        title: 'ISO/IEC 42001 Autonomous AI Management System Blueprint',
        publisher: 'Global AI Governance Consortium',
        classification: 'LICENSED',
        category: 'FRAMEWORK',
        priceMinorUnits: 9900, // $99.00
        currency: 'USD',
        verifiedProvenance: true,
        downloadCount: 215,
        summary: 'Complete compliance roadmap, risk assessment matrices, and human-in-the-loop safety gate templates designed for autonomous AI workforces.',
      },
      {
        id: 'intel_dataset_dev_bench',
        title: 'Anonymized Developer Productivity & Cycle-Time Benchmark Dataset',
        publisher: 'Ecosystem Telemetry Research Lab',
        classification: 'OPT_IN_SHARED',
        category: 'BENCHMARK',
        priceMinorUnits: 1500, // $15.00
        currency: 'USD',
        verifiedProvenance: true,
        downloadCount: 520,
        summary: 'Differential-privacy protected dataset of PR review times, CI build durations, and test coverage metrics from 400 engineering teams.',
      },
    ];

    this.saveListings(defaultListings);
    return defaultListings;
  }

  public static getCreatorRevenue(creatorId: string): CreatorRevenueAccounting {
    const raw = localStorage.getItem(STORAGE_KEYS.CREATOR_REVENUE);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed[creatorId]) return parsed[creatorId];
      } catch (e) {
        console.error(e);
      }
    }

    const defaultAccounting: CreatorRevenueAccounting = {
      creatorId,
      grossSalesMinorUnits: 842500, // $8,425.00
      platformCommissionMinorUnits: 2106, // 0.25% platform fee = $21.06 (2106 minor units)
      taxesAndFeesMinorUnits: 42125, // 5% withholding/fees = $421.25
      creatorEarningsMinorUnits: 798269, // Net $7,982.69
      pendingPayoutMinorUnits: 145000, // $1,450.00 pending
      settledPayoutMinorUnits: 653269, // $6,532.69 already paid
      refundsCount: 2,
      payoutHistory: [
        {
          payoutId: 'payout_settle_01',
          amountMinorUnits: 250000,
          currency: 'USD',
          method: 'Bank Wire / SWIFT',
          status: 'PAID',
          date: '2026-07-01',
        },
        {
          payoutId: 'payout_settle_02',
          amountMinorUnits: 279000,
          currency: 'USD',
          method: 'Pesapal Business Account',
          status: 'PAID',
          date: '2026-08-01',
        },
        {
          payoutId: 'payout_settle_03_pending',
          amountMinorUnits: 145000,
          currency: 'USD',
          method: 'Pesapal Business Account',
          status: 'PROCESSING',
          date: '2026-09-01',
        },
      ],
    };

    return defaultAccounting;
  }

  private static saveListings(listings: IntelligenceExchangeListing[]): void {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }
}
