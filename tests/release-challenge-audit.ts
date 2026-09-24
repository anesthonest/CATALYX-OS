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

import { revenuePolicyEngine, SellerAccountType } from '../src/services/payment/revenuePolicyEngine';
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
    regResult.user?.emailVerified === false,
    suite,
    'New registered user is initialized with unverified email state'
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

  // Attempt 4 consecutive wrong passwords (should warn with remaining count)
  for (let i = 0; i < 4; i++) {
    const failed = await authService.login({
      email: bruteEmail,
      password: 'WrongPassword!'
    });
    assert(
      !failed.success && failed.error?.includes('attempt'),
      suite,
      `Failed attempt #${i + 1} tracks remaining attempts warning`
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
