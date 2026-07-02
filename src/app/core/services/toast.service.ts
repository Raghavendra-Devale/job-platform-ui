import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    const id = ++this.nextId;
    this.toasts.update((ts) => [...ts, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        this.clear(id);
      }, duration);
    }
  }

  showSuccess(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  showWarning(message: string, duration = 3500): void {
    this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  clear(id: number): void {
    this.toasts.update((ts) => ts.filter((t) => t.id !== id));
  }
}
