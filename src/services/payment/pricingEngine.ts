/**
 * CATALYX Universal Pricing Engine (V29)
 * Centralized pricing engine with versioning, integer minor unit arithmetic,
 * snapshot generation, multi-currency support, and platform commission calculations.
 */

import {
  PriceConfiguration,
  PriceSnapshot,
  PricingModel,
  StandardCurrency
} from './paymentProvider.types';

export interface CalculateTotalsRequest {
  items: {
    productId: string;
    quantity: number;
    customPriceMinorUnits?: number; // only if custom quote or authorized creator override
  }[];
  currency: StandardCurrency;
  taxRatePercent?: number;
  discountCode?: string;
}

export interface CalculatedTotalsResult {
  items: {
    productId: string;
    productTitle: string;
    sku: string;
    quantity: number;
    unitPriceMinorUnits: number;
    totalPriceMinorUnits: number;
    priceSnapshot: PriceSnapshot;
  }[];
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  feeMinorUnits: number;
  totalMinorUnits: number;
  currency: StandardCurrency;
  platformCommissionMinorUnits: number;
  creatorEarningsMinorUnits: number;
}

export class UniversalPricingEngine {
  private prices: Map<string, PriceConfiguration[]> = new Map(); // productId -> array of versions
  private currentPrices: Map<string, PriceConfiguration> = new Map(); // priceId -> config

  constructor() {
    this.seedCanonicalPrices();
  }

  /**
   * Seed canonical platform prices with exact integer minor units
   */
  private seedCanonicalPrices(): void {
    const now = '2026-01-01T00:00:00.000Z';

    const canonical: PriceConfiguration[] = [
      // 1. Subscriptions
      {
        priceId: 'pr_sub_starter_usd',
        productId: 'plan_starter',
        productTitle: 'CATALYX Starter Operating System',
        pricingModel: 'SUBSCRIPTION',
        amountMinorUnits: 2900, // $29.00
        currency: 'USD',
        billingInterval: 'monthly',
        trialPeriodDays: 14,
        taxRatePercent: 0,
        discountPercent: 0,
        commissionPercent: 100, // 100% platform revenue
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX Governance',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_sub_pro_usd',
        productId: 'plan_professional',
        productTitle: 'CATALYX Professional Multi-Agent Suite',
        pricingModel: 'SUBSCRIPTION',
        amountMinorUnits: 7900, // $79.00
        currency: 'USD',
        billingInterval: 'monthly',
        trialPeriodDays: 14,
        taxRatePercent: 0,
        discountPercent: 0,
        commissionPercent: 100,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX Governance',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_sub_enterprise_usd',
        productId: 'plan_enterprise',
        productTitle: 'CATALYX Enterprise Intelligence Operating System',
        pricingModel: 'SUBSCRIPTION',
        amountMinorUnits: 29900, // $299.00
        currency: 'USD',
        billingInterval: 'monthly',
        trialPeriodDays: 30,
        taxRatePercent: 0,
        discountPercent: 0,
        commissionPercent: 100,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX Governance',
        createdAt: now,
        updatedAt: now
      },
      // KES Subscriptions
      {
        priceId: 'pr_sub_pro_kes',
        productId: 'plan_professional',
        productTitle: 'CATALYX Professional Multi-Agent Suite (KES)',
        pricingModel: 'SUBSCRIPTION',
        amountMinorUnits: 1050000, // KES 10,500.00
        currency: 'KES',
        billingInterval: 'monthly',
        trialPeriodDays: 14,
        taxRatePercent: 16, // 16% VAT
        discountPercent: 0,
        commissionPercent: 100,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX Governance',
        createdAt: now,
        updatedAt: now
      },
      // 2. AI Compute & Token Packs
      {
        priceId: 'pr_ai_token_pack_100k',
        productId: 'prod_ai_tokens_100k',
        productTitle: '100,000 Autonomous Token Execution Credits',
        pricingModel: 'USAGE_BASED',
        amountMinorUnits: 1500, // $15.00
        currency: 'USD',
        usageRules: {
          metric: 'tokens',
          unitPriceMinorUnits: 15,
          includedUnitsPerPeriod: 100000
        },
        commissionPercent: 100,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX AI Operations',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_ai_workflow_pack_1k',
        productId: 'prod_ai_workflows_1k',
        productTitle: '1,000 Autonomous Agent Workflow Runs',
        pricingModel: 'USAGE_BASED',
        amountMinorUnits: 4500, // $45.00
        currency: 'USD',
        commissionPercent: 100,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'CATALYX AI Operations',
        createdAt: now,
        updatedAt: now
      },
      // 3. Digital Marketplace Products
      {
        priceId: 'pr_mkt_knowledge_graph',
        productId: 'prod_mkt_knowledge_graph_01',
        productTitle: 'Enterprise Knowledge Graph Template & Neural Ontologies',
        pricingModel: 'ONE_TIME',
        amountMinorUnits: 14900, // $149.00
        currency: 'USD',
        commissionPercent: 15, // 15% platform commission, 85% creator
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'creator@intelligence.org',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_mkt_compliance_matrix',
        productId: 'prod_mkt_compliance_matrix_02',
        productTitle: 'Autonomous Risk & ISO/SOC2 Compliance Engine Matrix',
        pricingModel: 'ONE_TIME',
        amountMinorUnits: 8900, // $89.00
        currency: 'USD',
        commissionPercent: 15,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'compliance@sentinel.io',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_mkt_video_masterclass',
        productId: 'prod_mkt_masterclass_03',
        productTitle: 'Executive Strategy & Autonomous Enterprise Video Masterclass',
        pricingModel: 'ONE_TIME',
        amountMinorUnits: 4900, // $49.00
        currency: 'USD',
        commissionPercent: 15,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'director@academy.org',
        createdAt: now,
        updatedAt: now
      },
      // 4. Services & Commercial Licensing
      {
        priceId: 'pr_srv_arch_review',
        productId: 'prod_srv_architecture_review',
        productTitle: 'Senior Autonomous Enterprise Architecture Review (3 Sessions)',
        pricingModel: 'SERVICE',
        amountMinorUnits: 35000, // $350.00
        currency: 'USD',
        commissionPercent: 20, // 20% platform commission
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'consulting@catalyx.io',
        createdAt: now,
        updatedAt: now
      },
      {
        priceId: 'pr_lic_commercial_deploy',
        productId: 'prod_lic_commercial_deployment',
        productTitle: 'Perpetual Commercial Distribution License',
        pricingModel: 'LICENSE',
        amountMinorUnits: 49900, // $499.00
        currency: 'USD',
        commissionPercent: 15,
        effectiveFrom: now,
        status: 'ACTIVE',
        version: 1,
        createdBy: 'licensing@catalyx.io',
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const p of canonical) {
      this.registerPrice(p);
    }
  }

  private registerPrice(price: PriceConfiguration): void {
    const list = this.prices.get(price.productId) || [];
    list.push(price);
    this.prices.set(price.productId, list);
    this.currentPrices.set(price.priceId, price);
  }

  /**
   * Get active price configuration for a product and currency
   */
  public getActivePrice(productId: string, currency: StandardCurrency = 'USD'): PriceConfiguration | undefined {
    const list = this.prices.get(productId);
    if (!list) return undefined;

    // Filter active versions matching currency
    const activeCurrency = list.filter(p => p.status === 'ACTIVE' && p.currency === currency);
    if (activeCurrency.length > 0) {
      // Return highest version
      return activeCurrency.sort((a, b) => b.version - a.version)[0];
    }

    // Fallback to active USD price
    const activeUsd = list.filter(p => p.status === 'ACTIVE' && p.currency === 'USD');
    if (activeUsd.length > 0) {
      return activeUsd.sort((a, b) => b.version - a.version)[0];
    }

    return list[0];
  }

  public getPriceById(priceId: string): PriceConfiguration | undefined {
    return this.currentPrices.get(priceId);
  }

  public getAllActivePrices(): PriceConfiguration[] {
    const result: PriceConfiguration[] = [];
    for (const [_, list] of this.prices.entries()) {
      const active = list.filter(p => p.status === 'ACTIVE');
      if (active.length > 0) {
        result.push(active.sort((a, b) => b.version - a.version)[0]);
      }
    }
    return result;
  }

  /**
   * Admin or Creator adds a new price configuration or upgrades an existing version
   * Historical transactions NEVER mutate because old price versions remain archived/immutable.
   */
  public createOrUpdatePrice(params: {
    productId: string;
    productTitle: string;
    pricingModel: PricingModel;
    amountMinorUnits: number;
    currency: StandardCurrency;
    billingInterval?: 'monthly' | 'annual' | 'quarterly' | 'usage';
    trialPeriodDays?: number;
    commissionPercent?: number;
    taxRatePercent?: number;
    discountPercent?: number;
    createdBy: string;
  }): PriceConfiguration {
    if (params.amountMinorUnits < 0 || !Number.isInteger(params.amountMinorUnits)) {
      throw new Error('Price amount must be a positive integer minor units value.');
    }

    const existingList = this.prices.get(params.productId) || [];
    const currentActive = existingList.find(p => p.status === 'ACTIVE' && p.currency === params.currency);
    const newVersion = currentActive ? currentActive.version + 1 : 1;

    // If active exists, archive old version
    if (currentActive) {
      currentActive.status = 'ARCHIVED';
      currentActive.effectiveUntil = new Date().toISOString();
      currentActive.updatedAt = new Date().toISOString();
    }

    const now = new Date().toISOString();
    const priceId = `pr_${params.productId}_v${newVersion}_${Date.now().toString(36)}`;

    const newConfig: PriceConfiguration = {
      priceId,
      productId: params.productId,
      productTitle: params.productTitle,
      pricingModel: params.pricingModel,
      amountMinorUnits: params.amountMinorUnits,
      currency: params.currency,
      billingInterval: params.billingInterval,
      trialPeriodDays: params.trialPeriodDays || 0,
      taxRatePercent: params.taxRatePercent || 0,
      discountPercent: params.discountPercent || 0,
      commissionPercent: params.commissionPercent !== undefined ? params.commissionPercent : 15,
      effectiveFrom: now,
      status: 'ACTIVE',
      version: newVersion,
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now
    };

    this.registerPrice(newConfig);
    return newConfig;
  }

  /**
   * Creates an immutable PriceSnapshot for embedding into Orders and Invoices.
   */
  public createPriceSnapshot(price: PriceConfiguration): PriceSnapshot {
    return {
      priceId: price.priceId,
      version: price.version,
      pricingModel: price.pricingModel,
      unitPriceMinorUnits: price.amountMinorUnits,
      currency: price.currency,
      commissionPercent: price.commissionPercent,
      taxRatePercent: price.taxRatePercent || 0,
      discountPercent: price.discountPercent || 0,
      snapshotTimestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate exact order line items, discounts, taxes, fees, and totals in integer minor units.
   */
  public calculateOrderTotals(request: CalculateTotalsRequest): CalculatedTotalsResult {
    let subtotalMinor = 0;
    let totalTaxMinor = 0;
    let totalDiscountMinor = 0;
    let totalPlatformCommissionMinor = 0;

    const calculatedItems = request.items.map(item => {
      let price = this.getActivePrice(item.productId, request.currency);
      let unitPrice = price?.amountMinorUnits || 0;

      if (item.customPriceMinorUnits !== undefined && item.customPriceMinorUnits > 0) {
        unitPrice = item.customPriceMinorUnits;
      }

      const itemTotal = Math.round(unitPrice * Math.max(1, item.quantity));
      subtotalMinor += itemTotal;

      const taxRate = (price?.taxRatePercent || request.taxRatePercent || 0);
      const itemTax = Math.round((itemTotal * taxRate) / 100);
      totalTaxMinor += itemTax;

      const commRate = price ? price.commissionPercent : 15;
      const itemComm = Math.round((itemTotal * commRate) / 100);
      totalPlatformCommissionMinor += itemComm;

      const snapshot = price ? this.createPriceSnapshot(price) : {
        priceId: `custom_${item.productId}`,
        version: 1,
        pricingModel: 'ONE_TIME' as PricingModel,
        unitPriceMinorUnits: unitPrice,
        currency: request.currency,
        commissionPercent: commRate,
        taxRatePercent: taxRate,
        discountPercent: 0,
        snapshotTimestamp: new Date().toISOString()
      };

      return {
        productId: item.productId,
        productTitle: price?.productTitle || item.productId,
        sku: `SKU-${item.productId.toUpperCase().substring(0, 10)}`,
        quantity: Math.max(1, item.quantity),
        unitPriceMinorUnits: unitPrice,
        totalPriceMinorUnits: itemTotal,
        priceSnapshot: snapshot
      };
    });

    // Discount handling
    if (request.discountCode) {
      if (request.discountCode.toUpperCase() === 'LAUNCH20') {
        totalDiscountMinor = Math.round(subtotalMinor * 0.20);
      } else if (request.discountCode.toUpperCase() === 'PARTNER10') {
        totalDiscountMinor = Math.round(subtotalMinor * 0.10);
      }
    }

    const feeMinor = 0;
    const finalTotalMinor = Math.max(0, subtotalMinor - totalDiscountMinor + totalTaxMinor + feeMinor);
    const creatorEarningsMinor = Math.max(0, subtotalMinor - totalPlatformCommissionMinor);

    return {
      items: calculatedItems,
      subtotalMinorUnits: subtotalMinor,
      discountMinorUnits: totalDiscountMinor,
      taxMinorUnits: totalTaxMinor,
      feeMinorUnits: feeMinor,
      totalMinorUnits: finalTotalMinor,
      currency: request.currency,
      platformCommissionMinorUnits: totalPlatformCommissionMinor,
      creatorEarningsMinorUnits: creatorEarningsMinor
    };
  }

  /**
   * Preview creator economics before publishing
   */
  public previewCreatorEarnings(params: {
    amountMinorUnits: number;
    currency: StandardCurrency;
    commissionPercent?: number;
  }): {
    grossSaleMinorUnits: number;
    platformCommissionMinorUnits: number;
    netCreatorEarningsMinorUnits: number;
    currency: StandardCurrency;
  } {
    const commRate = params.commissionPercent !== undefined ? params.commissionPercent : 15;
    const commMinor = Math.round((params.amountMinorUnits * commRate) / 100);
    const netMinor = Math.max(0, params.amountMinorUnits - commMinor);

    return {
      grossSaleMinorUnits: params.amountMinorUnits,
      platformCommissionMinorUnits: commMinor,
      netCreatorEarningsMinorUnits: netMinor,
      currency: params.currency
    };
  }
}

export const universalPricingEngine = new UniversalPricingEngine();
export const pricingEngine = universalPricingEngine;
