/**
 * CATALYX Universal Professional Services & Freelance Commerce Engine
 *
 * Supports independent professionals, consultants, engineers, designers, researchers,
 * educators, tutors, and coaches selling structured service packages, hourly retainers,
 * and milestone-based deliverables.
 */

export type ProfessionalCategory =
  | 'SOFTWARE_ENGINEERING'
  | 'AI_RESEARCH_DATA'
  | 'DESIGN_CREATIVE'
  | 'STRATEGY_CONSULTING'
  | 'FINANCE_ACCOUNTING'
  | 'TUTORING_EDUCATION'
  | 'WRITING_TRANSLATION'
  | 'LEGAL_COMPLIANCE'
  | 'MARKETING_GROWTH'
  | 'AUDIO_VIDEO_PRODUCTION'
  | 'ARCHITECTURE_ENGINEERING'
  | 'OTHER_PROFESSIONAL';

export interface ServiceTierPackage {
  id: string;
  name: string; // e.g. 'Starter', 'Standard', 'Pro'
  description: string;
  priceMinorUnits: number;
  deliveryTimeDays: number;
  revisionsAllowed: number;
  deliverablesIncluded: string[];
}

export interface ProfessionalProfile {
  id: string;
  userEmail: string;
  displayName: string;
  professionalTitle: string;
  primaryCategory: ProfessionalCategory;
  bio: string;
  hourlyRateMinorUnits: number; // e.g. $75/hr = 7500
  currency: string;
  rating: number;               // e.g. 4.9
  completedProjectsCount: number;
  verifiedCredentialBadge: string;
  skills: string[];
  portfolioLinks: { title: string; url: string }[];
  packages: ServiceTierPackage[];
  isAvailableForHire: boolean;
  responseTimeHours: number;
}

export interface ServiceEngagementContract {
  id: string;
  serviceId: string;
  packageId: string;
  clientEmail: string;
  clientName: string;
  professionalEmail: string;
  professionalName: string;
  packageTitle: string;
  priceMinorUnits: number;
  currency: string;
  status: 'PROPOSED' | 'FUNDED_ESCROW' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED' | 'DISPUTED' | 'COMPLETED';
  milestones: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
  }[];
  briefRequirements: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'catalyx_professional_profiles';
const CONTRACTS_KEY = 'catalyx_service_contracts';

export class ProfessionalServicesService {
  private profiles: Map<string, ProfessionalProfile> = new Map();
  private contracts: Map<string, ServiceEngagementContract> = new Map();

  constructor() {
    this.loadFromStorage();
    if (this.profiles.size === 0) {
      this.seedInitialProfessionals();
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const rawProf = localStorage.getItem(STORAGE_KEY);
      if (rawProf) {
        const list: ProfessionalProfile[] = JSON.parse(rawProf);
        for (const p of list) {
          this.profiles.set(p.id, p);
        }
      }
      const rawCont = localStorage.getItem(CONTRACTS_KEY);
      if (rawCont) {
        const list: ServiceEngagementContract[] = JSON.parse(rawCont);
        for (const c of list) {
          this.contracts.set(c.id, c);
        }
      }
    } catch (e) {
      console.error('Failed to load professional services data:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.profiles.values())));
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(Array.from(this.contracts.values())));
    } catch (e) {
      console.error('Failed to save professional services data:', e);
    }
  }

  private seedInitialProfessionals(): void {
    const prof1: ProfessionalProfile = {
      id: 'prof_elena_ai_arch',
      userEmail: 'creator@intelligence.org',
      displayName: 'Dr. Elena Rostova',
      professionalTitle: 'Distributed AI Systems Architect & Research Lead',
      primaryCategory: 'AI_RESEARCH_DATA',
      bio: 'Former CERN computing researcher specializing in resilient distributed inference, neural ontologies, and multi-agent coordination frameworks.',
      hourlyRateMinorUnits: 15000, // $150.00/hr
      currency: 'USD',
      rating: 4.96,
      completedProjectsCount: 48,
      verifiedCredentialBadge: 'CATALYX Verified AI Fellow',
      skills: ['Multi-Agent Consensus', 'Post-Quantum TLS', 'Distributed Systems', 'PyTorch', 'Rust'],
      portfolioLinks: [
        { title: 'Neural Ontologies Benchmark 2026', url: 'https://catalyx.io/work/neural_benchmark' },
        { title: 'High-Throughput Envoy Mesh Whitepaper', url: 'https://catalyx.io/work/envoy_mesh' }
      ],
      packages: [
        {
          id: 'pkg_elena_audit',
          name: 'Architecture Audit & Security Review',
          description: 'Comprehensive 1-week structural audit of your AI agent coordination graphs and latency profile.',
          priceMinorUnits: 120000, // $1,200.00
          deliveryTimeDays: 7,
          revisionsAllowed: 2,
          deliverablesIncluded: [
            'Full Architecture Audit Dossier (PDF/Work Object)',
            'Latency & Bottleneck Heatmap',
            '60-Minute Executive Debrief Call'
          ]
        },
        {
          id: 'pkg_elena_full_design',
          name: 'Custom Multi-Agent Production Topology',
          description: 'End-to-end design, implementation scaffolding, and automated verification suite for autonomous multi-agent pipelines.',
          priceMinorUnits: 450000, // $4,500.00
          deliveryTimeDays: 21,
          revisionsAllowed: 3,
          deliverablesIncluded: [
            'Production Architecture Blueprint & IaC manifests',
            'Failover & Consensus State Machine code',
            'Dedicated 30-Day On-Call Advisory'
          ]
        }
      ],
      isAvailableForHire: true,
      responseTimeHours: 3
    };

    const prof2: ProfessionalProfile = {
      id: 'prof_marcus_brand_design',
      userEmail: 'marcus.vance@studioform.design',
      displayName: 'Marcus Vance',
      professionalTitle: 'Principal Product & Identity Designer',
      primaryCategory: 'DESIGN_CREATIVE',
      bio: 'Award-winning design director crafting digital interfaces, design systems, and visual identity for deep-tech and enterprise software.',
      hourlyRateMinorUnits: 11000, // $110.00/hr
      currency: 'USD',
      rating: 4.92,
      completedProjectsCount: 64,
      verifiedCredentialBadge: 'Verified Enterprise Design Leader',
      skills: ['Figma System Architecture', 'Design Tokens', 'Tailwind', 'Motion Design', 'Micro-Interactions'],
      portfolioLinks: [
        { title: 'Horizon Enterprise Design System', url: 'https://catalyx.io/work/horizon_ds' },
        { title: 'Fintech Mobile Experience Redesign', url: 'https://catalyx.io/work/fintech_app' }
      ],
      packages: [
        {
          id: 'pkg_marcus_deck',
          name: 'Investor / Executive Pitch Presentation Deck',
          description: 'Custom 15-slide high-impact presentation deck engineered in CATALYX Slides Studio.',
          priceMinorUnits: 65000, // $650.00
          deliveryTimeDays: 5,
          revisionsAllowed: 2,
          deliverablesIncluded: [
            '15 Interactive CATALYX Slide Studio Objects',
            'Vector Asset Library & Typography System',
            'Presenter Delivery Script & Speaker Notes'
          ]
        },
        {
          id: 'pkg_marcus_design_system',
          name: 'Comprehensive Component Design System',
          description: 'Full design tokens, accessible UI components, and Figma to Tailwind code tokens.',
          priceMinorUnits: 250000, // $2,500.00
          deliveryTimeDays: 14,
          revisionsAllowed: 3,
          deliverablesIncluded: [
            '45+ Production-Ready UI Components',
            'WCAG AAA Color & Typography Palette',
            'Tailwind CSS Config & Token Manifest'
          ]
        }
      ],
      isAvailableForHire: true,
      responseTimeHours: 5
    };

    const prof3: ProfessionalProfile = {
      id: 'prof_tutor_sarah_cloud',
      userEmail: 'sarah.lin@cloudacademy.net',
      displayName: 'Sarah Lin',
      professionalTitle: 'Certified Cloud Architect & 1-on-1 Technical Mentor',
      primaryCategory: 'TUTORING_EDUCATION',
      bio: '10+ years mentoring senior engineers on AWS/GCP Kubernetes topologies, distributed databases, and high-concurrency architecture.',
      hourlyRateMinorUnits: 9000, // $90.00/hr
      currency: 'USD',
      rating: 4.98,
      completedProjectsCount: 112,
      verifiedCredentialBadge: 'Master Educator Badge',
      skills: ['Kubernetes', 'PostgreSQL', 'Golang', 'GCP Architect', 'System Design Mentorship'],
      portfolioLinks: [
        { title: 'Distributed Systems Course Notes', url: 'https://catalyx.io/work/dist_sys_curriculum' }
      ],
      packages: [
        {
          id: 'pkg_sarah_1on1_intensive',
          name: '1-on-1 System Architecture Intensive (4 Sessions)',
          description: 'Four 75-minute live technical mentoring sessions with custom homework and code reviews.',
          priceMinorUnits: 38000, // $380.00
          deliveryTimeDays: 14,
          revisionsAllowed: 1,
          deliverablesIncluded: [
            '4x 75-Minute Live Private Mentoring Syncs',
            'Custom Architectural Roadmaps',
            'Async Code & Diagram Reviews'
          ]
        }
      ],
      isAvailableForHire: true,
      responseTimeHours: 2
    };

    this.profiles.set(prof1.id, prof1);
    this.profiles.set(prof2.id, prof2);
    this.profiles.set(prof3.id, prof3);
    this.saveToStorage();
  }

  public getAllProfiles(category?: ProfessionalCategory): ProfessionalProfile[] {
    const list = Array.from(this.profiles.values());
    if (!category) return list;
    return list.filter(p => p.primaryCategory === category);
  }

  public getProfileById(id: string): ProfessionalProfile | undefined {
    return this.profiles.get(id);
  }

  public createOrUpdateProfile(profile: ProfessionalProfile): ProfessionalProfile {
    this.profiles.set(profile.id, profile);
    this.saveToStorage();
    return profile;
  }

  public createEngagementContract(params: {
    serviceId: string;
    packageId: string;
    clientEmail: string;
    clientName: string;
    briefRequirements: string;
  }): ServiceEngagementContract {
    const prof = this.profiles.get(params.serviceId);
    if (!prof) throw new Error('Professional profile not found.');

    const pkg = prof.packages.find(p => p.id === params.packageId);
    if (!pkg) throw new Error('Service package tier not found.');

    const id = `contract_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const contract: ServiceEngagementContract = {
      id,
      serviceId: prof.id,
      packageId: pkg.id,
      clientEmail: params.clientEmail,
      clientName: params.clientName,
      professionalEmail: prof.userEmail,
      professionalName: prof.displayName,
      packageTitle: pkg.name,
      priceMinorUnits: pkg.priceMinorUnits,
      currency: prof.currency,
      status: 'FUNDED_ESCROW',
      milestones: [
        {
          id: `m1_${id}`,
          title: 'Initial Discovery & Requirement Scoping',
          description: 'Review specifications and establish alignment.',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
          completed: false
        },
        {
          id: `m2_${id}`,
          title: 'Core Deliverable Draft & Review',
          description: 'Execute primary deliverables and submit for feedback.',
          dueDate: new Date(Date.now() + pkg.deliveryTimeDays * 86400000).toISOString(),
          completed: false
        }
      ],
      briefRequirements: params.briefRequirements,
      createdAt: now,
      updatedAt: now
    };

    this.contracts.set(id, contract);
    this.saveToStorage();
    return contract;
  }

  public getContractsForUser(email: string): ServiceEngagementContract[] {
    const lower = email.toLowerCase();
    return Array.from(this.contracts.values()).filter(
      c => c.clientEmail.toLowerCase() === lower || c.professionalEmail.toLowerCase() === lower
    );
  }

  public updateContractStatus(contractId: string, status: ServiceEngagementContract['status'], notes?: string): ServiceEngagementContract {
    const c = this.contracts.get(contractId);
    if (!c) throw new Error('Contract not found.');
    c.status = status;
    if (notes) c.deliveryNotes = notes;
    c.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return c;
  }
}

export const professionalServicesService = new ProfessionalServicesService();
