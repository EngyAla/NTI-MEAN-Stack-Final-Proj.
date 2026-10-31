import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/ecommerce.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="checkout-page">
      <!-- Header -->
      <section class="checkout-header">
        <div class="container text-center">
          <span class="sub-label">White-Glove Order Request</span>
          <h1 class="page-title">Concierge Checkout</h1>
          <p class="page-desc">
            Direct atelier arrangement. Provide your contact details and our manager will call you to finalize delivery.
          </p>
        </div>
      </section>

      <!-- Main Checkout Content -->
      <section class="section checkout-content">
        <div class="container">
          <!-- Order Confirmation Screen (Success) -->
          <div class="order-success-card" *ngIf="submittedOrder(); else formSection">
            <div class="success-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

            <span class="success-tag">Order Submitted Successfully</span>
            <h2 class="success-title">Thank You, {{ submittedOrder()?.customer?.fullName }}</h2>

            <div class="order-ref-pill">
              <span>Order Reference:</span>
              <strong>{{ submittedOrder()?.orderNumber }}</strong>
            </div>

            <div class="concierge-phone-notice">
              <div class="phone-ring-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div class="phone-notice-text">
                <h4>Next Step: Telephone Confirmation</h4>
                <p>
                  Your order is currently in <strong>Opened</strong> status. Our atelier executive manager will call you at
                  <strong>{{ submittedOrder()?.customer?.phone }}</strong>
                  shortly to confirm your requested pieces, review delivery timing, and accommodate any custom packaging requests.
                </p>
              </div>
            </div>

            <div class="submitted-details-box">
              <h4>Delivery Destination</h4>
              <p>{{ submittedOrder()?.customer?.address }}</p>
              <p *ngIf="submittedOrder()?.customer?.notes" class="order-notes-preview">
                <em>Special Notes: {{ submittedOrder()?.customer?.notes }}</em>
              </p>

              <div class="submitted-items-list">
                <div class="submitted-item" *ngFor="let itm of submittedOrder()?.items">
                  <span class="itm-name">{{ itm.name }} &times; {{ itm.quantity }}</span>
                  <span class="itm-price">\${{ itm.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="submitted-total-row">
                <span>Total Amount:</span>
                <span class="total-bold">\${{ submittedOrder()?.totalPrice | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="success-actions">
              <a routerLink="/" class="btn btn-primary">Return to Home</a>
              <a routerLink="/shop" class="btn btn-outline">Explore More Accessories</a>
            </div>
          </div>

          <!-- Checkout Form & Review Section -->
          <ng-template #formSection>
            <div class="checkout-layout">
              <!-- Customer Information Form -->
              <div class="form-column">
                <div class="luxury-form-card">
                  <h3 class="form-title">Client Information</h3>
                  <p class="form-subtitle">
                    Please provide your contact details for telephone verification and direct courier dispatch.
                  </p>

                  <form [formGroup]="checkoutForm" (ngSubmit)="submitOrder()">
                    <!-- Full Name -->
                    <div class="form-group">
                      <label for="fullName">Full Name *</label>
                      <input
                        type="text"
                        id="fullName"
                        formControlName="fullName"
                        placeholder="e.g. Lady Vivienne Westwood"
                        class="form-control"
                        [class.is-invalid]="f['fullName'].touched && f['fullName'].invalid"
                      />
                      <div class="form-error" *ngIf="f['fullName'].touched && f['fullName'].invalid">
                        Please provide your full name.
                      </div>
                    </div>

                    <!-- Phone Number -->
                    <div class="form-group">
                      <label for="phone">Phone Number (For Order Confirmation) *</label>
                      <input
                        type="tel"
                        id="phone"
                        formControlName="phone"
                        placeholder="e.g. +1 (555) 392-8812"
                        class="form-control"
                        [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                      />
                      <div class="form-hint">Our manager will reach out via this telephone number to finalize your order.</div>
                      <div class="form-error" *ngIf="f['phone'].touched && f['phone'].invalid">
                        A valid phone number is required for concierge confirmation.
                      </div>
                    </div>

                    <!-- Delivery Address -->
                    <div class="form-group">
                      <label for="address">Delivery Address *</label>
                      <textarea
                        id="address"
                        formControlName="address"
                        placeholder="Suite, building, street address, city, postal code"
                        class="form-control"
                        [class.is-invalid]="f['address'].touched && f['address'].invalid"
                      ></textarea>
                      <div class="form-error" *ngIf="f['address'].touched && f['address'].invalid">
                        Delivery address is required.
                      </div>
                    </div>

                    <!-- Optional Notes -->
                    <div class="form-group">
                      <label for="notes">Delivery Notes or Special Requests (Optional)</label>
                      <textarea
                        id="notes"
                        formControlName="notes"
                        placeholder="Special gift message, doorman instructions, or preferred call hours"
                        class="form-control"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      class="btn btn-primary btn-lg w-100 submit-order-btn"
                      [disabled]="isSubmitting() || checkoutForm.invalid"
                    >
                      <span *ngIf="!isSubmitting()">Submit Order Request</span>
                      <span *ngIf="isSubmitting()">Reserving Pieces & Submitting...</span>
                    </button>
                  </form>
                </div>
              </div>

              <!-- Order Summary Sidebar -->
              <div class="summary-column">
                <div class="review-card">
                  <h3 class="review-title">Selected Pieces ({{ cartService.cartCount() }})</h3>

                  <div class="review-items-list">
                    <div class="review-item" *ngFor="let ci of cartService.items()">
                      <img [src]="ci.item.imageUrl" [alt]="ci.item.name" class="review-thumb" />
                      <div class="review-item-info">
                        <span class="review-name">{{ ci.item.name }}</span>
                        <span class="review-qty">Qty: {{ ci.quantity }}</span>
                      </div>
                      <span class="review-subtotal">\${{ (ci.item.price * ci.quantity) | number:'1.2-2' }}</span>
                    </div>
                  </div>

                  <div class="review-divider"></div>

                  <div class="review-calc-row">
                    <span>Subtotal</span>
                    <span class="bold">\${{ cartService.subtotal() | number:'1.2-2' }}</span>
                  </div>

                  <div class="review-calc-row">
                    <span>Concierge Courier</span>
                    <span class="text-gold">Complimentary</span>
                  </div>

                  <div class="review-calc-row total-calc-row">
                    <span>Order Total</span>
                    <span class="total-figure">\${{ cartService.totalPrice() | number:'1.2-2' }}</span>
                  </div>

                  <div class="phone-callout-pill">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>Telephone verification ensures high security and personalized service.</span>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .checkout-header {
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

      .checkout-layout {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 3.5rem;
        align-items: start;
      }

      .luxury-form-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 2.5rem;

        .form-title {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          margin-bottom: 0.4rem;
        }

        .form-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
          line-height: 1.5;
        }
      }

      .submit-order-btn {
        margin-top: 1rem;
        padding: 1.15rem;
      }

      .review-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 2rem;
        position: sticky;
        top: 100px;

        .review-title {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }
      }

      .review-items-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 320px;
        overflow-y: auto;
      }

      .review-item {
        display: flex;
        align-items: center;
        gap: 1rem;

        .review-thumb {
          width: 54px;
          height: 54px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: #faf7f2;
        }

        .review-item-info {
          flex: 1;

          .review-name {
            display: block;
            font-size: 0.88rem;
            font-weight: 600;
            color: var(--color-espresso);
            line-height: 1.3;
          }

          .review-qty {
            font-size: 0.75rem;
            color: var(--color-text-muted);
          }
        }

        .review-subtotal {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-espresso);
        }
      }

      .review-divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 1.25rem 0;
      }

      .review-calc-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.75rem;

        .bold {
          font-weight: 600;
          color: var(--color-espresso);
        }

        &.total-calc-row {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-espresso);
          margin-top: 1rem;
          margin-bottom: 1.5rem;

          .total-figure {
            font-size: 1.4rem;
            color: var(--color-espresso);
          }
        }
      }

      .phone-callout-pill {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background-color: var(--color-cream);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        line-height: 1.5;

        svg {
          color: var(--color-gold-dark);
          flex-shrink: 0;
          margin-top: 2px;
        }
      }

      /* Order Success View */
      .order-success-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 4rem 3rem;
        max-width: 760px;
        margin: 0 auto;
        text-align: center;
        box-shadow: var(--shadow-md);

        .success-icon-box {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background-color: #eef6f0;
          color: #2e6b43;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .success-tag {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #2e6b43;
          display: block;
          margin-bottom: 0.5rem;
        }

        .success-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          margin-bottom: 1.5rem;
        }

        .order-ref-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background-color: var(--color-cream);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.95rem;
          margin-bottom: 2.5rem;

          strong {
            color: var(--color-espresso);
            letter-spacing: 0.05em;
          }
        }
      }

      .concierge-phone-notice {
        display: flex;
        gap: 1.25rem;
        text-align: left;
        background-color: var(--color-gold-pale);
        border: 1px solid rgba(194, 162, 111, 0.4);
        border-radius: var(--radius-sm);
        padding: 1.5rem 1.75rem;
        margin-bottom: 2.5rem;

        .phone-ring-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #ffffff;
          color: var(--color-gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin-bottom: 0.35rem;
          color: var(--color-espresso);
        }

        p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
      }

      .submitted-details-box {
        text-align: left;
        background-color: var(--color-canvas);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 1.75rem;
        margin-bottom: 2.5rem;

        h4 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
        }

        .order-notes-preview {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .submitted-items-list {
          border-top: 1px solid var(--color-border);
          margin-top: 1rem;
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .submitted-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
        }

        .submitted-total-row {
          border-top: 1px solid var(--color-border);
          margin-top: 1rem;
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 600;

          .total-bold {
            color: var(--color-espresso);
          }
        }
      }

      .success-actions {
        display: flex;
        justify-content: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      @media (max-width: 900px) {
        .checkout-layout {
          grid-template-columns: 1fr;
        }
        .order-success-card {
          padding: 2.5rem 1.5rem;
        }
      }
    `,
  ],
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  cartService = inject(CartService);

  isSubmitting = signal(false);
  submittedOrder = signal<Order | null>(null);

  checkoutForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    notes: [''],
  });

  get f() {
    return this.checkoutForm.controls;
  }

  constructor() {
    // If cart is empty and no order has just been submitted, navigate to cart
    if (this.cartService.items().length === 0 && !this.submittedOrder()) {
      setTimeout(() => {
        if (!this.submittedOrder()) {
          this.router.navigate(['/cart']);
        }
      }, 0);
    }
  }

  submitOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastService.error('Please complete all required fields correctly.');
      return;
    }

    if (this.cartService.items().length === 0) {
      this.toastService.error('Your shopping bag is empty.');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      customer: {
        fullName: this.checkoutForm.value.fullName,
        phone: this.checkoutForm.value.phone,
        address: this.checkoutForm.value.address,
        notes: this.checkoutForm.value.notes,
      },
      items: this.cartService.items().map((ci) => ({
        item: ci.item._id,
        quantity: ci.quantity,
      })),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.submittedOrder.set(res.data);
          // Requirement: Clear cart after successful order submission
          this.cartService.clearCart();
          this.toastService.success('Order placed successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Failed to submit order. Please check item availability.';
        this.toastService.error(msg);
      },
    });
  }
}
