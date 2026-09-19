import { InstitutionalMemoryItem } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  INSTITUTIONAL_MEMORY: 'catalyx_v9_institutional_memory',
};

export class InstitutionalMemoryService {
  /**
   * Fetch all institutional memory records for an organization
   */
  public static getMemoryItems(orgId: string): InstitutionalMemoryItem[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.INSTITUTIONAL_MEMORY}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing institutional memory items:', e);
      }
    }

    const defaultItems: InstitutionalMemoryItem[] = [
      {
        id: 'inst_mem_001',
        organizationId: orgId,
        type: 'adr',
        title: 'ADR-2026-01: Financial Calculations Minor-Units & Idempotency Architecture',
        context: 'Cross-border multi-currency transactions across UGX, KES, and USD are susceptible to rounding drift when using floating point math.',
        whatHappenedBefore: 'Occasional rounding errors of ±0.01 USD occurred during currency conversion, causing manual reconciliation reconciles.',
        whatWasDecided: 'Enforce integer minor units (e.g. cents, UGX integer units) and require cryptographic idempotency keys on every transaction and webhook.',
        whyDecided: 'Guarantees 100% mathematical precision, eliminates double-charging risks, and satisfies strict East African Central Bank audits.',
        whatHappenedAfter: 'Over trailing 60 days, 100% of Pesapal transactions reconciled with zero discrepancy.',
        whatWeLearned: 'Standardizing on minor units at the schema level prevents downstream financial bugs across all micro-services.',
        provenance: {
          author: 'Architecture & Systems Agent',
          role: 'Principal Enterprise Architect',
          verifiedBy: 'Chief Financial Officer',
          authorityLevel: 'Executive Committee',
        },
        tags: ['financial', 'architecture', 'idempotency', 'pesapal', 'v9'],
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-05T00:00:00Z',
      },
      {
        id: 'inst_mem_002',
        organizationId: orgId,
        type: 'policy',
        title: 'SEC-GOV-09: AI Safety Firewall & Autonomous Execution Gateways',
        context: 'Empowering an 11-agent AI workforce requires provable guarantees that no autonomous agent can execute destructive or un-gated financial actions.',
        whatHappenedBefore: 'Developers previously worried that autonomous agents might write destructive SQL or execute unverified third-party API calls.',
        whatWasDecided: 'Implement 10-step Execution Safety Gate and Global Emergency Autonomy Killswitch. Autonomy Level 3 & 4 strictly bounded by budget and non-destructive policies.',
        whyDecided: 'Autonomy must never mean uncontrolled AI activity. Critical operations require explicit human authorization unless configured under audited policy.',
        whatHappenedAfter: 'Zero policy breaches, zero unauthorized network egress calls, 100% intercept rate on destructive commands.',
        whatWeLearned: 'Engineers and executives embrace autonomous assistance when safety boundaries are mathematically and transparently enforced.',
        provenance: {
          author: 'Legal & Regulatory Compliance Agent',
          role: 'Head of Compliance',
          verifiedBy: 'Chief Information Security Officer',
          authorityLevel: 'Board Security Committee',
        },
        tags: ['ai_safety', 'governance', 'killswitch', 'security', 'v9'],
        createdAt: '2026-08-10T00:00:00Z',
        updatedAt: '2026-08-12T00:00:00Z',
      },
      {
        id: 'inst_mem_003',
        organizationId: orgId,
        type: 'lesson_learned',
        title: 'LL-2026-04: Regional East Africa Mobile Money Integration Dynamics',
        context: 'Enterprise clients in Uganda and Kenya exhibited distinct checkout behavior compared to Western international clients.',
        whatHappenedBefore: 'Standard international card forms caused high checkout abandonment (>35%) due to local bank international payment restrictions.',
        whatWasDecided: 'Integrate native Pesapal v3 Mobile Money (MTN, Airtel, M-Pesa) alongside local card rails in sovereign currencies (UGX/KES).',
        whyDecided: 'Matches regional treasury workflows and provides instant transaction confirmation.',
        whatHappenedAfter: 'Checkout conversion jumped from 65% to 88%; customer satisfaction index reached +64.',
        whatWeLearned: 'Sovereign payment rails are an indispensable commercial prerequisite for pan-African enterprise software adoption.',
        provenance: {
          author: 'Enterprise Sales Agent',
          role: 'Regional Commercial Lead',
          verifiedBy: 'Chief Commercial Officer',
          authorityLevel: 'Executive Committee',
        },
        tags: ['commercial', 'pesapal', 'east_africa', 'mobile_money', 'v9'],
        createdAt: '2026-08-20T00:00:00Z',
        updatedAt: '2026-08-22T00:00:00Z',
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.INSTITUTIONAL_MEMORY}_${orgId}`, JSON.stringify(defaultItems));
    return defaultItems;
  }

  /**
   * Record a new institutional memory item with full provenance
   */
  public static addMemoryItem(orgId: string, item: Omit<InstitutionalMemoryItem, 'id' | 'createdAt' | 'updatedAt'>): InstitutionalMemoryItem {
    const items = this.getMemoryItems(orgId);
    const now = new Date().toISOString();
    const newItem: InstitutionalMemoryItem = {
      ...item,
      id: `inst_mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newItem);
    localStorage.setItem(`${STORAGE_KEYS.INSTITUTIONAL_MEMORY}_${orgId}`, JSON.stringify(items));

    GovernanceService.addAuditLog({
      id: `audit_inst_mem_${Date.now()}`,
      organizationId: orgId,
      actorId: item.provenance.author.toLowerCase().replace(/\s+/g, '_'),
      actorName: item.provenance.author,
      actorRole: 'system',
      action: `INSTITUTIONAL_MEMORY_RECORDED: [${newItem.type.toUpperCase()}] ${newItem.title}`,
      resourceType: 'institutional_memory',
      resourceId: newItem.id,
      outcome: 'success',
      details: {
        type: newItem.type,
        verifiedBy: newItem.provenance.verifiedBy,
        authorityLevel: newItem.provenance.authorityLevel,
      },
      timestamp: now,
    });

    return newItem;
  }
}
