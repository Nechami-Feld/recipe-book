import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { RecipeCardComponent } from './components/recipe-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { CATEGORY_LABELS, RecipeCategory } from '../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RecipeCardComponent, SkeletonComponent],
  template: `
    <div class="page-container">
      <!-- Hero -->
      <section class="hero">
        <div class="hero__content">
          <h1 class="hero__title">🍳 חוברת המתכונים שלי</h1>
          <p class="hero__subtitle">{{ recipeService.recipes().length }} מתכונים מחכים לך</p>
        </div>
        <button class="btn-primary" [routerLink]="['/recipes/new']">
          <span>+</span> מתכון חדש
        </button>
      </section>

      <!-- Search & Filter -->
      <section class="filters">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            class="search-input"
            type="text"
            placeholder="חפש מתכון, רכיב, תגית..."
            [ngModel]="recipeService.searchQuery()"
            (ngModelChange)="recipeService.setSearch($event)"
          />
          @if (recipeService.searchQuery()) {
            <button class="search-clear" (click)="recipeService.setSearch('')">✕</button>
          }
        </div>
        <div class="category-chips">
          <button
            class="chip"
            [class.chip--active]="recipeService.selectedCategory() === 'all'"
            (click)="recipeService.setCategory('all')"
          >כל המתכונים</button>
          @for (cat of categories; track cat.value) {
            <button
              class="chip"
              [class.chip--active]="recipeService.selectedCategory() === cat.value"
              (click)="recipeService.setCategory(cat.value)"
            >{{ cat.label }}</button>
          }
        </div>
      </section>

      <!-- Results count -->
      <div class="results-info">
        @if (recipeService.searchQuery() || recipeService.selectedCategory() !== 'all') {
          <span>{{ recipeService.filteredRecipes().length }} תוצאות</span>
        }
      </div>

      <!-- Grid -->
      @if (loading()) {
        <div class="recipe-grid">
          @for (i of skeletons; track i) {
            <div class="skeleton-card">
              <app-skeleton height="200px" />
              <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <app-skeleton height="1.2rem" width="70%" />
                <app-skeleton height="0.9rem" />
                <app-skeleton height="0.9rem" width="80%" />
              </div>
            </div>
          }
        </div>
      } @else if (recipeService.filteredRecipes().length === 0) {
        <div class="empty-state">
          <div class="empty-state__icon">🍽️</div>
          <h3>לא נמצאו מתכונים</h3>
          <p>נסה לשנות את החיפוש או הוסף מתכון חדש</p>
          <button class="btn-primary" [routerLink]="['/recipes/new']">הוסף מתכון</button>
        </div>
      } @else {
        <div class="recipe-grid">
          @for (recipe of recipeService.filteredRecipes(); track recipe.id) {
            <app-recipe-card
              [recipe]="recipe"
              (favoriteToggled)="onFavoriteToggle($event)"
              (editClicked)="onEdit($event)"
              (deleteClicked)="onDelete($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; }
    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .hero__title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin: 0; color: var(--text-primary); }
    .hero__subtitle { color: var(--text-secondary); margin: 0.25rem 0 0; font-size: 0.95rem; }
    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.1s;
      text-decoration: none;
    }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
    .filters { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon { position: absolute; right: 1rem; font-size: 1rem; pointer-events: none; }
    .search-input {
      width: 100%;
      padding: 0.875rem 2.75rem 0.875rem 2.5rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 1rem;
      background: var(--input-bg);
      color: var(--text-primary);
      transition: border-color 0.2s;
      direction: rtl;
    }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .search-clear {
      position: absolute;
      left: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 1rem;
      padding: 0.25rem;
    }
    .category-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .chip {
      padding: 0.4rem 1rem;
      border-radius: 20px;
      border: 2px solid var(--border);
      background: var(--card-bg);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .chip:hover { border-color: var(--primary); color: var(--primary); }
    .chip--active { background: var(--primary); border-color: var(--primary); color: white; }
    .results-info { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; min-height: 1.2rem; }
    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .skeleton-card {
      background: var(--card-bg);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }
    .empty-state__icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.3rem; color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { margin-bottom: 1.5rem; }
  `],
})
export class RecipeListComponent {
  readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly skeletons = [1, 2, 3, 4, 5, 6];

  readonly categories = (Object.entries(CATEGORY_LABELS) as [RecipeCategory, string][]).map(
    ([value, label]) => ({ value, label })
  );

  onFavoriteToggle(id: string): void {
    this.recipeService.toggleFavorite(id);
    const recipe = this.recipeService.getById(id);
    this.toastService.success(recipe?.isFavorite ? 'נוסף למועדפים ❤️' : 'הוסר מהמועדפים');
  }

  onEdit(id: string): void {
    this.router.navigate(['/recipes', id, 'edit']);
  }

  onDelete(id: string): void {
    const recipe = this.recipeService.getById(id);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'מחיקת מתכון',
        message: `האם למחוק את "${recipe?.title}"? פעולה זו אינה ניתנת לביטול.`,
        confirmText: 'מחק',
      },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.recipeService.delete(id);
        this.toastService.success('המתכון נמחק בהצלחה');
      }
    });
  }
}
