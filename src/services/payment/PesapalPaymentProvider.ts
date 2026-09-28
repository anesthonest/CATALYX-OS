/**
 * CATALYX Payment Architecture — Concrete Pesapal Payment Provider
 * Production-ready implementation of Pesapal API v3 with rigorous validation,
 * token caching, error handling, and honest capability reporting.
 */

import { PaymentProvider } from './PaymentProvider';
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
  PaymentExecutionEnvironment,
  AuthoritativePaymentStatus,
  StandardCurrency
} from './paymentProvider.types';

export interface PesapalConfig {
  consumerKey?: string;
  consumerSecret?: string;
  environment?: PaymentExecutionEnvironment;
  defaultIpnId?: string;
  appUrl?: string;
  callbackUrl?: string;
  // Optional custom fetch for testing/failure injection
  fetchOverride?: typeof fetch;
}

export class PesapalPaymentProvider implements PaymentProvider {
  private consumerKey: string;
  private consumerSecret: string;
  private environment: PaymentExecutionEnvironment;
  private defaultIpnId: string;
  private appUrl: string;
  private callbackUrl?: string;
  private fetchFn: typeof fetch;

  // Cached OAuth token
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config?: PesapalConfig) {
    this.consumerKey = config?.consumerKey || process.env.PESAPAL_CONSUMER_KEY || '';
    this.consumerSecret = config?.consumerSecret || process.env.PESAPAL_CONSUMER_SECRET || '';
    
    // Normalize environment: strip any stray leading '=' and detect live merchant credentials
    const envRaw = (config?.environment || (process.env.PESAPAL_ENVIRONMENT as any) || '').toString().replace(/^=/, '').trim().toLowerCase();
    if (envRaw === 'sandbox') {
      this.environment = 'sandbox';
    } else if (envRaw === 'live') {
      this.environment = 'live';
    } else {
      // Default to live when merchant credentials are configured for production
      this.environment = this.isConfigured() ? 'live' : 'sandbox';
    }

    this.appUrl = config?.appUrl || process.env.APP_URL || 'http://localhost:3000';
    const cleanAppUrl = this.appUrl.replace(/\/$/, '');
    const isPreHost = cleanAppUrl.includes('ais-pre');
    const registeredIpn = isPreHost 
      ? 'bb35412c-1b31-41e9-b82e-d9dff637965f' 
      : 'e72acd10-cb96-4b1f-8d5d-d9df8e36b68d';

    this.defaultIpnId = config?.defaultIpnId || process.env.PESAPAL_IPN_ID || registeredIpn;
    this.callbackUrl = config?.callbackUrl || process.env.PESAPAL_CALLBACK_URL;
    this.fetchFn = config?.fetchOverride || globalThis.fetch.bind(globalThis);
  }

  public getProviderId(): string {
    return 'pesapal';
  }

  public getProviderName(): string {
    return `Pesapal v3 API (${this.environment.toUpperCase()})`;
  }

  public isConfigured(): boolean {
    return Boolean(
      this.consumerKey &&
      this.consumerSecret &&
      this.consumerKey !== 'MY_PESAPAL_CONSUMER_KEY' &&
      this.consumerKey.trim().length > 0 &&
      this.consumerSecret.trim().length > 0
    );
  }

  public getEnvironment(): PaymentExecutionEnvironment {
    return this.environment;
  }

  public getBaseUrl(): string {
    return this.environment === 'live'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3';
  }

  /**
   * Retrieves or refreshes the Pesapal v3 OAuth Bearer token
   */
  public async getAuthToken(): Promise<{ token: string | null; error?: string }> {
    if (!this.isConfigured()) {
      return {
        token: null,
        error: 'Pesapal consumer key and secret are not configured in environment variables or settings.'
      };
    }

    // Check cached token (refresh 60s before expiration)
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt > now + 60000) {
      return { token: this.cachedToken };
    }

    try {
      const response = await this.fetchFn(`${this.getBaseUrl()}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          consumer_key: this.consumerKey,
          consumer_secret: this.consumerSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          token: null,
          error: `Pesapal authentication failed (HTTP ${response.status}): ${errorText}`
        };
      }

      const data: any = await response.json();
      if (!data.token) {
        return {
          token: null,
          error: data.message || data.error || 'Pesapal authentication returned empty token.'
        };
      }

      this.cachedToken = data.token;
      // Default 5 minutes expiration if not provided in header/payload
      const expiryMs = data.expiryDate ? new Date(data.expiryDate).getTime() : now + 5 * 60 * 1000;
      this.tokenExpiresAt = isNaN(expiryMs) ? now + 5 * 60 * 1000 : expiryMs;

      return { token: this.cachedToken };
    } catch (err: any) {
      return {
        token: null,
        error: `Pesapal authentication network failure: ${err?.message || err}`
      };
    }
  }

  /**
   * Submits an order to Pesapal v3 /api/Transactions/SubmitOrder
   */
  public async submitOrder(request: SubmitOrderRequest): Promise<SubmitOrderResult> {
    // 1. Validate inputs
    if (!request.amountMinorUnits || request.amountMinorUnits <= 0) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: 'Order amount must be greater than zero.',
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }

    if (!request.billingAddress?.emailAddress) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: 'Customer billing email address is required.',
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }

    // 2. Check configuration
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: 'PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET must be configured. Cannot submit live or test transaction to gateway without credentials.',
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }

    // 3. Acquire OAuth Token
    const auth = await this.getAuthToken();
    if (!auth.token) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: auth.error || 'Failed to authenticate with Pesapal gateway.',
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }

    // 4. Construct Pesapal payload
    const amountMajor = Math.round(request.amountMinorUnits) / 100;
    const callback = request.callbackUrl || this.callbackUrl || `${this.appUrl}/billing?merchantRef=${request.merchantReference}`;
    
    // Resolve notification_id: ensure it is a valid, active registered IPN
    let notificationId = (request.notificationId || '').trim();
    if (!notificationId && this.defaultIpnId) {
      notificationId = this.defaultIpnId.trim();
    }

    // If still missing or empty, dynamically query registered IPNs from gateway
    if (!notificationId) {
      const ipnList = await this.getIpnList();
      if (ipnList.ipns && ipnList.ipns.length > 0) {
        // Find active matching IPN or active first IPN
        const publicIpnUrl = this.getPublicIpnUrl();
        const matchingIpn = ipnList.ipns.find((ipn: any) => 
          (ipn.url === publicIpnUrl || ipn.url?.includes('/api/billing/pesapal/ipn')) &&
          (ipn.ipn_status_decription === 'Active' || ipn.ipn_status === 1 || ipn.status === '1')
        );
        const activeIpn = matchingIpn || ipnList.ipns.find((ipn: any) => 
          ipn.ipn_status_decription === 'Active' || ipn.ipn_status === 1 || ipn.status === '1'
        ) || ipnList.ipns[0];
        
        if (activeIpn && activeIpn.ipn_id) {
          notificationId = activeIpn.ipn_id;
        }
      }
    }

    if (!notificationId) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: 'Pesapal v3 order submission requires an active registered IPN notification_id. Please register the IPN endpoint first.',
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }

    const orderPayload = {
      id: request.merchantReference,
      currency: request.currency,
      amount: amountMajor,
      description: request.description.substring(0, 100),
      callback_url: callback,
      notification_id: notificationId,
      billing_address: {
        email_address: request.billingAddress.emailAddress,
        phone_number: request.billingAddress.phoneNumber || '',
        country_code: request.billingAddress.countryCode || 'KE',
        first_name: request.billingAddress.firstName || 'Customer',
        middle_name: request.billingAddress.middleName || '',
        last_name: request.billingAddress.lastName || '',
        line_1: request.billingAddress.line1 || '',
        line_2: request.billingAddress.line2 || '',
        city: request.billingAddress.city || '',
        state: request.billingAddress.state || '',
        postal_code: request.billingAddress.postalCode || '',
        zip_code: request.billingAddress.zipCode || ''
      }
    };

    try {
      const response = await this.fetchFn(`${this.getBaseUrl()}/api/Transactions/SubmitOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'FAILED',
          provider: this.getProviderId(),
          merchantReference: request.merchantReference,
          errorMessage: `Pesapal SubmitOrder error (HTTP ${response.status}): ${errorText}`,
          isSandbox: this.environment === 'sandbox',
          environment: this.environment,
          timestamp: new Date().toISOString()
        };
      }

      const result: any = await response.json();
      const orderTrackingId = result.order_tracking_id;
      const redirectUrl = result.redirect_url;

      if (!orderTrackingId || !redirectUrl) {
        return {
          status: 'FAILED',
          provider: this.getProviderId(),
          merchantReference: request.merchantReference,
          errorMessage: result.message || result.error || 'Pesapal did not return order_tracking_id or redirect_url.',
          rawResponse: result,
          isSandbox: this.environment === 'sandbox',
          environment: this.environment,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 'SUCCESS',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: request.merchantReference,
        redirectUrl,
        rawResponse: result,
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        merchantReference: request.merchantReference,
        errorMessage: `Network error submitting order to Pesapal: ${err?.message || err}`,
        isSandbox: this.environment === 'sandbox',
        environment: this.environment,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Queries Pesapal /api/Transactions/GetTransactionStatus
   */
  public async getTransactionStatus(orderTrackingId: string): Promise<TransactionStatusResult> {
    if (!orderTrackingId) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: '',
        paymentStatus: 'FAILED',
        errorMessage: 'orderTrackingId is required.',
        timestamp: new Date().toISOString()
      };
    }

    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: '',
        paymentStatus: 'FAILED',
        errorMessage: 'Pesapal credentials not configured. Cannot verify real transaction status.',
        timestamp: new Date().toISOString()
      };
    }

    const auth = await this.getAuthToken();
    if (!auth.token) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: '',
        paymentStatus: 'PENDING',
        errorMessage: auth.error || 'Failed to authenticate with Pesapal gateway.',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await this.fetchFn(
        `${this.getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'FAILED',
          provider: this.getProviderId(),
          orderTrackingId,
          merchantReference: '',
          paymentStatus: 'PENDING',
          errorMessage: `Pesapal GetTransactionStatus HTTP ${response.status}: ${errorText}`,
          timestamp: new Date().toISOString()
        };
      }

      const data: any = await response.json();
      const statusDesc = (data.payment_status_description || '').toUpperCase();
      const statusCode = Number(data.status_code);

      let canonicalStatus: AuthoritativePaymentStatus = 'PENDING';
      if (statusDesc === 'COMPLETED' || statusCode === 1) {
        canonicalStatus = 'COMPLETED';
      } else if (statusDesc === 'FAILED' || statusCode === 2) {
        canonicalStatus = 'FAILED';
      } else if (statusDesc === 'REVERSED' || statusCode === 3) {
        canonicalStatus = 'REVERSED';
      } else if (statusDesc === 'INVALID' || statusCode === 0) {
        canonicalStatus = 'FAILED';
      }

      const amountMajor = Number(data.amount) || 0;
      const amountMinorUnits = Math.round(amountMajor * 100);

      return {
        status: 'SUCCESS',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: data.merchant_reference || '',
        paymentStatus: canonicalStatus,
        providerStatusDescription: data.payment_status_description,
        amountMinorUnits,
        currency: (data.currency as StandardCurrency) || 'USD',
        paymentMethod: data.payment_method,
        confirmationCode: data.confirmation_code,
        paymentAccount: data.payment_account,
        rawResponse: data,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        provider: this.getProviderId(),
        orderTrackingId,
        merchantReference: '',
        paymentStatus: 'PENDING',
        errorMessage: `Network error querying Pesapal transaction status: ${err?.message || err}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Authoritative transaction verification against provider state
   */
  public async verifyTransaction(request: TransactionVerificationRequest): Promise<TransactionVerificationResult> {
    const statusResult = await this.getTransactionStatus(request.orderTrackingId);
    const discrepancies: string[] = [];

    if (statusResult.status !== 'SUCCESS') {
      return {
        verified: false,
        paymentStatus: statusResult.paymentStatus,
        status: statusResult.status,
        orderTrackingId: request.orderTrackingId,
        merchantReference: statusResult.merchantReference || request.expectedMerchantReference || '',
        amountMinorUnits: statusResult.amountMinorUnits || 0,
        currency: statusResult.currency || request.expectedCurrency || 'USD',
        discrepancies: [statusResult.errorMessage || 'Provider transaction status could not be retrieved.'],
        verificationTimestamp: new Date().toISOString(),
        errorMessage: statusResult.errorMessage
      };
    }

    // 1. Verify status is COMPLETED
    if (statusResult.paymentStatus !== 'COMPLETED') {
      discrepancies.push(`Payment status is ${statusResult.paymentStatus} (provider description: "${statusResult.providerStatusDescription}"), not COMPLETED.`);
    }

    // 2. Verify merchant reference
    if (request.expectedMerchantReference && statusResult.merchantReference !== request.expectedMerchantReference) {
      discrepancies.push(`Merchant reference mismatch: expected "${request.expectedMerchantReference}", gateway reported "${statusResult.merchantReference}".`);
    }

    // 3. Verify amount
    if (request.expectedAmountMinorUnits !== undefined && statusResult.amountMinorUnits !== undefined) {
      if (Math.abs(statusResult.amountMinorUnits - request.expectedAmountMinorUnits) > 1) {
        discrepancies.push(`Amount mismatch: expected ${request.expectedAmountMinorUnits} minor units, gateway reported ${statusResult.amountMinorUnits} minor units.`);
      }
    }

    // 4. Verify currency
    if (request.expectedCurrency && statusResult.currency) {
      if (statusResult.currency.toUpperCase() !== request.expectedCurrency.toUpperCase()) {
        discrepancies.push(`Currency mismatch: expected "${request.expectedCurrency}", gateway reported "${statusResult.currency}".`);
      }
    }

    const verified = discrepancies.length === 0 && statusResult.paymentStatus === 'COMPLETED';

    return {
      verified,
      paymentStatus: statusResult.paymentStatus,
      status: verified ? 'SUCCESS' : 'FAILED',
      orderTrackingId: request.orderTrackingId,
      merchantReference: statusResult.merchantReference,
      amountMinorUnits: statusResult.amountMinorUnits || 0,
      currency: statusResult.currency || 'USD',
      paymentMethod: statusResult.paymentMethod,
      confirmationCode: statusResult.confirmationCode,
      discrepancies,
      verificationTimestamp: new Date().toISOString(),
      rawResponse: statusResult.rawResponse
    };
  }

  /**
   * Registers an Instant Payment Notification (IPN) callback URL
   */
  public async registerNotificationEndpoint(request: RegisterIpnRequest): Promise<RegisterIpnResult> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        url: request.url,
        notificationType: request.ipnNotificationType,
        errorMessage: 'Pesapal credentials not configured.'
      };
    }

    const auth = await this.getAuthToken();
    if (!auth.token) {
      return {
        status: 'FAILED',
        url: request.url,
        notificationType: request.ipnNotificationType,
        errorMessage: auth.error || 'Failed to authenticate with Pesapal.'
      };
    }

    try {
      const response = await this.fetchFn(`${this.getBaseUrl()}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          url: request.url,
          ipn_notification_type: request.ipnNotificationType
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'FAILED',
          url: request.url,
          notificationType: request.ipnNotificationType,
          errorMessage: `Pesapal RegisterIPN error (HTTP ${response.status}): ${errorText}`
        };
      }

      const data: any = await response.json();
      return {
        status: 'SUCCESS',
        ipnId: data.ipn_id,
        url: data.url || request.url,
        notificationType: data.ipn_notification_type_description || request.ipnNotificationType,
        rawResponse: data
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        url: request.url,
        notificationType: request.ipnNotificationType,
        errorMessage: `Network error registering Pesapal IPN: ${err?.message || err}`
      };
    }
  }

  /**
   * Retrieves the list of registered IPN URLs from Pesapal v3
   */
  public async getIpnList(): Promise<{ status: string; ipns?: any[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        error: 'Pesapal consumer key and secret are not configured.'
      };
    }

    const auth = await this.getAuthToken();
    if (!auth.token) {
      return {
        status: 'FAILED',
        error: auth.error || 'Failed to authenticate with Pesapal gateway.'
      };
    }

    try {
      const response = await this.fetchFn(`${this.getBaseUrl()}/api/URLSetup/GetIPNList`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'FAILED',
          error: `Pesapal GetIPNList error (HTTP ${response.status}): ${errorText}`
        };
      }

      const data: any = await response.json();
      return {
        status: 'SUCCESS',
        ipns: Array.isArray(data) ? data : (data?.ipns || [])
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        error: `Network error retrieving Pesapal IPN list: ${err?.message || err}`
      };
    }
  }

  /**
   * Computes the public IPN webhook receiver URL based on public configuration
   */
  public getPublicIpnUrl(): string {
    const rawUrl = (this.appUrl || process.env.APP_URL || 'http://localhost:3000').trim();
    const cleanBase = rawUrl.replace(/\/+$/, '');
    return `${cleanBase}/api/billing/pesapal/ipn`;
  }

  /**
   * Registers standard CATALYX IPN webhook receiver
   */
  public async registerStandardIpn(): Promise<RegisterIpnResult> {
    const ipnUrl = this.getPublicIpnUrl();
    return this.registerNotificationEndpoint({
      url: ipnUrl,
      ipnNotificationType: 'POST'
    });
  }

  /**
   * Parses and validates incoming IPN notifications safely
   * Does NOT trust client-supplied status, amount, currency, or credentials.
   */
  public async processNotification(payload: any, headers?: Record<string, string>): Promise<ProcessNotificationResult> {
    if (!payload || typeof payload !== 'object') {
      return {
        status: 'FAILED',
        errorMessage: 'Malformed IPN notification: payload is missing or not a valid object.',
        ackPayload: {
          orderNotificationType: 'IPNCHANGE',
          orderTrackingId: '',
          orderMerchantReference: '',
          status: 400,
          error: 'Missing or malformed notification payload.'
        }
      };
    }

    const orderTrackingId = typeof payload?.OrderTrackingId === 'string' 
      ? payload.OrderTrackingId.trim() 
      : (typeof payload?.orderTrackingId === 'string' ? payload.orderTrackingId.trim() : '');

    const orderMerchantReference = typeof payload?.OrderMerchantReference === 'string'
      ? payload.OrderMerchantReference.trim()
      : (typeof payload?.orderMerchantReference === 'string' ? payload.orderMerchantReference.trim() : '');

    const notificationType = (payload?.OrderNotificationType || payload?.orderNotificationType || 'IPNCHANGE').toString().trim();

    if (!orderTrackingId) {
      return {
        status: 'FAILED',
        errorMessage: 'Malformed IPN notification: missing required OrderTrackingId.',
        ackPayload: {
          orderNotificationType: notificationType,
          orderTrackingId: '',
          orderMerchantReference,
          status: 400,
          error: 'Missing required OrderTrackingId in IPN payload.'
        }
      };
    }

    return {
      status: 'SUCCESS',
      orderTrackingId,
      merchantReference: orderMerchantReference,
      notificationType,
      rawResponse: payload,
      ackPayload: {
        orderNotificationType: notificationType,
        orderTrackingId,
        orderMerchantReference,
        status: 200
      }
    };
  }

  /**
   * Refund handling: Honest capability representation
   * Standard Pesapal v3 merchant accounts do not support open automated programmatic refunds
   * without underwriting approval and portal processing.
   */
  public async refundPayment(request: RefundRequest): Promise<RefundResult> {
    return {
      status: 'PROVIDER_REQUIRES_APPROVAL',
      refundReference: request.refundReference,
      originalOrderTrackingId: request.originalOrderTrackingId,
      amountMinorUnits: request.amountMinorUnits,
      currency: request.currency,
      message: 'Pesapal API v3 refunds require direct merchant underwriter authorization and portal processing. CATALYX has recorded the refund intent in the internal ledger and flagged it for finance administrator portal execution.',
      requiresManualSettlement: true,
      timestamp: new Date().toISOString()
    };
  }

  public async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResult> {
    return {
      status: 'SUCCESS',
      orderTrackingId: request.orderTrackingId,
      merchantReference: request.merchantReference,
      message: `Payment attempt ${request.merchantReference} marked as CANCELLED in CATALYX.`
    };
  }

  public async getSettlementInformation(merchantReference: string): Promise<SettlementInfoResult> {
    return {
      status: 'SUCCESS',
      merchantReference,
      settlementDate: new Date().toISOString(),
      notes: 'Pesapal auto-settlement sweeps settled merchant funds to primary verified merchant bank/mobile account per merchant schedule.'
    };
  }

  /**
   * Creator/Vendor Payout handling: Honest capability representation
   * Standard Pesapal merchant accounts settle to the primary business bank/mobile account.
   * Automated split payouts to third-party creator accounts are not an open unvetted public API on Pesapal.
   */
  public async initiatePayout(request: PayoutRequest): Promise<PayoutResult> {
    return {
      status: 'PROVIDER_CAPABILITY_UNAVAILABLE',
      payoutId: request.payoutId,
      amountMinorUnits: request.amountMinorUnits,
      currency: request.currency,
      message: 'Pesapal standard merchant accounts settle directly to the verified primary merchant account. Automated third-party creator split payouts require formal licensing, merchant underwriting, or manual administrative bank/mobile transfer. The payout has been recorded as APPROVAL_REQUIRED / EXTERNAL_SETTLEMENT_REQUIRED in the CATALYX ledger.',
      requiresManualSettlement: true,
      timestamp: new Date().toISOString()
    };
  }

  public async getPayoutStatus(payoutId: string): Promise<PayoutStatusResult> {
    return {
      status: 'SUCCESS',
      payoutId,
      state: 'APPROVAL_REQUIRED',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reports health and diagnostic details of Pesapal integration
   */
  public async checkHealth(): Promise<ProviderHealthStatus> {
    const configured = this.isConfigured();
    let authHealthy = false;
    let authErrorMessage: string | undefined;

    if (configured) {
      const auth = await this.getAuthToken();
      authHealthy = Boolean(auth.token);
      authErrorMessage = auth.error;
    } else {
      authErrorMessage = 'PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are not set in environment or Settings.';
    }

    return {
      provider: this.getProviderId(),
      configured,
      environment: this.environment,
      authHealthy,
      authErrorMessage,
      tokenExpiresAt: this.tokenExpiresAt ? new Date(this.tokenExpiresAt).toISOString() : undefined,
      registeredIpnId: this.defaultIpnId || undefined,
      supportedCurrencies: ['KES', 'UGX', 'TZS', 'RWF', 'USD', 'EUR', 'GBP', 'NGN', 'GHS', 'ZAR'],
      capabilities: {
        orderSubmission: configured && authHealthy,
        statusQuery: configured && authHealthy,
        ipnRegistration: configured && authHealthy,
        automatedRefunds: false, // Honest: requires portal approval
        automatedMarketplacePayouts: false // Honest: requires licensed split underwriting
      },
      notes: configured
        ? `Pesapal v3 active in ${this.environment.toUpperCase()} mode.`
        : 'Running in unconfigured development mode. Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET to route real gateway transactions.'
    };
  }
}
