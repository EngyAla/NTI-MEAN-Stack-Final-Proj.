import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent, TranslatePipe],
  template: `
    <div class="cart-page">
      <!-- Header -->
      <section class="cart-header">
        <div class="container text-center">
          <span class="sub-label">{{ 'navigation.brand' | translate }} {{ 'navigation.brandSub' | translate }}</span>
          <h1 class="page-title">{{ 'cart.title' | translate }}</h1>
          <p class="page-desc">
            {{ 'cart.desc' | translate }}
          </p>
        </div>
      </section>

      <!-- Cart Content -->
      <section class="section cart-content-section">
        <div class="container">
          <div class="cart-layout" *ngIf="cartService.items().length > 0; else emptyCartTpl">
            <!-- Left: Items Table / List -->
            <div class="cart-items-column">
              <div class="cart-item-card" *ngFor="let ci of cartService.items()">
                <div class="item-thumb-box">
                  <a [routerLink]="['/item', ci.item._id]">
                    <img [src]="ci.item.imageUrl" [alt]="ci.item.name" class="item-thumb" />
                  </a>
                </div>

                <div class="item-details-box">
                  <span class="item-category" *ngIf="getCategoryName(ci.item)">
                    {{ getCategoryName(ci.item) }}
                  </span>
                  <h3 class="item-name">
                    <a [routerLink]="['/item', ci.item._id]">{{ ci.item.name }}</a>
                  </h3>
                  <span class="item-unit-price">\${{ ci.item.price | number:'1.2-2' }}</span>
                </div>

                <div class="item-qty-box">
                  <div class="qty-pill">
                    <button
                      type="button"
                      class="qty-btn"
                      (click)="cartService.decrementQuantity(ci.item._id)"
                      aria-label="Decrease quantity"
                    >
                      &minus;
                    </button>
                    <span class="qty-number">{{ ci.quantity }}</span>
                    <button
                      type="button"
                      class="qty-btn"
                      (click)="cartService.incrementQuantity(ci.item._id)"
                      aria-label="Increase quantity"
                    >
                      &plus;
                    </button>
                  </div>
                </div>

                <div class="item-subtotal-box">
                  <span class="subtotal-label">{{ 'cart.subtotal' | translate }}</span>
                  <span class="subtotal-val">\${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}</span>
                </div>

                <div class="item-remove-box">
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="cartService.removeFromCart(ci.item._id)"
                    title="Remove piece"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="cart-actions-row">
                <a routerLink="/shop" class="btn btn-outline btn-sm">
                  {{ 'cart.continueShopping' | translate }}
                </a>
                <button type="button" class="btn btn-ghost btn-sm" (click)="cartService.clearCart()">
                  {{ 'cart.clearBag' | translate }}
                </button>
              </div>
            </div>

            <!-- Right: Order Summary Sidebar -->
            <div class="cart-summary-column">
              <div class="summary-card">
                <h3 class="summary-title">{{ 'cart.orderSummary' | translate }}</h3>

                <div class="summary-line">
                  <span>{{ 'cart.selectedPieces' | translate }}</span>
                  <span class="val">{{ cartService.cartCount() }}</span>
                </div>

                <div class="summary-line">
                  <span>{{ 'cart.subtotal' | translate }}</span>
                  <span class="val">\${{ cartService.subtotal() | number:'1.2-2' }}</span>
                </div>

                <div class="summary-line">
                  <span>{{ 'cart.delivery' | translate }}</span>
                  <span class="val text-gold">{{ 'cart.deliveryComplimentary' | translate }}</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-line total-line">
                  <span>{{ 'cart.total' | translate }}</span>
                  <span class="total-val">\${{ cartService.totalPrice() | number:'1.2-2' }}</span>
                </div>

                <!-- Stock validation message if conflict -->
                <div class="stock-warning" *ngIf="validationWarning()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ validationWarning() }}</span>
                </div>

                <button
                  type="button"
                  class="btn btn-primary btn-lg w-100 checkout-btn"
                  [disabled]="isValidating()"
                  (click)="proceedToCheckout()"
                >
                  <span *ngIf="!isValidating()">{{ 'cart.checkout' | translate }}</span>
                  <span *ngIf="isValidating()">{{ 'cart.verifyingStock' | translate }}</span>
                </button>

                <div class="phone-order-note">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{{ 'cart.phoneNote' | translate }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <ng-template #emptyCartTpl>
            <app-empty-state
              [title]="'cart.emptyTitle' | translate"
              [description]="'cart.emptyDesc' | translate"
              [actionText]="'cart.emptyBtn' | translate"
              actionRoute="/shop"
            ></app-empty-state>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .cart-header {
        background-color: var(--color-espresso);
        color: #ffffff;
        padding: 4.5rem 1.5rem 3.5rem;
        border-bottom: 1px solid rgba(194, 162, 111, 0.2);

        .sub-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-light);
          display: inline-block;
          margin-bottom: 0.75rem;
        }

        .page-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .page-desc {
          font-size: 1.05rem;
          color: #bfaea0;
          max-width: 580px;
          margin: 0 auto;
          font-weight: 300;
        }
      }

      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 3.5rem;
        align-items: start;
      }

      .cart-items-column {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .cart-item-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        transition: var(--transition-fast);

        &:hover {
          border-color: var(--color-gold-light);
        }
      }

      .item-thumb-box {
        width: 90px;
        height: 90px;
        background-color: #faf7f2;
        border-radius: var(--radius-sm);
        overflow: hidden;
        flex-shrink: 0;

        .item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-details-box {
        flex: 1;

        .item-category {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-gold-dark);
          display: block;
          margin-bottom: 0.25rem;
        }

        .item-name {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin-bottom: 0.35rem;

          a {
            color: var(--color-espresso);
            &:hover {
              color: var(--color-gold-dark);
            }
          }
        }

        .item-unit-price {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }
      }

      .qty-pill {
        display: flex;
        align-items: center;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background-color: var(--color-canvas);

        .qty-btn {
          width: 32px;
          height: 36px;
          background: transparent;
          border: none;
          font-size: 1.1rem;
          color: var(--color-espresso);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background-color: var(--color-cream);
          }
        }

        .qty-number {
          width: 32px;
          text-align: center;
          font-weight: 600;
          font-size: 0.88rem;
        }
      }

      .item-subtotal-box {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 90px;

        .subtotal-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
        }

        .subtotal-val {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-espresso);
        }
      }

      .remove-btn {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 0.5rem;
        transition: var(--transition-fast);

        &:hover {
          color: var(--danger-text);
        }
      }

      .cart-actions-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1rem;
      }

      /* Summary Card */
      .summary-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 2rem;
        position: sticky;
        top: 100px;

        .summary-title {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.85rem;
          color: var(--color-text-secondary);

          .val {
            font-weight: 600;
            color: var(--color-espresso);
          }

          &.total-line {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--color-espresso);
            margin-top: 1rem;
            margin-bottom: 1.5rem;

            .total-val {
              font-size: 1.4rem;
              color: var(--color-espresso);
            }
          }
        }

        .summary-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 1rem 0;
        }

        .stock-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: var(--danger-bg);
          border: 1px solid var(--danger-border);
          border-radius: var(--radius-sm);
          color: var(--danger-text);
          font-size: 0.82rem;
          margin-bottom: 1rem;
        }

        .checkout-btn {
          margin-bottom: 1.25rem;
        }

        .phone-order-note {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.78rem;
          color: var(--color-text-muted);
          line-height: 1.5;

          svg {
            color: var(--color-gold-dark);
            flex-shrink: 0;
            margin-top: 2px;
          }
        }
      }

      @media (max-width: 900px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .cart-item-card {
          flex-wrap: wrap;
          gap: 1rem;
        }
        .item-details-box {
          width: calc(100% - 110px);
        }
        .item-qty-box {
          order: 4;
        }
        .item-subtotal-box {
          order: 5;
          margin-left: auto;
        }
        .item-remove-box {
          order: 6;
        }
      }
    `,
  ],
})
export class CartComponent {
  cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isValidating = signal(false);
  validationWarning = signal<string | null>(null);

  getCategoryName(item: any): string {
    if (!item.category) return '';
    return typeof item.category === 'object' ? item.category.name : '';
  }

  proceedToCheckout() {
    this.isValidating.set(true);
    this.validationWarning.set(null);

    // Validate requested quantities against backend stock
    this.cartService.validateCartStock().subscribe({
      next: (res) => {
        this.isValidating.set(false);
        if (res.allAvailable) {
          this.router.navigate(['/checkout']);
        } else {
          // Identify failing item
          const unavailable = res.items.find((i) => !i.available);
          const msg = unavailable ? unavailable.message : 'Some items have limited stock.';
          this.validationWarning.set(msg);
          this.toastService.error(msg);
        }
      },
      error: (err) => {
        this.isValidating.set(false);
        console.error('Validation error', err);
        // If server error, still let user proceed or notify
        this.toastService.error('Could not verify inventory status. Please try again.');
      },
    });
  }
}
