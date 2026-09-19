import { EcosystemVerificationRecord, AbuseAlertRecord, EcosystemTrustLevel } from '../types';

const STORAGE_KEYS = {
  VERIFICATIONS: 'catalyx_v10_ecosystem_verifications',
  ABUSE_ALERTS: 'catalyx_v10_abuse_alerts',
};

export class EcosystemTrustGovernanceService {
  public static getVerifications(): EcosystemVerificationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VERIFICATIONS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultVerifications: EcosystemVerificationRecord[] = [
      {
        entityId: 'dev_vinexsah_sec',
        entityType: 'DEVELOPER',
        name: 'Vinexsah Infrastructure & Security Labs',
        status: 'TRUSTED',
        evidenceSummary: 'SOC2 Type II audited, GPG key verified, 3+ years active tenure, zero security breaches.',
        verifiedAt: '2026-01-15T00:00:00Z',
        verifiedBy: 'ciso_security_office',
      },
      {
        entityId: 'org_pesapal_payments_ke',
        entityType: 'ORGANIZATION',
        name: 'Pesapal Payments Group Africa',
        status: 'TRUSTED',
        evidenceSummary: 'Central Bank licensed Payment Service Provider, PCI-DSS Level 1 certified.',
        verifiedAt: '2026-02-01T00:00:00Z',
        verifiedBy: 'compliance_audit_team',
      },
      {
        entityId: 'agent_mkt_finops_sentinel',
        entityType: 'AGENT',
        name: 'Autonomous Cloud FinOps Sentinel Agent',
        status: 'TRUSTED',
        evidenceSummary: 'Passed static security analysis, prompt injection fuzzing suite, memory leak benchmarks.',
        verifiedAt: '2026-08-15T00:00:00Z',
        verifiedBy: 'ai_governance_gate',
      },
      {
        entityId: 'dev_external_partner_99',
        entityType: 'DEVELOPER',
        name: 'Pan-African Developer Innovation Guild',
        status: 'VERIFIED',
        evidenceSummary: 'Domain verified, corporate registration verified, sandbox performance cleared.',
        verifiedAt: '2026-06-10T00:00:00Z',
        verifiedBy: 'ecosystem_devrel_lead',
      },
    ];

    this.saveVerifications(defaultVerifications);
    return defaultVerifications;
  }

  public static getAbuseAlerts(): AbuseAlertRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ABUSE_ALERTS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultAlerts: AbuseAlertRecord[] = [
      {
        alertId: 'abuse_alert_001',
        targetType: 'API',
        entityId: 'dev_external_sandbox_bad_actor',
        severity: 'MEDIUM',
        description: 'Sudden burst of 4,500 unauthenticated requests/min targeting /api/v10/discovery endpoint.',
        automatedDecision: 'RATE_LIMIT',
        reviewedByHuman: true,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        alertId: 'abuse_alert_002',
        targetType: 'PAYMENT',
        entityId: 'merchant_acct_suspicious_refunds',
        severity: 'HIGH',
        description: 'Excessive refund velocity: 8 chargeback queries received within 120 seconds.',
        automatedDecision: 'TEMPORARY_FREEZE',
        reviewedByHuman: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        alertId: 'abuse_alert_003',
        targetType: 'REVIEWS',
        entityId: 'asset_unverified_clone_item',
        severity: 'LOW',
        description: 'Pattern matching identified 5 positive reviews originating from identical IP subnet within 3 minutes.',
        automatedDecision: 'FLAG_FOR_REVIEW',
        reviewedByHuman: true,
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      },
    ];

    this.saveAbuseAlerts(defaultAlerts);
    return defaultAlerts;
  }

  public static updateTrustStatus(entityId: string, status: EcosystemTrustLevel, reason: string): void {
    const list = this.getVerifications();
    const item = list.find(v => v.entityId === entityId);
    if (item) {
      item.status = status;
      item.evidenceSummary += ` | Status changed to ${status}: ${reason}`;
      this.saveVerifications(list);
    }
  }

  private static saveVerifications(list: EcosystemVerificationRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(list));
  }

  private static saveAbuseAlerts(alerts: AbuseAlertRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ABUSE_ALERTS, JSON.stringify(alerts));
  }
}
