import { useState, useEffect, useCallback } from 'react';
import { pwaService } from '../services/pwa/pwaService';

export interface UsePWAResult {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
  dismissInstall: () => void;
  isInstallDismissed: boolean;
}

export function usePWA(): UsePWAResult {
  const [isInstallable, setIsInstallable] = useState<boolean>(pwaService.isInstallable());
  const [isInstalled, setIsInstalled] = useState<boolean>(pwaService.isInstalled());
  const [isOnline, setIsOnline] = useState<boolean>(pwaService.isOnline());
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isInstallDismissed, setIsInstallDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('catalyx_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    const handleInstallable = () => setIsInstallable(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('catalyx-pwa-installable', handleInstallable);
    window.addEventListener('catalyx-pwa-installed', handleInstalled);

    const unsubNetwork = pwaService.onNetworkChange((online) => {
      setIsOnline(online);
    });

    const unsubUpdate = pwaService.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    return () => {
      window.removeEventListener('catalyx-pwa-installable', handleInstallable);
      window.removeEventListener('catalyx-pwa-installed', handleInstalled);
      unsubNetwork();
      unsubUpdate();
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const result = await pwaService.promptInstall();
    if (result && result.outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
  }, []);

  const applyUpdate = useCallback(() => {
    pwaService.applyUpdate();
  }, []);

  const dismissInstall = useCallback(() => {
    setIsInstallDismissed(true);
    try {
      localStorage.setItem('catalyx_pwa_dismissed', 'true');
    } catch {
      // safe storage fallback
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS: pwaService.isIOS(),
    isAndroid: pwaService.isAndroid(),
    isOnline,
    updateAvailable,
    promptInstall,
    applyUpdate,
    dismissInstall,
    isInstallDismissed
  };
}
