/**
 * CATALYX Universal Revenue Policy Engine
 * Authoritative Server-Side Platform Fee & Revenue Sharing State Machine.
 *
 * MANDATED FEE STRUCTURE:
 * - Individual Creator Rate: 0.25% platform fee, 99.75% creator gross platform earnings.
 * - Group / Team Rate: 0.27% platform fee, 99.73% group gross platform earnings.
 * - Organization / Enterprise Rate: 0.50% platform fee, 99.50% organization gross platform earnings.
 *
 * ZERO FLOATING-POINT ARITHMETIC:
 * - All calculations occur in integer minor units using basis points (1% = 100 bps).
 * - Individual: 25 bps (0.25%)
 * - Group: 27 bps (0.27%)
 * - Organization: 50 bps (0.50%)
 *
 * LEGAL & REGULATORY COMPLIANCE:
 * - All financial calculations happen server-side. Never trust client fee inputs.
 * - Platform never silently subtracts fees; every deduction is itemized.
 * - Stated breakdowns are pre-payout calculations before gateway fees, currency conversion,
 *   taxes, refunds, or chargebacks. Never presented as guaranteed final payout amounts.
 * - Historical transactions retain the exact rate that applied at transaction time.
 */

import { StandardCurrency } from './paymentProvider.types';

export type SellerAccountType = 'INDIVIDUAL' | 'GROUP' | 'ORGANIZATION';

export interface RevenuePolicyConfig {
  version: string;
  effectiveDate: string;
  individualFeePercent: number;     // 0.25 for 0.25% (25 basis points)
  groupFeePercent: number;          // 0.27 for 0.27% (27 basis points)
  organizationFeePercent: number;   // 0.50 for 0.50% (50 basis points)
  standardUserFeePercent: number;   // 0.25 (backward-compatible alias for individual)
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
  catalyxFeeBasisPoints: number;
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
    version: 'pol_v2026_universal_expansion_1',
    effectiveDate: '2026-03-24T00:00:00.000Z',
    individualFeePercent: 0.25,
    groupFeePercent: 0.27,
    organizationFeePercent: 0.50,
    standardUserFeePercent: 0.25,
    estimatedGatewayFeePercent: 3.0,
    estimatedGatewayFixedMinorUnits: 30, // $0.30 fixed
    description: 'CATALYX Universal Commercial Policy: 0.25% Individual creator fee, 0.27% Group rate, 0.50% Organizational rate.'
  };

  private static auditLogs: RevenuePolicyAuditRecord[] = [
    {
      id: 'audit_rev_expansion_genesis',
      timestamp: '2026-03-24T00:00:00.000Z',
      authorizedAdmin: 'CATALYX Global Marketplace Governance Board',
      previousConfig: {
        version: 'pol_v2026_3_1_legacy',
        effectiveDate: '2026-03-01T00:00:00.000Z',
        individualFeePercent: 10.0,
        groupFeePercent: 10.0,
        organizationFeePercent: 15.0,
        standardUserFeePercent: 10.0,
        estimatedGatewayFeePercent: 3.0,
        estimatedGatewayFixedMinorUnits: 30,
        description: 'Legacy Commercial Policy (superseded)'
      },
      newConfig: {
        version: 'pol_v2026_universal_expansion_1',
        effectiveDate: '2026-03-24T00:00:00.000Z',
        individualFeePercent: 0.25,
        groupFeePercent: 0.27,
        organizationFeePercent: 0.50,
        standardUserFeePercent: 0.25,
        estimatedGatewayFeePercent: 3.0,
        estimatedGatewayFixedMinorUnits: 30,
        description: 'CATALYX Universal Commercial Policy: 0.25% Individual creator fee, 0.27% Group rate, 0.50% Organizational rate.'
      },
      changeReason: 'Universal Digital Work Expansion: transition to high-volume hyper-efficient rates (0.25% Indiv / 0.27% Group / 0.50% Org).'
    }
  ];

  public static getActiveConfig(): RevenuePolicyConfig {
    return { ...this.activeConfig };
  }

  public static getAuditLogs(): RevenuePolicyAuditRecord[] {
    return [...this.auditLogs];
  }

  /**
   * Resolves fee percent for given seller account type.
   */
  public static getFeePercentForAccount(accountType: SellerAccountType): number {
    switch (accountType) {
      case 'ORGANIZATION':
        return this.activeConfig.organizationFeePercent;
      case 'GROUP':
        return this.activeConfig.groupFeePercent;
      case 'INDIVIDUAL':
      default:
        return this.activeConfig.individualFeePercent;
    }
  }

  /**
   * Authoritative calculation of seller revenue share and platform fees.
   * Employs integer minor-unit arithmetic with basis points. Never trusts client numbers.
   */
  public static calculateRevenueSplit(params: {
    grossAmountMinorUnits: number;
    currency: StandardCurrency;
    sellerAccountType: SellerAccountType;
    taxRatePercent?: number;
    adjustmentMinorUnits?: number;
    paymentChannel?: 'pesapal' | 'bank_transfer' | string;
    customPolicyVersion?: string; // For historical audit recalculation
  }): RevenueSplitBreakdown {
    const gross = Math.max(0, Math.round(params.grossAmountMinorUnits));
    const config = this.activeConfig;

    // 1. Determine platform fee based on account classification
    const feePercent = this.getFeePercentForAccount(params.sellerAccountType);
    
    // Basis points: 0.25% = 25 bps, 0.27% = 27 bps, 0.50% = 50 bps
    const basisPoints = Math.round(feePercent * 100);
    
    // Integer minor unit calculation: (gross * basisPoints) / 10000
    // Standard integer rounding
    const platformFeeMinorUnits = Math.round((gross * basisPoints) / 10000);

    // 2. Compute gross seller platform earnings (Gross - Platform Fee)
    const sellerGrossEarnings = Math.max(0, gross - platformFeeMinorUnits);

    // 3. Compute payment-processing fee estimate
    let estimatedGatewayMinor = 0;
    if (gross > 0) {
      if (params.paymentChannel === 'bank_transfer') {
        // Bank wire transfers typically have fixed or zero variable gateway fee
        estimatedGatewayMinor = 0;
      } else {
        const gatewayBps = Math.round(config.estimatedGatewayFeePercent * 100);
        estimatedGatewayMinor = Math.round((gross * gatewayBps) / 10000) + config.estimatedGatewayFixedMinorUnits;
      }
    }

    // 4. Compute taxes if applicable
    const taxPercent = params.taxRatePercent || 0;
    const taxBps = Math.round(taxPercent * 100);
    const taxMinorUnits = Math.round((gross * taxBps) / 10000);

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
      catalyxFeeBasisPoints: basisPoints,
      catalyxFeeMinorUnits: platformFeeMinorUnits,
      estimatedGatewayFeeMinorUnits: estimatedGatewayMinor,
      taxMinorUnits,
      refundAdjustmentMinorUnits: adjustments,
      sellerGrossPlatformEarningsMinorUnits: sellerGrossEarnings,
      sellerEstimatedNetEarningsMinorUnits: netEstimated,
      isPrePayoutEstimate: true,
      legalDisclaimer: 
        'This calculation is an itemized pre-payout estimate based on the authoritative CATALYX fee schedule ' +
        `(${config.individualFeePercent}% Individual / ${config.groupFeePercent}% Group / ${config.organizationFeePercent}% Organization). ` +
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
      throw new Error('A detailed audit justification reason (at least 10 characters) is required to alter platform revenue policy.');
    }

    const prev = { ...this.activeConfig };
    const newVersion = `pol_v${Date.now().toString(36)}`;

    // Sync legacy standardUserFeePercent if individualFeePercent is updated
    const finalUpdates: any = { ...updates };
    if (finalUpdates.individualFeePercent !== undefined) {
      finalUpdates.standardUserFeePercent = finalUpdates.individualFeePercent;
    } else if (finalUpdates.standardUserFeePercent !== undefined) {
      finalUpdates.individualFeePercent = finalUpdates.standardUserFeePercent;
    }

    this.activeConfig = {
      ...this.activeConfig,
      ...finalUpdates,
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
