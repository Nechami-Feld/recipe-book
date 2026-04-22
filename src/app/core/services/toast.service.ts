import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 3000): void {
    const id = Math.random().toString(36).slice(2, 9);
    this._toasts.update(t => [...t, { id, message, type, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error', 5000); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: string): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
