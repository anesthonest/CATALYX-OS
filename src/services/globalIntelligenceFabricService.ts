import { GlobalIntelligenceFabricSignal, DataClassificationLevel, DataAccessScope } from '../types';

const STORAGE_KEY = 'catalyx_v10_intelligence_fabric_signals';

export class GlobalIntelligenceFabricService {
  /**
   * Fetch all signals accessible to a given tenant
   */
  public static getSignals(tenantId: string): GlobalIntelligenceFabricSignal[] {
    const all = this.getAllSignals();
    // Enforce strict tenant boundary & access scope
    return all.filter(s => {
      if (s.accessScope === 'GLOBAL_PUBLIC') return true;
      if (s.accessScope === 'CROSS_ORG_AUTHORIZED' && s.crossTenantAuthorized) return true;
      return s.tenantId === tenantId;
    });
  }

  public static getAllSignals(): GlobalIntelligenceFabricSignal[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse intelligence fabric signals:', e);
      }
    }

    const defaultSignals: GlobalIntelligenceFabricSignal[] = [
      {
        id: 'fab_sig_001',
        sourceType: 'ORGANIZATIONAL',
        sourceName: 'Core ERP Ledger Ingest',
        tenantId: 'default_org',
        dataClassification: 'CONFIDENTIAL',
        retentionDays: 365,
        accessScope: 'TENANT_ONLY',
        confidencePercent: 98,
        provenanceSignature: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        originSystem: 'Vinexsah ERP Connector v2.4',
        payloadSummary: 'Monthly revenue ledger reconciliation completed with zero drift across 1,840 journal entries.',
        crossTenantAuthorized: false,
      },
      {
        id: 'fab_sig_002',
        sourceType: 'MARKETPLACE',
        sourceName: 'Global AI Agent Benchmark Relay',
        tenantId: 'GLOBAL',
        dataClassification: 'PUBLIC',
        retentionDays: 730,
        accessScope: 'GLOBAL_PUBLIC',
        confidencePercent: 95,
        provenanceSignature: 'sha256:4a5c9f8263de34199c0e4f884a4805c6d9a9307fa48b813b1856795f5fd19323',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        originSystem: 'CATALYX Marketplace Observability Bus',
        payloadSummary: 'Cross-industry mean agent task completion velocity improved by 14.2% across 45,000 runs.',
        crossTenantAuthorized: true,
      },
      {
        id: 'fab_sig_003',
        sourceType: 'INTEGRATION',
        sourceName: 'Pesapal East Africa Payment Webhook Bus',
        tenantId: 'default_org',
        dataClassification: 'RESTRICTED',
        retentionDays: 1825, // 5 years audit standard
        accessScope: 'TENANT_ONLY',
        confidencePercent: 100,
        provenanceSignature: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        originSystem: 'Pesapal v3 Live IPN Router',
        payloadSummary: 'Cryptographically signed payment token confirmed for UGX corporate subscription order.',
        crossTenantAuthorized: false,
      },
      {
        id: 'fab_sig_004',
        sourceType: 'ANALYTICAL',
        sourceName: 'Cross-Sector Operational Efficiency Index',
        tenantId: 'GLOBAL',
        dataClassification: 'PUBLIC',
        retentionDays: 365,
        accessScope: 'CROSS_ORG_AUTHORIZED',
        confidencePercent: 91,
        provenanceSignature: 'sha256:1b4f0e9851971998e732078544c615cc766ed7f8eb7b8b7e2832e1cd41c8ff9d',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        originSystem: 'CATALYX Benchmarking Aggregator',
        payloadSummary: 'Aggregated anonymized cycle-time metrics across 250 enterprise tenants indicate 28% gain via 10-step safety gate.',
        crossTenantAuthorized: true,
      },
      {
        id: 'fab_sig_005',
        sourceType: 'DEVELOPER',
        sourceName: 'Partner Ecosystem API Sandbox Audit',
        tenantId: 'default_org',
        dataClassification: 'INTERNAL',
        retentionDays: 90,
        accessScope: 'TENANT_ONLY',
        confidencePercent: 96,
        provenanceSignature: 'sha256:2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef9f8b1b85ee7',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        originSystem: 'Developer Platform Gateway v10',
        payloadSummary: 'Zero unauthorized cross-tenant API requests detected in sandbox test suites.',
        crossTenantAuthorized: false,
      },
    ];

    this.saveSignals(defaultSignals);
    return defaultSignals;
  }

  public static ingestSignal(signal: Omit<GlobalIntelligenceFabricSignal, 'id' | 'timestamp' | 'provenanceSignature'>): GlobalIntelligenceFabricSignal {
    const all = this.getAllSignals();
    const newSignal: GlobalIntelligenceFabricSignal = {
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      provenanceSignature: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    };

    all.unshift(newSignal);
    this.saveSignals(all);
    return newSignal;
  }

  private static saveSignals(signals: GlobalIntelligenceFabricSignal[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  }
}
