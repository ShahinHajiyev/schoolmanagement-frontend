// src/app/local-storage.service.ts

import { Injectable } from '@angular/core';

interface StorageItem {
  data: any;
  expire?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  /**
   * Sets an item in localStorage with an optional expiration time.
   * @param key - The key under which the value is stored.
   * @param value - The value to be stored.
   * @param expires - Optional expiration time in hours.
   */
  set(key: string, value: any, expires?: number): void {
    const now = new Date();
    const item: StorageItem = { data: value };

    if (expires) {
      const expiryDate = now.getTime() + expires * 60 * 60 * 1000;
      item.expire = expiryDate;
    }

    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Gets an item from localStorage, checking for expiration.
   * @param key - The key of the item to retrieve.
   * @returns The stored value, or null if it has expired or doesn't exist.
   */
  get(key: string): any {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    const item: StorageItem = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (item.expire && now > item.expire) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  }
}
