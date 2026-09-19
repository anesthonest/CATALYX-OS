import { WebhookSubscription, WebhookDeliveryLog, WebhookEventType } from '../types';
import { GovernanceService } from './governanceService';

const STORAGE_KEYS = {
  WEBHOOK_SUBSCRIPTIONS: 'catalyx_v8_webhook_subscriptions',
  WEBHOOK_DELIVERY_LOGS: 'catalyx_v8_webhook_delivery_logs',
};

export class WebhookService {
  /**
   * Get all registered webhook subscriptions for an organization
   */
  public static getSubscriptions(orgId: string): WebhookSubscription[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WEBHOOK_SUBSCRIPTIONS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse webhook subscriptions:', e);
      }
    }

    const defaultSubs: WebhookSubscription[] = [
      {
        id: `wh_sub_${Date.now()}_1`,
        organizationId: orgId,
        url: 'https://api.enterprise-gateway.internal/webhooks/catalyx',
        description: 'Enterprise Event Bus - Missions & Audits',
        events: ['mission.completed', 'workflow.completed', 'agent.completed', 'marketplace.purchase'],
        secret: 'whsec_e84bf9a2c3d4e5f60718293a4b5c6d7e',
        status: 'active',
        failureCount: 0,
        lastDeliveryAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_SUBSCRIPTIONS}_${orgId}`, JSON.stringify(defaultSubs));
    return defaultSubs;
  }

  /**
   * Register a new webhook endpoint
   */
  public static createSubscription(
    orgId: string,
    url: string,
    description: string,
    events: WebhookEventType[],
    actorName: string
  ): WebhookSubscription {
    const subs = this.getSubscriptions(orgId);
    const secretRandom = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newSub: WebhookSubscription = {
      id: `wh_sub_${Date.now()}`,
      organizationId: orgId,
      url,
      description,
      events,
      secret: `whsec_${secretRandom}`,
      status: 'active',
      failureCount: 0,
      createdAt: new Date().toISOString(),
    };

    subs.unshift(newSub);
    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_SUBSCRIPTIONS}_${orgId}`, JSON.stringify(subs));

    GovernanceService.addAuditLog({
      id: `audit_wh_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'REGISTER_WEBHOOK_ENDPOINT',
      resourceType: 'webhook_endpoint',
      resourceId: newSub.id,
      outcome: 'success',
      details: { url, eventsCount: events.length },
      timestamp: new Date().toISOString(),
    });

    return newSub;
  }

  /**
   * Delete or toggle webhook endpoint
   */
  public static deleteSubscription(orgId: string, subId: string, actorName: string): boolean {
    const subs = this.getSubscriptions(orgId);
    const filtered = subs.filter(s => s.id !== subId);
    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_SUBSCRIPTIONS}_${orgId}`, JSON.stringify(filtered));

    GovernanceService.addAuditLog({
      id: `audit_wh_del_${Date.now()}`,
      organizationId: orgId,
      actorId: 'user',
      actorName,
      actorRole: 'admin',
      action: 'DELETE_WEBHOOK_ENDPOINT',
      resourceType: 'webhook_endpoint',
      resourceId: subId,
      outcome: 'success',
      details: {},
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Fetch delivery logs
   */
  public static getDeliveryLogs(orgId: string): WebhookDeliveryLog[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WEBHOOK_DELIVERY_LOGS}_${orgId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse delivery logs:', e);
      }
    }

    const defaultLogs: WebhookDeliveryLog[] = [
      {
        id: `wh_log_01`,
        subscriptionId: `wh_sub_default`,
        organizationId: orgId,
        eventType: 'mission.completed',
        payloadSummary: '{"missionId": "m_q3_expansion", "outcome": "success", "durationSec": 142}',
        statusCode: 200,
        responseBody: '{"acknowledged": true, "receiver": "InternalGateway/v2"}',
        success: true,
        durationMs: 74,
        attempt: 1,
        signatureHeader: 'sha256=9f83a8b21c4e...',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: `wh_log_02`,
        subscriptionId: `wh_sub_default`,
        organizationId: orgId,
        eventType: 'marketplace.purchase',
        payloadSummary: '{"assetId": "asset_sec_auditor_01", "amountMinorUnits": 0, "currency": "USD"}',
        statusCode: 200,
        responseBody: '{"status": "ok"}',
        success: true,
        durationMs: 62,
        attempt: 1,
        signatureHeader: 'sha256=1a2b3c4d5e...',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_DELIVERY_LOGS}_${orgId}`, JSON.stringify(defaultLogs));
    return defaultLogs;
  }

  /**
   * Dispatch a simulated or real webhook event to all subscribed endpoints
   */
  public static async dispatchEvent(
    orgId: string,
    eventType: WebhookEventType,
    payload: Record<string, any>
  ): Promise<WebhookDeliveryLog[]> {
    const subscriptions = this.getSubscriptions(orgId).filter(
      s => s.status === 'active' && s.events.includes(eventType)
    );

    const logs = this.getDeliveryLogs(orgId);
    const results: WebhookDeliveryLog[] = [];

    for (const sub of subscriptions) {
      const startTime = Date.now();
      const payloadString = JSON.stringify({
        id: `evt_${Date.now()}`,
        event: eventType,
        organizationId: orgId,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      // Synthetic signature calculation simulation (HMAC-SHA256 representation)
      const fakeHmac = 'sha256=' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      let success = true;
      let statusCode = 200;
      let responseBody = '{"received": true, "timestamp": ' + Date.now() + '}';
      const durationMs = Math.floor(45 + Math.random() * 60);

      // If URL is invalid or marked test-fail
      if (sub.url.includes('fail') || sub.url.includes('offline')) {
        success = false;
        statusCode = 503;
        responseBody = 'Service Unavailable: Gateway timeout';
        sub.failureCount++;
      } else {
        sub.failureCount = 0;
      }

      sub.lastDeliveryAt = new Date().toISOString();

      const logEntry: WebhookDeliveryLog = {
        id: `wh_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        subscriptionId: sub.id,
        organizationId: orgId,
        eventType,
        payloadSummary: payloadString.length > 120 ? payloadString.slice(0, 120) + '...' : payloadString,
        statusCode,
        responseBody,
        success,
        durationMs,
        attempt: 1,
        signatureHeader: fakeHmac,
        timestamp: new Date().toISOString(),
      };

      logs.unshift(logEntry);
      results.push(logEntry);
    }

    // Keep max 50 logs
    const trimmedLogs = logs.slice(0, 50);
    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_DELIVERY_LOGS}_${orgId}`, JSON.stringify(trimmedLogs));
    localStorage.setItem(`${STORAGE_KEYS.WEBHOOK_SUBSCRIPTIONS}_${orgId}`, JSON.stringify(this.getSubscriptions(orgId)));

    return results;
  }
}
