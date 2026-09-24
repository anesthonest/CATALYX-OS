/**
 * CATALYX V26 Safe Storage & Resilience Utility
 * Prevents crashes caused by corrupt localStorage, quota exceeded errors,
 * malformed JSON, and unexpected types.
 */

class SafeStorageEngine {
  private memoryStore = new Map<string, string>();

  /**
   * Safely retrieve and parse a JSON item from localStorage.
   * If parsing fails or data is corrupt, returns the fallback value.
   */
  get<T>(key: string, fallback: T, validator?: (data: unknown) => boolean): T {
    try {
      let raw: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        raw = localStorage.getItem(key);
      } else {
        raw = this.memoryStore.get(key) ?? null;
      }
      if (raw === null || raw === undefined || raw.trim() === '') {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      if (validator && !validator(parsed)) {
        console.warn(`[safeStorage] Data at key "${key}" failed validation, using fallback.`);
        return fallback;
      }
      return parsed as T;
    } catch (err) {
      console.warn(`[safeStorage] Failed to read/parse key "${key}", using fallback.`, err);
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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, serialized);
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
   * Safely remove an item.
   */
  remove(key: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
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
   * Check if localStorage is operational.
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__catalyx_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const safeStorage = new SafeStorageEngine();
