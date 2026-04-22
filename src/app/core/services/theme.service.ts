import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _isDark = signal(this.getInitialTheme());
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.setAttribute('data-theme', this._isDark() ? 'dark' : 'light');
        localStorage.setItem('theme', this._isDark() ? 'dark' : 'light');
      }
    });
  }

  toggle(): void {
    this._isDark.update(v => !v);
  }

  private getInitialTheme(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
}
