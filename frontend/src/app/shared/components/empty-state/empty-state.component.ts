import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state-wrapper">
      <div class="empty-icon-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div class="empty-actions" *ngIf="actionText && actionRoute">
        <a [routerLink]="actionRoute" class="btn btn-outline">{{ actionText }}</a>
      </div>
    </div>
  `,
  styles: [
    `
      .empty-state-wrapper {
        text-align: center;
        padding: 4.5rem 1.5rem;
        max-width: 500px;
        margin: 0 auto;
      }
      .empty-icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: var(--color-cream);
        color: var(--color-gold-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        border: 1px solid var(--color-border);
      }
      .empty-title {
        font-family: var(--font-serif);
        font-size: 1.75rem;
        margin-bottom: 0.65rem;
        color: var(--color-espresso);
      }
      .empty-description {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 2rem;
        line-height: 1.6;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title = 'Collection is currently serene';
  @Input() description = 'No items match your criteria at this moment. Explore our curated catalog.';
  @Input() actionText = 'Discover Collection';
  @Input() actionRoute = '/shop';
}
