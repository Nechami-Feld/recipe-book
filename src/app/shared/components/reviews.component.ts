import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/recipe.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-section">
      <div class="reviews-header">
        <h2>⭐ דירוגים וביקורות ({{ reviews.length }})</h2>
        @if (reviews.length > 0) {
          <div class="rating-summary">
            <div class="average-rating">
              <span class="rating-value">{{ avgRating() }}</span>
              <span class="stars">{{ renderStars(avgRating()) }}</span>
              <span class="total-count">({{ reviews.length }} ביקורות)</span>
            </div>
          </div>
        }
      </div>

      @if (reviews.length === 0) {
        <div class="no-reviews">
          <p>🤔 עדיין אין ביקורות על המתכון הזה</p>
          <p class="hint">היה הראשון להוסיף ביקורה!</p>
        </div>
      } @else {
        <div class="reviews-list">
          @for (review of reviews; track review.id) {
            <div class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <span class="reviewer-name">{{ review.author }}</span>
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                </div>
                @if (canDelete) {
                  <button class="delete-btn" (click)="onDelete(review.id)" title="מחק ביקורה">🗑️</button>
                }
              </div>
              <div class="review-rating">{{ renderStars(review.rating) }}</div>
              <p class="review-comment">{{ review.comment }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reviews-section { margin: 2rem 0; }
    .reviews-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .reviews-header h2 { font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .rating-summary { }
    .average-rating { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--hover-bg); border-radius: 10px; width: fit-content; }
    .rating-value { font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .stars { font-size: 1.2rem; letter-spacing: 0.1em; }
    .total-count { color: var(--text-secondary); font-size: 0.9rem; }
    .no-reviews { text-align: center; padding: 2rem; color: var(--text-secondary); }
    .no-reviews p { margin: 0.5rem 0; }
    .hint { font-size: 0.9rem; }
    .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
    .review-item { background: var(--card-bg); border-radius: 12px; padding: 1rem 1.25rem; border-left: 4px solid var(--primary); }
    .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .reviewer-info { }
    .reviewer-name { font-weight: 600; color: var(--text-primary); }
    .review-date { font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.75rem; }
    .delete-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem 0.5rem; opacity: 0.7; transition: opacity 0.2s; }
    .delete-btn:hover { opacity: 1; }
    .review-rating { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .review-comment { margin: 0.5rem 0 0; color: var(--text-primary); line-height: 1.5; }
  `],
})
export class ReviewsComponent {
  @Input() reviews: Review[] = [];
  @Input() canDelete = false;
  @Output() deleteReview = new EventEmitter<string>();

  readonly reviewService = inject(ReviewService);

  readonly avgRating = computed(() => {
    return this.reviewService.getAverageRating(this.reviews);
  });

  renderStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalf) stars += '½';
    return stars;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  onDelete(reviewId: string): void {
    this.deleteReview.emit(reviewId);
  }
}
