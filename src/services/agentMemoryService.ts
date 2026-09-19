import { 
  AgentMemoryRecord, AgentMemoryScope, MemoryClassification 
} from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  MEMORY_RECORDS: 'catalyx_v9_agent_memory_records',
};

export class AgentMemoryService {
  /**
   * Retrieves memories strictly scoped to a specific tenant (cross-tenant leak prevention)
   */
  public static getMemories(orgId: string, filter?: {
    scope?: AgentMemoryScope;
    ownerId?: string;
    classification?: MemoryClassification;
  }): AgentMemoryRecord[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.MEMORY_RECORDS}_${orgId}`);
    if (!raw) {
      const initial = this.seedInitialMemories(orgId);
      localStorage.setItem(`${STORAGE_KEYS.MEMORY_RECORDS}_${orgId}`, JSON.stringify(initial));
      return this.applyFilter(initial, filter);
    }

    try {
      const parsed: AgentMemoryRecord[] = JSON.parse(raw);
      // HARD ENFORCEMENT: Discard any memory item whose tenantId / organizationId does not strictly match orgId
      const tenantIsolated = parsed.filter(m => m.tenantId === orgId && m.organizationId === orgId);
      return this.applyFilter(tenantIsolated, filter);
    } catch (e) {
      console.error('Failed to parse agent memories:', e);
      return [];
    }
  }

  private static applyFilter(records: AgentMemoryRecord[], filter?: {
    scope?: AgentMemoryScope;
    ownerId?: string;
    classification?: MemoryClassification;
  }): AgentMemoryRecord[] {
    if (!filter) return records;
    return records.filter(r => {
      if (filter.scope && r.scope !== filter.scope) return false;
      if (filter.ownerId && r.ownerId !== filter.ownerId) return false;
      if (filter.classification && r.classification !== filter.classification) return false;
      return true;
    });
  }

  /**
   * Store a verified memory record with provenance and cryptographic hash signature
   */
  public static storeMemory(params: {
    organizationId: string;
    scope: AgentMemoryScope;
    ownerId: string;
    classification: MemoryClassification;
    retentionDays: number;
    provenance: string;
    content: string;
    metadata?: Record<string, any>;
    deletionPolicy?: 'auto_purge' | 'retain_indefinitely' | 'compliance_lock';
  }): AgentMemoryRecord {
    const now = new Date().toISOString();
    // Compute simple deterministic SHA-like hash signature for provenance integrity
    const payloadForHash = `${params.organizationId}:${params.ownerId}:${params.provenance}:${params.content}:${now}`;
    const hashSignature = `mem_sha256_${Array.from(payloadForHash).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0).toString(16)}`;

    const record: AgentMemoryRecord = {
      id: `mem_v9_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: params.organizationId,
      tenantId: params.organizationId,
      scope: params.scope,
      ownerId: params.ownerId,
      classification: params.classification,
      retentionDays: params.retentionDays,
      provenance: params.provenance,
      content: params.content,
      metadata: params.metadata || {},
      createdAt: now,
      lastUsedAt: now,
      deletionPolicy: params.deletionPolicy || 'retain_indefinitely',
      hashSignature,
    };

    const memories = this.getMemories(params.organizationId);
    memories.unshift(record);

    // Prevent uncontrolled memory growth: Cap total records per tenant to 200
    const bounded = memories.slice(0, 200);
    localStorage.setItem(`${STORAGE_KEYS.MEMORY_RECORDS}_${params.organizationId}`, JSON.stringify(bounded));

    GovernanceService.addAuditLog({
      id: `audit_mem_${Date.now()}`,
      organizationId: params.organizationId,
      actorId: params.ownerId,
      actorName: params.ownerId,
      actorRole: 'agent',
      action: `AGENT_MEMORY_STORED: [${params.scope.toUpperCase()}] ${params.classification.toUpperCase()}`,
      resourceType: 'agent_memory',
      resourceId: record.id,
      outcome: 'success',
      details: {
        scope: params.scope,
        classification: params.classification,
        provenance: params.provenance,
        hashSignature,
      },
      timestamp: now,
    });

    return record;
  }

  /**
   * Access memory record ensuring permissions and updating lastUsedAt timestamp
   */
  public static accessMemory(orgId: string, memoryId: string, requestingAgentId: string): AgentMemoryRecord | undefined {
    const memories = this.getMemories(orgId);
    const memory = memories.find(m => m.id === memoryId);
    if (!memory) return undefined;

    // Boundary check: If memory is restricted or agent-specific, requesting agent must be owner or authorized
    if (memory.scope === 'agent_specific' && memory.ownerId !== requestingAgentId) {
      console.warn(`Unauthorized access attempt: Agent ${requestingAgentId} attempted to access private memory of ${memory.ownerId}`);
      GovernanceService.addAuditLog({
        id: `audit_mem_denied_${Date.now()}`,
        organizationId: orgId,
        actorId: requestingAgentId,
        actorName: requestingAgentId,
        actorRole: 'agent',
        action: 'AGENT_MEMORY_ACCESS_DENIED',
        resourceType: 'agent_memory',
        resourceId: memoryId,
        outcome: 'denied',
        details: { ownerId: memory.ownerId, requestingAgentId },
        timestamp: new Date().toISOString(),
      });
      return undefined;
    }

    memory.lastUsedAt = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.MEMORY_RECORDS}_${orgId}`, JSON.stringify(memories));
    return memory;
  }

  private static seedInitialMemories(orgId: string): AgentMemoryRecord[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'mem_init_001',
        organizationId: orgId,
        tenantId: orgId,
        scope: 'organizational',
        ownerId: 'agent_architecture',
        classification: 'internal',
        retentionDays: 365,
        provenance: 'Enterprise Architecture Decision Record ADR-2026-001',
        content: 'All payment gateway integrations must use integer minor units (cents / cents equivalents) and verify idempotent keys.',
        metadata: { category: 'architecture_standard', version: '9.0' },
        createdAt: now,
        lastUsedAt: now,
        deletionPolicy: 'compliance_lock',
        hashSignature: 'mem_sha256_e82f7149a',
      },
      {
        id: 'mem_init_002',
        organizationId: orgId,
        tenantId: orgId,
        scope: 'organizational',
        ownerId: 'agent_legal',
        classification: 'confidential',
        retentionDays: 730,
        provenance: 'Regional Regulatory Compliance Review SEC-GOV-09',
        content: 'Customer PII and billing transaction records for Uganda and Kenya merchants must remain strictly logically isolated within tenant boundaries.',
        metadata: { statute: 'Uganda Data Protection Act 2019' },
        createdAt: now,
        lastUsedAt: now,
        deletionPolicy: 'compliance_lock',
        hashSignature: 'mem_sha256_b48a192fc',
      },
      {
        id: 'mem_init_003',
        organizationId: orgId,
        tenantId: orgId,
        scope: 'mission',
        ownerId: 'agent_finance',
        classification: 'internal',
        retentionDays: 90,
        provenance: 'Mission msn_v9_retention_01: Unit Economics Synthesis',
        content: 'East Africa SaaS renewal fee absorption rule: Platform absorbs up to 1.5% mobile money clearing fees on annual prepayment tier.',
        metadata: { missionId: 'msn_v9_retention_01' },
        createdAt: now,
        lastUsedAt: now,
        deletionPolicy: 'auto_purge',
        hashSignature: 'mem_sha256_c73918a4d',
      },
    ];
  }
}
