/**
 * CATALYX Universal Studio Architecture & Multi-Domain Creation Framework
 * 
 * Implements Phase 8 & Phase 9 Authoritative Studio Infrastructure:
 * 1. Software / Development Studio
 * 2. 3D / Animation Studio
 * 3. Design / UI/UX Studio
 * 4. Writing / Creative Studio
 * 5. Video / Media Studio
 * 6. Presentation Studio
 * 7. Research Studio
 * 8. Data / Analytics Studio
 * 9. Marketing / Campaign Studio
 * 10. Business / Operations Studio
 * 11. Learning / Education Studio
 * 12. Product / Project Studio
 */

import { safeStorage } from '../utils/safeStorage';
import { persistenceSyncService } from './persistenceSyncService';

export type StudioType =
  | 'software'
  | 'animation_3d'
  | 'design_ui'
  | 'writing'
  | 'video_media'
  | 'presentation'
  | 'research'
  | 'data_analytics'
  | 'marketing'
  | 'operations'
  | 'education'
  | 'product';

export interface StudioMember {
  uid: string;
  email: string;
  role: 'owner' | 'lead' | 'contributor' | 'reviewer' | 'viewer';
  joinedAt: string;
}

export interface StudioAsset {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  uri: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
}

export interface StudioTask {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

export interface StudioAIWorker {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status: 'idle' | 'executing' | 'reviewing';
}

export interface StudioVersion {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  snapshotData: any;
}

export interface StudioComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface StudioApproval {
  id: string;
  requestedBy: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  reviewer?: string;
  comments?: string;
  decidedAt?: string;
}

export interface StudioItem {
  id: string;
  type: StudioType;
  workspaceId: string;
  projectId?: string;
  name: string;
  description: string;
  members: StudioMember[];
  permissions: {
    canEdit: string[];
    canApprove: string[];
    canPublish: string[];
  };
  files: string[];
  assets: StudioAsset[];
  tasks: StudioTask[];
  aiWorkers: StudioAIWorker[];
  tools: string[];
  activeDraft: any;
  versions: StudioVersion[];
  comments: StudioComment[];
  review: {
    status: 'draft' | 'in_review' | 'approved' | 'rejected';
    reviewer?: string;
    approvedAt?: string;
  };
  approvals: StudioApproval[];
  exportFormats: string[];
  publishedUrl?: string;
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_STUDIOS_KEY = 'catalyx_universal_studios';

export class StudioService {
  private static instance: StudioService;

  private constructor() {
    this.ensureDefaultStudios();
  }

  public static getInstance(): StudioService {
    if (!StudioService.instance) {
      StudioService.instance = new StudioService();
    }
    return StudioService.instance;
  }

  public getAllStudios(workspaceId?: string): StudioItem[] {
    let list = safeStorage.getArray<StudioItem>(STORAGE_STUDIOS_KEY, []);
    if (list.length === 0) {
      this.ensureDefaultStudios();
      list = safeStorage.getArray<StudioItem>(STORAGE_STUDIOS_KEY, []);
    }
    if (workspaceId) {
      return list.filter(s => s.workspaceId === workspaceId);
    }
    return list;
  }

  public getStudioById(id: string): StudioItem | null {
    const list = this.getAllStudios();
    return list.find(s => s.id === id) || null;
  }

  public getStudiosByType(type: StudioType, workspaceId?: string): StudioItem[] {
    const list = this.getAllStudios(workspaceId);
    return list.filter(s => s.type === type);
  }

  public createStudio(params: {
    type: StudioType;
    workspaceId: string;
    projectId?: string;
    name: string;
    description: string;
    ownerEmail: string;
  }): StudioItem {
    const list = this.getAllStudios();
    const id = `std_${params.type}_${Date.now()}`;
    const tools = this.getDefaultToolsForType(params.type);
    const exportFormats = this.getDefaultExportFormats(params.type);

    const newStudio: StudioItem = {
      id,
      type: params.type,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      name: params.name,
      description: params.description,
      members: [
        {
          uid: 'usr_' + Date.now(),
          email: params.ownerEmail,
          role: 'owner',
          joinedAt: new Date().toISOString()
        }
      ],
      permissions: {
        canEdit: [params.ownerEmail],
        canApprove: [params.ownerEmail],
        canPublish: [params.ownerEmail]
      },
      files: [],
      assets: [],
      tasks: [],
      aiWorkers: [
        {
          id: `wkr_${params.type}_lead`,
          name: `${this.getStudioTypeLabel(params.type)} Autonomous Co-Pilot`,
          role: 'Chief Specialist',
          capabilities: ['Automated Drafting', 'Syntax Checking', 'Verification'],
          status: 'idle'
        }
      ],
      tools,
      activeDraft: {
        content: `Initialized draft for ${params.name}`,
        data: {}
      },
      versions: [
        {
          versionNumber: 1,
          createdAt: new Date().toISOString(),
          createdBy: params.ownerEmail,
          changeSummary: 'Initial studio workspace creation',
          snapshotData: { initial: true }
        }
      ],
      comments: [],
      review: {
        status: 'draft'
      },
      approvals: [],
      exportFormats,
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          actor: params.ownerEmail,
          action: 'STUDIO_CREATED',
          details: `Provisioned ${params.name} under ${params.workspaceId}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newStudio);
    safeStorage.set(STORAGE_STUDIOS_KEY, list);
    persistenceSyncService.queueSync({ studios: list });
    return newStudio;
  }

  public updateDraft(studioId: string, draftData: any, actorEmail: string): boolean {
    const list = this.getAllStudios();
    const idx = list.findIndex(s => s.id === studioId);
    if (idx === -1) return false;

    list[idx].activeDraft = draftData;
    list[idx].updatedAt = new Date().toISOString();
    list[idx].auditHistory.push({
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'DRAFT_UPDATED',
      details: 'Updated active working draft'
    });

    const ok = safeStorage.set(STORAGE_STUDIOS_KEY, list);
    persistenceSyncService.autosaveStudioDraft(studioId, draftData);
    persistenceSyncService.queueSync({ studios: list });
    return ok;
  }

  public createVersionSnapshot(studioId: string, summary: string, actorEmail: string): StudioVersion | null {
    const list = this.getAllStudios();
    const idx = list.findIndex(s => s.id === studioId);
    if (idx === -1) return null;

    const nextVer = (list[idx].versions.length || 0) + 1;
    const version: StudioVersion = {
      versionNumber: nextVer,
      createdAt: new Date().toISOString(),
      createdBy: actorEmail,
      changeSummary: summary,
      snapshotData: JSON.parse(JSON.stringify(list[idx].activeDraft))
    };

    list[idx].versions.push(version);
    list[idx].auditHistory.push({
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'VERSION_COMMITTED',
      details: `Tagged version v${nextVer}: ${summary}`
    });

    safeStorage.set(STORAGE_STUDIOS_KEY, list);
    persistenceSyncService.queueSync({ studios: list });
    return version;
  }

  public submitForReview(studioId: string, reviewerEmail: string, actorEmail: string): boolean {
    const list = this.getAllStudios();
    const idx = list.findIndex(s => s.id === studioId);
    if (idx === -1) return false;

    list[idx].review = {
      status: 'in_review',
      reviewer: reviewerEmail
    };

    list[idx].approvals.push({
      id: `appr_${Date.now()}`,
      requestedBy: actorEmail,
      status: 'in_review',
      reviewer: reviewerEmail
    });

    list[idx].auditHistory.push({
      timestamp: new Date().toISOString(),
      actor: actorEmail,
      action: 'SUBMITTED_FOR_REVIEW',
      details: `Transferred to reviewer ${reviewerEmail}`
    });

    return safeStorage.set(STORAGE_STUDIOS_KEY, list);
  }

  public approveStudioWork(studioId: string, reviewerEmail: string, notes?: string): boolean {
    const list = this.getAllStudios();
    const idx = list.findIndex(s => s.id === studioId);
    if (idx === -1) return false;

    list[idx].review = {
      status: 'approved',
      reviewer: reviewerEmail,
      approvedAt: new Date().toISOString()
    };

    const latestAppr = list[idx].approvals[list[idx].approvals.length - 1];
    if (latestAppr) {
      latestAppr.status = 'approved';
      latestAppr.comments = notes || 'Formal approval granted';
      latestAppr.decidedAt = new Date().toISOString();
    }

    list[idx].auditHistory.push({
      timestamp: new Date().toISOString(),
      actor: reviewerEmail,
      action: 'REVIEW_APPROVED',
      details: notes || 'Work certified and approved for export/production'
    });

    return safeStorage.set(STORAGE_STUDIOS_KEY, list);
  }

  public addAsset(studioId: string, asset: Omit<StudioAsset, 'id' | 'uploadedAt'>): StudioAsset | null {
    const list = this.getAllStudios();
    const idx = list.findIndex(s => s.id === studioId);
    if (idx === -1) return null;

    const newAsset: StudioAsset = {
      ...asset,
      id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      uploadedAt: new Date().toISOString()
    };

    list[idx].assets.push(newAsset);
    list[idx].auditHistory.push({
      timestamp: new Date().toISOString(),
      actor: asset.uploadedBy,
      action: 'ASSET_ATTACHED',
      details: `Added ${asset.name} (${asset.type})`
    });

    safeStorage.set(STORAGE_STUDIOS_KEY, list);
    return newAsset;
  }

  public getDefaultToolsForType(type: StudioType): string[] {
    switch (type) {
      case 'software':
        return ['Code Workspace', 'Git VCS Integration', 'Linter & Static Analysis', 'API Contract Runner', 'Docker Spec'];
      case 'animation_3d':
        return ['Scene Storyboarder', 'Shot List Director', 'Character Sheet Vault', 'Rigging Asset Handoff', 'Render Queue Pipeline'];
      case 'design_ui':
        return ['Design Token Registry', 'Component Wireframer', 'Color Palette Harmony', 'User Flow Journey Map', 'WCAG Audit'];
      case 'writing':
        return ['Chapter Outline Canvas', 'Character Bible', 'Grammar & Tone Engine', 'Citation Footnote Graph', 'Markdown/Docx Export'];
      case 'video_media':
        return ['Multi-Track Timeline', 'Subtitles & Captions', 'Audio Normalizer', 'B-Roll Clip Library', 'Multi-Aspect Preset'];
      case 'presentation':
        return ['Slide Canvas', 'Executive Narrative Builder', 'Speaker Notes Dock', 'Live Presentation Mode', 'Office PPTX Bridge'];
      case 'research':
        return ['Hypothesis Canvas', 'Literature Review Matrix', 'Citation Tracker', 'Evidence Log', 'Methodology Peer Review'];
      case 'data_analytics':
        return ['SQL Query Studio', 'Dynamic Pivot Visualizer', 'Metric Anomaly Watcher', 'Cohort Analysis Grid', 'Office Excel Bridge'];
      case 'marketing':
        return ['Omnichannel Campaign Brief', 'Persona Empathy Map', 'Copy Variant Generator', 'Conversion Funnel Simulator', 'Budget ROI Model'];
      case 'operations':
        return ['SOP Policy Builder', 'Business Continuity Plan', 'RACI Matrix Grid', 'SLA Metric Monitor', 'Disaster Protocol Vault'];
      case 'education':
        return ['Curriculum Syllabus Grid', 'Lesson Plan Deck', 'Interactive Quiz Engine', 'Rubric Evaluation Matrix', 'Certificate Generator'];
      case 'product':
        return ['PRD Spec Writer', 'Feature Prioritization (RICE)', 'Sprint Kanban Board', 'Acceptance Criteria Generator', 'Gantt Roadmap'];
      default:
        return ['Universal Canvas', 'Asset Manager', 'Review Engine'];
    }
  }

  public getDefaultExportFormats(type: StudioType): string[] {
    switch (type) {
      case 'software':
        return ['ZIP Source Bundle', 'JSON Schema', 'OpenAPI 3.1 Spec', 'Docker Compose'];
      case 'animation_3d':
        return ['PDF Storyboard', 'JSON Shot List', 'Universal Scene Description (USD) Metadata', 'Asset Catalog'];
      case 'design_ui':
        return ['SVG Vector Kit', 'CSS Tokens JSON', 'Figma Token Standard', 'PNG Presentation Sheet'];
      case 'writing':
        return ['DOCX Word Document', 'Markdown .md', 'PDF Publication Ready', 'EPUB'];
      case 'video_media':
        return ['MP4 EDL Timeline', 'SRT / VTT Subtitles', 'Audio WAV Master', 'Shot Cut XML'];
      case 'presentation':
        return ['PPTX PowerPoint', 'PDF Slide Deck', 'HTML5 Presentation Bundle'];
      case 'research':
        return ['PDF Academic Paper', 'BibTeX Citations', 'LaTeX Source', 'Research Summary Brief'];
      case 'data_analytics':
        return ['XLSX Excel Workbook', 'CSV Data Tables', 'PDF Executive Metric Report'];
      case 'marketing':
        return ['PDF Campaign Brief', 'Ad Creative Asset Kit', 'CSV Schedule Matrix'];
      case 'operations':
        return ['PDF Standard Operating Procedure', 'DOCX Operations Manual', 'Compliance Audit Checklist'];
      case 'education':
        return ['PDF Course Syllabus', 'SCORM Compatible Package', 'PDF Printable Quizzes'];
      case 'product':
        return ['PDF Product Requirement Document', 'Jira/Linear CSV Export', 'Feature Roadmap Deck'];
      default:
        return ['JSON Object', 'PDF Document', 'ZIP Archive'];
    }
  }

  public getStudioTypeLabel(type: StudioType): string {
    const labels: Record<StudioType, string> = {
      software: 'Software / Development Studio',
      animation_3d: '3D / Animation Studio',
      design_ui: 'Design / UI/UX Studio',
      writing: 'Writing / Creative Studio',
      video_media: 'Video / Media Studio',
      presentation: 'Presentation Studio',
      research: 'Research Studio',
      data_analytics: 'Data / Analytics Studio',
      marketing: 'Marketing / Campaign Studio',
      operations: 'Business / Operations Studio',
      education: 'Learning / Education Studio',
      product: 'Product / Project Studio'
    };
    return labels[type] || type;
  }

  private ensureDefaultStudios(): void {
    const existing = safeStorage.getArray<StudioItem>(STORAGE_STUDIOS_KEY, []);
    if (existing.length === 0) {
      const allTypes: StudioType[] = [
        'software', 'animation_3d', 'design_ui', 'writing',
        'video_media', 'presentation', 'research', 'data_analytics',
        'marketing', 'operations', 'education', 'product'
      ];

      const initial: StudioItem[] = allTypes.map((type, idx) => {
        return {
          id: `std_${type}_hq`,
          type,
          workspaceId: 'ws_1',
          name: `${this.getStudioTypeLabel(type)}`,
          description: `Authoritative production environment for ${this.getStudioTypeLabel(type)}.`,
          members: [
            {
              uid: 'usr_catalyx_lead',
              email: 'anesthonest81@gmail.com',
              role: 'owner',
              joinedAt: new Date().toISOString()
            }
          ],
          permissions: {
            canEdit: ['anesthonest81@gmail.com'],
            canApprove: ['anesthonest81@gmail.com'],
            canPublish: ['anesthonest81@gmail.com']
          },
          files: [],
          assets: [
            {
              id: `ast_init_${idx}`,
              name: `${type}_baseline_asset_pack`,
              type: 'application/octet-stream',
              sizeBytes: 1024 * 1024 * 2,
              uri: `/assets/studios/${type}/manifest.json`,
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'system',
              tags: ['system', 'starter_template']
            }
          ],
          tasks: [
            {
              id: `task_${type}_1`,
              title: `Initialize production milestone in ${this.getStudioTypeLabel(type)}`,
              completed: false,
              assignee: 'anesthonest81@gmail.com',
              priority: 'high'
            }
          ],
          aiWorkers: [
            {
              id: `wkr_${type}_prime`,
              name: `${this.getStudioTypeLabel(type)} Specialist AI`,
              role: 'Autonomous Assistant',
              capabilities: ['Draft Review', 'Standardization', 'Asset Verification'],
              status: 'idle'
            }
          ],
          tools: this.getDefaultToolsForType(type),
          activeDraft: {
            title: `Active Work in ${this.getStudioTypeLabel(type)}`,
            summary: `High-fidelity creation environment with live audit and review workflows.`,
            meta: {}
          },
          versions: [
            {
              versionNumber: 1,
              createdAt: new Date().toISOString(),
              createdBy: 'anesthonest81@gmail.com',
              changeSummary: 'System initialization baseline v1.0',
              snapshotData: { status: 'pristine' }
            }
          ],
          comments: [],
          review: {
            status: 'draft'
          },
          approvals: [],
          exportFormats: this.getDefaultExportFormats(type),
          auditHistory: [
            {
              timestamp: new Date().toISOString(),
              actor: 'system',
              action: 'STUDIO_INITIALIZED',
              details: `Seeded ${this.getStudioTypeLabel(type)} in workspace ws_1`
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      safeStorage.set(STORAGE_STUDIOS_KEY, initial);
    }
  }
}

export const studioService = StudioService.getInstance();
