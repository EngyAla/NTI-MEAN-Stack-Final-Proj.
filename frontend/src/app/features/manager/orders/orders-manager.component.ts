import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { Order } from '../../../core/models/ecommerce.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="orders-manager">
      <!-- Title Row -->
      <div class="title-row">
        <div>
          <h1 class="page-title">{{ 'manager.orders.title' | translate }}</h1>
          <p class="page-desc">
            {{ 'manager.orders.desc' | translate }}
          </p>
        </div>

        <button type="button" class="btn btn-outline btn-sm" (click)="loadOrders()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {{ 'manager.orders.refresh' | translate }}
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="filter-controls-card">
        <div class="filter-row">
          <!-- Status Filter Tabs -->
          <div class="status-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedStatus() === 'all'"
              (click)="setStatusFilter('all')"
            >
              {{ 'manager.orders.all' | translate }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedStatus() === 'opened'"
              (click)="setStatusFilter('opened')"
            >
              {{ 'manager.orders.opened' | translate }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedStatus() === 'closed'"
              (click)="setStatusFilter('closed')"
            >
              {{ 'manager.orders.closed' | translate }}
            </button>
          </div>

          <!-- Search Input -->
          <div class="search-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [placeholder]="'shop.filters.searchPlaceholder' | translate"
              class="form-control search-input"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
        </div>
      </div>

      <!-- Orders Table Card -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="luxury-table" *ngIf="orders().length > 0; else noOrders">
            <thead>
              <tr>
                <th>{{ 'checkout.orderRef' | translate }}</th>
                <th>{{ 'checkout.fullName' | translate }}</th>
                <th>{{ 'checkout.phone' | translate }}</th>
                <th>{{ 'common.date' | translate }}</th>
                <th>{{ 'cart.selectedPieces' | translate }}</th>
                <th>{{ 'common.total' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
                <th style="text-align: right;">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ord of orders()">
                <td>
                  <strong class="order-id-link" (click)="viewOrder(ord)">
                    {{ ord.orderNumber }}
                  </strong>
                </td>
                <td>
                  <strong>{{ ord.customer.fullName }}</strong>
                </td>
                <td>
                  <a [href]="'tel:' + ord.customer.phone" class="phone-link">
                    {{ ord.customer.phone }}
                  </a>
                </td>
                <td>{{ ord.createdAt | date:'MMM d, y, h:mm a' }}</td>
                <td>{{ ord.items.length }} {{ ord.items.length === 1 ? 'item' : 'items' }}</td>
                <td>
                  <strong>\${{ ord.totalPrice | number:'1.2-2' }}</strong>
                </td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-opened': ord.status === 'opened',
                      'badge-closed': ord.status === 'closed'
                    }"
                  >
                    {{ ord.status === 'opened' ? ('manager.stats.pendingCall' | translate) : ('manager.stats.fulfilled' | translate) }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    (click)="viewOrder(ord)"
                  >
                    {{ 'manager.orders.viewDetails' | translate }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noOrders>
            <div class="empty-table-box">
              <p>No orders found matching your filter criteria.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div class="modal-backdrop" *ngIf="activeOrder()">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div>
              <span class="order-badge-tag">{{ 'manager.orders.dossier' | translate }}</span>
              <h3>{{ activeOrder()?.orderNumber }}</h3>
            </div>
            <button type="button" class="btn btn-ghost btn-sm close-modal-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <div class="modal-body">
            <!-- Top Status Bar & Quick Toggle -->
            <div class="order-status-banner">
              <div class="current-status-display">
                <span class="status-label">{{ 'common.status' | translate }}:</span>
                <span
                  class="badge status-badge-lg"
                  [ngClass]="{
                    'badge-opened': activeOrder()?.status === 'opened',
                    'badge-closed': activeOrder()?.status === 'closed'
                  }"
                >
                  {{ activeOrder()?.status === 'opened' ? ('manager.stats.pendingCall' | translate) : ('manager.stats.fulfilled' | translate) }}
                </span>
              </div>

              <div class="status-toggle-controls">
                <button
                  *ngIf="activeOrder()?.status === 'opened'"
                  type="button"
                  class="btn btn-primary btn-sm"
                  (click)="updateStatus('closed')"
                >
                  {{ 'manager.orders.markClosed' | translate }}
                </button>
                <button
                  *ngIf="activeOrder()?.status === 'closed'"
                  type="button"
                  class="btn btn-outline btn-sm"
                  (click)="updateStatus('opened')"
                >
                  {{ 'manager.orders.reopen' | translate }}
                </button>
              </div>
            </div>

            <!-- Client & Delivery Details Grid -->
            <div class="details-section-grid">
              <div class="details-box">
                <h4 class="box-title">{{ 'checkout.clientInfo' | translate }}</h4>
                <div class="info-row">
                  <span class="lbl">{{ 'checkout.fullName' | translate }}:</span>
                  <span class="val">{{ activeOrder()?.customer?.fullName }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">{{ 'checkout.phone' | translate }}:</span>
                  <span class="val">
                    <a [href]="'tel:' + activeOrder()?.customer?.phone" class="phone-link">
                      {{ activeOrder()?.customer?.phone }}
                    </a>
                  </span>
                </div>
                <div class="info-row">
                  <span class="lbl">{{ 'common.date' | translate }}:</span>
                  <span class="val">{{ activeOrder()?.createdAt | date:'medium' }}</span>
                </div>
              </div>

              <div class="details-box">
                <h4 class="box-title">{{ 'checkout.address' | translate }}</h4>
                <p class="address-text">{{ activeOrder()?.customer?.address }}</p>
                <div class="client-notes-box" *ngIf="activeOrder()?.customer?.notes">
                  <strong>{{ 'checkout.notes' | translate }}:</strong>
                  <p>{{ activeOrder()?.customer?.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Ordered Items Snapshot Table -->
            <div class="ordered-items-box">
              <h4 class="box-title">{{ 'cart.selectedPieces' | translate }} (Snapshot)</h4>
              <table class="luxury-table items-snapshot-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">Piece</th>
                    <th>Product Snapshot (Bilingual)</th>
                    <th>{{ 'common.price' | translate }}</th>
                    <th style="text-align: center;">{{ 'common.qty' | translate }}</th>
                    <th style="text-align: right;">{{ 'common.subtotal' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let itm of activeOrder()?.items">
                    <td>
                      <img [src]="itm.imageUrl" [alt]="itm.name" class="snapshot-thumb" />
                    </td>
                    <td>
                      <strong>{{ itm.name }}</strong>
                      <div class="bilingual-sub" *ngIf="itm.nameObj?.ar && itm.nameObj?.en">
                        <span class="sub-pill">{{ itm.nameObj?.en }}</span> | <span class="sub-pill">{{ itm.nameObj?.ar }}</span>
                      </div>
                    </td>
                    <td>\${{ itm.price | number:'1.2-2' }}</td>
                    <td style="text-align: center;">{{ itm.quantity }}</td>
                    <td style="text-align: right;">
                      <strong>\${{ itm.subtotal | number:'1.2-2' }}</strong>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align: right; font-weight: 600;">
                      {{ 'common.total' | translate }}:
                    </td>
                    <td style="text-align: right; font-weight: 700; font-size: 1.15rem; color: var(--color-espresso);">
                      \${{ activeOrder()?.totalPrice | number:'1.2-2' }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Internal Manager Notes Editor -->
            <div class="internal-notes-card">
              <h4 class="box-title">{{ 'manager.orders.internalNotes' | translate }}</h4>
              <p class="notes-hint">
                {{ 'manager.orders.notesHint' | translate }}
              </p>
              <textarea
                class="form-control internal-notes-textarea"
                [(ngModel)]="editInternalNotes"
                placeholder="e.g. Called client at 2:30 PM. Delivery confirmed for Friday morning. White glove packaging requested..."
              ></textarea>
              <div class="notes-action-row">
                <button
                  type="button"
                  class="btn btn-gold btn-sm"
                  [disabled]="isSavingNotes()"
                  (click)="saveNotes()"
                >
                  <span *ngIf="!isSavingNotes()">{{ 'manager.orders.saveNotes' | translate }}</span>
                  <span *ngIf="isSavingNotes()">Saving...</span>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeModal()">{{ 'common.close' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        .page-title {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--color-espresso);
          margin-bottom: 0.25rem;
        }

        .page-desc {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
        }
      }

      .filter-controls-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
      }

      .filter-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .status-tabs {
        display: flex;
        gap: 0.5rem;
        background-color: var(--color-canvas);
        padding: 0.25rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
      }

      .tab-btn {
        background: transparent;
        border: none;
        padding: 0.45rem 1rem;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: var(--transition-fast);

        &.active {
          background-color: #ffffff;
          color: var(--color-espresso);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }
      }

      .search-wrap {
        position: relative;
        min-width: 280px;

        svg {
          position: absolute;
          inset-inline-start: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          padding-inline-start: 2.5rem;
        }
      }

      .table-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .order-id-link {
        color: var(--color-gold-dark);
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }

      .phone-link {
        color: var(--color-espresso);
        text-decoration: none;
        &:hover {
          color: var(--color-gold);
          text-decoration: underline;
        }
      }

      .empty-table-box {
        padding: 4rem;
        text-align: center;
        color: var(--color-text-muted);
      }

      .bilingual-sub {
        font-size: 0.72rem;
        color: var(--color-text-muted);
        margin-top: 0.15rem;
      }

      .sub-pill {
        display: inline-block;
      }

      /* Modal Details */
      .order-badge-tag {
        font-size: 0.72rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-gold);
        font-weight: 600;
        display: block;
      }

      .order-status-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-canvas);
        border: 1px solid var(--color-border);
        padding: 1rem 1.25rem;
        border-radius: var(--radius-sm);
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .status-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-inline-end: 0.75rem;
      }

      .status-badge-lg {
        font-size: 0.85rem;
        padding: 0.35rem 0.85rem;
      }

      .details-section-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .details-box {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 1.25rem;

        .box-title {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--color-espresso);
          margin-bottom: 0.85rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          padding: 0.3rem 0;

          .lbl {
            color: var(--color-text-secondary);
          }
          .val {
            font-weight: 500;
          }
        }

        .address-text {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--color-espresso);
        }

        .client-notes-box {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background-color: #faf7f2;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;

          strong {
            color: var(--color-gold-dark);
            display: block;
            margin-bottom: 0.25rem;
          }
        }
      }

      .ordered-items-box {
        margin-bottom: 1.5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;

        .box-title {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--color-espresso);
          padding: 1rem 1.25rem;
          background-color: #ffffff;
          border-bottom: 1px solid var(--color-border);
        }
      }

      .snapshot-thumb {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-sm);
        object-fit: cover;
        border: 1px solid var(--color-border);
      }

      .internal-notes-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 1.25rem;

        .box-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          margin-bottom: 0.25rem;
        }

        .notes-hint {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .internal-notes-textarea {
          min-height: 90px;
          margin-bottom: 0.85rem;
        }

        .notes-action-row {
          display: flex;
          justify-content: flex-end;
        }
      }

      .close-modal-btn {
        font-size: 1.5rem;
        line-height: 1;
        padding: 0.2rem 0.5rem;
      }
    `,
  ],
})
export class OrdersManagerComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);

  orders = signal<Order[]>([]);
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');

  activeOrder = signal<Order | null>(null);
  editInternalNotes = '';
  isSavingNotes = signal(false);

  constructor() {
    effect(() => {
      const currentLang = this.languageService.currentLang();
      if (currentLang) {
        this.loadOrders();
      }
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService
      .getOrders(this.selectedStatus(), this.searchQuery())
      .subscribe({
        next: (data) => this.orders.set(data),
        error: (err) => console.error('Failed to load orders', err),
      });
  }

  setStatusFilter(status: string) {
    this.selectedStatus.set(status);
    this.loadOrders();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.loadOrders();
  }

  viewOrder(order: Order) {
    this.activeOrder.set(order);
    this.editInternalNotes = order.internalNotes || '';
  }

  closeModal() {
    this.activeOrder.set(null);
  }

  updateStatus(newStatus: 'opened' | 'closed') {
    const ord = this.activeOrder();
    if (!ord) return;

    this.orderService.updateOrderStatus(ord._id, newStatus).subscribe({
      next: (updated) => {
        this.activeOrder.set(updated);
        this.toastService.success(`Order status updated to "${updated.status}".`);
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update order status.';
        this.toastService.error(msg);
      },
    });
  }

  saveNotes() {
    const ord = this.activeOrder();
    if (!ord) return;

    this.isSavingNotes.set(true);
    this.orderService.updateOrderNotes(ord._id, this.editInternalNotes).subscribe({
      next: (updated) => {
        this.isSavingNotes.set(false);
        this.activeOrder.set(updated);
        this.toastService.success('Internal order notes saved successfully.');
        this.loadOrders();
      },
      error: (err) => {
        this.isSavingNotes.set(false);
        const msg = err.error?.message || 'Failed to update order notes.';
        this.toastService.error(msg);
      },
    });
  }
}