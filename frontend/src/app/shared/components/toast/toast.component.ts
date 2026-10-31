import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toasts().length > 0">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [ngClass]="{
          'toast-success': toast.type === 'success',
          'toast-error': toast.type === 'error'
        }"
      >
        <div class="toast-content">
          <span class="toast-text">{{ toast.message }}</span>
        </div>
        <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .toast-text {
        font-size: 0.86rem;
        letter-spacing: 0.02em;
      }
      .toast-close {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.7;
        line-height: 1;
        transition: opacity 0.2s;
        &:hover {
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
