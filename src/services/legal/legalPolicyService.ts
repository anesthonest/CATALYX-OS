/**
 * CATALYX Universal Legal & Regulatory Compliance Service
 * Centralized repository and audit logger for all platform legal covenants.
 *
 * CRITICAL NOTICE:
 * CATALYX is developed and operated under the VINEXSAH TECHNOLOGIES project.
 */

export interface LegalDocument {
  slug: string;
  title: string;
  subtitle: string;
  category: 'core' | 'financial' | 'intellectual_property' | 'conduct';
  lastUpdated: string;
  version: string;
  summary: string;
  contentMarkdown: string;
}

export interface TermsAcceptanceRecord {
  acceptanceId: string;
  userId: string;
  userEmail: string;
  termsVersion: string;
  termsHash: string;
  ipAddress: string;
  userAgent: string;
  acceptedAt: string;
  active: boolean;
  notes?: string;
}

export interface LegalVersionMetadata {
  version: string;
  effectiveDate: string;
  termsHash: string;
  mandatoryReconsent: boolean;
  changelogSummary: string;
  registeredProjectNotice: string;
}

export class LegalPolicyService {
  public static readonly CURRENT_VERSION = 'v2026.3.2';
  public static readonly EFFECTIVE_DATE = '2026-03-24T00:00:00.000Z';
  public static readonly PROJECT_NAME_NOTICE = 
    'CATALYX is developed and operated under the VINEXSAH TECHNOLOGIES project.';

  private static acceptanceRecords: Map<string, TermsAcceptanceRecord> = new Map();
  private static versionMetadata: LegalVersionMetadata = {
    version: LegalPolicyService.CURRENT_VERSION,
    effectiveDate: LegalPolicyService.EFFECTIVE_DATE,
    termsHash: 'sha256:ctx_legal_hash_v2026_3_2_universal_expansion',
    mandatoryReconsent: true,
    changelogSummary: 'Universal Digital Work legal policy suite codifying authoritative 0.25% Individual / 0.27% Group / 0.50% Organization platform fees, Pesapal integration, bank transfer settlement, and user IP preservation.',
    registeredProjectNotice: LegalPolicyService.PROJECT_NAME_NOTICE
  };

  static {
    // Seed test admin acceptance record
    this.acceptanceRecords.set('acc_seed_admin', {
      acceptanceId: 'acc_seed_admin',
      userId: 'user_admin_001',
      userEmail: 'anesthonest81@gmail.com',
      termsVersion: LegalPolicyService.CURRENT_VERSION,
      termsHash: LegalPolicyService.versionMetadata.termsHash,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (CATALYX Executive Terminal)',
      acceptedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      active: true,
      notes: 'Initial administrator consent during system staging.'
    });
  }

  public static getVersionMetadata(): LegalVersionMetadata {
    return { ...this.versionMetadata };
  }

  public static updateVersion(newVersion: string, changelog: string, adminActor: string): LegalVersionMetadata {
    this.versionMetadata = {
      version: newVersion,
      effectiveDate: new Date().toISOString(),
      termsHash: `sha256:ctx_legal_${newVersion}_${Date.now()}`,
      mandatoryReconsent: true,
      changelogSummary: `${changelog} (Published by: ${adminActor})`,
      registeredProjectNotice: this.PROJECT_NAME_NOTICE
    };
    return { ...this.versionMetadata };
  }

  public static hasAcceptedCurrentTerms(userId: string, userEmail?: string): boolean {
    const records = Array.from(this.acceptanceRecords.values());
    const match = records.find(r => 
      (r.userId === userId || (userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase())) &&
      r.termsVersion === this.versionMetadata.version &&
      r.active
    );
    return Boolean(match);
  }

  public static recordAcceptance(params: {
    userId: string;
    userEmail: string;
    ipAddress?: string;
    userAgent?: string;
    termsVersion?: string;
  }): TermsAcceptanceRecord {
    if (params.termsVersion && params.termsVersion !== this.versionMetadata.version) {
      throw new Error(`Invalid terms version "${params.termsVersion}". Expected current version "${this.versionMetadata.version}".`);
    }

    const version = this.versionMetadata.version;
    const acceptanceId = `acc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: TermsAcceptanceRecord = {
      acceptanceId,
      userId: params.userId,
      userEmail: params.userEmail.toLowerCase(),
      termsVersion: version,
      termsHash: this.versionMetadata.termsHash,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'Unknown Client',
      acceptedAt: now,
      active: true,
      notes: `Accepted terms ${version} via CATALYX interface.`
    };

    this.acceptanceRecords.set(acceptanceId, record);
    return record;
  }

  public static getAuditLogs(): TermsAcceptanceRecord[] {
    return Array.from(this.acceptanceRecords.values()).sort(
      (a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
    );
  }

  public static getAllDocuments(): LegalDocument[] {
    return [
      this.getTermsOfService(),
      this.getPrivacyPolicy(),
      this.getAcceptableUsePolicy(),
      this.getRefundDisputePolicy(),
      this.getPaymentBillingPolicy(),
      this.getCreatorPayoutPolicy(),
      this.getMarketplacePolicy(),
      this.getIntellectualPropertyPolicy(),
      this.getCopyrightDmcaPolicy(),
      this.getCommunityGuidelines()
    ];
  }

  public static getDocumentBySlug(slug: string): LegalDocument | undefined {
    const normalized = slug.replace(/^\/+/, '').toLowerCase();
    return this.getAllDocuments().find(doc => doc.slug.toLowerCase() === normalized);
  }

  // ==========================================================================
  // DOCUMENT DEFINITIONS (Rigorous, legally sound, strictly cautious)
  // ==========================================================================

  private static getTermsOfService(): LegalDocument {
    return {
      slug: 'terms',
      title: 'Terms of Service',
      subtitle: 'Universal Master Operating Agreement & General Conditions of Use',
      category: 'core',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Governs all access to CATALYX platforms, software, autonomous agents, and commercial tools operated under the VINEXSAH TECHNOLOGIES project.',
      contentMarkdown: `# CATALYX Master Terms of Service

**Last Updated:** March 1, 2026 | **Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### IMPORTANT NOTICE REGARDING OPERATIONAL STATUS
**CATALYX is developed, maintained, and operated under the VINEXSAH TECHNOLOGIES project.**
All references herein to "CATALYX", "the Platform", "we", "us", or "our" refer to the VINEXSAH TECHNOLOGIES project.

---

### 1. Acceptance of Terms & Authority
By registering an account, initializing an executive profile, accessing APIs, or utilizing any services provided by CATALYX, you ("User", "You", or "Customer") represent and warrant that:
1. You have attained the legal age of majority in your jurisdiction.
2. You possess full legal power and corporate authority to bind yourself or the legal entity on whose behalf you act.
3. You have read, understood, and agreed to be bound by these Terms of Service, along with our Privacy Policy, Acceptable Use Policy, and Payment Terms.

---

### 2. User Content & Intellectual Property Ownership
**You retain 100% full legal and equitable ownership of all intellectual property, data, prompts, proprietary workflows, and assets you author or upload to CATALYX.**
CATALYX and the VINEXSAH TECHNOLOGIES project make no claim of ownership over your customer data.

By transmitting content into CATALYX, you grant the Platform a worldwide, non-exclusive, revocable, royalty-free, limited license solely to host, cache, transmit, and execute computational operations strictly necessary to provide the services you request.

---

### 3. Platform Revenue Share & Commission Structure
Eligible earnings generated through CATALYX marketplace transactions, asset publishing, advertising, or commercial services are subject to platform revenue-sharing fees under the authoritative Economic Policy:
* **Standard Individual User Rate:** CATALYX receives an ultra-low platform transaction fee of **0.25%** (25 basis points) of eligible gross earnings. The creator or seller receives **99.75%** prior to applicable third-party gateway deductions, statutory taxes, refunds, or cooling-off adjustments.
* **Group / Syndicate Rate:** CATALYX receives a platform transaction fee of **0.27%** (27 basis points) of eligible gross earnings for multi-seat collaborative teams or guilds. The group retains **99.73%** prior to applicable deductions.
* **Organization / Institutional Rate:** CATALYX receives a platform transaction fee of **0.50%** (50 basis points) of eligible gross earnings for accounts registered under enterprise, corporate, or institutional organizational classifications. The organization receives **99.50%** prior to applicable deductions.

All fee breakdowns are computed server-side using immutable integer minor-unit basis-point arithmetic and transparently itemized in double-entry commerce ledgers. Historical transactions strictly retain the policy rate in effect at time of transaction.

---

### 4. Subscription Lifecycles & Billing
Subscriptions are billed in advance on a recurring monthly or annual basis. Supported payment rails include Pesapal v3.0 gateway services and authorized Direct Bank Transfers. Accounts with failed payments enter a grace period before subscription expiration.

---

### 5. Disclaimer of Warranties
THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE OPERATORS DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

---

### 6. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE OPERATORS OF CATALYX OR THE VINEXSAH TECHNOLOGIES PROJECT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, ARISING OUT OF OR IN CONNECTION WITH PLATFORM USE.`
    };
  }

  private static getPrivacyPolicy(): LegalDocument {
    return {
      slug: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data Collection, Cryptographic Storage & Telemetry Governance',
      category: 'core',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Details how user credentials, execution logs, and organizational telemetry are safeguarded without selling or unauthorized sharing.',
      contentMarkdown: `# CATALYX Universal Privacy Policy

**Effective Date:** March 1, 2026 | **Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### OPERATIONAL NOTICE
**CATALYX is operated under the VINEXSAH TECHNOLOGIES project.**

---

### 1. Data Minimization & Privacy First
We collect only the telemetry, authentication tokens, and billing records strictly necessary to operate CATALYX:
* **Identity Data:** User email, account name, hashed credentials, and optional workspace affiliation.
* **Payment Telemetry:** Transaction references, payment tracking identifiers, and receipt verification metadata. We do not store full credit card numbers; card processing is delegated to PCI-DSS compliant providers (Pesapal).
* **Execution Telemetry:** Task statuses, autonomous agent runs, and error diagnostic logs.

---

### 2. Zero Sale of Personal Data
We do not sell, rent, monetize, or broker your personal information or organizational knowledge graphs to third parties.

---

### 3. Security & Cryptographic Storage
All sensitive identifiers, authentication tokens, and financial ledger records are stored using industry-standard AES-256 encryption at rest and TLS 1.3 in transit.`
    };
  }

  private static getAcceptableUsePolicy(): LegalDocument {
    return {
      slug: 'acceptable-use',
      title: 'Acceptable Use Policy',
      subtitle: 'Autonomous Agent Safety & Compute Integrity Standards',
      category: 'conduct',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Defines prohibited activities, autonomous agent safety boundaries, compute quotas, and security restrictions.',
      contentMarkdown: `# CATALYX Acceptable Use Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### Prohibited Activities
Users and autonomous agents executing within CATALYX may NOT engage in:
1. **Malicious Exploits:** Reverse-engineering, port scanning, denial-of-service, or unauthorized penetration testing against CATALYX infrastructure.
2. **Financial Fraud:** Submitting fabricated bank transfer receipts, fraudulent chargeback schemes, or circumventing platform fee structures.
3. **Harmful AI Workloads:** Deploying autonomous workflows designed to generate malware, facilitate illegal surveillance, or generate non-consensual exploitative content.
4. **Credential Abuse:** Sharing administrative access tokens or creating bot networks to manipulate leaderboard rankings or marketplace metrics.`
    };
  }

  private static getRefundDisputePolicy(): LegalDocument {
    return {
      slug: 'refunds',
      title: 'Refund & Dispute Policy',
      subtitle: 'Customer Protection, Cooling-Off Windows & Chargeback Standards',
      category: 'financial',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Explains digital product refund eligibility, cooling-off windows, and dispute resolution workflows.',
      contentMarkdown: `# CATALYX Refund & Dispute Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### 1. Digital Goods & Subscription Refunds
Due to the instant delivery and compute expenditure associated with AI execution and downloadable digital assets:
* **Subscriptions:** If you are dissatisfied with a paid subscription tier, you may request a full refund within **7 calendar days** of initial billing, provided compute usage has not exceeded 10% of monthly quota.
* **Marketplace Assets:** Covered by a **14-day creator cooling-off window**. Funds remain in holding status during this period to protect purchasers against corrupted or misleading assets.

---

### 2. Initiating a Dispute
Before contacting your bank or payment issuer, please open a resolution ticket within the Governance & Audit tab or email **anesthonest81@gmail.com**. Most disputes are resolved within 48 business hours.`
    };
  }

  private static getPaymentBillingPolicy(): LegalDocument {
    return {
      slug: 'payments',
      title: 'Payment & Billing Policy',
      subtitle: 'Gateway Protocols, Invoicing & Bank Transfer Clearing Standards',
      category: 'financial',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Sets out multi-currency rules, Pesapal v3.0 gateway handling, and Mode B Bank Transfer reconciliation.',
      contentMarkdown: `# CATALYX Payment & Billing Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### 1. Authorized Payment Rails
CATALYX supports two primary payment channels:
1. **Pesapal v3.0 Gateway:** Real-time card, Visa, Mastercard, and Mobile Money (M-Pesa, Airtel Money, MTN) clearing. Transactions are settled authoritatively upon IPN webhook verification.
2. **Direct Bank Transfer (Mode B Manual Settlement):** For enterprise invoices or high-value orders, remitters submit bank transfer transaction references and proof of payment. Orders remain in \`PENDING_BANK_VERIFICATION\` until verified by the Finance Administrator against receiving accounts.

---

### 2. Multi-Currency Accounting
All ledger records are tracked in integer minor units (e.g. cents, shillings) to prevent floating-point precision loss. Supported baseline currencies include USD, KES, UGX, TZS, RWF, NGN, GHS, ZAR, EUR, and GBP.`
    };
  }

  private static getCreatorPayoutPolicy(): LegalDocument {
    return {
      slug: 'payouts',
      title: 'Creator Payout Policy',
      subtitle: 'Earning Disbursement, Minimum Thresholds & Account Security',
      category: 'financial',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Establishes the criteria under which creator earnings are audited, held in cooling-off, and disbursed.',
      contentMarkdown: `# CATALYX Creator Payout Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### 1. Payout Eligibility Requirements
To request a payout of accumulated earnings from the CATALYX marketplace:
1. **Cooling-Off Period:** Orders must clear the mandatory **14-day refund protection window**.
2. **Minimum Balance:** Account must meet minimum threshold ($50.00 USD or KES 5,000).
3. **Bank Account Verification:** Receiving account must pass a **24-hour security lock** following any modifications.
4. **No Active Disputes:** Account must be free of unresolved customer chargebacks.

---

### 2. Platform Revenue Withholding
CATALYX automatically retains its platform fee (0.25% for individual creators, 0.27% for collaborative groups, 0.50% for organizations) upon sale completion under the authoritative Revenue Policy Engine. Payout requests reflect net creator earnings.`
    };
  }

  private static getMarketplacePolicy(): LegalDocument {
    return {
      slug: 'marketplace-policy',
      title: 'Marketplace Commercial Policy',
      subtitle: 'Asset Quality, Commercial Licensing & Distribution Covenants',
      category: 'intellectual_property',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Rules for listing, licensing, and purchasing AI workflows, prompt matrices, and digital twins.',
      contentMarkdown: `# CATALYX Marketplace Commercial Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### 1. Seller Representations
When you publish an asset to the CATALYX Marketplace, you warrant that you created the asset or have explicit authorization to license it commercially.

### 2. License Tiers
Sellers may offer assets under:
* **Standard Non-Exclusive:** Single organization deployment.
* **Extended Commercial:** Multi-organization or redistribution rights.`
    };
  }

  private static getIntellectualPropertyPolicy(): LegalDocument {
    return {
      slug: 'intellectual-property',
      title: 'Intellectual Property & Rights Notice',
      subtitle: 'Affirmation of Creator Ownership & Limited Operational License',
      category: 'intellectual_property',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Guarantees creator IP retention and delineates proprietary CATALYX system trademarks.',
      contentMarkdown: `# Intellectual Property & Rights Notice

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### 1. Creator IP Guarantee
**You own your content.** Everything you create, write, generate, or store inside your CATALYX workspace remains your exclusive property. The VINEXSAH TECHNOLOGIES project claims zero proprietary interest in your code, models, or data.

### 2. CATALYX Proprietary Architecture
The CATALYX codebase, user interfaces, branding, and economic engine logic are proprietary software operated under the VINEXSAH TECHNOLOGIES project name.`
    };
  }

  private static getCopyrightDmcaPolicy(): LegalDocument {
    return {
      slug: 'copyright',
      title: 'DMCA & Copyright Policy',
      subtitle: 'Takedown Notice Guidelines & Counter-Notification Procedures',
      category: 'intellectual_property',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Notice and takedown procedure for alleged copyright infringement on the CATALYX marketplace.',
      contentMarkdown: `# DMCA & Copyright Policy

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

### Notice of Claimed Infringement
If you believe work hosted on CATALYX infringes your copyright, submit a formal notice to our designated agent at **anesthonest81@gmail.com** with:
1. Identification of the copyrighted work claimed to have been infringed.
2. Direct URL or identifier of the allegedly infringing material.
3. Your full contact details and an affirmation of good faith belief.`
    };
  }

  private static getCommunityGuidelines(): LegalDocument {
    return {
      slug: 'community-guidelines',
      title: 'Community Guidelines',
      subtitle: 'Professional Standards, Mutual Respect & Scientific Collaboration',
      category: 'conduct',
      lastUpdated: 'March 1, 2026',
      version: LegalPolicyService.CURRENT_VERSION,
      summary: 'Expectations of civility and integrity across public leaderboards, forums, and team workspaces.',
      contentMarkdown: `# CATALYX Community Guidelines

**Version:** ${LegalPolicyService.CURRENT_VERSION}

---

CATALYX is an executive and scientific computing environment. All members are expected to maintain professional courtesy, avoid harassment, and collaborate transparently.`
    };
  }
}

export const legalPolicyService = LegalPolicyService;
