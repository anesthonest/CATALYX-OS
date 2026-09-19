import { EcosystemDiscoveryItem, EcosystemItemCategory } from '../types';

const STORAGE_KEY = 'catalyx_v10_ecosystem_discovery_items';

export class IntelligenceDiscoveryService {
  public static getItems(categoryFilter?: EcosystemItemCategory | 'ALL'): EcosystemDiscoveryItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items: EcosystemDiscoveryItem[] = [];
    if (raw) {
      try { items = JSON.parse(raw); } catch (e) { console.error(e); }
    }

    if (items.length === 0) {
      items = this.getDefaultItems();
      this.saveItems(items);
    }

    if (!categoryFilter || categoryFilter === 'ALL') {
      return items;
    }
    return items.filter(item => item.category === categoryFilter);
  }

  public static searchAndRank(
    query: string, 
    category?: EcosystemItemCategory | 'ALL', 
    minCompatibility = 50
  ): EcosystemDiscoveryItem[] {
    const all = this.getItems(category);
    const q = query.toLowerCase().trim();

    return all
      .filter(item => {
        if (item.compatibilityScore < minCompatibility) return false;
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          item.creatorName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Multi-signal objective ranking: Trust > Compatibility > Rating > Installs
        const trustWeights = { TRUSTED: 100, VERIFIED: 70, UNVERIFIED: 30, SUSPENDED: 0, REVOKED: 0 };
        const scoreA = (trustWeights[a.creatorVerification] || 0) * 0.35 + a.compatibilityScore * 0.35 + (a.rating / 5 * 100) * 0.2 + Math.min(a.activeInstalls / 100, 100) * 0.1;
        const scoreB = (trustWeights[b.creatorVerification] || 0) * 0.35 + b.compatibilityScore * 0.35 + (b.rating / 5 * 100) * 0.2 + Math.min(b.activeInstalls / 100, 100) * 0.1;
        return scoreB - scoreA;
      });
  }

  private static getDefaultItems(): EcosystemDiscoveryItem[] {
    return [
      {
        id: 'eco_item_agent_01',
        category: 'AI AGENTS',
        title: 'Autonomous Multi-Cloud FinOps Sentinel',
        description: 'Detects idle cloud compute resources, renegotiates reserved instances, and flags sudden egress spikes.',
        creatorName: 'Vinexsah Infrastructure Labs',
        creatorVerification: 'TRUSTED',
        version: '3.1.0',
        rating: 4.95,
        reviewsCount: 184,
        activeInstalls: 3420,
        securityAuditStatus: 'PASSED',
        pricingModel: 'usage_based',
        priceMinorUnits: 5, // $0.05 per optimization run
        currency: 'USD',
        tags: ['finops', 'cloud', 'cost', 'aws', 'gcp', 'agents'],
        compatibilityScore: 98,
        lastAuditedAt: '2026-08-15T00:00:00Z',
      },
      {
        id: 'eco_item_app_02',
        category: 'APPLICATIONS',
        title: 'Global Multi-Tenant Tax Compliance Nexus',
        description: 'Real-time calculation and withholding compliance across East Africa (URA, KRA, TRA) and international VAT.',
        creatorName: 'Pan-African Sovereign Tech Group',
        creatorVerification: 'TRUSTED',
        version: '2.0.4',
        rating: 4.88,
        reviewsCount: 92,
        activeInstalls: 1450,
        securityAuditStatus: 'PASSED',
        pricingModel: 'subscription',
        priceMinorUnits: 4900, // $49.00 / mo
        currency: 'USD',
        tags: ['tax', 'compliance', 'uganda', 'kenya', 'vat', 'accounting'],
        compatibilityScore: 95,
        lastAuditedAt: '2026-08-20T00:00:00Z',
      },
      {
        id: 'eco_item_wf_03',
        category: 'WORKFLOWS',
        title: 'Enterprise High-Risk Vendor Onboarding Gate',
        description: '10-stage screening workflow combining KYC, AML, credit score checking, and CISO executive approval.',
        creatorName: 'Enterprise Governance Guild',
        creatorVerification: 'VERIFIED',
        version: '1.8.2',
        rating: 4.79,
        reviewsCount: 65,
        activeInstalls: 890,
        securityAuditStatus: 'PASSED',
        pricingModel: 'one_time',
        priceMinorUnits: 2500, // $25.00
        currency: 'USD',
        tags: ['procurement', 'vendor', 'kyc', 'aml', 'governance'],
        compatibilityScore: 92,
        lastAuditedAt: '2026-07-28T00:00:00Z',
      },
      {
        id: 'eco_item_conn_04',
        category: 'CONNECTORS',
        title: 'Pesapal v3 Unified East Africa Gateway Connector',
        description: 'Bi-directional webhook synchronization for cards, mobile money (M-Pesa, Airtel Money, MTN MoMo), and bank transfers.',
        creatorName: 'Vinexsah Payments Architecture',
        creatorVerification: 'TRUSTED',
        version: '3.4.0',
        rating: 4.98,
        reviewsCount: 310,
        activeInstalls: 5200,
        securityAuditStatus: 'PASSED',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        tags: ['pesapal', 'payments', 'momo', 'mpesa', 'connector'],
        compatibilityScore: 100,
        lastAuditedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'eco_item_auto_05',
        category: 'AUTOMATION PACKAGES',
        title: 'Continuous Disaster Recovery Simulation Suite',
        description: 'Automated chaos engineering package injecting synthetic network drops and testing circuit breaker fallback.',
        creatorName: 'Reliability Engineering Guild',
        creatorVerification: 'VERIFIED',
        version: '2.1.1',
        rating: 4.82,
        reviewsCount: 44,
        activeInstalls: 610,
        securityAuditStatus: 'PASSED',
        pricingModel: 'subscription',
        priceMinorUnits: 1900, // $19.00 / mo
        currency: 'USD',
        tags: ['chaos', 'circuit-breaker', 'sre', 'failover', 'automation'],
        compatibilityScore: 94,
        lastAuditedAt: '2026-08-10T00:00:00Z',
      },
      {
        id: 'eco_item_know_06',
        category: 'KNOWLEDGE PACKAGES',
        title: 'Global AI Safety & Autonomy Gate Standard (SOP-SEC-99)',
        description: 'Production-tested Standard Operating Procedures for Level 1-4 Autonomy, audit trails, and human override gates.',
        creatorName: 'Vinexsah Governance Institute',
        creatorVerification: 'TRUSTED',
        version: '1.0.0',
        rating: 4.96,
        reviewsCount: 140,
        activeInstalls: 2150,
        securityAuditStatus: 'PASSED',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        tags: ['sop', 'ai-safety', 'governance', 'knowledge', 'iso42001'],
        compatibilityScore: 99,
        lastAuditedAt: '2026-09-02T00:00:00Z',
      },
      {
        id: 'eco_item_tmpl_07',
        category: 'TEMPLATES',
        title: 'Multi-Department OKR Alignment Template',
        description: 'Ready-to-deploy goal lineage template connecting Executive Strategy to Tactical sprints with automated health radar.',
        creatorName: 'Agile Strategy Alliance',
        creatorVerification: 'VERIFIED',
        version: '2.5.0',
        rating: 4.75,
        reviewsCount: 88,
        activeInstalls: 1980,
        securityAuditStatus: 'PASSED',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        tags: ['okr', 'strategy', 'templates', 'agile', 'lineage'],
        compatibilityScore: 96,
        lastAuditedAt: '2026-08-18T00:00:00Z',
      },
      {
        id: 'eco_item_anly_08',
        category: 'ANALYTICS',
        title: 'Cognitive Velocity & Agent ROI Calculator',
        description: 'Quantitative analytics module comparing human labor hours to autonomous agent task completion across 12 disciplines.',
        creatorName: 'DeepMetric Analytics Corp',
        creatorVerification: 'VERIFIED',
        version: '1.3.0',
        rating: 4.71,
        reviewsCount: 39,
        activeInstalls: 750,
        securityAuditStatus: 'PASSED',
        pricingModel: 'subscription',
        priceMinorUnits: 2900,
        currency: 'USD',
        tags: ['analytics', 'roi', 'productivity', 'metrics', 'dashboard'],
        compatibilityScore: 90,
        lastAuditedAt: '2026-07-22T00:00:00Z',
      },
      {
        id: 'eco_item_ind_09',
        category: 'INDUSTRY SOLUTIONS',
        title: 'Healthcare HIPAA & Patient Data Isolation Mesh',
        description: 'Specialized healthcare ecosystem solution enforcing zero cross-tenant patient record leakage and cryptographic de-identification.',
        creatorName: 'MedTech Security Foundation',
        creatorVerification: 'TRUSTED',
        version: '2.0.1',
        rating: 4.97,
        reviewsCount: 78,
        activeInstalls: 540,
        securityAuditStatus: 'PASSED',
        pricingModel: 'enterprise',
        priceMinorUnits: 9900, // $99.00 / mo
        currency: 'USD',
        tags: ['healthcare', 'hipaa', 'patient-data', 'phi', 'compliance'],
        compatibilityScore: 93,
        lastAuditedAt: '2026-08-30T00:00:00Z',
      },
      {
        id: 'eco_item_dev_10',
        category: 'DEVELOPER SERVICES',
        title: 'Signed Webhook Event Dispatcher & Replay Proxy',
        description: 'Developer infrastructure service offering guaranteed webhook delivery, HMAC-SHA256 signing, exponential backoff, and dead-letter queues.',
        creatorName: 'Vinexsah Developer Platform Team',
        creatorVerification: 'TRUSTED',
        version: '3.0.0',
        rating: 4.94,
        reviewsCount: 220,
        activeInstalls: 3100,
        securityAuditStatus: 'PASSED',
        pricingModel: 'usage_based',
        priceMinorUnits: 1, // $0.01 per 1000 events
        currency: 'USD',
        tags: ['webhooks', 'developer', 'hmac', 'event-bus', 'api'],
        compatibilityScore: 100,
        lastAuditedAt: '2026-09-04T00:00:00Z',
      },
    ];
  }

  private static saveItems(items: EcosystemDiscoveryItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}
