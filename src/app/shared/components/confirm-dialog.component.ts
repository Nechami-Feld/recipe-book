import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">{{ data.cancelText || 'ביטול' }}</button>
        <button mat-flat-button color="warn" (click)="dialogRef.close(true)">{{ data.confirmText || 'אישור' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 0.5rem; min-width: 300px; }
    p { color: var(--text-secondary); margin: 0; }
    mat-dialog-actions { gap: 0.5rem; padding-bottom: 0.5rem; }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
