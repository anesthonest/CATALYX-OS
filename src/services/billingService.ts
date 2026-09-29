import { 
  BillingPlan, BillingTier, CurrencyCode, Subscription, 
  RevenueLedgerEntry, Invoice, PesapalPaymentInitRequest, 
  PesapalOrderResult, SubscriptionStatus, BillableUsage 
} from '../types';

// ============================================================================
// CONFIGURABLE SUBSCRIPTION TIERS & PRICING
// (Stored in structured configuration - not hardcoded into business logic)
// Minor units: 100 minor units = 1 standard currency unit (e.g. 4900 = $49.00, 15000000 = 150,000 UGX)
// ============================================================================

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: 'plan_individual',
    tier: 'individual',
    name: 'Individual',
    description: 'Autonomous sovereign intelligence workspace for developers, operators, and creators.',
    pricesMinorUnits: {
      USD: 1000,     // $10.00 USD
      KES: 130000,   // 1,300 KES
      UGX: 3700000,  // 37,000 UGX
      EUR: 900,      // €9.00 EUR
      GBP: 800,      // £8.00 GBP
      TZS: 2600000,  // 26,000 TZS
      RWF: 1300000,  // 13,000 RWF
      NGN: 1500000,  // 15,000 NGN
      GHS: 14000,    // 140 GHS
      ZAR: 18000,    // 180 ZAR
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 1,
      maxAgents: 5,
      maxWorkflows: 15,
      aiComputeUnitsPerMonth: 500,
      storageGb: 15,
    },
    features: [
      'Single Sovereign Operator Seat',
      '5 Active AI Agents (Level 0-2)',
      '15 Intelligent Automated Workflows',
      'Marketplace Creator Rights & Selling (0.25% fee)',
      'Direct Bank Transfer & Pesapal v3 Gateway',
      'Personal Digital Twin & Memory Vault',
      'Universal Work Object Generation',
    ],
  },
  {
    id: 'plan_group',
    tier: 'group',
    name: 'Group / Team',
    description: 'Collaborative autonomous operations for high-velocity teams, squads, and partnerships.',
    pricesMinorUnits: {
      USD: 1300,     // $13.00 USD
      KES: 170000,   // 1,700 KES
      UGX: 4800000,  // 48,000 UGX
      EUR: 1200,     // €12.00 EUR
      GBP: 1000,     // £10.00 GBP
      TZS: 3400000,  // 34,000 TZS
      RWF: 1700000,  // 17,000 RWF
      NGN: 1950000,  // 19,500 NGN
      GHS: 18000,    // 180 GHS
      ZAR: 24000,    // 240 ZAR
    },
    billingPeriod: 'monthly',
    popular: true,
    limits: {
      maxUsers: 10,
      maxAgents: 20,
      maxWorkflows: 50,
      aiComputeUnitsPerMonth: 2000,
      storageGb: 75,
    },
    features: [
      'Up to 10 Team Members',
      '20 Active AI Agents (Level 0-3)',
      '50 Multi-Step Shared Workflows',
      'Collaborative Multi-Agent Societies',
      'Shared Team Knowledge Universe',
      'Marketplace Creator Rights & Selling (0.27% fee)',
      'Direct Bank Transfer & Pesapal v3 Processing',
      'Daily Executive Briefings & Audit Logs',
    ],
  },
  {
    id: 'plan_organization',
    tier: 'organization',
    name: 'Organization',
    description: 'Full-spectrum institutional intelligence, sovereign governance, and multi-department controls.',
    pricesMinorUnits: {
      USD: 2500,     // $25.00 USD
      KES: 325000,   // 3,250 KES
      UGX: 9250000,  // 92,500 UGX
      EUR: 2300,     // €23.00 EUR
      GBP: 1900,     // £19.00 GBP
      TZS: 6500000,  // 65,000 TZS
      RWF: 3250000,  // 32,500 RWF
      NGN: 3750000,  // 37,500 NGN
      GHS: 35000,    // 350 GHS
      ZAR: 46000,    // 460 ZAR
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 100,
      maxAgents: 100,
      maxWorkflows: 250,
      aiComputeUnitsPerMonth: 10000,
      storageGb: 500,
    },
    features: [
      'Up to 100 Organization Members & Departments',
      '100 Autonomous AI Agents (Level 0-4)',
      '250 Enterprise Workflows & Scenario Simulators',
      'Institutional Governance & Immutable Audit Ledger',
      'Marketplace Creator Rights & Selling (0.50% fee)',
      'Custom Roles, SSO & Sovereign Connectors',
      'Direct Bank Transfer & Pesapal v3 Gateway',
      'Priority Sovereign SLA Support',
    ],
  },
  {
    id: 'plan_free',
    tier: 'free',
    name: 'Free Community',
    description: 'Foundational execution tools for solo exploration.',
    pricesMinorUnits: {
      UGX: 0,
      KES: 0,
      TZS: 0,
      RWF: 0,
      NGN: 0,
      GHS: 0,
      ZAR: 0,
      USD: 0,
      EUR: 0,
      GBP: 0,
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 1,
      maxAgents: 2,
      maxWorkflows: 3,
      aiComputeUnitsPerMonth: 50,
      storageGb: 1,
    },
    features: [
      'Core Execution & Task Logs',
      '2 AI Workforce Agents (Level 0-1)',
      'Basic Personal Goals & Initiatives',
      'Community Knowledge Wiki',
    ],
  },
  // Backward compatibility aliases
  {
    id: 'plan_starter',
    tier: 'starter',
    name: 'Starter Individual',
    description: 'Legacy alias mapped to Individual plan.',
    pricesMinorUnits: {
      USD: 1000, KES: 130000, UGX: 3700000, EUR: 900, GBP: 800,
      TZS: 2600000, RWF: 1300000, NGN: 1500000, GHS: 14000, ZAR: 18000
    },
    billingPeriod: 'monthly',
    limits: { maxUsers: 1, maxAgents: 5, maxWorkflows: 15, aiComputeUnitsPerMonth: 500, storageGb: 15 },
    features: ['Single Operator Sovereign Workspace', '5 Active AI Agents'],
  },
  {
    id: 'plan_professional',
    tier: 'professional',
    name: 'Professional Group',
    description: 'Legacy alias mapped to Group plan.',
    pricesMinorUnits: {
      USD: 1300, KES: 170000, UGX: 4800000, EUR: 1200, GBP: 1000,
      TZS: 3400000, RWF: 1700000, NGN: 1950000, GHS: 18000, ZAR: 24000
    },
    billingPeriod: 'monthly',
    limits: { maxUsers: 10, maxAgents: 20, maxWorkflows: 50, aiComputeUnitsPerMonth: 2000, storageGb: 75 },
    features: ['Up to 10 Team Members', '20 Active AI Agents'],
  },
  {
    id: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Enterprise Organization',
    description: 'Legacy alias mapped to Organization plan.',
    pricesMinorUnits: {
      USD: 2500, KES: 325000, UGX: 9250000, EUR: 2300, GBP: 1900,
      TZS: 6500000, RWF: 3250000, NGN: 3750000, GHS: 35000, ZAR: 46000
    },
    billingPeriod: 'monthly',
    limits: { maxUsers: 100, maxAgents: 100, maxWorkflows: 250, aiComputeUnitsPerMonth: 10000, storageGb: 500 },
    features: ['Up to 100 Members', '100 Active AI Agents'],
  },
];

// ============================================================================
// CURRENCY FORMATTING UTILITY
// ============================================================================

export function formatCurrencyAmount(minorUnits: number, currency: CurrencyCode): string {
  // Minor unit conversions:
  // For zero-decimal currencies (like UGX, RWF, TZS in common African banking displays),
  // 100 minor units = 1 integer currency unit.
  const majorUnits = minorUnits / 100;

  switch (currency) {
    case 'UGX':
      return `UGX ${majorUnits.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    case 'KES':
      return `KES ${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case 'TZS':
      return `TZS ${majorUnits.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    case 'RWF':
      return `RWF ${majorUnits.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    case 'NGN':
      return `₦${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case 'GHS':
      return `GH₵ ${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'ZAR':
      return `R ${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'USD':
      return `$${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `£${majorUnits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return `${currency} ${majorUnits.toFixed(2)}`;
  }
}

// ============================================================================
// SUBSCRIPTION STATE MACHINE
// Deterministic state transitions:
// TRIAL -> ACTIVE -> PAYMENT_PENDING -> PAST_DUE -> GRACE_PERIOD -> EXPIRED -> CANCELLED
// ============================================================================

export class SubscriptionStateMachine {
  public static canTransition(current: SubscriptionStatus, next: SubscriptionStatus): boolean {
    const allowedTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      trial: ['active', 'expired', 'cancelled', 'suspended'],
      pending: ['active', 'payment_pending', 'past_due', 'expired', 'cancelled', 'suspended'],
      active: ['payment_pending', 'past_due', 'cancelled', 'expired', 'suspended'],
      payment_pending: ['active', 'past_due', 'cancelled', 'suspended'],
      past_due: ['active', 'grace_period', 'expired', 'cancelled', 'suspended'],
      grace_period: ['active', 'expired', 'cancelled', 'suspended'],
      suspended: ['active', 'payment_pending', 'cancelled', 'expired'],
      expired: ['payment_pending', 'active', 'trial', 'pending'],
      cancelled: ['payment_pending', 'active', 'pending'],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}

// ============================================================================
// CLIENT-SIDE BILLING STORE & PERSISTENCE WRAPPER
// ============================================================================

const STORAGE_KEYS = {
  SUBSCRIPTION: 'catalyx_v8_subscription',
  LEDGER: 'catalyx_v8_revenue_ledger',
  INVOICES: 'catalyx_v8_invoices',
  USAGE: 'catalyx_v8_billable_usage',
};

export class BillingService {
  public static getPlans(): BillingPlan[] {
    return DEFAULT_BILLING_PLANS;
  }

  public static getPlan(planId: string): BillingPlan | undefined {
    return DEFAULT_BILLING_PLANS.find(p => p.id === planId);
  }

  public static initializeTrialSubscription(
    orgId: string,
    accountType: 'INDIVIDUAL' | 'GROUP' | 'ORGANIZATION' = 'INDIVIDUAL',
    forceNew: boolean = false
  ): Subscription {
    // Prevent duplicate trial provisioning for existing organizations / users
    if (!forceNew) {
      const existingRaw = localStorage.getItem(`${STORAGE_KEYS.SUBSCRIPTION}_${orgId}`);
      if (existingRaw) {
        try {
          const existing: Subscription = JSON.parse(existingRaw);
          if (existing && existing.id) {
            return existing;
          }
        } catch {}
      }
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day (1-month) trial

    let tier: BillingTier = 'individual';
    let planId = 'plan_individual';
    let monthlyPrice = 1000;

    if (accountType === 'ORGANIZATION') {
      tier = 'organization';
      planId = 'plan_organization';
      monthlyPrice = 2500;
    } else if (accountType === 'GROUP') {
      tier = 'group';
      planId = 'plan_group';
      monthlyPrice = 1300;
    }

    const sub: Subscription = {
      id: `sub_${orgId}_default`,
      organizationId: orgId,
      planId,
      tier,
      accountType,
      status: 'trial',
      currency: 'USD',
      amountMinorUnits: 0,
      monthlyPriceMinorUnits: monthlyPrice,
      billingInterval: 'monthly',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      renewalStatus: 'auto_renew',
      cancelAtPeriodEnd: false,
      paymentProvider: 'free',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.saveSubscription(sub);
    return sub;
  }

  public static getTrialDaysRemaining(sub: Subscription): number {
    if (sub.status !== 'trial') return 0;
    const now = Date.now();
    const periodEndMs = new Date(sub.currentPeriodEnd).getTime();
    return Math.max(0, Math.ceil((periodEndMs - now) / (24 * 60 * 60 * 1000)));
  }

  public static getSubscription(orgId: string): Subscription {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SUBSCRIPTION}_${orgId}`);
    if (raw) {
      try {
        const sub: Subscription = JSON.parse(raw);
        // Authoritative trial expiration enforcement
        if (sub.status === 'trial') {
          const now = Date.now();
          const periodEndMs = new Date(sub.currentPeriodEnd).getTime();
          if (periodEndMs <= now) {
            sub.status = 'expired';
            sub.updatedAt = new Date().toISOString();
            this.saveSubscription(sub);
          }
        }
        return sub;
      } catch (e) {
        console.error('Failed to parse subscription from storage:', e);
      }
    }

    // Default to one-month free trial
    return this.initializeTrialSubscription(orgId, 'INDIVIDUAL');
  }

  public static async syncAuthoritativeSubscription(orgId: string): Promise<Subscription> {
    try {
      const res = await fetch(`/api/billing/subscription?organizationId=${encodeURIComponent(orgId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscription) {
          const mapped: Subscription = {
            id: data.subscription.id,
            organizationId: data.subscription.organizationId,
            planId: data.subscription.planId,
            tier: data.subscription.tier,
            accountType: data.subscription.accountType || 'INDIVIDUAL',
            status: data.subscription.subscriptionStatus,
            currency: data.subscription.currency || 'USD',
            amountMinorUnits: data.subscription.amountMinorUnits,
            monthlyPriceMinorUnits: data.subscription.monthlyPriceMinorUnits,
            billingInterval: 'monthly',
            currentPeriodStart: data.subscription.currentPeriodStart,
            currentPeriodEnd: data.subscription.currentPeriodEnd,
            renewalStatus: 'auto_renew',
            cancelAtPeriodEnd: false,
            paymentProvider: data.subscription.paymentProvider,
            pesapalMerchantReference: data.subscription.pesapalMerchantReference,
            pesapalOrderTrackingId: data.subscription.pesapalOrderTrackingId,
            createdAt: data.subscription.createdAt,
            updatedAt: data.subscription.updatedAt,
          };
          this.saveSubscription(mapped);
          return mapped;
        }
      }
    } catch {
      // Local fallback
    }
    return this.getSubscription(orgId);
  }

  public static saveSubscription(sub: Subscription): void {
    sub.updatedAt = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.SUBSCRIPTION}_${sub.organizationId}`, JSON.stringify(sub));
  }

  public static getRevenueLedger(orgId: string): RevenueLedgerEntry[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.LEDGER}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse ledger:', e);
      }
    }

    // Initial seed entries
    const initialLedger: RevenueLedgerEntry[] = [
      {
        id: `rev_seed_001`,
        organizationId: orgId,
        transactionReference: `TX-PESA-88219A`,
        idempotencyKey: `idemp_init_${orgId}_01`,
        provider: 'pesapal',
        type: 'subscription',
        amountMinorUnits: 2900,
        currency: 'USD',
        status: 'completed',
        description: 'Starter Team Subscription (Monthly)',
        customerEmail: 'commander@vinexsah.com',
        pesapalTrackingId: 'pesa_track_9941a8',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.LEDGER}_${orgId}`, JSON.stringify(initialLedger));
    return initialLedger;
  }

  public static addLedgerEntry(entry: RevenueLedgerEntry): void {
    const ledger = this.getRevenueLedger(entry.organizationId);
    // Duplicate protection via idempotency key
    const existing = ledger.find(e => e.idempotencyKey === entry.idempotencyKey);
    if (existing) {
      console.warn('Idempotency key already exists in revenue ledger, ignoring duplicate:', entry.idempotencyKey);
      return;
    }

    ledger.unshift(entry);
    localStorage.setItem(`${STORAGE_KEYS.LEDGER}_${entry.organizationId}`, JSON.stringify(ledger));
  }

  public static recordRevenueLedgerEntry(entry: RevenueLedgerEntry): void {
    this.addLedgerEntry(entry);
  }

  public static getInvoices(orgId: string): Invoice[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.INVOICES}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse invoices:', e);
      }
    }

    const now = new Date();
    const prevMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const initialInvoices: Invoice[] = [
      {
        id: `inv_${orgId}_001`,
        invoiceNumber: `INV-2026-0089`,
        organizationId: orgId,
        subscriptionId: `sub_${orgId}_default`,
        amountMinorUnits: 2900,
        currency: 'USD',
        status: 'paid',
        periodStart: prevMonth.toISOString(),
        periodEnd: now.toISOString(),
        paymentMethod: 'Pesapal Mobile Money / Card',
        createdAt: prevMonth.toISOString(),
        receiptUrl: '#',
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.INVOICES}_${orgId}`, JSON.stringify(initialInvoices));
    return initialInvoices;
  }

  public static addInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices(invoice.organizationId);
    invoices.unshift(invoice);
    localStorage.setItem(`${STORAGE_KEYS.INVOICES}_${invoice.organizationId}`, JSON.stringify(invoices));
  }

  public static getBillableUsage(orgId: string): BillableUsage {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const raw = localStorage.getItem(`${STORAGE_KEYS.USAGE}_${orgId}_${currentMonth}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse usage:', e);
      }
    }

    const initialUsage: BillableUsage = {
      organizationId: orgId,
      periodMonth: currentMonth,
      aiTokensUsed: 14250,
      agentExecutions: 38,
      workflowRuns: 19,
      apiCallsCount: 142,
      totalCostEstimatedUsd: 4.85,
      budgetLimitUsd: 50.00,
      budgetAlertTriggered: false,
    };

    localStorage.setItem(`${STORAGE_KEYS.USAGE}_${orgId}_${currentMonth}`, JSON.stringify(initialUsage));
    return initialUsage;
  }

  public static recordUsage(orgId: string, tokens: number, executions: number): void {
    const usage = this.getBillableUsage(orgId);
    usage.aiTokensUsed += tokens;
    usage.agentExecutions += executions;
    usage.totalCostEstimatedUsd += (tokens / 1000) * 0.002;

    if (usage.totalCostEstimatedUsd >= usage.budgetLimitUsd * 0.9) {
      usage.budgetAlertTriggered = true;
    }

    localStorage.setItem(`${STORAGE_KEYS.USAGE}_${orgId}_${usage.periodMonth}`, JSON.stringify(usage));
  }

  /**
   * Initiate Pesapal Payment Request via Server API
   */
  public static async initiatePesapalPayment(req: PesapalPaymentInitRequest): Promise<PesapalOrderResult> {
    try {
      const response = await fetch('/api/billing/pesapal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status} failed`);
      }

      const result: PesapalOrderResult = await response.json();
      return result;
    } catch (err) {
      console.warn('Backend Pesapal initiation API call fell back to local handler:', err);
      // Generate client-side order reference with verification tracking
      const trackingId = `pesa_ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const merchantRef = `CX-${req.tier.toUpperCase()}-${Date.now().toString().slice(-6)}`;
      
      return {
        orderTrackingId: trackingId,
        merchantReference: merchantRef,
        redirectUrl: `/billing/verify?trackingId=${trackingId}&merchantRef=${merchantRef}`,
        status: '200',
        isSimulated: true,
      };
    }
  }

  /**
   * Verify Pesapal Transaction Server-Side & Authoritatively Activate Subscription
   * Strictly requires verified confirmation from the server/gateway. No client-side fallbacks.
   */
  public static async verifyAndActivatePayment(
    orgId: string, 
    orderTrackingId: string, 
    merchantRef: string,
    planId: string,
    currency: CurrencyCode
  ): Promise<{ success: boolean; message: string; subscription?: Subscription }> {
    try {
      const response = await fetch('/api/billing/pesapal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          orderTrackingId,
          merchantReference: merchantRef,
          planId,
          currency,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errData.error || `Server verification failed with status HTTP ${response.status}. Entitlements cannot be granted without authoritative gateway confirmation.`
        };
      }

      const data = await response.json();
      if (data.success && data.subscription) {
        this.saveSubscription(data.subscription);
        return { 
          success: true, 
          message: data.message || 'Subscription successfully verified and activated via Pesapal gateway.', 
          subscription: data.subscription 
        };
      }

      return {
        success: false,
        message: data.error || 'Gateway returned unverified status. No entitlements granted.'
      };
    } catch (e: any) {
      console.error('Authoritative verification network failure:', e);
      return {
        success: false,
        message: `Network failure connecting to verification server: ${e?.message || e}. Payment remains unverified.`
      };
    }
  }
}
