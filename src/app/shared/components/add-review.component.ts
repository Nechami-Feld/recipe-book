import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReviewSubmission {
  author: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-review-section">
      <h3>✍️ הוסף ביקורה</h3>
      <form (ngSubmit)="onSubmit()" class="review-form">
        <div class="form-group">
          <label>שם *</label>
          <input [(ngModel)]="author" name="author" placeholder="שמך" class="input" required />
          @if (!author()) {
            <span class="error">שדה חובה</span>
          }
        </div>

        <div class="form-group">
          <label>דירוג *</label>
          <div class="star-rating">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <button
                type="button"
                class="star"
                [class.active]="star <= rating()"
                (click)="rating.set(star)"
              >
                ⭐
              </button>
            }
          </div>
          <span class="rating-display">{{ rating() }} כוכב</span>
        </div>

        <div class="form-group">
          <label>תיאור הביקורה *</label>
          <textarea
            [(ngModel)]="comment"
            name="comment"
            placeholder="שתפו את חוויתכם עם המתכון..."
            class="input textarea"
            rows="3"
            required
          ></textarea>
          @if (!comment()) {
            <span class="error">שדה חובה</span>
          }
        </div>

        <button
          type="submit"
          class="btn-submit"
          [disabled]="!author() || !comment() || submitting()"
        >
          @if (submitting()) { <span class="spinner-sm"></span> }
          {{ submitting() ? 'שולח...' : 'שלח ביקורה' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .add-review-section { background: var(--card-bg); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
    .add-review-section h3 { font-size: 1rem; font-weight: 700; margin: 0 0 1rem; color: var(--text-primary); }
    .review-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .input {
      padding: 0.75rem 1rem; border: 2px solid var(--border); border-radius: 10px;
      font-size: 0.95rem; background: var(--input-bg); color: var(--text-primary);
      transition: border-color 0.2s; direction: rtl; width: 100%; box-sizing: border-box;
    }
    .input:focus { outline: none; border-color: var(--primary); }
    .textarea { resize: vertical; font-family: inherit; }
    .error { color: #ef4444; font-size: 0.78rem; }
    .star-rating { display: flex; gap: 0.5rem; }
    .star {
      background: none; border: none; cursor: pointer; font-size: 1.8rem;
      opacity: 0.3; transition: all 0.2s; padding: 0.25rem;
    }
    .star.active { opacity: 1; }
    .star:hover { opacity: 0.7; transform: scale(1.15); }
    .rating-display { font-size: 0.85rem; color: var(--primary); font-weight: 600; }
    .btn-submit {
      padding: 0.875rem 1.5rem; border-radius: 10px; border: none;
      cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s;
      background: var(--primary); color: white; display: flex; align-items: center;
      justify-content: center; gap: 0.5rem;
    }
    .btn-submit:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AddReviewComponent {
  @Output() reviewSubmitted = new EventEmitter<ReviewSubmission>();

  readonly author = signal('');
  readonly rating = signal(5);
  readonly comment = signal('');
  readonly submitting = signal(false);

  readonly isValid = computed(() => this.author().trim().length > 0 && this.comment().trim().length > 0);

  onSubmit(): void {
    if (!this.isValid()) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.reviewSubmitted.emit({
        author: this.author().trim(),
        rating: this.rating(),
        comment: this.comment().trim(),
      });
      this.author.set('');
      this.rating.set(5);
      this.comment.set('');
      this.submitting.set(false);
    }, 500);
  }
}
