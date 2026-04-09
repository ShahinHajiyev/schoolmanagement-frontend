import { Injectable } from '@angular/core';

interface StorageItem<T> {
  data: T;
  expire?: number; // absolute Unix timestamp in milliseconds
}

/** Prefix applied to every key to avoid collisions with third-party libraries. */
const KEY_PREFIX = 'sms_';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  /**
   * Stores a value in localStorage with an optional absolute expiry timestamp.
   * @param key       Storage key (prefix is applied automatically).
   * @param value     Value to store.
   * @param expiresAt Optional absolute expiry as Unix timestamp in milliseconds.
   */
  set<T>(key: string, value: T, expiresAt?: number): void {
    const item: StorageItem<T> = { data: value };
    if (expiresAt !== undefined) {
      item.expire = expiresAt;
    }
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(item));
  }

  /**
   * Retrieves a value from localStorage.
   * Returns null if the key is missing, the JSON is corrupt, or the item has expired.
   */
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);
      if (item.expire !== undefined && Date.now() > item.expire) {
        localStorage.removeItem(KEY_PREFIX + key);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  }

  /** Removes a single key from localStorage. */
  remove(key: string): void {
    localStorage.removeItem(KEY_PREFIX + key);
  }
}
