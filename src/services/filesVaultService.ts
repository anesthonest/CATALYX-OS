import { WorkFileItem } from '../types';
import { safeStorage } from '../utils/safeStorage';

class FilesVaultService {
  private readonly STORAGE_KEY = 'catalyx_v24_files_vault';
  private files: WorkFileItem[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<WorkFileItem>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.files = loaded;
    } else {
      this.seedInitialFiles();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.files);
  }

  private seedInitialFiles() {
    const now = new Date();
    this.files = [
      {
        id: 'file_pesapal_v3_reconciliation_spec',
        name: 'Pesapal v3 Ledger Double-Entry Specification.pdf',
        extension: 'pdf',
        sizeBytes: 2450000,
        mimeType: 'application/pdf',
        category: 'pdf',
        previewAvailable: true,
        contentUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
        sampleContent: 'CATALYX FINTECH SPECIFICATION: PESAPAL V3 DOUBLE-ENTRY CRYPTOGRAPHIC RECONCILIATION PROTOCOL\n\nSection 1: Integer Minor-Unit Math\nAll transaction amounts are strictly represented in minor units (e.g. 1000 KES = 100000 minor units). Floating-point conversions are strictly prohibited in ledger math.\n\nSection 2: IPN Webhook Verification\nUpon receiving NotificationType=IPNCHANGE, the relay queries Pesapal GetTransactionStatus API using the bearer OAuth token. If status=COMPLETED, verify hash before crediting user balance.',
        uploadedByEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        tags: ['FINANCE', 'PESAPAL', 'SPECIFICATION', 'V24'],
        securityStatus: 'CLEAN_VERIFIED'
      },
      {
        id: 'file_manifest_coordination_json',
        name: 'CATALYX Planetary Coordination Manifest.json',
        extension: 'json',
        sizeBytes: 18400,
        mimeType: 'application/json',
        category: 'code',
        previewAvailable: true,
        contentUrl: '#sample',
        sampleContent: JSON.stringify({
          system: "CATALYX Universal Operating System",
          version: "24.0.0",
          nodeId: "VX-COMMAND-PRIMARY",
          port: 3000,
          domains: [
            "home", "work", "intelligence", "missions", 
            "automation", "resources", "ecosystem", "commerce", "admin"
          ],
          workforce: {
            autonomousAgents: 11,
            safetyFirewallStages: 8,
            blastRadiusPolicy: "STRICT_CONTAINMENT"
          },
          reconciliation: {
            mode: "DOUBLE_ENTRY_INTEGER",
            webhookRateLimitPerMin: 180
          }
        }, null, 2),
        uploadedByEmail: 'sarah.chen@catalyx.io',
        createdAt: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
        tags: ['MANIFEST', 'SYSTEM_CONFIG', 'JSON'],
        securityStatus: 'CLEAN_VERIFIED'
      },
      {
        id: 'file_arch_diagram_png',
        name: 'Executive Strategic Architecture Topology.png',
        extension: 'png',
        sizeBytes: 1420000,
        mimeType: 'image/png',
        category: 'image',
        previewAvailable: true,
        contentUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        uploadedByEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        tags: ['DIAGRAM', 'ARCHITECTURE', 'VISUAL'],
        securityStatus: 'CLEAN_VERIFIED'
      },
      {
        id: 'file_reconciliation_csv',
        name: 'Quarterly Financial Reconciliation Ledger.csv',
        extension: 'csv',
        sizeBytes: 84200,
        mimeType: 'text/csv',
        category: 'sheet',
        previewAvailable: true,
        contentUrl: '#sample',
        sampleContent: 'TransactionID,OrderRef,Customer,MinorUnits,Currency,Gateway,Status,ReconciledHash\nTX-8841,ORD-7749,Horizon Energy Corp,450000,USD,Pesapal-v3,COMPLETED,0x9a8f4b12\nTX-8842,ORD-7750,AeroSpace Logistics,120000,EUR,Pesapal-v3,COMPLETED,0x3e11cd49\nTX-8843,ORD-7751,Nairobi Tech Hub,6500000,KES,MPesa-STK,COMPLETED,0x7d02ba98\nTX-8844,ORD-7752,Global Quantum Labs,890000,USD,CreditCard,COMPLETED,0x55aa91fe',
        uploadedByEmail: 'kipchoge.keino@catalyx.io',
        createdAt: new Date(now.getTime() - 16 * 3600 * 1000).toISOString(),
        tags: ['FINANCE', 'CSV', 'LEDGER', 'RECONCILIATION'],
        securityStatus: 'CLEAN_VERIFIED'
      },
      {
        id: 'file_runbook_md',
        name: 'Production Acceptance Runbook & Deployment Checklist.md',
        extension: 'md',
        sizeBytes: 24100,
        mimeType: 'text/markdown',
        category: 'doc',
        previewAvailable: true,
        contentUrl: '#sample',
        sampleContent: '# CATALYX V24 PRODUCTION ACCEPTANCE RUNBOOK\n\n## 1. Zero Dead Buttons Mandate\n- Ensure all navigation triggers invoke verified handlers.\n- Back, Forward, Home, Breadcrumbs, Share, and Export must be functional.\n\n## 2. Ingress & Port Constraint\n- DEV & PROD servers must bind strictly to port 3000.\n- Ingress proxy routes all traffic via port 3000.\n\n## 3. Cryptographic Share Links\n- Tokens generated using high-entropy UUIDs.\n- Passcode validation and instant revocation kill-switch enforced.',
        uploadedByEmail: 'elena.rostova@catalyx.io',
        createdAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
        tags: ['RUNBOOK', 'PRODUCTION', 'DOC'],
        securityStatus: 'CLEAN_VERIFIED'
      }
    ];
    this.saveState();
  }

  public getAllFiles(): WorkFileItem[] {
    return [...this.files].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getFileById(id: string): WorkFileItem | undefined {
    return this.files.find(f => f.id === id);
  }

  public validateFileUpload(file: File): { valid: boolean; reason?: string; category?: WorkFileItem['category'] } {
    // 50MB limit per document
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { valid: false, reason: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB limit.` };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let category: WorkFileItem['category'] = 'other';

    if (ext === 'pdf' || file.type.includes('pdf')) category = 'pdf';
    else if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) category = 'doc';
    else if (['csv', 'xls', 'xlsx', 'tsv'].includes(ext)) category = 'sheet';
    else if (['js', 'ts', 'tsx', 'jsx', 'json', 'py', 'html', 'css', 'sql', 'sh'].includes(ext)) category = 'code';
    else if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext) || file.type.startsWith('image/')) category = 'image';
    else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || file.type.startsWith('audio/')) category = 'audio';
    else if (['mp4', 'webm', 'mov'].includes(ext) || file.type.startsWith('video/')) category = 'video';
    else if (['zip', 'tar', 'gz', '7z'].includes(ext)) category = 'archive';

    return { valid: true, category };
  }

  public async uploadFile(params: {
    file: File;
    uploadedByEmail: string;
    tags?: string[];
  }): Promise<{ success: boolean; item?: WorkFileItem; error?: string }> {
    const check = this.validateFileUpload(params.file);
    if (!check.valid || !check.category) {
      return { success: false, error: check.reason || 'Invalid file' };
    }

    const ext = params.file.name.split('.').pop()?.toLowerCase() || 'dat';
    const objectUrl = URL.createObjectURL(params.file);

    // If text/code/json/csv, read sample text
    let sampleContent: string | undefined = undefined;
    if (['doc', 'code', 'sheet'].includes(check.category) && params.file.size < 1000000) {
      try {
        sampleContent = await params.file.text();
      } catch {
        sampleContent = undefined;
      }
    }

    const newItem: WorkFileItem = {
      id: 'file_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      name: params.file.name,
      extension: ext,
      sizeBytes: params.file.size,
      mimeType: params.file.type || 'application/octet-stream',
      category: check.category,
      previewAvailable: ['pdf', 'doc', 'sheet', 'code', 'image', 'audio', 'video'].includes(check.category),
      contentUrl: objectUrl,
      sampleContent,
      uploadedByEmail: params.uploadedByEmail,
      createdAt: new Date().toISOString(),
      tags: params.tags || [check.category.toUpperCase(), ext.toUpperCase()],
      securityStatus: 'CLEAN_VERIFIED'
    };

    this.files.unshift(newItem);
    this.saveState();
    return { success: true, item: newItem };
  }

  public deleteFile(id: string): boolean {
    const index = this.files.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.files.splice(index, 1);
    this.saveState();
    return true;
  }
}

export const filesVaultService = new FilesVaultService();
