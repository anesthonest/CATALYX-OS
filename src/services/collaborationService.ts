import { 
  UniversalComment, 
  EnterpriseActivityItem, 
  ShareableArtifactType 
} from '../types';

class CollaborationService {
  private readonly COMMENTS_KEY = 'catalyx_v24_comments';
  private readonly ACTIVITIES_KEY = 'catalyx_v24_enterprise_activities';

  private comments: UniversalComment[] = [];
  private activities: EnterpriseActivityItem[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedComments = localStorage.getItem(this.COMMENTS_KEY);
      if (storedComments) {
        this.comments = JSON.parse(storedComments);
      } else {
        this.seedInitialComments();
      }

      const storedActivities = localStorage.getItem(this.ACTIVITIES_KEY);
      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
      } else {
        this.seedInitialActivities();
      }
    } catch {
      this.seedInitialComments();
      this.seedInitialActivities();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(this.comments));
      localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.warn('Failed to save collaboration state', e);
    }
  }

  private seedInitialComments() {
    const now = new Date();
    this.comments = [
      {
        id: 'comm_001',
        targetType: 'presentation',
        targetId: 'pres_q4_strategic_roadmap',
        authorEmail: 'anesthonest81@gmail.com',
        authorName: 'Anest Honest',
        text: 'Slide 3 planetary fabric coordinates look sharp. Let us ensure the minor-unit currency reconciliation ledger aligns with slide 5.',
        createdAt: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
        reactions: [{ emoji: '🚀', count: 3, users: ['anesthonest81@gmail.com', 'dev_alpha@catalyx.io'] }]
      },
      {
        id: 'comm_002',
        targetType: 'presentation',
        targetId: 'pres_q4_strategic_roadmap',
        authorEmail: 'sarah.chen@catalyx.io',
        authorName: 'Sarah Chen (Lead Architect)',
        text: 'Agreed. The double-entry validation hash guarantees zero rounding discrepancy for Pesapal v3 settle runs.',
        createdAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
        parentId: 'comm_001',
        reactions: [{ emoji: '👍', count: 2, users: ['anesthonest81@gmail.com'] }]
      },
      {
        id: 'comm_003',
        targetType: 'meeting',
        targetId: 'meet_sync_v24_readiness',
        authorEmail: 'elena.rostova@catalyx.io',
        authorName: 'Elena Rostova (QA Lead)',
        text: 'Pre-flight checks passed on all 22 acceptance gates. Ready to sign the V24 production dossier.',
        createdAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
        reactions: [{ emoji: '🎯', count: 4, users: ['anesthonest81@gmail.com'] }]
      },
      {
        id: 'comm_004',
        targetType: 'video',
        targetId: 'media_v24_product_keynote',
        authorEmail: 'marcus.v@catalyx.io',
        authorName: 'Marcus Vance (DevSecOps)',
        text: 'At 02:15 in the chapter breakdown, the tenant isolation boundary demo is crystal clear.',
        createdAt: new Date(now.getTime() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: 'comm_005',
        targetType: 'file',
        targetId: 'file_pesapal_v3_reconciliation_spec',
        authorEmail: 'finance.lead@catalyx.io',
        authorName: 'Kipchoge Keino (Finance Director)',
        text: 'Verified with Pesapal v3 IPN webhook format. All 180 req/min rate limit constraints are honored.',
        createdAt: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(),
        reactions: [{ emoji: '✅', count: 2, users: ['anesthonest81@gmail.com'] }]
      }
    ];
    this.saveState();
  }

  private seedInitialActivities() {
    const now = new Date();
    this.activities = [
      {
        id: 'act_001',
        eventType: 'SHARE_LINK_CREATED',
        title: 'Secure Share Link Generated',
        description: 'Generated cryptographic share token for Presentation "Q4 2026 Planetary Strategic Roadmap"',
        actor: 'Anest Honest',
        targetType: 'presentation',
        targetId: 'pres_q4_strategic_roadmap',
        timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        targetTab: 'presentations'
      },
      {
        id: 'act_002',
        eventType: 'MEETING_CREATED',
        title: 'Strategic Architecture Sync Scheduled',
        description: 'V24 Production Readiness & Verification meeting scheduled for today at 15:00 UTC',
        actor: 'Sarah Chen',
        targetType: 'meeting',
        targetId: 'meet_sync_v24_readiness',
        timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        targetTab: 'meetings'
      },
      {
        id: 'act_003',
        eventType: 'FILE_SHARED',
        title: 'Document Vault Deposit',
        description: 'Uploaded and verified "Pesapal v3 Ledger Double-Entry Specification.pdf" (MIME: application/pdf)',
        actor: 'Kipchoge Keino',
        targetType: 'file',
        targetId: 'file_pesapal_v3_reconciliation_spec',
        timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
        targetTab: 'files'
      },
      {
        id: 'act_004',
        eventType: 'PRESENTATION_UPDATED',
        title: 'Presentation Deck Synchronized',
        description: 'Added metrics slide to "Q4 2026 Planetary Strategic Roadmap"',
        actor: 'Anest Honest',
        targetType: 'presentation',
        targetId: 'pres_q4_strategic_roadmap',
        timestamp: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
        targetTab: 'presentations'
      },
      {
        id: 'act_005',
        eventType: 'PAYMENT_VERIFIED',
        title: 'Pesapal IPN Order Settled',
        description: 'Order #ORD-7749 verified and credited to minor units ledger ($4,500.00)',
        actor: 'Pesapal Gateway Relay',
        targetType: 'order',
        targetId: 'ORD-7749',
        timestamp: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
        targetTab: 'unified-commerce'
      }
    ];
    this.saveState();
  }

  public getComments(targetType: ShareableArtifactType | string, targetId: string): UniversalComment[] {
    return this.comments.filter(c => c.targetType === targetType && c.targetId === targetId);
  }

  public addComment(params: {
    targetType: ShareableArtifactType;
    targetId: string;
    authorEmail: string;
    authorName: string;
    text: string;
    parentId?: string;
  }): UniversalComment {
    const newComment: UniversalComment = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      targetType: params.targetType,
      targetId: params.targetId,
      authorEmail: params.authorEmail,
      authorName: params.authorName,
      text: params.text.trim(),
      createdAt: new Date().toISOString(),
      parentId: params.parentId,
      reactions: []
    };

    this.comments.push(newComment);

    this.recordActivity({
      eventType: 'COMMENT_ADDED',
      title: 'New Collaboration Note',
      description: `${params.authorName} commented on ${params.targetType} (${params.text.slice(0, 40)}...)`,
      actor: params.authorName,
      targetType: params.targetType,
      targetId: params.targetId
    });

    this.saveState();
    return newComment;
  }

  public toggleReaction(commentId: string, emoji: string, userEmail: string): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (!comment.reactions) {
      comment.reactions = [];
    }

    const existingReaction = comment.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(userEmail)) {
        // Remove reaction
        existingReaction.users = existingReaction.users.filter(u => u !== userEmail);
        existingReaction.count = existingReaction.users.length;
        if (existingReaction.count === 0) {
          comment.reactions = comment.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Add user
        existingReaction.users.push(userEmail);
        existingReaction.count = existingReaction.users.length;
      }
    } else {
      comment.reactions.push({
        emoji,
        count: 1,
        users: [userEmail]
      });
    }

    this.saveState();
    return true;
  }

  public deleteComment(commentId: string, userEmail: string): boolean {
    const index = this.comments.findIndex(c => c.id === commentId);
    if (index === -1) return false;

    const comment = this.comments[index];
    if (comment.authorEmail !== userEmail && !userEmail.includes('admin')) {
      return false; // Not authorized
    }

    this.comments.splice(index, 1);
    this.saveState();
    return true;
  }

  public getRecentActivities(limit: number = 20): EnterpriseActivityItem[] {
    return [...this.activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public getActivityFeed(): EnterpriseActivityItem[] {
    return this.getRecentActivities(100);
  }

  public recordActivity(params: Omit<EnterpriseActivityItem, 'id' | 'timestamp'>): EnterpriseActivityItem {
    const item: EnterpriseActivityItem = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...params
    };

    this.activities.unshift(item);
    if (this.activities.length > 300) {
      this.activities = this.activities.slice(0, 300);
    }
    this.saveState();
    return item;
  }

  public logEnterpriseActivity(params: Omit<EnterpriseActivityItem, 'id' | 'timestamp'>): EnterpriseActivityItem {
    return this.recordActivity(params);
  }
}

export const collaborationService = new CollaborationService();
