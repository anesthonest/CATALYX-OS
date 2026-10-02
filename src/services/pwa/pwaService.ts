/**
 * CATALYX Production PWA Service
 * Manages service worker lifecycle, installation prompts, offline detection, and updates.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type NetworkStatusCallback = (isOnline: boolean) => void;
export type UpdateAvailableCallback = () => void;

class PWAService {
  private static instance: PWAService;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private networkListeners: Set<NetworkStatusCallback> = new Set();
  private updateListeners: Set<UpdateAvailableCallback> = new UpdateAvailableCallbackSet();
  private isInstalledState: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private init() {
    this.checkIfInstalled();

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new CustomEvent('catalyx-pwa-installable'));
    });

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      this.isInstalledState = true;
      this.deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('catalyx-pwa-installed'));
      console.log('[PWA] CATALYX successfully installed to home screen/desktop.');
    });

    // Network status events
    window.addEventListener('online', () => {
      this.notifyNetworkStatus(true);
    });

    window.addEventListener('offline', () => {
      this.notifyNetworkStatus(false);
    });

    // Register Service Worker in production and preview
    this.registerServiceWorker();
  }

  private checkIfInstalled() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    this.isInstalledState = isStandalone;
  }

  public registerServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported in this browser environment.');
      return;
    }

    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        this.serviceWorkerRegistration = registration;
        console.log('[PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version of CATALYX available.');
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Periodic update check every hour
        setInterval(() => {
          registration.update().catch((err) => {
            console.warn('[PWA] Periodic update check skipped:', err);
          });
        }, 60 * 60 * 1000);
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    });
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled();
  }

  public isInstalled(): boolean {
    return this.isInstalledState;
  }

  public isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
  }

  public isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /android/i.test(window.navigator.userAgent);
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  public async promptInstall(): Promise<{ outcome: 'accepted' | 'dismissed' } | null> {
    if (!this.deferredPrompt) {
      return null;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.isInstalledState = true;
      }
      this.deferredPrompt = null;
      return choice;
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
      return null;
    }
  }

  public applyUpdate(): void {
    if (!this.serviceWorkerRegistration || !this.serviceWorkerRegistration.waiting) {
      window.location.reload();
      return;
    }
    // Post message to waiting service worker to skip waiting
    this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  public onNetworkChange(callback: NetworkStatusCallback): () => void {
    this.networkListeners.add(callback);
    return () => this.networkListeners.delete(callback);
  }

  private notifyNetworkStatus(isOnline: boolean) {
    this.networkListeners.forEach((callback) => {
      try {
        callback(isOnline);
      } catch (err) {
        console.error('[PWA] Network status listener error:', err);
      }
    });
  }

  public onUpdateAvailable(callback: UpdateAvailableCallback): () => void {
    this.updateListeners.add(callback);
    return () => this.updateListeners.delete(callback);
  }

  private notifyUpdateAvailable() {
    this.updateListeners.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error('[PWA] Update listener error:', err);
      }
    });
  }
}

class UpdateAvailableCallbackSet extends Set<UpdateAvailableCallback> {}

export const pwaService = PWAService.getInstance();
