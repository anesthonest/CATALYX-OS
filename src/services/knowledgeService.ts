import { KnowledgeItem } from '../types';

const STORAGE_KEY_KNOWLEDGE = 'catalyx_v8_knowledge_universe';

export const INITIAL_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb_001',
    organizationId: 'default_org',
    title: 'SOP-PESA-01: Official Pesapal v3 Gateway Integration & IPN Listener Standard',
    content: `All corporate subscription orders and invoice transactions must route through Pesapal API v3. 
    1. Authenticate via /api/Auth/RequestToken with consumer_key & consumer_secret. 
    2. Obtain IPN registration ID via /api/URLSetup/RegisterIPN. 
    3. Submit order via /api/Transactions/SubmitOrder with unique merchant references. 
    4. Verify status server-side via /api/Transactions/GetTransactionStatus?orderTrackingId=...
    5. Under no circumstances may client-side reports directly toggle paid subscription entitlements.`,
    category: 'procedure',
    tags: ['pesapal', 'billing', 'payments', 'ipn', 'uganda', 'kenya'],
    provenance: {
      author: 'VP of Payments Infrastructure',
      authorRole: 'Platform Architect',
      sourceSystem: 'Engineering Architecture Registry',
      verifiedAuthoritative: true, // Authoritative policy!
      isAiGenerated: false,
    },
    searchKeywords: ['pesapal', 'payment', 'api', 'ipn', 'billing', 'subscription'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-14T14:30:00Z',
  },
  {
    id: 'kb_002',
    organizationId: 'default_org',
    title: 'FIN-POL-04: Non-Floating Point Currency Ledger & Minor Unit Precision',
    content: `All financial figures in CATALYX must be recorded as integer minor units in the Revenue Ledger (e.g. 15000000 minor units for 150,000 UGX, or 4900 minor units for $49.00 USD). 
    Never use JavaScript floating-point math for balance calculations, invoices, or revenue reporting to prevent cumulative precision drift.`,
    category: 'policy',
    tags: ['finance', 'ledger', 'accounting', 'precision', 'security'],
    provenance: {
      author: 'Chief Financial Officer',
      authorRole: 'Executive Finance',
      sourceSystem: 'Corporate Governance Vault',
      verifiedAuthoritative: true,
      isAiGenerated: false,
    },
    searchKeywords: ['currency', 'minor units', 'ledger', 'precision', 'finance'],
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'kb_003',
    organizationId: 'default_org',
    title: 'SEC-GOV-09: Human-In-The-Loop Approval Gates for AI Workforce',
    content: `Autonomous execution agents must operate within strict boundaries. 
    Level 0 (Observe), Level 1 (Recommend), Level 2 (Prepare), Level 3 (Approved Execution), Level 4 (Controlled Autonomous). 
    Any high-impact action—including financial disbursements, contract commitments, workspace deletions, or external API writes—requires explicit approval by an Owner, Admin, or Manager. 
    AI systems are prohibited from granting their own authorizations.`,
    category: 'policy',
    tags: ['governance', 'ai workforce', 'approvals', 'autonomy', 'compliance'],
    provenance: {
      author: 'Head of Information Security',
      authorRole: 'CISO Office',
      sourceSystem: 'Risk & Compliance Council',
      verifiedAuthoritative: true,
      isAiGenerated: false,
    },
    searchKeywords: ['autonomy', 'approval', 'agent', 'governance', 'security'],
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-01T16:00:00Z',
  },
  {
    id: 'kb_004',
    organizationId: 'default_org',
    title: 'DEC-2026-03: East African Regional Expansion & Multi-Currency Strategy',
    content: `Executive decision record approving initial launch coverage across Uganda (UGX), Kenya (KES), Tanzania (TZS), and Rwanda (RWF) alongside USD, EUR, and GBP. 
    Mobile Money channels (MTN MoMo, Airtel Money, M-Pesa) will be processed through Pesapal merchant rail to guarantee high transaction success rates in Kampala and Nairobi.`,
    category: 'decision',
    tags: ['strategy', 'expansion', 'currencies', 'africa', 'mobile money'],
    provenance: {
      author: 'Chief Executive Officer',
      authorRole: 'Executive Leadership',
      sourceSystem: 'Board Minutes Archive',
      verifiedAuthoritative: true,
      isAiGenerated: false,
    },
    searchKeywords: ['uganda', 'kenya', 'mobile money', 'pesapal', 'currencies'],
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'kb_005',
    organizationId: 'default_org',
    title: 'AI-SYNTH-12: High-Performance Micro-Tasking Heuristics for Focus Cabins',
    content: `Empirical study synthesized by Executive Intelligence Synthesizer: 
    Teams utilizing 25-minute Pomodoro focus blocks with binaural 432Hz ambient soundscapes demonstrated a 34% reduction in perceived burnout risk and an 18% lift in weekly sprint completion velocity. 
    Recommended for all remote sprint lanes.`,
    category: 'research',
    tags: ['productivity', 'focus', 'burnout', 'study'],
    provenance: {
      author: 'Executive Intelligence Synthesizer',
      authorRole: 'Autonomous Agent',
      sourceSystem: 'CATALYX Deep Intelligence Mesh',
      verifiedAuthoritative: false, // Explicitly non-authoritative AI synthesis
      isAiGenerated: true,          // Clearly marked as AI generated
    },
    searchKeywords: ['focus', 'pomodoro', 'burnout', 'research'],
    createdAt: '2026-02-28T15:00:00Z',
    updatedAt: '2026-02-28T15:00:00Z',
  },
];

export class KnowledgeService {
  public static getKnowledgeItems(orgId: string): KnowledgeItem[] {
    const raw = localStorage.getItem(`${STORAGE_KEY_KNOWLEDGE}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing knowledge items:', e);
      }
    }

    const items = INITIAL_KNOWLEDGE_ITEMS.map(k => ({ ...k, organizationId: orgId }));
    localStorage.setItem(`${STORAGE_KEY_KNOWLEDGE}_${orgId}`, JSON.stringify(items));
    return items;
  }

  public static addKnowledgeItem(item: KnowledgeItem): void {
    const items = this.getKnowledgeItems(item.organizationId);
    items.unshift(item);
    localStorage.setItem(`${STORAGE_KEY_KNOWLEDGE}_${item.organizationId}`, JSON.stringify(items));
  }

  public static searchKnowledge(orgId: string, query: string, categoryFilter?: string): KnowledgeItem[] {
    const items = this.getKnowledgeItems(orgId);
    if (!query.trim() && !categoryFilter) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const matchesCategory = !categoryFilter || categoryFilter === 'all' || item.category === categoryFilter;
      const matchesText = 
        !query.trim() ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        item.provenance.author.toLowerCase().includes(lowerQuery);

      return matchesCategory && matchesText;
    });
  }
}
