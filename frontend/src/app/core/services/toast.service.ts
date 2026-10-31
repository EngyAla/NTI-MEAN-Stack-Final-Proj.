import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 3500) {
    const id = ++this.counter;
    const newToast: ToastMessage = { id, type, message };

    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(message: string, durationMs = 3500) {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4500) {
    this.show(message, 'error', durationMs);
  }

  dismiss(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
