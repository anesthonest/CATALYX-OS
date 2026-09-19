import { WorkDemo } from '../types';
import { safeStorage } from '../utils/safeStorage';

class DemosService {
  private readonly STORAGE_KEY = 'catalyx_v24_demos';
  private demos: WorkDemo[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<WorkDemo>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      this.demos = loaded;
    } else {
      this.seedInitialDemos();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.demos);
  }

  private seedInitialDemos() {
    const now = new Date();
    this.demos = [
      {
        id: 'demo_planetary_fabric_3d',
        title: 'Planetary Fabric 3D Digital Twin Simulation',
        description: 'Interactive WebGL-accelerated earth model with real-time maritime logistics, compute topology, and weather layers',
        demoType: 'LIVE',
        url: 'https://planetary-fabric.catalyx.internal/sim',
        version: 'v19.4.2-preview',
        ownerEmail: 'anesthonest81@gmail.com',
        status: 'ACTIVE',
        tags: ['SIMULATION', 'DIGITAL_TWIN', 'WEBGL', 'V19'],
        createdAt: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
        interactivePreviewUrl: 'sandbox:planetary-fabric'
      },
      {
        id: 'demo_pesapal_v3_checkout',
        title: 'Pesapal v3 Hosted Checkout & Mobile Money Flow',
        description: 'Interactive payment sandbox simulating MPesa STK Push, Airtel Money, and Visa/Mastercard 3D-Secure challenges',
        demoType: 'DEMO',
        url: 'https://pay.catalyx.io/sandbox/checkout',
        version: 'v3.0.1-sandbox',
        ownerEmail: 'anesthonest81@gmail.com',
        status: 'ACTIVE',
        tags: ['FINANCE', 'PESAPAL', 'CHECKOUT', 'SANDBOX'],
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        interactivePreviewUrl: 'sandbox:pesapal-checkout'
      },
      {
        id: 'demo_agent_fleet_dag',
        title: 'Autonomous Workforce Agent Fleet Orchestrator (11 Agents)',
        description: 'Visual DAG designer showing live dependency resolution between Executive Synthesizer, Code Auditor, and Firewalls',
        demoType: 'PROTOTYPE',
        url: 'https://agents.catalyx.internal/dag-runner',
        version: 'v0.9.4-alpha',
        ownerEmail: 'sarah.chen@catalyx.io',
        status: 'ACTIVE',
        tags: ['AI_AGENTS', 'DAG', 'WORKFORCE', 'PROTOTYPE'],
        createdAt: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
        interactivePreviewUrl: 'sandbox:agent-fleet'
      },
      {
        id: 'demo_social_inbox_mesh',
        title: 'Omnichannel Social Inbox Mesh Relay & WhatsApp Webhook',
        description: 'Live test harness for incoming WhatsApp Business, Meta Messenger, and Twilio SMS message relays',
        demoType: 'EXTERNAL_LINK',
        url: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
        version: 'v23.2-prod',
        ownerEmail: 'anesthonest81@gmail.com',
        status: 'ACTIVE',
        tags: ['WHATSAPP', 'SOCIAL_INBOX', 'WEBHOOKS'],
        createdAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString()
      }
    ];
    this.saveState();
  }

  public getAllDemos(): WorkDemo[] {
    return [...this.demos];
  }

  public getDemoById(id: string): WorkDemo | undefined {
    return this.demos.find(d => d.id === id);
  }

  public createDemo(params: {
    title: string;
    description: string;
    demoType: 'LIVE' | 'DEMO' | 'PROTOTYPE' | 'RECORDING' | 'EXTERNAL_LINK';
    url: string;
    version?: string;
    ownerEmail: string;
    tags?: string[];
  }): WorkDemo {
    const newDemo: WorkDemo = {
      id: 'demo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: params.title.trim(),
      description: params.description.trim(),
      demoType: params.demoType,
      url: params.url.trim(),
      version: params.version?.trim() || 'v1.0.0-preview',
      ownerEmail: params.ownerEmail,
      status: 'ACTIVE',
      tags: params.tags || [params.demoType, 'V24'],
      createdAt: new Date().toISOString()
    };

    this.demos.unshift(newDemo);
    this.saveState();
    return newDemo;
  }

  public deleteDemo(id: string): boolean {
    const index = this.demos.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.demos.splice(index, 1);
    this.saveState();
    return true;
  }
}

export const demosService = new DemosService();
