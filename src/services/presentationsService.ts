import { WorkPresentation, WorkSlide } from '../types';
import { safeStorage } from '../utils/safeStorage';

class PresentationsService {
  private readonly STORAGE_KEY = 'catalyx_v24_presentations';
  private presentations: WorkPresentation[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<WorkPresentation>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.presentations = loaded;
    } else {
      this.seedInitialPresentations();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.presentations);
  }

  private seedInitialPresentations() {
    const now = new Date();
    this.presentations = [
      {
        id: 'pres_q4_strategic_roadmap',
        title: 'Q4 2026 Planetary Strategic Roadmap',
        description: 'Executive briefing on global deployment, multi-agent coordination, and revenue velocity',
        category: 'STRATEGY',
        ownerEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        version: 'v2.4.1',
        tags: ['STRATEGY', 'V24', 'EXECUTIVE', 'GLOBAL_COORDINATION'],
        slides: [
          {
            id: 'slide_01',
            title: 'CATALYX Universal Operating System',
            subtitle: 'Planetary Infrastructure, Autonomous Agents & Financial Sovereignty',
            layout: 'title',
            content: [
              'Unified Workspace, Workforce, Social Connectivity, Commerce & Intelligence OS',
              'Presented by: Vinexsah Technologies Command Matrix',
              'Audience: Executive Board & Strategic Global Stakeholders'
            ],
            notes: 'Open by reiterating the core V24 tenet: no dead buttons, real operational connectivity, and honest system status.'
          },
          {
            id: 'slide_02',
            title: 'Q4 Strategic Momentum & North Star Metrics',
            subtitle: 'Operational velocity metrics measured in real-time telemetry',
            layout: 'metrics',
            content: [
              'Systemic operational velocity has exceeded target thresholds across all 9 canonical domains.'
            ],
            metrics: [
              { label: 'ORGANIZATIONAL VELOCITY', value: '94.2%', delta: '+3.4% YoY' },
              { label: 'SETTLEMENT EFFICIENCY', value: '99.98%', delta: '0 Discrepancy' },
              { label: 'FIREWALL COMPLIANCE', value: '100%', delta: '0 Injections' },
              { label: 'ACTIVE WORKFORCE', value: '11 AI + 48 Eng', delta: 'Fully Integrated' }
            ],
            notes: 'Emphasize that double-entry reconciliation runs continuously without synthetic numbers.'
          },
          {
            id: 'slide_03',
            title: 'Canonical 9-Domain Unified Architecture',
            subtitle: 'Every enterprise capability organized with clear wayfinding',
            layout: 'split',
            content: [
              '1. Home & Operational Command: Unified role lens (Executive, Manager, Operator, Developer)',
              '2. Work & Execution: Project Board, Worker Center, Deep Focus, Goals',
              '3. Intelligence & Planetary Fabric: V19 Digital Twins, Knowledge Graph, CVI Analysis',
              '4. Missions & Civilization: Critical Path DAGs, Human-in-the-Loop Approvals',
              '5. Automation & AI Agents: 11 Autonomous Agents, Safety Firewalls, Scientific Pipelines',
              '6. Resources & Compute: Load telemetry, Worker capacity, XP standings',
              '7. Ecosystem & Social Inbox: WhatsApp, Messenger, Instagram, Email & Connectors',
              '8. Commerce & Billing: Pesapal v3 live gateway, double-entry ledger, CRM',
              '9. Governance & Admin: Tenant isolation, RBAC, V24 Production Certification Dossier'
            ],
            notes: 'Walk through how each domain replaces fragmented SaaS subscriptions with one sovereign stack.'
          },
          {
            id: 'slide_04',
            title: 'Universal Collaboration & Sharing Standard',
            subtitle: 'Granular permissions, cryptographic tokens, and immutable audit trails',
            layout: 'bullets',
            content: [
              'Universal Artifacts: Presentations, Videos, Demos, Meetings, Files, and Projects',
              'Granular Permissions: VIEW, COMMENT, EDIT, and MANAGE tiers',
              'Security Guardrails: Instant token revocation kill-switch and optional passcode hashing',
              'Compliance Ledger: Immutable audit logs of every access attempt, download, and permission change'
            ],
            notes: 'Demonstrate the 1-click share modal and live audit trail verification.'
          },
          {
            id: 'slide_05',
            title: 'Commercial Scale & Pesapal v3 Gateway',
            subtitle: 'Minor-unit cryptographic accounting and multi-channel checkout',
            layout: 'quote',
            content: [
              '"True financial sovereignty requires integer-precision bookkeeping and seamless cross-border settlement rails."'
            ],
            metrics: [
              { label: 'CURRENCIES SUPPORTED', value: 'KES, USD, EUR, GBP' },
              { label: 'PAYMENT METHODS', value: 'Cards, M-Pesa, Airtel' },
              { label: 'WEBHOOK RECONCILIATION', value: '100% Verified IPN' }
            ],
            notes: 'Highlight that all calculations avoid floating point errors by using integer minor units.'
          }
        ]
      },
      {
        id: 'pres_v24_tech_arch',
        title: 'CATALYX V24 Technical Architecture & Security Dossier',
        description: 'Deep dive into Vite middleware, Express security headers, tenant isolation, and verification gates',
        category: 'ENGINEERING',
        ownerEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
        version: 'v2.4.0',
        tags: ['DEVSECOPS', 'ARCHITECTURE', 'SECURITY', 'V24'],
        slides: [
          {
            id: 'slide_arch_01',
            title: 'DevSecOps & Single-Port Ingress Guardrails',
            subtitle: 'Port 3000 strict binding, CSP policies, and zero HMR flicker',
            layout: 'bullets',
            content: [
              'Direct port 3000 binding required by container ingress proxy',
              'Express v4/v5 compatible catch-all router with fallback to SPA bundle',
              'Strict HTTP security headers: nosniff, frame-ancestors allowlist, anti-clickjacking',
              'Rate limiting capped at 180 requests/minute per IP address on all /api/* routes'
            ],
            notes: 'Explain why port 3000 is non-negotiable for container health probes.'
          },
          {
            id: 'slide_arch_02',
            title: '12 Production Verification Acceptance Gates',
            subtitle: 'Zero placeholder tolerance across all system components',
            layout: 'bullets',
            content: [
              'Gate 01: Universal Navigation & History Synchronization (Popstate / Deep Links)',
              'Gate 02: Workspace & Organization Switching Context',
              'Gate 03: Universal Artifact Sharing & Permissions (VIEW, COMMENT, EDIT, MANAGE)',
              'Gate 04: Cryptographic Share Token Validation & Instant Revocation',
              'Gate 05: Presentations Deck Studio & Fullscreen Presenter Mode',
              'Gate 06: Media & Video Player with MIME Upload Verification',
              'Gate 07: Demos & Prototypes Sandbox with Epistemic Badging',
              'Gate 08: Unified Meetings Scheduler with Action-Item-to-Task Conversion',
              'Gate 09: Universal Files Vault with MIME Type Verification',
              'Gate 10: Threaded Collaboration Comments & Enterprise Activity Feed',
              'Gate 11: Zero Dead Buttons & Honest Epistemic Dashboard Drill-Downs',
              'Gate 12: Production Bundle Compilation & Zero-Warning Lint Verification'
            ],
            notes: 'Every gate is checked programmatically in the V24 Certification Dossier.'
          }
        ]
      }
    ];
    this.saveState();
  }

  public getAllPresentations(): WorkPresentation[] {
    return [...this.presentations];
  }

  public getPresentationById(id: string): WorkPresentation | undefined {
    return this.presentations.find(p => p.id === id);
  }

  public createPresentation(params: {
    title: string;
    description: string;
    category: 'STRATEGY' | 'ENGINEERING' | 'PRODUCT' | 'FINANCE' | 'MISSION';
    ownerEmail: string;
    tags?: string[];
  }): WorkPresentation {
    const now = new Date().toISOString();
    const newPresentation: WorkPresentation = {
      id: 'pres_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      ownerEmail: params.ownerEmail,
      createdAt: now,
      updatedAt: now,
      version: 'v1.0.0',
      tags: params.tags || [params.category, 'V24'],
      slides: [
        {
          id: 'slide_' + Date.now().toString(36),
          title: params.title.trim(),
          subtitle: params.description.trim(),
          layout: 'title',
          content: [
            'Created via CATALYX Universal Workspace',
            'Author: ' + params.ownerEmail,
            'Date: ' + new Date().toLocaleDateString()
          ],
          notes: 'Presentation overview and agenda'
        },
        {
          id: 'slide_' + (Date.now() + 1).toString(36),
          title: 'Executive Summary & Key Objectives',
          subtitle: 'Milestones, operational goals, and target deliverables',
          layout: 'bullets',
          content: [
            'Deliverable 1: Strategic milestone definition',
            'Deliverable 2: Cross-team alignment and resource mapping',
            'Deliverable 3: Verification and operational sign-off'
          ],
          notes: 'Add presenter discussion notes here.'
        }
      ]
    };

    this.presentations.unshift(newPresentation);
    this.saveState();
    return newPresentation;
  }

  public addSlide(presentationId: string, slide: Omit<WorkSlide, 'id'>): WorkSlide | null {
    const pres = this.presentations.find(p => p.id === presentationId);
    if (!pres) return null;

    const newSlide: WorkSlide = {
      id: 'slide_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
      ...slide
    };

    pres.slides.push(newSlide);
    pres.updatedAt = new Date().toISOString();
    this.saveState();
    return newSlide;
  }

  public updateSlide(presentationId: string, slideId: string, updates: Partial<WorkSlide>): boolean {
    const pres = this.presentations.find(p => p.id === presentationId);
    if (!pres) return false;

    const slide = pres.slides.find(s => s.id === slideId);
    if (!slide) return false;

    Object.assign(slide, updates);
    pres.updatedAt = new Date().toISOString();
    this.saveState();
    return true;
  }

  public deletePresentation(id: string): boolean {
    const index = this.presentations.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.presentations.splice(index, 1);
    this.saveState();
    return true;
  }
}

export const presentationsService = new PresentationsService();
