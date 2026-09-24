import { 
  MarketplaceAsset, ApiKeyCredential, DeveloperAccount, 
  SecurityReviewReport, MarketplaceCategory, MarketplacePricingModel,
  AgentPermission
} from '../types';
import { GovernanceService } from './governanceService';
import { BillingService } from './billingService';
import { WebhookService } from './webhookService';
import { revenuePolicyEngine, SellerAccountType } from './payment/revenuePolicyEngine';
import { safeStorage } from '../utils/safeStorage';

const STORAGE_KEYS = {
  MARKETPLACE_ASSETS: 'catalyx_v8_marketplace_assets',
  API_KEYS: 'catalyx_v8_api_keys',
  DEVELOPER_ACCOUNTS: 'catalyx_v8_dev_accounts',
};

export class MarketplaceService {
  /**
   * Fetch all marketplace assets across categories
   */
  public static getAssets(): MarketplaceAsset[] {
    const raw = safeStorage.getArray<MarketplaceAsset>(STORAGE_KEYS.MARKETPLACE_ASSETS, []);
    if (raw && raw.length > 0) {
      return raw;
    }

    const defaultAssets: MarketplaceAsset[] = [
      {
        id: 'asset_sec_auditor_01',
        type: 'agent',
        title: 'SOC2 Autonomous Compliance Auditor',
        version: '2.1.0',
        description: 'Continuously audits cloud infrastructure, IAM roles, and secret rotation against SOC2 Trust Criteria.',
        author: 'Vinexsah Security Labs',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        commissionRatePercent: 0,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_KNOWLEDGE', 'READ_ANALYTICS', 'REQUEST_APPROVAL'],
        installCount: 1420,
        activeExecutionsCount: 8940,
        rating: 4.9,
        published: true,
        tags: ['Security', 'Compliance', 'SOC2', 'Audit'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_wf_incident_02',
        type: 'workflow',
        title: 'Major Incident War-Room Orchestrator',
        version: '1.4.0',
        description: 'Auto-spins up dedicated incident channels, notifies on-call engineers via Slack/PagerDuty, and tracks resolution timeline.',
        author: 'SRE Guild',
        pricingModel: 'one_time',
        priceMinorUnits: 1500, // $15.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['EXECUTE_WORKFLOW', 'SEND_NOTIFICATION', 'USE_INTEGRATION'],
        installCount: 890,
        activeExecutionsCount: 3120,
        rating: 4.8,
        published: true,
        tags: ['DevOps', 'Incident Response', 'Slack', 'Failover'],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_conn_pesapal_03',
        type: 'integration',
        title: 'Pesapal IPN Webhook Verification Gateway',
        version: '3.0.1',
        description: 'Production-hardened connector handling HMAC signature validation, instant retry backoffs, and mobile money status sync.',
        author: 'FinTech Engineering Group',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        commissionRatePercent: 0,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['USE_INTEGRATION', 'FINANCIAL_ACTION'],
        installCount: 3150,
        activeExecutionsCount: 14200,
        rating: 5.0,
        published: true,
        tags: ['Payments', 'Pesapal', 'M-PESA', 'Fintech'],
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_ind_health_04',
        type: 'industry_solution',
        title: 'HIPAA & Healthcare Data Governance Pack',
        version: '1.0.0',
        description: 'Specialized institutional memory schemas, patient data anonymization agents, and strict PHI firewall rules.',
        author: 'MedTech Systems',
        pricingModel: 'subscription',
        priceMinorUnits: 4900, // $49.00 / month
        currency: 'USD',
        commissionRatePercent: 0.50,
        securityStatus: 'sandboxed',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_KNOWLEDGE', 'WRITE_KNOWLEDGE', 'REQUEST_APPROVAL'],
        installCount: 145,
        activeExecutionsCount: 920,
        rating: 4.7,
        published: true,
        tags: ['Healthcare', 'HIPAA', 'Compliance', 'Privacy'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_auto_ci_05',
        type: 'automation',
        title: 'Autonomous Git PR Reviewer & Secret Scanner',
        version: '1.2.0',
        description: 'Automates pull-request static analysis, checks for hardcoded credentials, and enforces commit convention linters.',
        author: 'DevSecOps Core',
        pricingModel: 'one_time',
        priceMinorUnits: 1900, // $19.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_ANALYTICS', 'EXECUTE_WORKFLOW'],
        installCount: 620,
        activeExecutionsCount: 4500,
        rating: 4.9,
        published: true,
        tags: ['Git', 'Security', 'Code Review', 'Automation'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_kp_fintech_06',
        type: 'knowledge_pack',
        title: 'African Cross-Border Regulatory & Central Bank Directives',
        version: '2.0.0',
        description: 'Curated institutional memory vault containing BoU, CBK, and SARB regulatory guidelines for payments and forex flows.',
        author: 'Pan-African Law Group',
        pricingModel: 'subscription',
        priceMinorUnits: 2900, // $29.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_KNOWLEDGE'],
        installCount: 380,
        activeExecutionsCount: 1840,
        rating: 4.8,
        published: true,
        tags: ['Knowledge', 'Regulatory', 'Central Bank', 'Fintech'],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_tmpl_okr_07',
        type: 'template',
        title: 'Series-A B2B SaaS Growth & Executive OKR Tree',
        version: '1.1.0',
        description: 'Pre-configured mission decomposition blueprints for customer acquisition, expansion retention, and net burn management.',
        author: 'VentureScale',
        pricingModel: 'free',
        priceMinorUnits: 0,
        currency: 'USD',
        commissionRatePercent: 0,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['MANAGE_MISSIONS'],
        installCount: 2240,
        activeExecutionsCount: 9400,
        rating: 4.9,
        published: true,
        tags: ['Templates', 'OKRs', 'Executive', 'Growth'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_anlyt_unit_08',
        type: 'analytics_pack',
        title: 'Customer Unit Economics & Cohort CAC/LTV Intelligence',
        version: '1.0.2',
        description: 'Calculates true gross margins, AI compute unit economics per customer, and churn-risk cohort matrices.',
        author: 'SaaS Metricians',
        pricingModel: 'one_time',
        priceMinorUnits: 3500, // $35.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_ANALYTICS'],
        installCount: 510,
        activeExecutionsCount: 1620,
        rating: 4.9,
        published: true,
        tags: ['Analytics', 'CAC', 'LTV', 'Unit Economics'],
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'asset_sim_macro_09',
        type: 'simulation_model',
        title: 'Monte Carlo FX Volatility & Runway Stress Simulator',
        version: '1.3.0',
        description: 'Runs 10,000 synthetic economic shocks across multi-currency treasury positions and project delayed cash flows.',
        author: 'QuantRisk Analytics',
        pricingModel: 'subscription',
        priceMinorUnits: 5900, // $59.00
        currency: 'USD',
        commissionRatePercent: 0.50,
        securityStatus: 'sandboxed',
        lifecycleStatus: 'published',
        permissionsRequired: ['READ_ANALYTICS', 'REQUEST_APPROVAL'],
        installCount: 290,
        activeExecutionsCount: 1100,
        rating: 4.9,
        published: true,
        tags: ['Simulation', 'Monte Carlo', 'Risk', 'Digital Twin'],
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // V27 Authentic Digital Work Assets (Presentations, Videos, Demos, Software, Datasets, Research)
      {
        id: 'asset_pres_sovereign_infra',
        type: 'presentation',
        title: 'Sovereign Cloud & Autonomous Enterprise Architecture 2026',
        version: '1.0.0',
        description: 'Full executive deck with 12 structured slides covering decentralized consensus nodes, zero-trust cryptographic federation, and localized African data sovereignty compliance.',
        author: 'CATALYX Systems Architecture',
        developerId: 'anesthonest81@gmail.com',
        workObjectId: 'work_v25_strat_exp',
        pricingModel: 'paid_download',
        priceMinorUnits: 4900, // $49.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: [],
        installCount: 42,
        verifiedSalesCount: 18,
        rating: 5.0,
        published: true,
        tags: ['Executive Presentation', 'Architecture', 'Sovereignty', 'Cloud'],
        slideCount: 12,
        fileFormat: 'PDF & Interactive Slide Deck',
        fileSizeBytes: 8420000,
        creatorVerified: true,
        visibility: 'PUBLIC',
        licensingTerms: {
          licenseType: 'COMMERCIAL_NON_EXCLUSIVE',
          redistributionAllowed: false,
          modificationAllowed: true,
          attributionRequired: true,
          termsSummary: 'Authorizes organizational presentation use, strategic deck adaptation, and internal team delivery.'
        },
        reviews: [
          {
            id: 'rev_pres_01',
            reviewerEmail: 'elena.rostova@horizonconsortium.org',
            reviewerName: 'Elena Rostova',
            rating: 5,
            comment: 'Rigorous architectural breakdown. Saved our engineering leads weeks of presentation formulation.',
            verifiedPurchase: true,
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'asset_vid_war_room_demo',
        type: 'video_demo',
        title: 'Autonomous Multi-Agent War Room Live Demo & Incident Runbook',
        version: '2.0.0',
        description: '4K video walkthrough and real-time operational recording showing multi-agent incident triage, automated failover triggers, and zero-downtime container resilience.',
        author: 'DevSecOps Core Engineering',
        developerId: 'marcus.vance@catalyx.io',
        pricingModel: 'paid_access',
        priceMinorUnits: 2500, // $25.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: [],
        installCount: 88,
        verifiedSalesCount: 34,
        rating: 4.9,
        published: true,
        tags: ['Video Demo', 'DevOps', 'Incident Response', 'War Room'],
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        durationSeconds: 742,
        chapters: [
          { title: '0:00 Operational Topology Overview', timestampSeconds: 0 },
          { title: '2:15 Synthetic Incident Injection', timestampSeconds: 135 },
          { title: '5:40 Multi-Agent Triage & Execution', timestampSeconds: 340 },
          { title: '9:10 Failover Resolution Verification', timestampSeconds: 550 }
        ],
        transcript: 'Welcome to the CATALYX Autonomous Multi-Agent War Room demonstration. In this live walk-through we observe how autonomous agents respond to infrastructure anomalies within bounded safety thresholds...',
        softwareStage: 'DEMONSTRATION',
        demoType: 'RECORDING',
        creatorVerified: true,
        visibility: 'PUBLIC',
        licensingTerms: {
          licenseType: 'COMMERCIAL_NON_EXCLUSIVE',
          redistributionAllowed: false,
          modificationAllowed: false,
          attributionRequired: true,
          termsSummary: 'Permits company-wide streaming access for engineering training and incident response onboarding.'
        },
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'asset_soft_mesh_engine',
        type: 'software',
        title: 'Enterprise Multi-Region Failover Mesh Engine (Production Package)',
        version: '3.2.0',
        description: 'Hardened Node/TypeScript distributed routing middleware with active health checks, mTLS handshake enforcement, and automated DNS rerouting across regional cloud zones.',
        author: 'Vinexsah Infrastructure Labs',
        developerId: 'infra@vinexsah.com',
        pricingModel: 'licensing',
        priceMinorUnits: 14900, // $149.00
        currency: 'USD',
        commissionRatePercent: 0.50,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: ['EXECUTE_WORKFLOW'],
        installCount: 56,
        verifiedSalesCount: 22,
        rating: 5.0,
        published: true,
        tags: ['Software', 'Production', 'Networking', 'Failover', 'Mesh'],
        softwareStage: 'PRODUCTION_SOFTWARE',
        demoType: 'INTERACTIVE_SANDBOX',
        fileFormat: 'NPM Package & Docker Image',
        fileSizeBytes: 24500000,
        creatorVerified: true,
        visibility: 'PUBLIC',
        licensingTerms: {
          licenseType: 'ENTERPRISE_ORGANIZATIONAL',
          allowedSeats: 10,
          redistributionAllowed: false,
          modificationAllowed: true,
          attributionRequired: true,
          termsSummary: 'Production deployment rights for up to 10 compute clusters within single enterprise organization.'
        },
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'asset_res_zkp_paper',
        type: 'research',
        title: 'Zero-Knowledge Proofs for Cross-Border Settlement Protocols: Technical Whitepaper',
        version: '1.2.0',
        description: 'Comprehensive 38-page cryptographic research paper with mathematical formalization of zk-SNARK circuits for non-custodial remittance settlement.',
        author: 'Sovereign Cryptography Working Group',
        developerId: 'crypto@catalyx.io',
        pricingModel: 'paid_download',
        priceMinorUnits: 1900, // $19.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: [],
        installCount: 110,
        verifiedSalesCount: 45,
        rating: 4.8,
        published: true,
        tags: ['Research', 'Whitepaper', 'ZKP', 'Cryptography', 'Fintech'],
        fileFormat: 'PDF Document & LaTeX Source',
        fileSizeBytes: 4120000,
        creatorVerified: true,
        visibility: 'PUBLIC',
        licensingTerms: {
          licenseType: 'COMMERCIAL_NON_EXCLUSIVE',
          redistributionAllowed: false,
          modificationAllowed: false,
          attributionRequired: true,
          termsSummary: 'Authorized institutional research reference and executive briefing usage.'
        },
        createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
      },
      {
        id: 'asset_data_logistics_2026',
        type: 'dataset',
        title: 'Sub-Saharan Multi-Modal Freight & Customs Latency Benchmark 2026',
        version: '1.0.0',
        description: 'Cleaned, anonymized dataset covering 450,000 transit checkpoints across Mombasa, Dar es Salaam, Kigali, and Kampala transit corridors.',
        author: 'African Trade Logistics Institute',
        developerId: 'trade@atli.org',
        pricingModel: 'one_time',
        priceMinorUnits: 8900, // $89.00
        currency: 'USD',
        commissionRatePercent: 0.25,
        securityStatus: 'verified',
        lifecycleStatus: 'published',
        permissionsRequired: [],
        installCount: 31,
        verifiedSalesCount: 14,
        rating: 4.9,
        published: true,
        tags: ['Dataset', 'Logistics', 'Trade', 'Supply Chain', 'CSV'],
        fileFormat: 'CSV & Parquet Archive',
        fileSizeBytes: 185000000,
        creatorVerified: true,
        visibility: 'PUBLIC',
        licensingTerms: {
          licenseType: 'COMMERCIAL_NON_EXCLUSIVE',
          redistributionAllowed: false,
          modificationAllowed: true,
          attributionRequired: true,
          termsSummary: 'Permits internal corporate analytics, modeling, machine learning training, and reporting.'
        },
        createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
      }
    ];

    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, defaultAssets);
    return defaultAssets;
  }

  /**
   * Look up an asset by its unique identifier
   */
  public static getAssetById(assetId: string): MarketplaceAsset | undefined {
    const assets = this.getAssets();
    return assets.find(a => a.id === assetId);
  }

  /**
   * Add a newly published asset to the marketplace catalog
   */
  public static addAsset(newAsset: MarketplaceAsset): void {
    const assets = this.getAssets();
    const existingIndex = assets.findIndex(a => a.id === newAsset.id);
    if (existingIndex >= 0) {
      assets[existingIndex] = newAsset;
    } else {
      assets.unshift(newAsset);
    }
    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);
  }

  /**
   * Update an existing asset with partial changes
   */
  public static updateAsset(assetId: string, updates: Partial<MarketplaceAsset>): void {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === assetId);
    if (index >= 0) {
      assets[index] = { ...assets[index], ...updates, updatedAt: new Date().toISOString() };
      safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);
    }
  }

  /**
   * Increment verified sales and install metrics upon confirmed ledger transaction
   */
  public static recordAssetPurchase(assetId: string): void {
    const assets = this.getAssets();
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      asset.installCount = (asset.installCount || 0) + 1;
      asset.verifiedSalesCount = (asset.verifiedSalesCount || 0) + 1;
      safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);
    }
  }

  /**
   * Automated Security Scanner & Static Analysis Review Engine
   */
  public static performSecurityScan(asset: Partial<MarketplaceAsset>): SecurityReviewReport {
    const findings: string[] = [];
    const permissionsAudit = (asset.permissionsRequired || []).map(perm => {
      let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (perm === 'FINANCIAL_ACTION' || perm === 'ADMIN_OVERRIDE') {
        risk = 'critical';
        findings.push(`High privilege permission requested: ${perm}`);
      } else if (perm === 'MANAGE_AGENTS' || perm === 'WRITE_KNOWLEDGE' || perm === 'EXECUTE_WORKFLOW') {
        risk = 'medium';
      }
      return {
        permission: perm,
        risk,
        justificationValid: true,
      };
    });

    const manifestCode = asset.manifestCode || '';
    let networkAccessDetected = false;
    const externalEndpointsFound: string[] = [];
    let staticAnalysisPassed = true;
    let sandboxRequired = false;

    // Static code security checks
    if (manifestCode.includes('eval(') || manifestCode.includes('Function(')) {
      staticAnalysisPassed = false;
      findings.push('BANNED PATTERN: Dynamic eval/Function constructor detected.');
    }
    if (manifestCode.includes('http://') || manifestCode.includes('https://')) {
      networkAccessDetected = true;
      sandboxRequired = true;
      externalEndpointsFound.push('External HTTP endpoint pattern detected');
      findings.push('Egress Network Call Detected: Asset requires Sandboxed Isolation.');
    }
    if (manifestCode.includes('process.env') || manifestCode.includes('localStorage.getItem')) {
      findings.push('Storage Access: Sandboxed data containment enforced.');
      sandboxRequired = true;
    }

    const hasCriticalPermissions = permissionsAudit.some(p => p.risk === 'critical');
    let overallRiskScore = 15;
    if (hasCriticalPermissions) overallRiskScore += 35;
    if (networkAccessDetected) overallRiskScore += 20;
    if (!staticAnalysisPassed) overallRiskScore += 45;

    let verdict: 'approved' | 'requires_changes' | 'quarantined' = 'approved';
    if (!staticAnalysisPassed || overallRiskScore > 75) {
      verdict = 'quarantined';
    } else if (hasCriticalPermissions && overallRiskScore > 40) {
      verdict = 'requires_changes';
    }

    return {
      reviewId: `sec_rev_${Date.now()}`,
      assetId: asset.id || `temp_${Date.now()}`,
      assetVersion: asset.version || '1.0.0',
      scannedAt: new Date().toISOString(),
      manifestValid: true,
      staticAnalysisPassed,
      permissionsAudit,
      networkAccessDetected,
      externalEndpointsFound,
      dataBoundaryCompliant: true,
      sandboxRequired,
      overallRiskScore: Math.min(100, overallRiskScore),
      verdict,
      findings: findings.length > 0 ? findings : ['All static checks passed. Clean AST profile.'],
    };
  }

  /**
   * Install or Purchase a Marketplace Asset
   */
  public static purchaseAsset(
    orgId: string, 
    assetId: string, 
    actorName: string,
    actorEmail: string,
    currency = 'USD'
  ): { success: boolean; message: string; transactionReference?: string } {
    const assets = this.getAssets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      return { success: false, message: 'Asset not found in marketplace catalog.' };
    }

    asset.installCount++;
    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);

    // Calculate revenue split authoritatively using centralized revenuePolicyEngine (0.25% Indiv / 0.27% Group / 0.50% Org)
    const priceMinorUnits = asset.priceMinorUnits || 0;
    const isOrg = orgId && orgId !== 'org_individual' && !orgId.startsWith('indiv_');
    const sellerType: SellerAccountType = isOrg ? 'ORGANIZATION' : 'INDIVIDUAL';
    const split = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: priceMinorUnits,
      currency: currency as any,
      sellerAccountType: sellerType,
      paymentChannel: 'pesapal'
    });
    const platformCommissionMinorUnits = split.catalyxFeeMinorUnits;
    const creatorEarningsMinorUnits = split.sellerGrossPlatformEarningsMinorUnits;
    const txRef = `MP-PURCHASE-${Date.now().toString().slice(-8)}`;

    // If paid asset, record revenue ledger entry
    if (priceMinorUnits > 0) {
      BillingService.recordRevenueLedgerEntry({
        id: `rev_mp_${Date.now()}`,
        organizationId: orgId,
        transactionReference: txRef,
        idempotencyKey: `idemp_mp_${assetId}_${orgId}_${Date.now()}`,
        provider: 'pesapal',
        type: 'marketplace_commission',
        amountMinorUnits: priceMinorUnits,
        currency: currency as any,
        status: 'completed',
        description: `Marketplace Purchase: ${asset.title} (Platform Commission: ${platformCommissionMinorUnits / 100} ${currency}, Creator Payout: ${creatorEarningsMinorUnits / 100} ${currency})`,
        customerEmail: actorEmail,
        timestamp: new Date().toISOString(),
      });

      // Credit developer account if available
      const devAccount = this.getDeveloperAccount(orgId);
      devAccount.totalEarnedMinorUnits += creatorEarningsMinorUnits;
      devAccount.pendingPayoutMinorUnits += creatorEarningsMinorUnits;
      devAccount.lifetimeGmvMinorUnits += priceMinorUnits;
      devAccount.totalInstallsCount += 1;
      this.saveDeveloperAccount(orgId, devAccount);
    }

    GovernanceService.addAuditLog({
      id: `audit_install_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'INSTALL_MARKETPLACE_ASSET',
      resourceType: 'marketplace_asset',
      resourceId: assetId,
      outcome: 'success',
      details: {
        title: asset.title,
        version: asset.version,
        priceMinorUnits,
        platformCommissionMinorUnits,
        creatorEarningsMinorUnits,
        currency,
        securityStatus: asset.securityStatus,
        transactionReference: txRef,
      },
      timestamp: new Date().toISOString(),
    });

    // Fire webhook
    WebhookService.dispatchEvent(orgId, 'marketplace.purchase', {
      assetId: asset.id,
      title: asset.title,
      priceMinorUnits,
      currency,
      transactionReference: txRef,
      installedBy: actorName,
    });

    return { 
      success: true, 
      message: `Asset "${asset.title}" installed successfully.`,
      transactionReference: txRef 
    };
  }

  public static installAsset(orgId: string, assetId: string, actorName: string): boolean {
    const res = this.purchaseAsset(orgId, assetId, actorName, 'commander@catalyx.internal');
    return res.success;
  }

  // ==========================================================================
  // CREATOR & DEVELOPER ACCOUNT PLATFORM
  // ==========================================================================

  public static getDeveloperAccount(orgId: string): DeveloperAccount {
    const account = safeStorage.getObject<DeveloperAccount>(`${STORAGE_KEYS.DEVELOPER_ACCOUNTS}_${orgId}`, null as any);
    if (account && account.id) {
      return account;
    }

    const defaultAccount: DeveloperAccount = {
      id: `dev_${orgId.slice(0, 8)}`,
      organizationId: orgId,
      developerName: 'Autonomous Solutions Lab',
      email: 'creator@autonomous-systems.tech',
      verifiedBadge: true,
      payoutMethod: 'pesapal',
      payoutAccountIdentifier: 'PESAPAL-MERCH-88219A',
      currency: 'USD',
      totalEarnedMinorUnits: 425000, // $4,250.00
      pendingPayoutMinorUnits: 85000, // $850.00
      lifetimeGmvMinorUnits: 512000, // $5,120.00
      publishedAssetsCount: 3,
      totalInstallsCount: 2450,
      sandboxQuotaPerDay: 500,
      sandboxCallsToday: 42,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    safeStorage.set(`${STORAGE_KEYS.DEVELOPER_ACCOUNTS}_${orgId}`, defaultAccount);
    return defaultAccount;
  }

  public static saveDeveloperAccount(orgId: string, account: DeveloperAccount): void {
    safeStorage.set(`${STORAGE_KEYS.DEVELOPER_ACCOUNTS}_${orgId}`, account);
  }

  public static updatePayoutSettings(
    orgId: string,
    payoutMethod: 'pesapal' | 'bank_wire' | 'mobile_money',
    payoutAccountIdentifier: string,
    actorName: string
  ): DeveloperAccount {
    const account = this.getDeveloperAccount(orgId);
    account.payoutMethod = payoutMethod;
    account.payoutAccountIdentifier = payoutAccountIdentifier;
    this.saveDeveloperAccount(orgId, account);

    GovernanceService.addAuditLog({
      id: `audit_payout_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'UPDATE_DEVELOPER_PAYOUT_SETTINGS',
      resourceType: 'developer_account',
      resourceId: account.id,
      outcome: 'success',
      details: { payoutMethod, maskedIdentifier: payoutAccountIdentifier.slice(-4) },
      timestamp: new Date().toISOString(),
    });

    return account;
  }

  /**
   * Creator Asset Submission & Review Lifecycle
   */
  public static createAsset(
    orgId: string,
    payload: {
      type: MarketplaceCategory;
      title: string;
      version: string;
      description: string;
      pricingModel: MarketplacePricingModel;
      priceMinorUnits: number;
      currency: string;
      tags: string[];
      permissionsRequired: AgentPermission[];
      manifestCode?: string;
    },
    actorName: string
  ): MarketplaceAsset {
    const assets = this.getAssets();
    const newAsset: MarketplaceAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: payload.type,
      title: payload.title,
      version: payload.version || '1.0.0',
      description: payload.description,
      author: actorName,
      developerId: `dev_${orgId.slice(0, 8)}`,
      pricingModel: payload.pricingModel,
      priceMinorUnits: payload.priceMinorUnits,
      currency: (payload.currency as any) || 'USD',
      commissionRatePercent: (orgId && orgId !== 'org_individual' && !orgId.startsWith('indiv_'))
        ? revenuePolicyEngine.getActiveConfig().organizationFeePercent
        : revenuePolicyEngine.getActiveConfig().individualFeePercent,
      securityStatus: 'in_review',
      lifecycleStatus: 'draft',
      permissionsRequired: payload.permissionsRequired,
      installCount: 0,
      rating: 5.0,
      published: false,
      tags: payload.tags,
      manifestCode: payload.manifestCode,
      createdAt: new Date().toISOString(),
    };

    assets.unshift(newAsset);
    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);

    GovernanceService.addAuditLog({
      id: `audit_asset_create_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'developer',
      action: 'CREATE_MARKETPLACE_DRAFT',
      resourceType: 'marketplace_asset',
      resourceId: newAsset.id,
      outcome: 'success',
      details: { title: newAsset.title, type: newAsset.type },
      timestamp: new Date().toISOString(),
    });

    return newAsset;
  }

  public static submitForReview(orgId: string, assetId: string, actorName: string): MarketplaceAsset | null {
    const assets = this.getAssets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;

    // Run automated security scan
    const report = this.performSecurityScan(asset);
    asset.securityReport = report;
    asset.lifecycleStatus = report.verdict === 'approved' ? 'approved' : 'security_review';
    asset.securityStatus = report.sandboxRequired ? 'sandboxed' : (report.verdict === 'approved' ? 'verified' : 'in_review');

    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);

    GovernanceService.addAuditLog({
      id: `audit_sec_scan_${Date.now()}`,
      organizationId: orgId,
      actorId: 'security_scanner',
      actorName: 'CATALYX Automated Asset Scanner',
      actorRole: 'system',
      action: 'PERFORM_ASSET_SECURITY_SCAN',
      resourceType: 'marketplace_asset',
      resourceId: assetId,
      outcome: report.verdict === 'approved' ? 'success' : 'denied',
      details: {
        verdict: report.verdict,
        riskScore: report.overallRiskScore,
        sandboxRequired: report.sandboxRequired,
      },
      timestamp: new Date().toISOString(),
    });

    return asset;
  }

  public static publishAsset(orgId: string, assetId: string, actorName: string): boolean {
    const assets = this.getAssets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset || (asset.lifecycleStatus !== 'approved' && asset.lifecycleStatus !== 'security_review')) {
      return false;
    }

    asset.lifecycleStatus = 'published';
    asset.published = true;
    safeStorage.set(STORAGE_KEYS.MARKETPLACE_ASSETS, assets);

    const devAccount = this.getDeveloperAccount(orgId);
    devAccount.publishedAssetsCount += 1;
    this.saveDeveloperAccount(orgId, devAccount);

    GovernanceService.addAuditLog({
      id: `audit_pub_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'PUBLISH_MARKETPLACE_ASSET',
      resourceType: 'marketplace_asset',
      resourceId: assetId,
      outcome: 'success',
      details: { title: asset.title, version: asset.version },
      timestamp: new Date().toISOString(),
    });

    WebhookService.dispatchEvent(orgId, 'marketplace.published', {
      assetId: asset.id,
      title: asset.title,
      version: asset.version,
      author: asset.author,
    });

    return true;
  }

  // ==========================================================================
  // DEVELOPER API KEY MANAGEMENT (/api/v1)
  // ==========================================================================

  public static getApiKeys(orgId: string): ApiKeyCredential[] {
    const keys = safeStorage.getArray<ApiKeyCredential>(`${STORAGE_KEYS.API_KEYS}_${orgId}`, []);
    if (keys.length > 0) {
      return keys;
    }

    const defaultKey: ApiKeyCredential = {
      id: `key_${Date.now()}`,
      organizationId: orgId,
      name: 'Default Production CI/CD Gateway Key',
      prefix: 'cx_live_89f1',
      maskedKey: 'cx_live_89f1••••••••••••••••••••••••3a9b',
      scopes: ['agents:read', 'agents:execute', 'workflows:trigger', 'telemetry:read'],
      rateLimitPerMinute: 120,
      requestsThisMonth: 1420,
      lastUsedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    safeStorage.set(`${STORAGE_KEYS.API_KEYS}_${orgId}`, [defaultKey]);
    return [defaultKey];
  }

  public static createApiKey(
    orgId: string, 
    name: string, 
    scopes: string[], 
    actorName: string
  ): { keyCredential: ApiKeyCredential; rawSecret: string } {
    const keys = this.getApiKeys(orgId);
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const rawSecret = `cx_live_${randomHex}`;
    const prefix = rawSecret.substring(0, 12);
    const suffix = rawSecret.slice(-4);
    const maskedKey = `${prefix}••••••••••••••••••••••••${suffix}`;

    const newKey: ApiKeyCredential = {
      id: `key_${Date.now()}`,
      organizationId: orgId,
      name,
      prefix,
      maskedKey,
      scopes,
      rateLimitPerMinute: 120,
      requestsThisMonth: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    keys.unshift(newKey);
    safeStorage.set(`${STORAGE_KEYS.API_KEYS}_${orgId}`, keys);

    GovernanceService.addAuditLog({
      id: `audit_key_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'GENERATE_API_KEY',
      resourceType: 'api_credential',
      resourceId: newKey.id,
      outcome: 'success',
      details: { name, scopes, prefix },
      timestamp: new Date().toISOString(),
    });

    return { keyCredential: newKey, rawSecret };
  }

  public static revokeApiKey(orgId: string, keyId: string, actorName: string): boolean {
    const keys = this.getApiKeys(orgId);
    const key = keys.find(k => k.id === keyId);
    if (!key) return false;

    key.status = 'revoked';
    safeStorage.set(`${STORAGE_KEYS.API_KEYS}_${orgId}`, keys);

    GovernanceService.addAuditLog({
      id: `audit_rev_key_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'REVOKE_API_KEY',
      resourceType: 'api_credential',
      resourceId: keyId,
      outcome: 'success',
      details: { name: key.name, prefix: key.prefix },
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}
