import { UserProfile, UserPersonaRole, Workspace, Task } from '../types';

export type WorkspaceMembershipState = 'INVITED' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';

export interface WorkspaceMemberV23 {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  role: 'owner' | 'manager' | 'worker' | 'contractor' | 'guest';
  status: WorkspaceMembershipState;
  joinedAt: string;
  department?: string;
  title?: string;
  reportsToUid?: string;
  assignedCustomerIds?: string[];
  skills?: string[];
}

export interface WorkerRelationshipMap {
  whoIWorkWith: { uid: string; name: string; role: string; email: string; avatarBg: string }[];
  whoIReportTo: { uid: string; name: string; role: string; title: string } | null;
  whatIAmWorkingOn: { id: string; title: string; priority: string; deadline: string; category: string }[];
  whatIAmResponsibleFor: { type: 'project' | 'customer' | 'workflow' | 'service'; id: string; title: string; slaStatus: string }[];
  whatDependsOnMyWork: { dependentTaskId: string; dependentTaskTitle: string; assigneeName: string; blockedReason: string }[];
  whatDependsOnOtherPeople: { myTaskId: string; myTaskTitle: string; waitingOn: string; blockerType: string }[];
}

export interface WorkspaceInvitationV23 {
  inviteId: string;
  inviteCode: string;
  workspaceId: string;
  workspaceName: string;
  organizationId: string;
  invitedEmail: string;
  invitedRole: 'worker' | 'contractor' | 'manager' | 'guest';
  senderEmail: string;
  createdAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
  requiresManagerApproval: boolean;
}

export interface WorkerAssignmentSummary {
  assignedTasks: Task[];
  teamTasks: Task[];
  deadlinesCount: number;
  highPriorityCount: number;
  activeAnnouncements: { id: string; title: string; date: string; author: string; content: string }[];
  customerAssignments: { customerId: string; customerName: string; tier: string; activeOrderCount: number; lastContactDate: string }[];
  workflowAssignments: { workflowId: string; workflowName: string; status: string; pendingStep: string }[];
  missionParticipation: { missionId: string; missionTitle: string; roleInMission: string; progress: number }[];
  pendingApprovals: { id: string; title: string; requester: string; requestedAt: string; type: string }[];
  notificationsCount: number;
  performanceScore: number;
  completedTasksThisWeek: number;
}

class WorkforceManagementService {
  private readonly STORAGE_INVITES = 'catalyx_v23_workspace_invitations';
  private readonly STORAGE_MEMBERS = 'catalyx_v23_workspace_members';

  // Seed default workspaces and invitations if not present
  constructor() {
    this.ensureSeedData();
  }

  private ensureSeedData() {
    try {
      if (!localStorage.getItem(this.STORAGE_INVITES)) {
        const seedInvites: WorkspaceInvitationV23[] = [
          {
            inviteId: 'inv_alpha_01',
            inviteCode: 'CATALYX-ENG-2026',
            workspaceId: 'ws_engineering_core',
            workspaceName: 'Engineering & Infrastructure Team',
            organizationId: 'org_catalyx_hq',
            invitedEmail: 'anesthonest81@gmail.com',
            invitedRole: 'worker',
            senderEmail: 'lead-architect@catalyx.io',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
            status: 'PENDING',
            requiresManagerApproval: false
          },
          {
            inviteId: 'inv_beta_02',
            inviteCode: 'CATALYX-COMM-88',
            workspaceId: 'ws_global_commerce',
            workspaceName: 'Global Commerce & Operations',
            organizationId: 'org_catalyx_hq',
            invitedEmail: 'anesthonest81@gmail.com',
            invitedRole: 'manager',
            senderEmail: 'operations@catalyx.io',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            expiresAt: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
            status: 'PENDING',
            requiresManagerApproval: true
          }
        ];
        localStorage.setItem(this.STORAGE_INVITES, JSON.stringify(seedInvites));
      }
    } catch {
      // localStorage may not be accessible in some environments
    }
  }

  // 1. Get all invitations for current user email
  public getInvitations(userEmail: string): WorkspaceInvitationV23[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_INVITES);
      if (!raw) return [];
      const all: WorkspaceInvitationV23[] = JSON.parse(raw);
      return all.filter(inv => inv.invitedEmail.toLowerCase() === userEmail.toLowerCase() || inv.status === 'PENDING');
    } catch {
      return [];
    }
  }

  // 2. Join workspace via invitation code
  public joinWorkspaceByCode(
    inviteCode: string, 
    user: UserProfile
  ): { success: boolean; message: string; workspaceId?: string; workspaceName?: string } {
    try {
      const raw = localStorage.getItem(this.STORAGE_INVITES);
      const all: WorkspaceInvitationV23[] = raw ? JSON.parse(raw) : [];
      const cleanCode = inviteCode.trim().toUpperCase();

      const target = all.find(inv => inv.inviteCode.toUpperCase() === cleanCode);
      if (!target) {
        return {
          success: false,
          message: `Invalid invitation code "${inviteCode}". Please verify with your workspace administrator.`
        };
      }

      if (new Date(target.expiresAt).getTime() < Date.now()) {
        return {
          success: false,
          message: `This invitation code expired on ${new Date(target.expiresAt).toLocaleDateString()}. Please request a fresh invitation link.`
        };
      }

      // If already accepted
      if (target.status === 'ACCEPTED') {
        return {
          success: true,
          message: `Already enrolled in workspace "${target.workspaceName}".`,
          workspaceId: target.workspaceId,
          workspaceName: target.workspaceName
        };
      }

      // If manager approval required
      if (target.requiresManagerApproval) {
        target.status = 'PENDING';
        localStorage.setItem(this.STORAGE_INVITES, JSON.stringify(all));
        return {
          success: true,
          message: `Membership request submitted for "${target.workspaceName}". Awaiting workspace manager approval.`,
          workspaceId: target.workspaceId,
          workspaceName: target.workspaceName
        };
      }

      // Mark accepted
      target.status = 'ACCEPTED';
      localStorage.setItem(this.STORAGE_INVITES, JSON.stringify(all));

      return {
        success: true,
        message: `Successfully joined workspace "${target.workspaceName}" as ${target.invitedRole.toUpperCase()}!`,
        workspaceId: target.workspaceId,
        workspaceName: target.workspaceName
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to process workspace join.' };
    }
  }

  // 3. Create fresh workspace invitation
  public createInvitation(
    workspaceId: string,
    workspaceName: string,
    invitedEmail: string,
    invitedRole: 'worker' | 'contractor' | 'manager' | 'guest',
    senderEmail: string,
    requiresManagerApproval: boolean = false
  ): WorkspaceInvitationV23 {
    const raw = localStorage.getItem(this.STORAGE_INVITES);
    const all: WorkspaceInvitationV23[] = raw ? JSON.parse(raw) : [];

    const inviteCode = `CATALYX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv: WorkspaceInvitationV23 = {
      inviteId: 'inv_' + Date.now().toString(36),
      inviteCode,
      workspaceId,
      workspaceName,
      organizationId: 'org_catalyx_hq',
      invitedEmail: invitedEmail.trim().toLowerCase(),
      invitedRole,
      senderEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24 * 14).toISOString(),
      status: 'PENDING',
      requiresManagerApproval
    };

    all.push(newInv);
    localStorage.setItem(this.STORAGE_INVITES, JSON.stringify(all));
    return newInv;
  }

  // 4. Get Worker Relationship Map (Transparent responsibility & accountability)
  public getWorkerRelationshipMap(userId: string, userRole: UserPersonaRole): WorkerRelationshipMap {
    return {
      whoIWorkWith: [
        { uid: 'u_elena_dev', name: 'Elena Rostova', role: 'Staff Systems Engineer', email: 'elena.r@catalyx.io', avatarBg: 'from-blue-600 to-indigo-600' },
        { uid: 'u_marcus_ops', name: 'Marcus Chen', role: 'Operations & Commerce Lead', email: 'marcus.c@catalyx.io', avatarBg: 'from-emerald-600 to-teal-600' },
        { uid: 'u_sophia_ai', name: 'Dr. Sophia Vance', role: 'AI Safety & Governance Researcher', email: 'sophia.v@catalyx.io', avatarBg: 'from-purple-600 to-pink-600' },
        { uid: 'u_zain_support', name: 'Zainab Al-Mansoor', role: 'Customer Success & Social Lead', email: 'zainab.m@catalyx.io', avatarBg: 'from-amber-600 to-orange-600' }
      ],
      whoIReportTo: {
        uid: 'u_commander_01',
        name: 'Chief Operating Officer',
        role: 'Executive Direction',
        title: 'VP of Platform & Workforce Operations'
      },
      whatIAmWorkingOn: [
        { id: 't_23_01', title: 'Verify immutable integer-cents revenue ledger reconciliation', priority: 'high', deadline: 'Today, 18:00', category: 'Finance' },
        { id: 't_23_02', title: 'Review WhatsApp Cloud API incoming webhook listener', priority: 'high', deadline: 'Tomorrow, 12:00', category: 'Integrations' },
        { id: 't_23_03', title: 'Onboard 3 commerce workers to Social Inbox escalation queue', priority: 'medium', deadline: 'Thursday, 15:00', category: 'Workforce' },
        { id: 't_23_04', title: 'Audit L2 Human-in-the-Loop pre-execution preview gates', priority: 'high', deadline: 'Friday, 17:00', category: 'Security' }
      ],
      whatIAmResponsibleFor: [
        { type: 'project', id: 'proj_v23_consolidation', title: 'CATALYX V23 Final Production Consolidation', slaStatus: 'ON_TRACK' },
        { type: 'customer', id: 'cust_acme_corp', title: 'Acme Enterprise Global (Premium Tier)', slaStatus: 'SATISFIED' },
        { type: 'workflow', id: 'wf_pesapal_ipn_dispatch', title: 'Pesapal IPN Double-Entry Verification', slaStatus: 'ZERO_DRIFT' },
        { type: 'service', id: 'srv_social_inbox_relay', title: 'Omnichannel Social Inbox Routing Mesh', slaStatus: 'ACTIVE' }
      ],
      whatDependsOnMyWork: [
        { dependentTaskId: 'dep_01', dependentTaskTitle: 'Deploy production release tag v23.0.0-final', assigneeName: 'Release Engineer', blockedReason: 'Requires certification sign-off' },
        { dependentTaskId: 'dep_02', dependentTaskTitle: 'Deliver audited Q3 merchant statements', assigneeName: 'Finance Controller', blockedReason: 'Requires ledger reconciliation seal' }
      ],
      whatDependsOnOtherPeople: [
        { myTaskId: 't_23_02', myTaskTitle: 'WhatsApp Business live webhook testing', waitingOn: 'Meta Business Manager Verification Token', blockerType: 'External Credentials' },
        { myTaskId: 't_23_05', myTaskTitle: 'Live Pesapal Settlement API call', waitingOn: 'PESAPAL_CONSUMER_SECRET environment variable', blockerType: 'Environment Config' }
      ]
    };
  }

  // 5. Get comprehensive Worker Center summary
  public getWorkerCenterSummary(user: UserProfile, tasks: Task[]): WorkerAssignmentSummary {
    const assignedTasks = tasks.slice(0, 8);
    const pendingTasks = tasks.filter(t => !t.completed);
    const highPriorityCount = pendingTasks.filter(t => t.priority === 'high').length;

    return {
      assignedTasks,
      teamTasks: [
        { id: 'tt_1', text: 'Verify Zero-Drift financial reconciliation engine', completed: true, priority: 'high', category: 'finance', createdAt: new Date().toISOString() },
        { id: 'tt_2', text: 'Implement Meta Messenger customer escalation handler', completed: false, priority: 'medium', category: 'work', createdAt: new Date().toISOString() },
        { id: 'tt_3', text: 'Audit tenant isolation boundaries across workspace switchers', completed: true, priority: 'high', category: 'work', createdAt: new Date().toISOString() },
        { id: 'tt_4', text: 'Complete production readiness verification report', completed: false, priority: 'high', category: 'growth', createdAt: new Date().toISOString() }
      ],
      deadlinesCount: 3,
      highPriorityCount: highPriorityCount || 2,
      activeAnnouncements: [
        {
          id: 'ann_v23',
          title: 'CATALYX V23 Production Consolidation Freeze Active',
          date: 'Today, 09:00 AM',
          author: 'Platform Architecture Council',
          content: 'Feature additions are frozen. All operational focus is dedicated to integration hardening, verified execution, social connector integrity, and production certification.'
        },
        {
          id: 'ann_sec',
          title: 'Security Notice: Human Accountability on AI Actions Mandatory',
          date: 'Yesterday',
          author: 'AI Governance Board',
          content: 'No autonomous agent may dispatch customer communications, alter orders, or mutate database state without explicit pre-execution action preview and human authorization.'
        }
      ],
      customerAssignments: [
        { customerId: 'c_01', customerName: 'Apex Logistics East Africa', tier: 'Enterprise Plus', activeOrderCount: 4, lastContactDate: '2 hours ago' },
        { customerId: 'c_02', customerName: 'Nairobi Bio-Tech Collective', tier: 'Growth Tier', activeOrderCount: 1, lastContactDate: 'Yesterday' },
        { customerId: 'c_03', customerName: 'Zenith Global Supply Ltd', tier: 'Standard', activeOrderCount: 2, lastContactDate: '3 days ago' }
      ],
      workflowAssignments: [
        { workflowId: 'wf_order_fulfil', workflowName: 'Order Fulfillment & Dispatch Pipeline', status: 'RUNNING', pendingStep: 'Worker Quality Check' },
        { workflowId: 'wf_refund_gate', workflowName: 'High-Value Refund Review Gate ($500+)', status: 'WAITING_APPROVAL', pendingStep: 'Manager Sign-off' }
      ],
      missionParticipation: [
        { missionId: 'm_zero_drift', missionTitle: 'Zero-Drift Financial Architecture Certification', roleInMission: 'Audit Lead', progress: 95 },
        { missionId: 'm_social_mesh', missionTitle: 'Omnichannel Social & Commerce Fabric Rollout', roleInMission: 'Integration Specialist', progress: 88 }
      ],
      pendingApprovals: [
        { id: 'appr_01', title: 'Custom Pesapal Discount Coupon ($25.00 off)', requester: 'Marcus Chen', requestedAt: '10:14 AM', type: 'Commerce Discount' },
        { id: 'appr_02', title: 'New Contractor Workspace Invitation', requester: 'Elena Rostova', requestedAt: '08:45 AM', type: 'Workspace Access' }
      ],
      notificationsCount: 4,
      performanceScore: user.executionScore || 94,
      completedTasksThisWeek: tasks.filter(t => t.completed).length + 6
    };
  }
}

export const workforceManagementService = new WorkforceManagementService();
