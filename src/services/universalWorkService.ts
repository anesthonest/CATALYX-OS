import { 
  UniversalWorkObject, 
  UniversalWorkType, 
  WorkStatus, 
  WorkPriority, 
  WorkMilestone, 
  WorkDecisionRecord, 
  WorkApprovalRecord,
  UniversalComment
} from '../types';
import { safeStorage } from '../utils/safeStorage';
import { collaborationService } from './collaborationService';

class UniversalWorkService {
  private readonly STORAGE_KEY = 'catalyx_v25_universal_work_objects';
  private workObjects: UniversalWorkObject[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<UniversalWorkObject>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.workObjects = loaded;
    } else {
      this.seedInitialWork();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.workObjects);
  }

  private seedInitialWork() {
    const now = new Date();
    this.workObjects = [
      {
        id: 'work_v25_strat_exp',
        title: 'Q4 Global Sovereign Enterprise Network Expansion',
        description: 'Coordinated deployment of decentralized trust nodes, enterprise federation protocols, and localized regulatory compliance frameworks across East Africa and Europe.',
        workType: 'INITIATIVE',
        owner: 'anesthonest81@gmail.com',
        creator: 'anesthonest81@gmail.com',
        organization: 'Vinexsah Global Holdings',
        workspace: 'ws_eng_alpha',
        team: 'Executive Strategic Architecture',
        participants: ['anesthonest81@gmail.com', 'sarah.lin@catalyx.io', 'marcus.vance@catalyx.io'],
        collaborators: ['elena.rostova@horizonconsortium.org'],
        partners: ['part_telecom_mesh', 'part_horizon_health'],
        customers: ['cust_vodacom_tz', 'cust_safari_transit'],
        stakeholders: ['Board of Directors', 'Regulatory Audit Council'],
        permissions: [
          { email: 'anesthonest81@gmail.com', role: 'OWNER' },
          { email: 'sarah.lin@catalyx.io', role: 'EDITOR' },
          { email: 'elena.rostova@horizonconsortium.org', role: 'COMMENTER' }
        ],
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        deadlines: [
          { label: 'Phase 1 Architecture Audit', dueDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(), completed: true },
          { label: 'Carrier Interconnect Launch', dueDate: new Date(now.getTime() + 21 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        milestones: [
          { id: 'm1', title: 'Cryptographic Node Verification', targetDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(), reached: true },
          { id: 'm2', title: 'Carrier Webhook Gateway Sign-Off', targetDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(), reached: false },
          { id: 'm3', title: 'Minor-Units Double-Entry Ledger Validation', targetDate: new Date(now.getTime() + 28 * 24 * 3600 * 1000).toISOString(), reached: false }
        ],
        dependencies: ['work_v25_consensus_eng'],
        tasks: [
          { id: 't1', title: 'Audit mTLS certificates across edge clusters', completed: true, assignee: 'anesthonest81@gmail.com' },
          { id: 't2', title: 'Verify Pesapal v3 IPN webhook retry backoff', completed: true, assignee: 'marcus.vance@catalyx.io' },
          { id: 't3', title: 'Publish partner federation security runbook', completed: false, assignee: 'sarah.lin@catalyx.io' }
        ],
        subtasks: [
          { id: 'st1', title: 'Generate ED25519 signing keys for cluster 04', completed: true },
          { id: 'st2', title: 'Run chaos network partitions on gateway', completed: false }
        ],
        documents: [
          { id: 'doc1', name: 'GAEN_Architecture_Whitepaper_v25.pdf', url: 'https://arxiv.org/pdf/2301.00001.pdf', mimeType: 'application/pdf' }
        ],
        files: ['file_v24_arch_spec', 'file_v24_pesapal_runbook'],
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'],
        videos: ['media_v24_product_keynote'],
        audio: ['media_podcast_autonomous_workforce'],
        presentations: ['pres_v24_executive_strategy'],
        demos: ['demo_v24_interactive_sandbox'],
        meetings: ['meet_v24_arch_sync'],
        messages: ['msg_kickoff_notice'],
        comments: [],
        decisions: [
          {
            id: 'dec_1',
            decision: 'Adopt CommonJS bundle architecture for Node server to ensure universal container cold-starts',
            deciderEmail: 'anesthonest81@gmail.com',
            decidedAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
            rationale: 'Eliminates ES Module path resolution errors on production runtime.',
            status: 'FINALIZED'
          }
        ],
        approvals: [
          {
            id: 'app_1',
            approverEmail: 'anesthonest81@gmail.com',
            status: 'APPROVED',
            decidedAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
            comments: 'Production security gates verified and compliant.'
          }
        ],
        financialInfo: {
          budgetMinorUnits: 8500000, // $85,000.00
          costMinorUnits: 3240000,   // $32,400.00
          revenueMinorUnits: 14200000,// $142,000.00
          currency: 'USD'
        },
        relatedCustomers: ['cust_vodacom_tz'],
        relatedProducts: ['prod_enterprise_core'],
        relatedOrders: ['ord_ent_9921'],
        relatedMissions: ['mission_fab9'],
        relatedAiAgents: ['strategic', 'execution'],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', action: 'CREATED', details: 'Initialized Universal Work Object with 3 milestones' },
          { timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', action: 'APPROVED', details: 'Phase 1 security sign-off complete' }
        ],
        auditHistory: [
          { timestamp: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(), actor: 'system', checksum: 'sha256_e8293ba17f0a', changeSummary: 'Genesis object integrity hash' }
        ],
        versionHistory: [
          { version: 1, updatedAt: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(), updatedBy: 'anesthonest81@gmail.com', changeLog: 'Initial release' }
        ],
        links: [
          { label: 'Sovereign Network RFC', url: 'https://ietf.org/rfc' }
        ],
        externalReferences: [
          { system: 'Jira Enterprise', refId: 'VINE-4921', url: 'https://vinexsah.atlassian.net/browse/VINE-4921' }
        ],
        metadata: {
          complianceClassification: 'SOC2-TypeII',
          geoRegion: 'EMEA/AFRICA',
          criticalityRating: 5
        },
        tags: ['strategy', 'sovereign-net', 'pesapal', 'expansion'],
        customFields: {
          slaCommitmentHours: 4,
          dataResidencyRequirement: 'Tanzania & EU'
        },
        workflowState: 'STAGE_3_PILOT_VERIFICATION',
        securityClassification: 'CONFIDENTIAL',
        retentionPolicy: '7_YEARS_AUDIT_COMPLIANT',
        sharingPolicy: {
          publicShareAllowed: false,
          requirePasscode: true,
          maxAccessLevel: 'COMMENT'
        },
        createdAt: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString()
      },
      {
        id: 'work_v25_consensus_eng',
        title: 'Distributed Autonomous Consensus & Fault-Tolerant Engine',
        description: 'Implementation of high-throughput Byzantine fault tolerant voting loop for autonomous agent task allocation, resource pricing, and zero-loss failover.',
        workType: 'SOFTWARE_PROJECT',
        owner: 'anesthonest81@gmail.com',
        creator: 'anesthonest81@gmail.com',
        organization: 'Vinexsah Global Holdings',
        workspace: 'ws_eng_alpha',
        team: 'Systems Core Engineering',
        participants: ['anesthonest81@gmail.com', 'marcus.vance@catalyx.io'],
        collaborators: [],
        partners: [],
        customers: [],
        stakeholders: ['Engineering Staff'],
        permissions: [
          { email: 'anesthonest81@gmail.com', role: 'OWNER' }
        ],
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        deadlines: [
          { label: 'Benchmark 50,000 tx/sec', dueDate: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        milestones: [
          { id: 'm1', title: 'In-Memory Gossip Protocol Spec', targetDate: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(), reached: true },
          { id: 'm2', title: 'Crash Isolation Sandbox Harness', targetDate: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString(), reached: false }
        ],
        dependencies: [],
        tasks: [
          { id: 't1', title: 'Write fuzzy stress suite for state synchronization', completed: true, assignee: 'marcus.vance@catalyx.io' },
          { id: 't2', title: 'Implement idempotent rollback buffers', completed: false, assignee: 'anesthonest81@gmail.com' }
        ],
        subtasks: [],
        documents: [],
        files: ['file_v24_code_sample'],
        images: [],
        videos: ['media_pesapal_v3_demo'],
        audio: [],
        presentations: ['pres_v24_product_architecture'],
        demos: ['demo_v24_interactive_sandbox'],
        meetings: ['meet_v24_product_demo'],
        messages: [],
        comments: [],
        decisions: [],
        approvals: [],
        financialInfo: {
          budgetMinorUnits: 3500000,
          costMinorUnits: 1200000,
          currency: 'USD'
        },
        relatedCustomers: [],
        relatedProducts: [],
        relatedOrders: [],
        relatedMissions: ['mission_fab9'],
        relatedAiAgents: ['operations', 'execution'],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', action: 'CREATED', details: 'Initialized Software Project specification' }
        ],
        auditHistory: [],
        versionHistory: [
          { version: 1, updatedAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(), updatedBy: 'anesthonest81@gmail.com', changeLog: 'Initial check-in' }
        ],
        links: [],
        externalReferences: [],
        metadata: {},
        tags: ['engineering', 'consensus', 'bft', 'core'],
        customFields: {},
        workflowState: 'SPRINT_DEVELOPMENT',
        securityClassification: 'INTERNAL',
        retentionPolicy: 'PERMANENT',
        sharingPolicy: {
          publicShareAllowed: false,
          requirePasscode: false,
          maxAccessLevel: 'VIEW'
        },
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString()
      },
      {
        id: 'work_v25_horizon_alliance',
        title: 'Horizon Healthcare Consortium Strategic AI Diagnostic Partnership',
        description: 'Bilateral partnership proposal for federated learning on anonymized radiological datasets with strict HIPAA/GDPR cryptographic isolation.',
        workType: 'PARTNERSHIP_PROPOSAL',
        owner: 'anesthonest81@gmail.com',
        creator: 'anesthonest81@gmail.com',
        organization: 'Vinexsah Global Holdings',
        workspace: 'ws_eng_alpha',
        team: 'Partnership & Alliances',
        participants: ['anesthonest81@gmail.com', 'dr.elena.rostova@horizonconsortium.org'],
        collaborators: ['legal@catalyx.io'],
        partners: ['part_horizon_health'],
        customers: [],
        stakeholders: ['Hospital Ethics Board', 'Vinexsah Legal'],
        permissions: [
          { email: 'anesthonest81@gmail.com', role: 'OWNER' },
          { email: 'dr.elena.rostova@horizonconsortium.org', role: 'EDITOR' }
        ],
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        deadlines: [
          { label: 'Consortium Legal Signing', dueDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        milestones: [
          { id: 'm1', title: 'Data Governance Protocol Draft', targetDate: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString(), reached: true },
          { id: 'm2', title: 'Pilot Model Training Sandbox Approval', targetDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(), reached: false }
        ],
        dependencies: [],
        tasks: [
          { id: 't1', title: 'Review Mutual Non-Disclosure Agreement (MNDA)', completed: true, assignee: 'legal@catalyx.io' },
          { id: 't2', title: 'Validate zero-knowledge proof verification endpoint', completed: false, assignee: 'anesthonest81@gmail.com' }
        ],
        subtasks: [],
        documents: [],
        files: ['file_v24_arch_spec'],
        images: [],
        videos: [],
        audio: [],
        presentations: ['pres_v24_investor_pitch'],
        demos: ['demo_v24_interactive_sandbox'],
        meetings: ['meet_v24_carrier_audit'],
        messages: [],
        comments: [],
        decisions: [
          {
            id: 'dec_h1',
            decision: 'Mandate on-premise edge enclave for all patient image training',
            deciderEmail: 'dr.elena.rostova@horizonconsortium.org',
            decidedAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
            rationale: 'Regulatory compliance requirement under Article 9 GDPR.',
            status: 'FINALIZED'
          }
        ],
        approvals: [
          {
            id: 'app_h1',
            approverEmail: 'anesthonest81@gmail.com',
            status: 'PENDING',
            comments: 'Pending final review of zero-knowledge circuit parameters.'
          }
        ],
        financialInfo: {
          budgetMinorUnits: 12000000,
          revenueMinorUnits: 25000000,
          currency: 'USD'
        },
        relatedCustomers: [],
        relatedProducts: [],
        relatedOrders: [],
        relatedMissions: [],
        relatedAiAgents: ['strategic', 'research'],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', action: 'CREATED', details: 'Submitted bilateral proposal draft' }
        ],
        auditHistory: [],
        versionHistory: [
          { version: 1, updatedAt: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(), updatedBy: 'anesthonest81@gmail.com', changeLog: 'Proposal version 1.0' }
        ],
        links: [],
        externalReferences: [],
        metadata: {},
        tags: ['healthcare', 'partnership', 'federated-learning', 'zk-proof'],
        customFields: {
          dataIsolationTier: 'TIER_4_AIR_GAPPED_ENCLAVE'
        },
        workflowState: 'LEGAL_REVIEW',
        securityClassification: 'RESTRICTED',
        retentionPolicy: '10_YEARS_HEALTHCARE_STANDARD',
        sharingPolicy: {
          publicShareAllowed: false,
          requirePasscode: true,
          maxAccessLevel: 'VIEW'
        },
        createdAt: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: 'work_v25_cvi_forecast',
        title: 'Commercial Customer Value Index (CVI) & Churn Forecast Model',
        description: 'Predictive econometric analysis synthesizing order frequency, Pesapal transaction velocity, and support ticket sentiment into automated account health coefficients.',
        workType: 'ANALYTICS',
        owner: 'anesthonest81@gmail.com',
        creator: 'anesthonest81@gmail.com',
        organization: 'Vinexsah Global Holdings',
        workspace: 'ws_comm_ops',
        team: 'Commercial Intelligence',
        participants: ['anesthonest81@gmail.com'],
        collaborators: [],
        partners: [],
        customers: ['cust_vodacom_tz', 'cust_safari_transit'],
        stakeholders: ['Commercial VP'],
        permissions: [
          { email: 'anesthonest81@gmail.com', role: 'OWNER' }
        ],
        status: 'COMPLETED',
        priority: 'MEDIUM',
        deadlines: [
          { label: 'Q3 Cohort Analysis', dueDate: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(), completed: true }
        ],
        milestones: [
          { id: 'm1', title: 'Data Cleaning & Minor Units Normalization', targetDate: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(), reached: true },
          { id: 'm2', title: 'Regression Curve Calibration', targetDate: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(), reached: true }
        ],
        dependencies: [],
        tasks: [
          { id: 't1', title: 'Export double-entry ledger summaries', completed: true, assignee: 'anesthonest81@gmail.com' },
          { id: 't2', title: 'Generate executive heatmaps', completed: true, assignee: 'anesthonest81@gmail.com' }
        ],
        subtasks: [],
        documents: [],
        files: ['file_v24_q3_financial_model'],
        images: [],
        videos: [],
        audio: [],
        presentations: ['pres_v24_executive_strategy'],
        demos: [],
        meetings: ['meet_v24_carrier_audit'],
        messages: [],
        comments: [],
        decisions: [],
        approvals: [],
        financialInfo: {
          costMinorUnits: 45000,
          currency: 'USD'
        },
        relatedCustomers: ['cust_vodacom_tz', 'cust_safari_transit'],
        relatedProducts: ['prod_enterprise_core', 'prod_consulting_pack'],
        relatedOrders: ['ord_ent_9921', 'ord_safari_8812'],
        relatedMissions: [],
        relatedAiAgents: ['analytics', 'financial'],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 120 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', action: 'COMPLETED', details: 'Finished cohort study and filed report' }
        ],
        auditHistory: [],
        versionHistory: [],
        links: [],
        externalReferences: [],
        metadata: {},
        tags: ['analytics', 'cvi', 'churn', 'finance'],
        customFields: {},
        workflowState: 'ARCHIVED_COMPLETED',
        securityClassification: 'INTERNAL',
        retentionPolicy: 'STANDARD',
        sharingPolicy: {
          publicShareAllowed: false,
          requirePasscode: false,
          maxAccessLevel: 'VIEW'
        },
        createdAt: new Date(now.getTime() - 140 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ];
    this.saveState();
  }

  public getAllWork(filter?: {
    type?: UniversalWorkType | 'ALL';
    status?: WorkStatus | 'ALL';
    priority?: WorkPriority | 'ALL';
    search?: string;
  }): UniversalWorkObject[] {
    let list = [...this.workObjects];

    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter(w => w.workType === filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(w => w.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'ALL') {
      list = list.filter(w => w.priority === filter.priority);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(w => 
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some(t => t.toLowerCase().includes(q)) ||
        w.workType.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getWorkById(id: string): UniversalWorkObject | undefined {
    return this.workObjects.find(w => w.id === id);
  }

  public createWork(
    payload: Partial<UniversalWorkObject>,
    actorEmail: string
  ): UniversalWorkObject {
    const now = new Date().toISOString();
    const newWork: UniversalWorkObject = {
      id: `work_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title || 'Untitled Work Object',
      description: payload.description || '',
      workType: payload.workType || 'PROJECT',
      owner: actorEmail,
      creator: actorEmail,
      organization: payload.organization || 'Vinexsah Global Holdings',
      workspace: payload.workspace || 'ws_eng_alpha',
      team: payload.team || 'General Execution',
      participants: payload.participants || [actorEmail],
      collaborators: payload.collaborators || [],
      partners: payload.partners || [],
      customers: payload.customers || [],
      stakeholders: payload.stakeholders || [],
      permissions: [
        { email: actorEmail, role: 'OWNER' },
        ...(payload.permissions || [])
      ],
      status: payload.status || 'PLANNED',
      priority: payload.priority || 'MEDIUM',
      deadlines: payload.deadlines || [],
      milestones: payload.milestones || [],
      dependencies: payload.dependencies || [],
      tasks: payload.tasks || [],
      subtasks: payload.subtasks || [],
      documents: payload.documents || [],
      files: payload.files || [],
      images: payload.images || [],
      videos: payload.videos || [],
      audio: payload.audio || [],
      presentations: payload.presentations || [],
      demos: payload.demos || [],
      meetings: payload.meetings || [],
      messages: [],
      comments: [],
      decisions: [],
      approvals: [],
      financialInfo: payload.financialInfo,
      relatedCustomers: payload.relatedCustomers || [],
      relatedProducts: payload.relatedProducts || [],
      relatedOrders: payload.relatedOrders || [],
      relatedMissions: payload.relatedMissions || [],
      relatedAiAgents: payload.relatedAiAgents || [],
      activityHistory: [
        { timestamp: now, actor: actorEmail, action: 'CREATED', details: `Created work object (${payload.workType || 'PROJECT'})` }
      ],
      auditHistory: [
        { timestamp: now, actor: actorEmail, checksum: `sha256_${Math.random().toString(36).substring(2, 14)}`, changeSummary: 'Initial creation' }
      ],
      versionHistory: [
        { version: 1, updatedAt: now, updatedBy: actorEmail, changeLog: 'Created object' }
      ],
      links: payload.links || [],
      externalReferences: payload.externalReferences || [],
      metadata: payload.metadata || {},
      tags: payload.tags || ['v25-work'],
      customFields: payload.customFields || {},
      workflowState: payload.workflowState || 'INITIALIZED',
      securityClassification: payload.securityClassification || 'INTERNAL',
      retentionPolicy: payload.retentionPolicy || 'STANDARD',
      sharingPolicy: payload.sharingPolicy || {
        publicShareAllowed: false,
        requirePasscode: false,
        maxAccessLevel: 'VIEW'
      },
      createdAt: now,
      updatedAt: now
    };

    this.workObjects.unshift(newWork);
    this.saveState();

    collaborationService.logEnterpriseActivity({
      eventType: 'WORK_OBJECT_CREATED',
      title: `New Work Object: ${newWork.title}`,
      description: `Initialized ${newWork.workType} work with priority ${newWork.priority}`,
      actor: actorEmail,
      targetType: 'work_object',
      targetId: newWork.id,
      targetTab: 'universal-work'
    });

    return newWork;
  }

  public updateWork(
    id: string,
    updates: Partial<UniversalWorkObject>,
    actorEmail: string,
    changeLog?: string
  ): UniversalWorkObject | null {
    const idx = this.workObjects.findIndex(w => w.id === id);
    if (idx === -1) return null;

    const existing = this.workObjects[idx];
    const now = new Date().toISOString();

    const updatedWork: UniversalWorkObject = {
      ...existing,
      ...updates,
      updatedAt: now,
      activityHistory: [
        { timestamp: now, actor: actorEmail, action: 'UPDATED', details: changeLog || 'Updated work properties' },
        ...existing.activityHistory
      ],
      versionHistory: [
        { version: existing.versionHistory.length + 1, updatedAt: now, updatedBy: actorEmail, changeLog: changeLog || 'Updated work object' },
        ...existing.versionHistory
      ]
    };

    this.workObjects[idx] = updatedWork;
    this.saveState();

    collaborationService.logEnterpriseActivity({
      eventType: 'WORK_OBJECT_UPDATED',
      title: `Updated Work: ${updatedWork.title}`,
      description: changeLog || `Status: ${updatedWork.status}, Priority: ${updatedWork.priority}`,
      actor: actorEmail,
      targetType: 'work_object',
      targetId: updatedWork.id,
      targetTab: 'universal-work'
    });

    return updatedWork;
  }

  public getWorkObjectById(id: string): UniversalWorkObject | undefined {
    return this.getWorkById(id);
  }

  public updateWorkObject(
    id: string,
    updates: Partial<UniversalWorkObject>,
    actorEmail: string,
    changeLog?: string
  ): UniversalWorkObject | null {
    return this.updateWork(id, updates, actorEmail, changeLog);
  }

  public deleteWork(id: string, actorEmail: string): boolean {
    const item = this.getWorkById(id);
    if (!item) return false;
    this.workObjects = this.workObjects.filter(w => w.id !== id);
    this.saveState();

    collaborationService.logEnterpriseActivity({
      eventType: 'WORK_OBJECT_UPDATED',
      title: `Deleted Work: ${item.title}`,
      description: `Removed work object from workspace`,
      actor: actorEmail,
      targetType: 'work_object',
      targetId: id,
      targetTab: 'universal-work'
    });

    return true;
  }

  public addMilestone(
    workId: string,
    milestone: Omit<WorkMilestone, 'id'>,
    actorEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const newMilestone: WorkMilestone = {
      ...milestone,
      id: `m_${Date.now()}`
    };

    return !!this.updateWork(
      workId,
      { milestones: [...work.milestones, newMilestone] },
      actorEmail,
      `Added milestone: ${newMilestone.title}`
    );
  }

  public toggleMilestone(
    workId: string,
    milestoneId: string,
    actorEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const milestones = work.milestones.map(m => 
      m.id === milestoneId ? { ...m, reached: !m.reached } : m
    );

    return !!this.updateWork(
      workId,
      { milestones },
      actorEmail,
      `Toggled milestone completion status`
    );
  }

  public addTask(
    workId: string,
    title: string,
    assignee: string,
    actorEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const newTask = {
      id: `task_${Date.now()}`,
      title,
      completed: false,
      assignee: assignee || actorEmail
    };

    return !!this.updateWork(
      workId,
      { tasks: [...work.tasks, newTask] },
      actorEmail,
      `Added task: ${title}`
    );
  }

  public toggleTask(
    workId: string,
    taskId: string,
    actorEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const tasks = work.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    return !!this.updateWork(
      workId,
      { tasks },
      actorEmail,
      `Toggled task status`
    );
  }

  public addDecision(
    workId: string,
    decision: string,
    rationale: string,
    deciderEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const newDecision: WorkDecisionRecord = {
      id: `dec_${Date.now()}`,
      decision,
      rationale,
      deciderEmail,
      decidedAt: new Date().toISOString(),
      status: 'FINALIZED'
    };

    return !!this.updateWork(
      workId,
      { decisions: [newDecision, ...work.decisions] },
      deciderEmail,
      `Logged formal decision: ${decision}`
    );
  }

  public addApproval(
    workId: string,
    approverEmail: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    comments: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const newApproval: WorkApprovalRecord = {
      id: `app_${Date.now()}`,
      approverEmail,
      status,
      decidedAt: new Date().toISOString(),
      comments
    };

    return !!this.updateWork(
      workId,
      { approvals: [newApproval, ...work.approvals] },
      approverEmail,
      `Recorded governance approval (${status}) by ${approverEmail}`
    );
  }

  public linkArtifact(
    workId: string,
    artifactType: 'presentation' | 'demo' | 'meeting' | 'file' | 'video',
    artifactId: string,
    actorEmail: string
  ): boolean {
    const work = this.getWorkById(workId);
    if (!work) return false;

    const updates: Partial<UniversalWorkObject> = {};
    if (artifactType === 'presentation' && !work.presentations.includes(artifactId)) {
      updates.presentations = [...work.presentations, artifactId];
    } else if (artifactType === 'demo' && !work.demos.includes(artifactId)) {
      updates.demos = [...work.demos, artifactId];
    } else if (artifactType === 'meeting' && !work.meetings.includes(artifactId)) {
      updates.meetings = [...work.meetings, artifactId];
    } else if (artifactType === 'file' && !work.files.includes(artifactId)) {
      updates.files = [...work.files, artifactId];
    } else if (artifactType === 'video' && !work.videos.includes(artifactId)) {
      updates.videos = [...work.videos, artifactId];
    }

    return !!this.updateWork(workId, updates, actorEmail, `Linked ${artifactType} artifact (${artifactId})`);
  }

  public exportWorkSummary(id: string): string {
    const w = this.getWorkById(id);
    if (!w) return '';

    return JSON.stringify(w, null, 2);
  }
}

export const universalWorkService = new UniversalWorkService();
