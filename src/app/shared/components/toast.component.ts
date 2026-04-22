import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" @slideIn (click)="toastService.dismiss(toast.id)">
          <span class="toast__icon">{{ icons[toast.type] }}</span>
          <span class="toast__message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: 12px;
      min-width: 280px;
      max-width: 380px;
      cursor: pointer;
      pointer-events: all;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      backdrop-filter: blur(8px);
    }
    .toast--success { background: #22c55e; color: white; }
    .toast--error { background: #ef4444; color: white; }
    .toast--warning { background: #f59e0b; color: white; }
    .toast--info { background: #3b82f6; color: white; }
    .toast__icon { font-size: 1.2rem; }
    .toast__message { font-size: 0.9rem; line-height: 1.4; }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
}
