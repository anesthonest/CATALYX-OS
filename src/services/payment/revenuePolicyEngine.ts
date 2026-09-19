/**
 * CATALYX Universal Revenue Policy Engine
 * Authoritative Server-Side Platform Fee & Revenue Sharing State Machine.
 *
 * MANDATED FEE STRUCTURE:
 * - Standard Individual User Rate: 10% platform fee, 90% creator gross platform earnings.
 * - Organization / Institution Rate: 15% platform fee, 85% organization gross platform earnings.
 *
 * LEGAL & REGULATORY COMPLIANCE:
 * - All financial calculations happen server-side.
 * - Platform never silently subtracts fees; every deduction is itemized.
 * - Stated breakdowns are pre-payout calculations before gateway fees, currency conversion,
 *   taxes, refunds, or chargebacks. Never presented as guaranteed final payout amounts.
 */

import { StandardCurrency } from './paymentProvider.types';

export type SellerAccountType = 'INDIVIDUAL' | 'ORGANIZATION';

export interface RevenuePolicyConfig {
  version: string;
  effectiveDate: string;
  standardUserFeePercent: number; // e.g. 10 for 10%
  organizationFeePercent: number; // e.g. 15 for 15%
  estimatedGatewayFeePercent: number; // e.g. 3.0% for card/mobile money
  estimatedGatewayFixedMinorUnits: number; // e.g. 30 cents = 30 minor units
  description: string;
}

export interface RevenueSplitBreakdown {
  grossSaleAmountMinorUnits: number;
  currency: StandardCurrency;
  sellerAccountType: SellerAccountType;
  platformPolicyVersion: string;
  
  // Platform fee
  catalyxFeePercent: number;
  catalyxFeeMinorUnits: number;
  
  // Estimated deductions
  estimatedGatewayFeeMinorUnits: number;
  taxMinorUnits: number;
  refundAdjustmentMinorUnits: number;

  // Seller earnings
  sellerGrossPlatformEarningsMinorUnits: number; // Gross - Platform Fee
  sellerEstimatedNetEarningsMinorUnits: number;   // Gross - (Platform Fee + Gateway + Tax + Adjustments)

  // Legal & Financial Notices
  isPrePayoutEstimate: boolean;
  legalDisclaimer: string;
  calculatedAt: string;
}

export interface RevenuePolicyAuditRecord {
  id: string;
  timestamp: string;
  authorizedAdmin: string;
  previousConfig: RevenuePolicyConfig;
  newConfig: RevenuePolicyConfig;
  changeReason: string;
}

export class RevenuePolicyEngine {
  private static activeConfig: RevenuePolicyConfig = {
    version: 'pol_v2026_3_1',
    effectiveDate: '2026-03-01T00:00:00.000Z',
    standardUserFeePercent: 10,
    organizationFeePercent: 15,
    estimatedGatewayFeePercent: 3.0,
    estimatedGatewayFixedMinorUnits: 30, // $0.30 fixed
    description: 'CATALYX Standard Commercial Policy: 10% individual creator fee, 15% organizational rate.'
  };

  private static auditLogs: RevenuePolicyAuditRecord[] = [];

  static {
    // Initial genesis configuration audit
    this.auditLogs.push({
      id: 'audit_rev_genesis',
      timestamp: '2026-03-01T00:00:00.000Z',
      authorizedAdmin: 'System Genesis (CATALYX Economic Engine)',
      previousConfig: { ...this.activeConfig },
      newConfig: { ...this.activeConfig },
      changeReason: 'Codification of standard 10% user and 15% organizational platform fee rates.'
    });
  }

  public static getActiveConfig(): RevenuePolicyConfig {
    return { ...this.activeConfig };
  }

  public static getAuditLogs(): RevenuePolicyAuditRecord[] {
    return [...this.auditLogs];
  }

  /**
   * Authoritative calculation of seller revenue share and platform fees.
   * Never trusts client numbers.
   */
  public static calculateRevenueSplit(params: {
    grossAmountMinorUnits: number;
    currency: StandardCurrency;
    sellerAccountType: SellerAccountType;
    taxRatePercent?: number;
    adjustmentMinorUnits?: number;
    paymentChannel?: 'pesapal' | 'bank_transfer' | string;
  }): RevenueSplitBreakdown {
    const gross = Math.max(0, Math.round(params.grossAmountMinorUnits));
    const config = this.activeConfig;

    // 1. Determine platform fee based on account classification
    const feePercent = params.sellerAccountType === 'ORGANIZATION'
      ? config.organizationFeePercent
      : config.standardUserFeePercent;

    const platformFeeMinorUnits = Math.round((gross * feePercent) / 100);

    // 2. Compute gross seller platform earnings (Gross - Platform Fee)
    const sellerGrossEarnings = Math.max(0, gross - platformFeeMinorUnits);

    // 3. Compute payment-processing fee estimate (e.g. Pesapal ~3% + 30c, bank transfer minimal)
    let estimatedGatewayMinor = 0;
    if (params.paymentChannel === 'bank_transfer') {
      // Bank wire transfers typically have fixed or no variable gateway fee
      estimatedGatewayMinor = 0;
    } else {
      estimatedGatewayMinor = Math.round((gross * config.estimatedGatewayFeePercent) / 100) + config.estimatedGatewayFixedMinorUnits;
    }

    // 4. Compute taxes if applicable
    const taxPercent = params.taxRatePercent || 0;
    const taxMinorUnits = Math.round((gross * taxPercent) / 100);

    // 5. Adjustments (refunds, chargeback reserves, dispute holds)
    const adjustments = params.adjustmentMinorUnits || 0;

    // 6. Estimated Net (before final clearing)
    const netEstimated = Math.max(0, gross - platformFeeMinorUnits - estimatedGatewayMinor - taxMinorUnits - adjustments);

    return {
      grossSaleAmountMinorUnits: gross,
      currency: params.currency,
      sellerAccountType: params.sellerAccountType,
      platformPolicyVersion: config.version,
      catalyxFeePercent: feePercent,
      catalyxFeeMinorUnits: platformFeeMinorUnits,
      estimatedGatewayFeeMinorUnits: estimatedGatewayMinor,
      taxMinorUnits,
      refundAdjustmentMinorUnits: adjustments,
      sellerGrossPlatformEarningsMinorUnits: sellerGrossEarnings,
      sellerEstimatedNetEarningsMinorUnits: netEstimated,
      isPrePayoutEstimate: true,
      legalDisclaimer: 
        'This calculation is an itemized pre-payout estimate. CATALYX platform fees are computed authoritatively. ' +
        'Final net disbursements may vary based on gateway deductions, currency exchange conversion rates, ' +
        'applicable withholding taxes, chargeback reserves, and cooling-off clearance. This does not constitute a guaranteed final payout amount.',
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Administrator-only configuration update with mandatory audit trail.
   */
  public static updateConfig(
    updates: Partial<Omit<RevenuePolicyConfig, 'version' | 'effectiveDate'>>,
    adminActor: string,
    reason: string
  ): RevenuePolicyConfig {
    if (!adminActor) {
      throw new Error('Authorized administrator identity is required to alter platform revenue policy.');
    }
    if (!reason || reason.trim().length < 10) {
      throw new Error('A detailed audit justification reason is required to alter platform revenue policy.');
    }

    const prev = { ...this.activeConfig };
    const newVersion = `pol_v${Date.now().toString(36)}`;

    this.activeConfig = {
      ...this.activeConfig,
      ...updates,
      version: newVersion,
      effectiveDate: new Date().toISOString()
    };

    this.auditLogs.unshift({
      id: `audit_rev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorizedAdmin: adminActor,
      previousConfig: prev,
      newConfig: { ...this.activeConfig },
      changeReason: reason
    });

    return { ...this.activeConfig };
  }
}

export const revenuePolicyEngine = RevenuePolicyEngine;
