import { Component, Inject, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { QrCodeService } from '../../core/services/qr-code.service';
import { ToastService } from '../../core/services/toast.service';

export interface QrDialogData {
  title: string;
  recipeId: string;
}

@Component({
  selector: 'app-qr-code-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('280ms cubic-bezier(0.34,1.56,0.64,1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
  template: `
    <div class="qr-dialog" @popIn>
      <div class="qr-dialog__header">
        <h2>📱 QR Code</h2>
        <button class="close-btn" (click)="dialogRef.close()">✕</button>
      </div>

      <p class="qr-subtitle">סרוק כדי לפתוח את המתכון "{{ data.title }}"</p>

      <div class="qr-preview">
        @if (generating()) {
          <div class="qr-skeleton">
            <div class="spinner"></div>
            <span>יוצר QR...</span>
          </div>
        } @else if (styledUrl()) {
          <img [src]="styledUrl()!" [alt]="'QR - ' + data.title" class="qr-img" @popIn />
        }
      </div>

      <!-- URL -->
      <div class="qr-url">
        <span class="qr-url__text">{{ recipeUrl }}</span>
        <button class="qr-url__copy" (click)="copyUrl()" title="העתק קישור">📋</button>
      </div>

      <div class="qr-actions">
        <button class="action-btn action-btn--primary" (click)="download()" [disabled]="generating()">
          ⬇️ הורד PNG
        </button>
        <button class="action-btn" (click)="copyImage()" [disabled]="generating() || !canCopy">
          📋 העתק תמונה
        </button>
      </div>
    </div>
  `,
  styles: [`
    .qr-dialog {
      padding: 1.5rem; min-width: 300px; max-width: 400px;
      background: var(--card-bg); color: var(--text-primary); direction: rtl;
    }
    .qr-dialog__header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;
    }
    h2 { font-size: 1.2rem; font-weight: 800; margin: 0; }
    .close-btn {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      color: var(--text-secondary); padding: 0.25rem 0.5rem; border-radius: 6px;
      transition: background 0.15s;
    }
    .close-btn:hover { background: var(--hover-bg); }
    .qr-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 1.25rem; }

    .qr-preview {
      border-radius: 16px; overflow: hidden; margin-bottom: 1rem;
      background: var(--hover-bg); aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--card-shadow);
    }
    .qr-img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .qr-skeleton {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      color: var(--text-secondary); font-size: 0.85rem;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border); border-top-color: var(--primary);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .qr-url {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--hover-bg); border-radius: 8px; padding: 0.5rem 0.75rem;
      margin-bottom: 1rem; border: 1px solid var(--border);
    }
    .qr-url__text {
      flex: 1; font-size: 0.75rem; color: var(--text-secondary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr;
    }
    .qr-url__copy {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      padding: 0.1rem; flex-shrink: 0; transition: transform 0.15s;
    }
    .qr-url__copy:hover { transform: scale(1.2); }

    .qr-actions { display: flex; gap: 0.6rem; }
    .action-btn {
      flex: 1; padding: 0.75rem; border-radius: 10px; border: 2px solid var(--border);
      background: var(--hover-bg); color: var(--text-primary);
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .action-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn--primary { background: var(--primary); color: white; border-color: var(--primary); }
    .action-btn--primary:hover:not(:disabled) { background: var(--primary-dark); border-color: var(--primary-dark); color: white; }
  `],
})
export class QrCodeDialogComponent implements OnInit {
  private readonly qrService = inject(QrCodeService);
  private readonly toastService = inject(ToastService);

  readonly generating = signal(true);
  readonly styledUrl = signal<string | null>(null);
  readonly canCopy = !!navigator.clipboard?.write;
  readonly recipeUrl: string;

  constructor(
    public dialogRef: MatDialogRef<QrCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QrDialogData,
  ) {
    this.recipeUrl = `${window.location.origin}/recipes/${this.data.recipeId}`;
  }

  async ngOnInit(): Promise<void> {
    try {
      const url = await this.qrService.generateStyledDataUrl(this.recipeUrl, this.data.title);
      this.styledUrl.set(url);
    } catch {
      this.toastService.error('שגיאה ביצירת ה-QR');
    } finally {
      this.generating.set(false);
    }
  }

  download(): void {
    if (!this.styledUrl()) return;
    this.qrService.download(this.styledUrl()!, this.data.title);
    this.toastService.success('QR הורד בהצלחה ⬇️');
  }

  async copyImage(): Promise<void> {
    if (!this.styledUrl()) return;
    try {
      const res = await fetch(this.styledUrl()!);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      this.toastService.success('QR הועתק ללוח 📋');
    } catch {
      this.toastService.error('לא ניתן להעתיק');
    }
  }

  async copyUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.recipeUrl);
      this.toastService.success('הקישור הועתק 🔗');
    } catch {
      this.toastService.error('לא ניתן להעתיק');
    }
  }
}
