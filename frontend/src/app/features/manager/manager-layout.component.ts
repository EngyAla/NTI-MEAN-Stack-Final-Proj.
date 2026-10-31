import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="manager-layout">
      <!-- Dashboard Sidebar -->
      <aside class="dashboard-sidebar">
        <!-- Sidebar Brand -->
        <div class="sidebar-header">
          <span class="badge-role">Manager Console</span>
          <h2 class="sidebar-brand">AURELIA</h2>
          <span class="sidebar-sub">ATELIER EXECUTIVE</span>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav">
          <a
            routerLink="/manager/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Overview</span>
          </a>

          <a
            routerLink="/manager/categories"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Categories</span>
          </a>

          <a
            routerLink="/manager/items"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Items & Inventory</span>
          </a>

          <a
            routerLink="/manager/orders"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Orders Management</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <a routerLink="/" target="_blank" class="storefront-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>View Public Store</span>
          </a>

          <button type="button" class="logout-btn" (click)="authService.logout()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Dashboard Content -->
      <main class="dashboard-main">
        <!-- Top Navigation Bar -->
        <header class="top-nav">
          <div class="top-nav-left">
            <span class="live-indicator">
              <span class="dot"></span>
              Live Database Connected
            </span>
          </div>

          <div class="top-nav-right">
            <div class="manager-profile">
              <div class="avatar-circle">M</div>
              <div class="profile-info">
                <span class="profile-name">{{ authService.currentManager()?.name || 'Manager' }}</span>
                <span class="profile-role">Executive Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <!-- View Body -->
        <div class="dashboard-content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .manager-layout {
        display: flex;
        min-height: 100vh;
        background-color: #f7f5f0;
      }

      /* Sidebar */
      .dashboard-sidebar {
        width: 270px;
        background-color: var(--color-espresso);
        color: #ffffff;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        border-right: 1px solid rgba(194, 162, 111, 0.2);
      }

      .sidebar-header {
        padding: 2.25rem 1.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);

        .badge-role {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-gold-light);
          display: block;
          margin-bottom: 0.65rem;
        }

        .sidebar-brand {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          letter-spacing: 0.2em;
          color: #ffffff;
          line-height: 1;
        }

        .sidebar-sub {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.38em;
          color: var(--color-text-muted);
          display: block;
          margin-top: 0.35rem;
        }
      }

      .sidebar-nav {
        flex: 1;
        padding: 1.5rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          color: #c2b7a9;
          font-size: 0.86rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);

          svg {
            color: var(--color-gold);
            transition: var(--transition-fast);
          }

          &:hover {
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.06);

            svg {
              color: var(--color-gold-light);
            }
          }

          &.active {
            color: #ffffff;
            background-color: rgba(194, 162, 111, 0.16);
            border-left: 3px solid var(--color-gold);
            font-weight: 600;

            svg {
              color: var(--color-gold-light);
            }
          }
        }
      }

      .sidebar-footer {
        padding: 1.5rem 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .storefront-link,
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.82rem;
          color: #a89d8f;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;

          &:hover {
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.05);
          }
        }

        .logout-btn:hover {
          color: #e57373;
        }
      }

      /* Main Dashboard Body */
      .dashboard-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow-x: hidden;
      }

      .top-nav {
        height: 72px;
        background-color: #ffffff;
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2.5rem;
      }

      .live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #2e6b43;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3bb262;
          box-shadow: 0 0 0 3px rgba(59, 178, 98, 0.2);
        }
      }

      .manager-profile {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: var(--color-gold-pale);
          border: 1px solid var(--color-gold);
          color: var(--color-gold-dark);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
        }

        .profile-info {
          display: flex;
          flex-direction: column;

          .profile-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-espresso);
          }

          .profile-role {
            font-size: 0.72rem;
            color: var(--color-text-muted);
          }
        }
      }

      .dashboard-content-area {
        flex: 1;
        padding: 2.5rem;
      }

      @media (max-width: 900px) {
        .dashboard-sidebar {
          width: 220px;
        }
        .dashboard-content-area {
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class ManagerLayoutComponent {
  authService = inject(AuthService);
}
