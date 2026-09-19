import { WorkMediaItem, MediaChapter } from '../types';
import { safeStorage } from '../utils/safeStorage';

class MediaService {
  private readonly STORAGE_KEY = 'catalyx_v24_media_items';
  private mediaItems: WorkMediaItem[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    const loaded = safeStorage.getArray<WorkMediaItem>(this.STORAGE_KEY, []);
    if (loaded && loaded.length > 0) {
      // Automatically sanitize and migrate stale or blocked external URLs
      this.mediaItems = loaded.map(item => {
        if (item && item.url && item.url.includes('commondatastorage.googleapis.com')) {
          return {
            ...item,
            url: item.id === 'media_pesapal_v3_demo'
              ? 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm'
              : 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
          };
        }
        return item;
      }).filter(Boolean);
      this.saveState();
    } else {
      this.seedInitialMedia();
    }
  }

  private saveState() {
    safeStorage.set(this.STORAGE_KEY, this.mediaItems);
  }

  private seedInitialMedia() {
    const now = new Date();
    this.mediaItems = [
      {
        id: 'media_v24_product_keynote',
        title: 'CATALYX Universal Operating System Architecture Keynote',
        description: 'Comprehensive walkthrough of V24 Universal Navigation, Sharing, and Commercial Integration',
        mediaType: 'video',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        durationSeconds: 596,
        mimeType: 'video/mp4',
        sizeBytes: 48500000,
        status: 'READY',
        ownerEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        transcript: 'Welcome to the CATALYX V24 architecture review. In this session, we examine the convergence of our 9 primary enterprise domains...',
        chapters: [
          { title: '00:00 - Introduction & V24 Core Mandate', timestampSeconds: 0 },
          { title: '01:15 - 9-Domain Unified Wayfinding System', timestampSeconds: 75 },
          { title: '02:45 - Universal Sharing & Cryptographic Tokens', timestampSeconds: 165 },
          { title: '04:10 - Pesapal v3 Minor Units Ledger Reconciliation', timestampSeconds: 250 },
          { title: '06:30 - Production Certification & Operational Runbook', timestampSeconds: 390 }
        ]
      },
      {
        id: 'media_pesapal_v3_demo',
        title: 'Pesapal v3 Payment Gateway Verification & Webhook Relay',
        description: 'End-to-end trace of card and mobile-money checkouts, IPN verification, and ledger credit',
        mediaType: 'video',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        durationSeconds: 653,
        mimeType: 'video/webm',
        sizeBytes: 52000000,
        status: 'READY',
        ownerEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        transcript: 'Tracing the cryptographic signature validation on incoming Pesapal webhooks...',
        chapters: [
          { title: '00:00 - Order Initialization', timestampSeconds: 0 },
          { title: '01:50 - Consumer Checkout Redirect', timestampSeconds: 110 },
          { title: '03:40 - Webhook IPN Signature Check', timestampSeconds: 220 },
          { title: '05:15 - Double-Entry Ledger Finalization', timestampSeconds: 315 }
        ]
      },
      {
        id: 'media_morning_brief_audio',
        title: 'Executive Morning Intelligence Dispatch (Audio Podcast)',
        description: 'Planetary modeling update, East Asia shipping corridor telemetry, and cross-team velocity',
        mediaType: 'audio',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
        durationSeconds: 372,
        mimeType: 'audio/mp3',
        sizeBytes: 8900000,
        status: 'READY',
        ownerEmail: 'anesthonest81@gmail.com',
        createdAt: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
        transcript: 'Good morning, Commander. Today our planetary fabric models project a 94.2% velocity rating...',
        chapters: [
          { title: '00:00 - Macro Economic Indexing', timestampSeconds: 0 },
          { title: '01:30 - Autonomous Workforce Status', timestampSeconds: 90 },
          { title: '03:00 - Daily Strategic Focus', timestampSeconds: 180 }
        ]
      }
    ];
    this.saveState();
  }

  public getAllMedia(): WorkMediaItem[] {
    return [...this.mediaItems];
  }

  public getMediaById(id: string): WorkMediaItem | undefined {
    return this.mediaItems.find(m => m.id === id);
  }

  public validateFile(file: File): { valid: boolean; reason?: string; mediaType?: 'video' | 'audio' } {
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

    // 100MB client buffer limit
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { valid: false, reason: `File size exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)` };
    }

    if (allowedVideoTypes.includes(file.type)) {
      return { valid: true, mediaType: 'video' };
    }
    if (allowedAudioTypes.includes(file.type)) {
      return { valid: true, mediaType: 'audio' };
    }

    return { 
      valid: false, 
      reason: `Unsupported media format (${file.type || 'unknown'}). Allowed formats: MP4, WebM, MP3, WAV, Ogg.` 
    };
  }

  public async uploadMedia(params: {
    title: string;
    description: string;
    file: File;
    ownerEmail: string;
  }): Promise<{ success: boolean; item?: WorkMediaItem; error?: string }> {
    const validation = this.validateFile(params.file);
    if (!validation.valid || !validation.mediaType) {
      return { success: false, error: validation.reason || 'Invalid media file' };
    }

    // Create object URL for client-side playback
    const objectUrl = URL.createObjectURL(params.file);

    const newItem: WorkMediaItem = {
      id: 'media_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: params.title.trim() || params.file.name,
      description: params.description.trim() || `Uploaded ${params.file.name}`,
      mediaType: validation.mediaType,
      url: objectUrl,
      thumbnailUrl: validation.mediaType === 'video' 
        ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      durationSeconds: 120, // Default preview duration
      mimeType: params.file.type,
      sizeBytes: params.file.size,
      status: 'READY',
      ownerEmail: params.ownerEmail,
      createdAt: new Date().toISOString(),
      chapters: [
        { title: '00:00 - Start of ' + params.title, timestampSeconds: 0 }
      ]
    };

    this.mediaItems.unshift(newItem);
    this.saveState();
    return { success: true, item: newItem };
  }

  public addChapter(mediaId: string, chapter: MediaChapter): boolean {
    const media = this.mediaItems.find(m => m.id === mediaId);
    if (!media) return false;

    media.chapters.push(chapter);
    media.chapters.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    this.saveState();
    return true;
  }

  public deleteMedia(id: string): boolean {
    const index = this.mediaItems.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.mediaItems.splice(index, 1);
    this.saveState();
    return true;
  }
}

export const mediaService = new MediaService();
