import { 
  EntitlementKey, EntitlementEvaluation, BillingTier, Subscription 
} from '../types';
import { BillingService } from './billingService';

// Default Entitlements Matrix by Commercial Tier
const TIER_ENTITLEMENTS: Record<BillingTier, Record<EntitlementKey, { granted: boolean; limit?: number }>> = {
  free: {
    AI_AGENTS: { granted: true, limit: 2 },
    AUTONOMOUS_EXECUTION: { granted: false }, // Only L0/L1
    WORKFLOWS: { granted: true, limit: 3 },
    ADVANCED_SIMULATION: { granted: false },
    DIGITAL_TWIN: { granted: true, limit: 1 },
    API_ACCESS: { granted: false },
    CONNECTORS: { granted: false },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 10 },
    EXECUTIVE_INTELLIGENCE: { granted: false },
    ADVANCED_ANALYTICS: { granted: false },
    MARKETPLACE: { granted: true, limit: 2 },
    ENTERPRISE_GOVERNANCE: { granted: false },
    CUSTOM_ROLES: { granted: false },
    SSO: { granted: false },
    AUDIT_EXPORT: { granted: false },
    PRIORITY_SUPPORT: { granted: false },
  },
  starter: {
    AI_AGENTS: { granted: true, limit: 5 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 10 }, // L0-L2
    WORKFLOWS: { granted: true, limit: 10 },
    ADVANCED_SIMULATION: { granted: false },
    DIGITAL_TWIN: { granted: true, limit: 3 },
    API_ACCESS: { granted: false },
    CONNECTORS: { granted: true, limit: 2 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 50 },
    EXECUTIVE_INTELLIGENCE: { granted: false },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 5 },
    ENTERPRISE_GOVERNANCE: { granted: false },
    CUSTOM_ROLES: { granted: false },
    SSO: { granted: false },
    AUDIT_EXPORT: { granted: false },
    PRIORITY_SUPPORT: { granted: false },
  },
  professional: {
    AI_AGENTS: { granted: true, limit: 15 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 50 }, // L0-L3
    WORKFLOWS: { granted: true, limit: 35 },
    ADVANCED_SIMULATION: { granted: true, limit: 10 },
    DIGITAL_TWIN: { granted: true, limit: 10 },
    API_ACCESS: { granted: true, limit: 5000 },
    CONNECTORS: { granted: true, limit: 8 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 250 },
    EXECUTIVE_INTELLIGENCE: { granted: true },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 25 },
    ENTERPRISE_GOVERNANCE: { granted: true },
    CUSTOM_ROLES: { granted: false },
    SSO: { granted: false },
    AUDIT_EXPORT: { granted: true },
    PRIORITY_SUPPORT: { granted: true },
  },
  business: {
    AI_AGENTS: { granted: true, limit: 50 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 250 }, // L0-L4
    WORKFLOWS: { granted: true, limit: 150 },
    ADVANCED_SIMULATION: { granted: true, limit: 50 },
    DIGITAL_TWIN: { granted: true, limit: 25 },
    API_ACCESS: { granted: true, limit: 50000 },
    CONNECTORS: { granted: true, limit: 25 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 1000 },
    EXECUTIVE_INTELLIGENCE: { granted: true },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 100 },
    ENTERPRISE_GOVERNANCE: { granted: true },
    CUSTOM_ROLES: { granted: true },
    SSO: { granted: false }, // Dedicated SAML is enterprise sovereign
    AUDIT_EXPORT: { granted: true },
    PRIORITY_SUPPORT: { granted: true },
  },
  enterprise: {
    AI_AGENTS: { granted: true, limit: 999 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 9999 }, // Full L4
    WORKFLOWS: { granted: true, limit: 999 },
    ADVANCED_SIMULATION: { granted: true, limit: 999 },
    DIGITAL_TWIN: { granted: true, limit: 999 },
    API_ACCESS: { granted: true, limit: 999999 },
    CONNECTORS: { granted: true, limit: 999 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 9999 },
    EXECUTIVE_INTELLIGENCE: { granted: true },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 999 },
    ENTERPRISE_GOVERNANCE: { granted: true },
    CUSTOM_ROLES: { granted: true },
    SSO: { granted: true },
    AUDIT_EXPORT: { granted: true },
    PRIORITY_SUPPORT: { granted: true },
  },
  individual: {
    AI_AGENTS: { granted: true, limit: 5 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 15 },
    WORKFLOWS: { granted: true, limit: 15 },
    ADVANCED_SIMULATION: { granted: false },
    DIGITAL_TWIN: { granted: true, limit: 3 },
    API_ACCESS: { granted: true, limit: 1000 },
    CONNECTORS: { granted: true, limit: 3 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 50 },
    EXECUTIVE_INTELLIGENCE: { granted: false },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 10 },
    ENTERPRISE_GOVERNANCE: { granted: false },
    CUSTOM_ROLES: { granted: false },
    SSO: { granted: false },
    AUDIT_EXPORT: { granted: false },
    PRIORITY_SUPPORT: { granted: false },
  },
  group: {
    AI_AGENTS: { granted: true, limit: 20 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 75 },
    WORKFLOWS: { granted: true, limit: 50 },
    ADVANCED_SIMULATION: { granted: true, limit: 15 },
    DIGITAL_TWIN: { granted: true, limit: 15 },
    API_ACCESS: { granted: true, limit: 15000 },
    CONNECTORS: { granted: true, limit: 12 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 500 },
    EXECUTIVE_INTELLIGENCE: { granted: true },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 50 },
    ENTERPRISE_GOVERNANCE: { granted: true },
    CUSTOM_ROLES: { granted: false },
    SSO: { granted: false },
    AUDIT_EXPORT: { granted: true },
    PRIORITY_SUPPORT: { granted: true },
  },
  organization: {
    AI_AGENTS: { granted: true, limit: 100 },
    AUTONOMOUS_EXECUTION: { granted: true, limit: 500 },
    WORKFLOWS: { granted: true, limit: 250 },
    ADVANCED_SIMULATION: { granted: true, limit: 100 },
    DIGITAL_TWIN: { granted: true, limit: 100 },
    API_ACCESS: { granted: true, limit: 100000 },
    CONNECTORS: { granted: true, limit: 50 },
    KNOWLEDGE_UNIVERSE: { granted: true, limit: 5000 },
    EXECUTIVE_INTELLIGENCE: { granted: true },
    ADVANCED_ANALYTICS: { granted: true },
    MARKETPLACE: { granted: true, limit: 500 },
    ENTERPRISE_GOVERNANCE: { granted: true },
    CUSTOM_ROLES: { granted: true },
    SSO: { granted: true },
    AUDIT_EXPORT: { granted: true },
    PRIORITY_SUPPORT: { granted: true },
  },
};

const STORAGE_KEYS = {
  OVERRIDES: 'catalyx_v8_entitlement_overrides',
};

export class EntitlementService {
  /**
   * Evaluate whether an organization is entitled to a specific capability
   */
  public static evaluate(orgId: string, entitlement: EntitlementKey): EntitlementEvaluation {
    // 1. Check administrative overrides first
    const overrides = this.getOverrides(orgId);
    if (overrides[entitlement] !== undefined) {
      const ov = overrides[entitlement];
      return {
        entitlement,
        granted: ov.granted,
        source: 'override',
        reason: ov.reason || 'Administrative override applied by Organization Owner.',
        limit: ov.limit,
      };
    }

    // 2. Fetch active verified subscription
    const subscription: Subscription = BillingService.getSubscription(orgId);

    // 3. Verify subscription payment status and trial validity
    const now = Date.now();
    const isTrialExpired = subscription.status === 'trial' && new Date(subscription.currentPeriodEnd).getTime() <= now;

    if (subscription.status === 'expired' || subscription.status === 'cancelled' || isTrialExpired) {
      return {
        entitlement,
        granted: false,
        source: 'plan',
        reason: isTrialExpired
          ? `One-month free trial has expired. Please activate subscription via Pesapal to restore access.`
          : `Subscription is in ${subscription.status.toUpperCase()} state. Please renew via Pesapal to activate.`,
      };
    }

    if (subscription.status === 'payment_pending' || subscription.status === 'past_due') {
      // In past_due / payment_pending, restrict high-cost autonomous capabilities
      if (['AUTONOMOUS_EXECUTION', 'ADVANCED_SIMULATION', 'API_ACCESS'].includes(entitlement)) {
        return {
          entitlement,
          granted: false,
          source: 'plan',
          reason: `Action blocked: Subscription payment is pending/past due. Server-side payment verification required.`,
        };
      }
    }

    const tier: BillingTier = subscription.tier || 'free';
    const tierRule = TIER_ENTITLEMENTS[tier]?.[entitlement];

    if (!tierRule || !tierRule.granted) {
      return {
        entitlement,
        granted: false,
        source: 'plan',
        reason: `Feature requires upgrade from ${tier.toUpperCase()} tier.`,
        limit: tierRule?.limit || 0,
      };
    }

    return {
      entitlement,
      granted: true,
      source: subscription.status === 'trial' ? 'trial' : 'plan',
      reason: `Granted under active ${tier.toUpperCase()} subscription tier.`,
      limit: tierRule.limit,
    };
  }

  /**
   * Evaluate all entitlements for an organization
   */
  public static getAllEntitlements(orgId: string): Record<EntitlementKey, EntitlementEvaluation> {
    const keys: EntitlementKey[] = [
      'AI_AGENTS',
      'AUTONOMOUS_EXECUTION',
      'WORKFLOWS',
      'ADVANCED_SIMULATION',
      'DIGITAL_TWIN',
      'API_ACCESS',
      'CONNECTORS',
      'KNOWLEDGE_UNIVERSE',
      'EXECUTIVE_INTELLIGENCE',
      'ADVANCED_ANALYTICS',
      'MARKETPLACE',
      'ENTERPRISE_GOVERNANCE',
      'CUSTOM_ROLES',
      'SSO',
      'AUDIT_EXPORT',
      'PRIORITY_SUPPORT',
    ];

    const result = {} as Record<EntitlementKey, EntitlementEvaluation>;
    for (const key of keys) {
      result[key] = this.evaluate(orgId, key);
    }
    return result;
  }

  /**
   * Set administrative override (for support, enterprise contracts, or trials)
   */
  public static setOverride(
    orgId: string, 
    entitlement: EntitlementKey, 
    granted: boolean, 
    reason: string, 
    limit?: number
  ): void {
    const overrides = this.getOverrides(orgId);
    overrides[entitlement] = { granted, reason, limit };
    localStorage.setItem(`${STORAGE_KEYS.OVERRIDES}_${orgId}`, JSON.stringify(overrides));
  }

  /**
   * Remove administrative override
   */
  public static clearOverride(orgId: string, entitlement: EntitlementKey): void {
    const overrides = this.getOverrides(orgId);
    delete overrides[entitlement];
    localStorage.setItem(`${STORAGE_KEYS.OVERRIDES}_${orgId}`, JSON.stringify(overrides));
  }

  private static getOverrides(orgId: string): Record<string, { granted: boolean; reason: string; limit?: number }> {
    const raw = localStorage.getItem(`${STORAGE_KEYS.OVERRIDES}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse entitlement overrides:', e);
      }
    }
    return {};
  }
}
