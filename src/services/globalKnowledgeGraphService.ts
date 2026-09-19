import { KnowledgeGraphNode, KnowledgeGraphEdge, KnowledgeGraphCategory } from '../types';

const STORAGE_KEYS = {
  NODES: 'catalyx_v10_kg_nodes',
  EDGES: 'catalyx_v10_kg_edges',
};

export interface TraversalResult {
  query: string;
  sourceNode: KnowledgeGraphNode | null;
  relatedNodes: {
    node: KnowledgeGraphNode;
    relationship: string;
    direction: 'outgoing' | 'incoming';
    relevanceScore: number;
  }[];
  privacyGuaranteed: boolean;
}

export class GlobalKnowledgeGraphService {
  /**
   * Get all visible nodes for an organization (GLOBAL nodes + this org's private nodes)
   */
  public static getNodes(tenantId: string): KnowledgeGraphNode[] {
    const all = this.getAllNodes();
    return all.filter(n => !n.isPrivate || n.tenantId === tenantId);
  }

  public static getEdges(tenantId: string): KnowledgeGraphEdge[] {
    const visibleNodes = new Set(this.getNodes(tenantId).map(n => n.id));
    const allEdges = this.getAllEdges();
    return allEdges.filter(e => visibleNodes.has(e.source) && visibleNodes.has(e.target));
  }

  public static getAllNodes(): KnowledgeGraphNode[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NODES);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultNodes: KnowledgeGraphNode[] = [
      // Technologies & Core Infrastructure
      { id: 'tech_pesapal_v3', label: 'Pesapal API v3', category: 'technology', tenantId: 'GLOBAL', isPrivate: false, metadata: { technologyStack: ['REST', 'HMAC-SHA256', 'OAuth'], verifiedAuthority: true, description: 'Official East African payment gateway and instant IPN listener standard' } },
      { id: 'tech_gemini_2_5', label: 'Gemini 2.5 Flash GenAI', category: 'technology', tenantId: 'GLOBAL', isPrivate: false, metadata: { technologyStack: ['LLM', 'Multimodal', 'Interactions API'], verifiedAuthority: true, description: 'Server-side high-throughput cognitive inference engine' } },
      { id: 'tech_postgres_drizzle', label: 'PostgreSQL & Drizzle ORM', category: 'technology', tenantId: 'GLOBAL', isPrivate: false, metadata: { technologyStack: ['SQL', 'ACID', 'Migrations'], verifiedAuthority: true, description: 'Relational immutable financial & audit event persistence' } },

      // Workflows
      { id: 'wf_financial_reconciliation', label: 'End-of-Day Financial Reconciliation', category: 'workflow', tenantId: 'GLOBAL', isPrivate: false, metadata: { maturityTier: 'Enterprise GA', description: 'Automated ledger-to-bank statement matching with anomaly flags' } },
      { id: 'wf_agent_delegation', label: 'Autonomous Mission Delegation', category: 'workflow', tenantId: 'GLOBAL', isPrivate: false, metadata: { maturityTier: 'Enterprise GA', description: 'Deconstructs OKRs into multi-agent task pipelines' } },
      { id: 'wf_soc2_compliance', label: 'Continuous SOC2 Compliance Audit', category: 'workflow', tenantId: 'GLOBAL', isPrivate: false, metadata: { maturityTier: 'Regulated', description: 'Daily IAM, cryptographic keys, and logging validation' } },

      // Agents
      { id: 'agent_financial_controller', label: 'Financial Controller Agent', category: 'agent', tenantId: 'GLOBAL', isPrivate: false, metadata: { verifiedAuthority: true, description: 'Enforces non-floating-point currency math and ledger parity' } },
      { id: 'agent_sec_officer', label: 'Chief InfoSec Officer Agent', category: 'agent', tenantId: 'GLOBAL', isPrivate: false, metadata: { verifiedAuthority: true, description: 'Governs 10-step safety gate, circuit breakers, and rate limits' } },
      { id: 'agent_operations_director', label: 'Operations Director Agent', category: 'agent', tenantId: 'GLOBAL', isPrivate: false, metadata: { verifiedAuthority: true, description: 'Resource queue optimization, backlog balancing, and sprint velocity' } },

      // Applications & Connectors
      { id: 'app_erp_connect', label: 'Enterprise ERP Live Connector', category: 'application', tenantId: 'GLOBAL', isPrivate: false, metadata: { description: 'Syncs invoices, purchase orders, and multi-currency ledgers' } },
      { id: 'app_slack_pagerduty', label: 'Emergency Incident Pager Mesh', category: 'application', tenantId: 'GLOBAL', isPrivate: false, metadata: { description: 'Instant notification fabric for circuit breakers and emergency toggles' } },

      // Outcomes & Problems
      { id: 'outcome_zero_audit_defects', label: 'Zero Financial & Security Audit Defects', category: 'outcome', tenantId: 'GLOBAL', isPrivate: false, metadata: { description: 'Pass external regulatory and financial certifications with zero flags' } },
      { id: 'outcome_sub_minute_disaster_recovery', label: 'Sub-Minute Disaster Failover', category: 'outcome', tenantId: 'GLOBAL', isPrivate: false, metadata: { description: 'Immediate circuit breaker trip with zero lost payment transactions' } },

      // Organization Private Node (Tenant-isolated!)
      { id: 'org_private_roadmap', label: 'Vinexsah 2026 Strategic M&A Expansion', category: 'knowledge', tenantId: 'default_org', isPrivate: true, metadata: { riskScore: 12, description: 'Strictly confidential internal growth model and equity distribution' } },
    ];

    this.saveNodes(defaultNodes);
    return defaultNodes;
  }

  public static getAllEdges(): KnowledgeGraphEdge[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EDGES);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultEdges: KnowledgeGraphEdge[] = [
      { id: 'e1', source: 'tech_pesapal_v3', target: 'wf_financial_reconciliation', relationship: 'supports_workflow', weight: 0.95, bidirectional: false },
      { id: 'e2', source: 'tech_postgres_drizzle', target: 'wf_financial_reconciliation', relationship: 'supports_workflow', weight: 0.98, bidirectional: false },
      { id: 'e3', source: 'agent_financial_controller', target: 'wf_financial_reconciliation', relationship: 'executes_task', weight: 0.99, bidirectional: false },
      { id: 'e4', source: 'app_erp_connect', target: 'tech_pesapal_v3', relationship: 'integrates_with', weight: 0.92, bidirectional: true },
      { id: 'e5', source: 'agent_sec_officer', target: 'wf_soc2_compliance', relationship: 'executes_task', weight: 0.97, bidirectional: false },
      { id: 'e6', source: 'tech_gemini_2_5', target: 'wf_agent_delegation', relationship: 'supports_workflow', weight: 0.94, bidirectional: false },
      { id: 'e7', source: 'agent_operations_director', target: 'wf_agent_delegation', relationship: 'executes_task', weight: 0.95, bidirectional: false },
      { id: 'e8', source: 'wf_financial_reconciliation', target: 'outcome_zero_audit_defects', relationship: 'produces_outcome', weight: 0.99, bidirectional: false },
      { id: 'e9', source: 'wf_soc2_compliance', target: 'outcome_zero_audit_defects', relationship: 'produces_outcome', weight: 0.98, bidirectional: false },
      { id: 'e10', source: 'app_slack_pagerduty', target: 'outcome_sub_minute_disaster_recovery', relationship: 'produces_outcome', weight: 0.96, bidirectional: false },
    ];

    this.saveEdges(defaultEdges);
    return defaultEdges;
  }

  /**
   * Traversal Query: What technologies support a given workflow?
   */
  public static findTechnologiesForWorkflow(workflowId: string, tenantId: string): TraversalResult {
    const nodes = this.getNodes(tenantId);
    const edges = this.getEdges(tenantId);
    const targetWf = nodes.find(n => n.id === workflowId);

    const related = edges
      .filter(e => e.target === workflowId && e.relationship === 'supports_workflow')
      .map(e => {
        const node = nodes.find(n => n.id === e.source)!;
        return {
          node,
          relationship: e.relationship,
          direction: 'incoming' as const,
          relevanceScore: Math.round(e.weight * 100),
        };
      })
      .filter(r => r.node != null);

    return {
      query: `Technologies supporting workflow: "${targetWf?.label || workflowId}"`,
      sourceNode: targetWf || null,
      relatedNodes: related,
      privacyGuaranteed: true,
    };
  }

  /**
   * Traversal Query: What agents can perform a given task/workflow?
   */
  public static findAgentsForTask(targetId: string, tenantId: string): TraversalResult {
    const nodes = this.getNodes(tenantId);
    const edges = this.getEdges(tenantId);
    const targetNode = nodes.find(n => n.id === targetId);

    const related = edges
      .filter(e => e.target === targetId && e.relationship === 'executes_task')
      .map(e => {
        const node = nodes.find(n => n.id === e.source)!;
        return {
          node,
          relationship: e.relationship,
          direction: 'incoming' as const,
          relevanceScore: Math.round(e.weight * 100),
        };
      })
      .filter(r => r.node != null);

    return {
      query: `Governed agents capable of executing: "${targetNode?.label || targetId}"`,
      sourceNode: targetNode || null,
      relatedNodes: related,
      privacyGuaranteed: true,
    };
  }

  /**
   * Traversal Query: What applications integrate with this system?
   */
  public static findIntegrationsForSystem(systemId: string, tenantId: string): TraversalResult {
    const nodes = this.getNodes(tenantId);
    const edges = this.getEdges(tenantId);
    const targetNode = nodes.find(n => n.id === systemId);

    const related = edges
      .filter(e => (e.source === systemId || e.target === systemId) && e.relationship === 'integrates_with')
      .map(e => {
        const otherId = e.source === systemId ? e.target : e.source;
        const node = nodes.find(n => n.id === otherId)!;
        return {
          node,
          relationship: e.relationship,
          direction: (e.source === systemId ? 'outgoing' : 'incoming') as 'outgoing' | 'incoming',
          relevanceScore: Math.round(e.weight * 100),
        };
      })
      .filter(r => r.node != null);

    return {
      query: `Applications integrating with: "${targetNode?.label || systemId}"`,
      sourceNode: targetNode || null,
      relatedNodes: related,
      privacyGuaranteed: true,
    };
  }

  /**
   * Traversal Query: What solutions produce this outcome or solve this problem?
   */
  public static findSolutionsForOutcome(outcomeId: string, tenantId: string): TraversalResult {
    const nodes = this.getNodes(tenantId);
    const edges = this.getEdges(tenantId);
    const targetNode = nodes.find(n => n.id === outcomeId);

    const related = edges
      .filter(e => e.target === outcomeId && e.relationship === 'produces_outcome')
      .map(e => {
        const node = nodes.find(n => n.id === e.source)!;
        return {
          node,
          relationship: e.relationship,
          direction: 'incoming' as const,
          relevanceScore: Math.round(e.weight * 100),
        };
      })
      .filter(r => r.node != null);

    return {
      query: `Solutions & workflows that produce outcome: "${targetNode?.label || outcomeId}"`,
      sourceNode: targetNode || null,
      relatedNodes: related,
      privacyGuaranteed: true,
    };
  }

  private static saveNodes(nodes: KnowledgeGraphNode[]): void {
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  }

  private static saveEdges(edges: KnowledgeGraphEdge[]): void {
    localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
  }
}
