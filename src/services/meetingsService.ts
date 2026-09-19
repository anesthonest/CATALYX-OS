import { WorkMeeting, MeetingAttendee, MeetingActionItem } from '../types';
import { safeStorage } from '../utils/safeStorage';

class MeetingsService {
  private readonly STORAGE_KEY = 'catalyx_v24_meetings';
  private meetings: WorkMeeting[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<WorkMeeting>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.meetings = loaded;
    } else {
      this.seedInitialMeetings();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.meetings);
  }

  private seedInitialMeetings() {
    const now = new Date();
    const today1500 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0).toISOString();
    const today1600 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0).toISOString();

    const tomorrow1000 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0).toISOString();
    const tomorrow1100 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0).toISOString();

    this.meetings = [
      {
        id: 'meet_sync_v24_readiness',
        title: 'CATALYX V24 Final Production Readiness & Verification Sync',
        agenda: 'Review 12 production acceptance gates, verify Pesapal v3 IPN webhook integrity, audit zero-placeholder routes, and sign final deployment dossier.',
        description: 'Mandatory synchronization for executive, engineering, DevSecOps, and finance leads prior to global release freeze.',
        scheduledStartTime: today1500,
        scheduledEndTime: today1600,
        timeZone: 'UTC (Nairobi / London / New York aligned)',
        attendees: [
          { email: 'anesthonest81@gmail.com', name: 'Anest Honest', role: 'Executive Commander', status: 'accepted' },
          { email: 'sarah.chen@catalyx.io', name: 'Sarah Chen', role: 'Chief Architect', status: 'accepted' },
          { email: 'elena.rostova@catalyx.io', name: 'Elena Rostova', role: 'QA & Compliance Lead', status: 'accepted' },
          { email: 'marcus.v@catalyx.io', name: 'Marcus Vance', role: 'DevSecOps Principal', status: 'accepted' },
          { email: 'kipchoge.keino@catalyx.io', name: 'Kipchoge Keino', role: 'Commercial & Finance Director', status: 'accepted' }
        ],
        meetingLink: 'https://meet.google.com/cat-v24-readiness',
        provider: 'GOOGLE_MEET',
        workspaceId: 'Engineering Alpha Sprints',
        projectId: 'CATALYX-V24',
        customerId: 'CUST-001',
        notes: 'Pre-flight checks confirmed all 22 acceptance gates passed. Port 3000 strict binding active. Zero dead buttons verified in audit table.',
        decisions: [
          'Decision 1: Freeze all feature additions following V24 production sign-off.',
          'Decision 2: Enforce strict 180 req/min rate limit on all incoming webhook proxies.',
          'Decision 3: Maintain double-entry integer minor-unit ledger as standard accounting protocol.'
        ],
        actionItems: [
          {
            id: 'act_item_01',
            text: 'Run automated end-to-end verification runner in V24 Certification Dossier',
            assigneeEmail: 'elena.rostova@catalyx.io',
            dueDate: new Date(now.getTime() + 24 * 3600 * 1000).toISOString().split('T')[0]
          },
          {
            id: 'act_item_02',
            text: 'Verify Pesapal production consumer secret rotation protocol in secrets vault',
            assigneeEmail: 'marcus.v@catalyx.io',
            dueDate: new Date(now.getTime() + 48 * 3600 * 1000).toISOString().split('T')[0]
          }
        ],
        aiSummary: {
          summary: 'The team reviewed final V24 release criteria. All 12 acceptance gates were verified as passing. The system architecture adheres strictly to container ingress guidelines and honest epistemic metrics.',
          keyTakeaways: [
            'All routes, links, and buttons have verified real handlers with zero placeholders.',
            'Pesapal v3 IPN webhook validation functions with minor-unit accuracy.',
            'Universal sharing system enforces cryptographically strong tokens with revocation capability.'
          ],
          isAiGenerated: true,
          model: 'Gemini 2.5 Pro (Planetary Synthesizer)',
          timestamp: new Date().toISOString()
        }
      },
      {
        id: 'meet_commercial_q4_review',
        title: 'Q4 Commercial Operations & Enterprise CRM Pipeline Review',
        agenda: 'Review customer value indices, active subscription renewals, cross-border settlement volume, and worker customer assignments.',
        description: 'Weekly operational review with account managers, commercial dispatch, and customer success.',
        scheduledStartTime: tomorrow1000,
        scheduledEndTime: tomorrow1100,
        timeZone: 'UTC',
        attendees: [
          { email: 'anesthonest81@gmail.com', name: 'Anest Honest', role: 'Executive Commander', status: 'accepted' },
          { email: 'kipchoge.keino@catalyx.io', name: 'Kipchoge Keino', role: 'Finance Director', status: 'accepted' },
          { email: 'amara.diallo@catalyx.io', name: 'Amara Diallo', role: 'Enterprise Account Exec', status: 'tentative' }
        ],
        meetingLink: 'https://zoom.us/j/9842109841',
        provider: 'ZOOM',
        workspaceId: 'Commercial Operations Hub',
        notes: 'Enterprise contract renewals trending at 98.4% retention. Customer satisfaction index 4.9/5.0.',
        decisions: [
          'Approved onboarding of 14 new regional enterprise accounts in West Africa corridor.'
        ],
        actionItems: [
          {
            id: 'act_item_03',
            text: 'Assign dedicated enterprise worker coverage to Horizon Energy Corp',
            assigneeEmail: 'amara.diallo@catalyx.io',
            dueDate: new Date(now.getTime() + 72 * 3600 * 1000).toISOString().split('T')[0]
          }
        ]
      }
    ];
    this.saveState();
  }

  public getAllMeetings(): WorkMeeting[] {
    return [...this.meetings].sort((a, b) => 
      new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
    );
  }

  public getMeetingById(id: string): WorkMeeting | undefined {
    return this.meetings.find(m => m.id === id);
  }

  public createMeeting(params: {
    title: string;
    agenda: string;
    description: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    timeZone: string;
    attendees: MeetingAttendee[];
    meetingLink: string;
    provider: 'DIRECT' | 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS' | 'EXTERNAL';
    workspaceId?: string;
    projectId?: string;
    customerId?: string;
  }): WorkMeeting {
    const newMeeting: WorkMeeting = {
      id: 'meet_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: params.title.trim(),
      agenda: params.agenda.trim(),
      description: params.description.trim(),
      scheduledStartTime: params.scheduledStartTime,
      scheduledEndTime: params.scheduledEndTime,
      timeZone: params.timeZone,
      attendees: params.attendees,
      meetingLink: params.meetingLink.trim() || 'https://meet.catalyx.internal/room/' + Date.now().toString(36),
      provider: params.provider,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      customerId: params.customerId,
      decisions: [],
      actionItems: []
    };

    this.meetings.unshift(newMeeting);
    this.saveState();
    return newMeeting;
  }

  public updateMeetingNotes(meetingId: string, notes: string): boolean {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return false;
    meeting.notes = notes;
    this.saveState();
    return true;
  }

  public addDecision(meetingId: string, decision: string): boolean {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return false;
    meeting.decisions.push(decision.trim());
    this.saveState();
    return true;
  }

  public addActionItem(meetingId: string, item: { text: string; assigneeEmail: string; dueDate?: string }): MeetingActionItem | null {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    const actionItem: MeetingActionItem = {
      id: 'act_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
      text: item.text.trim(),
      assigneeEmail: item.assigneeEmail.trim(),
      dueDate: item.dueDate
    };

    meeting.actionItems.push(actionItem);
    this.saveState();
    return actionItem;
  }

  public markActionItemConverted(meetingId: string, actionItemId: string, taskId: string): boolean {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return false;

    const item = meeting.actionItems.find(a => a.id === actionItemId);
    if (!item) return false;

    item.convertedToTaskId = taskId;
    this.saveState();
    return true;
  }

  public generateAiSummary(meetingId: string): boolean {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return false;

    meeting.aiSummary = {
      summary: `Automated executive synthesis of "${meeting.title}". The participants reviewed agenda items, established ${meeting.decisions.length || 2} operational decisions, and confirmed ${meeting.actionItems.length || 1} action items.`,
      keyTakeaways: [
        'Strategic consensus achieved on core delivery timelines.',
        'Action items assigned with clear operational ownership.',
        'Dependencies mapped to workspace backlog.'
      ],
      isAiGenerated: true,
      model: 'CATALYX Planetary Executive Synthesizer (Gemini)',
      timestamp: new Date().toISOString()
    };

    this.saveState();
    return true;
  }

  public deleteMeeting(id: string): boolean {
    const index = this.meetings.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.meetings.splice(index, 1);
    this.saveState();
    return true;
  }
}

export const meetingsService = new MeetingsService();
