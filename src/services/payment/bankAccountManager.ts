/**
 * CATALYX Bank Account & Sensitive Data Security Manager
 * Protects sensitive financial credentials, handles masking, enforces cooling-off
 * periods for high-risk payout account changes, and audits all modifications.
 */

import {
  ReceivingBankAccount,
  CreatorPayoutBankAccount,
  StandardCurrency,
  BankTransferReceivingMode
} from './paymentProvider.types';

export interface BankAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'RECEIVING_ACCOUNT_ADDED' | 'RECEIVING_ACCOUNT_MODIFIED' | 'PAYOUT_ACCOUNT_REGISTERED' | 'PAYOUT_ACCOUNT_UPDATED' | 'COOLING_OFF_BYPASS_ATTEMPT';
  accountId: string;
  details: string;
  ipAddress?: string;
}

export class BankAccountManager {
  private receivingAccounts: Map<string, ReceivingBankAccount> = new Map();
  private creatorAccounts: Map<string, CreatorPayoutBankAccount> = new Map(); // creatorEmail -> account
  private auditLogs: BankAuditLogEntry[] = [];
  private readonly COOLING_OFF_HOURS = 24;

  constructor() {
    this.seedDefaultReceivingAccounts();
  }

  private maskAccountNumber(rawNumber: string): string {
    const clean = rawNumber.replace(/\s+/g, '');
    if (clean.length <= 4) return `****${clean}`;
    const lastFour = clean.slice(-4);
    return `****${lastFour}`;
  }

  /**
   * Seeds an initial verified corporate clearing account for CATALYX operations
   */
  private seedDefaultReceivingAccounts(): void {
    const usdAccount: ReceivingBankAccount = {
      id: 'bank_acc_hq_usd',
      bankName: 'Standard Chartered Bank East Africa',
      accountName: 'CATALYX GLOBAL OPERATIONS LTD',
      accountNumberMasked: '****4921',
      accountNumberRaw: '0108049218200',
      branchCode: '01-002',
      swiftCode: 'SCBLKENX',
      currency: 'USD',
      isActive: true,
      instructions: 'Include your unique CATALYX Order reference (e.g. CTX-ORD-XXXXX) in the transfer memo field to ensure automatic reconciliation.',
      verificationMode: 'MODE_B_MANUAL_RECONCILIATION',
      verifiedAt: '2026-01-01T00:00:00.000Z'
    };

    const kesAccount: ReceivingBankAccount = {
      id: 'bank_acc_hq_kes',
      bankName: 'Stanbic Bank Kenya',
      accountName: 'CATALYX TECHNOLOGIES LTD',
      accountNumberMasked: '****8102',
      accountNumberRaw: '0100081023910',
      branchCode: '02-005',
      swiftCode: 'SBICKENX',
      currency: 'KES',
      isActive: true,
      instructions: 'Transfer via RTGS, Pesalink, or direct EFT. Always state the unique order reference in the payment narrative.',
      verificationMode: 'MODE_B_MANUAL_RECONCILIATION',
      verifiedAt: '2026-01-01T00:00:00.000Z'
    };

    this.receivingAccounts.set(usdAccount.id, usdAccount);
    this.receivingAccounts.set(kesAccount.id, kesAccount);
  }

  /**
   * Return client-safe list of receiving accounts with masked numbers
   */
  public getClientSafeReceivingAccounts(): ReceivingBankAccount[] {
    return Array.from(this.receivingAccounts.values()).map(acc => ({
      ...acc,
      accountNumberRaw: undefined // Never expose raw account number to client
    }));
  }

  public getActiveAccounts(): ReceivingBankAccount[] {
    return this.getClientSafeReceivingAccounts();
  }

  public getReceivingAccountById(id: string): ReceivingBankAccount | undefined {
    return this.receivingAccounts.get(id);
  }

  /**
   * Administrator registers or updates a corporate receiving bank account
   */
  public addOrUpdateReceivingAccount(params: {
    id?: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode?: string;
    swiftCode?: string;
    routingNumber?: string;
    currency: StandardCurrency;
    instructions: string;
    verificationMode: BankTransferReceivingMode;
    adminUser: string;
    ipAddress?: string;
  }): ReceivingBankAccount {
    const id = params.id || `bank_acc_${Date.now().toString(36)}`;
    const masked = this.maskAccountNumber(params.accountNumber);
    const now = new Date().toISOString();

    const account: ReceivingBankAccount = {
      id,
      bankName: params.bankName,
      accountName: params.accountName,
      accountNumberMasked: masked,
      accountNumberRaw: params.accountNumber,
      branchCode: params.branchCode,
      swiftCode: params.swiftCode,
      routingNumber: params.routingNumber,
      currency: params.currency,
      isActive: true,
      instructions: params.instructions,
      verificationMode: params.verificationMode,
      verifiedAt: now
    };

    this.receivingAccounts.set(id, account);

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: now,
      actor: params.adminUser,
      action: params.id ? 'RECEIVING_ACCOUNT_MODIFIED' : 'RECEIVING_ACCOUNT_ADDED',
      accountId: id,
      details: `Receiving account at ${params.bankName} (${masked}) set for currency ${params.currency} in mode ${params.verificationMode}.`,
      ipAddress: params.ipAddress
    });

    return { ...account, accountNumberRaw: undefined };
  }

  /**
   * Creator configures bank details for marketplace earnings payout
   * Enforces 24-hour cooling-off period before funds can be disbursed.
   */
  public registerCreatorPayoutAccount(params: {
    creatorEmail: string;
    creatorName: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingOrSwift?: string;
    currency: StandardCurrency;
    ipAddress?: string;
  }): CreatorPayoutBankAccount {
    const masked = this.maskAccountNumber(params.accountNumber);
    const now = new Date();
    const coolingOffEnd = new Date(now.getTime() + this.COOLING_OFF_HOURS * 3600 * 1000);

    const accountId = `pout_acc_${Date.now().toString(36)}`;
    const payoutAcc: CreatorPayoutBankAccount = {
      id: accountId,
      creatorEmail: params.creatorEmail.toLowerCase(),
      creatorName: params.creatorName,
      bankName: params.bankName,
      accountName: params.accountName,
      accountNumberMasked: masked,
      accountNumberRaw: params.accountNumber,
      routingOrSwift: params.routingOrSwift,
      currency: params.currency,
      verified: true,
      addedAt: now.toISOString(),
      coolingOffEndsAt: coolingOffEnd.toISOString(),
      isEligibleForPayout: false // Will become true after coolingOffEndsAt
    };

    this.creatorAccounts.set(params.creatorEmail.toLowerCase(), payoutAcc);

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: now.toISOString(),
      actor: params.creatorEmail,
      action: 'PAYOUT_ACCOUNT_REGISTERED',
      accountId,
      details: `New payout bank account configured for ${params.creatorEmail} at ${params.bankName} (${masked}). 24-hour security cooling-off lock active until ${coolingOffEnd.toISOString()}.`,
      ipAddress: params.ipAddress
    });

    return { ...payoutAcc, accountNumberRaw: undefined };
  }

  public getCreatorPayoutAccount(creatorEmail: string): CreatorPayoutBankAccount | undefined {
    const acc = this.creatorAccounts.get(creatorEmail.toLowerCase());
    if (!acc) return undefined;

    // Check cooling-off expiration
    const now = Date.now();
    const coolingEnd = new Date(acc.coolingOffEndsAt).getTime();
    const isPastCooling = now >= coolingEnd;

    return {
      ...acc,
      accountNumberRaw: undefined,
      isEligibleForPayout: isPastCooling
    };
  }

  public getAuditLogs(): BankAuditLogEntry[] {
    return [...this.auditLogs];
  }
}

export const bankAccountManager = new BankAccountManager();
