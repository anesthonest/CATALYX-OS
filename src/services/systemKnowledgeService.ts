/**
 * CATALYX V26 System Knowledge Layer
 * Grounded in the ACTUAL implemented architecture of CATALYX.
 * Provides authoritative metadata, route mappings, workflow definitions,
 * contextual guidance, and adaptive explanations for the System Guide AI.
 */

import { UserPersonaRole } from '../types';

export type UserExpertiseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ADMINISTRATOR';

export interface SystemModuleInfo {
  id: string;
  name: string;
  domain: 'HOME' | 'WORK' | 'INTELLIGENCE' | 'MISSIONS' | 'AUTOMATION' | 'RESOURCES' | 'ECOSYSTEM' | 'COMMERCE' | 'ADMIN';
  tabId: string;
  summary: string;
  description: string;
  keyFeatures: string[];
  primaryActions: {
    label: string;
    description: string;
    permissionRequired: string;
    workflowId?: string;
  }[];
  relatedModules: string[];
  commonErrors?: {
    cause: string;
    solution: string;
  }[];
}

export interface SystemWorkflowInfo {
  id: string;
  title: string;
  targetTab: string;
  description: string;
  stepByStep: string[];
  requiredInputs: string[];
  expectedResult: string;
  minimumRole: UserPersonaRole;
  commonErrors: string[];
}

export interface GuidedActionItem {
  id: string;
  label: string;
  description: string;
  targetTab: string;
  actionType: 'NAVIGATE' | 'TRIGGER_MODAL' | 'ESCALATE_SUPPORT';
  params?: Record<string, unknown>;
}

export interface SystemGuideResponse {
  answer: string;
  userLevel: UserExpertiseLevel;
  groundedModule?: SystemModuleInfo;
  workflow?: SystemWorkflowInfo;
  stepByStep?: string[];
  guidedActions: GuidedActionItem[];
  limitationsNotice?: string;
  escalationAvailable: boolean;
  confidence: number;
  source: 'GEMINI_AI' | 'LOCAL_KNOWLEDGE_ENGINE';
}

class SystemKnowledgeService {
  private readonly modules: SystemModuleInfo[] = [
    {
      id: 'mod_home',
      name: 'Unified Executive Home',
      domain: 'HOME',
      tabId: 'home',
      summary: 'Central command viewport offering real-time operational pulse, role-based telemetry, and priority alerts.',
      description: 'The Unified Executive Home combines real-time operational signals, what-needs-attention priority queues, quick actions launcher, and the front-page System Guide AI.',
      keyFeatures: [
        'Real-Time Sentinel Priority Queue with severity indicators',
        'Dynamic Role Telemetry (Founder, Executive, Manager, Operator, Auditor)',
        'Contextual Ask CATALYX Assistant launcher',
        'One-Click Quick Action launcher',
        'Enterprise Activity Feed with live telemetry'
      ],
      primaryActions: [
        { label: 'Consult System Guide', description: 'Ask questions about system operation', permissionRequired: 'standard:read' },
        { label: 'Switch Persona Role', description: 'Change active operational perspective', permissionRequired: 'standard:read' },
        { label: 'Launch Quick Action', description: 'Navigate directly to key tools', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_tasks', 'mod_projects', 'mod_trust_center']
    },
    {
      id: 'mod_projects',
      name: 'Kanban Project Initiatives',
      domain: 'WORK',
      tabId: 'project-board',
      summary: 'Agile Kanban board for initiative tracking, column transitions, milestones, and task linkage.',
      description: 'Enables teams to organize high-impact projects into visual columns (Planning, Active, In Review, Completed), link deliverables, and track velocity.',
      keyFeatures: [
        'Drag-and-drop Kanban workflow columns',
        'Initiative progress percentage computation',
        'Direct task assignment and tag filtering',
        'Milestone target dates and delivery status'
      ],
      primaryActions: [
        { label: 'Create Initiative', description: 'Add a new project board initiative', permissionRequired: 'standard:write', workflowId: 'wf_create_project' },
        { label: 'Move Column', description: 'Advance project through lifecycle stages', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_tasks', 'mod_goals', 'mod_universal_work']
    },
    {
      id: 'mod_tasks',
      name: 'Operational Tasks Backlog',
      domain: 'WORK',
      tabId: 'tasks',
      summary: 'Personal and team task management with category tags, XP gamification, and status toggles.',
      description: 'Provides responsive backlog controls, sub-task breakdowns, priority coloring, due-date tracking, and compliance level-up XP rewards upon completion.',
      keyFeatures: [
        'Task creation with priority (Low, Medium, High, Urgent)',
        'Category tagging (Work, Personal, System, Research)',
        'Instant completion toggles with XP reward issuance',
        'Search, filter, and sorting controls'
      ],
      primaryActions: [
        { label: 'Add Task', description: 'Log deliverable with due date & priority', permissionRequired: 'standard:write', workflowId: 'wf_create_task' },
        { label: 'Complete Task', description: 'Mark deliverable done and credit XP', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_projects', 'mod_focus', 'mod_worker_center']
    },
    {
      id: 'mod_goals',
      name: 'Strategic Objectives & OKRs',
      domain: 'WORK',
      tabId: 'goals',
      summary: 'Enterprise goal management aligning tactical milestones with strategic quarterly targets.',
      description: 'Allows organizations to set strategic objectives, define measurable key results (OKRs), monitor completion percentages, and associate projects.',
      keyFeatures: [
        'Quarterly and annual objective frameworks',
        'Key result numerical metrics with progress bars',
        'Confidence score and deadline telemetry',
        'Alignment visualization linking tasks to goals'
      ],
      primaryActions: [
        { label: 'Set Objective', description: 'Create new corporate or team OKR', permissionRequired: 'manager:write' }
      ],
      relatedModules: ['mod_projects', 'mod_business_twin']
    },
    {
      id: 'mod_focus',
      name: 'Deep Focus Cabin',
      domain: 'WORK',
      tabId: 'focus',
      summary: 'Distraction-free Pomodoro execution cabin with ambient soundscapes and momentum tracking.',
      description: 'Designed for uninterrupted productivity sprints with customizable timers, break cycles, background audio, and focus session history logs.',
      keyFeatures: [
        'Configurable work/break Pomodoro intervals',
        'Ambient audio generator for deep immersion',
        'Active task pinning during focus blocks',
        'Historical focus streak logging'
      ],
      primaryActions: [
        { label: 'Start Focus Sprint', description: 'Initiate 25-minute Pomodoro timer', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_tasks', 'mod_media']
    },
    {
      id: 'mod_worker_center',
      name: 'Universal Worker Center',
      domain: 'WORK',
      tabId: 'worker-center',
      summary: 'Task distribution hub, worker accountability schedules, and velocity monitoring.',
      description: 'Coordinates work assignments across team members, tracks workload distribution, highlights overdue deliverables, and manages worker capacity.',
      keyFeatures: [
        'Worker availability and load balancing indicators',
        'Assigned deliverables queue per worker',
        'Overdue risk warnings and escalation triggers'
      ],
      primaryActions: [
        { label: 'Assign Work', description: 'Delegate task to team member', permissionRequired: 'manager:write' }
      ],
      relatedModules: ['mod_tasks', 'mod_team']
    },
    {
      id: 'mod_presentations',
      name: 'Presentations Studio',
      domain: 'RESOURCES',
      tabId: 'presentations',
      summary: 'Interactive pitch deck and slide builder with full-screen presenter mode and export.',
      description: 'Enables users to design high-impact pitch decks, keynote presentations, and stakeholder reviews with rich slide layouts, speaker notes, and presentation mode.',
      keyFeatures: [
        'Multi-slide deck authoring with custom themes',
        'Presenter mode with full-screen view and timer',
        'Slide reordering and duplicate functionality',
        'Speaker notes drawer and slide status indicators'
      ],
      primaryActions: [
        { label: 'Create Presentation', description: 'Build a new deck from scratch or template', permissionRequired: 'standard:write', workflowId: 'wf_create_presentation' },
        { label: 'Launch Presenter Mode', description: 'Enter full-screen slideshow', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_media', 'mod_demos', 'mod_files']
    },
    {
      id: 'mod_media',
      name: 'Media Studio & Streams',
      domain: 'RESOURCES',
      tabId: 'media',
      summary: 'Audio/video player, podcast broadcaster, and media asset repository with timestamp chapters.',
      description: 'Hosts recorded webinars, keynote broadcasts, and podcasts with video player controls, interactive timestamp chapters, transcripts, and related resources.',
      keyFeatures: [
        'Embedded video and audio streaming player',
        'Interactive chapter jump points and scrubbing',
        'Media duration, view count, and category tags',
        'Fallback and resilient media link validation'
      ],
      primaryActions: [
        { label: 'Play Media', description: 'Stream keynote or tutorial recording', permissionRequired: 'standard:read' },
        { label: 'Add Media Asset', description: 'Link new video or podcast stream', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_presentations', 'mod_meetings', 'mod_files']
    },
    {
      id: 'mod_meetings',
      name: 'Unified Meetings Hub',
      domain: 'RESOURCES',
      tabId: 'meetings',
      summary: 'Meeting scheduler supporting Google Meet, Zoom, Microsoft Teams, and In-Person with action items.',
      description: 'Centralized meeting management platform where users schedule sessions across providers, set agendas, record participant attendance, and convert meeting action items directly into tasks.',
      keyFeatures: [
        'Multi-provider integration (Google Meet, Zoom, Teams, In-Person)',
        'Meeting status tracking (Scheduled, In Progress, Completed, Cancelled)',
        'Agenda item checklist and attendee list management',
        'One-click action item to Task conversion'
      ],
      primaryActions: [
        { label: 'Schedule Meeting', description: 'Create calendar event with meeting link', permissionRequired: 'standard:write', workflowId: 'wf_schedule_meeting' },
        { label: 'Convert Action Items', description: 'Push meeting decisions into Task backlog', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_tasks', 'mod_partnerships', 'mod_team']
    },
    {
      id: 'mod_demos',
      name: 'Interactive Demos & Prototypes',
      domain: 'RESOURCES',
      tabId: 'demos',
      summary: 'Live interactive sandbox for showcasing feature prototypes, sandbox walk-throughs, and code demos.',
      description: 'Allows product managers and engineers to host runnable demos, interactive mockups, API playgrounds, and guided walkthroughs for stakeholders and clients.',
      keyFeatures: [
        'Live interactive sandbox preview frame',
        'Step-by-step tour controls with feature highlight markers',
        'Tech stack tags and version telemetry',
        'Feedback and approval collection'
      ],
      primaryActions: [
        { label: 'Launch Demo', description: 'Open interactive prototype viewer', permissionRequired: 'standard:read', workflowId: 'wf_create_demo' },
        { label: 'Create Demo Entry', description: 'Register a new prototype preview', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_presentations', 'mod_projects']
    },
    {
      id: 'mod_files',
      name: 'Universal Files Vault',
      domain: 'RESOURCES',
      tabId: 'files',
      summary: 'Secure file storage, document preview, syntax-highlighted code inspection, and download vault.',
      description: 'Enterprise asset repository supporting multi-format document preview (PDF, images, JSON, code, spreadsheets), checksum validation, and tag organization.',
      keyFeatures: [
        'Multi-format file preview with syntax highlighting',
        'File size, mime-type, and upload timestamp inspection',
        'Direct download and secure link sharing',
        'Filter by file extension and search by filename'
      ],
      primaryActions: [
        { label: 'Upload File', description: 'Add documents to the vault via drag & drop or file picker', permissionRequired: 'standard:write', workflowId: 'wf_upload_file' },
        { label: 'Preview File', description: 'Inspect document contents safely in modal', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_universal_work', 'mod_presentations']
    },
    {
      id: 'mod_universal_work',
      name: 'Universal Work Ecosystem',
      domain: 'ECOSYSTEM',
      tabId: 'universal-work',
      summary: 'Unified architecture managing 60+ standardized work object types with state machines and audit trails.',
      description: 'Provides a unified framework for all enterprise work objects—documents, initiatives, deliverables, specs, campaigns—with standardized lifecycle transitions, approvals, and immutable audit logs.',
      keyFeatures: [
        'Over 60 standardized work object classes',
        'Lifecycle state engine (Draft, In Progress, Review, Approved, Published)',
        'Sign-off approval workflows with cryptographic signature records',
        'Unified comment threads and revision history'
      ],
      primaryActions: [
        { label: 'Create Work Object', description: 'Instantiate universal deliverable', permissionRequired: 'standard:write' },
        { label: 'Request Approval', description: 'Submit work object for stakeholder sign-off', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_partnerships', 'mod_projects', 'mod_trust_center']
    },
    {
      id: 'mod_partnerships',
      name: 'Bilateral & Consortium Partnerships',
      domain: 'ECOSYSTEM',
      tabId: 'partnerships',
      summary: 'Enterprise alliance management, shared deliverables, joint meetings, and bilateral agreements.',
      description: 'Manages cross-organizational partnerships, joint venture deliverables, bilateral collaboration agreements, shared milestones, and consortium coordination.',
      keyFeatures: [
        'Partner organization profiles and tiers (Strategic, Tech, Channel, Consortium)',
        'Shared deliverables tracking with multi-party ownership',
        'Bilateral agreement terms and sign-off records',
        'Coordinated partner meetings schedule'
      ],
      primaryActions: [
        { label: 'Add Partner', description: 'Register new partner organization', permissionRequired: 'manager:write', workflowId: 'wf_add_partner' },
        { label: 'Create Shared Deliverable', description: 'Link deliverable to external partner', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_universal_work', 'mod_meetings', 'mod_crm']
    },
    {
      id: 'mod_crm',
      name: 'Customer Relationships (CRM)',
      domain: 'COMMERCE',
      tabId: 'crm',
      summary: 'Client pipeline, contact records, interaction history, and lead deal stages.',
      description: 'Tracks customer accounts, contact details, deal sizes, sales stages (Lead, Qualified, Proposal, Won), and linked communication notes.',
      keyFeatures: [
        'Customer directory with contact information',
        'Deal pipeline stages and projected revenues',
        'Interaction logs and meeting history linkage'
      ],
      primaryActions: [
        { label: 'Add Customer', description: 'Register client profile in CRM', permissionRequired: 'standard:write', workflowId: 'wf_add_customer' }
      ],
      relatedModules: ['mod_commerce', 'mod_partnerships']
    },
    {
      id: 'mod_commerce',
      name: 'Commerce & Orders Management',
      domain: 'COMMERCE',
      tabId: 'commerce',
      summary: 'Product catalog, customer purchase orders, fulfillment tracking, and checkout pipeline.',
      description: 'Manages enterprise SKU catalog, inventory allocations, customer order status (Pending, Paid, Shipped, Delivered), and invoice generation.',
      keyFeatures: [
        'SKU inventory catalog with pricing and stock levels',
        'Order placement, payment verification, and fulfillment stages',
        'Invoice download and order receipt auditing'
      ],
      primaryActions: [
        { label: 'Create Product', description: 'Add new item to catalog', permissionRequired: 'manager:write', workflowId: 'wf_create_product' },
        { label: 'Process Order', description: 'Update order lifecycle state', permissionRequired: 'operator:write' }
      ],
      relatedModules: ['mod_billing', 'mod_crm']
    },
    {
      id: 'mod_billing',
      name: 'Pesapal V3 Financial Gateway & Ledger',
      domain: 'COMMERCE',
      tabId: 'pesapal-billing',
      summary: 'Double-entry financial ledger and Pesapal v3 live payment processor integration.',
      description: 'Handles transaction settlements, Pesapal consumer key API integration, integer minor currency calculations, test sandbox mode, and financial auditing.',
      keyFeatures: [
        'Double-entry bookkeeping ledger engine',
        'Pesapal v3 API client with signed request handling',
        'Transaction history with status verification',
        'Offline sandbox for testing payment flows safely'
      ],
      primaryActions: [
        { label: 'Initiate Settlement', description: 'Submit transaction to payment gateway', permissionRequired: 'financial:write' },
        { label: 'Configure Credentials', description: 'Save Pesapal consumer keys in settings', permissionRequired: 'admin:write' }
      ],
      relatedModules: ['mod_commerce', 'mod_trust_center']
    },
    {
      id: 'mod_coach',
      name: 'Multi-Agent AI Intelligence Coach',
      domain: 'INTELLIGENCE',
      tabId: 'coach',
      summary: 'Specialized autonomous AI agents for strategy, research, operations, execution, and analytics.',
      description: 'Provides access to 9 specialized AI agents (Strategic, Research, Operations, Execution, Analytics, Knowledge, Innovation, Organization, Financial) powered by Gemini.',
      keyFeatures: [
        '9 specialized agent personas with distinct reasoning instructions',
        'Multi-turn conversation history with context persistence',
        'Multi-agent consensus memo generation',
        'Resilient fallback handling when AI provider is offline'
      ],
      primaryActions: [
        { label: 'Consult Agent', description: 'Send prompt to selected AI specialist', permissionRequired: 'standard:read' },
        { label: 'Request Consensus', description: 'Get joint recommendations from multiple agents', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_home', 'mod_reality']
    },
    {
      id: 'mod_reality',
      name: 'L2 Action Firewall & Reality Engine',
      domain: 'INTELLIGENCE',
      tabId: 'reality',
      summary: 'Human-in-the-loop action previews, blast radius limiter, and epistemic intelligence verification.',
      description: 'Protects system state by intercepting state-mutating requests, generating visual previews of planned changes, enforcing blast radius limits, and requiring explicit human authorization.',
      keyFeatures: [
        '8-stage action preview pipeline before any state mutation',
        'Blast radius ceiling preventing catastrophic runaway modifications',
        'Epistemic reality classification (REAL, SIMULATION, SPECULATION, CONFIG_REQUIRED)',
        'Cryptographic audit trail linking actions to user approvals'
      ],
      primaryActions: [
        { label: 'Review Action Preview', description: 'Inspect planned modifications before execution', permissionRequired: 'standard:write' },
        { label: 'Authorize Execution', description: 'Provide cryptographic sign-off', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_trust_center', 'mod_coach']
    },
    {
      id: 'mod_trust_center',
      name: 'Enterprise Trust Center & Audit Log',
      domain: 'ADMIN',
      tabId: 'trust-center',
      summary: 'Cryptographic audit ledger, tenant isolation monitor, and RBAC governance dashboard.',
      description: 'Provides immutable audit records of all system mutations, telemetry logs, tenant workspace isolation verification, and security compliance telemetry.',
      keyFeatures: [
        'Tamper-evident audit log with correlation IDs',
        'Tenant boundary and workspace isolation status',
        'RBAC role permissions inspector and active policy enforcement',
        'Diagnostic dossier export for compliance reviews'
      ],
      primaryActions: [
        { label: 'Inspect Audit Log', description: 'View immutable system event stream', permissionRequired: 'auditor:read' },
        { label: 'Export Audit Dossier', description: 'Download compliance report', permissionRequired: 'admin:read' }
      ],
      relatedModules: ['mod_reality', 'mod_admin_settings']
    },
    {
      id: 'mod_work_to_market',
      name: 'Work-to-Market Publishing Bridge',
      domain: 'COMMERCE',
      tabId: 'workspaces',
      summary: 'Transforms workspace deliverables into verified commercial marketplace products.',
      description: 'Provides a secure pipeline connecting workspace creation to marketplace distribution. Strips internal drafts and confidential conversation history, attaches licensing terms, sets pricing in integer minor units, and publishes directly to the marketplace.',
      keyFeatures: [
        'Direct workspace-to-marketplace publishing pipeline',
        'Automated stripping of confidential internal comments and drafts',
        'Flexible licensing models (Commercial, Organizational, Open Access)',
        'Linked work-object traceability and provenance verification'
      ],
      primaryActions: [
        { label: 'Publish to Market', description: 'Convert finished work object to marketplace listing', permissionRequired: 'standard:write', workflowId: 'wf_publish_to_market' },
        { label: 'Evaluate Quality', description: 'Run automated quality audit prior to publishing', permissionRequired: 'standard:read', workflowId: 'wf_quality_review' }
      ],
      relatedModules: ['mod_universal_work', 'mod_marketplace_hub', 'mod_quality_assistant']
    },
    {
      id: 'mod_marketplace_hub',
      name: 'CATALYX Digital Work & Media Marketplace',
      domain: 'COMMERCE',
      tabId: 'marketplace-api',
      summary: 'Commercial discovery, licensing, and distribution of legitimate digital work and media.',
      description: 'Supports the discovery, preview, licensing, subscription, and purchase of verified digital work: executive presentations, video demonstrations, software solutions, research papers, datasets, audio broadcasts, and design systems.',
      keyFeatures: [
        'Curated catalog across 16 professional digital work categories',
        'Full asset preview including slide count, chapters, transcripts, and licensing terms',
        'Verified buyer badges and cryptographic receipt generation',
        'Immutable double-entry transaction ledger with automated 15% platform split'
      ],
      primaryActions: [
        { label: 'Browse Catalog', description: 'Explore verified professional work products', permissionRequired: 'standard:read' },
        { label: 'Acquire License', description: 'Purchase or subscribe to commercial work', permissionRequired: 'standard:write', workflowId: 'wf_marketplace_purchase' },
        { label: 'File Dispute', description: 'Submit formal audit report or takedown request', permissionRequired: 'standard:write' }
      ],
      relatedModules: ['mod_work_to_market', 'mod_commerce_ledger', 'mod_billing']
    },
    {
      id: 'mod_quality_assistant',
      name: 'Grounded Work Quality Assistant',
      domain: 'INTELLIGENCE',
      tabId: 'workspaces',
      summary: 'Objective quality review engine for presentations, demos, videos, and listings.',
      description: 'Evaluates work assets across six core dimensions: clarity, structure, audience suitability, consistency, commercial viability, and missing information risk. Provides concrete, actionable improvements without modifying user work.',
      keyFeatures: [
        'Multi-dimensional scoring matrix (0-100) with readiness ratings',
        'Actionable prioritized improvement suggestions (High, Medium, Low)',
        'Marketplace metadata optimization (tags, category, pricing model, descriptions)',
        'Grounded local heuristic fallback with resilient Gemini AI integration'
      ],
      primaryActions: [
        { label: 'Run Quality Review', description: 'Analyze deck, demo, or document completeness', permissionRequired: 'standard:read', workflowId: 'wf_quality_review' }
      ],
      relatedModules: ['mod_work_to_market', 'mod_presentations', 'mod_demos']
    },
    {
      id: 'mod_commerce_ledger',
      name: 'Immutable Commerce Ledger & Creator Earnings',
      domain: 'COMMERCE',
      tabId: 'marketplace-api',
      summary: 'Idempotent, audit-ready commercial transaction ledger and creator payout dashboard.',
      description: 'Maintains an immutable record of all marketplace transactions with SHA-256 cryptographic signatures, idempotency guarantees, transparent 15% platform commission vs 85% creator payout calculation, and Pesapal V3 integration.',
      keyFeatures: [
        'Idempotent payment deduplication to prevent double-charging',
        'Tamper-resistant cryptographic signature per transaction',
        'Creator revenue dashboard showing gross GMV, platform fees, and net payouts',
        'Auditor-grade transaction export and reconciliation status'
      ],
      primaryActions: [
        { label: 'View Ledger', description: 'Inspect settled commercial transactions', permissionRequired: 'standard:read' },
        { label: 'Check Creator Payouts', description: 'View net revenue and pending settlements', permissionRequired: 'standard:read' }
      ],
      relatedModules: ['mod_marketplace_hub', 'mod_billing', 'mod_trust_center']
    }
  ];

  private readonly workflows: SystemWorkflowInfo[] = [
    {
      id: 'wf_create_project',
      title: 'Create a Project Initiative',
      targetTab: 'project-board',
      description: 'How to set up a new project initiative on the Kanban board.',
      stepByStep: [
        'Open the Kanban Project Initiatives board from the navigation or home page.',
        'Click the "+ New Initiative" or "Start New Initiative" button at the top of the board.',
        'Enter a descriptive Initiative Title, Priority level, and Target Deadline.',
        'Select the initial Kanban stage (typically "Planning" or "Active").',
        'Click "Create Initiative" to persist the project. You can now add tasks and milestones.'
      ],
      requiredInputs: ['Initiative Title', 'Priority', 'Target Deadline'],
      expectedResult: 'A new card appears in the selected column with 0% initial progress ready for tasks.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Empty title submitted', 'Target date set in the past']
    },
    {
      id: 'wf_create_task',
      title: 'Log or Create an Operational Task',
      targetTab: 'tasks',
      description: 'How to add a deliverable to your personal or team backlog.',
      stepByStep: [
        'Navigate to the Tasks tab.',
        'Use the quick input field at the top to type your task title.',
        'Select the Priority (Low, Medium, High, Urgent) and Category (Work, Personal, System, Research).',
        'Press Enter or click "Add Task" to save the deliverable.',
        'When completed, click the status checkbox to mark done and earn +5 XP!'
      ],
      requiredInputs: ['Task title'],
      expectedResult: 'Task is added to the active backlog list with status pending.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Blank task name']
    },
    {
      id: 'wf_create_presentation',
      title: 'Build a Presentation Deck',
      targetTab: 'presentations',
      description: 'How to create a multi-slide presentation deck.',
      stepByStep: [
        'Navigate to Resources > Presentations.',
        'Click "+ New Presentation" to open the deck authoring canvas.',
        'Enter the Presentation Title, subtitle, and select an aesthetic theme.',
        'Add slides using the "+ Add Slide" control. Enter slide headline, body text, and key bullets.',
        'Add speaker notes in the notes drawer if desired.',
        'Click "Present" in the top bar to launch full-screen presenter mode.'
      ],
      requiredInputs: ['Deck Title', 'At least 1 Slide with title'],
      expectedResult: 'A complete slide deck saved in the Presentations Studio with presenter mode enabled.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Saving an empty presentation without slides']
    },
    {
      id: 'wf_schedule_meeting',
      title: 'Schedule a Unified Meeting',
      targetTab: 'meetings',
      description: 'How to schedule a meeting with agenda items and action items.',
      stepByStep: [
        'Navigate to Resources > Meetings.',
        'Click "Schedule Meeting" at the top of the hub.',
        'Fill in the Meeting Title, Provider (Google Meet, Zoom, Teams, or In-Person), and meeting link.',
        'Set the Date, Start Time, and End Time.',
        'Add Agenda Items and invite attendees by email.',
        'Click "Schedule" to confirm. After the meeting, convert recorded Action Items to Tasks with one click.'
      ],
      requiredInputs: ['Meeting Title', 'Date & Time', 'Provider'],
      expectedResult: 'Meeting card appears in the Scheduled queue with join button and agenda tracker.',
      minimumRole: 'OPERATOR',
      commonErrors: ['End time earlier than start time', 'Missing meeting title']
    },
    {
      id: 'wf_add_partner',
      title: 'Register a Partner Organization',
      targetTab: 'partnerships',
      description: 'How to establish a cross-organizational collaboration partnership.',
      stepByStep: [
        'Navigate to Ecosystem > Partnerships.',
        'Click "+ Add Partner" in the top toolbar.',
        'Enter the Organization Name, Partner Type (Strategic, Tech, Channel, Consortium), and primary contact email.',
        'Add the collaboration scope and bilateral agreement terms.',
        'Click "Register Partner" to create the profile. You can now assign shared deliverables and joint meetings.'
      ],
      requiredInputs: ['Organization Name', 'Partner Type', 'Contact Email'],
      expectedResult: 'Partner profile is established with shared deliverables board and alliance metrics.',
      minimumRole: 'MANAGER',
      commonErrors: ['Invalid email format', 'Duplicate partner organization name']
    },
    {
      id: 'wf_upload_file',
      title: 'Upload and Inspect Documents in the Files Vault',
      targetTab: 'files',
      description: 'How to store and preview documents in the enterprise vault.',
      stepByStep: [
        'Navigate to Resources > Files.',
        'Drag and drop files onto the upload dropzone or click "Upload File" to browse your local device.',
        'The vault automatically inspects the file size, computes checksums, and tags the mime type.',
        'Click on any file card to open the preview modal with syntax highlighting for code or preview for PDFs and images.',
        'Use the "Download" button to retrieve the file at any time.'
      ],
      requiredInputs: ['Valid file item'],
      expectedResult: 'File stored in the vault with real-time preview and metadata inspection.',
      minimumRole: 'OPERATOR',
      commonErrors: ['File size exceeding local preview buffer (over 50MB)']
    },
    {
      id: 'wf_add_customer',
      title: 'Add a Client to CRM',
      targetTab: 'crm',
      description: 'How to register a customer account in the CRM pipeline.',
      stepByStep: [
        'Navigate to Commerce > CRM Customers.',
        'Click "+ Add Customer" or use the top action button.',
        'Fill in the Client Name, Company, Email, Phone, and estimated Deal Value.',
        'Set the initial deal stage (Lead, Qualified, Proposal, Won).',
        'Click "Save Customer" to record the account in the pipeline.'
      ],
      requiredInputs: ['Client Name', 'Company Name', 'Email'],
      expectedResult: 'Customer profile appears in the CRM directory and deal pipeline.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Missing client contact email']
    },
    {
      id: 'wf_create_product',
      title: 'Create a Product SKU in Catalog',
      targetTab: 'commerce',
      description: 'How to add a product or service SKU to the catalog.',
      stepByStep: [
        'Navigate to Commerce > Products & Orders.',
        'Click "+ New Product" in the catalog toolbar.',
        'Enter the Product Name, SKU code, Unit Price (in standard currency), and Inventory Quantity.',
        'Add a short description and category tag.',
        'Click "Save Product" to make it available for customer order processing.'
      ],
      requiredInputs: ['Product Name', 'SKU', 'Unit Price'],
      expectedResult: 'New product appears in the active catalog with stock tracking enabled.',
      minimumRole: 'MANAGER',
      commonErrors: ['Negative price entered', 'Duplicate SKU code']
    },
    {
      id: 'wf_create_demo',
      title: 'Create an Interactive Prototype Demo',
      targetTab: 'demos',
      description: 'How to showcase an interactive prototype sandbox.',
      stepByStep: [
        'Navigate to Resources > Demos & Prototypes.',
        'Click "+ New Demo" in the top bar.',
        'Enter the Demo Title, Description, and Sandbox Preview URL or HTML embed.',
        'Define key walkthrough steps highlighting unique features.',
        'Click "Save Demo" to publish to the interactive showroom.'
      ],
      requiredInputs: ['Demo Title', 'Sandbox URL or code'],
      expectedResult: 'Interactive sandbox card ready for live stakeholder testing.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Invalid URL format']
    },
    {
      id: 'wf_publish_to_market',
      title: 'Publish Work from Workspace to Marketplace',
      targetTab: 'workspaces',
      description: 'How to transition completed work from a workspace into a published marketplace product.',
      stepByStep: [
        'Open Workspaces from the navigation menu and select your active project workspace.',
        'Locate the deliverable or work object you wish to monetize (Presentation, Demo, Software, Whitepaper, or Dataset).',
        'Click the "Publish to Market" button in the item action menu.',
        'Configure publication metadata: Title, Description, Category, Tags, and Software/Demo stage.',
        'Choose a Pricing Model (One-Time, Subscription, Usage-Based, Licensing, or Free) and specify price in minor units.',
        'Define Licensing Terms (e.g., Commercial Non-Exclusive or Enterprise Organizational).',
        'Run the "Work Quality Assistant" audit to verify clarity, completeness, and audience suitability.',
        'Click "Publish Deliverable". Internal workspace notes are safely stripped, and the product becomes active on the CATALYX Marketplace.'
      ],
      requiredInputs: ['Deliverable / Work Object', 'Title', 'Pricing Model & Amount', 'Licensing Terms'],
      expectedResult: 'Work product is cataloged on the CATALYX Marketplace with public preview and checkout enabled.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Publishing work without defined licensing terms', 'Missing category selection']
    },
    {
      id: 'wf_quality_review',
      title: 'Run Work Quality Assistant Evaluation',
      targetTab: 'workspaces',
      description: 'How to evaluate deck, demo, or document completeness before executive delivery or marketplace publishing.',
      stepByStep: [
        'Open the target deliverable (Presentation deck, Interactive Demo, or Document).',
        'Click "Run Quality Assistant" in the toolbar or publishing modal.',
        'Review the 6-dimension evaluation breakdown: Clarity, Structure, Audience Suitability, Consistency, Commercial Viability, and Missing Information Risk.',
        'Inspect the prioritized improvement findings (High, Medium, Low) and suggested metadata tags.',
        'Apply recommended refinements to your slides or description to maximize buyer confidence and stakeholder clarity.'
      ],
      requiredInputs: ['Work item title and description or slide contents'],
      expectedResult: 'Detailed quality score (0-100), readiness rating, and concrete suggestions report generated.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Evaluating an empty draft with no headline or description']
    },
    {
      id: 'wf_marketplace_purchase',
      title: 'Discover and License Digital Work on Marketplace',
      targetTab: 'marketplace-api',
      description: 'How to discover, inspect, and purchase commercial work products on the CATALYX Marketplace.',
      stepByStep: [
        'Navigate to Commerce > Marketplace & Digital Work.',
        'Filter catalog by category (Presentations, Video Demos, Software Solutions, Whitepapers, Datasets).',
        'Click an asset card to open the rich detail preview: review slide count, runtime chapters, transcript, creator verification badge, and licensing terms.',
        'Click "Acquire License" or "Subscribe".',
        'Select payment method (Pesapal V3 Gateway, Corporate Invoice, or CATALYX Balance).',
        'Confirm purchase. An immutable receipt with SHA-256 signature is recorded in the ledger, and immediate download or workspace import is unlocked.'
      ],
      requiredInputs: ['Target marketplace asset', 'Buyer billing email'],
      expectedResult: 'Instant license issuance, tamper-evident cryptographic receipt, and unlock of deliverable assets.',
      minimumRole: 'OPERATOR',
      commonErrors: ['Declining payment confirmation']
    }
  ];

  /**
   * Get all registered system modules
   */
  public getModules(): SystemModuleInfo[] {
    return this.modules;
  }

  /**
   * Get module by tab id
   */
  public getModuleByTab(tabId: string): SystemModuleInfo | undefined {
    return this.modules.find(m => m.tabId === tabId || m.id === tabId);
  }

  /**
   * Get all registered workflows
   */
  public getWorkflows(): SystemWorkflowInfo[] {
    return this.workflows;
  }

  /**
   * Get workflow by id
   */
  public getWorkflowById(workflowId: string): SystemWorkflowInfo | undefined {
    return this.workflows.find(w => w.id === workflowId);
  }

  /**
   * Authoritative question responder using grounded local knowledge.
   * Executed client-side or as offline/fallback engine for Gemini.
   */
  public answerSystemQuery(
    query: string,
    activeTab: string = 'home',
    activeRole: UserPersonaRole = 'EXECUTIVE',
    userLevel: UserExpertiseLevel = 'INTERMEDIATE'
  ): SystemGuideResponse {
    const q = query.trim().toLowerCase();

    // 1. Non-existent feature detection (Crucial Anti-Hallucination Guardrail)
    const nonExistentPatterns = [
      { trigger: 'crypto', alternative: 'Pesapal V3 financial gateway for fiat currency settlement', tab: 'pesapal-billing' },
      { trigger: 'bitcoin', alternative: 'Double-entry enterprise ledger for verifiable balances', tab: 'pesapal-billing' },
      { trigger: 'nft', alternative: 'Universal Work Objects for authentic digital deliverable tracking', tab: 'universal-work' },
      { trigger: 'game', alternative: 'Deep Focus Pomodoro sprints with XP rewards and gamification', tab: 'focus' },
      { trigger: 'music player', alternative: 'Media Studio for audio broadcasts and podcasts', tab: 'media' },
      { trigger: 'drone', alternative: 'Planetary Mission Command telemetry', tab: 'civilization' },
      { trigger: 'fax', alternative: 'Universal Files Vault with instant digital PDF preview', tab: 'files' }
    ];

    for (const item of nonExistentPatterns) {
      if (q.includes(item.trigger)) {
        return {
          answer: `**Capability Notice**: Direct "${item.trigger}" functionality is not a feature of CATALYX V26. CATALYX is strictly an enterprise work execution platform, not a recreational or consumer service.\n\nHowever, you can use **${item.alternative}** to achieve your professional objective.`,
          userLevel,
          limitationsNotice: `Feature "${item.trigger}" does not exist in CATALYX. Guided to: ${item.alternative}.`,
          guidedActions: [
            {
              id: 'act_nav_alt',
              label: `Open ${item.alternative.split(' ')[0]}`,
              description: `Navigate to closest real capability`,
              targetTab: item.tab,
              actionType: 'NAVIGATE'
            }
          ],
          escalationAvailable: true,
          confidence: 96,
          source: 'LOCAL_KNOWLEDGE_ENGINE'
        };
      }
    }

    // 2. Core Question: What is CATALYX?
    if (q === 'what isFix' || q.includes('what isFix') || q.includes('what is catalyx') || q.includes('about catalyx') || q.includes('overview of catalyx') || q.includes('how catalyx works')) {
      return {
        answer: this.formatOverviewAnswer(userLevel),
        userLevel,
        guidedActions: [
          { id: 'act_explore_home', label: 'Explore Executive Dashboard', description: 'View current operational pulse', targetTab: 'home', actionType: 'NAVIGATE' },
          { id: 'act_explore_projects', label: 'View Project Board', description: 'Inspect active initiatives', targetTab: 'project-board', actionType: 'NAVIGATE' },
          { id: 'act_explore_presentations', label: 'Open Presentations Hub', description: 'View slides and keynote decks', targetTab: 'presentations', actionType: 'NAVIGATE' }
        ],
        confidence: 99,
        source: 'LOCAL_KNOWLEDGE_ENGINE',
        escalationAvailable: false
      };
    }

    // 3. Workflow matching
    if (q.includes('create project') || q.includes('new project') || q.includes('start project') || q.includes('add project')) {
      const wf = this.getWorkflowById('wf_create_project')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('create task') || q.includes('add task') || q.includes('new task') || q.includes('log task')) {
      const wf = this.getWorkflowById('wf_create_task')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('create presentation') || q.includes('new presentation') || q.includes('slide') || q.includes('pitch deck')) {
      const wf = this.getWorkflowById('wf_create_presentation')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('schedule meeting') || q.includes('start meeting') || q.includes('new meeting') || q.includes('zoom') || q.includes('google meet')) {
      const wf = this.getWorkflowById('wf_schedule_meeting')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('partner') || q.includes('collaborate') || q.includes('alliance') || q.includes('consortium')) {
      const wf = this.getWorkflowById('wf_add_partner')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('file') || q.includes('upload') || q.includes('document') || q.includes('vault')) {
      const wf = this.getWorkflowById('wf_upload_file')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('customer') || q.includes('client') || q.includes('crm') || q.includes('lead')) {
      const wf = this.getWorkflowById('wf_add_customer')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('product') || q.includes('sku') || q.includes('inventory') || q.includes('item')) {
      const wf = this.getWorkflowById('wf_create_product')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('publish') || q.includes('monetize') || q.includes('sell work') || q.includes('work to market') || q.includes('publish work')) {
      const wf = this.getWorkflowById('wf_publish_to_market')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('quality') || q.includes('review') || q.includes('audit deck') || q.includes('improve presentation') || q.includes('work assistant')) {
      const wf = this.getWorkflowById('wf_quality_review')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('marketplace') || q.includes('buy software') || q.includes('license') || q.includes('purchase work') || q.includes('catalog')) {
      const wf = this.getWorkflowById('wf_marketplace_purchase')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }
    if (q.includes('demo') || q.includes('prototype') || q.includes('sandbox') || q.includes('showcase')) {
      const wf = this.getWorkflowById('wf_create_demo')!;
      return this.formatWorkflowResponse(wf, userLevel);
    }

    // 4. Permission / Access questions
    if (q.includes('permission') || q.includes('access') || q.includes("can't access") || q.includes('forbidden') || q.includes('clearance')) {
      return {
        answer: `### Role-Based Access Control (RBAC) in CATALYX\n\nCATALYX enforces strict enterprise clearance tiers. Your active role is currently **${activeRole}**.\n\n` +
          `**Clearance Hierarchy**:\n` +
          `- **FOUNDER**: Full administrative autonomy across all workspaces, policies, and API keys.\n` +
          `- **EXECUTIVE**: Strategic oversight, OKRs, quarterly reports, and budget allocations.\n` +
          `- **MANAGER**: Team coordination, project creation, partner onboarding, and task assignment.\n` +
          `- **OPERATOR**: Task execution, backlog updates, slide authoring, and file uploads.\n` +
          `- **AUDITOR**: Read-only immutable access to Trust Center logs, firewall reports, and financial ledgers.\n\n` +
          `*To change your perspective for testing or administration, click your role pill in the top header.*`,
        userLevel,
        guidedActions: [
          { id: 'act_trust_center', label: 'Open Trust Center', description: 'Inspect RBAC policies and audit trail', targetTab: 'trust-center', actionType: 'NAVIGATE' }
        ],
        confidence: 95,
        source: 'LOCAL_KNOWLEDGE_ENGINE',
        escalationAvailable: true
      };
    }

    // 5. Contextual Query: What can I do here? / What does this dashboard mean?
    const currentMod = this.getModuleByTab(activeTab) || this.modules[0];
    if (q.includes('where am i') || q.includes('what can i do here') || q.includes('this dashboard') || q.includes('what is this page') || q.includes('what should i do next')) {
      return {
        answer: `### Current Context: ${currentMod.name}\n\n` +
          `${currentMod.description}\n\n` +
          `**Key Capabilities on this Screen**:\n` +
          currentMod.keyFeatures.map(f => `- ${f}`).join('\n') +
          `\n\n**Primary Actions Available**:\n` +
          currentMod.primaryActions.map(a => `- **${a.label}**: ${a.description} *(Requires: \`${a.permissionRequired}\`)*`).join('\n'),
        userLevel,
        groundedModule: currentMod,
        guidedActions: currentMod.primaryActions.map((a, idx) => ({
          id: `act_${currentMod.id}_${idx}`,
          label: a.label,
          description: a.description,
          targetTab: currentMod.tabId,
          actionType: 'NAVIGATE'
        })),
        confidence: 95,
        source: 'LOCAL_KNOWLEDGE_ENGINE',
        escalationAvailable: false
      };
    }

    // 6. Generic intelligent fallback grounded in module directory
    return {
      answer: `### CATALYX System Knowledge Guide\n\n` +
        `I analyzed your query: **"${query}"** in the context of **${currentMod.name}** for role **${activeRole}**.\n\n` +
        `CATALYX provides 9 integrated execution domains:\n` +
        `- **Work**: Kanban Projects, Task Backlog, Strategic Goals, Deep Focus\n` +
        `- **Resources**: Presentations Studio, Media Streams, Unified Meetings, Demos, Files Vault\n` +
        `- **Ecosystem**: Universal Work Objects (60+ types) and Bilateral Partnerships\n` +
        `- **Commerce**: Products, Orders, CRM, and Pesapal V3 Financial Ledger\n` +
        `- **Intelligence**: 9 Specialized AI Coaches and L2 Action Firewall\n` +
        `- **Governance**: Enterprise Trust Center and Cryptographic Audit Logs\n\n` +
        `You can ask me specific questions like *"How do I create a project?"*, *"How do I schedule a meeting?"*, or *"How do I collaborate with a partner?"*.`,
      userLevel,
      guidedActions: [
        { id: 'act_nav_projects', label: 'Go to Projects', description: 'Kanban board', targetTab: 'project-board', actionType: 'NAVIGATE' },
        { id: 'act_nav_presentations', label: 'Go to Presentations', description: 'Slide builder', targetTab: 'presentations', actionType: 'NAVIGATE' },
        { id: 'act_nav_files', label: 'Go to Files Vault', description: 'Documents vault', targetTab: 'files', actionType: 'NAVIGATE' }
      ],
      confidence: 88,
      source: 'LOCAL_KNOWLEDGE_ENGINE',
      escalationAvailable: true
    };
  }

  private formatOverviewAnswer(level: UserExpertiseLevel): string {
    switch (level) {
      case 'BEGINNER':
        return `### Welcome to CATALYX!\n\n` +
          `CATALYX is your complete digital workspace for getting things done. Instead of juggling dozens of disconnected apps, CATALYX brings everything together into one unified system:\n\n` +
          `1. **Projects & Tasks**: Organize your daily work, check off deliverables, and gain XP.\n` +
          `2. **Presentations & Media**: Build slide decks and watch training videos right here.\n` +
          `3. **Meetings**: Schedule Google Meet, Zoom, or Teams calls with agenda checklists.\n` +
          `4. **Files Vault**: Keep all your PDFs, code, and documents safe in one place.\n` +
          `5. **Partnerships & Commerce**: Team up with other organizations and track customer orders.\n\n` +
          `*To begin, try clicking "Start New Initiative" on your home page or ask me any question!*`;

      case 'ADVANCED':
      case 'ADMINISTRATOR':
        return `### CATALYX V26 Architecture Overview\n\n` +
          `CATALYX is a hardened Autonomous Universal Enterprise Operating System built with zero-mock data integrity, deterministic state machines, and cryptographic accountability.\n\n` +
          `**Core Subsystems**:\n` +
          `- **Execution Fabric**: Unified Work Object architecture supporting 60+ typed entities with immutable transition histories.\n` +
          `- **L2 Action Firewall**: 8-stage pre-flight inspection engine enforcing human-in-the-loop authorization on all state-mutating actions.\n` +
          `- **Multi-Agent Intelligence**: 9 specialized Gemini-powered agent personas with autonomous consensus memo generation.\n` +
          `- **Commerce Engine**: Pesapal v3 dual-entry financial ledger operating with integer minor-currency precision and cryptographic verification.\n` +
          `- **Fault Containment**: Global Error Boundary with correlation IDs, isolated storage wrappers, and self-healing local databases.`;

      case 'INTERMEDIATE':
      default:
        return `### What is CATALYX?\n\n` +
          `CATALYX is an **Autonomous Universal Enterprise Operating System** designed to eliminate operational friction and coordinate strategic execution across your entire organization.\n\n` +
          `**What you can do in CATALYX**:\n` +
          `- **Plan & Execute**: Track agile Kanban boards, prioritize task backlogs, and measure quarterly OKRs.\n` +
          `- **Produce & Deliver**: Create presentations, schedule unified meetings across Zoom/Google Meet, and store documents in the Files Vault.\n` +
          `- **Scale & Partner**: Coordinate cross-organizational partnerships, manage customer pipelines in CRM, and settle orders via Pesapal v3.\n` +
          `- **Intelligent Coaching**: Consult 9 specialized AI agents for strategy, research, operations, and analytics.`;
    }
  }

  private formatWorkflowResponse(wf: SystemWorkflowInfo, level: UserExpertiseLevel): SystemGuideResponse {
    let guideText = `### Workflow: ${wf.title}\n\n${wf.description}\n\n`;

    if (level === 'BEGINNER') {
      guideText += `**Step-by-Step Instructions**:\n` +
        wf.stepByStep.map((s, idx) => `${idx + 1}. ${s}`).join('\n') +
        `\n\n**What you'll need**: ${wf.requiredInputs.join(', ')}\n` +
        `**Result**: ${wf.expectedResult}`;
    } else {
      guideText += `**Execution Procedure**:\n` +
        wf.stepByStep.map((s, idx) => `${idx + 1}. ${s}`).join('\n') +
        `\n\n**Required Payloads**: \`${wf.requiredInputs.join('`, `')}\`\n` +
        `**Expected State**: ${wf.expectedResult}\n` +
        `**Minimum Clearance**: \`${wf.minimumRole}\``;
      
      if (wf.commonErrors && wf.commonErrors.length > 0) {
        guideText += `\n**Failure Prevention**: ${wf.commonErrors.join('; ')}`;
      }
    }

    return {
      answer: guideText,
      userLevel: level,
      workflow: wf,
      stepByStep: wf.stepByStep,
      guidedActions: [
        {
          id: `act_start_${wf.id}`,
          label: `Open ${wf.title.split(' ')[0]} ${wf.title.split(' ')[1] || ''}`,
          description: `Navigate directly to ${wf.targetTab}`,
          targetTab: wf.targetTab,
          actionType: 'NAVIGATE'
        }
      ],
      confidence: 98,
      source: 'LOCAL_KNOWLEDGE_ENGINE',
      escalationAvailable: false
    };
  }

  /**
   * Generates a grounding system prompt for the Gemini backend API
   */
  public generateGeminiGroundingPrompt(): string {
    const modulesSummary = this.modules.map(m => 
      `- Domain: [${m.domain}] Tab: "${m.tabId}" | Name: "${m.name}" | Summary: ${m.summary} | Features: ${m.keyFeatures.slice(0, 3).join(', ')}`
    ).join('\n');

    const workflowsSummary = this.workflows.map(w => 
      `- Workflow: "${w.title}" (Tab: ${w.targetTab}) | Steps: ${w.stepByStep.join(' -> ')} | Minimum Role: ${w.minimumRole}`
    ).join('\n');

    return `You are the official CATALYX SYSTEM GUIDE AI of CATALYX V26 (Deep Engineering Hardening & System Intelligence Release).
Your mission is to help users understand, navigate, and operate the real implemented CATALYX platform with absolute accuracy.

CRITICAL DIRECTIVES:
1. STRICT TRUTH ONLY: Never fabricate, invent, or hallucinate non-existent features (e.g. no cryptocurrency mining, no drone fleets, no external video games). If asked about something CATALYX doesn't have, state clearly that it is not available in V26 and recommend the closest real capability.
2. SYSTEM GROUNDING: CATALYX is composed of the following real domains, modules, and workflows:
${modulesSummary}

WORKFLOWS:
${workflowsSummary}

3. USER EXPERTISE ADAPTATION:
- BEGINNER: Use clear, encouraging, jargon-free walk-throughs with numbered steps.
- INTERMEDIATE: Practical, workflow-oriented, links features to screens.
- ADVANCED/ADMINISTRATOR: Explain system architecture, RBAC boundaries, L2 firewall checks, correlation IDs, and data structures.

4. SAFETY & PRIVACY:
- Never expose API keys, internal environment secrets, or cross-tenant private user data.
- Enforce the user's role permissions (FOUNDER, EXECUTIVE, MANAGER, OPERATOR, AUDITOR).

5. FORMAT: Provide a clear direct answer, step-by-step instructions if applicable, and concise markdown formatting.`;
  }
}

export const systemKnowledgeService = new SystemKnowledgeService();
