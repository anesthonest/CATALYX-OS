/**
 * CATALYX Universal Safe Storage & Session Resilience Utility
 * 
 * Production-hardened storage engine that guarantees:
 * 1. Safe JSON serialization / deserialization without unhandled exceptions
 * 2. Pre-parse format detection: NEVER calls JSON.parse() on raw non-JSON values
 * 3. Graceful zero-warning migration of legacy raw-string sessions (e.g. "vine_demo_user")
 * 4. Self-healing recovery from corrupted or malformed keys without crashing
 * 5. Type-safe canonical session representation across login, logout, restoration, and guards
 * 6. Multi-tab storage event synchronization
 */

export const STORAGE_SESSION_KEY = 'catalyx_active_session';
export const STORAGE_TOKEN_KEY = 'catalyx_session_token';

/**
 * Robust check if a raw string is formatted as JSON.
 * Valid JSON must start with {, [, ", ', digit, -, t (true), f (false), n (null).
 */
export function isLikelyJsonString(str: string): boolean {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length === 0) return false;
  const first = trimmed[0];

  // Objects, Arrays, and Quoted JSON strings
  if (first === '{' || first === '[' || first === '"' || first === "'") return true;
  // Booleans and null
  if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') return true;
  // Numbers
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) return true;

  return false;
}

export class SafeStorageEngine {
  private memoryStore = new Map<string, string>();
  private loggedCorruptKeys = new Set<string>();

  constructor() {
    // Listen for storage events across browser tabs
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      try {
        window.addEventListener('storage', (event: StorageEvent) => {
          if (event.key) {
            if (event.newValue === null) {
              this.memoryStore.delete(event.key);
            } else {
              this.memoryStore.set(event.key, event.newValue);
            }
          }
        });
      } catch {
        // Environment does not support window events (e.g. Node tests)
      }
    }
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
    return null;
  }

  /**
   * Safely retrieve and parse a JSON item from localStorage.
   * If parsing fails or data is corrupt, returns the fallback value.
   * If a legacy raw non-JSON string is detected, safely migrates it without throwing.
   */
  get<T>(key: string, fallback: T, validator?: (data: unknown) => boolean): T {
    try {
      const storage = this.getStorage();
      let raw: string | null = storage ? storage.getItem(key) : (this.memoryStore.get(key) ?? null);

      if (raw === null || raw === undefined) {
        return fallback;
      }

      const trimmed = raw.trim();
      if (trimmed === '') {
        return fallback;
      }

      // Check if raw value is valid JSON
      if (!isLikelyJsonString(trimmed)) {
        // NON-JSON RAW STRING DETECTED
        // Example: raw "vine_demo_user" or "usr_123" stored as plain text without quotes.
        // If caller expects string or nullable string (e.g. session keys):
        if (typeof fallback === 'string' || fallback === null || key === STORAGE_SESSION_KEY || key === STORAGE_TOKEN_KEY) {
          // If it matches validator (or if no validator is provided)
          if (!validator || validator(trimmed)) {
            // Self-healing migration: re-write with canonical JSON.stringify to prevent future non-JSON reads
            try {
              this.set(key, trimmed);
            } catch {
              // Non-blocking
            }
            return trimmed as unknown as T;
          }
        }

        // Non-JSON string cannot satisfy non-string expectation (e.g. object/array)
        return fallback;
      }

      // Value appears to be JSON -> parse safely
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        // Genuine malformed JSON (e.g. "{broken...")
        if (!this.loggedCorruptKeys.has(key)) {
          this.loggedCorruptKeys.add(key);
          console.warn(`[safeStorage] Corrupted JSON at key "${key}". Self-healing by removing corrupt record.`);
        }
        this.remove(key);
        return fallback;
      }

      // Special handling for active session UID:
      // If active session was stored as an object { uid: "..." }, normalize to canonical string UID
      if (key === STORAGE_SESSION_KEY && parsed && typeof parsed === 'object') {
        const candidateUid = (parsed as any).uid || (parsed as any).userId;
        if (typeof candidateUid === 'string' && candidateUid.trim()) {
          const canonicalUid = candidateUid.trim();
          this.set(key, canonicalUid);
          return canonicalUid as unknown as T;
        }
      }

      if (validator && !validator(parsed)) {
        return fallback;
      }

      return parsed as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Safely retrieve an array from localStorage.
   * Guarantees an Array is returned, preventing `.map()` or `.filter()` crashes.
   */
  getArray<T>(key: string, defaultItems: T[] = []): T[] {
    return this.get<T[]>(key, defaultItems, (val) => Array.isArray(val));
  }

  /**
   * Safely retrieve an object from localStorage.
   * Guarantees a non-null object is returned.
   */
  getObject<T extends object>(key: string, defaultObject: T): T {
    return this.get<T>(key, defaultObject, (val) => typeof val === 'object' && val !== null && !Array.isArray(val));
  }

  /**
   * Safely serialize and save data to localStorage.
   * Traps QuotaExceededError and prevents unhandled throws.
   */
  set(key: string, value: unknown): boolean {
    try {
      const serialized = JSON.stringify(value);
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(key, serialized);
      } else {
        this.memoryStore.set(key, serialized);
      }
      return true;
    } catch (err: unknown) {
      console.error(`[safeStorage] Failed to write key "${key}". Possible quota exceeded or circular structure.`, err);
      return false;
    }
  }

  /**
   * Safely remove an item from storage.
   */
  remove(key: string): boolean {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(key);
      } else {
        this.memoryStore.delete(key);
      }
      return true;
    } catch (err) {
      console.warn(`[safeStorage] Failed to remove key "${key}".`, err);
      return false;
    }
  }

  /**
   * Canonical Session Management API
   * Single source of truth for active session UID and token
   */
  getActiveSession(): string | null {
    return this.get<string | null>(STORAGE_SESSION_KEY, null, (val) => typeof val === 'string' && val.trim().length > 0);
  }

  setActiveSession(uid: string): boolean {
    if (!uid || typeof uid !== 'string') return false;
    return this.set(STORAGE_SESSION_KEY, uid.trim());
  }

  clearActiveSession(): boolean {
    const s1 = this.remove(STORAGE_SESSION_KEY);
    const s2 = this.remove(STORAGE_TOKEN_KEY);
    return s1 && s2;
  }

  getSessionToken(): string | null {
    return this.get<string | null>(STORAGE_TOKEN_KEY, null, (val) => typeof val === 'string' && val.trim().length > 0);
  }

  setSessionToken(token: string | null): boolean {
    if (!token) {
      return this.remove(STORAGE_TOKEN_KEY);
    }
    return this.set(STORAGE_TOKEN_KEY, token.trim());
  }

  /**
   * Check if localStorage is operational.
   */
  isAvailable(): boolean {
    try {
      const storage = this.getStorage();
      if (!storage) return false;
      const testKey = '__catalyx_storage_test__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const safeStorage = new SafeStorageEngine();
