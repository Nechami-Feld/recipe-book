import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { ShareCardService } from '../../core/services/share-card.service';
import { ToastService } from '../../core/services/toast.service';
import { Recipe } from '../../core/models/recipe.model';

@Component({
  selector: 'app-share-card-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
  template: `
    <div class="share-dialog" @fadeIn>
      <div class="share-dialog__header">
        <h2>📤 שתף מתכון</h2>
        <button class="close-btn" (click)="dialogRef.close()">✕</button>
      </div>

      <div class="share-dialog__preview">
        @if (generating()) {
          <div class="preview-skeleton">
            <div class="spinner-large"></div>
            <p>יוצר כרטיס...</p>
          </div>
        } @else if (previewUrl()) {
          <img [src]="previewUrl()!" alt="תצוגה מקדימה" class="preview-img" />
        }
      </div>

      <div class="share-dialog__actions">
        @if (canNativeShare) {
          <button class="share-btn share-btn--primary" (click)="nativeShare()" [disabled]="generating()">
            <span>📱</span> שתף
          </button>
        }
        <button class="share-btn share-btn--whatsapp" (click)="shareWhatsApp()" [disabled]="generating()">
          <span>💬</span> WhatsApp
        </button>
        <button class="share-btn share-btn--copy" (click)="copyImage()" [disabled]="generating() || !canCopy">
          <span>📋</span> העתק תמונה
        </button>
        <button class="share-btn share-btn--download" (click)="download()" [disabled]="generating()">
          <span>⬇️</span> הורד
        </button>
      </div>
    </div>
  `,
  styles: [`
    .share-dialog {
      padding: 1.5rem; min-width: 300px; max-width: 460px;
      background: var(--card-bg); color: var(--text-primary); direction: rtl;
    }
    .share-dialog__header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;
    }
    h2 { font-size: 1.2rem; font-weight: 800; margin: 0; }
    .close-btn {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      color: var(--text-secondary); padding: 0.25rem 0.5rem; border-radius: 6px;
      transition: background 0.15s;
    }
    .close-btn:hover { background: var(--hover-bg); }
    .share-dialog__preview {
      border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem;
      background: var(--hover-bg); aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .preview-skeleton {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      color: var(--text-secondary); font-size: 0.9rem;
    }
    .spinner-large {
      width: 48px; height: 48px;
      border: 4px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .share-dialog__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .share-btn {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1rem; border-radius: 10px; border: none;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .share-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .share-btn--primary { background: var(--primary); color: white; grid-column: 1 / -1; }
    .share-btn--primary:hover:not(:disabled) { background: var(--primary-dark); }
    .share-btn--whatsapp { background: #25d366; color: white; }
    .share-btn--whatsapp:hover:not(:disabled) { background: #1da851; }
    .share-btn--copy { background: var(--hover-bg); color: var(--text-primary); border: 2px solid var(--border); }
    .share-btn--copy:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .share-btn--download { background: var(--hover-bg); color: var(--text-primary); border: 2px solid var(--border); }
    .share-btn--download:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  `],
})
export class ShareCardDialogComponent {
  private readonly shareService = inject(ShareCardService);
  private readonly toastService = inject(ToastService);

  readonly generating = signal(true);
  readonly previewUrl = signal<string | null>(null);
  readonly canNativeShare = !!navigator.share;
  readonly canCopy = !!navigator.clipboard?.write;

  constructor(
    public dialogRef: MatDialogRef<ShareCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public recipe: Recipe,
  ) {
    this.generatePreview();
  }

  private async generatePreview(): Promise<void> {
    try {
      const url = await this.shareService.generate(this.recipe);
      this.previewUrl.set(url);
    } catch {
      this.toastService.error('שגיאה ביצירת הכרטיס');
    } finally {
      this.generating.set(false);
    }
  }

  async nativeShare(): Promise<void> {
    try {
      await this.shareService.share(this.recipe);
      this.dialogRef.close();
    } catch { /* user cancelled */ }
  }

  shareWhatsApp(): void {
    const text = encodeURIComponent(`🍳 ${this.recipe.title}\n${this.recipe.description}\n\nמתוך חוברת המתכונים שלי`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async copyImage(): Promise<void> {
    try {
      await this.shareService.copyToClipboard(this.recipe);
      this.toastService.success('התמונה הועתקה ללוח! 📋');
    } catch {
      this.toastService.error('לא ניתן להעתיק - נסה להוריד');
    }
  }

  async download(): Promise<void> {
    try {
      await this.shareService.download(this.recipe);
      this.toastService.success('התמונה הורדה בהצלחה ⬇️');
    } catch {
      this.toastService.error('שגיאה בהורדה');
    }
  }
}
