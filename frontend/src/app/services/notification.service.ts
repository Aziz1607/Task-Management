import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<ToastNotification[]>([]);
  public toasts = this.toastsSignal.asReadonly();
  private nextId = 1;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', durationMs = 3500): void {
    const id = this.nextId++;
    const toast: ToastNotification = { id, type, message };

    this.toastsSignal.update((current) => [...current, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 4500);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  dismiss(id: number): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}

