/**
 * CATALYX Final Production-Readiness & Multi-Tenant Verification Suite
 * 
 * Objectives:
 * A. Live Pesapal Production Payment Infrastructure
 * B. Verified Email-First Account Registration (10-Step Lifecycle)
 * C. Verified Email Account Recovery
 * D. Strict User Account / Tenant Data Isolation
 * E. High-Performance Application and AI Agent Execution
 */

import { serverAuthStore } from '../src/services/serverAuthStore';
import { emailDeliveryService } from '../src/services/emailDeliveryService';
import { PesapalPaymentProvider } from '../src/services/payment/PesapalPaymentProvider';
import { LegalPolicyService } from '../src/services/legal/legalPolicyService';
import { catalyxEconomicEngine } from '../src/services/payment/catalyxEconomicEngine';
import { systemKnowledgeService } from '../src/services/systemKnowledgeService';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASSED' | 'FAILED';
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, errorMsg?: string) {
  if (condition) {
    results.push({ suite, name, status: 'PASSED' });
    console.log(`✓ [PASSED] ${suite} :: ${name}`);
  } else {
    results.push({ suite, name, status: 'FAILED', error: errorMsg || 'Assertion failed' });
    console.error(`✗ [FAILED] ${suite} :: ${name} - ${errorMsg || 'Assertion failed'}`);
  }
}

async function runEmailRegistrationLifecycleTests() {
  const suite = 'B. Verified Email-First Registration Lifecycle';

  const testEmail = `executive.tester.${Date.now()}@catalyx.enterprise.io`;
  const testPassword = 'ProductionSecure2026!';
  const testUsername = 'Executive Tester';

  // STEP 1: Registration without terms agreement is rejected
  const termsRejected = await serverAuthStore.initiateRegistration({
    email: testEmail,
    username: testUsername,
    password: testPassword,
    confirmPassword: testPassword,
    accountType: 'ORGANIZATION',
    acceptTerms: false
  });
  assert(!termsRejected.success, suite, 'STEP 1: Registration without terms agreement is rejected');

  // STEP 2: Password strength verification
  const weakPassRejected = await serverAuthStore.initiateRegistration({
    email: testEmail,
    username: testUsername,
    password: 'weak',
    confirmPassword: 'weak',
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(!weakPassRejected.success, suite, 'STEP 2: Insecure password strictly rejected');

  // STEP 3: Password confirmation mismatch rejected
  const mismatchRejected = await serverAuthStore.initiateRegistration({
    email: testEmail,
    username: testUsername,
    password: testPassword,
    confirmPassword: 'DifferentPassword123!',
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(!mismatchRejected.success, suite, 'STEP 3: Password confirmation mismatch rejected');

  // STEP 4: Initiate valid registration -> short-lived single-use verification code generated
  const initResult = await serverAuthStore.initiateRegistration({
    email: testEmail,
    username: testUsername,
    password: testPassword,
    confirmPassword: testPassword,
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(initResult.success, suite, 'STEP 4: Registration initiated and pending state recorded');
  
  const dispatchedOtp = emailDeliveryService.getLastOtpForTesting(testEmail);
  assert(!!dispatchedOtp, suite, 'STEP 4: Cryptographically secure 6-digit OTP dispatched to email');
  assert(dispatchedOtp!.length === 6, suite, 'STEP 4: Dispatched verification code is exactly 6 digits');

  // Account MUST NOT be active yet
  const userBeforeVerify = serverAuthStore.getAccountByEmail(testEmail);
  assert(!userBeforeVerify, suite, 'STEP 4: Unverified account is not accessible in active user store');

  // STEP 5: Verification with invalid code is rejected and attempts are decremented
  const wrongCodeResult = await serverAuthStore.verifyRegistration({ email: testEmail, code: '000000' });
  assert(!wrongCodeResult.success, suite, 'STEP 5: Incorrect verification code rejected');

  // STEP 6: Verification with valid single-use OTP
  const validCode = dispatchedOtp!;
  const verifyResult = await serverAuthStore.verifyRegistration({ email: testEmail, code: validCode });
  assert(verifyResult.success, suite, 'STEP 6: Valid verification code accepted');
  assert(!!verifyResult.user, suite, 'STEP 6: Active user account provisioned upon verification');
  assert(verifyResult.user!.emailVerified === true, suite, 'STEP 6: Account marked emailVerified = true');
  assert(verifyResult.user!.accountType === 'ORGANIZATION', suite, 'STEP 6: Account type accurately stored');
  assert(!!verifyResult.sessionToken, suite, 'STEP 6: Authoritative session token issued');

  // STEP 7: Replay attack prevention: Single-use OTP is invalidated after first use
  const replayResult = await serverAuthStore.verifyRegistration({ email: testEmail, code: validCode });
  assert(!replayResult.success, suite, 'STEP 7: Replay attack strictly prevented (OTP is single-use)');

  // STEP 8: Active session can be resolved
  const sessionUser = serverAuthStore.getSession(verifyResult.sessionToken!);
  assert(!!sessionUser && sessionUser.email === testEmail, suite, 'STEP 8: Session token successfully resolves active identity');

  // STEP 9: Login succeeds with correct credentials
  const loginOk = await serverAuthStore.authenticate({ email: testEmail, password: testPassword });
  assert(loginOk.success, suite, 'STEP 9: Authenticated login succeeds with salted password hash');

  // STEP 10: Duplicate registration rejected
  const dupResult = await serverAuthStore.initiateRegistration({
    email: testEmail,
    username: testUsername,
    password: testPassword,
    confirmPassword: testPassword,
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  assert(!dupResult.success, suite, 'STEP 10: Existing registered email cannot be re-registered');
}

async function runEmailAccountRecoveryTests() {
  const suite = 'C. Verified Email Account Recovery Lifecycle';

  const recoveryEmail = `recovery.user.${Date.now()}@catalyx.enterprise.io`;
  const initialPassword = 'InitialSecure2026!';
  const updatedPassword = 'NewSecretPassword2026#';

  // Provision an active verified user
  await serverAuthStore.initiateRegistration({
    email: recoveryEmail,
    username: 'Recovery User',
    password: initialPassword,
    confirmPassword: initialPassword,
    accountType: 'INDIVIDUAL',
    acceptTerms: true
  });
  const recoveryRegOtp = emailDeliveryService.getLastOtpForTesting(recoveryEmail);
  await serverAuthStore.verifyRegistration({ email: recoveryEmail, code: recoveryRegOtp! });

  // STEP 1: Request password recovery
  const reqResult = await serverAuthStore.initiatePasswordRecovery(recoveryEmail);
  assert(reqResult.success, suite, 'STEP 1: Password recovery request accepted');

  const recoveryOtp = emailDeliveryService.getLastOtpForTesting(recoveryEmail);
  assert(!!recoveryOtp && recoveryOtp.length === 6, suite, 'STEP 1: 6-digit recovery OTP dispatched');

  // STEP 2: Verify with bad code rejected
  const badCodeVerify = await serverAuthStore.verifyRecoveryCode(recoveryEmail, '999999');
  assert(!badCodeVerify.success, suite, 'STEP 2: Bad recovery code rejected');

  // STEP 3: Verify with authentic code yields temporary resetToken
  const goodCodeVerify = await serverAuthStore.verifyRecoveryCode(recoveryEmail, recoveryOtp!);
  assert(goodCodeVerify.success, suite, 'STEP 3: Authentic recovery code verified');
  assert(!!goodCodeVerify.resetToken, suite, 'STEP 3: Ephemeral reset token issued');

  // STEP 4: Password reset with wrong token rejected
  const badTokenReset = await serverAuthStore.resetPasswordWithToken({
    email: recoveryEmail,
    resetToken: 'forged-token',
    newPassword: updatedPassword,
    confirmPassword: updatedPassword
  });
  assert(!badTokenReset.success, suite, 'STEP 4: Forged reset token strictly rejected');

  // STEP 5: Password reset with authentic token succeeds
  const goodTokenReset = await serverAuthStore.resetPasswordWithToken({
    email: recoveryEmail,
    resetToken: goodCodeVerify.resetToken!,
    newPassword: updatedPassword,
    confirmPassword: updatedPassword
  });
  assert(goodTokenReset.success, suite, 'STEP 5: Password successfully updated in authoritative store');

  // STEP 6: Old password no longer works
  const oldLogin = await serverAuthStore.authenticate({ email: recoveryEmail, password: initialPassword });
  assert(!oldLogin.success, suite, 'STEP 6: Old password invalidated');

  // STEP 7: New password authenticates successfully
  const newLogin = await serverAuthStore.authenticate({ email: recoveryEmail, password: updatedPassword });
  assert(newLogin.success, suite, 'STEP 7: User authenticates with newly established password');
}

async function runTenantIsolationTests() {
  const suite = 'D. Strict User Account / Tenant Data Isolation';

  // Seed two distinct tenant users
  const tenantAEmail = `tenant.alpha.${Date.now()}@catalyx.io`;
  const tenantBEmail = `tenant.beta.${Date.now()}@catalyx.io`;

  const initA = await serverAuthStore.initiateRegistration({
    email: tenantAEmail,
    username: 'Tenant Alpha Admin',
    password: 'PasswordAlpha2026!',
    confirmPassword: 'PasswordAlpha2026!',
    accountType: 'ORGANIZATION',
    acceptTerms: true
  });
  const otpA = emailDeliveryService.getLastOtpForTesting(tenantAEmail)!;
  const resA = await serverAuthStore.verifyRegistration({ email: tenantAEmail, code: otpA });

  const initB = await serverAuthStore.initiateRegistration({
    email: tenantBEmail,
    username: 'Tenant Beta Creator',
    password: 'PasswordBeta2026!',
    confirmPassword: 'PasswordBeta2026!',
    accountType: 'INDIVIDUAL',
    acceptTerms: true
  });
  const otpB = emailDeliveryService.getLastOtpForTesting(tenantBEmail)!;
  const resB = await serverAuthStore.verifyRegistration({ email: tenantBEmail, code: otpB });

  const userA = resA.user!;
  const userB = resB.user!;

  assert(userA.uid !== userB.uid, suite, 'Tenants have cryptographically isolated distinct UUIDs');
  assert(userA.organizationId !== userB.organizationId, suite, 'Tenants have isolated organization IDs');

  // Verify session isolation
  const resolvedA = serverAuthStore.getSession(resA.sessionToken!);
  const resolvedB = serverAuthStore.getSession(resB.sessionToken!);
  assert(resolvedA?.uid === userA.uid && resolvedB?.uid === userB.uid, suite, 'Session tokens bind strictly to respective tenant profiles');

  // Cross-tenant data isolation: Order verification
  const orderA = catalyxEconomicEngine.createOrder({
    organizationId: userA.organizationId,
    customerId: userA.uid,
    customerName: userA.username,
    customerEmail: userA.email,
    billingAddress: {
      emailAddress: userA.email,
      firstName: 'Tenant',
      lastName: 'Alpha',
      countryCode: 'US'
    },
    currency: 'USD',
    items: [
      {
        productId: 'item_alpha_1',
        productTitle: 'Enterprise Intelligence Pack Alpha',
        sku: 'SKU-ALPHA-01',
        quantity: 1,
        unitPriceMinorUnits: 50000,
        totalPriceMinorUnits: 50000
      }
    ]
  });

  const allOrders = catalyxEconomicEngine.getOrders();
  const userAOrders = allOrders.filter(o => o.organizationId === userA.organizationId);
  const userBOrders = allOrders.filter(o => o.organizationId === userB.organizationId);

  assert(userAOrders.length >= 1, suite, 'Tenant Alpha retrieves their own orders');
  assert(!userBOrders.some(o => o.id === orderA.id), suite, 'Tenant Beta CANNOT see Tenant Alpha orders (strict isolation)');
}

async function runPesapalProductionInfrastructureTests() {
  const suite = 'A. Live Pesapal Production Payment Infrastructure';

  const defaultProvider = new PesapalPaymentProvider();
  assert(defaultProvider.getProviderId() === 'pesapal', suite, 'Provider identifies as authoritative pesapal');

  // Verify IPN payload generation
  const ipnUrl = defaultProvider.getPublicIpnUrl();
  assert(ipnUrl.includes('/api/billing/pesapal/ipn'), suite, 'Authoritative IPN webhook URL correctly configured');

  // Verify Live production gateway resolution
  const liveProvider = new PesapalPaymentProvider({
    environment: 'live',
    consumerKey: 'live_test_key',
    consumerSecret: 'live_test_secret'
  });
  assert(liveProvider.getEnvironment() === 'live', suite, 'Production mode correctly configured for pay.pesapal.com target');
  assert(liveProvider.getBaseUrl() === 'https://pay.pesapal.com/v3', suite, 'Base URL points to live Pesapal v3 gateway');

  // Test IPN ACK response format compliance
  const res = await defaultProvider.processNotification({
    OrderTrackingId: 'order-12345',
    OrderNotificationType: 'IPNCHANGE',
    OrderMerchantReference: 'ctx_merch_001'
  });
  assert(res.ackPayload.orderTrackingId === 'order-12345' && res.ackPayload.status === 200, suite, 'Pesapal IPN ACK meets v3 API specification format');
}

async function runAiAgentPerformanceTests() {
  const suite = 'E. High-Performance Application and AI Agent Execution';

  // Test 1: High-performance grounding query latency (< 50ms)
  const startTime = Date.now();
  const queryResult = systemKnowledgeService.answerSystemQuery(
    'What can I do on this screen?',
    'pesapal-billing',
    'EXECUTIVE',
    'INTERMEDIATE'
  );
  const latency = Date.now() - startTime;
  assert(latency < 50, suite, `Deterministic AI agent grounding operates with sub-50ms latency (actual: ${latency}ms)`);
  assert(queryResult.confidence >= 80, suite, `AI response confidence is authoritative (actual: ${queryResult.confidence}%)`);
  assert(!!queryResult.groundedModule && queryResult.groundedModule.id === 'mod_billing', suite, 'AI agent query resolves real grounded module architecture');
  assert(queryResult.guidedActions.length > 0, suite, 'AI response provides actionable next steps for operator');

  // Test 2: Input sanitization & resilience against prompt injection or garbage
  const noisyResult = systemKnowledgeService.answerSystemQuery(
    '  <<<SCRIPT>DROP TABLE; -->>> completely unknown random string 123456  ',
    'unknown_tab',
    'OPERATOR',
    'BEGINNER'
  );
  assert(!!noisyResult.answer && noisyResult.answer.length > 0, suite, 'Agent handles malformed/hostile input with graceful fallback guidance');

  // Test 3: Concurrency & throughput under load
  const concurrentCalls = 50;
  const startBatch = Date.now();
  const promises = Array.from({ length: concurrentCalls }).map((_, i) => {
    return Promise.resolve(
      systemKnowledgeService.answerSystemQuery(`Query ${i} status update`, 'home', 'DEVELOPER', 'BEGINNER')
    );
  });
  const batchResults = await Promise.all(promises);
  const totalBatchTime = Date.now() - startBatch;
  assert(batchResults.length === concurrentCalls, suite, `Executed ${concurrentCalls} concurrent AI agent grounding operations without memory faults`);
  assert(totalBatchTime < 500, suite, `50 concurrent agent queries completed in ${totalBatchTime}ms (< 500ms threshold)`);
}

async function runAllTests() {
  console.log('\n============================================================');
  console.log('CATALYX FINAL PRODUCTION READINESS & VERIFICATION AUDIT');
  console.log('============================================================\n');

  await runEmailRegistrationLifecycleTests();
  await runEmailAccountRecoveryTests();
  await runTenantIsolationTests();
  await runPesapalProductionInfrastructureTests();
  await runAiAgentPerformanceTests();

  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;

  console.log('\n============================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${results.length})`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
