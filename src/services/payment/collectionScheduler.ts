/**
 * CATALYX Automated Invoicing & Revenue Collection Scheduler (V29)
 * Handles subscription renewals, itemized invoice creation, payment status tracking,
 * immutable receipts generation, and entitlement renewals with grace periods.
 */

import {
  ItemizedInvoice,
  PaymentReceipt,
  PaymentChannelId,
  StandardCurrency,
  PriceSnapshot
} from './paymentProvider.types';
import { universalPricingEngine } from './pricingEngine';

export interface SubscriptionRecord {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planTitle: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  billingInterval: 'monthly' | 'annual';
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  gracePeriodEndsAt?: string;
  preferredPaymentChannel: PaymentChannelId;
  autoRenew: boolean;
}

export interface CollectionCycleResult {
  cycleTimestamp: string;
  subscriptionsProcessed: number;
  invoicesGenerated: number;
  invoicesPaid: number;
  gracePeriodEntered: number;
  entitlementsRenewed: number;
  totalCollectedMinorUnits: number;
  currency: StandardCurrency;
  logs: string[];
}

export class CollectionScheduler {
  private subscriptions: Map<string, SubscriptionRecord> = new Map();
  private invoices: Map<string, ItemizedInvoice> = new Map();
  private receipts: Map<string, PaymentReceipt> = new Map();
  private invoiceCounter: number = 1001;
  private receiptCounter: number = 2001;

  constructor() {
    this.seedCanonicalSubscriptions();
  }

  private seedCanonicalSubscriptions(): void {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 15 * 86400 * 1000); // 15 days left
    const sub1: SubscriptionRecord = {
      id: 'sub_org_alphatech',
      organizationId: 'org_alphatech',
      customerId: 'usr_sarah_01',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.jenkins@alphatech.global',
      planId: 'plan_professional',
      planTitle: 'CATALYX Professional Multi-Agent Suite',
      amountMinorUnits: 7900, // $79.00
      currency: 'USD',
      billingInterval: 'monthly',
      status: 'ACTIVE',
      currentPeriodStart: new Date(now.getTime() - 15 * 86400 * 1000).toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      nextBillingDate: periodEnd.toISOString(),
      preferredPaymentChannel: 'pesapal',
      autoRenew: true
    };

    const sub2: SubscriptionRecord = {
      id: 'sub_org_zenith',
      organizationId: 'org_zenith',
      customerId: 'usr_david_02',
      customerName: 'David Kiptoo',
      customerEmail: 'david.kiptoo@zenithlogistics.co.ke',
      planId: 'plan_enterprise',
      planTitle: 'CATALYX Enterprise Intelligence Operating System',
      amountMinorUnits: 1050000, // KES 10,500
      currency: 'KES',
      billingInterval: 'monthly',
      status: 'ACTIVE',
      currentPeriodStart: new Date(now.getTime() - 25 * 86400 * 1000).toISOString(),
      currentPeriodEnd: new Date(now.getTime() + 5 * 86400 * 1000).toISOString(),
      nextBillingDate: new Date(now.getTime() + 5 * 86400 * 1000).toISOString(),
      preferredPaymentChannel: 'bank_transfer',
      autoRenew: true
    };

    this.subscriptions.set(sub1.id, sub1);
    this.subscriptions.set(sub2.id, sub2);
  }

  /**
   * Generate next invoice number e.g. INV-CTX-2026-001001
   */
  private generateInvoiceNumber(): string {
    const num = this.invoiceCounter++;
    return `INV-CTX-${new Date().getFullYear()}-${num.toString().padStart(6, '0')}`;
  }

  /**
   * Generate next receipt number e.g. REC-CTX-2026-002001
   */
  private generateReceiptNumber(): string {
    const num = this.receiptCounter++;
    return `REC-CTX-${new Date().getFullYear()}-${num.toString().padStart(6, '0')}`;
  }

  public getAllSubscriptions(): SubscriptionRecord[] {
    return Array.from(this.subscriptions.values());
  }

  public getSubscription(id: string): SubscriptionRecord | undefined {
    return this.subscriptions.get(id);
  }

  public getAllInvoices(): ItemizedInvoice[] {
    return Array.from(this.invoices.values()).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  public getInvoiceById(invoiceId: string): ItemizedInvoice | undefined {
    return this.invoices.get(invoiceId);
  }

  public getAllReceipts(): PaymentReceipt[] {
    return Array.from(this.receipts.values()).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }

  public getReceiptById(receiptId: string): PaymentReceipt | undefined {
    return this.receipts.get(receiptId);
  }

  /**
   * Create an itemized invoice for an order or manual billing event
   */
  public createInvoice(params: {
    orderId: string;
    organizationId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    sellerName?: string;
    lineItems: {
      productId: string;
      productTitle: string;
      sku: string;
      quantity: number;
      unitPriceMinorUnits: number;
      totalPriceMinorUnits: number;
      priceSnapshot?: PriceSnapshot;
    }[];
    subtotalMinorUnits: number;
    discountMinorUnits: number;
    taxMinorUnits: number;
    feeMinorUnits: number;
    totalMinorUnits: number;
    currency: StandardCurrency;
    paymentChannel?: PaymentChannelId;
    dueDays?: number;
  }): ItemizedInvoice {
    const now = new Date();
    const dueDate = new Date(now.getTime() + (params.dueDays || 7) * 86400 * 1000).toISOString();
    const invoiceId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const invoiceNumber = this.generateInvoiceNumber();

    const invoice: ItemizedInvoice = {
      invoiceId,
      invoiceNumber,
      orderId: params.orderId,
      organizationId: params.organizationId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      sellerName: params.sellerName || 'CATALYX Technologies Inc.',
      lineItems: params.lineItems,
      subtotalMinorUnits: params.subtotalMinorUnits,
      discountMinorUnits: params.discountMinorUnits,
      taxMinorUnits: params.taxMinorUnits,
      feeMinorUnits: params.feeMinorUnits,
      totalMinorUnits: params.totalMinorUnits,
      currency: params.currency,
      status: 'ISSUED',
      paymentChannel: params.paymentChannel || 'pesapal',
      dueDate,
      issuedAt: now.toISOString()
    };

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  /**
   * Mark invoice as paid and generate immutable official payment receipt
   */
  public markInvoicePaid(params: {
    invoiceId: string;
    orderNumber: string;
    provider: PaymentChannelId;
    transactionReference: string;
    confirmationCode?: string;
    paymentMethod: string;
  }): PaymentReceipt {
    const invoice = this.invoices.get(params.invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${params.invoiceId} not found.`);
    }

    const now = new Date().toISOString();
    invoice.status = 'PAID';
    invoice.paidAt = now;
    invoice.paymentReference = params.transactionReference;
    invoice.paymentChannel = params.provider;

    const receiptId = `rec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const receiptNumber = this.generateReceiptNumber();

    const receipt: PaymentReceipt = {
      receiptId,
      receiptNumber,
      orderId: invoice.orderId,
      orderNumber: params.orderNumber,
      invoiceId: invoice.invoiceId,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      provider: params.provider,
      transactionReference: params.transactionReference,
      confirmationCode: params.confirmationCode,
      amountMinorUnits: invoice.totalMinorUnits,
      currency: invoice.currency,
      paymentMethod: params.paymentMethod,
      paidAt: now,
      issuedAt: now
    };

    this.receipts.set(receiptId, receipt);
    return receipt;
  }

  /**
   * Run automated billing scheduler cycle
   * Evaluates all subscriptions, generates renewal invoices, and processes renewals.
   */
  public runBillingCycle(): CollectionCycleResult {
    const now = new Date();
    const logs: string[] = [];
    let subscriptionsProcessed = 0;
    let invoicesGenerated = 0;
    let gracePeriodEntered = 0;
    let entitlementsRenewed = 0;

    for (const sub of this.subscriptions.values()) {
      subscriptionsProcessed++;
      const nextBill = new Date(sub.nextBillingDate);

      // Check if renewal is due
      if (now.getTime() >= nextBill.getTime()) {
        logs.push(`Subscription ${sub.id} (${sub.planTitle}) is due for renewal on ${sub.nextBillingDate}.`);

        // Check if invoice already issued
        const existingInv = Array.from(this.invoices.values()).find(
          i => i.customerId === sub.customerId && i.status === 'ISSUED' && new Date(i.dueDate).getTime() > now.getTime()
        );

        if (!existingInv) {
          const price = universalPricingEngine.getActivePrice(sub.planId, sub.currency);
          const totals = universalPricingEngine.calculateOrderTotals({
            items: [{ productId: sub.planId, quantity: 1, customPriceMinorUnits: sub.amountMinorUnits }],
            currency: sub.currency
          });

          const newInvoice = this.createInvoice({
            orderId: `ord_renewal_${sub.id}_${Date.now()}`,
            organizationId: sub.organizationId,
            customerId: sub.customerId,
            customerName: sub.customerName,
            customerEmail: sub.customerEmail,
            lineItems: totals.items,
            subtotalMinorUnits: totals.subtotalMinorUnits,
            discountMinorUnits: totals.discountMinorUnits,
            taxMinorUnits: totals.taxMinorUnits,
            feeMinorUnits: totals.feeMinorUnits,
            totalMinorUnits: totals.totalMinorUnits,
            currency: sub.currency,
            paymentChannel: sub.preferredPaymentChannel,
            dueDays: 7
          });

          newInvoice.status = 'PAYMENT_REQUIRED';
          invoicesGenerated++;

          // Enter 7-day grace period
          const graceEnd = new Date(now.getTime() + 7 * 86400 * 1000);
          sub.gracePeriodEndsAt = graceEnd.toISOString();
          sub.status = 'PAST_DUE';
          gracePeriodEntered++;

          logs.push(`Generated renewal Invoice ${newInvoice.invoiceNumber} ($${(newInvoice.totalMinorUnits / 100).toFixed(2)} ${sub.currency}). 7-day grace period initiated.`);
        }
      }
    }

    return {
      cycleTimestamp: now.toISOString(),
      subscriptionsProcessed,
      invoicesGenerated,
      invoicesPaid: 0,
      gracePeriodEntered,
      entitlementsRenewed,
      totalCollectedMinorUnits: 0,
      currency: 'USD',
      logs
    };
  }
}

export const collectionScheduler = new CollectionScheduler();
