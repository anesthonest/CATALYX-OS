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
    id: 'plan_free',
    tier: 'free',
    name: 'Free Community',
    description: 'Foundational execution tools for solo founders and micro-teams.',
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
      maxUsers: 2,
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
      'Community Discord Support',
    ],
  },
  {
    id: 'plan_starter',
    tier: 'starter',
    name: 'Starter Team',
    description: 'For agile startups accelerating growth and early automation.',
    pricesMinorUnits: {
      UGX: 11000000, // 110,000 UGX
      KES: 390000,   // 3,900 KES
      TZS: 7500000,  // 75,000 TZS
      RWF: 3800000,  // 38,000 RWF
      NGN: 4500000,  // 45,000 NGN
      GHS: 42000,    // 420 GHS
      ZAR: 55000,    // 550 ZAR
      USD: 2900,     // $29.00 USD
      EUR: 2700,     // €27.00 EUR
      GBP: 2300,     // £23.00 GBP
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 5,
      maxAgents: 5,
      maxWorkflows: 10,
      aiComputeUnitsPerMonth: 250,
      storageGb: 10,
    },
    features: [
      'Up to 5 Team Members',
      '5 Active AI Agents (Level 0-2)',
      '10 Intelligent Workflows',
      'Digital Twin Personal Predictions',
      'Standard Organizational Memory',
      'Email & Slack Support',
    ],
  },
  {
    id: 'plan_professional',
    tier: 'professional',
    name: 'Professional Business',
    description: 'Comprehensive intelligent execution suite for high-velocity companies.',
    pricesMinorUnits: {
      UGX: 30000000, // 300,000 UGX
      KES: 1050000,  // 10,500 KES
      TZS: 20000000, // 200,000 TZS
      RWF: 10500000, // 105,000 RWF
      NGN: 12000000, // 120,000 NGN
      GHS: 110000,   // 1,100 GHS
      ZAR: 150000,   // 1,500 ZAR
      USD: 7900,     // $79.00 USD
      EUR: 7500,     // €75.00 EUR
      GBP: 6400,     // £64.00 GBP
    },
    billingPeriod: 'monthly',
    popular: true,
    limits: {
      maxUsers: 20,
      maxAgents: 15,
      maxWorkflows: 35,
      aiComputeUnitsPerMonth: 1000,
      storageGb: 50,
    },
    features: [
      'Up to 20 Team Members',
      '15 AI Agents with Autonomy Level 0-3',
      'Autonomous Orchestration Engine',
      'Human-in-the-Loop Approval Center',
      'Business Digital Twin & Scenario Simulator',
      'Executive Intelligence Briefings (Daily/Weekly)',
      'Pesapal Local & Global Gateway Integration',
      'Priority 4-hour Support SLA',
    ],
  },
  {
    id: 'plan_business',
    tier: 'business',
    name: 'Enterprise Scale',
    description: 'High-compute governance, advanced simulation, and multi-department controls.',
    pricesMinorUnits: {
      UGX: 75000000, // 750,000 UGX
      KES: 2600000,  // 26,000 KES
      TZS: 50000000, // 500,000 TZS
      RWF: 26000000, // 260,000 RWF
      NGN: 30000000, // 300,000 NGN
      GHS: 280000,   // 2,800 GHS
      ZAR: 380000,   // 3,800 ZAR
      USD: 19900,    // $199.00 USD
      EUR: 18500,    // €185.00 EUR
      GBP: 15900,    // £159.00 GBP
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 100,
      maxAgents: 50,
      maxWorkflows: 150,
      aiComputeUnitsPerMonth: 5000,
      storageGb: 250,
    },
    features: [
      'Up to 100 Users & Multiple Departments',
      '50 Multi-Agent Society Instances (Level 0-4)',
      'Controlled Autonomous Execution Guardrails',
      'Department-Level Knowledge Silos & Provenance',
      'Continuous Threat Modeling & Immutable Audit Ledger',
      'Dedicated Customer Success Architect',
      'Custom Developer API Gateway & Webhook Triggers',
    ],
  },
  {
    id: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Custom Sovereign',
    description: 'Bespoke deployments for governments, conglomerates, and financial institutions.',
    pricesMinorUnits: {
      UGX: 200000000, // 2,000,000 UGX custom base
      KES: 7000000,   // 70,000 KES
      TZS: 135000000, // 135,000 TZS
      RWF: 70000000,  // 700,000 RWF
      NGN: 80000000,  // 800,000 NGN
      GHS: 750000,    // 7,500 GHS
      ZAR: 1000000,   // 10,000 ZAR
      USD: 52000,     // $520.00 USD
      EUR: 48000,     // €480.00 EUR
      GBP: 41000,     // £410.00 GBP
    },
    billingPeriod: 'monthly',
    limits: {
      maxUsers: 10000,
      maxAgents: 500,
      maxWorkflows: 1000,
      aiComputeUnitsPerMonth: 50000,
      storageGb: 2000,
    },
    features: [
      'Unlimited Users, Organizations & Workspaces',
      'Full Autonomy Level 4 Custom Deployment',
      'Sovereign Dedicated Cloud Run / VPC Instance',
      'Custom Pesapal & Multi-Currency Merchant Accounts',
      '99.99% Uptime Guarantee & 24/7 Phone Support',
      'Full Compliance & Security Attestation Package',
    ],
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
      trial: ['active', 'expired', 'cancelled'],
      active: ['payment_pending', 'past_due', 'cancelled', 'expired'],
      payment_pending: ['active', 'past_due', 'failed' as any, 'cancelled'],
      past_due: ['active', 'grace_period', 'expired', 'cancelled'],
      grace_period: ['active', 'expired', 'cancelled'],
      expired: ['payment_pending', 'active', 'trial'],
      cancelled: ['payment_pending', 'active'],
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

  public static getSubscription(orgId: string): Subscription {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SUBSCRIPTION}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse subscription from storage:', e);
      }
    }

    // Default to free trial
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day trial
    const defaultSub: Subscription = {
      id: `sub_${orgId}_default`,
      organizationId: orgId,
      planId: 'plan_starter',
      tier: 'starter',
      status: 'trial',
      currency: 'USD',
      amountMinorUnits: 2900,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      paymentProvider: 'free',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.saveSubscription(defaultSub);
    return defaultSub;
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
