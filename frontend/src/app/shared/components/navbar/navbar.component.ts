import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageSwitcherComponent],
  template: `
    <!-- Top Announcement Bar -->
    <div class="announcement-bar">
      <div class="container text-center">
        <span class="announcement-text">
          {{ 'navigation.announcement' | translate }}
        </span>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="luxury-navbar">
      <div class="container nav-content">
        <!-- Mobile Menu Toggle -->
        <button
          type="button"
          class="mobile-menu-btn"
          (click)="mobileMenuOpen.set(!mobileMenuOpen())"
          aria-label="Toggle navigation"
        >
          <svg *ngIf="!mobileMenuOpen()" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg *ngIf="mobileMenuOpen()" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Brand Identity Logo -->
        <div class="nav-brand">
          <a routerLink="/" class="brand-link" (click)="mobileMenuOpen.set(false)">
            <span class="brand-name">{{ 'navigation.brand' | translate }}</span>
            <span class="brand-sub">{{ 'navigation.brandSub' | translate }}</span>
          </a>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">{{ 'navigation.home' | translate }}</a>
          <a routerLink="/shop" routerLinkActive="active" class="nav-link">{{ 'navigation.shop' | translate }}</a>
          <a routerLink="/shop" [queryParams]="{ category: 'handbags' }" class="nav-link">{{ 'navigation.handbags' | translate }}</a>
          <a routerLink="/shop" [queryParams]="{ category: 'timepieces' }" class="nav-link">{{ 'navigation.timepieces' | translate }}</a>
          <a routerLink="/shop" [queryParams]="{ category: 'jewelry' }" class="nav-link">{{ 'navigation.jewelry' | translate }}</a>
        </nav>

        <!-- Right Action Icons -->
        <div class="nav-actions">
          <!-- Language Switcher -->
          <app-language-switcher></app-language-switcher>

          <!-- Wishlist -->
          <a routerLink="/favorites" class="action-icon-btn" [title]="'navigation.wishlist' | translate">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="badge-count" *ngIf="favoriteService.favoriteCount() > 0">
              {{ favoriteService.favoriteCount() }}
            </span>
          </a>

          <!-- Shopping Bag -->
          <a routerLink="/cart" class="action-icon-btn bag-btn" [title]="'navigation.bag' | translate">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span class="badge-count" *ngIf="cartService.cartCount() > 0">
              {{ cartService.cartCount() }}
            </span>
          </a>

          <!-- Manager Portal Link -->
          <a
            [routerLink]="authService.isAuthenticated() ? '/manager/dashboard' : '/manager/login'"
            class="action-icon-btn manager-link"
            [title]="authService.isAuthenticated() ? ('manager.nav.overview' | translate) : ('navigation.managerPortal' | translate)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" *ngIf="mobileMenuOpen()">
        <div class="mobile-drawer-inner">
          <div class="mobile-lang-row">
            <app-language-switcher></app-language-switcher>
          </div>
          <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">{{ 'navigation.home' | translate }}</a>
          <a routerLink="/shop" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">{{ 'navigation.allAccessories' | translate }}</a>
          <a routerLink="/favorites" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
            {{ 'navigation.wishlist' | translate }} ({{ favoriteService.favoriteCount() }})
          </a>
          <a routerLink="/cart" (click)="mobileMenuOpen.set(false)" class="mobile-nav-link">
            {{ 'navigation.bag' | translate }} ({{ cartService.cartCount() }})
          </a>
          <div class="mobile-divider"></div>
          <a
            [routerLink]="authService.isAuthenticated() ? '/manager/dashboard' : '/manager/login'"
            (click)="mobileMenuOpen.set(false)"
            class="mobile-nav-link manager-portal-text"
          >
            {{ 'navigation.managerPortal' | translate }}
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .announcement-bar {
        background-color: var(--color-espresso);
        color: var(--color-gold-pale);
        padding: 0.5rem 1rem;
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .luxury-navbar {
        background-color: rgba(253, 251, 247, 0.94);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
        z-index: 100;
        transition: var(--transition-fast);
      }

      .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 78px;
      }

      .mobile-menu-btn {
        display: none;
        background: transparent;
        border: none;
        color: var(--color-espresso);
        cursor: pointer;
        padding: 0.5rem;
      }

      .nav-brand {
        display: flex;
        align-items: center;

        .brand-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
        }

        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: var(--color-espresso);
          line-height: 1;
        }

        .brand-sub {
          font-family: var(--font-sans);
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.42em;
          color: var(--color-gold-dark);
          margin-top: 0.2rem;
        }
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 2.25rem;

        .nav-link {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--color-text-secondary);
          position: relative;
          padding: 0.5rem 0;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 1.5px;
            background-color: var(--color-gold);
            transition: width var(--transition-fast);
          }

          &:hover,
          &.active {
            color: var(--color-espresso);

            &::after {
              width: 100%;
            }
          }
        }
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .action-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-espresso);
          padding: 0.45rem;
          transition: var(--transition-fast);

          &:hover {
            color: var(--color-gold-dark);
            transform: translateY(-1px);
          }
        }

        .manager-link {
          color: var(--color-text-muted);
          border-left: 1px solid var(--color-border);
          padding-left: 1rem;
          margin-left: 0.25rem;

          &:hover {
            color: var(--color-espresso);
          }
        }

        .badge-count {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--color-gold-dark);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }
      }

      /* Mobile Drawer */
      .mobile-drawer {
        display: none;
        background-color: #ffffff;
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-md);
      }

      .mobile-drawer-inner {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .mobile-lang-row {
        display: flex;
        justify-content: flex-start;
        padding-bottom: 0.5rem;
      }

      .mobile-nav-link {
        font-size: 0.95rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-espresso);
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--color-border-subtle);
      }

      .mobile-divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 0.5rem 0;
      }

      .manager-portal-text {
        color: var(--color-gold-dark);
      }

      @media (max-width: 890px) {
        .mobile-menu-btn {
          display: block;
        }

        .nav-links {
          display: none;
        }

        .mobile-drawer {
          display: block;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  authService = inject(AuthService);

  mobileMenuOpen = signal(false);
}
