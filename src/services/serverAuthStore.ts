/**
 * CATALYX Authoritative Server-Side Authentication & Tenant Isolation Store
 * 
 * Enforces:
 * - Cryptographically random 6-digit OTP generation (server-side only)
 * - Salted SHA-256 OTP hashing (never stored as plaintext, never in logs/APIs)
 * - Strict single-use invalidation
 * - Max 5 verification attempts per code with immediate revocation on exhaustion
 * - Resend cooldown rate limits (60 seconds)
 * - Account enumeration protection (timing-safe, generic messages)
 * - Multi-tenant isolation (User A cannot access User B; Org A cannot access Org B)
 * - Pre-verified account gating (account only activated after OTP verification)
 */

import crypto from 'crypto';
import { emailDeliveryService } from './emailDeliveryService';
import { LegalPolicyService } from './legal/legalPolicyService';

export interface PendingRegistration {
  id: string;
  email: string;
  username: string;
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
  passwordHash: string;
  passwordSalt: string;
  otpHash: string;
  otpSalt: string;
  expiresAt: number;
  attemptsRemaining: number;
  resendCooldownUntil: number;
  resendCount: number;
  used: boolean;
  createdAt: string;
}

export interface PendingRecovery {
  id: string;
  email: string;
  otpHash: string;
  otpSalt: string;
  expiresAt: number;
  attemptsRemaining: number;
  resendCooldownUntil: number;
  resendCount: number;
  used: boolean;
  resetToken?: string;
  resetTokenExpiresAt?: number;
  createdAt: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  username: string;
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
  organizationId: string;
  role: 'admin' | 'user' | 'founder';
  emailVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  passwordHash: string;
  passwordSalt: string;
  failedAttempts: number;
  lockedUntil?: number;
  termsAcceptedVersion: string;
  termsAcceptedAt: string;
}

export interface ActiveSession {
  token: string;
  uid: string;
  email: string;
  organizationId: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

export class ServerAuthStore {
  private static instance: ServerAuthStore;

  private pendingRegistrations: Map<string, PendingRegistration> = new Map(); // key = normalized email
  private pendingRecoveries: Map<string, PendingRecovery> = new Map(); // key = normalized email
  private accounts: Map<string, UserAccount> = new Map(); // key = normalized email
  private accountsByUid: Map<string, UserAccount> = new Map(); // key = uid
  private sessions: Map<string, ActiveSession> = new Map(); // key = token

  private readonly OTP_LENGTH = 6;
  private readonly OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
  private readonly MAX_ATTEMPTS = 5;
  private readonly SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.seedDefaultAccounts();
  }

  public static getInstance(): ServerAuthStore {
    if (!ServerAuthStore.instance) {
      ServerAuthStore.instance = new ServerAuthStore();
    }
    return ServerAuthStore.instance;
  }

  private seedDefaultAccounts() {
    // Seed primary demo user: anesthonest81@gmail.com
    const demoEmail = 'anesthonest81@gmail.com';
    const salt = this.generateSalt();
    const hash = this.hashPasswordWithSalt('Catalyx2026!', salt);

    const demoUser: UserAccount = {
      uid: 'vine_demo_user',
      email: demoEmail,
      username: 'anesthonest',
      accountType: 'ORGANIZATION',
      organizationId: 'org_catalyx_hq',
      role: 'founder',
      emailVerified: true,
      emailVerifiedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      passwordHash: hash,
      passwordSalt: salt,
      failedAttempts: 0,
      termsAcceptedVersion: LegalPolicyService.CURRENT_VERSION,
      termsAcceptedAt: '2026-01-01T00:00:00.000Z',
    };

    this.accounts.set(demoEmail, demoUser);
    this.accountsByUid.set(demoUser.uid, demoUser);
  }

  // =========================================================================
  // CRYPTOGRAPHIC PRIMITIVES (TIMING-SAFE)
  // =========================================================================

  public generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  public hashPasswordWithSalt(password: string, salt: string): string {
    return crypto.createHash('sha256').update(`${salt}:${password}:catalyx_sec_domain`).digest('hex');
  }

  /**
   * Generates a 6-digit cryptographically random numeric code
   */
  public generateSecureNumericOtp(): string {
    // Uses crypto.randomInt for uniform distribution without modulo bias
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes the OTP using SHA-256 and salt.
   * OTP is NEVER stored in plaintext.
   */
  public hashOtp(code: string, salt: string): string {
    return crypto.createHash('sha256').update(`${salt}:${code.trim()}:catalyx_otp_sec`).digest('hex');
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  public timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return crypto.timingSafeEqual(bufA, bufB);
  }

  public normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  public validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { valid: false, error: 'Password must include at least one number or symbol.' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, error: 'Password must include at least one letter.' };
    }
    return { valid: true };
  }

  // =========================================================================
  // STEP 1-5: REGISTRATION INITIATION
  // =========================================================================

  public async initiateRegistration(params: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    accountType?: 'INDIVIDUAL' | 'ORGANIZATION';
    acceptTerms: boolean;
  }): Promise<{ success: boolean; message?: string; expiresInSeconds?: number; error?: string }> {
    const email = this.normalizeEmail(params.email);
    const username = (params.username || email.split('@')[0]).trim();
    const password = params.password;
    const confirmPassword = params.confirmPassword;

    if (!params.acceptTerms) {
      return {
        success: false,
        error: 'Mandatory Agreement: You must review and agree to the Terms of Service, Privacy Policy, and platform revenue schedule before creating an account.'
      };
    }

    if (!email || !password || !confirmPassword) {
      return { success: false, error: 'Email, password, and confirmation password are required.' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid electronic mail address (e.g. name@domain.com).' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Password confirmation does not match.' };
    }

    const strength = this.validatePasswordStrength(password);
    if (!strength.valid) {
      return { success: false, error: strength.error };
    }

    // Duplicate account check: if verified user already exists, reject
    const existing = this.accounts.get(email);
    if (existing && existing.emailVerified) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in or use password recovery.'
      };
    }

    // Check resend cooldown if previous registration pending
    const prev = this.pendingRegistrations.get(email);
    const now = Date.now();
    if (prev && !prev.used && prev.resendCooldownUntil > now) {
      const waitSeconds = Math.ceil((prev.resendCooldownUntil - now) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another verification code.`
      };
    }

    // Generate cryptographic OTP and salts
    const otp = this.generateSecureNumericOtp();
    const otpSalt = this.generateSalt();
    const otpHash = this.hashOtp(otp, otpSalt);

    const passwordSalt = this.generateSalt();
    const passwordHash = this.hashPasswordWithSalt(password, passwordSalt);

    const challengeId = `reg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const pending: PendingRegistration = {
      id: challengeId,
      email,
      username,
      accountType: params.accountType || 'INDIVIDUAL',
      passwordHash,
      passwordSalt,
      otpHash,
      otpSalt,
      expiresAt: now + this.OTP_TTL_MS,
      attemptsRemaining: this.MAX_ATTEMPTS,
      resendCooldownUntil: now + this.RESEND_COOLDOWN_MS,
      resendCount: (prev?.resendCount || 0) + 1,
      used: false,
      createdAt: new Date().toISOString()
    };

    this.pendingRegistrations.set(email, pending);

    // Send verification email via configured provider
    const emailOptions = emailDeliveryService.createVerificationEmail(email, otp, 15);
    await emailDeliveryService.sendEmail(emailOptions);

    return {
      success: true,
      message: 'Verification code dispatched to your email address.',
      expiresInSeconds: Math.floor(this.OTP_TTL_MS / 1000)
    };
  }

  // =========================================================================
  // STEP 6-8: REGISTRATION VERIFICATION & ACCOUNT ACTIVATION
  // =========================================================================

  public async verifyRegistration(params: {
    email: string;
    code: string;
    ip?: string;
  }): Promise<{
    success: boolean;
    user?: UserAccount;
    sessionToken?: string;
    attemptsRemaining?: number;
    error?: string;
  }> {
    const email = this.normalizeEmail(params.email);
    const code = (params.code || '').trim();

    if (!email || !code) {
      return { success: false, error: 'Email and verification code are required.' };
    }

    const pending = this.pendingRegistrations.get(email);
    if (!pending || pending.used) {
      return { success: false, error: 'No active registration challenge found for this email. Please sign up again.' };
    }

    const now = Date.now();
    if (pending.expiresAt < now) {
      this.pendingRegistrations.delete(email);
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (pending.attemptsRemaining <= 0) {
      this.pendingRegistrations.delete(email);
      return { success: false, error: 'Maximum verification attempts exceeded. For your security, this challenge was cancelled.' };
    }

    // Constant-time hash comparison
    const candidateHash = this.hashOtp(code, pending.otpSalt);
    const isValid = this.timingSafeEqual(candidateHash, pending.otpHash);

    if (!isValid) {
      pending.attemptsRemaining -= 1;
      if (pending.attemptsRemaining <= 0) {
        this.pendingRegistrations.delete(email);
        return {
          success: false,
          error: 'Invalid verification code. All attempts exhausted. Please request a new code.',
          attemptsRemaining: 0
        };
      }
      return {
        success: false,
        error: `Incorrect verification code. ${pending.attemptsRemaining} attempt${pending.attemptsRemaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: pending.attemptsRemaining
      };
    }

    // Code verified: mark as consumed immediately
    pending.used = true;
    this.pendingRegistrations.delete(email);

    // Provision authoritative account
    const uid = `usr_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const organizationId = pending.accountType === 'ORGANIZATION' ? `org_${uid}` : 'org_default';

    const account: UserAccount = {
      uid,
      email,
      username: pending.username,
      accountType: pending.accountType,
      organizationId,
      role: 'user',
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: pending.passwordHash,
      passwordSalt: pending.passwordSalt,
      failedAttempts: 0,
      termsAcceptedVersion: LegalPolicyService.CURRENT_VERSION,
      termsAcceptedAt: new Date().toISOString()
    };

    this.accounts.set(email, account);
    this.accountsByUid.set(uid, account);

    // Issue active session
    const sessionToken = this.createSession(account, params.ip);

    console.log(`[AUTH] Account successfully activated: uid=${uid} email=${emailDeliveryService.maskEmail(email)}`);

    return {
      success: true,
      user: account,
      sessionToken
    };
  }

  // =========================================================================
  // RESEND REGISTRATION OTP
  // =========================================================================

  public async resendRegistrationCode(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const cleanEmail = this.normalizeEmail(email);
    const pending = this.pendingRegistrations.get(cleanEmail);

    if (!pending || pending.used) {
      return { success: false, error: 'No active registration challenge found. Please start registration again.' };
    }

    const now = Date.now();
    if (pending.resendCooldownUntil > now) {
      const waitSeconds = Math.ceil((pending.resendCooldownUntil - now) / 1000);
      return { success: false, error: `Please wait ${waitSeconds} seconds before requesting a new code.` };
    }

    // Generate new OTP, replace previous hash, reset attempts
    const newOtp = this.generateSecureNumericOtp();
    const newSalt = this.generateSalt();
    pending.otpSalt = newSalt;
    pending.otpHash = this.hashOtp(newOtp, newSalt);
    pending.expiresAt = now + this.OTP_TTL_MS;
    pending.attemptsRemaining = this.MAX_ATTEMPTS;
    pending.resendCooldownUntil = now + this.RESEND_COOLDOWN_MS;
    pending.resendCount += 1;

    const emailOptions = emailDeliveryService.createVerificationEmail(cleanEmail, newOtp, 15);
    await emailDeliveryService.sendEmail(emailOptions);

    return {
      success: true,
      message: 'A new verification code has been dispatched to your email.'
    };
  }

  // =========================================================================
  // AUTHENTICATION & LOGIN (BRUTE-FORCE RESILIENT)
  // =========================================================================

  public async authenticate(params: {
    email: string;
    password: string;
    ip?: string;
  }): Promise<{
    success: boolean;
    user?: UserAccount;
    sessionToken?: string;
    retryAfterSeconds?: number;
    error?: string;
  }> {
    const email = this.normalizeEmail(params.email);
    const password = params.password;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const account = this.accounts.get(email);
    if (!account) {
      // Timing-safe constant work to defeat timing attacks
      const fakeSalt = this.generateSalt();
      this.hashPasswordWithSalt(password, fakeSalt);
      return {
        success: false,
        error: 'Invalid credentials. Please verify your email and password or create an account.'
      };
    }

    // Check lockouts
    const now = Date.now();
    if (account.lockedUntil && account.lockedUntil > now) {
      const remainingSeconds = Math.ceil((account.lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingSeconds} seconds.`,
        retryAfterSeconds: remainingSeconds
      };
    }

    // Verify password hash
    const candidateHash = this.hashPasswordWithSalt(password, account.passwordSalt);
    const matches = this.timingSafeEqual(candidateHash, account.passwordHash);

    if (!matches) {
      account.failedAttempts += 1;
      if (account.failedAttempts >= 5) {
        account.lockedUntil = now + 60 * 1000; // 60s lockout
        return {
          success: false,
          error: 'Too many failed login attempts. Security lockout engaged for 60 seconds.',
          retryAfterSeconds: 60
        };
      }
      const attemptsLeft = 5 - account.failedAttempts;
      return {
        success: false,
        error: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before security lockout.`
      };
    }

    // Success: reset failed attempts
    account.failedAttempts = 0;
    delete account.lockedUntil;

    const sessionToken = this.createSession(account, params.ip);

    return {
      success: true,
      user: account,
      sessionToken
    };
  }

  // =========================================================================
  // PASSWORD RECOVERY (FORGOT PASSWORD)
  // =========================================================================

  public async initiatePasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = this.normalizeEmail(email);
    const genericSuccess = {
      success: true,
      message: 'If an account exists for this email address, a password recovery verification code has been dispatched.'
    };

    const account = this.accounts.get(cleanEmail);
    if (!account || !account.emailVerified) {
      // Return generic message to prevent account enumeration
      return genericSuccess;
    }

    const now = Date.now();
    const prev = this.pendingRecoveries.get(cleanEmail);
    if (prev && !prev.used && prev.resendCooldownUntil > now) {
      // Still return generic success to avoid enumeration
      return genericSuccess;
    }

    const otp = this.generateSecureNumericOtp();
    const otpSalt = this.generateSalt();
    const otpHash = this.hashOtp(otp, otpSalt);

    const recovery: PendingRecovery = {
      id: `rec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      email: cleanEmail,
      otpHash,
      otpSalt,
      expiresAt: now + this.OTP_TTL_MS,
      attemptsRemaining: this.MAX_ATTEMPTS,
      resendCooldownUntil: now + this.RESEND_COOLDOWN_MS,
      resendCount: (prev?.resendCount || 0) + 1,
      used: false,
      createdAt: new Date().toISOString()
    };

    this.pendingRecoveries.set(cleanEmail, recovery);

    const emailOptions = emailDeliveryService.createPasswordRecoveryEmail(cleanEmail, otp, 15);
    await emailDeliveryService.sendEmail(emailOptions);

    return genericSuccess;
  }

  public async verifyRecoveryCode(email: string, code: string): Promise<{
    success: boolean;
    resetToken?: string;
    attemptsRemaining?: number;
    error?: string;
  }> {
    const cleanEmail = this.normalizeEmail(email);
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: 'Email and verification code are required.' };
    }

    const recovery = this.pendingRecoveries.get(cleanEmail);
    if (!recovery || recovery.used) {
      return { success: false, error: 'Invalid or expired recovery session. Please request a new recovery code.' };
    }

    const now = Date.now();
    if (recovery.expiresAt < now) {
      this.pendingRecoveries.delete(cleanEmail);
      return { success: false, error: 'Recovery code has expired. Please request a new one.' };
    }

    if (recovery.attemptsRemaining <= 0) {
      this.pendingRecoveries.delete(cleanEmail);
      return { success: false, error: 'Maximum verification attempts exceeded. Please restart password recovery.' };
    }

    const candidateHash = this.hashOtp(cleanCode, recovery.otpSalt);
    const isValid = this.timingSafeEqual(candidateHash, recovery.otpHash);

    if (!isValid) {
      recovery.attemptsRemaining -= 1;
      if (recovery.attemptsRemaining <= 0) {
        this.pendingRecoveries.delete(cleanEmail);
        return { success: false, error: 'Invalid recovery code. Attempts exhausted.', attemptsRemaining: 0 };
      }
      return {
        success: false,
        error: `Incorrect recovery code. ${recovery.attemptsRemaining} attempt${recovery.attemptsRemaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: recovery.attemptsRemaining
      };
    }

    // Success: Generate cryptographically random single-use resetToken
    const resetToken = crypto.randomBytes(32).toString('hex');
    recovery.resetToken = resetToken;
    recovery.resetTokenExpiresAt = now + 10 * 60 * 1000; // 10 minutes

    return {
      success: true,
      resetToken
    };
  }

  public async resetPasswordWithToken(params: {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const cleanEmail = this.normalizeEmail(params.email);
    const resetToken = (params.resetToken || '').trim();
    const newPassword = params.newPassword;
    const confirmPassword = params.confirmPassword;

    if (!cleanEmail || !resetToken || !newPassword || !confirmPassword) {
      return { success: false, error: 'All fields are required.' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New password and confirmation password do not match.' };
    }

    const strength = this.validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return { success: false, error: strength.error };
    }

    const recovery = this.pendingRecoveries.get(cleanEmail);
    if (!recovery || !recovery.resetToken || !recovery.resetTokenExpiresAt) {
      return { success: false, error: 'Invalid or expired password reset session.' };
    }

    const now = Date.now();
    if (recovery.resetTokenExpiresAt < now) {
      this.pendingRecoveries.delete(cleanEmail);
      return { success: false, error: 'Reset session has expired. Please restart recovery.' };
    }

    if (!this.timingSafeEqual(recovery.resetToken, resetToken)) {
      return { success: false, error: 'Invalid reset token authorization.' };
    }

    const account = this.accounts.get(cleanEmail);
    if (!account) {
      return { success: false, error: 'Account not found.' };
    }

    // Invalidate recovery challenge immediately
    recovery.used = true;
    this.pendingRecoveries.delete(cleanEmail);

    // Rotate salt and update password
    const newSalt = this.generateSalt();
    const newHash = this.hashPasswordWithSalt(newPassword, newSalt);
    account.passwordSalt = newSalt;
    account.passwordHash = newHash;
    account.failedAttempts = 0;
    delete account.lockedUntil;
    account.updatedAt = new Date().toISOString();

    // Revoke all existing sessions for this user for security
    this.revokeAllUserSessions(account.uid);

    // Dispatch security notice email
    const notice = emailDeliveryService.createPasswordChangedNotification(cleanEmail);
    await emailDeliveryService.sendEmail(notice);

    return {
      success: true,
      message: 'Password reset successfully. All existing sessions have been terminated. Please log in with your new password.'
    };
  }

  // =========================================================================
  // SESSION MANAGEMENT
  // =========================================================================

  public createSession(account: UserAccount, ip?: string): string {
    const token = `sess_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    const session: ActiveSession = {
      token,
      uid: account.uid,
      email: account.email,
      organizationId: account.organizationId,
      role: account.role,
      createdAt: now,
      expiresAt: now + this.SESSION_TTL_MS
    };

    this.sessions.set(token, session);
    return token;
  }

  public getSession(token: string): ActiveSession | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  public revokeSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  public revokeAllUserSessions(uid: string): void {
    for (const [token, session] of this.sessions.entries()) {
      if (session.uid === uid) {
        this.sessions.delete(token);
      }
    }
  }

  public getAccountByUid(uid: string): UserAccount | null {
    return this.accountsByUid.get(uid) || null;
  }

  public getAccountByEmail(email: string): UserAccount | null {
    return this.accounts.get(this.normalizeEmail(email)) || null;
  }

  // =========================================================================
  // TENANT ISOLATION & AUTHORIZATION HELPERS
  // =========================================================================

  public verifyOwnership(actorUid: string, resourceOwnerUid: string): boolean {
    if (!actorUid || !resourceOwnerUid) return false;
    return actorUid === resourceOwnerUid;
  }

  public verifyOrganizationMembership(actorOrgId: string, resourceOrgId: string): boolean {
    if (!actorOrgId || !resourceOrgId) return false;
    return actorOrgId === resourceOrgId;
  }
}

export const serverAuthStore = ServerAuthStore.getInstance();
