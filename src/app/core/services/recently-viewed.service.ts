import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'recipe-recently-viewed';
const MAX_ITEMS = 10;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly _ids = signal<string[]>(this.load());
  readonly ids = this._ids.asReadonly();

  add(id: string): void {
    this._ids.update(prev => {
      const filtered = prev.filter(i => i !== id);
      const updated = [id, ...filtered].slice(0, MAX_ITEMS);
      this.save(updated);
      return updated;
    });
  }

  clear(): void {
    this._ids.set([]);
    this.save([]);
  }

  private load(): string[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
    } catch { return []; }
  }

  private save(data: string[]): void {
    try {
      if (typeof localStorage !== 'undefined')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }
}
