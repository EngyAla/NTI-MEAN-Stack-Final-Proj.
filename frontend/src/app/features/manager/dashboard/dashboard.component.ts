import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStats } from '../../../core/models/ecommerce.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="dashboard-overview">
      <!-- Page Header -->
      <div class="page-title-row">
        <div>
          <h1 class="page-title">{{ 'manager.stats.title' | translate }}</h1>
          <p class="page-desc">{{ 'manager.stats.desc' | translate }}</p>
        </div>

        <div class="header-actions">
          <a routerLink="/manager/items" class="btn btn-outline btn-sm">
            {{ 'manager.stats.manageItems' | translate }}
          </a>
          <a routerLink="/manager/orders" class="btn btn-primary btn-sm">
            {{ 'manager.stats.viewAllOrders' | translate }}
          </a>
        </div>
      </div>

      <!-- Summary KPI Cards -->
      <div class="stats-grid" *ngIf="stats(); else loadingStats">
        <!-- Total Categories -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">{{ 'manager.stats.categories' | translate }}</span>
            <div class="stat-icon-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ stats()?.totalCategories }}</div>
          <span class="stat-foot">{{ 'manager.nav.categories' | translate }}</span>
        </div>

        <!-- Total Items -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">{{ 'manager.stats.items' | translate }}</span>
            <div class="stat-icon-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ stats()?.totalItems }}</div>
          <span class="stat-foot">{{ 'manager.nav.items' | translate }}</span>
        </div>

        <!-- Total Orders -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">{{ 'manager.stats.orders' | translate }}</span>
            <div class="stat-icon-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ stats()?.totalOrders }}</div>
          <span class="stat-foot">{{ 'manager.nav.orders' | translate }}</span>
        </div>

        <!-- Opened Orders -->
        <div class="stat-card alert-card">
          <div class="stat-header">
            <span class="stat-label">{{ 'manager.stats.openedOrders' | translate }}</span>
            <span class="badge badge-opened">{{ 'manager.stats.pendingCall' | translate }}</span>
          </div>
          <div class="stat-value stat-opened">{{ stats()?.openedOrders }}</div>
          <span class="stat-foot">{{ 'manager.stats.pendingCall' | translate }}</span>
        </div>

        <!-- Closed Orders -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">{{ 'manager.stats.closedOrders' | translate }}</span>
            <span class="badge badge-closed">{{ 'manager.stats.fulfilled' | translate }}</span>
          </div>
          <div class="stat-value stat-closed">{{ stats()?.closedOrders }}</div>
          <span class="stat-foot">{{ 'manager.stats.fulfilled' | translate }}</span>
        </div>
      </div>

      <ng-template #loadingStats>
        <div class="loading-box">
          <div class="spinner"></div>
          <span>Loading executive metrics...</span>
        </div>
      </ng-template>

      <!-- Recent Orders Table -->
      <div class="recent-orders-card" *ngIf="stats()?.recentOrders">
        <div class="card-header-bar">
          <div>
            <h3 class="card-title">{{ 'manager.stats.recentOrders' | translate }}</h3>
            <p class="card-subtitle">{{ 'manager.stats.recentOrdersDesc' | translate }}</p>
          </div>
          <a routerLink="/manager/orders" class="btn btn-outline btn-sm">
            {{ 'manager.stats.viewAllOrders' | translate }}
          </a>
        </div>

        <div class="table-responsive">
          <table class="luxury-table" *ngIf="stats()!.recentOrders.length > 0; else noRecentOrders">
            <thead>
              <tr>
                <th>{{ 'checkout.orderRef' | translate }}</th>
                <th>{{ 'checkout.fullName' | translate }}</th>
                <th>{{ 'checkout.phone' | translate }}</th>
                <th>{{ 'common.date' | translate }}</th>
                <th>{{ 'common.total' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
                <th>{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ord of stats()!.recentOrders">
                <td>
                  <strong>{{ ord.orderNumber }}</strong>
                </td>
                <td>{{ ord.customer.fullName }}</td>
                <td>
                  <a [href]="'tel:' + ord.customer.phone" class="phone-link">
                    {{ ord.customer.phone }}
                  </a>
                </td>
                <td>{{ ord.createdAt | date:'MMM d, y, h:mm a' }}</td>
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
                <td>
                  <a routerLink="/manager/orders" class="btn btn-ghost btn-sm">
                    {{ 'manager.orders.viewDetails' | translate }} &rarr;
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noRecentOrders>
            <div class="p-4 text-center text-muted">
              No orders have been submitted yet.
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-title-row {
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

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }

      .stat-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        transition: var(--transition-fast);

        &:hover {
          border-color: var(--color-gold-light);
          box-shadow: var(--shadow-sm);
        }

        &.alert-card {
          border-left: 3px solid #d4973b;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
        }

        .stat-icon-pill {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background-color: var(--color-cream);
          color: var(--color-gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          font-family: var(--font-serif);
          font-size: 2.4rem;
          font-weight: 600;
          color: var(--color-espresso);
          line-height: 1;
          margin-bottom: 0.5rem;

          &.stat-opened {
            color: #b07018;
          }

          &.stat-closed {
            color: #2e6b43;
          }
        }

        .stat-foot {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      }

      /* Recent Orders Card */
      .recent-orders-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;

        .card-header-bar {
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;

          .card-title {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            margin-bottom: 0.2rem;
          }

          .card-subtitle {
            font-size: 0.82rem;
            color: var(--color-text-secondary);
          }
        }
      }

      .phone-link {
        color: var(--color-gold-dark);
        font-weight: 500;
        &:hover {
          text-decoration: underline;
        }
      }

      .loading-box {
        text-align: center;
        padding: 4rem 1rem;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        margin-bottom: 2.5rem;

        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 1280px) {
        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load dashboard statistics', err),
    });
  }
}
