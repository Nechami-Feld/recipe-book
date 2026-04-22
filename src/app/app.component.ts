import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { RecipeService } from './core/services/recipe.service';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  template: `
    <div class="app-shell" [class.dark]="themeService.isDark()">
      <nav class="navbar">
        <div class="navbar__inner">
          <a class="navbar__brand" [routerLink]="['/recipes']">
            <span class="brand-icon">🍳</span>
            <span class="brand-text">חוברת מתכונים</span>
          </a>
          <div class="navbar__links">
            <a class="nav-link" [routerLink]="['/recipes']" routerLinkActive="nav-link--active" [routerLinkActiveOptions]="{exact: true}">
              📋 מתכונים
            </a>
            <a class="nav-link nav-link--fav" [routerLink]="['/favorites']" routerLinkActive="nav-link--active">
              ❤️ מועדפים
              @if (favCount() > 0) {
                <span class="badge">{{ favCount() }}</span>
              }
            </a>
            <a class="nav-link nav-link--add" [routerLink]="['/recipes/new']">
              + חדש
            </a>
          </div>
          <button class="theme-toggle" (click)="themeService.toggle()" [title]="themeService.isDark() ? 'מצב בהיר' : 'מצב כהה'">
            {{ themeService.isDark() ? '☀️' : '🌙' }}
          </button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
      <app-toast />
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; background: var(--bg); transition: background 0.3s; }
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: var(--navbar-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 8px rgba(0,0,0,0.08);
    }
    .navbar__inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 1rem;
      height: 64px;
      display: flex; align-items: center; gap: 1rem;
    }
    .navbar__brand {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; color: var(--text-primary);
      font-weight: 800; font-size: 1.1rem;
      flex-shrink: 0;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-text { display: none; }
    @media (min-width: 480px) { .brand-text { display: block; } }
    .navbar__links { display: flex; align-items: center; gap: 0.25rem; margin-right: auto; }
    .nav-link {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 0.875rem; border-radius: 10px;
      text-decoration: none; color: var(--text-secondary);
      font-weight: 500; font-size: 0.9rem;
      transition: all 0.2s; position: relative;
      white-space: nowrap;
    }
    .nav-link:hover { background: var(--hover-bg); color: var(--text-primary); }
    .nav-link--active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
    .nav-link--add {
      background: var(--primary); color: white !important;
      font-weight: 600;
    }
    .nav-link--add:hover { background: var(--primary-dark); }
    .badge {
      background: #ef4444; color: white;
      border-radius: 50%; width: 18px; height: 18px;
      font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .theme-toggle {
      background: var(--card-bg); border: 2px solid var(--border);
      border-radius: 10px; width: 40px; height: 40px;
      cursor: pointer; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .theme-toggle:hover { border-color: var(--primary); transform: scale(1.05); }
    .main-content { padding-top: 1rem; }
  `],
})
export class AppComponent {
  readonly themeService = inject(ThemeService);
  private readonly recipeService = inject(RecipeService);
  readonly favCount = computed(() => this.recipeService.favorites().length);
}
