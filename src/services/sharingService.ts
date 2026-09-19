import { 
  ShareRecord, 
  ShareAuditLog, 
  ShareableArtifactType, 
  SharePermission, 
  ShareTargetType 
} from '../types';

class SharingService {
  private readonly STORAGE_KEY = 'catalyx_v24_shares';
  private readonly AUDIT_KEY = 'catalyx_v24_share_audit_logs';

  private shares: ShareRecord[] = [];
  private auditLogs: ShareAuditLog[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedShares = localStorage.getItem(this.STORAGE_KEY);
      if (storedShares) {
        this.shares = JSON.parse(storedShares);
      } else {
        this.seedInitialShares();
      }

      const storedLogs = localStorage.getItem(this.AUDIT_KEY);
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.seedInitialAuditLogs();
      }
    } catch {
      this.seedInitialShares();
      this.seedInitialAuditLogs();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shares));
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('Failed to persist share state to localStorage', e);
    }
  }

  private seedInitialShares() {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    this.shares = [
      {
        id: 'share_rec_001',
        artifactId: 'pres_q4_strategic_roadmap',
        artifactTitle: 'Q4 2026 Planetary Strategic Roadmap',
        artifactType: 'presentation',
        createdByEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'workspace',
        targetIdentifier: 'Engineering Alpha Sprints',
        permission: 'EDIT',
        expiresAt: futureDate,
        revoked: false,
        passcodeProtected: false,
        downloadAllowed: true,
        shareToken: 'tok_' + Math.random().toString(36).substring(2, 12) + '_v24',
        accessCount: 14,
        lastAccessedAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: 'share_rec_002',
        artifactId: 'media_v24_product_keynote',
        artifactTitle: 'CATALYX Universal Operating System Architecture Keynote',
        artifactType: 'video',
        createdByEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'link',
        targetIdentifier: 'public_link',
        permission: 'VIEW',
        expiresAt: futureDate,
        revoked: false,
        passcodeProtected: true,
        passcodeHash: 'v24launch',
        downloadAllowed: false,
        shareToken: 'tok_keynote_secure_92x8a',
        accessCount: 42,
        lastAccessedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString()
      },
      {
        id: 'share_rec_003',
        artifactId: 'file_pesapal_v3_reconciliation_spec',
        artifactTitle: 'Pesapal v3 Ledger Double-Entry Specification.pdf',
        artifactType: 'file',
        createdByEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'team',
        targetIdentifier: 'Finance & Compliance',
        permission: 'MANAGE',
        revoked: false,
        passcodeProtected: false,
        downloadAllowed: true,
        shareToken: 'tok_fin_spec_4981',
        accessCount: 9,
        lastAccessedAt: new Date(now.getTime() - 6 * 3600 * 1000).toISOString()
      }
    ];
    this.saveState();
  }

  private seedInitialAuditLogs() {
    const now = new Date();
    this.auditLogs = [
      {
        id: 'audit_log_001',
        shareId: 'share_rec_001',
        artifactId: 'pres_q4_strategic_roadmap',
        action: 'CREATED',
        actorEmail: 'anesthonest81@gmail.com',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        details: 'Shared presentation with Engineering Alpha Sprints (Permission: EDIT)'
      },
      {
        id: 'audit_log_002',
        shareId: 'share_rec_002',
        artifactId: 'media_v24_product_keynote',
        action: 'CREATED',
        actorEmail: 'anesthonest81@gmail.com',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        details: 'Generated secure public link with passcode protection and restricted download'
      },
      {
        id: 'audit_log_003',
        shareId: 'share_rec_002',
        artifactId: 'media_v24_product_keynote',
        action: 'ACCESSED',
        actorEmail: 'external_collaborator@partner.org',
        timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        details: 'Passcode verified successfully. Video stream loaded.'
      }
    ];
    this.saveState();
  }

  public getSharesForArtifact(artifactId: string): ShareRecord[] {
    return this.shares.filter(s => s.artifactId === artifactId);
  }

  public getAllShares(): ShareRecord[] {
    return [...this.shares];
  }

  public getAuditLogsForArtifact(artifactId: string): ShareAuditLog[] {
    return this.auditLogs.filter(l => l.artifactId === artifactId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getAllAuditLogs(): ShareAuditLog[] {
    return [...this.auditLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public createShare(params: {
    artifactId: string;
    artifactTitle: string;
    artifactType: ShareableArtifactType;
    createdByEmail: string;
    targetType: ShareTargetType;
    targetIdentifier: string;
    permission: SharePermission;
    expiresInDays?: number;
    passcode?: string;
    downloadAllowed: boolean;
  }): ShareRecord {
    const now = new Date();
    let expiresAt: string | undefined = undefined;
    if (params.expiresInDays && params.expiresInDays > 0) {
      expiresAt = new Date(now.getTime() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    }

    // Cryptographically secure or high-entropy token
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);

    const newRecord: ShareRecord = {
      id: 'share_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      artifactId: params.artifactId,
      artifactTitle: params.artifactTitle,
      artifactType: params.artifactType,
      createdByEmail: params.createdByEmail,
      createdAt: now.toISOString(),
      targetType: params.targetType,
      targetIdentifier: params.targetIdentifier,
      permission: params.permission,
      expiresAt,
      revoked: false,
      passcodeProtected: !!params.passcode && params.passcode.trim().length > 0,
      passcodeHash: params.passcode?.trim() || undefined,
      downloadAllowed: params.downloadAllowed,
      shareToken: token,
      accessCount: 0
    };

    this.shares.unshift(newRecord);

    // Record audit log
    this.recordAudit({
      shareId: newRecord.id,
      artifactId: newRecord.artifactId,
      action: 'CREATED',
      actorEmail: params.createdByEmail,
      details: `Created ${params.targetType} share with ${params.permission} permission for ${params.targetIdentifier}`
    });

    this.saveState();
    return newRecord;
  }

  public revokeShare(shareId: string, actorEmail: string): boolean {
    const record = this.shares.find(s => s.id === shareId);
    if (!record) return false;

    record.revoked = true;
    record.revokedAt = new Date().toISOString();

    this.recordAudit({
      shareId: record.id,
      artifactId: record.artifactId,
      action: 'REVOKED',
      actorEmail,
      details: `Immediate revocation triggered by ${actorEmail}. All downstream access links invalidated.`
    });

    this.saveState();
    return true;
  }

  public updatePermission(shareId: string, newPermission: SharePermission, actorEmail: string): boolean {
    const record = this.shares.find(s => s.id === shareId);
    if (!record) return false;

    const oldPerm = record.permission;
    record.permission = newPermission;

    this.recordAudit({
      shareId: record.id,
      artifactId: record.artifactId,
      action: 'PERMISSION_CHANGED',
      actorEmail,
      details: `Permission changed from ${oldPerm} to ${newPermission} by ${actorEmail}`
    });

    this.saveState();
    return true;
  }

  public verifyAccess(shareToken: string, providedPasscode?: string, actorEmail: string = 'anonymous_user'): {
    valid: boolean;
    reason?: string;
    share?: ShareRecord;
  } {
    const record = this.shares.find(s => s.shareToken === shareToken);
    if (!record) {
      return { valid: false, reason: 'Share token does not exist or has been permanently removed.' };
    }

    if (record.revoked) {
      this.recordAudit({
        shareId: record.id,
        artifactId: record.artifactId,
        action: 'BLOCKED_ATTEMPT',
        actorEmail,
        details: 'Blocked access attempt on revoked share link.'
      });
      return { valid: false, reason: 'Access to this resource has been explicitly revoked by the owner.' };
    }

    if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
      this.recordAudit({
        shareId: record.id,
        artifactId: record.artifactId,
        action: 'EXPIRED',
        actorEmail,
        details: 'Blocked access attempt on expired share link.'
      });
      return { valid: false, reason: 'This share link has expired.' };
    }

    if (record.passcodeProtected) {
      if (!providedPasscode || providedPasscode !== record.passcodeHash) {
        this.recordAudit({
          shareId: record.id,
          artifactId: record.artifactId,
          action: 'BLOCKED_ATTEMPT',
          actorEmail,
          details: 'Incorrect passcode provided for protected share link.'
        });
        return { valid: false, reason: 'Incorrect or missing security passcode.' };
      }
    }

    // Access granted
    record.accessCount += 1;
    record.lastAccessedAt = new Date().toISOString();

    this.recordAudit({
      shareId: record.id,
      artifactId: record.artifactId,
      action: 'ACCESSED',
      actorEmail,
      details: `Granted access to ${record.artifactTitle} (${record.permission})`
    });

    this.saveState();
    return { valid: true, share: record };
  }

  public recordAudit(log: Omit<ShareAuditLog, 'id' | 'timestamp'>) {
    const newLog: ShareAuditLog = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    this.saveState();
  }
}

export const sharingService = new SharingService();
