import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { SearchHistoryService } from '../../core/services/search-history.service';
import { RecipeCardComponent } from './components/recipe-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { CATEGORY_LABELS, RecipeCategory } from '../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RecipeCardComponent, SkeletonComponent],
  animations: [
    trigger('dropdown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
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
        <div class="search-wrap" #searchWrap>
          <span class="search-icon">🔍</span>
          <input
            #searchInput
            class="search-input"
            type="text"
            placeholder="חפש מתכון, רכיב, תגית..."
            autocomplete="off"
            [ngModel]="recipeService.searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            (focus)="onFocus()"
            (keydown.enter)="onEnter()"
            (keydown.escape)="closeDropdown()"
            (keydown.arrowdown)="onArrowDown()"
            (keydown.arrowup)="onArrowUp()"
          />
          @if (recipeService.searchQuery()) {
            <button class="search-clear" (click)="clearSearch()" title="נקה חיפוש">✕</button>
          }

          <!-- History Dropdown -->
          @if (showDropdown() && historyService.hasHistory()) {
            <div class="history-dropdown" @dropdown>
              <div class="history-header">
                <span class="history-title">🕐 חיפושים אחרונים</span>
                <button class="clear-all-btn" (click)="clearAll()">נקה הכל</button>
              </div>
              <ul class="history-list">
                @for (item of historyService.history(); track item; let i = $index) {
                  <li
                    class="history-item"
                    [class.history-item--active]="activeIndex() === i"
                    (mouseenter)="activeIndex.set(i)"
                    (click)="selectHistory(item)"
                  >
                    <span class="history-item__icon">🔍</span>
                    <span class="history-item__text">{{ item }}</span>
                    <button
                      class="history-item__remove"
                      (click)="removeItem($event, item)"
                      title="הסר"
                    >✕</button>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Recent searches as chips (when no active search) -->
        @if (!recipeService.searchQuery() && historyService.hasHistory()) {
          <div class="recent-chips">
            <span class="recent-label">אחרונים:</span>
            @for (item of historyService.history().slice(0, 4); track item) {
              <button class="recent-chip" (click)="selectHistory(item)">{{ item }}</button>
            }
          </div>
        }

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

      <!-- Results info -->
      <div class="results-info">
        @if (recipeService.searchQuery()) {
          <span>
            {{ recipeService.filteredRecipes().length }} תוצאות עבור
            <strong>"{{ recipeService.searchQuery() }}"</strong>
          </span>
        } @else if (recipeService.selectedCategory() !== 'all') {
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
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    }
    .hero__title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin: 0; color: var(--text-primary); }
    .hero__subtitle { color: var(--text-secondary); margin: 0.25rem 0 0; font-size: 0.95rem; }

    .btn-primary {
      background: var(--primary); color: white; border: none;
      padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 1rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
      transition: background 0.2s, transform 0.1s; text-decoration: none;
    }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

    .filters { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

    /* Search */
    .search-wrap { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; right: 1rem; font-size: 1rem; pointer-events: none; z-index: 1; }
    .search-input {
      width: 100%; padding: 0.875rem 2.75rem 0.875rem 2.5rem;
      border: 2px solid var(--border); border-radius: 12px;
      font-size: 1rem; background: var(--input-bg); color: var(--text-primary);
      transition: border-color 0.2s, border-radius 0.2s; direction: rtl;
      font-family: inherit;
    }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .search-input.open { border-radius: 12px 12px 0 0; border-bottom-color: var(--border); }
    .search-clear {
      position: absolute; left: 1rem; background: none; border: none;
      cursor: pointer; color: var(--text-secondary); font-size: 1rem; padding: 0.25rem;
      z-index: 1;
    }

    /* History Dropdown */
    .history-dropdown {
      position: absolute; top: 100%; right: 0; left: 0; z-index: 200;
      background: var(--card-bg); border: 2px solid var(--primary);
      border-top: none; border-radius: 0 0 12px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .history-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 1rem; border-bottom: 1px solid var(--border);
      background: var(--hover-bg);
    }
    .history-title { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
    .clear-all-btn {
      background: none; border: none; cursor: pointer;
      font-size: 0.78rem; color: var(--primary); font-weight: 600;
      padding: 0.2rem 0.4rem; border-radius: 4px; transition: background 0.15s;
      font-family: inherit;
    }
    .clear-all-btn:hover { background: var(--primary-light); }

    .history-list { list-style: none; margin: 0; padding: 0.25rem 0; }
    .history-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.6rem 1rem; cursor: pointer; transition: background 0.15s;
    }
    .history-item--active { background: var(--hover-bg); }
    .history-item__icon { font-size: 0.85rem; opacity: 0.5; flex-shrink: 0; }
    .history-item__text { flex: 1; font-size: 0.9rem; color: var(--text-primary); }
    .history-item__remove {
      background: none; border: none; cursor: pointer;
      color: var(--text-secondary); font-size: 0.75rem; padding: 0.2rem 0.4rem;
      border-radius: 4px; opacity: 0; transition: opacity 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .history-item:hover .history-item__remove { opacity: 1; }
    .history-item__remove:hover { background: #fee2e2; color: #dc2626; }

    /* Recent chips */
    .recent-chips {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    }
    .recent-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap; }
    .recent-chip {
      padding: 0.25rem 0.75rem; border-radius: 20px;
      border: 1.5px solid var(--border); background: var(--card-bg);
      color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;
      transition: all 0.15s; font-family: inherit;
    }
    .recent-chip:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

    /* Category chips */
    .category-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .chip {
      padding: 0.4rem 1rem; border-radius: 20px; border: 2px solid var(--border);
      background: var(--card-bg); color: var(--text-secondary); cursor: pointer;
      font-size: 0.85rem; font-weight: 500; transition: all 0.2s; white-space: nowrap;
      font-family: inherit;
    }
    .chip:hover { border-color: var(--primary); color: var(--primary); }
    .chip--active { background: var(--primary); border-color: var(--primary); color: white; }

    .results-info { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; min-height: 1.2rem; }
    .results-info strong { color: var(--text-primary); }

    .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .skeleton-card { background: var(--card-bg); border-radius: 16px; overflow: hidden; box-shadow: var(--card-shadow); }

    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
    .empty-state__icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.3rem; color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { margin-bottom: 1.5rem; }
  `],
})
export class RecipeListComponent {
  readonly recipeService = inject(RecipeService);
  readonly historyService = inject(SearchHistoryService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly elRef = inject(ElementRef);

  readonly loading = signal(false);
  readonly showDropdown = signal(false);
  readonly activeIndex = signal(-1);
  readonly skeletons = [1, 2, 3, 4, 5, 6];

  readonly categories = (Object.entries(CATEGORY_LABELS) as [RecipeCategory, string][]).map(
    ([value, label]) => ({ value, label })
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.closeDropdown();
    }
  }

  onFocus(): void {
    if (this.historyService.hasHistory()) {
      this.showDropdown.set(true);
      this.activeIndex.set(-1);
    }
  }

  onSearchChange(query: string): void {
    this.recipeService.setSearch(query);
    // Show dropdown only when input is empty (to show history)
    this.showDropdown.set(!query && this.historyService.hasHistory());
    this.activeIndex.set(-1);
  }

  onEnter(): void {
    const history = this.historyService.history();
    const idx = this.activeIndex();
    if (idx >= 0 && idx < history.length) {
      this.selectHistory(history[idx]);
    } else {
      this.commitSearch();
    }
  }

  onArrowDown(): void {
    const max = this.historyService.history().length - 1;
    this.activeIndex.update(i => Math.min(i + 1, max));
  }

  onArrowUp(): void {
    this.activeIndex.update(i => Math.max(i - 1, -1));
  }

  selectHistory(query: string): void {
    this.recipeService.setSearch(query);
    this.closeDropdown();
  }

  clearSearch(): void {
    this.commitSearch();
    this.recipeService.setSearch('');
  }

  clearAll(): void {
    this.historyService.clear();
    this.closeDropdown();
    this.toastService.info('היסטוריית החיפוש נוקתה');
  }

  removeItem(e: Event, item: string): void {
    e.stopPropagation();
    this.historyService.remove(item);
    if (!this.historyService.hasHistory()) this.closeDropdown();
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
    this.activeIndex.set(-1);
  }

  private commitSearch(): void {
    const q = this.recipeService.searchQuery();
    if (q.trim().length >= 2) {
      this.historyService.add(q);
    }
    this.closeDropdown();
  }

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
