import { Marketplace2Item, MarketplaceLifecycleState, EcosystemItemCategory } from '../types';

const STORAGE_KEY = 'catalyx_v10_marketplace2_items';

export class Marketplace2Service {
  public static getItems(): Marketplace2Item[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultItems: Marketplace2Item[] = [
      {
        id: 'mp2_sec_sentinel',
        creatorId: 'dev_vinexsah_sec',
        ownerId: 'org_vinexsah_core',
        version: '3.1.0',
        category: 'AI AGENTS',
        title: 'Autonomous Cloud FinOps Sentinel Agent',
        description: 'Detects idle cloud compute resources, renegotiates reserved instances, and flags sudden egress spikes under strict policy caps.',
        permissionsManifest: ['READ_ANALYTICS', 'GENERATE_RECOMMENDATION', 'EXECUTE_OPTIMIZATION'],
        dependencies: ['tech_gemini_2_5', 'connector_aws_gcp'],
        compatibility: ['CATALYX V9', 'CATALYX V10'],
        lifecycleState: 'PUBLISHED',
        pricingModel: 'usage_based',
        priceMinorUnits: 5,
        currency: 'USD',
        sandboxProfile: {
          memoryLimitMb: 512,
          networkRestrictions: ['api.aws.amazon.com', 'compute.googleapis.com'],
          secretIsolationVerified: true,
          malwareScanPassed: true,
          zeroCustomerPrivilegeInheritance: true,
        },
        changelog: [
          { version: '3.1.0', releaseDate: '2026-08-15', notes: 'Integrated with CATALYX V10 Global Intelligence Fabric.' },
          { version: '3.0.0', releaseDate: '2026-06-10', notes: 'Initial multi-cloud cost optimization support.' },
        ],
        supportContact: 'security-support@vinexsah.com',
        usageMetrics: {
          totalInstalls: 3420,
          runsLast30Days: 142500,
          errorRatePercent: 0.02,
        },
      },
      {
        id: 'mp2_pesapal_conn',
        creatorId: 'dev_payments_team',
        ownerId: 'org_vinexsah_core',
        version: '3.4.0',
        category: 'CONNECTORS',
        title: 'Pesapal v3 Live East Africa Gateway Connector',
        description: 'Direct bi-directional gateway connector supporting instant IPN registration, order token validation, and multi-currency conversion.',
        permissionsManifest: ['PROCESS_PAYMENTS', 'SUBSCRIBE_WEBHOOKS', 'READ_BILLING_LEDGER'],
        dependencies: ['tech_pesapal_v3'],
        compatibility: ['CATALYX V8', 'CATALYX V9', 'CATALYX V10'],
        lifecycleState: 'PUBLISHED',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        sandboxProfile: {
          memoryLimitMb: 256,
          networkRestrictions: ['pay.pesapal.com', 'cybqa.pesapal.com'],
          secretIsolationVerified: true,
          malwareScanPassed: true,
          zeroCustomerPrivilegeInheritance: true,
        },
        changelog: [
          { version: '3.4.0', releaseDate: '2026-09-01', notes: 'Enhanced circuit breaker handling for mobile money timeout resilience.' },
        ],
        supportContact: 'payments-dev@vinexsah.com',
        usageMetrics: {
          totalInstalls: 5200,
          runsLast30Days: 489000,
          errorRatePercent: 0.005,
        },
      },
      {
        id: 'mp2_tax_nexus',
        creatorId: 'dev_pan_african_tax',
        ownerId: 'org_pan_africa_tech',
        version: '2.0.4',
        category: 'APPLICATIONS',
        title: 'Pan-African Multi-Tenant Tax Compliance Nexus',
        description: 'Auto-computes withholding taxes, EFRIS electronic fiscal receipts for Uganda, and KRA iTax integration.',
        permissionsManifest: ['READ_ORGANIZATION_LEDGER', 'EXPORT_TAX_SCHEDULES'],
        dependencies: ['tech_postgres_drizzle'],
        compatibility: ['CATALYX V10'],
        lifecycleState: 'PUBLISHED',
        pricingModel: 'subscription',
        priceMinorUnits: 4900,
        currency: 'USD',
        sandboxProfile: {
          memoryLimitMb: 1024,
          networkRestrictions: ['efris.ura.go.ug', 'itax.kra.go.ke'],
          secretIsolationVerified: true,
          malwareScanPassed: true,
          zeroCustomerPrivilegeInheritance: true,
        },
        changelog: [
          { version: '2.0.4', releaseDate: '2026-08-20', notes: 'Added fiscal electronic signature verification.' },
        ],
        supportContact: 'support@panafricatax.com',
        usageMetrics: {
          totalInstalls: 1450,
          runsLast30Days: 62000,
          errorRatePercent: 0.04,
        },
      },
      {
        id: 'mp2_pending_review_item',
        creatorId: 'dev_external_partner_99',
        ownerId: 'org_partner_alpha',
        version: '1.0.0-rc1',
        category: 'AI AGENTS',
        title: 'Customer Sentiment & Churn Forecaster Agent',
        description: 'Analyzes support tickets and usage decline to predict 30-day customer churn probability.',
        permissionsManifest: ['READ_WORKSPACE_MESSAGES', 'ANALYZE_USAGE_PATTERNS'],
        dependencies: ['tech_gemini_2_5'],
        compatibility: ['CATALYX V10'],
        lifecycleState: 'SECURITY_REVIEW',
        pricingModel: 'subscription',
        priceMinorUnits: 1900,
        currency: 'USD',
        sandboxProfile: {
          memoryLimitMb: 512,
          networkRestrictions: ['api.internal.safenet'],
          secretIsolationVerified: true,
          malwareScanPassed: true,
          zeroCustomerPrivilegeInheritance: true,
        },
        changelog: [
          { version: '1.0.0-rc1', releaseDate: '2026-09-04', notes: 'Submitted for security review and prompt injection audit.' },
        ],
        supportContact: 'partner-alpha@external-dev.io',
        usageMetrics: {
          totalInstalls: 12,
          runsLast30Days: 140,
          errorRatePercent: 0.0,
        },
      },
    ];

    this.saveItems(defaultItems);
    return defaultItems;
  }

  public static transitionState(itemId: string, newState: MarketplaceLifecycleState, actor: string): Marketplace2Item | null {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return null;

    item.lifecycleState = newState;
    item.changelog.unshift({
      version: item.version,
      releaseDate: new Date().toISOString().split('T')[0],
      notes: `Lifecycle transition to ${newState} by ${actor}.`,
    });

    this.saveItems(items);
    return item;
  }

  public static emergencySuspend(itemId: string, reason: string, actor: string): Marketplace2Item | null {
    return this.transitionState(itemId, 'SUSPENDED', `${actor} (Emergency Reason: ${reason})`);
  }

  private static saveItems(items: Marketplace2Item[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}
