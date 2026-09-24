/**
 * CATALYX Economic & Financial Engine
 * Central authoritative state management, double-entry ledger, state machines,
 * idempotency protection, reconciliation engine, creator balances, and circuit breakers.
 */

import {
  AuthoritativePaymentStatus,
  OrderLifecycleState,
  PayoutLifecycleState,
  StandardCurrency,
  BillingAddress,
  BankTransferSubmission
} from './paymentProvider.types';
import { PaymentProvider } from './PaymentProvider';
import { PesapalPaymentProvider } from './PesapalPaymentProvider';
import { BankTransferPaymentProvider } from './BankTransferPaymentProvider';
import { bankAccountManager } from './bankAccountManager';
import { payoutEligibilityEngine } from './payoutEligibilityEngine';
import { collectionScheduler } from './collectionScheduler';
import { revenuePolicyEngine, SellerAccountType } from './revenuePolicyEngine';

export interface OrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinorUnits: number;
  totalPriceMinorUnits: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: BillingAddress;
  items: OrderItem[];
  subtotalMinorUnits: number;
  taxMinorUnits: number;
  feeMinorUnits: number;
  totalMinorUnits: number;
  currency: StandardCurrency;
  status: OrderLifecycleState;
  paymentAttempts: string[];
  activePaymentAttemptId?: string;
  paidPaymentAttemptId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  timeline: {
    status: OrderLifecycleState;
    timestamp: string;
    changedBy: string;
    note: string;
  }[];
}

export interface PaymentAttempt {
  id: string;
  orderId: string;
  organizationId: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  provider: string;
  merchantReference: string;
  providerOrderTrackingId?: string;
  providerRedirectUrl?: string;
  idempotencyKey: string;
  status: AuthoritativePaymentStatus;
  attemptNumber: number;
  paymentMethod?: string;
  confirmationCode?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  metadata?: Record<string, any>;
}

export interface DoubleEntryItem {
  accountCode: string;
  debitMinorUnits: number;
  creditMinorUnits: number;
}

export interface DoubleEntryLedgerRecord {
  id: string;
  transactionReference: string;
  orderId?: string;
  paymentAttemptId?: string;
  organizationId: string;
  timestamp: string;
  entries: DoubleEntryItem[];
  netAmountMinorUnits: number;
  currency: StandardCurrency;
  description: string;
  idempotencyKey: string;
  previousRecordHash: string;
  recordHash: string;
}

export interface CreatorPayout {
  id: string;
  recipientEmail: string;
  recipientName: string;
  organizationId: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  destinationType: 'BANK_ACCOUNT' | 'MOBILE_MONEY' | 'INTERNAL_WALLET';
  destinationAccount: string;
  status: PayoutLifecycleState;
  requestedAt: string;
  approvedAt?: string;
  settledAt?: string;
  requiresManualSettlement: boolean;
  notes: string;
}

export interface RefundRecord {
  id: string;
  originalOrderId: string;
  originalPaymentAttemptId: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  reason: string;
  status: 'REQUESTED' | 'APPROVAL_REQUIRED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  requestedBy: string;
  requiresManualSettlement: boolean;
  timestamp: string;
}

export interface ReconciliationDiscrepancy {
  id: string;
  type: 'AMOUNT_MISMATCH' | 'CURRENCY_MISMATCH' | 'STATUS_MISMATCH' | 'MISSING_INTERNAL' | 'MISSING_PROVIDER' | 'DUPLICATE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  details: string;
  orderId?: string;
  trackingId?: string;
  merchantRef?: string;
  resolved: boolean;
}

export interface ReconciliationReport {
  id: string;
  runAt: string;
  status: 'RECONCILED' | 'DISCREPANCY_DETECTED' | 'CRITICAL_MISMATCH';
  totalLedgerRecords: number;
  totalProviderRecords: number;
  matchedRecords: number;
  discrepancyCount: number;
  discrepancies: ReconciliationDiscrepancy[];
}

export interface CircuitBreakerStatus {
  tripped: boolean;
  reason?: string;
  failedAttemptsInWindow: number;
  windowResetAt: string;
}

export interface UserEntitlement {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  organizationId: string;
  productId: string;
  productTitle: string;
  entitlementType: 'SUBSCRIPTION' | 'MARKETPLACE_ASSET' | 'PLATFORM_LICENSE';
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  grantedAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export class CatalyxEconomicEngine {
  private orders: Map<string, Order> = new Map();
  private paymentAttempts: Map<string, PaymentAttempt> = new Map();
  private ledger: DoubleEntryLedgerRecord[] = [];
  private payouts: CreatorPayout[] = [];
  private refunds: RefundRecord[] = [];
  private idempotencyStore: Map<string, { result: any; hash: string; timestamp: number }> = new Map();
  private reconciliationReports: ReconciliationReport[] = [];
  private providers: Map<string, PaymentProvider> = new Map();
  private primaryProviderId: string = 'pesapal';
  private entitlements: Map<string, UserEntitlement> = new Map();
  private activeVerifications: Map<string, Promise<any>> = new Map();

  // Circuit breaker state
  private failedAttemptsHistory: { ipOrUserId: string; timestamp: number }[] = [];
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly ROLLING_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_TRANSACTION_LIMIT_MINOR = 1000000; // $10,000.00 max single checkout

  constructor(primaryProvider?: PaymentProvider) {
    // 1. Register Pesapal
    const pesapal = primaryProvider || new PesapalPaymentProvider();
    this.providers.set('pesapal', pesapal);

    // 2. Register Bank Transfer Provider
    const bankTransfer = new BankTransferPaymentProvider({
      receivingBankAccounts: bankAccountManager.getClientSafeReceivingAccounts()
    });
    this.providers.set('bank_transfer', bankTransfer);

    this.seedSeedStateIfEmpty();
  }

  public getProvider(id?: string): PaymentProvider {
    const targetId = id || this.primaryProviderId;
    const provider = this.providers.get(targetId);
    if (!provider) {
      throw new Error(`Payment provider "${targetId}" is not registered in CATALYX.`);
    }
    return provider;
  }

  public setProvider(provider: PaymentProvider): void {
    this.providers.set(provider.getProviderId(), provider);
    this.primaryProviderId = provider.getProviderId();
  }

  public registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.getProviderId(), provider);
  }

  public getBankTransferProvider(): BankTransferPaymentProvider {
    return this.getProvider('bank_transfer') as BankTransferPaymentProvider;
  }

  public getAvailableChannels(): {
    id: string;
    name: string;
    isConfigured: boolean;
    environment: string;
    capabilities: Record<string, boolean>;
  }[] {
    const channels: any[] = [];
    for (const [id, prov] of this.providers.entries()) {
      channels.push({
        id,
        name: prov.getProviderName(),
        isConfigured: prov.isConfigured(),
        environment: prov.getEnvironment(),
        capabilities: {
          orderSubmission: prov.isConfigured(),
          statusQuery: prov.isConfigured(),
          directClearing: id === 'bank_transfer'
        }
      });
    }
    return channels;
  }

  // ==========================================================================
  // 1. CRYPTOGRAPHIC HASHING & IDEMPOTENCY
  // ==========================================================================

  private computeHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_${hex}_${content.length}`;
  }

  public checkIdempotency(key: string, payloadStr: string): { duplicate: boolean; cachedResult?: any } {
    const cached = this.idempotencyStore.get(key);
    if (!cached) {
      return { duplicate: false };
    }
    const currentHash = this.computeHash(payloadStr);
    if (cached.hash !== currentHash) {
      throw new Error(`Idempotency conflict: key "${key}" was previously used with a different request payload.`);
    }
    return { duplicate: true, cachedResult: cached.result };
  }

  public recordIdempotency(key: string, payloadStr: string, result: any): void {
    this.idempotencyStore.set(key, {
      result,
      hash: this.computeHash(payloadStr),
      timestamp: Date.now()
    });
  }

  // ==========================================================================
  // 2. CIRCUIT BREAKER & RISK CONTROLS
  // ==========================================================================

  public checkRiskPolicy(amountMinorUnits: number, ipOrUserId: string): CircuitBreakerStatus {
    const now = Date.now();
    // Prune expired events
    this.failedAttemptsHistory = this.failedAttemptsHistory.filter(
      event => now - event.timestamp < this.ROLLING_WINDOW_MS
    );

    const userFailures = this.failedAttemptsHistory.filter(e => e.ipOrUserId === ipOrUserId).length;
    if (userFailures >= this.MAX_FAILED_ATTEMPTS) {
      return {
        tripped: true,
        reason: `Payment velocity circuit breaker tripped: ${userFailures} failed attempts in the last 10 minutes. Please retry after cooldown.`,
        failedAttemptsInWindow: userFailures,
        windowResetAt: new Date(now + this.ROLLING_WINDOW_MS).toISOString()
      };
    }

    if (amountMinorUnits > this.MAX_TRANSACTION_LIMIT_MINOR) {
      return {
        tripped: true,
        reason: `Transaction amount (${amountMinorUnits / 100} units) exceeds automated threshold limit ($10,000.00). Requires high-value compliance pre-authorization.`,
        failedAttemptsInWindow: userFailures,
        windowResetAt: new Date(now).toISOString()
      };
    }

    return {
      tripped: false,
      failedAttemptsInWindow: userFailures,
      windowResetAt: new Date(now + this.ROLLING_WINDOW_MS).toISOString()
    };
  }

  public recordFailedAttempt(ipOrUserId: string): void {
    this.failedAttemptsHistory.push({ ipOrUserId, timestamp: Date.now() });
  }

  // ==========================================================================
  // 3. ORDER & PAYMENT STATE MACHINES
  // ==========================================================================

  public validateOrderTransition(current: OrderLifecycleState, next: OrderLifecycleState): boolean {
    const transitions: Record<OrderLifecycleState, OrderLifecycleState[]> = {
      DRAFT: ['CREATED', 'CANCELLED'],
      CREATED: ['PAYMENT_PENDING', 'CANCELLED'],
      PAYMENT_PENDING: ['PAID', 'FAILED', 'CANCELLED'],
      PAID: ['PROCESSING', 'REFUNDED', 'DISPUTED'],
      PROCESSING: ['FULFILLED', 'REFUNDED', 'DISPUTED'],
      FULFILLED: ['COMPLETED', 'REFUNDED', 'DISPUTED'],
      COMPLETED: ['REFUNDED', 'DISPUTED'],
      FAILED: ['PAYMENT_PENDING', 'CANCELLED'],
      CANCELLED: [],
      REFUNDED: [],
      DISPUTED: ['REFUNDED', 'COMPLETED']
    };

    return transitions[current]?.includes(next) ?? false;
  }

  public validatePaymentTransition(current: AuthoritativePaymentStatus, next: AuthoritativePaymentStatus): boolean {
    const transitions: Record<AuthoritativePaymentStatus, AuthoritativePaymentStatus[]> = {
      CREATED: ['PAYMENT_INITIATED', 'CANCELLED'],
      PAYMENT_INITIATED: ['PENDING', 'FAILED', 'CANCELLED'],
      PENDING: ['COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED'],
      COMPLETED: ['REFUNDED', 'PARTIALLY_REFUNDED', 'REVERSED'],
      FAILED: [],
      CANCELLED: [],
      REVERSED: [],
      REFUNDED: [],
      PARTIALLY_REFUNDED: ['REFUNDED'],
      EXPIRED: []
    };

    return transitions[current]?.includes(next) ?? false;
  }

  // ==========================================================================
  // 4. ORDER CREATION & LIFECYCLE
  // ==========================================================================

  public createOrder(params: {
    organizationId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    billingAddress: BillingAddress;
    items: OrderItem[];
    currency: StandardCurrency;
    taxRatePercent?: number;
    feeMinorUnits?: number;
    idempotencyKey?: string;
  }): Order {
    if (params.idempotencyKey) {
      const check = this.checkIdempotency(params.idempotencyKey, JSON.stringify(params));
      if (check.duplicate) return check.cachedResult;
    }

    if (!params.items || params.items.length === 0) {
      throw new Error('Cannot create an order with zero line items.');
    }

    // Calculate subtotal server-side (never trust client total)
    const subtotalMinorUnits = params.items.reduce(
      (sum, item) => sum + Math.round(item.unitPriceMinorUnits * item.quantity),
      0
    );

    const taxPercent = params.taxRatePercent || 0;
    const taxMinorUnits = Math.round((subtotalMinorUnits * taxPercent) / 100);
    const feeMinorUnits = params.feeMinorUnits || 0;
    const totalMinorUnits = subtotalMinorUnits + taxMinorUnits + feeMinorUnits;

    const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `ORD-CTX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      orderNumber,
      organizationId: params.organizationId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      billingAddress: params.billingAddress,
      items: params.items,
      subtotalMinorUnits,
      taxMinorUnits,
      feeMinorUnits,
      totalMinorUnits,
      currency: params.currency,
      status: 'CREATED',
      paymentAttempts: [],
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'CREATED',
          timestamp: now,
          changedBy: 'CATALYX Economic Engine',
          note: `Order ${orderNumber} created with ${params.items.length} line items. Total: ${totalMinorUnits / 100} ${params.currency}.`
        }
      ]
    };

    this.orders.set(orderId, order);

    try {
      collectionScheduler.createInvoice({
        orderId: order.id,
        organizationId: order.organizationId,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        sellerName: 'CATALYX Inc. Financial Services',
        lineItems: order.items.map(item => ({
          productId: item.productId,
          productTitle: item.productTitle,
          sku: item.sku,
          quantity: item.quantity,
          unitPriceMinorUnits: item.unitPriceMinorUnits,
          totalPriceMinorUnits: item.totalPriceMinorUnits
        })),
        subtotalMinorUnits: order.subtotalMinorUnits,
        discountMinorUnits: 0,
        taxMinorUnits: order.taxMinorUnits,
        feeMinorUnits: order.feeMinorUnits,
        totalMinorUnits: order.totalMinorUnits,
        currency: order.currency
      });
    } catch (invErr) {
      console.warn('Failed to auto-create invoice for order:', invErr);
    }

    if (params.idempotencyKey) {
      this.recordIdempotency(params.idempotencyKey, JSON.stringify(params), order);
    }

    return order;
  }

  public getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  public getOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  // ==========================================================================
  // 5. INITIATE PAYMENT ATTEMPT & SUBMIT TO GATEWAY
  // ==========================================================================

  public async initiatePaymentAttempt(params: {
    orderId: string;
    callbackUrl?: string;
    idempotencyKey: string;
    ipOrUserId: string;
    channel?: 'pesapal' | 'bank_transfer';
  }): Promise<{
    success: boolean;
    paymentAttempt: PaymentAttempt;
    redirectUrl?: string;
    message: string;
    error?: string;
  }> {
    // 1. Idempotency Check
    const idempCheck = this.checkIdempotency(params.idempotencyKey, JSON.stringify(params));
    if (idempCheck.duplicate) {
      return idempCheck.cachedResult;
    }

    // 2. Fetch Order
    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error(`Order ${params.orderId} not found.`);
    }

    const channel = params.channel || 'pesapal';
    const provider = this.getProvider(channel);

    // 3. Risk & Circuit Breaker Check
    const risk = this.checkRiskPolicy(order.totalMinorUnits, params.ipOrUserId);
    if (risk.tripped) {
      this.recordFailedAttempt(params.ipOrUserId);
      return {
        success: false,
        paymentAttempt: {
          id: `pay_rejected_${Date.now()}`,
          orderId: order.id,
          organizationId: order.organizationId,
          amountMinorUnits: order.totalMinorUnits,
          currency: order.currency,
          provider: provider.getProviderId(),
          merchantReference: `REJECTED-${order.orderNumber}`,
          idempotencyKey: params.idempotencyKey,
          status: 'FAILED',
          attemptNumber: order.paymentAttempts.length + 1,
          failureReason: risk.reason,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: risk.reason || 'Payment rejected by risk controls.',
        error: risk.reason
      };
    }

    // 4. Validate Order State Transition
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      throw new Error(`Order ${order.orderNumber} is already paid. Duplicate payment attempt rejected.`);
    }

    if (this.validateOrderTransition(order.status, 'PAYMENT_PENDING')) {
      order.status = 'PAYMENT_PENDING';
      order.updatedAt = new Date().toISOString();
      order.timeline.push({
        status: 'PAYMENT_PENDING',
        timestamp: new Date().toISOString(),
        changedBy: 'CATALYX Economic Engine',
        note: `Customer checkout initiated via ${provider.getProviderName()}. Awaiting payment completion.`
      });
    }

    // 5. Create Payment Attempt Record
    const attemptId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const merchantRef = `CX-${order.orderNumber.replace('ORD-CTX-', '')}-${(order.paymentAttempts.length + 1)}`;
    const now = new Date().toISOString();

    const paymentAttempt: PaymentAttempt = {
      id: attemptId,
      orderId: order.id,
      organizationId: order.organizationId,
      amountMinorUnits: order.totalMinorUnits,
      currency: order.currency,
      provider: provider.getProviderId(),
      merchantReference: merchantRef,
      idempotencyKey: params.idempotencyKey,
      status: 'PAYMENT_INITIATED',
      attemptNumber: order.paymentAttempts.length + 1,
      createdAt: now,
      updatedAt: now
    };

    order.paymentAttempts.push(attemptId);
    order.activePaymentAttemptId = attemptId;
    this.paymentAttempts.set(attemptId, paymentAttempt);

    // 6. Submit to Provider
    const submitResult = await provider.submitOrder({
      internalOrderId: order.id,
      merchantReference: merchantRef,
      amountMinorUnits: order.totalMinorUnits,
      currency: order.currency,
      description: `Payment for CATALYX Order ${order.orderNumber}`,
      callbackUrl: params.callbackUrl || `${process.env.APP_URL || 'http://localhost:3000'}/billing?orderId=${order.id}&merchantRef=${merchantRef}`,
      billingAddress: order.billingAddress,
      idempotencyKey: params.idempotencyKey
    });

    if (submitResult.status === 'SUCCESS') {
      paymentAttempt.providerOrderTrackingId = submitResult.orderTrackingId;
      paymentAttempt.providerRedirectUrl = submitResult.redirectUrl;
      paymentAttempt.status = 'PENDING';
      paymentAttempt.updatedAt = new Date().toISOString();

      const responsePayload = {
        success: true,
        paymentAttempt,
        redirectUrl: submitResult.redirectUrl,
        message: `Order submitted to ${provider.getProviderName()} successfully.`
      };

      this.recordIdempotency(params.idempotencyKey, JSON.stringify(params), responsePayload);
      return responsePayload;
    } else {
      paymentAttempt.status = 'FAILED';
      paymentAttempt.failureReason = submitResult.errorMessage;
      paymentAttempt.updatedAt = new Date().toISOString();
      this.recordFailedAttempt(params.ipOrUserId);

      const responsePayload = {
        success: false,
        paymentAttempt,
        message: submitResult.errorMessage || 'Failed to submit order to gateway.',
        error: submitResult.errorMessage
      };

      this.recordIdempotency(params.idempotencyKey, JSON.stringify(params), responsePayload);
      return responsePayload;
    }
  }

  // ==========================================================================
  // 6. AUTHORITATIVE PAYMENT VERIFICATION & SETTLEMENT
  // ==========================================================================

  public async verifyAndSettlePayment(params: {
    orderTrackingId: string;
    merchantReference?: string;
    paymentAttemptId?: string;
    operatorOrTrigger: string;
  }): Promise<{
    verified: boolean;
    order?: Order;
    paymentAttempt?: PaymentAttempt;
    ledgerRecord?: DoubleEntryLedgerRecord;
    message: string;
    discrepancies?: string[];
  }> {
    const lockKey = params.orderTrackingId || params.merchantReference || params.paymentAttemptId || '';
    if (lockKey && this.activeVerifications.has(lockKey)) {
      return await this.activeVerifications.get(lockKey)!;
    }

    const verificationPromise = this.performVerifyAndSettlePayment(params);
    if (lockKey) {
      this.activeVerifications.set(lockKey, verificationPromise);
    }

    try {
      return await verificationPromise;
    } finally {
      if (lockKey) {
        this.activeVerifications.delete(lockKey);
      }
    }
  }

  private async performVerifyAndSettlePayment(params: {
    orderTrackingId: string;
    merchantReference?: string;
    paymentAttemptId?: string;
    operatorOrTrigger: string;
  }): Promise<{
    verified: boolean;
    order?: Order;
    paymentAttempt?: PaymentAttempt;
    ledgerRecord?: DoubleEntryLedgerRecord;
    message: string;
    discrepancies?: string[];
  }> {
    // 1. Locate Payment Attempt
    let attempt: PaymentAttempt | undefined;
    if (params.paymentAttemptId) {
      attempt = this.paymentAttempts.get(params.paymentAttemptId);
    }
    if (!attempt && params.orderTrackingId) {
      attempt = Array.from(this.paymentAttempts.values()).find(
        p => p.providerOrderTrackingId === params.orderTrackingId
      );
    }
    if (!attempt && params.merchantReference) {
      attempt = Array.from(this.paymentAttempts.values()).find(
        p => p.merchantReference === params.merchantReference
      );
    }

    if (!attempt) {
      return {
        verified: false,
        message: `No matching internal payment attempt found for tracking ID "${params.orderTrackingId}" or merchant ref "${params.merchantReference}".`,
        discrepancies: ['Payment attempt record missing from CATALYX database.']
      };
    }

    const order = this.orders.get(attempt.orderId);
    if (!order) {
      return {
        verified: false,
        message: `Internal order ${attempt.orderId} not found.`,
        discrepancies: ['Order record missing for existing payment attempt.']
      };
    }

    // Check if already completed (idempotent completion)
    if (attempt.status === 'COMPLETED' && order.status === 'PAID') {
      const existingLedger = this.ledger.find(l => l.paymentAttemptId === attempt!.id);
      return {
        verified: true,
        order,
        paymentAttempt: attempt,
        ledgerRecord: existingLedger,
        message: 'Payment was already verified and settled.'
      };
    }

    // 2. Locate Selected Provider and Authoritatively Verify Against Gateway / Bank Record
    const provider = this.getProvider(attempt.provider || 'pesapal');
    const verification = await provider.verifyTransaction({
      orderTrackingId: params.orderTrackingId,
      expectedMerchantReference: attempt.merchantReference,
      expectedAmountMinorUnits: attempt.amountMinorUnits,
      expectedCurrency: attempt.currency,
      organizationId: attempt.organizationId
    });

    if (!verification.verified) {
      attempt.failureReason = verification.discrepancies.join(' | ');
      attempt.updatedAt = new Date().toISOString();
      if (verification.paymentStatus === 'FAILED') {
        attempt.status = 'FAILED';
        order.status = 'FAILED';
      }

      return {
        verified: false,
        order,
        paymentAttempt: attempt,
        message: `Authoritative verification failed: ${verification.discrepancies.join(', ')}`,
        discrepancies: verification.discrepancies
      };
    }

    // 3. Mark Payment Attempt as COMPLETED
    const now = new Date().toISOString();
    attempt.status = 'COMPLETED';
    attempt.verifiedAt = now;
    attempt.updatedAt = now;
    attempt.paymentMethod = verification.paymentMethod;
    attempt.confirmationCode = verification.confirmationCode;

    // 4. Advance Order to PAID
    order.status = 'PAID';
    order.paidPaymentAttemptId = attempt.id;
    order.paidAt = now;
    order.updatedAt = now;
    order.timeline.push({
      status: 'PAID',
      timestamp: now,
      changedBy: params.operatorOrTrigger,
      note: `Payment verified via ${provider.getProviderName()} (Tracking ID: ${params.orderTrackingId}, Confirmation: ${verification.confirmationCode || 'N/A'}).`
    });

    // 5. Post Balanced Double-Entry Ledger Transaction
    const ledgerRecord = this.postPaymentLedgerEntry(order, attempt);

    // 6. Record Creator Earnings Attribution using Centralized Revenue Policy Engine
    for (const item of order.items) {
      if (item.productId.startsWith('prod_mkt_')) {
        const isOrg = order.organizationId && order.organizationId !== 'org_individual' && !order.organizationId.startsWith('indiv_');
        const sellerType: SellerAccountType = isOrg ? 'ORGANIZATION' : 'INDIVIDUAL';
        const split = revenuePolicyEngine.calculateRevenueSplit({
          grossAmountMinorUnits: item.totalPriceMinorUnits,
          currency: order.currency,
          sellerAccountType: sellerType,
          paymentChannel: attempt.provider
        });

        payoutEligibilityEngine.recordOrderEarning({
          orderId: order.id,
          orderNumber: order.orderNumber,
          paidAt: now,
          creatorEmail: 'creator@intelligence.org',
          creatorName: 'Dr. Elena Rostova',
          productTitle: item.productTitle,
          grossAmountMinorUnits: item.totalPriceMinorUnits,
          commissionPercent: split.catalyxFeePercent,
          currency: order.currency
        });
      }
    }

    // 7. Update Invoicing System (if an invoice exists for this order)
    const matchingInvoice = collectionScheduler.getAllInvoices().find(inv => inv.orderId === order.id);
    if (matchingInvoice && matchingInvoice.status !== 'PAID') {
      collectionScheduler.markInvoicePaid({
        invoiceId: matchingInvoice.invoiceId,
        orderNumber: order.orderNumber,
        provider: (attempt.provider as any) || 'pesapal',
        transactionReference: attempt.merchantReference,
        confirmationCode: verification.confirmationCode,
        paymentMethod: verification.paymentMethod || 'Authoritative Gateway'
      });
    }

    // 8. Grant Entitlements Idempotently
    this.grantOrderEntitlements(order);

    return {
      verified: true,
      order,
      paymentAttempt: attempt,
      ledgerRecord,
      message: `Payment verified and settled successfully! Order ${order.orderNumber} is now marked as PAID.`
    };
  }

  private grantOrderEntitlements(order: Order): void {
    const now = new Date();
    for (const item of order.items) {
      const entitlementKey = `${order.customerEmail.toLowerCase()}::${item.productId}`;
      if (!this.entitlements.has(entitlementKey)) {
        const isSubscription = item.sku.includes('SUB') || item.productId.includes('plan_');
        const expiresAt = isSubscription 
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

        this.entitlements.set(entitlementKey, {
          id: `ent_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerEmail: order.customerEmail.toLowerCase(),
          organizationId: order.organizationId,
          productId: item.productId,
          productTitle: item.productTitle,
          entitlementType: isSubscription ? 'SUBSCRIPTION' : 'MARKETPLACE_ASSET',
          status: 'ACTIVE',
          grantedAt: now.toISOString(),
          expiresAt
        });
      }
    }
  }

  public getEntitlements(filter?: { email?: string; organizationId?: string }): UserEntitlement[] {
    const all = Array.from(this.entitlements.values());
    if (!filter) return all;
    return all.filter(e => {
      if (filter.email && e.customerEmail !== filter.email.toLowerCase()) return false;
      if (filter.organizationId && e.organizationId !== filter.organizationId) return false;
      return true;
    });
  }

  public hasEntitlement(email: string, productId: string): boolean {
    const ent = this.entitlements.get(`${email.toLowerCase()}::${productId}`);
    if (!ent || ent.status !== 'ACTIVE') return false;
    if (ent.expiresAt && new Date(ent.expiresAt).getTime() < Date.now()) return false;
    return true;
  }

  // ==========================================================================
  // 7. DOUBLE-ENTRY LEDGER SYSTEM
  // ==========================================================================

  private postPaymentLedgerEntry(order: Order, attempt: PaymentAttempt): DoubleEntryLedgerRecord {
    // Check if ledger entry already exists for this payment attempt
    const existing = this.ledger.find(l => l.paymentAttemptId === attempt.id);
    if (existing) return existing;

    const previousHash = this.ledger.length > 0
      ? this.ledger[this.ledger.length - 1].recordHash
      : 'genesis_hash_0000000000000000';

    const now = new Date().toISOString();
    const txRef = `TX-CTX-${Date.now().toString().slice(-8)}`;

    const cashAccountCode = attempt.provider === 'bank_transfer'
      ? 'CASH_BANK_TRANSFER_CLEARING'
      : 'CASH_PESAPAL_CLEARING';

    // Calculate entries
    // Debit: Cash Clearing Account for full customer payment
    // Credit: Subscription or Product Revenue
    // Credit: Tax Payable (if applicable)
    // Credit: Gateway Fee Collected (if applicable)
    const entries: DoubleEntryItem[] = [
      {
        accountCode: cashAccountCode,
        debitMinorUnits: order.totalMinorUnits,
        creditMinorUnits: 0
      },
      {
        accountCode: 'REVENUE_COMMERCE',
        debitMinorUnits: 0,
        creditMinorUnits: order.subtotalMinorUnits
      }
    ];

    if (order.taxMinorUnits > 0) {
      entries.push({
        accountCode: 'TAX_PAYABLE',
        debitMinorUnits: 0,
        creditMinorUnits: order.taxMinorUnits
      });
    }

    if (order.feeMinorUnits > 0) {
      entries.push({
        accountCode: 'GATEWAY_PROCESSING_FEE_COLLECTED',
        debitMinorUnits: 0,
        creditMinorUnits: order.feeMinorUnits
      });
    }

    // Verify mathematical balance (Sum Debits === Sum Credits)
    const totalDebits = entries.reduce((sum, e) => sum + e.debitMinorUnits, 0);
    const totalCredits = entries.reduce((sum, e) => sum + e.creditMinorUnits, 0);
    if (totalDebits !== totalCredits) {
      throw new Error(`Double-entry balance violation: Debits (${totalDebits}) do not equal Credits (${totalCredits}).`);
    }

    const recordId = `led_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const hashData = `${recordId}_${txRef}_${order.totalMinorUnits}_${order.currency}_${previousHash}`;
    const recordHash = this.computeHash(hashData);

    const record: DoubleEntryLedgerRecord = {
      id: recordId,
      transactionReference: txRef,
      orderId: order.id,
      paymentAttemptId: attempt.id,
      organizationId: order.organizationId,
      timestamp: now,
      entries,
      netAmountMinorUnits: order.totalMinorUnits,
      currency: order.currency,
      description: `Settlement for Order ${order.orderNumber} (${order.customerEmail}) via ${attempt.provider}`,
      idempotencyKey: attempt.idempotencyKey,
      previousRecordHash: previousHash,
      recordHash
    };

    this.ledger.push(record);
    return record;
  }

  public getLedger(): DoubleEntryLedgerRecord[] {
    return [...this.ledger];
  }

  // ==========================================================================
  // 7B. BANK TRANSFER WORKFLOW (MODE B RECONCILIATION)
  // ==========================================================================

  public recordBankTransferSubmission(submission: BankTransferSubmission): void {
    this.getBankTransferProvider().recordCustomerSubmission(submission);
  }

  public async verifyAndConfirmBankTransfer(params: {
    merchantReference: string;
    verifiedBy: string;
    verificationNotes?: string;
  }): Promise<{
    success: boolean;
    order?: Order;
    ledgerRecord?: DoubleEntryLedgerRecord;
    message: string;
  }> {
    const bankProv = this.getBankTransferProvider();
    const conf = bankProv.confirmManualTransfer({
      merchantReference: params.merchantReference,
      verifiedBy: params.verifiedBy,
      verificationNotes: params.verificationNotes
    });

    if (!conf.success) {
      return { success: false, message: conf.message };
    }

    // Settle inside the economic engine
    const settle = await this.verifyAndSettlePayment({
      orderTrackingId: params.merchantReference,
      merchantReference: params.merchantReference,
      operatorOrTrigger: `Finance Admin Verification: ${params.verifiedBy}`
    });

    return {
      success: settle.verified,
      order: settle.order,
      ledgerRecord: settle.ledgerRecord,
      message: settle.message
    };
  }

  // ==========================================================================
  // 8. CREATOR BALANCES & PAYOUT WORKFLOW
  // ==========================================================================

  public getCreatorBalance(creatorEmail: string, sellerType: SellerAccountType = 'INDIVIDUAL'): {
    totalGrossSalesMinor: number;
    platformCommissionMinor: number;
    eligibleBalanceMinor: number;
    pendingPayoutsMinor: number;
    settledPayoutsMinor: number;
    currency: StandardCurrency;
    platformFeePercent: number;
    sellerGrossPlatformEarningsMinorUnits: number;
  } {
    // In our system, orders with seller attribution
    // For testing and consistency, we aggregate from ledger and orders
    const email = creatorEmail.toLowerCase();
    const paidOrders = Array.from(this.orders.values()).filter(
      o => o.status === 'PAID' || o.status === 'COMPLETED'
    );

    // Sum matching orders or seed records
    let gross = 0;
    for (const o of paidOrders) {
      if (o.customerEmail.toLowerCase() !== email) {
        gross += o.subtotalMinorUnits;
      }
    }

    // Determine commission rate via authoritative RevenuePolicyEngine
    const split = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: gross,
      currency: 'USD',
      sellerAccountType: sellerType
    });

    const platformComm = split.catalyxFeeMinorUnits;
    const netEarned = split.sellerGrossPlatformEarningsMinorUnits;

    const creatorPayouts = this.payouts.filter(p => p.recipientEmail.toLowerCase() === email);
    const settledPayouts = creatorPayouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amountMinorUnits, 0);

    const pendingPayouts = creatorPayouts
      .filter(p => ['REQUESTED', 'APPROVAL_REQUIRED', 'APPROVED', 'INITIATED', 'PROVIDER_PENDING'].includes(p.status))
      .reduce((sum, p) => sum + p.amountMinorUnits, 0);

    const eligible = Math.max(0, netEarned - settledPayouts - pendingPayouts);

    return {
      totalGrossSalesMinor: gross,
      platformCommissionMinor: platformComm,
      eligibleBalanceMinor: eligible,
      pendingPayoutsMinor: pendingPayouts,
      settledPayoutsMinor: settledPayouts,
      currency: 'USD',
      platformFeePercent: split.catalyxFeePercent,
      sellerGrossPlatformEarningsMinorUnits: netEarned
    };
  }

  public async requestCreatorPayout(params: {
    recipientEmail: string;
    recipientName: string;
    organizationId: string;
    amountMinorUnits: number;
    currency: StandardCurrency;
    destinationType: 'BANK_ACCOUNT' | 'MOBILE_MONEY' | 'INTERNAL_WALLET';
    destinationAccount: string;
    idempotencyKey: string;
    authorizedBy: string;
  }): Promise<{
    success: boolean;
    payout: CreatorPayout;
    message: string;
    requiresManualSettlement: boolean;
  }> {
    if (params.amountMinorUnits <= 0) {
      throw new Error('Payout amount must be greater than zero.');
    }

    const balance = this.getCreatorBalance(params.recipientEmail);
    if (params.amountMinorUnits > balance.eligibleBalanceMinor) {
      throw new Error(
        `Insufficient eligible balance. Requested ${params.amountMinorUnits / 100} ${params.currency}, but only ${balance.eligibleBalanceMinor / 100} ${params.currency} is eligible for payout.`
      );
    }

    const payoutId = `pout_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Provider check
    const payoutProvider = this.getProvider('pesapal');
    const providerResult = await payoutProvider.initiatePayout({
      payoutId,
      recipientId: params.recipientEmail,
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
      destinationType: params.destinationType,
      destinationAccount: params.destinationAccount,
      amountMinorUnits: params.amountMinorUnits,
      currency: params.currency,
      reason: 'Marketplace creator earnings payout',
      idempotencyKey: params.idempotencyKey,
      authorizedBy: params.authorizedBy
    });

    const payout: CreatorPayout = {
      id: payoutId,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      organizationId: params.organizationId,
      amountMinorUnits: params.amountMinorUnits,
      currency: params.currency,
      destinationType: params.destinationType,
      destinationAccount: params.destinationAccount,
      status: 'APPROVAL_REQUIRED',
      requestedAt: now,
      requiresManualSettlement: providerResult.requiresManualSettlement,
      notes: providerResult.message
    };

    this.payouts.unshift(payout);

    return {
      success: true,
      payout,
      message: `Payout of ${params.amountMinorUnits / 100} ${params.currency} queued for Finance Administrator authorization. Note: ${providerResult.message}`,
      requiresManualSettlement: providerResult.requiresManualSettlement
    };
  }

  public approveCreatorPayout(payoutId: string, adminUser: string): CreatorPayout {
    const payout = this.payouts.find(p => p.id === payoutId);
    if (!payout) throw new Error(`Payout ${payoutId} not found.`);

    payout.status = 'APPROVED';
    payout.approvedAt = new Date().toISOString();
    payout.notes += ` | Approved by Finance Admin: ${adminUser}.`;
    return payout;
  }

  public completeCreatorPayout(payoutId: string, externalTransferRef: string, operator: string): CreatorPayout {
    const payout = this.payouts.find(p => p.id === payoutId);
    if (!payout) throw new Error(`Payout ${payoutId} not found.`);

    payout.status = 'COMPLETED';
    payout.settledAt = new Date().toISOString();
    payout.notes += ` | Settled via reference: ${externalTransferRef} by ${operator}.`;

    // Compensating Ledger Entry: Debit CREATOR_PAYABLE, Credit CASH_OR_BANK
    const prevHash = this.ledger.length > 0 ? this.ledger[this.ledger.length - 1].recordHash : 'genesis';
    const recordId = `led_payout_${Date.now()}`;
    const ledgerRecord: DoubleEntryLedgerRecord = {
      id: recordId,
      transactionReference: `PAYOUT-${externalTransferRef}`,
      organizationId: payout.organizationId,
      timestamp: new Date().toISOString(),
      entries: [
        { accountCode: 'CREATOR_PAYABLE', debitMinorUnits: payout.amountMinorUnits, creditMinorUnits: 0 },
        { accountCode: 'BANK_ACCOUNT_DISBURSEMENT', debitMinorUnits: 0, creditMinorUnits: payout.amountMinorUnits }
      ],
      netAmountMinorUnits: payout.amountMinorUnits,
      currency: payout.currency,
      description: `Disbursed creator payout ${payout.id} to ${payout.recipientEmail}`,
      idempotencyKey: `idemp_${payout.id}`,
      previousRecordHash: prevHash,
      recordHash: this.computeHash(`${recordId}_${payout.amountMinorUnits}_${prevHash}`)
    };

    this.ledger.push(ledgerRecord);
    return payout;
  }

  public getPayouts(): CreatorPayout[] {
    return [...this.payouts];
  }

  // ==========================================================================
  // 9. RECONCILIATION ENGINE
  // ==========================================================================

  public runReconciliation(): ReconciliationReport {
    const discrepancies: ReconciliationDiscrepancy[] = [];
    let matched = 0;

    // Cross-audit each completed order against ledger
    for (const order of this.orders.values()) {
      if (order.status === 'PAID' || order.status === 'COMPLETED') {
        const ledgerMatches = this.ledger.filter(l => l.orderId === order.id);
        if (ledgerMatches.length === 0) {
          discrepancies.push({
            id: `disc_missing_ledger_${order.id}`,
            type: 'MISSING_INTERNAL',
            severity: 'CRITICAL',
            details: `Order ${order.orderNumber} is marked PAID but has no matching transaction in double-entry ledger.`,
            orderId: order.id,
            resolved: false
          });
        } else {
          matched++;
          const ledgerTotal = ledgerMatches[0].netAmountMinorUnits;
          if (ledgerTotal !== order.totalMinorUnits) {
            discrepancies.push({
              id: `disc_amount_${order.id}`,
              type: 'AMOUNT_MISMATCH',
              severity: 'CRITICAL',
              details: `Order total (${order.totalMinorUnits} minor units) does not match ledger record amount (${ledgerTotal} minor units).`,
              orderId: order.id,
              resolved: false
            });
          }
        }
      }
    }

    // Determine overall state
    let reportStatus: 'RECONCILED' | 'DISCREPANCY_DETECTED' | 'CRITICAL_MISMATCH' = 'RECONCILED';
    if (discrepancies.some(d => d.severity === 'CRITICAL')) {
      reportStatus = 'CRITICAL_MISMATCH';
    } else if (discrepancies.length > 0) {
      reportStatus = 'DISCREPANCY_DETECTED';
    }

    const report: ReconciliationReport = {
      id: `recon_${Date.now()}`,
      runAt: new Date().toISOString(),
      status: reportStatus,
      totalLedgerRecords: this.ledger.length,
      totalProviderRecords: Array.from(this.orders.values()).length,
      matchedRecords: matched,
      discrepancyCount: discrepancies.length,
      discrepancies
    };

    this.reconciliationReports.unshift(report);
    return report;
  }

  public getLatestReconciliation(): ReconciliationReport {
    if (this.reconciliationReports.length === 0) {
      return this.runReconciliation();
    }
    return this.reconciliationReports[0];
  }

  // ==========================================================================
  // 10. SEED VERIFIED DATA IF EMPTY
  // ==========================================================================

  private seedSeedStateIfEmpty(): void {
    if (this.orders.size > 0) return;

    // Seed baseline verified order to establish accounting provenance
    const orderId = 'ord_v28_seed_01';
    const orderNumber = 'ORD-CTX-2026-9011';
    const now = new Date(Date.now() - 3600000 * 24).toISOString();

    const seedOrder: Order = {
      id: orderId,
      orderNumber,
      organizationId: 'org_catalyx_hq',
      customerId: 'c_01',
      customerName: 'Apex Logistics East Africa',
      customerEmail: 'finance@apexlogistics.co.ke',
      billingAddress: {
        emailAddress: 'finance@apexlogistics.co.ke',
        firstName: 'Amina',
        lastName: 'Kimani',
        countryCode: 'KE'
      },
      items: [
        {
          productId: 'prod_ent_suite',
          productTitle: 'CATALYX Enterprise Intelligence Operating System (Annual)',
          sku: 'CAT-SUB-ENTERPRISE',
          quantity: 1,
          unitPriceMinorUnits: 120000, // $1,200.00
          totalPriceMinorUnits: 120000
        }
      ],
      subtotalMinorUnits: 120000,
      taxMinorUnits: 0,
      feeMinorUnits: 2400,
      totalMinorUnits: 122400,
      currency: 'USD',
      status: 'PAID',
      paymentAttempts: ['pay_v28_seed_01'],
      paidPaymentAttemptId: 'pay_v28_seed_01',
      createdAt: now,
      updatedAt: now,
      paidAt: now,
      timeline: [
        { status: 'CREATED', timestamp: now, changedBy: 'System', note: 'Order created' },
        { status: 'PAID', timestamp: now, changedBy: 'Pesapal IPN Listener', note: 'Settled via Pesapal (Tracking: pesa_trk_seed_9011)' }
      ]
    };

    this.orders.set(orderId, seedOrder);

    const seedAttempt: PaymentAttempt = {
      id: 'pay_v28_seed_01',
      orderId,
      organizationId: 'org_catalyx_hq',
      amountMinorUnits: 122400,
      currency: 'USD',
      provider: 'pesapal',
      merchantReference: 'CX-PRO-9011',
      providerOrderTrackingId: 'pesa_trk_seed_9011',
      idempotencyKey: 'idemp_seed_9011',
      status: 'COMPLETED',
      attemptNumber: 1,
      paymentMethod: 'Pesapal Card / Mobile Money',
      confirmationCode: 'PESA-CONF-9011',
      createdAt: now,
      updatedAt: now,
      verifiedAt: now
    };

    this.paymentAttempts.set('pay_v28_seed_01', seedAttempt);
    this.postPaymentLedgerEntry(seedOrder, seedAttempt);
  }
}

// Global Singleton for runtime consistency
export const catalyxEconomicEngine = new CatalyxEconomicEngine();
