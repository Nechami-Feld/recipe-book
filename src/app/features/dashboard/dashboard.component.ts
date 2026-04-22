import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { RecipeService } from '../../core/services/recipe.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { CATEGORY_LABELS, RecipeCategory } from '../../core/models/recipe.model';

const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  breakfast: '#f59e0b',
  lunch:     '#3b82f6',
  dinner:    '#8b5cf6',
  dessert:   '#ec4899',
  snack:     '#10b981',
  drink:     '#06b6d4',
  other:     '#94a3b8',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.stat-card', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(80, animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
  template: `
    <div class="dashboard" @fadeUp>
      <div class="dash-header">
        <div>
          <h1 class="dash-title">📊 הדשבורד שלי</h1>
          <p class="dash-subtitle">סקירה כללית של חוברת המתכונים</p>
        </div>
        <a class="btn-primary" [routerLink]="['/recipes/new']">+ מתכון חדש</a>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid" @staggerCards>
        <div class="stat-card stat-card--purple">
          <div class="stat-card__icon">📖</div>
          <div class="stat-card__value">{{ totalRecipes() }}</div>
          <div class="stat-card__label">סה"כ מתכונים</div>
        </div>
        <div class="stat-card stat-card--red">
          <div class="stat-card__icon">❤️</div>
          <div class="stat-card__value">{{ totalFavorites() }}</div>
          <div class="stat-card__label">מועדפים</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-card__icon">🗂️</div>
          <div class="stat-card__value">{{ activeCategories() }}</div>
          <div class="stat-card__label">קטגוריות פעילות</div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card__icon">👁️</div>
          <div class="stat-card__value">{{ recentlyViewedRecipes().length }}</div>
          <div class="stat-card__label">נצפו לאחרונה</div>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Category Chart -->
        <section class="dash-card" @fadeUp>
          <h2 class="section-title">🗂️ מתכונים לפי קטגוריה</h2>
          <div class="category-chart">
            @for (cat of categoryStats(); track cat.key) {
              <div class="cat-row">
                <div class="cat-info">
                  <span class="cat-dot" [style.background]="cat.color"></span>
                  <span class="cat-name">{{ cat.label }}</span>
                  <span class="cat-count">{{ cat.count }}</span>
                </div>
                <div class="cat-bar-wrap">
                  <div
                    class="cat-bar"
                    [style.width.%]="cat.percent"
                    [style.background]="cat.color"
                  ></div>
                </div>
              </div>
            }
          </div>

          <!-- Donut chart -->
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              @for (seg of donutSegments(); track seg.key) {
                <circle
                  class="donut-seg"
                  cx="60" cy="60" r="45"
                  [style.stroke]="seg.color"
                  [style.stroke-dasharray]="seg.dash"
                  [style.stroke-dashoffset]="seg.offset"
                />
              }
              <text x="60" y="56" class="donut-center-num">{{ totalRecipes() }}</text>
              <text x="60" y="70" class="donut-center-label">מתכונים</text>
            </svg>
            <div class="donut-legend">
              @for (cat of categoryStats().slice(0, 4); track cat.key) {
                <div class="legend-item">
                  <span class="legend-dot" [style.background]="cat.color"></span>
                  <span class="legend-text">{{ cat.label }}</span>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Right column -->
        <div class="dash-right">
          <!-- Top Favorites -->
          <section class="dash-card" @fadeUp>
            <div class="section-header">
              <h2 class="section-title">❤️ מועדפים</h2>
              <a class="see-all" [routerLink]="['/favorites']">הכל ←</a>
            </div>
            @if (topFavorites().length === 0) {
              <p class="empty-hint">עדיין אין מועדפים</p>
            } @else {
              <ul class="recipe-mini-list">
                @for (r of topFavorites(); track r.id) {
                  <li class="recipe-mini-item" [routerLink]="['/recipes', r.id]">
                    <img [src]="r.imageUrl" [alt]="r.title" class="mini-img" (error)="onImgError($event)" />
                    <div class="mini-info">
                      <span class="mini-title">{{ r.title }}</span>
                      <span class="mini-meta">{{ categoryLabels[r.category] }} · {{ r.prepTime + r.cookTime }} דק'</span>
                    </div>
                    <span class="mini-arrow">←</span>
                  </li>
                }
              </ul>
            }
          </section>

          <!-- Recently Viewed -->
          <section class="dash-card" @fadeUp>
            <div class="section-header">
              <h2 class="section-title">🕐 נצפו לאחרונה</h2>
              @if (recentlyViewedRecipes().length > 0) {
                <button class="see-all" (click)="clearRecent()">נקה</button>
              }
            </div>
            @if (recentlyViewedRecipes().length === 0) {
              <p class="empty-hint">עדיין לא צפית במתכונים</p>
            } @else {
              <ul class="recipe-mini-list">
                @for (r of recentlyViewedRecipes(); track r.id) {
                  <li class="recipe-mini-item" [routerLink]="['/recipes', r.id]">
                    <img [src]="r.imageUrl" [alt]="r.title" class="mini-img" (error)="onImgError($event)" />
                    <div class="mini-info">
                      <span class="mini-title">{{ r.title }}</span>
                      <span class="mini-meta">{{ categoryLabels[r.category] }} · {{ r.prepTime + r.cookTime }} דק'</span>
                    </div>
                    <span class="mini-arrow">←</span>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      </div>

      <!-- Quick actions -->
      <section class="dash-card quick-actions" @fadeUp>
        <h2 class="section-title">⚡ פעולות מהירות</h2>
        <div class="actions-row">
          <a class="action-btn" [routerLink]="['/recipes/new']">
            <span class="action-icon">➕</span>
            <span>מתכון חדש</span>
          </a>
          <a class="action-btn" [routerLink]="['/favorites']">
            <span class="action-icon">❤️</span>
            <span>המועדפים</span>
          </a>
          <a class="action-btn" [routerLink]="['/recipes']" [queryParams]="{category: 'dinner'}">
            <span class="action-icon">🍽️</span>
            <span>ארוחות ערב</span>
          </a>
          <a class="action-btn" [routerLink]="['/recipes']" [queryParams]="{category: 'dessert'}">
            <span class="action-icon">🍰</span>
            <span>קינוחים</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }

    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .dash-title { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; margin: 0; color: var(--text-primary); }
    .dash-subtitle { color: var(--text-secondary); margin: 0.25rem 0 0; font-size: 0.95rem; }
    .btn-primary {
      background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem;
      border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;
      text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;
      transition: background 0.2s, transform 0.1s; white-space: nowrap;
    }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

    /* Stat Cards */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    .stat-card {
      border-radius: 16px; padding: 1.25rem 1rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      box-shadow: var(--card-shadow); transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
    .stat-card--purple { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .stat-card--red    { background: linear-gradient(135deg, #fee2e2, #fecaca); }
    .stat-card--blue   { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .stat-card--green  { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .dark .stat-card--purple { background: linear-gradient(135deg, #2e1065, #3b0764); }
    .dark .stat-card--red    { background: linear-gradient(135deg, #450a0a, #7f1d1d); }
    .dark .stat-card--blue   { background: linear-gradient(135deg, #0c1a3a, #1e3a5f); }
    .dark .stat-card--green  { background: linear-gradient(135deg, #052e16, #14532d); }
    .stat-card__icon  { font-size: 1.8rem; }
    .stat-card__value { font-size: 2rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
    .stat-card__label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }

    /* Main grid */
    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 768px) { .dash-grid { grid-template-columns: 1fr; } }
    .dash-right { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Cards */
    .dash-card {
      background: var(--card-bg); border-radius: 16px; padding: 1.25rem;
      box-shadow: var(--card-shadow);
    }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { font-size: 1rem; font-weight: 700; margin: 0 0 1rem; color: var(--text-primary); }
    .section-header .section-title { margin: 0; }
    .see-all { font-size: 0.82rem; color: var(--primary); font-weight: 600; text-decoration: none; background: none; border: none; cursor: pointer; font-family: inherit; }
    .see-all:hover { text-decoration: underline; }

    /* Category chart */
    .category-chart { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; }
    .cat-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .cat-info { display: flex; align-items: center; gap: 0.5rem; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .cat-name { font-size: 0.82rem; color: var(--text-secondary); flex: 1; }
    .cat-count { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
    .cat-bar-wrap { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .cat-bar { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); min-width: 4px; }

    /* Donut */
    .donut-wrap { display: flex; align-items: center; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
    .donut-svg { width: 120px; height: 120px; transform: rotate(-90deg); flex-shrink: 0; }
    .donut-seg { fill: none; stroke-width: 18; transition: stroke-dasharray 0.8s ease; }
    .donut-center-num { font-size: 22px; font-weight: 900; fill: var(--text-primary); text-anchor: middle; transform: rotate(90deg); transform-origin: 60px 60px; }
    .donut-center-label { font-size: 9px; fill: var(--text-secondary); text-anchor: middle; transform: rotate(90deg); transform-origin: 60px 60px; }
    .donut-legend { display: flex; flex-direction: column; gap: 0.4rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-text { font-size: 0.78rem; color: var(--text-secondary); }

    /* Mini recipe list */
    .recipe-mini-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .recipe-mini-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.5rem; border-radius: 10px; cursor: pointer;
      transition: background 0.15s; text-decoration: none; color: inherit;
    }
    .recipe-mini-item:hover { background: var(--hover-bg); }
    .mini-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .mini-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .mini-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini-meta { font-size: 0.75rem; color: var(--text-secondary); }
    .mini-arrow { color: var(--text-secondary); font-size: 0.8rem; flex-shrink: 0; }
    .empty-hint { color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem 0; margin: 0; }

    /* Quick actions */
    .quick-actions .section-title { margin-bottom: 1rem; }
    .actions-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      padding: 1rem 1.25rem; border-radius: 12px; border: 2px solid var(--border);
      background: var(--card-bg); color: var(--text-secondary); text-decoration: none;
      font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      min-width: 80px;
    }
    .action-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); transform: translateY(-2px); }
    .action-icon { font-size: 1.5rem; }
  `],
})
export class DashboardComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly recentlyViewedService = inject(RecentlyViewedService);

  readonly categoryLabels = CATEGORY_LABELS;

  readonly totalRecipes = computed(() => this.recipeService.recipes().length);
  readonly totalFavorites = computed(() => this.recipeService.favorites().length);

  readonly activeCategories = computed(() =>
    new Set(this.recipeService.recipes().map(r => r.category)).size
  );

  readonly topFavorites = computed(() =>
    this.recipeService.favorites().slice(0, 5)
  );

  readonly recentlyViewedRecipes = computed(() =>
    this.recentlyViewedService.ids()
      .map(id => this.recipeService.getById(id))
      .filter((r): r is NonNullable<typeof r> => !!r)
      .slice(0, 5)
  );

  readonly categoryStats = computed(() => {
    const recipes = this.recipeService.recipes();
    const total = recipes.length || 1;
    const counts = new Map<RecipeCategory, number>();
    recipes.forEach(r => counts.set(r.category, (counts.get(r.category) ?? 0) + 1));
    return (Object.keys(CATEGORY_LABELS) as RecipeCategory[])
      .map(key => ({
        key,
        label: CATEGORY_LABELS[key],
        count: counts.get(key) ?? 0,
        color: CATEGORY_COLORS[key],
        percent: ((counts.get(key) ?? 0) / total) * 100,
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  // Donut chart segments (SVG stroke-dasharray trick)
  // circumference = 2π×45 ≈ 282.7
  readonly donutSegments = computed(() => {
    const circ = 282.7;
    const total = this.totalRecipes() || 1;
    let offset = 0;
    return this.categoryStats().map(cat => {
      const dash = (cat.count / total) * circ;
      const seg = { key: cat.key, color: cat.color, dash: `${dash} ${circ - dash}`, offset: -offset };
      offset += dash;
      return seg;
    });
  });

  clearRecent(): void { this.recentlyViewedService.clear(); }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  }
}
