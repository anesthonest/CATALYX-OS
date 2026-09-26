/**
 * CATALYX Authoritative Payment Provider Policy
 *
 * MANDATED PLATFORM POLICY:
 * Active payment processing channels are STRICTLY RESTRICTED to:
 * 1. PESAPAL (Pesapal v3 API)
 * 2. BANK_TRANSFER (Direct Wire / SEPA / Bank ACH with dual-entry verification)
 *
 * ALL OTHER PROVIDERS ARE DISABLED AND FORBIDDEN:
 * Stripe, PayPal, Flutterwave, Crypto, and Mock gateways are permanently deactivated.
 * Any request attempting an unauthorized payment provider is rejected server-side.
 */

export const AUTHORIZED_PAYMENT_PROVIDERS = ['pesapal', 'bank_transfer'] as const;
export type AuthorizedPaymentProvider = (typeof AUTHORIZED_PAYMENT_PROVIDERS)[number];

export const FORBIDDEN_PAYMENT_PROVIDERS = [
  'stripe',
  'paypal',
  'flutterwave',
  'crypto',
  'mock',
  'test',
  'unknown'
] as const;

export class PaymentProviderPolicyViolationError extends Error {
  public readonly code = 'UNAUTHORIZED_PAYMENT_PROVIDER';
  public readonly attemptedProvider: string;
  public readonly allowedProviders = AUTHORIZED_PAYMENT_PROVIDERS;

  constructor(attemptedProvider: string) {
    super(
      `Payment provider "${attemptedProvider}" is strictly unauthorized and disabled in CATALYX. ` +
      `The only permitted active monetization channels are PESAPAL and BANK_TRANSFER.`
    );
    this.name = 'PaymentProviderPolicyViolationError';
    this.attemptedProvider = attemptedProvider;
  }
}

/**
 * Validates whether a payment provider identifier is an authorized active provider.
 */
export function isAuthorizedPaymentProvider(provider: string | undefined | null): provider is AuthorizedPaymentProvider {
  if (!provider) return false;
  const normalized = provider.toLowerCase().trim();
  return (AUTHORIZED_PAYMENT_PROVIDERS as readonly string[]).includes(normalized);
}

/**
 * Server-authoritative assertion that rejects any unauthorized payment provider.
 * Throws PaymentProviderPolicyViolationError on violation.
 */
export function assertAuthorizedPaymentProvider(provider: string | undefined | null): asserts provider is AuthorizedPaymentProvider {
  if (!isAuthorizedPaymentProvider(provider)) {
    throw new PaymentProviderPolicyViolationError(provider || 'undefined');
  }
}
