import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, EmptyStateComponent, TranslatePipe],
  template: `
    <div class="favorites-page">
      <!-- Header -->
      <section class="favorites-header">
        <div class="container text-center">
          <span class="sub-label">{{ 'navigation.brand' | translate }} {{ 'navigation.brandSub' | translate }}</span>
          <h1 class="page-title">{{ 'favorites.title' | translate }}</h1>
          <p class="page-desc">
            {{ 'favorites.desc' | translate }}
          </p>
        </div>
      </section>

      <!-- Content Area -->
      <section class="section favorites-content">
        <div class="container">
          <div *ngIf="favoriteService.favorites().length > 0; else emptyTpl">
            <div class="wishlist-bar">
              <span class="count-tag">
                {{ favoriteService.favoriteCount() }} {{ 'favorites.piecesSaved' | translate }}
              </span>
            </div>

            <div class="favorites-grid">
              <app-product-card
                *ngFor="let item of favoriteService.favorites()"
                [item]="item"
              ></app-product-card>
            </div>
          </div>

          <ng-template #emptyTpl>
            <app-empty-state
              [title]="'favorites.emptyTitle' | translate"
              [description]="'favorites.emptyDesc' | translate"
              [actionText]="'favorites.emptyBtn' | translate"
              actionRoute="/shop"
            ></app-empty-state>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .favorites-header {
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

      .wishlist-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border-subtle);

        .count-tag {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
        }
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      @media (max-width: 1100px) {
        .favorites-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 820px) {
        .favorites-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 540px) {
        .favorites-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FavoritesComponent {
  favoriteService = inject(FavoriteService);
  cartService = inject(CartService);
}
