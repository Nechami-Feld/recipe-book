import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { RecipeCardComponent } from '../recipes/components/recipe-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeCardComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>❤️ המתכונים המועדפים שלי</h1>
        <p class="subtitle">{{ recipeService.favorites().length }} מתכונים שמורים</p>
      </div>

      @if (recipeService.favorites().length === 0) {
        <div class="empty-state">
          <div class="empty-state__icon">💔</div>
          <h3>אין מועדפים עדיין</h3>
          <p>סמן מתכונים כמועדפים כדי שיופיעו כאן</p>
          <a [routerLink]="['/recipes']" class="btn-primary">לכל המתכונים</a>
        </div>
      } @else {
        <div class="recipe-grid">
          @for (recipe of recipeService.favorites(); track recipe.id) {
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
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; margin: 0; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin: 0.25rem 0 0; }
    .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
    .empty-state__icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.3rem; color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { margin-bottom: 1.5rem; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
  `],
})
export class FavoritesComponent {
  readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  onFavoriteToggle(id: string): void {
    this.recipeService.toggleFavorite(id);
    this.toastService.info('הוסר מהמועדפים');
  }

  onEdit(id: string): void { this.router.navigate(['/recipes', id, 'edit']); }

  onDelete(id: string): void {
    const recipe = this.recipeService.getById(id);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'מחיקת מתכון', message: `למחוק את "${recipe?.title}"?`, confirmText: 'מחק' },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.recipeService.delete(id);
        this.toastService.success('המתכון נמחק');
      }
    });
  }
}
