import { Injectable, signal } from '@angular/core';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  readonly config = signal<ConfirmationConfig | null>(null);
  private resolveFn?: (value: boolean) => void;

  confirm(config: ConfirmationConfig): Promise<boolean> {
    this.config.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      danger: false,
      ...config,
    });
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  handleConfirm(): void {
    if (this.resolveFn) {
      this.resolveFn(true);
    }
    this.config.set(null);
  }

  handleCancel(): void {
    if (this.resolveFn) {
      this.resolveFn(false);
    }
    this.config.set(null);
  }
}
