import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { RecipeService } from '../../core/services/recipe.service';
import { CATEGORY_LABELS, Recipe } from '../../core/models/recipe.model';

@Component({
  selector: 'app-related-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        query('.related-card', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(80, animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
  template: `
    @if (related().length > 0) {
      <section class="related-section" @slideIn>
        <div class="related-header">
          <h2 class="related-title">🍴 מתכונים דומים</h2>
          <a class="see-all" [routerLink]="['/recipes']">כל המתכונים ←</a>
        </div>

        <div class="related-scroll">
          @for (r of related(); track r.id) {
            <a class="related-card" [routerLink]="['/recipes', r.id]">
              <div class="related-card__img-wrap">
                <img [src]="r.imageUrl" [alt]="r.title" class="related-card__img"
                  loading="lazy" (error)="onImgError($event)" />
                <span class="related-card__category">{{ categoryLabels[r.category] }}</span>
                @if (r.isFavorite) {
                  <span class="related-card__fav">❤️</span>
                }
              </div>
              <div class="related-card__body">
                <h3 class="related-card__title">{{ r.title }}</h3>
                <div class="related-card__meta">
                  <span>⏱️ {{ r.prepTime + r.cookTime }} דק'</span>
                  <span>🍽️ {{ r.servings }}</span>
                </div>
                <div class="related-card__reasons">
                  @for (reason of matchReasons(r); track reason) {
                    <span class="reason-badge">{{ reason }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .related-section {
      padding: 1.5rem 1rem 2rem;
      border-top: 1px solid var(--border);
      max-width: 900px;
      margin: 0 auto;
    }

    .related-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .related-title {
      font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-primary);
    }
    .see-all {
      font-size: 0.82rem; color: var(--primary); font-weight: 600;
      text-decoration: none;
    }
    .see-all:hover { text-decoration: underline; }

    /* Horizontal scroll */
    .related-scroll {
      display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem;
      scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
    }
    .related-scroll::-webkit-scrollbar { height: 4px; }
    .related-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    /* Card */
    .related-card {
      flex: 0 0 200px; border-radius: 14px; overflow: hidden;
      background: var(--card-bg); box-shadow: var(--card-shadow);
      text-decoration: none; color: inherit; scroll-snap-align: start;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex; flex-direction: column;
    }
    .related-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
    }

    .related-card__img-wrap {
      position: relative; height: 130px; overflow: hidden; flex-shrink: 0;
    }
    .related-card__img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.3s ease;
    }
    .related-card:hover .related-card__img { transform: scale(1.06); }

    .related-card__category {
      position: absolute; bottom: 0.4rem; right: 0.4rem;
      background: var(--primary); color: white;
      padding: 0.15rem 0.5rem; border-radius: 20px;
      font-size: 0.68rem; font-weight: 600;
    }
    .related-card__fav {
      position: absolute; top: 0.4rem; left: 0.4rem; font-size: 0.9rem;
    }

    .related-card__body {
      padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1;
    }
    .related-card__title {
      font-size: 0.88rem; font-weight: 700; margin: 0; color: var(--text-primary);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; line-height: 1.35;
    }
    .related-card__meta {
      display: flex; gap: 0.6rem; font-size: 0.75rem; color: var(--text-secondary);
    }

    .related-card__reasons {
      display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: auto;
    }
    .reason-badge {
      background: var(--tag-bg); color: var(--tag-color);
      padding: 0.1rem 0.45rem; border-radius: 20px;
      font-size: 0.68rem; font-weight: 600;
    }
  `],
})
export class RelatedRecipesComponent {
  @Input({ required: true }) recipeId!: string;

  private readonly recipeService = inject(RecipeService);
  readonly categoryLabels = CATEGORY_LABELS;

  readonly related = computed(() => this.recipeService.getSimilar(this.recipeId));

  // מחזיר עד 2 סיבות לדמיון לתצוגה
  matchReasons(candidate: Recipe): string[] {
    const source = this.recipeService.getById(this.recipeId);
    if (!source) return [];
    const reasons: string[] = [];

    if (candidate.category === source.category)
      reasons.push(CATEGORY_LABELS[source.category]);

    const sourceTags = new Set(source.tags.map(t => t.toLowerCase()));
    const sharedTag = candidate.tags.find(t => sourceTags.has(t.toLowerCase()));
    if (sharedTag) reasons.push(sharedTag);

    const sourceIngredients = new Set(source.ingredients.map(i => i.name.toLowerCase()));
    const sharedIng = candidate.ingredients.find(i => sourceIngredients.has(i.name.toLowerCase()));
    if (sharedIng && reasons.length < 2) reasons.push(sharedIng.name);

    return reasons.slice(0, 2);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  }
}
