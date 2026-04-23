import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Recipe, CATEGORY_LABELS } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <article class="recipe-card" @cardEnter [routerLink]="['/recipes', recipe.id]">
      <div class="recipe-card__image-wrap">
        <img [src]="recipe.imageUrl" [alt]="recipe.title" class="recipe-card__image" loading="lazy"
          (error)="onImgError($event)" />
        <div class="recipe-card__overlay">
          <span class="recipe-card__category">{{ categoryLabels[recipe.category] }}</span>
        </div>
        <button class="recipe-card__fav" (click)="onFavorite($event)" [class.active]="recipe.isFavorite"
          [attr.aria-label]="recipe.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'">
          {{ recipe.isFavorite ? '❤️' : '🤍' }}
        </button>
      </div>
      <div class="recipe-card__body">
        <h3 class="recipe-card__title">{{ recipe.title }}</h3>
        <p class="recipe-card__desc">{{ recipe.description }}</p>
        <div class="recipe-card__meta">
          @if (recipe.prepTime + recipe.cookTime > 0) {
            <span class="meta-item" title="זמן הכנה">⏱️ {{ recipe.prepTime + recipe.cookTime }} דק'</span>
          }
          @if (recipe.servings > 0) {
            <span class="meta-item" title="מנות">🍽️ {{ recipe.servings }}</span>
          }
          <span class="meta-item" title="רכיבים">🥗 {{ recipe.ingredients.length }}</span>
        </div>
        @if (recipe.tags.length > 0) {
          <div class="recipe-card__tags">
            @for (tag of recipe.tags.slice(0, 3); track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
        }
      </div>
      <div class="recipe-card__actions">
        <button class="btn-icon" (click)="onEdit($event)" title="עריכה">✏️</button>
        <button class="btn-icon btn-icon--danger" (click)="onDelete($event)" title="מחיקה">🗑️</button>
      </div>
    </article>
  `,
  styles: [`
    .recipe-card {
      background: var(--card-bg);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      position: relative;
    }
    .recipe-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
    }
    .recipe-card__image-wrap {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    .recipe-card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .recipe-card:hover .recipe-card__image { transform: scale(1.05); }
    .recipe-card__overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.6));
      padding: 1rem 0.75rem 0.5rem;
    }
    .recipe-card__category {
      background: var(--primary);
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .recipe-card__fav {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      backdrop-filter: blur(4px);
    }
    .recipe-card__fav:hover { transform: scale(1.2); }
    .recipe-card__body {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .recipe-card__title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
      line-height: 1.3;
    }
    .recipe-card__desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .recipe-card__meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .meta-item {
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .recipe-card__tags {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: auto;
    }
    .tag {
      background: var(--tag-bg);
      color: var(--tag-color);
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 500;
    }
    .recipe-card__actions {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 1rem 0.75rem;
      border-top: 1px solid var(--border);
    }
    .btn-icon {
      background: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.35rem 0.6rem;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.15s;
      color: var(--text-secondary);
    }
    .btn-icon:hover { background: var(--hover-bg); }
    .btn-icon--danger:hover { background: #fee2e2; border-color: #fca5a5; }
  `],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Output() favoriteToggled = new EventEmitter<string>();
  @Output() editClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();

  readonly categoryLabels = CATEGORY_LABELS;

  onFavorite(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.favoriteToggled.emit(this.recipe.id);
  }

  onEdit(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.editClicked.emit(this.recipe.id);
  }

  onDelete(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.deleteClicked.emit(this.recipe.id);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  }
}
