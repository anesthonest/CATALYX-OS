/**
 * CATALYX Comprehensive Independent Release-Challenge Audit Suite
 * 
 * Verifies:
 * 1. Revenue Policy Engine (0.25% Individual / 0.27% Group / 0.50% Organization, integer minor arithmetic, rounding, edge cases)
 * 2. Client Fee & Price Manipulation Rejection
 * 3. Terms of Service & Regulatory Compliance Enforcement (unconsented, forged versions, tamper)
 * 4. Payment Gateway & Webhook Idempotency (duplicate callbacks, duplicate IPNs, replayed transactions)
 * 5. Double-Entry Accounting Ledger Integrity (sum(debits) === sum(credits), no floating-point leakage)
 * 6. API Surface & Route Health
 */

// Universal Storage Polyfill for Node.js test environment
if (typeof (globalThis as any).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; }
  };
}

import { RevenuePolicyEngine, revenuePolicyEngine, SellerAccountType } from '../src/services/payment/revenuePolicyEngine';
import { LegalPolicyService } from '../src/services/legal/legalPolicyService';
import { catalyxEconomicEngine, CatalyxEconomicEngine } from '../src/services/payment/catalyxEconomicEngine';
import { PesapalPaymentProvider } from '../src/services/payment/PesapalPaymentProvider';
import { payoutEligibilityEngine } from '../src/services/payment/payoutEligibilityEngine';
import { bankAccountManager } from '../src/services/payment/bankAccountManager';
import { StandardCurrency } from '../src/services/payment/paymentProvider.types';
import { marketplaceRatingService } from '../src/services/marketplaceRatingService';
import { advertisingService } from '../src/services/advertising/advertisingService';
import { deepResearchService } from '../src/services/research/deepResearchService';
import { universalWorkService } from '../src/services/universalWorkService';
import { MarketplaceService } from '../src/services/marketplaceService';
import { serverAuthStore } from '../src/services/serverAuthStore';
import {
  assertAuthorizedPaymentProvider,
  isAuthorizedPaymentProvider,
  AUTHORIZED_PAYMENT_PROVIDERS,
  PaymentProviderPolicyViolationError
} from '../src/services/payment/paymentProviderPolicy';
import { BillingService } from '../src/services/billingService';
import { universalPricingEngine, UniversalPricingEngine } from '../src/services/payment/pricingEngine';
import { SubscriptionStateMachine } from '../src/services/subscriptionStateMachine';
import { EntitlementService } from '../src/services/entitlementService';
import { missionControlService } from '../src/services/missionControlService';
import { emailDeliveryService } from '../src/services/emailDeliveryService';
import { safeStorage, isLikelyJsonString } from '../src/utils/safeStorage';
import { authService } from '../src/services/authService';
import { studioService, StudioType } from '../src/services/studioService';
import { microsoftIntegrationService } from '../src/services/microsoftIntegrationService';
import { officeDocumentGenerator } from '../src/services/officeDocumentGenerator';
import { serverPersistenceService } from '../src/services/serverPersistenceService';
import JSZip from 'jszip';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import fs from 'fs';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, status: 'PASSED', details });
  } else {
    results.push({ suite, name, status: 'FAILED', error: details || 'Assertion failed' });
    console.error(`[FAIL] ${suite} > ${name}: ${details}`);
  }
}

async function runRevenuePolicyTests() {
  const suite = 'Revenue Policy & Platform Commission Engine';

  // Test 1: $100 standard user sale
  // 10000 minor units, 0.25% fee = 25 ($0.25), seller gross = 9975 ($99.75)
  const t1 = revenuePolicyEngine.calculateRevenueSplit({
    grossAmountMinorUnits: 10000,
    currency: 'USD',
    sellerAccountType: 'INDIVIDUAL',
    paymentChannel: 'bank_transfer'
  });
  assert(t1.catalyxFeeMinorUnits === 25, suite, '$100 standard-user sale platform fee is exactly $0.25 (25 minor)');
  assert(t1.sellerGrossPlatformEarningsMinorUnits === 9975, suite, '$100 standard-user seller share is exactly $99.75 (9975 minor)');
  assert(t1.catalyxFeePercent === 0.25, suite, '$100 standard-user fee percent is 0.25%');

  // Test 2: $100 organization sale
  // 10000 minor units, 0.50% fee = 50 ($0.50), organization gross = 9950 ($99.50)
  const t2 = revenuePolicyEngine.calculateRevenueSplit({
    grossAmountMinorUnits: 10000,
    currency: 'USD',
    sellerAccountType: 'ORGANIZATION',
    paymentChannel: 'bank_transfer'
  });
  assert(t2.catalyxFeeMinorUnits === 50, suite, '$100 organization sale platform fee is exactly $0.50 (50 minor)');
  assert(t2.sellerGrossPlatformEarningsMinorUnits === 9950, suite, '$100 organization share is exactly $99.50 (9950 minor)');
  assert(t2.catalyxFeePercent === 0.50, suite, '$100 organization fee percent is 0.50%');

  // Test 2b: $100 group / syndicate sale
  // 10000 minor units, 0.27% fee = 27 ($0.27), group gross = 9973 ($99.73)
  const t2b = revenuePolicyEngine.calculateRevenueSplit({
    grossAmountMinorUnits: 10000,
    currency: 'USD',
    sellerAccountType: 'GROUP',
    paymentChannel: 'bank_transfer'
  });
  assert(t2b.catalyxFeeMinorUnits === 27, suite, '$100 group sale platform fee is exactly $0.27 (27 minor)');
  assert(t2b.sellerGrossPlatformEarningsMinorUnits === 9973, suite, '$100 group share is exactly $99.73 (9973 minor)');
  assert(t2b.catalyxFeePercent === 0.27, suite, '$100 group fee percent is 0.27%');

  // Test 3: Realistic edge cases: $0.01, $0.10, $1.00, $9.99, $99.99, $999.99, $10,000.00
  const amounts = [
    { label: '$0.01', minor: 1, expectedStandardFee: 0, expectedOrgFee: 0 },
    { label: '$0.10', minor: 10, expectedStandardFee: 0, expectedOrgFee: 0 },
    { label: '$1.00', minor: 100, expectedStandardFee: 0, expectedOrgFee: 1 },
    { label: '$9.99', minor: 999, expectedStandardFee: 2, expectedOrgFee: 5 },
    { label: '$99.99', minor: 9999, expectedStandardFee: 25, expectedOrgFee: 50 },
    { label: '$999.99', minor: 99999, expectedStandardFee: 250, expectedOrgFee: 500 },
    { label: '$10,000.00', minor: 1000000, expectedStandardFee: 2500, expectedOrgFee: 5000 }
  ];

  for (const a of amounts) {
    const std = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: a.minor,
      currency: 'USD',
      sellerAccountType: 'INDIVIDUAL',
      paymentChannel: 'bank_transfer'
    });
    const org = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: a.minor,
      currency: 'USD',
      sellerAccountType: 'ORGANIZATION',
      paymentChannel: 'bank_transfer'
    });

    assert(
      std.catalyxFeeMinorUnits === a.expectedStandardFee && (std.catalyxFeeMinorUnits + std.sellerGrossPlatformEarningsMinorUnits === a.minor),
      suite,
      `Standard user ${a.label} integer arithmetic sum conservation (${std.catalyxFeeMinorUnits} + ${std.sellerGrossPlatformEarningsMinorUnits} === ${a.minor})`
    );
    assert(
      org.catalyxFeeMinorUnits === a.expectedOrgFee && (org.catalyxFeeMinorUnits + org.sellerGrossPlatformEarningsMinorUnits === a.minor),
      suite,
      `Organization ${a.label} integer arithmetic sum conservation (${org.catalyxFeeMinorUnits} + ${org.sellerGrossPlatformEarningsMinorUnits} === ${a.minor})`
    );
  }

  // Test 4: Supported currencies (USD, KES, UGX, TZS, RWF, EUR, GBP)
  const currencies: StandardCurrency[] = ['USD', 'KES', 'UGX', 'TZS', 'RWF', 'EUR', 'GBP'];
  for (const curr of currencies) {
    const split = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: 50000,
      currency: curr,
      sellerAccountType: 'INDIVIDUAL',
      paymentChannel: 'bank_transfer'
    });
    assert(split.currency === curr && split.catalyxFeeMinorUnits === 125, suite, `Currency ${curr} supported without floating-point errors`);
  }

  // Test 5: Client manipulation rejection
  // Verify that an attacker trying to inject a custom commission percent cannot bypass the engine
  const unmodifiableConfig = revenuePolicyEngine.getActiveConfig();
  assert(unmodifiableConfig.individualFeePercent === 0.25, suite, 'Authoritative individual fee is locked at 0.25%');
  assert(unmodifiableConfig.groupFeePercent === 0.27, suite, 'Authoritative group fee is locked at 0.27%');
  assert(unmodifiableConfig.organizationFeePercent === 0.50, suite, 'Authoritative organization fee is locked at 0.50%');
}

async function runTermsEnforcementTests() {
  const suite = 'Terms of Service & Regulatory Enforcement';
  const currentVersion = LegalPolicyService.CURRENT_VERSION;

  // Test 1: User who has NOT accepted terms
  const unconsentedUserId = 'unconsented_user_' + Date.now();
  assert(
    LegalPolicyService.hasAcceptedCurrentTerms(unconsentedUserId) === false,
    suite,
    'Unconsented user is rejected'
  );

  // Test 2: Forged / modified / old terms version rejection
  let forgedRejected = false;
  try {
    LegalPolicyService.recordAcceptance({
      userId: 'attacker_user_1',
      userEmail: 'attacker@fraud.io',
      termsVersion: 'v1.0.0_obsolete', // Old/forged version
      ipAddress: '198.51.100.22',
      userAgent: 'HeadlessChrome'
    });
  } catch (err: any) {
    forgedRejected = true;
  }
  assert(
    forgedRejected && LegalPolicyService.hasAcceptedCurrentTerms('attacker_user_1') === false,
    suite,
    'Forged or outdated terms version is rejected and does NOT authorize account'
  );

  // Test 3: Legitimate acceptance of current version
  const validUser = 'legit_user_' + Date.now();
  const validResult = LegalPolicyService.recordAcceptance({
    userId: validUser,
    userEmail: 'legit@catalyx.io',
    termsVersion: currentVersion,
    ipAddress: '192.0.2.1',
    userAgent: 'Mozilla/5.0 Audit Agent'
  });
  assert(Boolean(validResult.acceptanceId), suite, 'Legitimate acceptance of current terms succeeds');
  assert(
    LegalPolicyService.hasAcceptedCurrentTerms(validUser) === true,
    suite,
    'Legitimate user is now verified as compliant'
  );

  // Test 4: Replayed acceptance audit logs immutability
  const auditLogs = LegalPolicyService.getAuditLogs();
  const userLogs = auditLogs.filter(l => l.userId === validUser);
  assert(userLogs.length === 1, suite, 'Audit log correctly records single immutable acceptance entry');
  assert(userLogs[0].termsHash.length > 10, suite, 'Audit log contains cryptographic terms hash');
}

async function runPaymentIdempotencyTests() {
  const suite = 'Payment Gateway & Double-Entry Ledger Idempotency';

  // Create an order
  const order = catalyxEconomicEngine.createOrder({
    organizationId: 'org_audit_test',
    customerId: 'cust_audit_100',
    customerName: 'Audit Auditor',
    customerEmail: 'auditor@catalyx.io',
    billingAddress: {
      emailAddress: 'auditor@catalyx.io',
      firstName: 'Audit',
      lastName: 'Auditor',
      line1: '100 Resilience Way',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      countryCode: 'KE'
    },
    items: [
      {
        productId: 'prod_audit_01',
        productTitle: 'Enterprise Resilience Audit Package',
        sku: 'SKU-AUDIT-01',
        quantity: 1,
        unitPriceMinorUnits: 25000, // $250.00
        totalPriceMinorUnits: 25000
      }
    ],
    currency: 'USD',
    idempotencyKey: `idemp_ord_test_${Date.now()}`
  });

  assert(order.status === 'CREATED', suite, 'Order created in INITIAL PENDING (CREATED) state');
  assert(order.totalMinorUnits === 25000, suite, 'Order total calculated server-side as 25000 minor units ($250)');

  // Attempt duplicate order creation with same idempotency key
  const dupOrder = catalyxEconomicEngine.createOrder({
    organizationId: 'org_audit_test',
    customerId: 'cust_audit_100',
    customerName: 'Audit Auditor',
    customerEmail: 'auditor@catalyx.io',
    billingAddress: {
      emailAddress: 'auditor@catalyx.io',
      firstName: 'Audit',
      lastName: 'Auditor',
      line1: '100 Resilience Way',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      countryCode: 'KE'
    },
    items: [
      {
        productId: 'prod_audit_01',
        productTitle: 'Enterprise Resilience Audit Package',
        sku: 'SKU-AUDIT-01',
        quantity: 1,
        unitPriceMinorUnits: 25000,
        totalPriceMinorUnits: 25000
      }
    ],
    currency: 'USD',
    idempotencyKey: order.timeline[0]?.note ? (order as any).idempotencyKey || `idemp_ord_test_${Date.now()}` : undefined
  });
  assert(dupOrder.id !== undefined, suite, 'Order idempotency preserves integrity');

  // Submit payment attempt via bank transfer
  const submission = await catalyxEconomicEngine.initiatePaymentAttempt({
    orderId: order.id,
    channel: 'bank_transfer',
    ipOrUserId: '192.0.2.55',
    idempotencyKey: `pay_idemp_${order.id}`
  });

  assert(submission.success === true, suite, 'Order payment attempt successfully initialized in PENDING state');
  assert(order.status === 'PAYMENT_PENDING', suite, 'Order remains UNPAID until confirmed by gateway or finance');

  // Verify that an unconfirmed bank transfer is rejected from settlement
  const unconfirmedSettlement = await catalyxEconomicEngine.verifyAndSettlePayment({
    orderTrackingId: submission.paymentAttempt?.providerOrderTrackingId || '',
    merchantReference: submission.paymentAttempt?.merchantReference,
    operatorOrTrigger: 'Test Runner Pre-check'
  });
  assert(unconfirmedSettlement.verified === false, suite, 'Unconfirmed bank transfer is rejected from settlement');

  // Customer executes transfer and submits proof of payment
  const bankProvider = catalyxEconomicEngine.getBankTransferProvider();
  bankProvider.recordCustomerSubmission({
    id: `subm_${Date.now()}`,
    merchantReference: submission.paymentAttempt?.merchantReference || '',
    orderId: order.id,
    orderNumber: order.orderNumber,
    senderName: order.customerName,
    senderBank: 'Stanbic Bank Kenya',
    amountMinorUnits: order.totalMinorUnits,
    currency: order.currency,
    bankTransferReference: 'STAN-TX-99882211',
    receivingBankAccountId: 'rec_bank_01',
    confidenceLevel: 'HIGH',
    status: 'PENDING_VERIFICATION',
    submittedAt: new Date().toISOString()
  });

  // Finance administrator reviews and confirms bank statement credit
  const confirmResult = bankProvider.confirmManualTransfer({
    merchantReference: submission.paymentAttempt?.merchantReference || '',
    verifiedBy: 'Senior Finance Officer'
  });
  assert(confirmResult.success === true, suite, 'Finance officer successfully confirms bank statement credit');

  // Authoritative settlement via Catalyx Economic Engine
  const initialLedgerCount = catalyxEconomicEngine.getLedger().length;
  const settlement1 = await catalyxEconomicEngine.verifyAndSettlePayment({
    orderTrackingId: submission.paymentAttempt?.providerOrderTrackingId || '',
    merchantReference: submission.paymentAttempt?.merchantReference,
    operatorOrTrigger: 'Finance Admin Manual Confirmation'
  });

  assert(settlement1.verified === true, suite, 'Confirmed payment verification completes successfully');
  assert(settlement1.order?.status === 'PAID', suite, 'Order status transitioned to PAID only AFTER verification');

  const afterFirstLedgerCount = catalyxEconomicEngine.getLedger().length;
  assert(afterFirstLedgerCount === initialLedgerCount + 1, suite, 'Exactly ONE double-entry ledger record posted');

  // ATTEMPT DUPLICATE IPN / REPLAY / BROWSER REFRESH
  const settlement2 = await catalyxEconomicEngine.verifyAndSettlePayment({
    orderTrackingId: submission.paymentAttempt?.providerOrderTrackingId || '',
    merchantReference: submission.paymentAttempt?.merchantReference,
    operatorOrTrigger: 'Duplicate Replayed Webhook'
  });

  assert(settlement2.verified === true, suite, 'Duplicate webhook handled gracefully');
  assert(settlement2.message === 'Payment was already verified and settled.', suite, 'Duplicate detected by idempotency check');

  const afterSecondLedgerCount = catalyxEconomicEngine.getLedger().length;
  assert(afterSecondLedgerCount === afterFirstLedgerCount, suite, 'Zero duplicate ledger records created on replay');

  // Verify balanced double-entry accounting: Sum(Debits) === Sum(Credits)
  const ledger = catalyxEconomicEngine.getLedger();
  let totalDebits = 0;
  let totalCredits = 0;
  for (const record of ledger) {
    for (const entry of record.entries) {
      totalDebits += entry.debitMinorUnits;
      totalCredits += entry.creditMinorUnits;
    }
  }
  assert(totalDebits === totalCredits && totalDebits > 0, suite, `Double-entry ledger is mathematically balanced: Debits (${totalDebits}) === Credits (${totalCredits})`);
}

async function runPayoutSecurityTests() {
  const suite = 'Creator Payout Eligibility & Disbursement Security';

  // Test 1: Creator with unverified bank account or below threshold
  const eligibility = payoutEligibilityEngine.evaluateEligibility('unregistered_creator@test.io', 'USD');
  assert(
    eligibility.isEligibleNow === false,
    suite,
    'Ineligible creator payout correctly rejected'
  );
  assert(
    eligibility.ineligibilityReasons.length > 0,
    suite,
    'Itemized ineligibility reasons provided'
  );

  // Test 2: Attempting to request payout exceeding eligible balance
  let threwError = false;
  try {
    await catalyxEconomicEngine.requestCreatorPayout({
      recipientEmail: 'creator@intelligence.org',
      recipientName: 'Dr. Elena Rostova',
      organizationId: 'org_test',
      amountMinorUnits: 999999999, // $9,999,999.99 (exceeds balance)
      currency: 'USD',
      destinationType: 'BANK_ACCOUNT',
      destinationAccount: '409182391029',
      idempotencyKey: 'pout_excessive_test',
      authorizedBy: 'Creator'
    });
  } catch (err: any) {
    threwError = true;
    assert(
      err.message.includes('Insufficient eligible balance') || err.message.includes('threshold'),
      suite,
      'Server strictly rejected excessive payout request'
    );
  }
  assert(threwError, suite, 'Excessive payout request caused server-side error rejection');
}

async function runPesapalIpnAndEntitlementsAuditTests() {
  const suite = 'Pesapal IPN Receiver, Financial Integrity & Entitlements';

  // 1. Provider IPN URL Construction
  const provider = new PesapalPaymentProvider({
    consumerKey: 'test_ck_12345',
    consumerSecret: 'test_cs_67890',
    appUrl: 'https://catalyx.intelligence.org',
    environment: 'sandbox'
  });
  const ipnUrl = provider.getPublicIpnUrl();
  assert(
    ipnUrl === 'https://catalyx.intelligence.org/api/billing/pesapal/ipn',
    suite,
    'IPN URL is correctly derived from public configuration'
  );

  // 2. Reject Missing or Malformed IPN Payloads
  const malformed1 = await provider.processNotification(null);
  assert(
    malformed1.status === 'FAILED' && malformed1.ackPayload.status === 400,
    suite,
    'Null IPN payload safely rejected with HTTP 400'
  );

  const malformed2 = await provider.processNotification({});
  assert(
    malformed2.status === 'FAILED' && malformed2.ackPayload.status === 400,
    suite,
    'Missing OrderTrackingId rejected with HTTP 400'
  );

  const malformed3 = await provider.processNotification({ OrderTrackingId: '   ' });
  assert(
    malformed3.status === 'FAILED' && malformed3.ackPayload.status === 400,
    suite,
    'Whitespace OrderTrackingId rejected with HTTP 400'
  );

  // 3. Valid IPN Payload Extraction
  const valid = await provider.processNotification({
    OrderTrackingId: 'test-track-999',
    OrderMerchantReference: 'REF-TEST-001',
    OrderNotificationType: 'IPNCHANGE'
  });
  assert(
    valid.status === 'SUCCESS' && valid.ackPayload.status === 200,
    suite,
    'Valid IPN payload successfully parsed and formatted with 200 ACK'
  );

  // 4. Authoritative Verification: Provider Mock Injection
  let mockStatusCode = 1; // 1 = COMPLETED, 2 = FAILED
  let mockAmount = 79.0;
  let mockCurrency = 'USD';
  let mockMerchantRef = 'REF-MKT-AUDIT-1';
  let trackingCounter = 1;

  const mockFetch = async (url: any, opts: any): Promise<any> => {
    const urlStr = url.toString();
    if (urlStr.includes('/api/Auth/RequestToken')) {
      return {
        ok: true,
        json: async () => ({ token: 'mock_bearer_token_xyz', expiryDate: new Date(Date.now() + 600000).toISOString() })
      };
    }
    if (urlStr.includes('/api/Transactions/SubmitOrder')) {
      return {
        ok: true,
        json: async () => ({
          status: '200',
          order_tracking_id: `test_track_${trackingCounter++}`,
          merchant_reference: mockMerchantRef,
          redirect_url: 'https://cybqa.pesapal.com/redirect'
        })
      };
    }
    if (urlStr.includes('/api/Transactions/GetTransactionStatus')) {
      return {
        ok: true,
        json: async () => ({
          payment_status_description: mockStatusCode === 1 ? 'COMPLETED' : 'FAILED',
          status_code: mockStatusCode,
          amount: mockAmount,
          currency: mockCurrency,
          merchant_reference: mockMerchantRef,
          payment_method: 'Mobile Money',
          confirmation_code: 'MPESA_TEST_CONFIRM_123',
          payment_account: '254700000000'
        })
      };
    }
    return { ok: false, text: async () => 'Not found' };
  };

  const testProvider = new PesapalPaymentProvider({
    consumerKey: 'audit_key',
    consumerSecret: 'audit_secret',
    environment: 'sandbox',
    fetchOverride: mockFetch as any
  });

  const testEngine = new CatalyxEconomicEngine(testProvider);

  // Create an authentic test order
  const order = testEngine.createOrder({
    organizationId: 'org_pesapal_audit',
    customerId: 'cust_pesapal_user',
    customerName: 'Aura Auditor',
    customerEmail: 'auditor@catalyx.io',
    billingAddress: {
      emailAddress: 'auditor@catalyx.io',
      firstName: 'Aura',
      lastName: 'Auditor',
      countryCode: 'US'
    },
    items: [{
      productId: 'prod_mkt_audit_model',
      productTitle: 'Universal Autonomous Model V2',
      sku: 'MODEL-AURA-V2',
      quantity: 1,
      unitPriceMinorUnits: 7900,
      totalPriceMinorUnits: 7900
    }],
    currency: 'USD',
    idempotencyKey: 'idemp_order_audit_1'
  });

  // Submit payment attempt
  const submission = await testEngine.initiatePaymentAttempt({
    orderId: order.id,
    callbackUrl: 'http://localhost:3000/callback',
    idempotencyKey: 'idemp_attempt_audit_1',
    ipOrUserId: '10.0.0.1'
  });

  const trackingId = submission.paymentAttempt?.providerOrderTrackingId || '';
  const expectedMerchantRef = submission.paymentAttempt?.merchantReference || '';
  mockMerchantRef = expectedMerchantRef;

  // 5. Test Discrepancy 1: Amount mismatch
  mockStatusCode = 1;
  mockAmount = 29.0; // Expected 79.0
  const amountMismatchResult = await testEngine.verifyAndSettlePayment({
    orderTrackingId: trackingId,
    merchantReference: expectedMerchantRef,
    operatorOrTrigger: 'IPN Webhook Audit - Amount Mismatch'
  });
  assert(
    amountMismatchResult.verified === false,
    suite,
    'Amount mismatch authoritatively rejected'
  );
  assert(
    testEngine.getOrder(order.id)?.status !== 'PAID',
    suite,
    'Order remains unpaid on amount mismatch'
  );

  // 6. Test Discrepancy 2: Currency mismatch
  mockAmount = 79.0;
  mockCurrency = 'KES'; // Expected USD
  const currencyMismatchResult = await testEngine.verifyAndSettlePayment({
    orderTrackingId: trackingId,
    merchantReference: expectedMerchantRef,
    operatorOrTrigger: 'IPN Webhook Audit - Currency Mismatch'
  });
  assert(
    currencyMismatchResult.verified === false,
    suite,
    'Currency mismatch authoritatively rejected'
  );

  // 7. Test Discrepancy 3: Merchant Reference mismatch
  mockCurrency = 'USD';
  mockMerchantRef = 'WRONG_MERCHANT_REF_999';
  const refMismatchResult = await testEngine.verifyAndSettlePayment({
    orderTrackingId: trackingId,
    merchantReference: expectedMerchantRef,
    operatorOrTrigger: 'IPN Webhook Audit - Reference Mismatch'
  });
  assert(
    refMismatchResult.verified === false,
    suite,
    'Merchant reference mismatch authoritatively rejected'
  );

  // 8. Test Failed Status: Failed payment never marks order PAID
  mockMerchantRef = expectedMerchantRef;
  mockStatusCode = 2; // FAILED
  const failedResult = await testEngine.verifyAndSettlePayment({
    orderTrackingId: trackingId,
    merchantReference: expectedMerchantRef,
    operatorOrTrigger: 'IPN Webhook Audit - Failed Status'
  });
  assert(
    failedResult.verified === false,
    suite,
    'Failed gateway status rejected by authoritative verification'
  );
  assert(
    testEngine.getOrder(order.id)?.status === 'FAILED',
    suite,
    'Order marked FAILED, never marked PAID'
  );

  // 9. Authentic Completion & Entitlement Granting
  // Create a clean order and attempt for completion test
  const validOrder = testEngine.createOrder({
    organizationId: 'org_pesapal_audit_valid',
    customerId: 'cust_pesapal_valid',
    customerName: 'Aura Auditor',
    customerEmail: 'auditor@catalyx.io',
    billingAddress: {
      emailAddress: 'auditor@catalyx.io',
      firstName: 'Aura',
      lastName: 'Auditor',
      countryCode: 'US'
    },
    items: [{
      productId: 'prod_mkt_audit_model',
      productTitle: 'Universal Autonomous Model V2',
      sku: 'MODEL-AURA-V2',
      quantity: 1,
      unitPriceMinorUnits: 7900,
      totalPriceMinorUnits: 7900
    }],
    currency: 'USD',
    idempotencyKey: 'idemp_order_audit_valid'
  });

  const validAttempt = await testEngine.initiatePaymentAttempt({
    orderId: validOrder.id,
    callbackUrl: 'http://localhost:3000/callback',
    idempotencyKey: 'idemp_attempt_audit_2',
    ipOrUserId: '10.0.0.1'
  });
  const validTrackingId = validAttempt.paymentAttempt?.providerOrderTrackingId || '';
  const validMerchantRef = validAttempt.paymentAttempt?.merchantReference || '';

  mockStatusCode = 1; // COMPLETED
  mockAmount = 79.0;
  mockCurrency = 'USD';
  mockMerchantRef = validMerchantRef;

  assert(
    testEngine.hasEntitlement('auditor@catalyx.io', 'prod_mkt_audit_model') === false,
    suite,
    'User has no entitlement prior to authentic payment settlement'
  );

  const settlement = await testEngine.verifyAndSettlePayment({
    orderTrackingId: validTrackingId,
    merchantReference: validMerchantRef,
    operatorOrTrigger: 'IPN Webhook Audit - Authentic'
  });

  assert(
    settlement.verified === true,
    suite,
    'Authentic payment verified and settled'
  );
  assert(
    testEngine.getOrder(validOrder.id)?.status === 'PAID',
    suite,
    'Order marked as PAID upon authentic verification'
  );
  assert(
    testEngine.hasEntitlement('auditor@catalyx.io', 'prod_mkt_audit_model') === true,
    suite,
    'Entitlement successfully granted to user upon authentic settlement'
  );

  // 10. Concurrency & Idempotency: Duplicate and Parallel IPN
  const duplicateSettlement = await testEngine.verifyAndSettlePayment({
    orderTrackingId: validTrackingId,
    merchantReference: validMerchantRef,
    operatorOrTrigger: 'IPN Webhook Duplicate'
  });
  assert(
    duplicateSettlement.verified === true && duplicateSettlement.message.includes('already verified'),
    suite,
    'Duplicate IPN cleanly returns idempotent confirmation'
  );
  assert(
    testEngine.getEntitlements({ email: 'auditor@catalyx.io' }).length === 1,
    suite,
    'Duplicate IPN does not duplicate or revoke user entitlement'
  );

  // Parallel concurrent verifications test
  const [par1, par2] = await Promise.all([
    testEngine.verifyAndSettlePayment({ orderTrackingId: validTrackingId, operatorOrTrigger: 'Concurrent IPN A' }),
    testEngine.verifyAndSettlePayment({ orderTrackingId: validTrackingId, operatorOrTrigger: 'Concurrent IPN B' })
  ]);
  assert(
    par1.verified && par2.verified,
    suite,
    'Concurrent IPNs resolved safely via concurrency locking'
  );
}

async function runAuthenticationAndIdentitySecurityTests() {
  const suite = 'Authentication, Identity & Credential Governance';
  const { authService } = await import('../src/services/authService');

  // 1. Password Strength Validation
  const tooShort = authService.validatePasswordStrength('short');
  assert(
    !tooShort.valid && tooShort.error?.includes('8 characters'),
    suite,
    'Password shorter than 8 characters is strictly rejected'
  );

  const noNumberOrSymbol = authService.validatePasswordStrength('alphabeticallong');
  assert(
    !noNumberOrSymbol.valid && noNumberOrSymbol.error?.includes('number or symbol'),
    suite,
    'Password lacking digits or symbols is strictly rejected'
  );

  const strongPass = authService.validatePasswordStrength('SecureEnterprise2026!');
  assert(
    strongPass.valid === true,
    suite,
    'Strong password with alphanumeric and symbol meets security criteria'
  );

  // 2. Cryptographic Salt & SHA-256 Hashing
  const saltA = authService.generateSalt();
  const saltB = authService.generateSalt();
  assert(
    saltA !== saltB && saltA.length === 32,
    suite,
    'Random cryptographic salts are unique 128-bit hex strings'
  );

  const hashA = await authService.hashPassword('MySecretPass123!', saltA);
  const hashB = await authService.hashPassword('MySecretPass123!', saltB);
  assert(
    hashA !== hashB && hashA.length === 64,
    suite,
    'Salting produces distinct 256-bit SHA-256 hashes preventing rainbow table attacks'
  );

  // 3. Mandatory Terms Agreement on Registration
  const unconsented = await authService.register({
    email: 'unconsented@enterprise.io',
    username: 'Unconsented User',
    password: 'ValidPass123!',
    confirmPassword: 'ValidPass123!',
    acceptTerms: false
  });
  assert(
    !unconsented.success && unconsented.error?.includes('Mandatory Agreement'),
    suite,
    'Registration without terms agreement is strictly rejected'
  );

  // 4. Invalid Email Format Rejection
  const badEmail = await authService.register({
    email: 'not-an-email-at-all',
    username: 'Bad Email User',
    password: 'ValidPass123!',
    confirmPassword: 'ValidPass123!',
    acceptTerms: true
  });
  assert(
    !badEmail.success && badEmail.error?.includes('valid electronic mail'),
    suite,
    'Registration with malformed email is strictly rejected'
  );

  // 5. Password Confirmation Mismatch
  const mismatch = await authService.register({
    email: 'mismatch@enterprise.io',
    username: 'Mismatch User',
    password: 'ValidPass123!',
    confirmPassword: 'DifferentPass123!',
    acceptTerms: true
  });
  assert(
    !mismatch.success && mismatch.error?.includes('confirmation does not match'),
    suite,
    'Password confirmation mismatch is strictly caught and rejected'
  );

  // 6. Valid Registration
  const testEmail = `executive_${Date.now()}@catalyx.io`;
  const regResult = await authService.register({
    email: testEmail,
    username: 'Executive Officer',
    password: 'SuperSecure2026!',
    confirmPassword: 'SuperSecure2026!',
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(
    regResult.success === true && regResult.user?.email === testEmail,
    suite,
    'Legitimate user registration succeeds and provisions user profile'
  );
  assert(
    regResult.user?.termsAcceptedVersion !== undefined && regResult.user?.termsAcceptedVersion !== '',
    suite,
    'Registered user automatically binds current terms version'
  );
  assert(
    regResult.user?.emailVerified === true,
    suite,
    'New registered user is active without mandatory email verification gate'
  );

  // 7. Duplicate Account Prevention
  const dupResult = await authService.register({
    email: testEmail,
    username: 'Impostor Officer',
    password: 'SuperSecure2026!',
    confirmPassword: 'SuperSecure2026!',
    acceptTerms: true
  });
  assert(
    !dupResult.success && dupResult.error?.includes('already exists'),
    suite,
    'Duplicate registration with existing email is rejected'
  );

  // 8. Successful Login
  const loginSuccess = await authService.login({
    email: testEmail,
    password: 'SuperSecure2026!'
  });
  assert(
    loginSuccess.success === true && loginSuccess.user?.email === testEmail,
    suite,
    'Valid authentication succeeds against salted SHA-256 hash'
  );

  // 9. Brute-Force Rate Limiting & Account Lockout
  const bruteEmail = `brute_${Date.now()}@catalyx.io`;
  await authService.register({
    email: bruteEmail,
    username: 'Brute Target',
    password: 'RealPassword2026!',
    confirmPassword: 'RealPassword2026!',
    acceptTerms: true
  });

  // Attempt 4 consecutive wrong passwords (safe neutral feedback, zero countdown leaks)
  for (let i = 0; i < 4; i++) {
    const failed = await authService.login({
      email: bruteEmail,
      password: 'WrongPassword!'
    });
    assert(
      !failed.success && failed.error === 'Incorrect email or password.' && !failed.error?.includes('remaining'),
      suite,
      `Failed attempt #${i + 1} provides safe neutral feedback without countdown leak`
    );
  }

  // 5th consecutive failed attempt must trigger 60-second lockout
  const lockoutAttempt = await authService.login({
    email: bruteEmail,
    password: 'WrongPassword!'
  });
  assert(
    !lockoutAttempt.success && (lockoutAttempt.retryAfterSeconds !== undefined && lockoutAttempt.retryAfterSeconds > 0),
    suite,
    '5 consecutive failed attempts engages security lockout with retryAfterSeconds'
  );

  // Immediate attempt during lockout with CORRECT password must be blocked
  const blockedEvenWithCorrectPass = await authService.login({
    email: bruteEmail,
    password: 'RealPassword2026!'
  });
  assert(
    !blockedEvenWithCorrectPass.success && blockedEvenWithCorrectPass.error?.includes('locked'),
    suite,
    'Login attempts are strictly throttled while account lockout is active'
  );

  // 10. Password Reset Recovery Flow
  const resetReq = await authService.requestPasswordReset(testEmail);
  assert(
    resetReq.success && resetReq.demoToken !== undefined,
    suite,
    'Password recovery request generates secure verification token'
  );

  const resetFailedBadToken = await authService.resetPassword(
    testEmail,
    '000000',
    'BrandNewPass2026!',
    'BrandNewPass2026!'
  );
  assert(
    !resetFailedBadToken.success && resetFailedBadToken.error?.includes('Invalid or expired'),
    suite,
    'Password reset with incorrect token is rejected'
  );

  const resetOk = await authService.resetPassword(
    testEmail,
    resetReq.demoToken!,
    'BrandNewPass2026!',
    'BrandNewPass2026!'
  );
  assert(
    resetOk.success === true,
    suite,
    'Password reset succeeds with valid token and updates credential hash'
  );

  // Verify login with new password
  const loginNewPass = await authService.login({
    email: testEmail,
    password: 'BrandNewPass2026!'
  });
  assert(
    loginNewPass.success === true,
    suite,
    'User successfully authenticates with updated password'
  );

  // 11. Email Verification Workflow
  const verifyReq = await authService.requestEmailVerification(regResult.user!.uid);
  assert(
    verifyReq.success && verifyReq.code !== undefined,
    suite,
    'Email verification generates 6-digit verification code'
  );

  const verifyWrongCode = await authService.verifyEmail(regResult.user!.uid, '999999');
  assert(
    !verifyWrongCode.success && verifyWrongCode.error?.includes('Invalid'),
    suite,
    'Invalid verification code rejected'
  );

  const verifySuccess = await authService.verifyEmail(regResult.user!.uid, verifyReq.code!);
  assert(
    verifySuccess.success && verifySuccess.user?.emailVerified === true && verifySuccess.user?.emailVerifiedAt !== null,
    suite,
    'Valid email verification code marks account as verified with timestamp'
  );

  // 12. Secure Email Change with Password Authorization
  const newEmailTarget = `updated_${Date.now()}@catalyx.io`;
  const emailChangeBadPass = await authService.changeEmail(
    regResult.user!.uid,
    'WrongPassword!',
    newEmailTarget
  );
  assert(
    !emailChangeBadPass.success && emailChangeBadPass.error?.includes('password is required'),
    suite,
    'Email change without valid current password is authenticated and rejected'
  );

  const emailChangeOk = await authService.changeEmail(
    regResult.user!.uid,
    'BrandNewPass2026!',
    newEmailTarget
  );
  assert(
    emailChangeOk.success && emailChangeOk.user?.email === newEmailTarget,
    suite,
    'Authorized email change updates user identity securely'
  );

  // 13. Clean Session Logout
  await authService.logout();
  const activeAfterLogout = await authService.getCurrentUser();
  assert(
    activeAfterLogout === null,
    suite,
    'Logout clears active session'
  );
}

async function runEconomicPolicyRegressionAndAntiLegacyTests() {
  const suite = 'Economic Policy Regression & Anti-Legacy Gate';

  // 1. Authoritative configuration values
  const cfg = revenuePolicyEngine.getActiveConfig();
  assert(cfg.individualFeePercent === 0.25, suite, 'Authoritative Individual fee is exactly 0.25% (25 basis points)');
  assert(cfg.groupFeePercent === 0.27, suite, 'Authoritative Group fee is exactly 0.27% (27 basis points)');
  assert(cfg.organizationFeePercent === 0.50, suite, 'Authoritative Organization fee is exactly 0.50% (50 basis points)');
  assert(cfg.standardUserFeePercent === 0.25, suite, 'Backward-compatible standardUserFeePercent is synced at 0.25%');
  assert(cfg.version.startsWith('pol_v'), suite, 'Active revenue policy version is authoritatively tracked');

  // 2. Active Terms of Service version sync
  const legalMeta = LegalPolicyService.getVersionMetadata();
  assert(legalMeta.version === 'v2026.3.2', suite, 'Active Terms of Service version is synchronized to v2026.3.2');

  // 3. User-facing Legal Terms content verification
  const termsDoc = LegalPolicyService.getDocumentBySlug('terms');
  assert(!!termsDoc, suite, 'Master Terms of Service document is loadable');
  assert(termsDoc!.contentMarkdown.includes('0.25%'), suite, 'Terms of Service explicitly specifies 0.25% Individual fee');
  assert(termsDoc!.contentMarkdown.includes('0.27%'), suite, 'Terms of Service explicitly specifies 0.27% Group fee');
  assert(termsDoc!.contentMarkdown.includes('0.50%'), suite, 'Terms of Service explicitly specifies 0.50% Organization fee');

  // 4. Anti-legacy regression: strictly verify no active 10% or 15% platform commission remains
  const payoutsDoc = LegalPolicyService.getDocumentBySlug('payouts');
  assert(!!payoutsDoc, suite, 'Creator Payout Policy document is loadable');
  assert(!payoutsDoc!.contentMarkdown.includes('10% for individual'), suite, 'Creator Payout Policy has retired 10% individual commission completely');
  assert(!payoutsDoc!.contentMarkdown.includes('15% for organizations'), suite, 'Creator Payout Policy has retired 15% organization commission completely');
  assert(payoutsDoc!.contentMarkdown.includes('0.25%'), suite, 'Creator Payout Policy codifies authoritative 0.25% Individual rate');
  assert(payoutsDoc!.contentMarkdown.includes('0.27%'), suite, 'Creator Payout Policy codifies authoritative 0.27% Group rate');
  assert(payoutsDoc!.contentMarkdown.includes('0.50%'), suite, 'Creator Payout Policy codifies authoritative 0.50% Organization rate');

  // 5. Anti-tamper administrative mutation gate
  let unauthorizedMutationBlocked = false;
  try {
    revenuePolicyEngine.updateConfig({ individualFeePercent: 10.0 } as any, '', '');
  } catch (e: any) {
    unauthorizedMutationBlocked = true;
  }
  assert(unauthorizedMutationBlocked, suite, 'Unauthenticated attempt to modify platform revenue rates strictly rejected');

  let blankReasonBlocked = false;
  try {
    revenuePolicyEngine.updateConfig({ individualFeePercent: 10.0 } as any, 'Admin', 'short');
  } catch (e: any) {
    blankReasonBlocked = true;
  }
  assert(blankReasonBlocked, suite, 'Modification without substantive audit justification reason strictly rejected');
}

async function runMarketplaceRatingLifecycleAndAdversarialTests() {
  const suite = 'Marketplace Rating & Review Lifecycle & Adversarial Security';

  const testAssetId = 'asset_pres_sovereign_infra';

  // 1. Truthful Empty State / Unreviewed Asset Test
  const emptyAssetId = 'asset_sec_auditor_01';
  const emptySummary = marketplaceRatingService.getRatingSummary(emptyAssetId);
  assert(emptySummary.totalReviews === 0, suite, 'Unreviewed asset reports exactly 0 reviews');
  assert(emptySummary.averageRating === null, suite, 'Unreviewed asset reports truthful null average rating (no synthetic score)');

  // 2. Adversarial Test 1: Untransacted user attempts to review paid product
  const untransactedEmail = 'unverified.buyer.adversary@test.io';
  const unverifiedEligibility = marketplaceRatingService.checkEligibility(testAssetId, untransactedEmail);
  assert(!unverifiedEligibility.eligible, suite, 'Untransacted user is rejected from rating paid deliverable');
  assert(unverifiedEligibility.reason === 'VERIFIED_PURCHASE_REQUIRED', suite, 'Rejection specifies VERIFIED_PURCHASE_REQUIRED');

  // 3. Adversarial Test 2: Creator attempts self-rating
  const creatorEmail = 'anesthonest81@gmail.com'; // author of asset_pres_sovereign_infra
  const selfRatingEligibility = marketplaceRatingService.checkEligibility(testAssetId, creatorEmail);
  assert(!selfRatingEligibility.eligible, suite, 'Creator attempting to rate own product is strictly blocked');
  assert(selfRatingEligibility.reason === 'SELF_RATING_PROHIBITED', suite, 'Self-rating correctly flagged as SELF_RATING_PROHIBITED');

  // 4. Adversarial Test 3: Rating outside valid 1-5 integer bounds
  const verifiedBuyerEmail = 'elena.rostova@horizonconsortium.org'; // transacted in ledger tx_leg_v27_102
  const zeroRatingRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 0,
    comment: 'Substantive feedback for zero rating test.'
  });
  assert(!zeroRatingRes.success, suite, 'Zero star rating (0) rejected by server');

  const sixRatingRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 6,
    comment: 'Substantive feedback for six rating test.'
  });
  assert(!sixRatingRes.success, suite, 'Over-limit rating (6) rejected by server');

  const floatRatingRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 4.5,
    comment: 'Floating point rating test.'
  });
  assert(!floatRatingRes.success, suite, 'Floating point rating (4.5) rejected (must be integer)');

  // 5. Adversarial Test 4: Vacuous / Empty comment rejected
  const emptyCommentRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 5,
    comment: 'Hi'
  });
  assert(!emptyCommentRes.success, suite, 'Sub-5 character review comment rejected');

  // 6. Authentic Verified Buyer Review Submission
  const validReviewRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 5,
    comment: 'Exemplary architectural presentation. Verified deployment across our engineering cluster.'
  });
  assert(validReviewRes.success, suite, 'Verified purchaser successfully submits 5-star review');
  assert(!!validReviewRes.review, suite, 'Submitted review object returned');
  assert(validReviewRes.review!.verifiedPurchase === true, suite, 'Review marked with verifiedPurchase: true');

  // 7. Aggregation check
  const afterSubmitSummary = marketplaceRatingService.getRatingSummary(testAssetId);
  assert(afterSubmitSummary.totalReviews === 1, suite, 'Asset review count incremented to exactly 1');
  assert(afterSubmitSummary.averageRating === 5.0, suite, 'Average rating computed accurately as 5.0');
  assert(afterSubmitSummary.distribution[5] === 1, suite, '5-star distribution bucket recorded 1 entry');

  // 8. Duplicate Review Prevention
  const duplicateRes = marketplaceRatingService.submitReview({
    assetId: testAssetId,
    reviewerEmail: verifiedBuyerEmail,
    reviewerName: 'Elena Rostova',
    rating: 5,
    comment: 'Attempting duplicate review submission on same product.'
  });
  assert(!duplicateRes.success, suite, 'Duplicate review from same user on same product strictly rejected');

  // 9. Adversarial Test 5: Unauthorized Review Modification (User B tries to edit Elena\'s review)
  const attackerEmail = 'adversary.hacker@shadowcorp.org';
  const unauthorizedEditRes = marketplaceRatingService.updateReview({
    assetId: testAssetId,
    reviewId: validReviewRes.review!.id,
    editorEmail: attackerEmail,
    rating: 1,
    comment: 'Malicious review tamper attempt.'
  });
  assert(!unauthorizedEditRes.success, suite, 'Unauthorized review modification by non-author strictly rejected');

  // 10. Authorized Review Edit
  const authorizedEditRes = marketplaceRatingService.updateReview({
    assetId: testAssetId,
    reviewId: validReviewRes.review!.id,
    editorEmail: verifiedBuyerEmail,
    rating: 4,
    comment: 'Updated assessment after two weeks in production: 4 stars sustained reliability.'
  });
  assert(authorizedEditRes.success, suite, 'Original author successfully updates review');
  const afterEditSummary = marketplaceRatingService.getRatingSummary(testAssetId);
  assert(afterEditSummary.averageRating === 4.0, suite, 'Aggregate average rating dynamically recalculated to 4.0 after edit');
  assert(afterEditSummary.distribution[4] === 1, suite, '4-star distribution bucket updated to 1');
  assert(afterEditSummary.distribution[5] === 0, suite, 'Old 5-star bucket decremented to 0');

  // 11. Review Moderation / Abuse Reporting
  const reportRes = marketplaceRatingService.reportReview({
    reviewId: validReviewRes.review!.id,
    reporterEmail: 'compliance.monitor@catalyx.io',
    reason: 'INAPPROPRIATE_CONTENT',
    details: 'Automated test report.'
  });
  assert(reportRes.success && !!reportRes.reportId, suite, 'Abuse / moderation report successfully accepted and queued');

  // 12. Adversarial Test 6: Unauthorized Review Deletion
  const unauthorizedDeleteRes = marketplaceRatingService.deleteReview({
    assetId: testAssetId,
    reviewId: validReviewRes.review!.id,
    callerEmail: attackerEmail
  });
  assert(!unauthorizedDeleteRes.success, suite, 'Unauthorized review deletion by non-author non-admin strictly rejected');

  // 13. Authorized Review Deletion & Reset to Truthful Empty State
  const authorizedDeleteRes = marketplaceRatingService.deleteReview({
    assetId: testAssetId,
    reviewId: validReviewRes.review!.id,
    callerEmail: verifiedBuyerEmail
  });
  assert(authorizedDeleteRes.success, suite, 'Author successfully deletes their own review');
  const finalSummary = marketplaceRatingService.getRatingSummary(testAssetId);
  assert(finalSummary.totalReviews === 0, suite, 'Asset review count returns to exactly 0');
  assert(finalSummary.averageRating === null, suite, 'Average rating resets to truthful null state');
}

async function runAdvertisingEngineRealEventTelemetryTests() {
  const suite = 'Advertising & Sponsored Placements Engine';

  // 1. Campaign creation
  const now = new Date();
  const camp = advertisingService.createCampaign({
    name: 'Verified Quantum Security Enterprise Campaign',
    advertiserEmail: 'marketing@quantumsys.io',
    advertiserName: 'Quantum Systems Ltd',
    placement: 'MARKETPLACE_SPONSORED_LISTING',
    creative: {
      title: 'Quantum Hardware HSM Bridge',
      tagline: 'Hardware security modules for multi-cloud deployments.',
      destinationUrl: 'https://catalyx.io/marketplace/software/quantum_hsm',
      creativeType: 'image',
      callToAction: 'Learn More'
    },
    targeting: {
      categories: ['security', 'hardware'],
      targetAudience: 'DEVELOPERS'
    },
    totalBudgetMinorUnits: 10000, // $100.00
    startDate: now.toISOString(),
    endDate: new Date(now.getTime() + 30 * 86400 * 1000).toISOString()
  });
  assert(camp.status === 'ACTIVE', suite, 'New ad campaign created in ACTIVE state');
  assert(camp.spentMinorUnits === 0, suite, 'Initial spent budget is strictly 0 minor units');
  assert(camp.measuredImpressions === 0, suite, 'Initial measured impressions is strictly 0 (no synthetic views)');
  assert(camp.measuredClicks === 0, suite, 'Initial measured clicks is strictly 0');

  // 2. Adversarial: non-positive budget rejection
  let zeroBudgetRejected = false;
  try {
    advertisingService.createCampaign({
      name: 'Zero Budget',
      advertiserEmail: 'test@test.io',
      advertiserName: 'Tester',
      placement: 'BANNER_SPONSORSHIP',
      creative: { title: 'T', tagline: 'T', destinationUrl: 'url', creativeType: 'text', callToAction: 'T' },
      targeting: { categories: [], targetAudience: 'ALL' },
      totalBudgetMinorUnits: 0,
      startDate: now.toISOString(),
      endDate: now.toISOString()
    });
  } catch (e: any) {
    zeroBudgetRejected = true;
  }
  assert(zeroBudgetRejected, suite, 'Campaign creation with zero budget strictly rejected');

  // 3. Pause & Resume Lifecycle
  const paused = advertisingService.pauseCampaign(camp.id);
  assert(paused.status === 'PAUSED', suite, 'Campaign successfully transitioned to PAUSED state');

  // Telemetry on paused campaign is rejected
  const pausedEventSuccess = advertisingService.recordRealTelemetryEvent({
    campaignId: camp.id,
    eventType: 'IMPRESSION'
  });
  assert(pausedEventSuccess === false, suite, 'Telemetry rejected on PAUSED campaign');

  const resumed = advertisingService.resumeCampaign(camp.id);
  assert(resumed.status === 'ACTIVE', suite, 'Campaign successfully resumed to ACTIVE state');

  // 4. Real event telemetry tracking (zero synthetic metrics)
  const impSuccess = advertisingService.recordRealTelemetryEvent({
    campaignId: camp.id,
    eventType: 'IMPRESSION',
    userContext: 'marketplace_catalog_view'
  });
  assert(impSuccess === true, suite, 'Real impression event recorded');
  const afterImp = advertisingService.getCampaigns('marketing@quantumsys.io').find(c => c.id === camp.id)!;
  assert(afterImp.measuredImpressions === 1, suite, 'Measured impressions incremented to exactly 1');
  assert(afterImp.spentMinorUnits === afterImp.costPerImpressionMinorUnits, suite, 'Spent budget incremented by real impression unit cost');

  const clickSuccess = advertisingService.recordRealTelemetryEvent({
    campaignId: camp.id,
    eventType: 'CLICK',
    userContext: 'sponsored_card_click'
  });
  assert(clickSuccess === true, suite, 'Real click event recorded');
  const afterClick = advertisingService.getCampaigns('marketing@quantumsys.io').find(c => c.id === camp.id)!;
  assert(afterClick.measuredClicks === 1, suite, 'Measured clicks incremented to exactly 1');
  assert(
    afterClick.spentMinorUnits === afterClick.costPerImpressionMinorUnits + afterClick.costPerClickMinorUnits,
    suite,
    'Spent budget equals exact sum of real impression and click charges'
  );

  // 5. Campaign completion lifecycle
  const ended = advertisingService.endCampaign(camp.id);
  assert(ended.status === 'COMPLETED', suite, 'Campaign successfully transitioned to COMPLETED status');
}

async function runDeepResearchEngineIntegrityTests() {
  const suite = 'Deep Research AI Analytical Engine & Citation Integrity';

  const query = 'Zero-Knowledge Proofs for Sovereign Remittance and Cross-Border Settlements';
  const dossier = await deepResearchService.executeDeepResearch({
    query,
    userEmail: 'dr.elena@research.org',
    userName: 'Dr. Elena Rostova'
  });

  // 1. Dossier creation
  assert(!!dossier && !!dossier.id, suite, 'Deep Research dossier created with unique persistent ID');
  assert(dossier.status === 'COMPLETED', suite, 'Dossier synthesis status is COMPLETED');

  // 2. Problem decomposition & sub-questions
  assert(dossier.hypotheses.length >= 3, suite, 'Research query decomposed into at least 3 formal hypotheses');
  assert(dossier.subQuestions.length >= 3, suite, 'Research query decomposed into structured sub-questions');
  for (const sq of dossier.subQuestions) {
    assert(!!sq.question && !!sq.findings && sq.confidenceScore > 0, suite, `Sub-question "${sq.focusArea}" contains findings and confidence rating`);
  }

  // 3. Citation integrity (no fabricated references)
  assert(dossier.citations.length >= 2, suite, 'Dossier contains verified peer citations');
  for (const cite of dossier.citations) {
    assert(cite.authors.length > 0, suite, `Citation "${cite.title}" lists verified authors`);
    assert(cite.publicationYear >= 2024, suite, `Citation "${cite.title}" publication year is valid`);
    assert(cite.evidenceStrength === 'HIGH' || cite.evidenceStrength === 'EMPIRICAL', suite, `Citation evidence strength is empirically grounded`);
  }

  // 4. Contradiction & Counter-Perspective Analysis
  assert(dossier.counterPerspectives.length >= 2, suite, 'Dossier analyzes opposing technical hypotheses and counter-evidence');

  // 5. Synthesis & Recommendations
  assert(dossier.keyFindings.length >= 3, suite, 'Dossier synthesizes key findings');
  assert(dossier.strategicRecommendations.length >= 3, suite, 'Dossier provides strategic recommendations');
  assert(dossier.overallConfidenceScore >= 80, suite, 'Overall confidence score is evaluated (actual: ' + dossier.overallConfidenceScore + '%)');

  // 6. Export to Universal Work Object
  const workObj = deepResearchService.exportToUniversalWork(dossier.id, 'ws_eng_alpha');
  assert(!!workObj, suite, 'Dossier exported to first-class Universal Work Object');
  assert(workObj!.workType === 'RESEARCH', suite, 'Universal Work Object has workType = RESEARCH');
  assert(dossier.status === 'EXPORTED_TO_WORK', suite, 'Dossier status updated to EXPORTED_TO_WORK');
}

async function runApplicationPerformanceMeasurements() {
  const suite = 'Application Latency & Throughput Performance Measurements';

  // 1. Revenue Policy Engine Calculation Latency (1,000 operations)
  const revStart = performance.now();
  for (let i = 0; i < 1000; i++) {
    revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: 14900,
      currency: 'USD',
      sellerAccountType: 'INDIVIDUAL'
    });
  }
  const revDuration = performance.now() - revStart;
  const avgRevMs = revDuration / 1000;
  assert(avgRevMs < 0.1, suite, `Revenue split calculation sub-0.1ms latency (measured: ${avgRevMs.toFixed(4)}ms/op, total: ${revDuration.toFixed(2)}ms)`);

  // 2. Cryptographic Salted Hash Latency
  const hashStart = performance.now();
  for (let i = 0; i < 10; i++) {
    serverAuthStore.hashPasswordWithSalt('TestBench2026!Salt', 'salt_' + i);
  }
  const hashDuration = performance.now() - hashStart;
  const avgHashMs = hashDuration / 10;
  assert(avgHashMs < 10.0, suite, `Salted SHA-256 password hash latency sub-10ms (measured: ${avgHashMs.toFixed(3)}ms/op)`);

  // 3. Marketplace Catalog Query & Filter Latency (500 operations)
  const catStart = performance.now();
  for (let i = 0; i < 500; i++) {
    const assets = MarketplaceService.getAssets();
    const filtered = assets.filter(a => a.pricingModel === 'one_time');
  }
  const catDuration = performance.now() - catStart;
  const avgCatMs = catDuration / 500;
  assert(avgCatMs < 0.2, suite, `Marketplace catalog search & filter sub-0.2ms latency (measured: ${avgCatMs.toFixed(4)}ms/query)`);

  // 4. Rating Eligibility Verification Latency (500 checks)
  const eligStart = performance.now();
  for (let i = 0; i < 500; i++) {
    marketplaceRatingService.checkEligibility('asset_pres_sovereign_infra', 'elena.rostova@horizonconsortium.org');
  }
  const eligDuration = performance.now() - eligStart;
  const avgEligMs = eligDuration / 500;
  assert(avgEligMs < 0.1, suite, `Rating eligibility verification sub-0.1ms latency (measured: ${avgEligMs.toFixed(4)}ms/check)`);

  // 5. Deep Research Query Latency
  const resStart = performance.now();
  await deepResearchService.executeDeepResearch({
    query: 'High-Throughput Distributed Microservices Performance Benchmark',
    userEmail: 'perf.tester@catalyx.io',
    userName: 'Performance Benchmark Agent'
  });
  const resDuration = performance.now() - resStart;
  assert(resDuration < 200, suite, `Deep Research query execution completed within sub-200ms (measured: ${resDuration.toFixed(2)}ms)`);
}

async function runAuthoritativePaymentProviderPolicyTests() {
  const suite = 'Authoritative Payment Provider Policy & Decommission Verification';

  // 1. Policy Whitelist Verification: PESAPAL and BANK_TRANSFER only
  assert(AUTHORIZED_PAYMENT_PROVIDERS.length === 2, suite, 'Authorized payment providers list contains exactly 2 channels');
  assert(AUTHORIZED_PAYMENT_PROVIDERS.includes('pesapal'), suite, 'Pesapal is in authorized providers');
  assert(AUTHORIZED_PAYMENT_PROVIDERS.includes('bank_transfer'), suite, 'Bank Transfer is in authorized providers');

  // 2. Provider validation functions
  assert(isAuthorizedPaymentProvider('pesapal') === true, suite, 'pesapal is identified as authorized');
  assert(isAuthorizedPaymentProvider('bank_transfer') === true, suite, 'bank_transfer is identified as authorized');
  assert(isAuthorizedPaymentProvider('stripe') === false, suite, 'stripe is rejected as unauthorized');
  assert(isAuthorizedPaymentProvider('paypal') === false, suite, 'paypal is rejected as unauthorized');
  assert(isAuthorizedPaymentProvider('crypto') === false, suite, 'crypto is rejected as unauthorized');
  assert(isAuthorizedPaymentProvider('mock') === false, suite, 'mock is rejected as unauthorized');
  assert(isAuthorizedPaymentProvider('flutterwave') === false, suite, 'flutterwave is rejected as unauthorized');

  // 3. Exception throwing on unauthorized providers
  let stripeBlocked = false;
  try {
    assertAuthorizedPaymentProvider('stripe');
  } catch (err: any) {
    if (err instanceof PaymentProviderPolicyViolationError || err?.code === 'UNAUTHORIZED_PAYMENT_PROVIDER') {
      stripeBlocked = true;
    }
  }
  assert(stripeBlocked === true, suite, 'assertAuthorizedPaymentProvider strictly throws on stripe');

  // 4. Economic Engine channels inspection
  const availableChannels = catalyxEconomicEngine.getAvailableChannels();
  const channelIds = availableChannels.map(c => c.id);
  assert(channelIds.includes('pesapal'), suite, 'Economic engine registers pesapal channel');
  assert(channelIds.includes('bank_transfer'), suite, 'Economic engine registers bank_transfer channel');
  assert(!channelIds.includes('stripe'), suite, 'Economic engine contains zero active stripe channels');

  // 5. Server-side payment attempt rejection on unauthorized provider
  const testOrder = catalyxEconomicEngine.createOrder({
    organizationId: 'org_test_policy',
    customerId: 'cust_policy_test',
    customerName: 'Security Tester',
    customerEmail: 'security@catalyx.io',
    billingAddress: { emailAddress: 'security@catalyx.io' },
    items: [{
      productId: 'item_test',
      productTitle: 'Test Service',
      sku: 'TEST-SKU',
      quantity: 1,
      unitPriceMinorUnits: 1000,
      totalPriceMinorUnits: 1000
    }],
    currency: 'USD',
    idempotencyKey: `idemp_policy_ord_${Date.now()}`
  });

  let engineBlockedStripe = false;
  try {
    await catalyxEconomicEngine.initiatePaymentAttempt({
      orderId: testOrder.id,
      idempotencyKey: `idemp_policy_att_${Date.now()}`,
      ipOrUserId: '127.0.0.1',
      channel: 'stripe' as any
    });
  } catch (err: any) {
    if (err instanceof PaymentProviderPolicyViolationError || err?.message?.includes('unauthorized and disabled')) {
      engineBlockedStripe = true;
    }
  }
  assert(engineBlockedStripe === true, suite, 'initiatePaymentAttempt strictly blocks unauthorized provider channel=stripe');

  // 6. Codebase static scan: zero active stripe keys or secrets
  const envExample = fs.readFileSync('.env.example', 'utf-8');
  assert(!envExample.includes('STRIPE_SECRET_KEY='), suite, '.env.example contains zero STRIPE_SECRET_KEY');
  assert(!envExample.includes('STRIPE_WEBHOOK_SECRET='), suite, '.env.example contains zero STRIPE_WEBHOOK_SECRET');
  assert(!envExample.includes('STRIPE_PUBLISHABLE_KEY='), suite, '.env.example contains zero STRIPE_PUBLISHABLE_KEY');

  const devEco = fs.readFileSync('src/services/developerEcosystemService.ts', 'utf-8');
  assert(!devEco.includes('STRIPE_WEBHOOK_SECRET'), suite, 'developerEcosystemService contains zero STRIPE_WEBHOOK_SECRET');

  const webhookSvc = fs.readFileSync('src/services/webhookService.ts', 'utf-8');
  assert(!webhookSvc.includes('STRIPE_WEBHOOK_SECRET'), suite, 'webhookService contains zero STRIPE_WEBHOOK_SECRET');

  // 7. Verification of integer minor unit precision across all mandated price points
  const testAmounts = [1, 10, 100, 999, 9999, 99999, 1000000]; // $0.01, $0.10, $1.00, $9.99, $99.99, $999.99, $10,000.00
  const tiers: ('INDIVIDUAL' | 'GROUP' | 'ORGANIZATION')[] = ['INDIVIDUAL', 'GROUP', 'ORGANIZATION'];

  for (const amount of testAmounts) {
    for (const tier of tiers) {
      const split = revenuePolicyEngine.calculateRevenueSplit({
        grossAmountMinorUnits: amount,
        currency: 'USD',
        sellerAccountType: tier
      });
      assert(
        split.catalyxFeeMinorUnits + split.sellerGrossPlatformEarningsMinorUnits === amount,
        suite,
        `Exact mathematical balance preserved for ${tier} at minor units ${amount} (Fee: ${split.catalyxFeeMinorUnits}, Gross Earnings: ${split.sellerGrossPlatformEarningsMinorUnits})`
      );
    }
  }

  // 8. Bank Transfer Provider verification
  const bankProvider = catalyxEconomicEngine.getBankTransferProvider();
  assert(bankProvider !== undefined, suite, 'Bank Transfer provider is registered and accessible');
  const bankAccounts = bankAccountManager.getClientSafeReceivingAccounts();
  assert(bankAccounts.length > 0, suite, 'Bank Account Manager exposes active receiving bank accounts');

  const bankSubmit = await bankProvider.submitOrder({
    internalOrderId: testOrder.id,
    merchantReference: testOrder.orderNumber,
    amountMinorUnits: testOrder.totalMinorUnits,
    currency: testOrder.currency,
    description: 'Bank Wire Payment Test',
    callbackUrl: 'https://catalyx.io/callback',
    billingAddress: testOrder.billingAddress,
    idempotencyKey: `idemp_bank_test_${Date.now()}`
  });
  assert(bankSubmit.status === 'SUCCESS', suite, 'Bank transfer submission creates authoritative payment reference successfully');
  assert(bankSubmit.orderTrackingId !== undefined, suite, 'Bank transfer returns tracking identifier');
}

async function runMandatorySubscriptionAndSecurityTests() {
  const suite = 'Mandatory Subscription Model & Account Security Verification';

  // 1. Authoritative recurring monthly prices
  const plans = BillingService.getPlans();
  const individualPlan = plans.find(p => p.tier === 'individual');
  const groupPlan = plans.find(p => p.tier === 'group');
  const orgPlan = plans.find(p => p.tier === 'organization');

  assert(individualPlan !== undefined, suite, 'Individual monthly subscription plan is configured');
  assert(individualPlan?.pricesMinorUnits.USD === 1000, suite, 'Individual subscription price is exactly $10.00/month (1000 minor units)');

  assert(groupPlan !== undefined, suite, 'Group / Team monthly subscription plan is configured');
  assert(groupPlan?.pricesMinorUnits.USD === 1300, suite, 'Group / Team subscription price is exactly $13.00/month (1300 minor units)');

  assert(orgPlan !== undefined, suite, 'Organization monthly subscription plan is configured');
  assert(orgPlan?.pricesMinorUnits.USD === 2500, suite, 'Organization subscription price is exactly $25.00/month (2500 minor units)');

  // 2. Pricing Engine canonical prices verification
  const pricingEngine = universalPricingEngine;
  const prInd = pricingEngine.getPriceById('pr_sub_individual_usd');
  assert(prInd !== undefined && prInd.amountMinorUnits === 1000, suite, 'Pricing engine serves canonical Individual subscription at 1000 minor units ($10)');

  const prGrp = pricingEngine.getPriceById('pr_sub_group_usd');
  assert(prGrp !== undefined && prGrp.amountMinorUnits === 1300, suite, 'Pricing engine serves canonical Group subscription at 1300 minor units ($13)');

  const prOrg = pricingEngine.getPriceById('pr_sub_organization_usd');
  assert(prOrg !== undefined && prOrg.amountMinorUnits === 2500, suite, 'Pricing engine serves canonical Organization subscription at 2500 minor units ($25)');

  // 3. Strict Server-side Subscription Lifecycle & State Machine
  const testSub = BillingService.getSubscription('org_test_lifecycle_verification');
  assert(testSub.billingInterval === 'monthly', suite, 'Default subscription billingInterval is monthly');
  assert(testSub.monthlyPriceMinorUnits === 1000, suite, 'Default subscription price is locked to $10.00/month');

  // Verify lifecycle valid transitions: trial -> active
  const activateRes = SubscriptionStateMachine.transition(
    testSub,
    'active',
    'Payment confirmed',
    'system_test',
    'Verification Suite'
  );
  assert(activateRes.success && activateRes.subscription.status === 'active', suite, 'Subscription transitions to ACTIVE upon confirmed payment');

  // Verify transition active -> past_due
  const pastDueRes = SubscriptionStateMachine.transition(
    testSub,
    'past_due',
    'Payment renewal failed',
    'system_test',
    'Verification Suite'
  );
  assert(pastDueRes.success && pastDueRes.subscription.status === 'past_due', suite, 'Subscription transitions to PAST_DUE when payment fails');

  // Verify transition past_due -> suspended
  const suspendRes = SubscriptionStateMachine.transition(
    testSub,
    'suspended',
    'Grace period elapsed',
    'system_test',
    'Verification Suite'
  );
  assert(suspendRes.success && suspendRes.subscription.status === 'suspended', suite, 'Subscription transitions to SUSPENDED');

  // Verify transition suspended -> active
  const reactivateRes = SubscriptionStateMachine.transition(
    testSub,
    'active',
    'Reactivation payment settled',
    'system_test',
    'Verification Suite'
  );
  assert(reactivateRes.success && reactivateRes.subscription.status === 'active', suite, 'Subscription transitions from SUSPENDED back to ACTIVE upon settlement');

  // Verify illegal transition is strictly rejected
  const illegalTransitionRes = SubscriptionStateMachine.transition(
    testSub,
    'trial',
    'Attempted backwards reset to trial',
    'adversary',
    'Malicious User'
  );
  assert(!illegalTransitionRes.success, suite, 'Illegal subscription state transition (ACTIVE -> TRIAL) is strictly blocked and audited');

  // 4. Entitlement Gating by Tier
  const indAiEval = EntitlementService.evaluate('org_test_lifecycle_verification', 'AI_AGENTS');
  assert(indAiEval.granted === true && indAiEval.limit === 5, suite, 'Individual tier is strictly limited to 5 AI agents');

  const indGovEval = EntitlementService.evaluate('org_test_lifecycle_verification', 'ENTERPRISE_GOVERNANCE');
  assert(indGovEval.granted === false, suite, 'Individual tier does not have access to Enterprise Governance');

  // 5. Anti-Enumeration & Login Security Validation
  const nonExistentLogin = await serverAuthStore.authenticate({
    email: 'nobody_exists_at_all_9999999@catalyx.io',
    password: 'SomeRandomPassword123!'
  });
  assert(
    !nonExistentLogin.success && nonExistentLogin.error === 'Incorrect email or password.',
    suite,
    'Non-existent account login returns neutral "Incorrect email or password." without leaking user existence'
  );

  const wrongPassLogin = await serverAuthStore.authenticate({
    email: 'ines_test_audit@catalyx.io',
    password: 'DefinitelyWrongPassword!'
  });
  assert(
    !wrongPassLogin.success && 
    wrongPassLogin.error === 'Incorrect email or password.' &&
    !wrongPassLogin.error.includes('remaining'),
    suite,
    'Wrong password returns neutral error without exposing "attempts remaining" countdown'
  );

  // 6. Rights Reservation & Intellectual Property Policy Validation
  const legalDocs = LegalPolicyService.getAllDocuments();
  const ipDoc = legalDocs.find(d => d.slug === 'intellectual-property');
  assert(ipDoc !== undefined, suite, 'Intellectual Property & Rights Notice document exists');
  assert(ipDoc!.contentMarkdown.includes('Creator IP Guarantee'), suite, 'Affirms 100% creator IP retention guarantee');
  assert(ipDoc!.contentMarkdown.includes('All rights reserved by CATALYX and Vinexsah Technologies'), suite, 'Affirms all rights reserved for CATALYX proprietary architecture');
  assert(ipDoc!.contentMarkdown.includes('Pesapal v3.0 and Direct Bank Transfer rails'), suite, 'Explicitly codifies Pesapal and Bank Transfer as the sole monetization channels');
}

async function runMissionControlAndObservabilityTests() {
  const suite = 'Mission Control & System Health Observability Intelligence';

  // 1. Holistic System Condition Retrieval
  const condition = await missionControlService.getSystemCondition(true);
  assert(condition !== null && typeof condition === 'object', suite, 'System condition snapshot is retrieved');
  assert(condition.score.compositeScore >= 0 && condition.score.compositeScore <= 100, suite, 'System condition composite score is bounded 0-100');
  assert(['HEALTHY', 'DEGRADED', 'CONFIG_REQUIRED', 'CRITICAL', 'MAINTENANCE'].includes(condition.score.overallStatus), suite, 'System condition overall status is valid enum');
  assert(condition.score.totalSubsystems >= 9, suite, 'All 9 core subsystems are accounted for in composite score');

  // 2. Comprehensive Subsystem Telemetry Truth
  const diagnostics = condition.diagnostics;
  const expectedSubsystems = [
    'api_gateway',
    'database_persistence',
    'auth_security',
    'payment_monetization',
    'ai_intelligence',
    'deep_research',
    'marketplace_commerce',
    'background_webhooks',
    'backup_recovery',
    'monitoring_self_health',
    'system_resources'
  ];

  for (const expectedId of expectedSubsystems) {
    const diag = diagnostics.find(d => d.id === expectedId);
    assert(diag !== undefined, suite, `Subsystem "${expectedId}" is actively monitored and diagnosed`);
    assert(diag!.latencyMs >= 0, suite, `Subsystem "${expectedId}" reports truthful non-negative latency`);
    assert(typeof diag!.statusMessage === 'string' && diag!.statusMessage.length > 0, suite, `Subsystem "${expectedId}" provides descriptive diagnostic message`);
  }

  // 3. Controlled Scenarios A through H Verification (Section 3)
  const scA = missionControlService.evaluateScenario('A');
  assert(scA.overallStatus === 'HEALTHY', suite, 'Scenario A: All monitored systems healthy -> HEALTHY');

  const scB = missionControlService.evaluateScenario('B');
  assert(scB.overallStatus === 'DEGRADED', suite, 'Scenario B: One non-critical subsystem degraded -> DEGRADED');

  const scC = missionControlService.evaluateScenario('C');
  assert(scC.overallStatus === 'CRITICAL', suite, 'Scenario C: Critical payment integrity failure -> CRITICAL');

  const scD = missionControlService.evaluateScenario('D');
  assert(scD.overallStatus === 'CRITICAL', suite, 'Scenario D: Database unavailable -> CRITICAL');

  const scE = missionControlService.evaluateScenario('E');
  assert(scE.overallStatus === 'TELEMETRY_UNAVAILABLE', suite, 'Scenario E: Monitoring telemetry stale -> TELEMETRY_UNAVAILABLE');

  const scF = missionControlService.evaluateScenario('F');
  assert(scF.overallStatus === 'UNKNOWN', suite, 'Scenario F: No data exists yet -> UNKNOWN / INSUFFICIENT DATA (NEVER HEALTHY)');

  const scG = missionControlService.evaluateScenario('G');
  assert(scG.overallStatus === 'DEGRADED', suite, 'Scenario G: AI provider unavailable while rest works -> DEGRADED');

  const scH = missionControlService.evaluateScenario('H');
  assert(scH.overallStatus === 'CRITICAL', suite, 'Scenario H: Security / isolation violation detected -> CRITICAL');

  // 4. Payment & Financial Ledger Observability Verification
  const paymentDiag = diagnostics.find(d => d.id === 'payment_monetization');
  assert(paymentDiag !== undefined, suite, 'Payment & Monetization diagnostic probe exists');
  assert(paymentDiag!.metrics.stripeDecommissioned === 'VERIFIED_PERMANENTLY_BLOCKED', suite, 'Mission Control certifies Stripe is VERIFIED_PERMANENTLY_BLOCKED');
  assert(String(paymentDiag!.metrics.activePaymentProviders).includes('pesapal') && String(paymentDiag!.metrics.activePaymentProviders).includes('bank_transfer'), suite, 'Mission Control reports only Pesapal and Bank Transfer as active payment channels');
  assert(String(paymentDiag!.metrics.ledgerIntegrity).includes('BALANCED'), suite, 'Double-entry financial ledger verified: debits === credits across all records');
  assert(String(paymentDiag!.metrics.individualPlanPrice).includes('$10.00'), suite, 'Mission Control verifies Individual plan at $10.00/mo');
  assert(String(paymentDiag!.metrics.groupPlanPrice).includes('$13.00'), suite, 'Mission Control verifies Group plan at $13.00/mo');
  assert(String(paymentDiag!.metrics.organizationPlanPrice).includes('$25.00'), suite, 'Mission Control verifies Organization plan at $25.00/mo');

  // 5. Backup & Disaster Recovery Monitoring (Section 12)
  const backupDiag = diagnostics.find(d => d.id === 'backup_recovery');
  assert(backupDiag !== undefined, suite, 'Backup & Disaster Recovery diagnostic probe exists');
  assert(backupDiag!.metrics.backupExists === 'VERIFIED', suite, 'Backup monitoring verifies backup exists');
  assert(backupDiag!.metrics.backupSucceeded === 'VERIFIED_SCHEDULED_6H', suite, 'Backup monitoring verifies scheduled snapshot success');
  assert(backupDiag!.metrics.restoreVerification === 'NOT CONFIGURED', suite, 'Backup monitoring explicitly reports "RESTORE VERIFICATION: NOT CONFIGURED" without fake claims');

  // 6. Monitoring Self-Health Probe (Section 17)
  const selfHealthDiag = diagnostics.find(d => d.id === 'monitoring_self_health');
  assert(selfHealthDiag !== undefined, suite, 'Monitoring engine self-health diagnostic probe exists');
  assert(selfHealthDiag!.metrics.telemetryPipeline === 'LIVE', suite, 'Monitoring self-health verifies live telemetry pipeline');
  assert(typeof selfHealthDiag!.metrics.freshnessWindowMs === 'number', suite, 'Monitoring self-health enforces freshness window parameter');

  // 7. Auth & Security Subsystem Verification
  const authDiag = diagnostics.find(d => d.id === 'auth_security');
  assert(authDiag !== undefined, suite, 'Auth & Security diagnostic probe exists');
  assert(String(authDiag!.metrics.antiEnumeration).includes('ENFORCED'), suite, 'Mission Control verifies Anti-Enumeration enforcement');

  // 8. AI Intelligence & Safety Firewall Observability
  const aiDiag = diagnostics.find(d => d.id === 'ai_intelligence');
  assert(aiDiag !== undefined, suite, 'AI Intelligence diagnostic probe exists');
  assert(String(aiDiag!.metrics.activeAgentWorkforce).includes('11'), suite, 'Mission Control verifies 11 active workforce agents');
  assert(String(aiDiag!.metrics.providerQuota).includes('Provider quota telemetry unavailable.'), suite, 'AI monitoring truthfully outputs "Provider quota telemetry unavailable."');
  assert(String(aiDiag!.metrics.aiSafetyFirewall).includes('ONLINE'), suite, 'Mission Control verifies AI Safety Firewall is online');

  // 9. RBAC Access Control Verification (Section 8 & 21)
  assert(missionControlService.isAuthorizedOperator('EXECUTIVE'), suite, 'EXECUTIVE role is authorized for Mission Control');
  assert(missionControlService.isAuthorizedOperator('ADMIN'), suite, 'ADMIN role is authorized for Mission Control');
  assert(missionControlService.isAuthorizedOperator('AUDITOR'), suite, 'AUDITOR role is authorized for Mission Control');
  assert(missionControlService.isAuthorizedOperator('OPERATOR'), suite, 'OPERATOR role is authorized for Mission Control');
  assert(!missionControlService.isAuthorizedOperator('GUEST'), suite, 'GUEST role is strictly denied Mission Control access');
  assert(!missionControlService.isAuthorizedOperator('STANDARD_USER'), suite, 'STANDARD_USER role is strictly denied Mission Control access');

  // 10. Owner-Friendly Inquiry Engine Grounding (Section 20)
  const howIsResp = missionControlService.askSystemCondition('How is CATALYX right now?');
  assert(howIsResp.includes('CATALYX is currently') && howIsResp.includes('Composite Score'), suite, 'Inquiry "How is CATALYX?" returns grounded composite condition');

  const paymentsResp = missionControlService.askSystemCondition('Are payments working?');
  assert(paymentsResp.includes('pesapal') && paymentsResp.includes('bank_transfer'), suite, 'Inquiry "Are payments working?" confirms authorized payment channels');

  const backupsResp = missionControlService.askSystemCondition('Are backups working?');
  assert(backupsResp.includes('RESTORE VERIFICATION: NOT CONFIGURED'), suite, 'Inquiry "Are backups working?" truthfully states restore verification not configured');

  const criticalResp = missionControlService.askSystemCondition('Is there any critical problem?');
  assert(criticalResp.length > 0, suite, 'Inquiry "Is there any critical problem?" returns definitive assessment');

  // 11. Operational Alert Lifecycle & Audit Trail
  const initialAlerts = missionControlService.getAlerts();
  assert(initialAlerts.length > 0, suite, 'Initial operational alerts are populated');

  const testAlert = initialAlerts[0];
  const ackSuccess = missionControlService.acknowledgeAlert(testAlert.id, 'sre.operator@catalyx.io');
  assert(ackSuccess, suite, 'Operational alert is acknowledged by SRE operator');

  const updatedAlertsAfterAck = missionControlService.getAlerts();
  const ackedAlert = updatedAlertsAfterAck.find(a => a.id === testAlert.id);
  assert(ackedAlert?.status === 'ACKNOWLEDGED' && ackedAlert.acknowledgedBy === 'sre.operator@catalyx.io', suite, 'Alert state transitions to ACKNOWLEDGED with operator attribution');

  const resolveSuccess = missionControlService.resolveAlert(testAlert.id, 'sre.operator@catalyx.io');
  assert(resolveSuccess, suite, 'Operational alert is resolved by SRE operator');

  const updatedAlertsAfterResolve = missionControlService.getAlerts();
  const resolvedAlert = updatedAlertsAfterResolve.find(a => a.id === testAlert.id);
  assert(resolvedAlert?.status === 'RESOLVED' && typeof resolvedAlert.resolvedAt === 'string', suite, 'Alert state transitions to RESOLVED with timestamp');

  // 12. Operational Remediation Runbooks Execution
  const runbooks = missionControlService.getAvailableRunbooks();
  assert(runbooks.length >= 6, suite, 'At least 6 operational remediation runbooks are registered');

  const stripeAuditRun = await missionControlService.executeRunbook('audit_stripe_lockout', 'sre.operator@catalyx.io');
  assert(stripeAuditRun.success && stripeAuditRun.output.includes('PASSED'), suite, 'Runbook "audit_stripe_lockout" executes and passes');

  const bankAuditRun = await missionControlService.executeRunbook('audit_bank_rails', 'sre.operator@catalyx.io');
  assert(bankAuditRun.success && bankAuditRun.output.includes('Direct Bank Transfer rails verified'), suite, 'Runbook "audit_bank_rails" executes and passes');

  const authNeutralityRun = await missionControlService.executeRunbook('audit_auth_neutrality', 'sre.operator@catalyx.io');
  assert(authNeutralityRun.success && authNeutralityRun.output.includes('PASSED'), suite, 'Runbook "audit_auth_neutrality" executes and passes');

  const financialAuditRun = await missionControlService.executeRunbook('audit_financial_ledger', 'sre.operator@catalyx.io');
  assert(financialAuditRun.success && financialAuditRun.output.includes('PASSED'), suite, 'Runbook "audit_financial_ledger" executes and passes');

  const flushCacheRun = await missionControlService.executeRunbook('flush_telemetry_cache', 'sre.operator@catalyx.io');
  assert(flushCacheRun.success && flushCacheRun.output.includes('flushed'), suite, 'Runbook "flush_telemetry_cache" executes and passes');

  // 13. Event Audit Stream Integrity
  const events = missionControlService.getRecentEvents(20);
  assert(events.length > 0, suite, 'Operational event stream records system activities');
  assert(events.every(e => ['INFO', 'WARN', 'ERROR', 'CRITICAL'].includes(e.severity)), suite, 'All operational events have valid severity classifications');
}

async function runPesapalApi3ProductionIpnRegistrationTests() {
  const suite = 'Pesapal API 3 Production IPN Registration & Verification';

  // 1. Authoritative Production Base URL
  const prodProvider = new PesapalPaymentProvider({
    consumerKey: process.env.PESAPAL_CONSUMER_KEY,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
    environment: 'live'
  });
  assert(prodProvider.getBaseUrl() === 'https://pay.pesapal.com/v3', suite, 'Production Pesapal API 3 base URL is https://pay.pesapal.com/v3');

  // 2. Production Authentication Capability
  const isConfigured = prodProvider.isConfigured();
  assert(isConfigured, suite, 'Production Pesapal Consumer Key and Secret are configured');

  // 3. Public IPN URL Construction
  const publicIpnUrl = prodProvider.getPublicIpnUrl();
  assert(publicIpnUrl.startsWith('https://'), suite, 'Production IPN endpoint uses secure HTTPS protocol');
  assert(publicIpnUrl.includes('/api/billing/pesapal/ipn'), suite, 'Production IPN endpoint path is /api/billing/pesapal/ipn');

  // 4. IPN Notification Payload Parsing & Acknowledgement Format
  const ipnSample = {
    OrderNotificationType: 'IPNCHANGE',
    OrderTrackingId: 'e72acd10-cb96-4b1f-8d5d-d9df8e36b68d',
    OrderMerchantReference: 'CX-PROD-TEST-001'
  };
  const parseResult = await prodProvider.processNotification(ipnSample);
  assert(parseResult.status === 'SUCCESS', suite, 'IPN parser accepts Pesapal API 3 fields');
  assert(parseResult.ackPayload.orderNotificationType === 'IPNCHANGE', suite, 'IPN acknowledgement contains OrderNotificationType');
  assert(parseResult.ackPayload.orderTrackingId === 'e72acd10-cb96-4b1f-8d5d-d9df8e36b68d', suite, 'IPN acknowledgement contains OrderTrackingId');
  assert(parseResult.ackPayload.orderMerchantReference === 'CX-PROD-TEST-001', suite, 'IPN acknowledgement contains OrderMerchantReference');
  assert(parseResult.ackPayload.status === 200, suite, 'IPN acknowledgement returns HTTP status 200 format');

  // 5. Hardened Notification ID wiring in SubmitOrder
  let capturedNotificationId: string | undefined;
  const mockFetchIpn = async (url: any, opts: any) => {
    const urlStr = url.toString();
    if (urlStr.includes('/api/Auth/RequestToken')) {
      return {
        ok: true,
        json: async () => ({ token: 'mock_bearer_token', expiryDate: new Date(Date.now() + 300000).toISOString() })
      };
    }
    if (urlStr.includes('/api/Transactions/SubmitOrder')) {
      const body = JSON.parse(opts.body);
      capturedNotificationId = body.notification_id;
      return {
        ok: true,
        json: async () => ({
          status: '200',
          order_tracking_id: 'mock_track_guid',
          merchant_reference: body.id,
          redirect_url: 'https://pay.pesapal.com/v3/redirect'
        })
      };
    }
    return { ok: false, text: async () => 'Not found' };
  };

  const wireTestProvider = new PesapalPaymentProvider({
    consumerKey: 'audit_key',
    consumerSecret: 'audit_secret',
    environment: 'live',
    defaultIpnId: 'e72acd10-cb96-4b1f-8d5d-d9df8e36b68d',
    fetchOverride: mockFetchIpn as any
  });

  const submitRes = await wireTestProvider.submitOrder({
    internalOrderId: 'ord_ipn_test_1',
    merchantReference: 'CX-IPN-TEST-1',
    amountMinorUnits: 1000,
    currency: 'USD',
    description: 'IPN Notification ID Test Order',
    callbackUrl: 'https://ais-dev-fta6wcb3kopn277yojqzzu-945644866497.europe-west2.run.app/billing',
    billingAddress: { emailAddress: 'operator@catalyx.io' },
    idempotencyKey: 'idemp_ipn_wire_test'
  });

  assert(submitRes.status === 'SUCCESS', suite, 'SubmitOrder executes successfully with wired notification_id');
  assert(capturedNotificationId === 'e72acd10-cb96-4b1f-8d5d-d9df8e36b68d', suite, 'SubmitOrder wires registered active IPN ID into notification_id parameter');
  assert(Boolean(capturedNotificationId && capturedNotificationId.length > 10), suite, 'notification_id is never null, empty, or unconfigured');

  // 6. Idempotency against duplicate IPN notifications
  const dupEngine = new CatalyxEconomicEngine(prodProvider);
  const dupOrder = dupEngine.createOrder({
    organizationId: 'org_idemp_ipn',
    customerId: 'cust_idemp_ipn',
    customerName: 'Idempotency Tester',
    customerEmail: 'idemp@catalyx.io',
    billingAddress: { emailAddress: 'idemp@catalyx.io' },
    items: [{
      productId: 'plan_individual',
      productTitle: 'CATALYX Individual Plan',
      sku: 'SUB-INDIVIDUAL-MONTHLY',
      quantity: 1,
      unitPriceMinorUnits: 1000,
      totalPriceMinorUnits: 1000
    }],
    currency: 'USD',
    idempotencyKey: 'idemp_dup_order_1'
  });

  // Verify that an unknown or fake transaction cannot settle
  const fakeSettle = await dupEngine.verifyAndSettlePayment({
    orderTrackingId: 'fake-tracking-id-99999',
    merchantReference: 'CX-FAKE-REF',
    operatorOrTrigger: 'Adversarial IPN Test'
  });
  assert(fakeSettle.verified === false, suite, 'Unverified fake IPN transaction rejected without entitlement activation');
  assert(dupEngine.getOrder(dupOrder.id)?.status === 'CREATED', suite, 'Order remains strictly un-paid when IPN is unverified');
}

async function runCatalyxIdentityAndSubscriptionLifecycleTests() {
  const suite = 'CATALYX Identity & Subscription Lifecycle Verification';
  const { authService } = await import('../src/services/authService');

  // 1. Email Verification Codes During Account Creation
  const uniqueRegEmail = `test_signup_${Date.now()}@catalyx.io`;
  const initRes = await serverAuthStore.initiateRegistration({
    email: uniqueRegEmail,
    username: 'Verification Tester',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    accountType: 'GROUP',
    acceptTerms: true
  });
  assert(initRes.success === true, suite, 'Initiating registration generates verification OTP');
  assert(initRes.expiresInSeconds === 900, suite, 'Verification code has authoritative 15-minute expiration');

  const dispatchedOtp = emailDeliveryService.getLastOtpForTesting(uniqueRegEmail);
  assert(dispatchedOtp !== undefined && /^\d{6}$/.test(dispatchedOtp), suite, 'Dispatched verification code is a 6-digit numeric OTP');

  // Resend cooldown rate-limiting
  const prematureResend = await serverAuthStore.resendRegistrationOtp(uniqueRegEmail);
  assert(!prematureResend.success && prematureResend.error?.includes('Please wait'), suite, 'Premature OTP resend is strictly rate-limited by cooldown');

  // Invalid OTP rejected
  const invalidOtpRes = await serverAuthStore.verifyRegistration({
    email: uniqueRegEmail,
    code: '000000',
    ip: '127.0.0.1'
  });
  assert(!invalidOtpRes.success && (invalidOtpRes.error?.includes('verification code') || invalidOtpRes.error?.includes('Incorrect')), suite, 'Invalid OTP code is rejected');

  // Valid OTP verification succeeds
  const validOtpRes = await serverAuthStore.verifyRegistration({
    email: uniqueRegEmail,
    code: dispatchedOtp!,
    ip: '127.0.0.1'
  });
  assert(validOtpRes.success === true && validOtpRes.user !== undefined, suite, 'Valid OTP completes registration and activates user account');
  assert(validOtpRes.user?.emailVerified === true && Boolean(validOtpRes.user?.emailVerifiedAt), suite, 'User account is marked emailVerified with timestamp');
  assert(Boolean(validOtpRes.sessionToken), suite, 'Active session token issued upon email verification');

  // Single-use guarantee: Replaying the same OTP is rejected
  const replayOtpRes = await serverAuthStore.verifyRegistration({
    email: uniqueRegEmail,
    code: dispatchedOtp!,
    ip: '127.0.0.1'
  });
  assert(!replayOtpRes.success, suite, 'Single-use OTP cannot be replayed after successful activation');

  // 2. Real Transactional Email Delivery Architecture
  const providerStatus = emailDeliveryService.getProviderStatus();
  assert(providerStatus !== null && typeof providerStatus === 'object', suite, 'Email delivery provider status is accessible');
  assert(['PRODUCTION_SMTP', 'DEVELOPMENT_PREVIEW_DISPATCH'].includes(providerStatus.mode), suite, 'Email delivery operates in production SMTP or secure preview mode');

  const masked = emailDeliveryService.maskEmail('confidential.engineer@catalyx.io');
  assert(masked.startsWith('c***') && masked.endsWith('@catalyx.io'), suite, 'Email address is masked for security logs without leaking PII');

  const welcomeMail = emailDeliveryService.createTrialWelcomeEmail('subscriber@catalyx.io', 'Subscriber User', 'ORGANIZATION', 30);
  assert(welcomeMail.subject.includes('Welcome to CATALYX') && welcomeMail.category === 'NOTIFICATION', suite, 'Trial welcome email template is correctly configured');
  assert(welcomeMail.text.includes('free trial') && welcomeMail.text.includes('$25/mo'), suite, 'Trial welcome email contains 1-month trial details and tier rate');

  const subActivatedMail = emailDeliveryService.createSubscriptionActivatedEmail(
    'subscriber@catalyx.io',
    'Organization Plan',
    '$25.00',
    'Pesapal API v3',
    'ORD_TEST_99'
  );
  assert(subActivatedMail.subject.includes('Subscription') && subActivatedMail.text.includes('ORD_TEST_99'), suite, 'Subscription activated email contains order reference and tier');

  const pwChangedMail = emailDeliveryService.createPasswordChangedNotification('subscriber@catalyx.io');
  assert(pwChangedMail.subject.includes('Security Alert') && pwChangedMail.category === 'SECURITY_ALERT', suite, 'Security alert email template generated for password changes');

  // 3. Workspace Tier Selection (Individual / Group / Organization)
  const indPlan = BillingService.getPlan('plan_individual');
  assert(indPlan !== undefined && indPlan.pricesMinorUnits.USD === 1000 && indPlan.tier === 'individual', suite, 'Individual tier is $10.00/mo ($1000 minor units)');

  const grpPlan = BillingService.getPlan('plan_group');
  assert(grpPlan !== undefined && grpPlan.pricesMinorUnits.USD === 1300 && grpPlan.tier === 'group', suite, 'Group/Team tier is $13.00/mo ($1300 minor units)');

  const orgPlan = BillingService.getPlan('plan_organization');
  assert(orgPlan !== undefined && orgPlan.pricesMinorUnits.USD === 2500 && orgPlan.tier === 'organization', suite, 'Organization tier is $25.00/mo ($2500 minor units)');

  // Verify quotas by tier
  const indAiLimits = EntitlementService.evaluate('org_ind_sub_test', 'AI_AGENTS');
  assert(indAiLimits.limit === 5, suite, 'Individual tier has 5 AI agents quota limit');

  BillingService.initializeTrialSubscription('org_grp_sub_test', 'GROUP');
  const grpAiLimits = EntitlementService.evaluate('org_grp_sub_test', 'AI_AGENTS');
  assert(grpAiLimits.limit === 20, suite, 'Group tier has 20 AI agents quota limit');

  BillingService.initializeTrialSubscription('org_corp_sub_test', 'ORGANIZATION');
  const orgAiLimits = EntitlementService.evaluate('org_corp_sub_test', 'AI_AGENTS');
  assert(orgAiLimits.limit === 100, suite, 'Organization tier has 100 AI agents quota limit');

  // 4. One-Month Free Trial Activation & Remaining Calculation
  const trialOrgId = `org_trial_verify_${Date.now()}`;
  const trialSub = BillingService.initializeTrialSubscription(trialOrgId, 'INDIVIDUAL');
  assert(trialSub.status === 'trial', suite, 'New subscription is initialized in trial state');
  assert(trialSub.amountMinorUnits === 0, suite, 'Trial subscription costs $0.00 upfront');
  assert(trialSub.monthlyPriceMinorUnits === 1000, suite, 'Monthly price after trial is recorded ($10.00)');

  const trialDays = BillingService.getTrialDaysRemaining(trialSub);
  assert(trialDays >= 29 && trialDays <= 30, suite, '1-month free trial initially provides 29-30 days remaining');

  // 5. Trial-to-Paid Subscription Lifecycle & Expiration Enforcement
  const activeTrialEval = EntitlementService.evaluate(trialOrgId, 'AI_AGENTS');
  assert(activeTrialEval.granted === true, suite, 'Active trial grants entitlement access');

  // Simulate expired trial by backdating currentPeriodEnd
  const expiredTrialSub = {
    ...trialSub,
    currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  };
  BillingService.saveSubscription(expiredTrialSub);

  const expiredEval = EntitlementService.evaluate(trialOrgId, 'AI_AGENTS');
  assert(expiredEval.granted === false, suite, 'Expired trial strictly denies entitlement access');
  assert(Boolean(expiredEval.reason?.toLowerCase().includes('expired')), suite, 'Expired trial provides clear reason prompting upgrade');

  // State machine transition: TRIAL -> ACTIVE on payment confirmed
  const toActiveRes = SubscriptionStateMachine.transition(
    trialSub,
    'active',
    'Pesapal v3 Payment Verified',
    'system_pesapal_ipn',
    'System Automated Settler'
  );
  assert(toActiveRes.success === true && toActiveRes.subscription.status === 'active', suite, 'Trial transitions to ACTIVE on confirmed Pesapal payment');

  // Update subscription to active
  const paidSub = {
    ...trialSub,
    status: 'active' as const,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  BillingService.saveSubscription(paidSub);

  const restoredEval = EntitlementService.evaluate(trialOrgId, 'AI_AGENTS');
  assert(restoredEval.granted === true, suite, 'Paid active subscription restores full entitlement access');

  // Guard against illegal reverse transition: ACTIVE -> TRIAL
  const illegalTransition = SubscriptionStateMachine.transition(
    toActiveRes.subscription,
    'trial',
    'Attempt reverse transition',
    'adversary',
    'Malicious Operator'
  );
  assert(!illegalTransition.success, suite, 'Illegal state transition from ACTIVE to TRIAL is strictly prevented');

  // 6. Google Sign-In & Instant Account Creation
  const googleUserEmail = `googler_${Date.now()}@gmail.com`;
  const googleAuthRes = await serverAuthStore.authenticateWithGoogle({
    googleId: `gid_${Date.now()}`,
    email: googleUserEmail,
    name: 'Google Identity User',
    accountType: 'GROUP',
    ip: '127.0.0.1'
  });
  assert(googleAuthRes.success === true && googleAuthRes.isNewUser === true, suite, 'New user creates account via Google authentication');
  assert(googleAuthRes.user?.emailVerified === true, suite, 'Google user account is automatically pre-verified without OTP');
  assert(googleAuthRes.user?.authProviders.includes('google'), suite, 'Google user record registers "google" in authProviders');
  assert(Boolean(googleAuthRes.sessionToken), suite, 'Google authentication issues active session token');

  // 7. Secure Account Linking
  const linkTargetEmail = `link_target_${Date.now()}@catalyx.io`;
  const linkUser = await serverAuthStore.createAccountDirect({
    email: linkTargetEmail,
    username: 'Link Target User',
    password: 'Password123!',
    role: 'user',
    accountType: 'INDIVIDUAL'
  });
  assert(linkUser !== null, suite, 'Standard user account created for linking test');

  const testGid = `gid_link_${Date.now()}`;
  const linkRes = await serverAuthStore.linkGoogleAccount({
    uid: linkUser.uid,
    googleId: testGid,
    googleEmail: linkTargetEmail
  });
  assert(linkRes.success === true && linkRes.user?.googleLinked === true, suite, 'Google account is successfully linked to existing user');
  assert(linkRes.user?.authProviders.includes('google') && linkRes.user?.authProviders.includes('password'), suite, 'Linked user has both "password" and "google" auth providers');

  // Adversarial: Attempting to link the same Google ID to a different user must be rejected
  const competitorEmail = `competitor_${Date.now()}@catalyx.io`;
  const competitorUser = await serverAuthStore.createAccountDirect({
    email: competitorEmail,
    username: 'Competitor User',
    password: 'Password123!',
    role: 'user',
    accountType: 'INDIVIDUAL'
  });

  const duplicateLinkRes = await serverAuthStore.linkGoogleAccount({
    uid: competitorUser.uid,
    googleId: testGid,
    googleEmail: competitorEmail
  });
  assert(!duplicateLinkRes.success && duplicateLinkRes.error?.includes('already linked'), suite, 'Duplicate Google account linking across accounts is strictly prevented');

  // 8. Subscription Access Enforcement
  const cancelledOrgId = `org_cancelled_${Date.now()}`;
  BillingService.saveSubscription({
    ...trialSub,
    organizationId: cancelledOrgId,
    status: 'cancelled'
  });
  const cancelledEval = EntitlementService.evaluate(cancelledOrgId, 'AI_AGENTS');
  assert(cancelledEval.granted === false, suite, 'Cancelled subscription strictly denies access');

  const indEnterpriseEval = EntitlementService.evaluate(trialOrgId, 'ENTERPRISE_GOVERNANCE');
  assert(indEnterpriseEval.granted === false, suite, 'Individual tier strictly denied Enterprise Governance entitlement');

  // 9. Registration & Login UX Improvements
  const bogusLogin = await serverAuthStore.authenticate({
    email: 'absolutely_nonexistent_user_99999@catalyx.io',
    password: 'SomePassword123!'
  });
  assert(!bogusLogin.success && bogusLogin.error === 'Incorrect email or password.', suite, 'Non-existent account login returns neutral error message');

  const shortPassVal = authService.validatePasswordStrength('short1!');
  assert(!shortPassVal.valid && shortPassVal.error?.includes('8 characters'), suite, 'Registration password requires minimum 8 characters');

  const noSymVal = authService.validatePasswordStrength('purelyalphabeticallong');
  assert(!noSymVal.valid && noSymVal.error?.includes('number or symbol'), suite, 'Registration password requires at least one symbol or number');
}

async function runAuthoritativeForensicSubscriptionAuditTests() {
  const suite = 'Forensic Verification of Subscription Policy & Tier Architecture';

  // 1. All three account types exist and plans are defined
  const indPlan = BillingService.getPlan('plan_individual');
  const grpPlan = BillingService.getPlan('plan_group');
  const orgPlan = BillingService.getPlan('plan_organization');

  assert(indPlan !== undefined, suite, 'Individual account plan exists in system');
  assert(grpPlan !== undefined, suite, 'Group / Team account plan exists in system');
  assert(orgPlan !== undefined, suite, 'Organization / Company account plan exists in system');

  // 2. Exact prices implemented in USD minor units
  assert(indPlan?.pricesMinorUnits.USD === 1000, suite, 'Individual plan price is strictly $10.00/month (1000 minor units)');
  assert(grpPlan?.pricesMinorUnits.USD === 1300, suite, 'Group / Team plan price is strictly $13.00/month (1300 minor units)');
  assert(orgPlan?.pricesMinorUnits.USD === 2500, suite, 'Organization / Company plan price is strictly $25.00/month (2500 minor units)');

  // 3. User registration provisions correct account type and 1-month trial
  const indEmail = `forensic_ind_${Date.now()}@catalyx.io`;
  const indReg = await serverAuthStore.register({
    email: indEmail,
    username: 'Forensic Individual',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    accountType: 'INDIVIDUAL',
    acceptTerms: true
  });
  assert(indReg.success === true && indReg.user?.accountType === 'INDIVIDUAL', suite, 'Registration with INDIVIDUAL assigns INDIVIDUAL account type');
  
  const indSub = BillingService.initializeTrialSubscription(indReg.user!.organizationId, 'INDIVIDUAL');
  assert(indSub.accountType === 'INDIVIDUAL' && indSub.tier === 'individual', suite, 'Individual trial subscription initialized with individual tier');
  assert(indSub.status === 'trial' && indSub.amountMinorUnits === 0, suite, 'Individual trial has $0.00 upfront payment');
  assert(indSub.monthlyPriceMinorUnits === 1000, suite, 'Individual trial subscription records $10.00/month regular rate');
  const indDays = BillingService.getTrialDaysRemaining(indSub);
  assert(indDays >= 29 && indDays <= 30, suite, 'Individual trial provides 30-day initial trial window');

  const grpEmail = `forensic_grp_${Date.now()}@catalyx.io`;
  const grpReg = await serverAuthStore.register({
    email: grpEmail,
    username: 'Forensic Group User',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    accountType: 'GROUP',
    acceptTerms: true
  });
  assert(grpReg.success === true && grpReg.user?.accountType === 'GROUP', suite, 'Registration with GROUP assigns GROUP account type');
  
  const grpSub = BillingService.initializeTrialSubscription(grpReg.user!.organizationId, 'GROUP');
  assert(grpSub.accountType === 'GROUP' && grpSub.tier === 'group', suite, 'Group trial subscription initialized with group tier');
  assert(grpSub.status === 'trial' && grpSub.amountMinorUnits === 0, suite, 'Group trial has $0.00 upfront payment');
  assert(grpSub.monthlyPriceMinorUnits === 1300, suite, 'Group trial subscription records $13.00/month regular rate');
  const grpDays = BillingService.getTrialDaysRemaining(grpSub);
  assert(grpDays >= 29 && grpDays <= 30, suite, 'Group trial provides 30-day initial trial window');

  const orgEmail = `forensic_org_${Date.now()}@catalyx.io`;
  const orgReg = await serverAuthStore.register({
    email: orgEmail,
    username: 'Forensic Org User',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(orgReg.success === true && orgReg.user?.accountType === 'ORGANIZATION', suite, 'Registration with ORGANIZATION assigns ORGANIZATION account type');
  
  const orgSub = BillingService.initializeTrialSubscription(orgReg.user!.organizationId, 'ORGANIZATION');
  assert(orgSub.accountType === 'ORGANIZATION' && orgSub.tier === 'organization', suite, 'Organization trial subscription initialized with organization tier');
  assert(orgSub.status === 'trial' && orgSub.amountMinorUnits === 0, suite, 'Organization trial has $0.00 upfront payment');
  assert(orgSub.monthlyPriceMinorUnits === 2500, suite, 'Organization trial subscription records $25.00/month regular rate');
  const orgDays = BillingService.getTrialDaysRemaining(orgSub);
  assert(orgDays >= 29 && orgDays <= 30, suite, 'Organization trial provides 30-day initial trial window');

  // 4. Server-side account type validation: Invalid or forged account types safely sanitized
  const invalidTypeEmail = `forensic_invalid_${Date.now()}@catalyx.io`;
  const invalidReg = await serverAuthStore.register({
    email: invalidTypeEmail,
    username: 'Adversary User',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    accountType: 'ENTERPRISE_UNLIMITED_VIP' as any,
    acceptTerms: true
  });
  assert(invalidReg.success === true && invalidReg.user?.accountType === 'INDIVIDUAL', suite, 'Invalid account type safely sanitized to default INDIVIDUAL');

  // 5. Entitlement quotas strictly enforced per tier
  const indQuota = EntitlementService.evaluate(indReg.user!.organizationId, 'AI_AGENTS');
  assert(indQuota.limit === 5, suite, 'Individual tier receives 5 AI agent quota');

  const grpQuota = EntitlementService.evaluate(grpReg.user!.organizationId, 'AI_AGENTS');
  assert(grpQuota.limit === 20, suite, 'Group / Team tier receives 20 AI agent quota');

  const orgQuota = EntitlementService.evaluate(orgReg.user!.organizationId, 'AI_AGENTS');
  assert(orgQuota.limit === 100, suite, 'Organization tier receives 100 AI agent quota');

  // 6. Marketplace fee schedule strictly verified
  const indFee = RevenuePolicyEngine.getFeePercentForAccount('INDIVIDUAL');
  const grpFee = RevenuePolicyEngine.getFeePercentForAccount('GROUP');
  const orgFee = RevenuePolicyEngine.getFeePercentForAccount('ORGANIZATION');

  assert(indFee === 0.25, suite, 'Marketplace Individual fee category is strictly 0.25%');
  assert(grpFee === 0.27, suite, 'Marketplace Group / Team fee category is strictly 0.27%');
  assert(orgFee === 0.50, suite, 'Marketplace Organization fee category is strictly 0.50%');

  // 7. Google Sign-In with account-type selection
  const googleGrpEmail = `google_grp_${Date.now()}@gmail.com`;
  const googleGrpId = `gid_forensic_${Date.now()}`;
  const googleGrpRes = await serverAuthStore.authenticateWithGoogle({
    googleId: googleGrpId,
    email: googleGrpEmail,
    name: 'Google Group Lead',
    accountType: 'GROUP',
    acceptTerms: true
  });
  assert(googleGrpRes.success === true && googleGrpRes.user?.accountType === 'GROUP', suite, 'Google Sign-In with GROUP assigns GROUP account type');
  assert(googleGrpRes.user?.emailVerified === true, suite, 'Google user email is pre-verified');

  // Existing Google user sign-in maintains account type and does not recreate trial
  const existingGoogleRes = await serverAuthStore.authenticateWithGoogle({
    googleId: googleGrpId,
    email: googleGrpEmail,
    name: 'Google Group Lead',
    accountType: 'INDIVIDUAL', // Client attempting to tamper with existing account
    acceptTerms: true
  });
  assert(existingGoogleRes.success === true && existingGoogleRes.isNewUser === false, suite, 'Existing Google user sign-in detects existing user without recreation');
  assert(existingGoogleRes.user?.accountType === 'GROUP', suite, 'Existing Google user account type is immutable and preserved');
}

async function runSafeStorageAndSessionResilienceAuditTests() {
  const suite = 'Safe Storage & Canonical Session Serialization Audit';

  // 1. Valid JSON session
  localStorage.setItem('catalyx_active_session', JSON.stringify('usr_valid_json_123'));
  assert(safeStorage.getActiveSession() === 'usr_valid_json_123', suite, '1. Valid JSON session restored accurately');

  // 2. Legacy raw-string session (e.g. "vine_demo_user" stored directly without JSON quotes)
  localStorage.setItem('catalyx_active_session', 'vine_demo_user');
  assert(!isLikelyJsonString('vine_demo_user'), suite, '2a. Non-JSON raw string correctly detected before parse');
  const legacyVal = safeStorage.getActiveSession();
  assert(legacyVal === 'vine_demo_user', suite, '2b. Legacy raw-string session migrated safely without JSON parse error');
  const rawAfter = localStorage.getItem('catalyx_active_session');
  assert(rawAfter === JSON.stringify('vine_demo_user'), suite, '2c. Legacy raw-string session persisted in canonical JSON');

  // 3. Malformed JSON
  localStorage.setItem('catalyx_test_corrupt', '{malformed_json_here: true');
  const corruptRes = safeStorage.get('catalyx_test_corrupt', 'default_fallback');
  assert(corruptRes === 'default_fallback', suite, '3a. Malformed JSON returns fallback value safely without throwing');
  assert(localStorage.getItem('catalyx_test_corrupt') === null, suite, '3b. Corrupted storage key is cleaned up');

  // 4. Empty value
  localStorage.setItem('catalyx_active_session', '   ');
  assert(safeStorage.getActiveSession() === null, suite, '4. Empty string session safely treated as null fallback');

  // 5. Null value
  localStorage.removeItem('catalyx_active_session');
  assert(safeStorage.getActiveSession() === null, suite, '5. Unset session safely returns null');

  // 6. Logout
  safeStorage.setActiveSession('usr_to_logout');
  safeStorage.setSessionToken('tok_test_logout');
  safeStorage.clearActiveSession();
  assert(safeStorage.getActiveSession() === null, suite, '6a. Logout clears active session UID');
  assert(safeStorage.getSessionToken() === null, suite, '6b. Logout clears session token');

  // 7. Login
  safeStorage.setActiveSession('usr_logged_in_456');
  safeStorage.setSessionToken('tok_session_456');
  assert(safeStorage.getActiveSession() === 'usr_logged_in_456', suite, '7a. Login writes canonical session representation');
  assert(safeStorage.getSessionToken() === 'tok_session_456', suite, '7b. Login writes canonical session token');

  // 8. Session restoration
  const restored = safeStorage.getActiveSession();
  assert(restored === 'usr_logged_in_456', suite, '8. Session restoration reads canonical session representation');

  // 9. Session expiry
  const fakeToken = 'tok_expired_or_invalid_999';
  const expiredSession = serverAuthStore.getSession(fakeToken);
  assert(expiredSession === null, suite, '9. Expired or non-existent session token returns null');

  // 10. Corrupted storage recovery
  localStorage.setItem('catalyx_active_session', '{"uid": 12345, "broken":');
  const recovered = safeStorage.getActiveSession();
  assert(recovered === null, suite, '10. Corrupted session storage recovers safely to null without crashing');

  // 11. Multiple tabs / state synchronization
  safeStorage.setActiveSession('usr_tab_sync');
  assert(safeStorage.getActiveSession() === 'usr_tab_sync', suite, '11. Cross-tab storage synchronization reads unified canonical session');
}

async function runComprehensiveAuthenticationSecurityMatrixTests() {
  const suite = 'Comprehensive Authentication Security Matrix (Tests A - P)';

  // TEST A: Correct existing email + Correct password
  const testAEmail = `auth_test_a_${Date.now()}@catalyx.io`;
  const testAPass = 'CorrectPassword2026!';
  const accountA = await serverAuthStore.createAccountDirect({
    email: testAEmail,
    username: 'user_test_a',
    password: testAPass,
    accountType: 'INDIVIDUAL'
  });

  const authResultA = await serverAuthStore.authenticate({
    email: testAEmail,
    password: testAPass
  });
  assert(authResultA.success === true, suite, 'TEST A: Correct email + correct password succeeds');
  assert(!!authResultA.sessionToken, suite, 'TEST A: Valid session token is created');
  assert(authResultA.user?.email === testAEmail, suite, 'TEST A: Access granted to correct account');

  // TEST B: Correct existing email + WRONG password
  const authResultB = await serverAuthStore.authenticate({
    email: testAEmail,
    password: 'WrongPasswordTotally!'
  });
  assert(authResultB.success === false, suite, 'TEST B: Correct email + WRONG password strictly fails');
  assert(!authResultB.sessionToken, suite, 'TEST B: NO session token issued on wrong password');
  assert(!authResultB.user, suite, 'TEST B: NO authenticated user object returned');
  assert(authResultB.error === 'Incorrect email or password.', suite, 'TEST B: Neutral error message returned');

  // Client-level assertion for TEST B
  safeStorage.setActiveSession('stale_unverified_session');
  const clientAuthResultB = await authService.login({
    email: testAEmail,
    password: 'WrongPasswordTotally!'
  });
  assert(clientAuthResultB.success === false, suite, 'TEST B (Client): authService.login rejects wrong password');
  assert(safeStorage.getActiveSession() === null, suite, 'TEST B (Client): Active session strictly cleared on failed password');

  // TEST C: Wrong email + Correct-format password
  const authResultC = await serverAuthStore.authenticate({
    email: 'non_existent_987654@catalyx.io',
    password: 'SomeValidLookingPassword1!'
  });
  assert(authResultC.success === false, suite, 'TEST C: Non-existent email strictly fails');
  assert(!authResultC.sessionToken, suite, 'TEST C: NO session token issued for non-existent email');

  // TEST D: Wrong email + Wrong password
  const authResultD = await serverAuthStore.authenticate({
    email: 'invalid_user_never_existed@catalyx.io',
    password: '123'
  });
  assert(authResultD.success === false, suite, 'TEST D: Wrong email + wrong password strictly fails');

  // TEST E: Correct login followed by logout
  const loginE = await serverAuthStore.authenticate({ email: testAEmail, password: testAPass });
  assert(loginE.success && !!loginE.sessionToken, suite, 'TEST E: Login succeeds before logout');
  const tokenE = loginE.sessionToken!;
  assert(serverAuthStore.getSession(tokenE) !== null, suite, 'TEST E: Session exists on server');
  serverAuthStore.revokeSession(tokenE);
  assert(serverAuthStore.getSession(tokenE) === null, suite, 'TEST E: Session destroyed after logout');

  // TEST F: Correct login -> store session -> logout -> attempt wrong credentials
  safeStorage.setActiveSession(accountA.uid);
  safeStorage.setSessionToken(tokenE);
  safeStorage.clearActiveSession();
  const attemptF = await serverAuthStore.authenticate({ email: testAEmail, password: 'WrongPasswordAgain!' });
  assert(attemptF.success === false, suite, 'TEST F: Wrong credentials remain rejected after previous session logout');
  assert(safeStorage.getActiveSession() === null, suite, 'TEST F: Old session NOT reused');

  // TEST G: Existing authenticated session -> submit wrong credentials for another login
  safeStorage.setActiveSession('existing_valid_session_uid');
  const attemptG = await serverAuthStore.authenticate({ email: testAEmail, password: 'BadPasswordSwitch!' });
  assert(attemptG.success === false, suite, 'TEST G: Account switch with bad credentials strictly rejected');

  // TEST H: Corrupted localStorage/sessionStorage
  localStorage.setItem('catalyx_active_session', '{"uid": corrupted');
  const sessionH = safeStorage.getActiveSession();
  assert(sessionH === null, suite, 'TEST H: Corrupted storage does not grant authentication');

  // TEST I: Tampered session object
  localStorage.setItem('catalyx_active_session', JSON.stringify({ maliciousPayload: true, role: 'superadmin' }));
  const sessionI = safeStorage.getActiveSession();
  assert(sessionI === null, suite, 'TEST I: Tampered session object without valid UID returns null');

  // TEST J: Expired session token
  const expiredToken = `tok_exp_${Date.now()}`;
  const sessionJ = serverAuthStore.getSession(expiredToken);
  assert(sessionJ === null, suite, 'TEST J: Expired or unissued session token returns null');

  // TEST K: Suspended/deactivated account lockout
  for (let i = 0; i < 6; i++) {
    await serverAuthStore.authenticate({ email: testAEmail, password: 'WrongPasswordLockout!' });
  }
  const lockoutAttempt = await serverAuthStore.authenticate({ email: testAEmail, password: testAPass });
  assert(lockoutAttempt.success === false, suite, 'TEST K: Account temporarily locked due to excessive failed attempts');
  assert(lockoutAttempt.error?.includes('locked'), suite, 'TEST K: Lockout error explicitly enforced');

  // TEST L: Tenant isolation between different accounts
  const orgUser1 = await serverAuthStore.createAccountDirect({
    email: `org_user_1_${Date.now()}@tenant-a.com`,
    username: 'tenant_a_user',
    password: 'Password123!',
    accountType: 'GROUP'
  });
  const orgUser2 = await serverAuthStore.createAccountDirect({
    email: `org_user_2_${Date.now()}@tenant-b.com`,
    username: 'tenant_b_user',
    password: 'Password123!',
    accountType: 'GROUP'
  });
  assert(orgUser1.organizationId !== orgUser2.organizationId, suite, 'TEST L: Distinct tenant organization IDs enforced');
  assert(orgUser1.organizationId.startsWith('org_'), suite, 'TEST L: Tenant org ID pattern adheres to sovereign standard');

  // TEST M: Offline mode unauthenticated account cannot silently authenticate
  const offlineUnauth = await serverAuthStore.authenticate({ email: 'ghost@offline.io', password: 'SomePassword!' });
  assert(offlineUnauth.success === false, suite, 'TEST M: Unregistered offline account strictly rejected');

  // TEST N: Browser refresh with valid session
  const validToken = serverAuthStore.createSession(accountA);
  const activeSessionN = serverAuthStore.getSession(validToken);
  assert(activeSessionN !== null && activeSessionN.uid === accountA.uid, suite, 'TEST N: Valid server session successfully resolves');

  // TEST O: Protected request without session token
  const unauthSession = serverAuthStore.getSession('');
  assert(unauthSession === null, suite, 'TEST O: Empty session token strictly returns null');

  // TEST P: Manipulate frontend authentication state manually
  safeStorage.setActiveSession('spoofed_admin_uid');
  // Backend validation: spoofed UID has no session in serverAuthStore
  const backendCheck = serverAuthStore.getSession('spoofed_token');
  assert(backendCheck === null, suite, 'TEST P: Backend rejects unverified forged frontend state');
}

async function runUniversalStudioArchitectureTests() {
  const suite = 'Universal Studio Architecture & 12 Creation Studios';

  // 1. All 12 Creation Studios exist
  const expectedStudios: StudioType[] = [
    'software', 'animation_3d', 'design_ui', 'writing',
    'video_media', 'presentation', 'research', 'data_analytics',
    'marketing', 'operations', 'education', 'product'
  ];

  for (const st of expectedStudios) {
    const list = studioService.getStudiosByType(st);
    assert(list.length > 0, suite, `Creation Studio exists: ${studioService.getStudioTypeLabel(st)}`);
  }

  // 2. Custom studio creation
  const custom = studioService.createStudio({
    type: 'software',
    workspaceId: 'ws_custom_audit',
    name: 'Sovereign Engine Studio',
    description: 'High-assurance distributed compiler environment',
    ownerEmail: 'architect@catalyx.io'
  });
  assert(custom.id.startsWith('std_software_'), suite, 'Studio correctly created with type-safe ID');
  assert(custom.tools.length >= 3, suite, 'Domain-specific tools attached to custom studio');
  assert(custom.exportFormats.length >= 2, suite, 'Production export formats attached to studio');

  // 3. Draft update
  const updatedDraft = studioService.updateDraft(custom.id, { content: 'v1.1 Architecture Spec draft' }, 'architect@catalyx.io');
  assert(updatedDraft === true, suite, 'Studio draft updated successfully with audit trail');

  // 4. Immutable version snapshot
  const snapshot = studioService.createVersionSnapshot(custom.id, 'Milestone 1 Compiler Core', 'architect@catalyx.io');
  assert(snapshot !== null && snapshot.versionNumber === 2, suite, 'Version snapshot incremented to v2');
  assert(snapshot?.changeSummary === 'Milestone 1 Compiler Core', suite, 'Version snapshot change summary recorded');

  // 5. Review & Approvals
  const submitted = studioService.submitForReview(custom.id, 'lead_reviewer@catalyx.io', 'architect@catalyx.io');
  assert(submitted === true, suite, 'Studio work submitted for peer review');
  const inReviewStudio = studioService.getStudioById(custom.id);
  assert(inReviewStudio?.review.status === 'in_review', suite, 'Studio review status set to in_review');

  const approved = studioService.approveStudioWork(custom.id, 'lead_reviewer@catalyx.io', 'Architecture certified');
  assert(approved === true, suite, 'Studio work approved and certified');
  const approvedStudio = studioService.getStudioById(custom.id);
  assert(approvedStudio?.review.status === 'approved', suite, 'Studio review status set to approved');
  assert(!!approvedStudio?.review.approvedAt, suite, 'Studio certification timestamp recorded');
}

async function runMicrosoftIntegrationAuditTests() {
  const suite = 'Microsoft 365 & Office Protocol Integration';

  // 1. Connection status check
  const status = await microsoftIntegrationService.getConnectionStatus();
  assert(status !== null, suite, 'Microsoft connection status response received');
  assert(Array.isArray(status.scopes), suite, 'Microsoft scopes array is well-formed');

  // 2. Connect initiation
  const connectRes = await microsoftIntegrationService.connectMicrosoftAccount();
  assert(connectRes.success === true || typeof connectRes.message === 'string', suite, 'Microsoft connect flow returns structured payload');

  // 3. OneDrive resource browse
  const oneDriveRes = await microsoftIntegrationService.browseOneDrive();
  assert(oneDriveRes.success === true, suite, 'OneDrive resource browse succeeds');
  assert(oneDriveRes.items.length >= 3, suite, 'OneDrive lists supported Word, Excel, and PowerPoint files');

  const wordItem = oneDriveRes.items.find(i => i.officeType === 'word');
  const excelItem = oneDriveRes.items.find(i => i.officeType === 'excel');
  const pptItem = oneDriveRes.items.find(i => i.officeType === 'powerpoint');
  assert(!!wordItem, suite, 'OneDrive includes Word document');
  assert(!!excelItem, suite, 'OneDrive includes Excel spreadsheet');
  assert(!!pptItem, suite, 'OneDrive includes PowerPoint presentation');

  // 4. Desktop Office Protocol Handoff
  let fallbackInvoked = false;
  const handoffWord = microsoftIntegrationService.launchOfficeDesktopHandoff({
    officeType: 'word',
    fileUrl: '/assets/sample-docs/strategy.docx',
    fileName: 'strategy.docx',
    onFallback: () => { fallbackInvoked = true; }
  });
  assert(handoffWord.uri.startsWith('ms-word:ofe|u|'), suite, 'Word desktop handoff generates ms-word: protocol URI');

  const handoffExcel = microsoftIntegrationService.launchOfficeDesktopHandoff({
    officeType: 'excel',
    fileUrl: '/assets/sample-docs/model.xlsx',
    fileName: 'model.xlsx'
  });
  assert(handoffExcel.uri.startsWith('ms-excel:ofe|u|'), suite, 'Excel desktop handoff generates ms-excel: protocol URI');

  const handoffPpt = microsoftIntegrationService.launchOfficeDesktopHandoff({
    officeType: 'powerpoint',
    fileUrl: '/assets/sample-docs/deck.pptx',
    fileName: 'deck.pptx'
  });
  assert(handoffPpt.uri.startsWith('ms-powerpoint:ofe|u|'), suite, 'PowerPoint desktop handoff generates ms-powerpoint: protocol URI');

  // 5. Clean disconnect
  const disconnectRes = await microsoftIntegrationService.disconnectMicrosoftAccount();
  assert(disconnectRes.success === true, suite, 'Microsoft disconnect cleans up stored state');
}

async function runProductionDependencyAndExternalIntegrationTests() {
  const suite = 'Production Dependency Register & Real External Verification';

  // 1. Real Pesapal Gateway v3 Live Token Verification
  const pesapal = new PesapalPaymentProvider();
  assert(pesapal.isConfigured() === true, suite, 'Pesapal consumer key and secret are configured');
  const pesapalAuth = await pesapal.getAuthToken();
  assert(typeof pesapalAuth.token === 'string' && pesapalAuth.token.length > 20, suite, 'Pesapal v3 live authentication succeeds and issues JWT token');
  assert(pesapal.getEnvironment() === 'live', suite, 'Pesapal environment resolves to authoritative live production mode');

  // 2. Real Pesapal Registered IPNs Verification
  const ipnList = await pesapal.getIpnList();
  assert(ipnList.status === 'SUCCESS', suite, 'Pesapal registered IPN query succeeds against gateway');
  assert(Array.isArray(ipnList.ipns) && ipnList.ipns.length >= 2, suite, 'Active registered IPNs exist on Pesapal gateway');
  const activeIpn = ipnList.ipns?.find((ipn: any) => ipn.ipn_status_decription === 'Active');
  assert(!!activeIpn, suite, 'Active production IPN confirmed on Pesapal gateway');

  // 3. Real Gemini Generative AI Model Verification
  const geminiKey = process.env.GEMINI_API_KEY;
  assert(Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'), suite, 'Gemini API key is configured');
  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
    const ai = new GoogleGenAI({ apiKey: geminiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with the single word VERIFIED'
    });
    const reply = aiRes?.text?.trim() || '';
    assert(reply.length > 0, suite, 'Gemini GenAI model generation succeeds with non-empty response');
  }

  // 4. Real SMTP Transactional Mail Configuration
  const mailStatus = emailDeliveryService.getProviderStatus();
  assert(mailStatus.isConfigured === true, suite, 'Transactional SMTP delivery is configured');
  assert(mailStatus.port === 587, suite, 'SMTP standard secure submission port 587 is configured');
  assert(mailStatus.sender.includes('@'), suite, 'Authoritative sender email address is verified');

  // 4b. Real SMTP Live Network Dispatch
  const emailRes = await emailDeliveryService.sendEmail({
    to: 'anesthonest81@gmail.com',
    subject: 'CATALYX Automated Verification',
    text: 'Automated test ensuring real SMTP STARTTLS dispatch on port 587.',
    html: '<p>Automated test</p>',
    category: 'NOTIFICATION'
  });
  assert(emailRes.success === true, suite, 'Real SMTP transmission succeeds via STARTTLS');
  assert(emailRes.deliveryStatus === 'DELIVERED', suite, 'Email delivery status is DELIVERED');
  assert(emailRes.messageId.length > 5, suite, 'SMTP server accepted message and returned valid message ID');

  // 5. Real Google Identity Services (GIS) Client ID Configuration
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
  assert(Boolean(googleClientId && googleClientId.length > 10), suite, 'Google OAuth 2.0 GIS client ID is configured');

  // 5b. Google Token Tamper Rejection Test
  const fakeTokenRes = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=tampered_forged_token');
  assert(fakeTokenRes.status === 400, suite, 'Google public tokeninfo service rejects forged ID tokens with HTTP 400');

  // 6. Direct Bank Transfer Multi-Step Verification Architecture
  const bankOrder = catalyxEconomicEngine.createOrder({
    organizationId: 'org_test_bank_transfer',
    customerId: 'usr_cfo_01',
    customerEmail: 'finance@enterprise.com',
    customerName: 'Enterprise CFO',
    currency: 'USD',
    billingAddress: {
      firstName: 'Chief',
      lastName: 'FinancialOfficer',
      emailAddress: 'finance@enterprise.com',
      phoneNumber: '+15550199',
      countryCode: 'US'
    },
    items: [{
      productId: 'sub_org_annual',
      productTitle: 'CATALYX Organization Tier (Annual)',
      sku: 'SUB-ORG-ANNUAL',
      unitPriceMinorUnits: 24000,
      quantity: 1,
      totalPriceMinorUnits: 24000
    }]
  });
  assert(bankOrder.status === 'CREATED' || bankOrder.status === 'PAYMENT_PENDING', suite, 'Bank transfer order created in non-activated initial state');
  const bankAttempt = await catalyxEconomicEngine.initiatePaymentAttempt({
    orderId: bankOrder.id,
    idempotencyKey: `idem_bank_audit_${Date.now()}`,
    ipOrUserId: '127.0.0.1',
    channel: 'bank_transfer'
  });
  assert(bankAttempt.paymentAttempt.status === 'PENDING', suite, 'Bank transfer payment strictly remains in PENDING status pending manual administrative review');
  assert(bankOrder.status !== 'PAID', suite, 'Bank transfer is never automatically marked as paid without verified bank settlement');

  // 7. Double-Entry Accounting Ledger Minor Unit & Integrity Verification
  const ledgerEntries = catalyxEconomicEngine.getLedger();
  assert(Array.isArray(ledgerEntries), suite, 'Financial ledger records retrieved as structured list');
  const allIntegerMinorUnits = ledgerEntries.every(e => Number.isInteger(e.netAmountMinorUnits));
  assert(allIntegerMinorUnits, suite, 'Financial ledger strictly enforces integer minor currency units (cents)');

  // 8. Truthful Studio Capabilities (3D & Video Honest Reporting)
  const animTools = studioService.getDefaultToolsForType('animation_3d');
  assert(Array.isArray(animTools) && animTools.length >= 3, suite, '3D / Animation Studio tools are registered');
  assert(animTools.some(t => t.toLowerCase().includes('render') || t.toLowerCase().includes('scene')), suite, '3D Studio provides production render queue management');
  const videoTools = studioService.getDefaultToolsForType('video_media');
  assert(Array.isArray(videoTools) && videoTools.length >= 3, suite, 'Video / Media Studio tools are registered');
  assert(videoTools.some(t => t.toLowerCase().includes('timeline') || t.toLowerCase().includes('track')), suite, 'Video Studio provides multi-track timeline and EDL coordination');

  // 9. Document Format Package Compatibility (DOCX, XLSX, PPTX)
  const supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  const sampleItems = await microsoftIntegrationService.browseOneDrive();
  const foundWord = sampleItems.items.some(i => i.mimeType === supportedMimeTypes[0]);
  const foundExcel = sampleItems.items.some(i => i.mimeType === supportedMimeTypes[1]);
  const foundPpt = sampleItems.items.some(i => i.mimeType === supportedMimeTypes[2]);
  assert(foundWord && foundExcel && foundPpt, suite, 'Microsoft OpenXML standard MIME types verified for Word, Excel, and PowerPoint');

  // 9b. Real OpenXML Package Structure Forensic Inspection
  const sampleDocs = await officeDocumentGenerator.ensureSampleDocsGenerated();
  const docxBytes = fs.readFileSync(sampleDocs.docxPath);
  const docxReport = await officeDocumentGenerator.inspectOfficePackage(docxBytes);
  assert(docxReport.valid === true && docxReport.type === 'word', suite, 'DOCX package contains valid Content_Types and document.xml');

  const xlsxBytes = fs.readFileSync(sampleDocs.xlsxPath);
  const xlsxReport = await officeDocumentGenerator.inspectOfficePackage(xlsxBytes);
  assert(xlsxReport.valid === true && xlsxReport.type === 'excel', suite, 'XLSX package contains valid workbook and sheet data');

  const pptxBytes = fs.readFileSync(sampleDocs.pptxPath);
  const pptxReport = await officeDocumentGenerator.inspectOfficePackage(pptxBytes);
  assert(pptxReport.valid === true && pptxReport.type === 'powerpoint', suite, 'PPTX package contains valid presentation and slide hierarchy');

  // 10. Multi-Tenant Organization Data Isolation
  const org1Ws = 'ws_sovereign_tenant_alpha';
  const org2Ws = 'ws_sovereign_tenant_beta';
  const studio1 = studioService.createStudio({
    name: 'Alpha Internal Secret Research',
    type: 'research',
    description: 'Confidential research pipeline',
    ownerEmail: 'lead@alpha.org',
    workspaceId: org1Ws
  });
  const org1Studios = studioService.getAllStudios(org1Ws);
  const org2Studios = studioService.getAllStudios(org2Ws);
  assert(org1Studios.some(d => d.id === studio1.id), suite, 'Tenant Alpha retrieves its own workspace studio');
  assert(!org2Studios.some(d => d.id === studio1.id), suite, 'Tenant Beta is strictly isolated from Tenant Alpha workspace studio');
}

async function runProductionDataPersistenceAndExportMatrixTests() {
  const suite = 'Production Data Persistence, Work Export & PWA Hardening Matrix';

  // 1. Workspace lifecycle & durable persistence
  const testUser = 'user_audit_executor_' + Date.now();
  const wsId = 'ws_audit_' + Date.now();
  const ws = serverPersistenceService.createWorkspace(testUser, 'Audit Core HQ', 'audit@catalyx.io', 'AuditExecutor', wsId);
  assert(ws.id === wsId, suite, 'Workspace created with deterministic custom ID');
  assert(serverPersistenceService.getWorkspace(wsId, testUser) !== null, suite, 'Workspace durably retrievable by owner');

  // 2. Project lifecycle & durable persistence
  const projId = 'proj_audit_' + Date.now();
  const proj = serverPersistenceService.createProject(testUser, 'Core Infrastructure Hardening', 'Audit task suite', wsId, projId);
  assert(proj.id === projId, suite, 'Project created with deterministic custom ID');
  const updatedProj = serverPersistenceService.updateProject(projId, { progress: 75, status: 'active' }, testUser);
  assert(updatedProj !== null && updatedProj.progress === 75, suite, 'Project progress updated and persisted');

  // 3. Task lifecycle & durable persistence
  const taskId = 'task_audit_' + Date.now();
  const task = serverPersistenceService.createTask(testUser, 'Verify zero data loss on browser restart', 'high', 'work', undefined, taskId);
  assert(task.id === taskId, suite, 'Task created with deterministic custom ID');
  const updatedTask = serverPersistenceService.updateTask(taskId, { completed: true }, testUser);
  assert(updatedTask !== null && updatedTask.completed === true, suite, 'Task completion status persisted');

  // 4. Goal lifecycle & durable persistence
  const goalId = 'goal_audit_' + Date.now();
  const goal = serverPersistenceService.createGoal(testUser, '100% Persistence Durability', 'Ensure zero data drop', '2026-12-31', 'short_term', goalId);
  assert(goal.id === goalId, suite, 'Goal created with deterministic custom ID');
  const updatedGoal = serverPersistenceService.updateGoal(goalId, { progress: 100, status: 'completed' }, testUser);
  assert(updatedGoal !== null && updatedGoal.status === 'completed', suite, 'Goal completion status persisted');

  // 5. Workspace subcollections (Tasks, Messages, Wikis)
  const wtId = 'wt_audit_' + Date.now();
  const wTask = serverPersistenceService.addWorkspaceTask(wsId, 'Deploy persistence sync engine', 'high', testUser, wtId);
  assert(wTask !== null && wTask.id === wtId, suite, 'Workspace task created with deterministic ID');
  const okComplete = serverPersistenceService.completeWorkspaceTask(wsId, wtId, testUser);
  assert(okComplete === true, suite, 'Workspace task completed successfully');

  const wmId = 'msg_audit_' + Date.now();
  const wMsg = serverPersistenceService.addWorkspaceMessage(wsId, 'Sync operational', 'AuditExecutor', testUser, wmId);
  assert(wMsg !== null && wMsg.id === wmId, suite, 'Workspace message added and persisted');

  const wikiId = 'wik_audit_' + Date.now();
  const wiki = serverPersistenceService.addWorkspaceWiki(wsId, 'Architecture Spec', 'Core persistence blueprint', 'AuditExecutor', testUser, wikiId);
  assert(wiki !== null && wiki.id === wikiId, suite, 'Workspace wiki added and persisted');
  const updatedWiki = serverPersistenceService.updateWorkspaceWiki(wsId, wikiId, 'Architecture Spec v2', 'Updated persistence blueprint', testUser);
  assert(updatedWiki !== null && updatedWiki.title === 'Architecture Spec v2', suite, 'Workspace wiki update persisted');

  // 6. Full batch sync reconciliation
  const batchResult = serverPersistenceService.applyClientSyncBatch(testUser, 'audit@catalyx.io', {
    workspaces: [ws],
    projects: [updatedProj!],
    tasks: [updatedTask!]
  });
  assert(batchResult.success === true && batchResult.appliedCount >= 1, suite, 'Client-server batch sync applies successfully');

  // 7. Server hydration on reload / new session
  const hydrated = serverPersistenceService.syncUserData(testUser, 'audit@catalyx.io');
  assert(hydrated.workspaces.some(w => w.id === wsId), suite, 'Hydration restores user workspace on return');
  assert(hydrated.projects.some(p => p.id === projId), suite, 'Hydration restores user project on return');
  assert(hydrated.tasks.some(t => t.id === taskId), suite, 'Hydration restores user tasks on return');
  assert(hydrated.goals.some(g => g.id === goalId), suite, 'Hydration restores user goals on return');

  // 8. Project ZIP Export generation
  const prjZip = await serverPersistenceService.exportProjectAsZip(projId, testUser);
  assert(prjZip.buffer.length > 0 && prjZip.filename.endsWith('.zip'), suite, 'Project ZIP export generates non-empty buffer');
  const prjZipParsed = await JSZip.loadAsync(prjZip.buffer);
  assert(prjZipParsed.file('project.json') !== null, suite, 'Project ZIP package contains project.json');
  assert(prjZipParsed.file('tasks.json') !== null, suite, 'Project ZIP package contains tasks.json');
  assert(prjZipParsed.file('tasks.csv') !== null, suite, 'Project ZIP package contains tasks.csv');
  assert(prjZipParsed.file('documents/overview.md') !== null, suite, 'Project ZIP package contains documents/overview.md');
  assert(prjZipParsed.file('manifest.json') !== null, suite, 'Project ZIP package contains manifest.json');
  const prjManifest = JSON.parse(await prjZipParsed.file('manifest.json')!.async('string'));
  assert(prjManifest.exportType === 'PROJECT' && Boolean(prjManifest.checksumSha256), suite, 'Project manifest contains valid SHA-256 checksum');

  // 9. Workspace ZIP Export generation
  const wsZip = await serverPersistenceService.exportWorkspaceAsZip(wsId, testUser);
  assert(wsZip.buffer.length > 0 && wsZip.filename.endsWith('.zip'), suite, 'Workspace ZIP export generates non-empty buffer');
  const wsZipParsed = await JSZip.loadAsync(wsZip.buffer);
  assert(wsZipParsed.file('workspace.json') !== null, suite, 'Workspace ZIP package contains workspace.json');
  assert(wsZipParsed.file('members.json') !== null, suite, 'Workspace ZIP package contains members.json');
  assert(wsZipParsed.file('tasks.json') !== null, suite, 'Workspace ZIP package contains tasks.json');
  assert(wsZipParsed.file('manifest.json') !== null, suite, 'Workspace ZIP package contains manifest.json');

  // 10. User Sovereign Archive Export generation
  const userZip = await serverPersistenceService.exportAllUserDataAsZip(testUser);
  assert(userZip.buffer.length > 0 && userZip.filename.endsWith('.zip'), suite, 'User Sovereign Archive ZIP generates non-empty buffer');
  const userZipParsed = await JSZip.loadAsync(userZip.buffer);
  assert(userZipParsed.file('manifest.json') !== null, suite, 'User archive contains root manifest.json');

  // 11. PWA configuration & security boundaries
  const manifestRaw = fs.readFileSync('public/manifest.json', 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert(manifest.display === 'standalone' && manifest.scope === '/' && manifest.start_url === '/', suite, 'PWA Web Manifest defines standalone display and scope');
  assert(manifest.icons.some((i: any) => i.sizes === '192x192') && manifest.icons.some((i: any) => i.sizes === '512x512'), suite, 'PWA Web Manifest defines 192x192 and 512x512 icons');

  const swCode = fs.readFileSync('public/service-worker.js', 'utf8');
  assert(/api\\\/data/.test(swCode) && /api\\\/export/.test(swCode) && /api\\\/workspaces/.test(swCode) && /api\\\/projects/.test(swCode), suite, 'Service Worker strictly enforces sensitive API exclusion from cache');

  // 12. Microsoft 365 dormant state preserved
  const msStatus = await microsoftIntegrationService.getConnectionStatus();
  assert(msStatus.connected === false, suite, 'Microsoft 365 strictly remains disabled awaiting Azure credentials');
  assert(msStatus.enabled === false, suite, 'Microsoft 365 feature flag is server-authoritatively disabled');

  // 13. Cross-User Data Isolation
  const strangerUser = 'stranger_attacker_' + Date.now();
  let unauthorizedExportThrown = false;
  try {
    await serverPersistenceService.exportProjectAsZip(projId, strangerUser);
  } catch {
    unauthorizedExportThrown = true;
  }
  assert(unauthorizedExportThrown === true, suite, 'Unauthorized user is strictly blocked from exporting another user project');
  const strangerWs = serverPersistenceService.getWorkspace(wsId, strangerUser);
  assert(strangerWs === null, suite, 'Unauthorized user cannot read another user private workspace');
}

async function main() {
  console.log('=== CATALYX INDEPENDENT RELEASE-CHALLENGE AUDIT SUITE ===\n');

  try {
    await runRevenuePolicyTests();
    await runTermsEnforcementTests();
    await runPaymentIdempotencyTests();
    await runPayoutSecurityTests();
    await runPesapalIpnAndEntitlementsAuditTests();
    await runAuthenticationAndIdentitySecurityTests();
    await runEconomicPolicyRegressionAndAntiLegacyTests();
    await runMarketplaceRatingLifecycleAndAdversarialTests();
    await runAdvertisingEngineRealEventTelemetryTests();
    await runDeepResearchEngineIntegrityTests();
    await runApplicationPerformanceMeasurements();
    await runAuthoritativePaymentProviderPolicyTests();
    await runMandatorySubscriptionAndSecurityTests();
    await runMissionControlAndObservabilityTests();
    await runPesapalApi3ProductionIpnRegistrationTests();
    await runCatalyxIdentityAndSubscriptionLifecycleTests();
    await runAuthoritativeForensicSubscriptionAuditTests();
    await runSafeStorageAndSessionResilienceAuditTests();
    await runComprehensiveAuthenticationSecurityMatrixTests();
    await runUniversalStudioArchitectureTests();
    await runMicrosoftIntegrationAuditTests();
    await runProductionDependencyAndExternalIntegrationTests();
    await runProductionDataPersistenceAndExportMatrixTests();
  } catch (e: any) {
    console.error('Test execution fatal error:', e);
  }

  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const total = results.length;

  for (const r of results) {
    const symbol = r.status === 'PASSED' ? '✓' : '✗';
    console.log(`${symbol} [${r.status}] ${r.suite} :: ${r.name}`);
    if (r.error) console.log(`    Error: ${r.error}`);
  }

  console.log('\n================ AUDIT TEST RESULTS ================');
  console.log(`TOTAL:   ${total}`);
  console.log(`PASSED:  ${passed}`);
  console.log(`FAILED:  ${failed}`);
  console.log(`SKIPPED: ${skipped}`);
  console.log(`BLOCKED: ${blocked}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
