/**
 * CATALYX Economic & Payment Architecture — Provider Abstraction Types
 * Provider-independent payment and settlement interfaces.
 */

export type ProviderCapabilityStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'NOT_SUPPORTED'
  | 'NOT_CONFIGURED'
  | 'PROVIDER_REQUIRES_APPROVAL'
  | 'PROVIDER_CAPABILITY_UNAVAILABLE'
  | 'EXTERNAL_ACTION_REQUIRED';

export type PaymentExecutionEnvironment = 'sandbox' | 'live';

export type StandardCurrency = 'USD' | 'KES' | 'UGX' | 'TZS' | 'RWF' | 'NGN' | 'GHS' | 'ZAR' | 'EUR' | 'GBP';

export type AuthoritativePaymentStatus =
  | 'CREATED'
  | 'PAYMENT_INITIATED'
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REVERSED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'EXPIRED';

export type OrderLifecycleState =
  | 'DRAFT'
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'FULFILLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED'
  | 'DISPUTED';

export type PayoutLifecycleState =
  | 'DRAFT'
  | 'REQUESTED'
  | 'ELIGIBILITY_CHECK'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'INITIATED'
  | 'PROVIDER_PENDING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'REVERSED';

export interface BillingAddress {
  emailAddress: string;
  phoneNumber?: string;
  countryCode?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zipCode?: string;
}

export interface SubmitOrderRequest {
  internalOrderId: string;
  merchantReference: string;
  amountMinorUnits: number; // Integer minor units (e.g. 2900 for 29.00)
  currency: StandardCurrency;
  description: string;
  callbackUrl: string;
  notificationId?: string; // Pesapal IPN ID
  billingAddress: BillingAddress;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export interface SubmitOrderResult {
  status: ProviderCapabilityStatus;
  provider: string;
  orderTrackingId?: string;
  merchantReference: string;
  redirectUrl?: string;
  rawResponse?: any;
  errorMessage?: string;
  isSandbox: boolean;
  environment: PaymentExecutionEnvironment;
  timestamp: string;
}

export interface TransactionStatusResult {
  status: ProviderCapabilityStatus;
  provider: string;
  orderTrackingId: string;
  merchantReference: string;
  paymentStatus: AuthoritativePaymentStatus;
  providerStatusDescription?: string;
  amountMinorUnits?: number;
  currency?: StandardCurrency;
  paymentMethod?: string;
  confirmationCode?: string;
  paymentAccount?: string;
  rawResponse?: any;
  errorMessage?: string;
  timestamp: string;
}

export interface TransactionVerificationRequest {
  orderTrackingId: string;
  expectedMerchantReference?: string;
  expectedAmountMinorUnits?: number;
  expectedCurrency?: StandardCurrency;
  organizationId?: string;
}

export interface TransactionVerificationResult {
  verified: boolean;
  paymentStatus: AuthoritativePaymentStatus;
  status: ProviderCapabilityStatus;
  orderTrackingId: string;
  merchantReference: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  paymentMethod?: string;
  confirmationCode?: string;
  discrepancies: string[];
  verificationTimestamp: string;
  errorMessage?: string;
  rawResponse?: any;
}

export interface RegisterIpnRequest {
  url: string;
  ipnNotificationType: 'GET' | 'POST';
}

export interface RegisterIpnResult {
  status: ProviderCapabilityStatus;
  ipnId?: string;
  url: string;
  notificationType: string;
  rawResponse?: any;
  errorMessage?: string;
}

export interface ProcessNotificationResult {
  status: ProviderCapabilityStatus;
  orderTrackingId?: string;
  merchantReference?: string;
  notificationType?: string;
  rawResponse?: any;
  ackPayload: Record<string, any>;
  errorMessage?: string;
}

export interface RefundRequest {
  originalOrderTrackingId: string;
  originalMerchantReference: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  reason: string;
  refundReference: string;
  initiatedBy: string;
  idempotencyKey: string;
}

export interface RefundResult {
  status: ProviderCapabilityStatus;
  refundReference: string;
  originalOrderTrackingId: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  message: string;
  providerResponseCode?: string;
  requiresManualSettlement?: boolean;
  timestamp: string;
}

export interface CancelPaymentRequest {
  orderTrackingId: string;
  merchantReference: string;
  reason: string;
}

export interface CancelPaymentResult {
  status: ProviderCapabilityStatus;
  orderTrackingId: string;
  merchantReference: string;
  message: string;
}

export interface SettlementInfoResult {
  status: ProviderCapabilityStatus;
  merchantReference: string;
  settlementDate?: string;
  settledAmountMinorUnits?: number;
  netFeeMinorUnits?: number;
  currency?: StandardCurrency;
  notes?: string;
}

export interface PayoutRequest {
  payoutId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  destinationType: 'BANK_ACCOUNT' | 'MOBILE_MONEY' | 'INTERNAL_WALLET';
  destinationAccount: string;
  bankCode?: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  reason: string;
  idempotencyKey: string;
  authorizedBy: string;
}

export interface PayoutResult {
  status: ProviderCapabilityStatus;
  payoutId: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  providerReference?: string;
  message: string;
  requiresManualSettlement: boolean;
  timestamp: string;
}

export interface PayoutStatusResult {
  status: ProviderCapabilityStatus;
  payoutId: string;
  state: PayoutLifecycleState;
  providerReference?: string;
  timestamp: string;
}

export interface ProviderHealthStatus {
  provider: string;
  configured: boolean;
  environment: PaymentExecutionEnvironment;
  authHealthy: boolean;
  authErrorMessage?: string;
  tokenExpiresAt?: string;
  registeredIpnId?: string;
  supportedCurrencies: StandardCurrency[];
  capabilities: {
    orderSubmission: boolean;
    statusQuery: boolean;
    ipnRegistration: boolean;
    automatedRefunds: boolean;
    automatedMarketplacePayouts: boolean;
    automatedBankTransfers?: boolean;
    manualBankReconciliation?: boolean;
  };
  notes: string;
}

// ============================================================================
// V29 UNIVERSAL ECONOMIC & PRICING ENGINE TYPES
// ============================================================================

export type PaymentChannelId = 'pesapal' | 'bank_transfer';

export type PricingModel =
  | 'FREE'
  | 'ONE_TIME'
  | 'SUBSCRIPTION'
  | 'USAGE_BASED'
  | 'TIERED'
  | 'PER_USER'
  | 'PER_WORKSPACE'
  | 'PER_ORGANIZATION'
  | 'PER_ITEM'
  | 'LICENSE'
  | 'SERVICE'
  | 'CUSTOM_ENTERPRISE';

export interface PriceConfiguration {
  priceId: string;
  productId: string;
  productTitle: string;
  pricingModel: PricingModel;
  amountMinorUnits: number; // in integer minor units (e.g. 2900 for $29.00)
  currency: StandardCurrency;
  billingInterval?: 'monthly' | 'annual' | 'quarterly' | 'usage';
  trialPeriodDays?: number;
  usageRules?: {
    metric: string;
    unitPriceMinorUnits: number;
    includedUnitsPerPeriod?: number;
  };
  taxRatePercent?: number;
  discountPercent?: number;
  commissionPercent: number; // Platform commission % (e.g. 15 for 15%)
  effectiveFrom: string;
  effectiveUntil?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'SCHEDULED';
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceSnapshot {
  priceId: string;
  version: number;
  pricingModel: PricingModel;
  unitPriceMinorUnits: number;
  currency: StandardCurrency;
  commissionPercent: number;
  taxRatePercent: number;
  discountPercent: number;
  snapshotTimestamp: string;
}

// ============================================================================
// V29 BANK TRANSFER TYPES
// ============================================================================

export type BankTransferReceivingMode = 'MODE_A_AUTOMATED_API' | 'MODE_B_MANUAL_RECONCILIATION';

export type BankTransferStatus =
  | 'PENDING_TRANSFER'
  | 'PENDING_VERIFICATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED';

export interface ReceivingBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string; // e.g. ****9876
  accountNumberRaw?: string; // sensitive; strictly restricted to backend
  branchCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  currency: StandardCurrency;
  isActive: boolean;
  instructions: string;
  verificationMode: BankTransferReceivingMode;
  verifiedAt: string;
}

export interface CreatorPayoutBankAccount {
  id: string;
  creatorEmail: string;
  creatorName: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  accountNumberRaw?: string;
  routingOrSwift?: string;
  currency: StandardCurrency;
  verified: boolean;
  addedAt: string;
  coolingOffEndsAt: string;
  isEligibleForPayout: boolean;
}

export interface BankTransferSubmission {
  id: string;
  orderId: string;
  orderNumber: string;
  merchantReference: string;
  bankTransferReference: string;
  senderName: string;
  senderBank?: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  receivingBankAccountId: string;
  proofFileUrl?: string;
  status: BankTransferStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ============================================================================
// V29 INVOICING & RECEIPTS
// ============================================================================

export interface ItemizedInvoice {
  invoiceId: string;
  invoiceNumber: string;
  orderId: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  sellerName: string;
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
  status: 'DRAFT' | 'ISSUED' | 'PAYMENT_REQUIRED' | 'PAID' | 'VOID' | 'OVERDUE';
  paymentReference?: string;
  paymentChannel?: PaymentChannelId;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}

export interface PaymentReceipt {
  receiptId: string;
  receiptNumber: string;
  orderId: string;
  orderNumber: string;
  invoiceId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  provider: PaymentChannelId;
  transactionReference: string;
  confirmationCode?: string;
  amountMinorUnits: number;
  currency: StandardCurrency;
  paymentMethod: string;
  paidAt: string;
  issuedAt: string;
}

// ============================================================================
// V29 PAYOUT ELIGIBILITY & BATCHING
// ============================================================================

export interface PayoutEligibilityReport {
  creatorEmail: string;
  currency: StandardCurrency;
  totalGrossSalesMinor: number;
  platformCommissionMinor: number;
  netEarnedMinor: number;
  eligibleBalanceMinor: number;
  pendingPayoutsMinor: number;
  settledPayoutsMinor: number;
  passedRefundWindow: boolean;
  passedMinThreshold: boolean;
  kycVerified: boolean;
  bankAccountConfigured: boolean;
  bankAccountCoolingOffPassed: boolean;
  noActiveDisputes: boolean;
  isEligibleNow: boolean;
  ineligibilityReasons: string[];
}

export interface PayoutBatch {
  batchId: string;
  batchNumber: string;
  payoutIds: string[];
  totalAmountMinorUnits: number;
  currency: StandardCurrency;
  status: 'DRAFT' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  paymentChannel: PaymentChannelId;
  createdAt: string;
  approvedBy?: string;
  settledAt?: string;
  externalTransferRef?: string;
  reconciliationRef?: string;
}
