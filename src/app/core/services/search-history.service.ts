import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'recipe-search-history';
const MAX_ITEMS = 8;

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private readonly _history = signal<string[]>(this.load());

  readonly history = this._history.asReadonly();
  readonly hasHistory = computed(() => this._history().length > 0);

  add(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    this._history.update(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      this.save(updated);
      return updated;
    });
  }

  remove(query: string): void {
    this._history.update(prev => {
      const updated = prev.filter(q => q !== query);
      this.save(updated);
      return updated;
    });
  }

  clear(): void {
    this._history.set([]);
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
