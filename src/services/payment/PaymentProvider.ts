/**
 * CATALYX Payment Architecture — Core PaymentProvider Interface
 * Abstracts external gateways to maintain provider independence.
 */

import {
  SubmitOrderRequest,
  SubmitOrderResult,
  TransactionStatusResult,
  TransactionVerificationRequest,
  TransactionVerificationResult,
  RegisterIpnRequest,
  RegisterIpnResult,
  ProcessNotificationResult,
  RefundRequest,
  RefundResult,
  CancelPaymentRequest,
  CancelPaymentResult,
  SettlementInfoResult,
  PayoutRequest,
  PayoutResult,
  PayoutStatusResult,
  ProviderHealthStatus,
  PaymentExecutionEnvironment
} from './paymentProvider.types';

export interface PaymentProvider {
  /**
   * Unique provider identifier (e.g., 'pesapal', 'bank_transfer', 'mobile_money')
   */
  getProviderId(): string;

  /**
   * Display name of the provider
   */
  getProviderName(): string;

  /**
   * Returns true if credentials and active parameters are configured
   */
  isConfigured(): boolean;

  /**
   * Active environment ('sandbox' or 'live')
   */
  getEnvironment(): PaymentExecutionEnvironment;

  /**
   * Submits an order intent to the external gateway
   */
  submitOrder(request: SubmitOrderRequest): Promise<SubmitOrderResult>;

  /**
   * Directly queries the provider for transaction status
   */
  getTransactionStatus(orderTrackingId: string): Promise<TransactionStatusResult>;

  /**
   * Authoritatively verifies transaction state, comparing amount, currency, and reference
   */
  verifyTransaction(request: TransactionVerificationRequest): Promise<TransactionVerificationResult>;

  /**
   * Registers an Instant Payment Notification (IPN) callback endpoint
   */
  registerNotificationEndpoint(request: RegisterIpnRequest): Promise<RegisterIpnResult>;

  /**
   * Ingests and parses raw webhook/IPN notifications
   */
  processNotification(payload: any, headers?: Record<string, string>): Promise<ProcessNotificationResult>;

  /**
   * Issues or registers a refund request against an original transaction
   */
  refundPayment(request: RefundRequest): Promise<RefundResult>;

  /**
   * Cancels a pending payment before user execution
   */
  cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResult>;

  /**
   * Retrieves provider settlement batch info
   */
  getSettlementInformation(merchantReference: string): Promise<SettlementInfoResult>;

  /**
   * Initiates creator or vendor payout
   */
  initiatePayout(request: PayoutRequest): Promise<PayoutResult>;

  /**
   * Queries status of an existing payout
   */
  getPayoutStatus(payoutId: string): Promise<PayoutStatusResult>;

  /**
   * Verifies configuration and reports diagnostic health
   */
  checkHealth(): Promise<ProviderHealthStatus>;
}
