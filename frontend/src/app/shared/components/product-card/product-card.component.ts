import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../../core/models/ecommerce.model';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="product-card">
      <div class="card-media">
        <a [routerLink]="['/item', item._id]" class="media-link">
          <img [src]="item.imageUrl" [alt]="item.name" loading="lazy" class="product-img" />
        </a>

        <!-- Wishlist / Favorite Button -->
        <button
          type="button"
          class="favorite-btn"
          [class.is-active]="favoriteService.isFavorite(item._id)"
          (click)="toggleWishlist($event)"
          [attr.aria-label]="favoriteService.isFavorite(item._id) ? ('product.removeFromWishlist' | translate) : ('product.addToWishlist' | translate)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            [attr.fill]="favoriteService.isFavorite(item._id) ? '#C2A26F' : 'none'"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <!-- Quick Add Overlay / Button -->
        <div class="card-overlay">
          <button type="button" class="quick-add-btn" (click)="addToBag($event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {{ 'product.addToBag' | translate }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <span class="category-label" *ngIf="categoryName">{{ categoryName }}</span>
        <h4 class="product-name">
          <a [routerLink]="['/item', item._id]">{{ item.name }}</a>
        </h4>
        <div class="price-row">
          <span class="product-price">\${{ item.price | number:'1.2-2' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        transition: var(--transition-smooth);
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        overflow: hidden;

        &:hover {
          border-color: var(--color-gold-light);
          box-shadow: var(--shadow-md);

          .product-img {
            transform: scale(1.04);
          }

          .card-overlay {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      .card-media {
        position: relative;
        width: 100%;
        padding-top: 105%; /* Consistent luxury square-ish ratio */
        background-color: #faf7f2;
        overflow: hidden;
      }

      .media-link {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: block;
      }

      .product-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .favorite-btn {
        position: absolute;
        top: 0.85rem;
        right: 0.85rem;
        z-index: 2;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(232, 225, 213, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: var(--transition-fast);

        &:hover {
          background-color: #ffffff;
          color: var(--color-gold-dark);
          transform: scale(1.06);
        }

        &.is-active {
          color: var(--color-gold-dark);
          border-color: var(--color-gold-light);
        }
      }

      .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.85rem;
        background: linear-gradient(to top, rgba(28, 22, 17, 0.45) 0%, transparent 100%);
        opacity: 0;
        transform: translateY(8px);
        transition: var(--transition-normal);
        display: flex;
        justify-content: center;
        z-index: 2;
      }

      .quick-add-btn {
        width: 100%;
        padding: 0.65rem 1rem;
        font-family: var(--font-sans);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        background-color: #ffffff;
        color: var(--color-espresso);
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: var(--transition-fast);

        &:hover {
          background-color: var(--color-espresso);
          color: #ffffff;
        }
      }

      .card-body {
        padding: 1.25rem 1.15rem 1.35rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .category-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--color-gold-dark);
        margin-bottom: 0.4rem;
        display: block;
      }

      .product-name {
        font-family: var(--font-serif);
        font-size: 1.18rem;
        font-weight: 500;
        line-height: 1.35;
        margin-bottom: 0.65rem;
        flex-grow: 1;

        a {
          color: var(--color-espresso);
          &:hover {
            color: var(--color-gold-dark);
          }
        }
      }

      .price-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 0.5rem;
        border-top: 1px solid var(--color-border-subtle);
      }

      .product-price {
        font-family: var(--font-sans);
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--color-espresso);
        letter-spacing: -0.01em;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input({ required: true }) item!: Item;

  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);

  get categoryName(): string {
    if (!this.item.category) return '';
    if (typeof this.item.category === 'string') return '';
    return this.item.category.name || '';
  }

  toggleWishlist(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteService.toggleFavorite(this.item);
  }

  addToBag(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.item, 1);
  }
}
