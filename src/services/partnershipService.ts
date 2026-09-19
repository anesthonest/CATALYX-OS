import { 
  PartnerProfile, 
  PartnerDeliverable, 
  PartnerType, 
  PartnershipStatus 
} from '../types';
import { safeStorage } from '../utils/safeStorage';
import { collaborationService } from './collaborationService';

class PartnershipService {
  private readonly STORAGE_KEY = 'catalyx_v25_partnerships';
  private partners: PartnerProfile[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<PartnerProfile>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.partners = loaded;
    } else {
      this.seedInitialPartners();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.partners);
  }

  private seedInitialPartners() {
    const now = new Date();
    this.partners = [
      {
        id: 'part_telecom_mesh',
        name: 'Telecom Global Consortium (TGC)',
        partnerType: 'STRATEGIC_PARTNER',
        organization: 'Vinexsah Global Holdings',
        primaryContact: {
          name: 'Jean-Luc Moreau',
          email: 'jeanluc.moreau@telecomconsortium.org',
          phone: '+33 1 42 68 00 00',
          role: 'Vice President of Carrier Alliances'
        },
        status: 'ACTIVE',
        agreedTermsSummary: 'Co-location of edge decentralized AI verification nodes across 14 European and African tier-3 data centers with revenue share on transactional traffic.',
        startDate: new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString(),
        renewalDate: new Date(now.getTime() + 185 * 24 * 3600 * 1000).toISOString(),
        sharedObjectives: [
          'Deploy 50 high-availability CATALYX gateway nodes across regional PoPs',
          'Achieve sub-15ms edge inference routing for carrier clients',
          'Automate Pesapal minor-units billing reconciliation for transit fees'
        ],
        responsibilities: [
          {
            partnerName: 'Telecom Global Consortium',
            items: ['Provide rack space, redundant 10Gbps fiber, and IP transit', 'Assign dedicated Level-3 Network Operations Center engineers']
          },
          {
            partnerName: 'Vinexsah / CATALYX',
            items: ['Maintain containerized microservices and security patches', 'Provide real-time telemetry and cryptographic audit trails']
          }
        ],
        milestones: [
          { id: 'm_tgc_1', title: 'Carrier PoP Gateway Interconnect', dueDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), completed: true, deliverableRef: 'deliv_pop_gw' },
          { id: 'm_tgc_2', title: 'End-to-End SLA Stress Benchmarks', dueDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(), completed: false, deliverableRef: 'deliv_stress_bench' }
        ],
        deliverables: [
          {
            id: 'deliv_pop_gw',
            name: 'PoP Gateway Verification Dossier',
            description: 'Mutual audit verifying zero dropped packets on mTLS tunnels under peak load',
            dueDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
            owner: 'Jean-Luc Moreau',
            status: 'ACCEPTED',
            submittedAt: new Date(now.getTime() - 35 * 24 * 3600 * 1000).toISOString(),
            verificationEvidence: 'Report sha256: 9f8a8123c89b verified by CATALYX Gateway'
          },
          {
            id: 'deliv_stress_bench',
            name: 'Phase 2 Latency Optimization Matrix',
            description: 'Detailed routing tables and latency curves across European interconnects',
            dueDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(),
            owner: 'anesthonest81@gmail.com',
            status: 'IN_REVIEW'
          }
        ],
        sharedWorkObjectIds: ['work_v25_strat_exp'],
        sharedDocumentIds: ['file_v24_arch_spec'],
        sharedPresentationIds: ['pres_v24_executive_strategy'],
        sharedDemoIds: ['demo_v24_interactive_sandbox'],
        sharedMeetingIds: ['meet_v24_carrier_audit'],
        sharedCommunicationsCount: 38,
        approvals: [
          {
            id: 'app_tgc_1',
            topic: 'Phase 1 Milestone Acceptance & Transit Fee Settlement',
            requestedBy: 'Jean-Luc Moreau',
            approvedBy: 'anesthonest81@gmail.com',
            status: 'APPROVED',
            date: new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString()
          }
        ],
        decisions: [
          {
            id: 'dec_tgc_1',
            summary: 'Standardize on ISO-8583 message conversion for banking switch gateways',
            decidedAt: new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString(),
            parties: ['Jean-Luc Moreau', 'anesthonest81@gmail.com']
          }
        ],
        agreements: [
          {
            id: 'agr_tgc_master',
            title: 'Master Strategic Alliance & Cross-Border Telemetry Agreement',
            effectiveDate: new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString(),
            expirationDate: new Date(now.getTime() + 185 * 24 * 3600 * 1000).toISOString(),
            signed: true,
            signedBy: ['Jean-Luc Moreau (VP Alliances)', 'anesthonest81@gmail.com (Commander)'],
            termsSummary: 'Exclusive edge inference carrier partnership with 30-day notice period for audits'
          }
        ],
        actionItems: [
          { id: 'act_tgc_1', title: 'Schedule Q4 carrier operational review', assignee: 'Jean-Luc Moreau', dueDate: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        partnerPermissions: [
          { email: 'jeanluc.moreau@telecomconsortium.org', accessLevel: 'COLLABORATOR', authorizedDomain: 'telecomconsortium.org' }
        ],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', event: 'Signed Master Strategic Alliance Agreement' },
          { timestamp: new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', event: 'Approved Phase 1 Deliverables' }
        ],
        tenantId: 'org_vinexsah_global',
        createdAt: new Date(now.getTime() - 180 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'part_horizon_health',
        name: 'Horizon Healthcare Consortium',
        partnerType: 'INSTITUTION',
        organization: 'Vinexsah Global Holdings',
        primaryContact: {
          name: 'Dr. Elena Rostova',
          email: 'dr.elena.rostova@horizonconsortium.org',
          phone: '+41 22 791 21 11',
          role: 'Chief Medical Information Officer'
        },
        status: 'PROPOSAL',
        agreedTermsSummary: 'Confidential exploration of privacy-preserving federated AI model training across 12 academic teaching hospitals.',
        startDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
        sharedObjectives: [
          'Complete institutional review board (IRB) ethical clearances',
          'Deploy secure zero-knowledge enclave for radiologic image feature extraction',
          'Maintain 100% data residency inside sovereign health boundaries'
        ],
        responsibilities: [
          {
            partnerName: 'Horizon Healthcare Consortium',
            items: ['Provide anonymized ground-truth annotations', 'Conduct clinical validation trials']
          },
          {
            partnerName: 'Vinexsah / CATALYX',
            items: ['Furnish cryptographic enclave runtime and differential privacy guarantees']
          }
        ],
        milestones: [
          { id: 'm_hh_1', title: 'Bilateral Data Governance Protocol Draft', dueDate: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(), completed: true }
        ],
        deliverables: [
          {
            id: 'deliv_hh_gov',
            name: 'Institutional Ethics Governance Proposal',
            description: 'Complete specification of zero-knowledge privacy bounds and audit logging',
            dueDate: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
            owner: 'dr.elena.rostova@horizonconsortium.org',
            status: 'ACCEPTED'
          }
        ],
        sharedWorkObjectIds: ['work_v25_horizon_alliance'],
        sharedDocumentIds: ['file_v24_arch_spec'],
        sharedPresentationIds: ['pres_v24_investor_pitch'],
        sharedDemoIds: ['demo_v24_interactive_sandbox'],
        sharedMeetingIds: ['meet_v24_carrier_audit'],
        sharedCommunicationsCount: 19,
        approvals: [
          {
            id: 'app_hh_1',
            topic: 'Clinical Enclave Sandbox Specifications',
            requestedBy: 'Dr. Elena Rostova',
            status: 'PENDING',
            date: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString()
          }
        ],
        decisions: [],
        agreements: [
          {
            id: 'agr_hh_mnda',
            title: 'Mutual Non-Disclosure & Research Evaluation Agreement',
            effectiveDate: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
            signed: true,
            signedBy: ['Dr. Elena Rostova', 'anesthonest81@gmail.com'],
            termsSummary: 'Strict confidentiality of proprietary radiological model architectures'
          }
        ],
        actionItems: [
          { id: 'act_hh_1', title: 'Submit sandbox whitepaper to IRB ethics committee', assignee: 'Dr. Elena Rostova', dueDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        partnerPermissions: [
          { email: 'dr.elena.rostova@horizonconsortium.org', accessLevel: 'READ_ONLY', authorizedDomain: 'horizonconsortium.org' }
        ],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', event: 'Created Horizon Healthcare partnership proposal' }
        ],
        tenantId: 'org_vinexsah_global',
        createdAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'part_apex_ventures',
        name: 'Apex Sovereign Capital & Ventures',
        partnerType: 'INVESTOR',
        organization: 'Vinexsah Global Holdings',
        primaryContact: {
          name: 'Sir Arthur Sterling',
          email: 'a.sterling@apexsovereign.co.uk',
          phone: '+44 20 7946 0912',
          role: 'Managing General Partner'
        },
        status: 'ACTIVE',
        agreedTermsSummary: 'Strategic institutional growth capital and international commercial advisory for CATALYX enterprise expansion.',
        startDate: new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString(),
        renewalDate: new Date(now.getTime() + 275 * 24 * 3600 * 1000).toISOString(),
        sharedObjectives: [
          'Facilitate introduction to 10 Fortune-500 chief information security officers',
          'Review quarterly double-entry ledger audits and integer revenue metrics'
        ],
        responsibilities: [
          {
            partnerName: 'Apex Sovereign Capital',
            items: ['Quarterly capital allocation review', 'Global regulatory risk advisory']
          },
          {
            partnerName: 'Vinexsah / CATALYX',
            items: ['Provide audited executive telemetry dashboards and runbook verification']
          }
        ],
        milestones: [
          { id: 'm_apex_1', title: 'Series A Growth Capital Close', dueDate: new Date(now.getTime() - 85 * 24 * 3600 * 1000).toISOString(), completed: true }
        ],
        deliverables: [
          {
            id: 'deliv_apex_q3',
            name: 'Q3 Financial & Ledger Reconciliation Dossier',
            description: 'Double-entry cryptographic ledger report validating zero discrepancies across all Pesapal payment cycles',
            dueDate: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
            owner: 'anesthonest81@gmail.com',
            status: 'ACCEPTED'
          }
        ],
        sharedWorkObjectIds: ['work_v25_strat_exp', 'work_v25_cvi_forecast'],
        sharedDocumentIds: ['file_v24_q3_financial_model'],
        sharedPresentationIds: ['pres_v24_investor_pitch', 'pres_v24_executive_strategy'],
        sharedDemoIds: ['demo_v24_interactive_sandbox'],
        sharedMeetingIds: ['meet_v24_carrier_audit'],
        sharedCommunicationsCount: 42,
        approvals: [
          {
            id: 'app_apex_1',
            topic: 'Q4 Budget & Autonomous Agent Expenditure Cap',
            requestedBy: 'anesthonest81@gmail.com',
            approvedBy: 'Sir Arthur Sterling',
            status: 'APPROVED',
            date: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString()
          }
        ],
        decisions: [],
        agreements: [
          {
            id: 'agr_apex_invest',
            title: 'Strategic Capital & Advisory Rights Framework',
            effectiveDate: new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString(),
            signed: true,
            signedBy: ['Sir Arthur Sterling', 'anesthonest81@gmail.com'],
            termsSummary: 'Board observer seats and quarterly transparency covenants'
          }
        ],
        actionItems: [
          { id: 'act_apex_1', title: 'Deliver Q4 preview to advisory board', assignee: 'anesthonest81@gmail.com', dueDate: new Date(now.getTime() + 20 * 24 * 3600 * 1000).toISOString(), completed: false }
        ],
        partnerPermissions: [
          { email: 'a.sterling@apexsovereign.co.uk', accessLevel: 'READ_ONLY', authorizedDomain: 'apexsovereign.co.uk' }
        ],
        activityHistory: [
          { timestamp: new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString(), actor: 'anesthonest81@gmail.com', event: 'Ratified Apex Capital framework agreement' }
        ],
        tenantId: 'org_vinexsah_global',
        createdAt: new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString()
      }
    ];
    this.saveState();
  }

  public getAllPartners(filter?: {
    type?: PartnerType | 'ALL';
    status?: PartnershipStatus | 'ALL';
    search?: string;
  }): PartnerProfile[] {
    let list = [...this.partners];
    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter(p => p.partnerType === filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(p => p.status === filter.status);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.agreedTermsSummary.toLowerCase().includes(q) ||
        p.primaryContact.name.toLowerCase().includes(q) ||
        p.primaryContact.email.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getPartnerById(id: string): PartnerProfile | undefined {
    return this.partners.find(p => p.id === id);
  }

  public createPartnerProfile(
    data: Partial<PartnerProfile>,
    actorEmail: string
  ): PartnerProfile {
    const now = new Date().toISOString();
    const newPartner: PartnerProfile = {
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name || 'New Strategic Partner',
      partnerType: data.partnerType || 'STRATEGIC_PARTNER',
      organization: data.organization || 'Vinexsah Global Holdings',
      primaryContact: data.primaryContact || {
        name: 'Contact Lead',
        email: 'partner@external.org',
        role: 'Alliance Manager'
      },
      status: data.status || 'PROPOSAL',
      agreedTermsSummary: data.agreedTermsSummary || '',
      startDate: data.startDate || now,
      renewalDate: data.renewalDate,
      sharedObjectives: data.sharedObjectives || [],
      responsibilities: data.responsibilities || [],
      milestones: data.milestones || [],
      deliverables: data.deliverables || [],
      sharedWorkObjectIds: data.sharedWorkObjectIds || [],
      sharedDocumentIds: data.sharedDocumentIds || [],
      sharedPresentationIds: data.sharedPresentationIds || [],
      sharedDemoIds: data.sharedDemoIds || [],
      sharedMeetingIds: data.sharedMeetingIds || [],
      sharedCommunicationsCount: 0,
      approvals: [],
      decisions: [],
      agreements: data.agreements || [],
      actionItems: data.actionItems || [],
      partnerPermissions: data.partnerPermissions || [
        { email: data.primaryContact?.email || 'partner@external.org', accessLevel: 'READ_ONLY', authorizedDomain: 'external.org' }
      ],
      activityHistory: [
        { timestamp: now, actor: actorEmail, event: `Registered partner ${data.name || 'New Partner'}` }
      ],
      tenantId: 'org_vinexsah_global',
      createdAt: now,
      updatedAt: now
    };

    this.partners.unshift(newPartner);
    this.saveState();

    collaborationService.logEnterpriseActivity({
      eventType: 'PARTNER_PROPOSAL_CREATED',
      title: `Partner Proposal: ${newPartner.name}`,
      description: `Registered ${newPartner.partnerType} partnership profile`,
      actor: actorEmail,
      targetType: 'partner',
      targetId: newPartner.id,
      targetTab: 'partnerships'
    });

    return newPartner;
  }

  public updatePartnerProfile(
    id: string,
    updates: Partial<PartnerProfile>,
    actorEmail: string
  ): PartnerProfile | null {
    const idx = this.partners.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.partners[idx];
    const now = new Date().toISOString();

    const updated: PartnerProfile = {
      ...existing,
      ...updates,
      updatedAt: now,
      activityHistory: [
        { timestamp: now, actor: actorEmail, event: 'Updated partnership details' },
        ...existing.activityHistory
      ]
    };

    this.partners[idx] = updated;
    this.saveState();
    return updated;
  }

  public addDeliverable(
    partnerId: string,
    deliverable: Omit<PartnerDeliverable, 'id'>,
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const newDeliv: PartnerDeliverable = {
      ...deliverable,
      id: `deliv_${Date.now()}`
    };

    return !!this.updatePartnerProfile(
      partnerId,
      { deliverables: [newDeliv, ...partner.deliverables] },
      actorEmail
    );
  }

  public updateDeliverableStatus(
    partnerId: string,
    deliverableId: string,
    status: PartnerDeliverable['status'],
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const deliverables = partner.deliverables.map(d =>
      d.id === deliverableId ? { ...d, status, submittedAt: new Date().toISOString() } : d
    );

    return !!this.updatePartnerProfile(partnerId, { deliverables }, actorEmail);
  }

  public addJointApproval(
    partnerId: string,
    topic: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const newApproval = {
      id: `app_${Date.now()}`,
      topic,
      requestedBy: actorEmail,
      approvedBy: status === 'APPROVED' ? actorEmail : undefined,
      status,
      date: new Date().toISOString()
    };

    return !!this.updatePartnerProfile(
      partnerId,
      { approvals: [newApproval, ...partner.approvals] },
      actorEmail
    );
  }

  public signAgreement(
    partnerId: string,
    agreementId: string,
    signerEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const agreements = partner.agreements.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          signed: true,
          signedBy: Array.from(new Set([...a.signedBy, signerEmail]))
        };
      }
      return a;
    });

    collaborationService.logEnterpriseActivity({
      eventType: 'PARTNERSHIP_AGREED',
      title: `Agreement Signed: ${partner.name}`,
      description: `Mutual agreement signed by ${signerEmail}`,
      actor: signerEmail,
      targetType: 'partner',
      targetId: partnerId,
      targetTab: 'partnerships'
    });

    return !!this.updatePartnerProfile(partnerId, { agreements }, signerEmail);
  }

  public addActionItem(
    partnerId: string,
    title: string,
    assignee: string,
    dueDate: string,
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const newAction = {
      id: `act_${Date.now()}`,
      title,
      assignee,
      dueDate,
      completed: false
    };

    return !!this.updatePartnerProfile(
      partnerId,
      { actionItems: [...partner.actionItems, newAction] },
      actorEmail
    );
  }

  public toggleActionItem(
    partnerId: string,
    actionId: string,
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    const actionItems = partner.actionItems.map(a =>
      a.id === actionId ? { ...a, completed: !a.completed } : a
    );

    return !!this.updatePartnerProfile(partnerId, { actionItems }, actorEmail);
  }

  public linkSharedWork(
    partnerId: string,
    workObjectId: string,
    actorEmail: string
  ): boolean {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return false;

    if (partner.sharedWorkObjectIds.includes(workObjectId)) return true;

    return !!this.updatePartnerProfile(
      partnerId,
      { sharedWorkObjectIds: [...partner.sharedWorkObjectIds, workObjectId] },
      actorEmail
    );
  }
}

export const partnershipService = new PartnershipService();
