/**
 * CATALYX Hardware & Device Compatibility Engine
 * Gracefully detects device capabilities, screen form factors, touch/pointer inputs,
 * and provides friendly fallbacks for missing peripherals.
 */

export type DeviceFormFactor = 'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape' | 'desktop' | 'ultrawide';

export interface HardwareCapabilities {
  hasTouch: boolean;
  hasMouse: boolean;
  hasMicrophone: boolean;
  hasCamera: boolean;
  hasAudioOutput: boolean;
  hasClipboard: boolean;
  hasFilePicker: boolean;
  formFactor: DeviceFormFactor;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isCoarsePointer: boolean;
  effectiveNetworkType: string;
}

class HardwareCompatibilityService {
  private static instance: HardwareCompatibilityService;

  private constructor() {}

  public static getInstance(): HardwareCompatibilityService {
    if (!HardwareCompatibilityService.instance) {
      HardwareCompatibilityService.instance = new HardwareCompatibilityService();
    }
    return HardwareCompatibilityService.instance;
  }

  public getFormFactor(): DeviceFormFactor {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height >= width;

    if (width < 640) {
      return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width <= 1024) {
      return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
    } else if (width <= 1920) {
      return 'desktop';
    } else {
      return 'ultrawide';
    }
  }

  public getCapabilities(): HardwareCapabilities {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        hasMouse: true,
        hasMicrophone: false,
        hasCamera: false,
        hasAudioOutput: true,
        hasClipboard: false,
        hasFilePicker: true,
        formFactor: 'desktop',
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        isCoarsePointer: false,
        effectiveNetworkType: '4g'
      };
    }

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasMouse = window.matchMedia('(pointer: fine)').matches || !hasTouch;
    const hasClipboard = Boolean(navigator.clipboard && navigator.clipboard.writeText);
    const hasFilePicker = typeof window.FileReader !== 'undefined';
    const orientation = window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const effectiveNetworkType = connection?.effectiveType || (navigator.onLine ? '4g' : 'offline');

    return {
      hasTouch,
      hasMouse,
      hasMicrophone: Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasCamera: Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasAudioOutput: typeof window.AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      hasClipboard,
      hasFilePicker,
      formFactor: this.getFormFactor(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation,
      isCoarsePointer,
      effectiveNetworkType
    };
  }

  /**
   * Request Microphone stream with friendly fallback explanations
   */
  public async requestMicrophone(): Promise<{ stream: MediaStream | null; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return {
        stream: null,
        error: "Microphone access isn't available on this device or browser. You can continue using direct keyboard input."
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { stream };
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return {
          stream: null,
          error: 'Microphone permission was not granted. Please enable microphone permissions in your browser bar, or continue using text input.'
        };
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        return {
          stream: null,
          error: "No microphone detected on this device. You can continue using text input."
        };
      }
      return {
        stream: null,
        error: "Unable to connect to microphone. You can continue using text input."
      };
    }
  }

  /**
   * Safe Clipboard Write with fallback to textarea selection
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback below
      }
    }

    // Classic textarea fallback for older browsers or insecure contexts
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }
}

export const hardwareService = HardwareCompatibilityService.getInstance();
