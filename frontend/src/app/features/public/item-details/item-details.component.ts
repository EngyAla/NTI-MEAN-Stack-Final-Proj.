import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ItemService } from '../../../core/services/item.service';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Item } from '../../../core/models/ecommerce.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="item-details-page" *ngIf="item(); else loadingTpl">
      <!-- Breadcrumb Bar -->
      <div class="breadcrumb-bar">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">Home</a>
            <span class="sep">/</span>
            <a routerLink="/shop">Shop Collection</a>
            <span class="sep">/</span>
            <a [routerLink]="['/shop']" [queryParams]="{ category: categoryId }" *ngIf="categoryName">
              {{ categoryName }}
            </a>
            <span class="sep" *ngIf="categoryName">/</span>
            <span class="current">{{ item()?.name }}</span>
          </nav>
        </div>
      </div>

      <!-- Main Product Details Container -->
      <section class="section product-details-section">
        <div class="container">
          <div class="details-grid">
            <!-- Left: Visual Gallery -->
            <div class="gallery-column">
              <div class="main-image-frame">
                <img [src]="activeImage()" [alt]="item()?.name" class="main-image" />
              </div>

              <!-- Thumbnails -->
              <div class="thumbnails-row" *ngIf="galleryImages().length > 1">
                <button
                  type="button"
                  *ngFor="let img of galleryImages()"
                  class="thumb-btn"
                  [class.active]="activeImage() === img"
                  (click)="activeImage.set(img)"
                >
                  <img [src]="img" [alt]="item()?.name" />
                </button>
              </div>
            </div>

            <!-- Right: Product Specs & Actions -->
            <div class="info-column">
              <span class="category-pill" *ngIf="categoryName">{{ categoryName }}</span>
              <h1 class="item-title">{{ item()?.name }}</h1>
              <div class="price-box">
                <span class="item-price">\${{ item()?.price | number:'1.2-2' }}</span>
                <span class="tax-note">Complimentary concierge delivery included</span>
              </div>

              <div class="divider"></div>

              <p class="item-desc">{{ item()?.description }}</p>

              <!-- Luxury Specifications -->
              <div class="specs-accordion">
                <div class="spec-row" *ngIf="item()?.material">
                  <span class="spec-label">Material & Finish</span>
                  <span class="spec-value">{{ item()?.material }}</span>
                </div>
                <div class="spec-row" *ngIf="item()?.dimensions">
                  <span class="spec-label">Dimensions & Fit</span>
                  <span class="spec-value">{{ item()?.dimensions }}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Packaging</span>
                  <span class="spec-value">Custom velvet dust pouch & hard-shell presentation box</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Ordering Method</span>
                  <span class="spec-value">Direct phone confirmation via atelier manager</span>
                </div>
              </div>

              <div class="divider"></div>

              <!-- Purchase Actions -->
              <div class="purchase-controls">
                <div class="quantity-selector">
                  <button
                    type="button"
                    class="qty-btn"
                    (click)="decrementQty()"
                    [disabled]="selectedQty() <= 1"
                    aria-label="Decrease quantity"
                  >
                    &minus;
                  </button>
                  <span class="qty-display">{{ selectedQty() }}</span>
                  <button
                    type="button"
                    class="qty-btn"
                    (click)="incrementQty()"
                    aria-label="Increase quantity"
                  >
                    &plus;
                  </button>
                </div>

                <button type="button" class="btn btn-primary btn-lg add-to-bag-btn" (click)="addToBag()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Add to Shopping Bag
                </button>

                <button
                  type="button"
                  class="btn btn-outline favorite-toggle-btn"
                  [class.active]="item() && favoriteService.isFavorite(item()!._id)"
                  (click)="toggleWishlist()"
                  title="Toggle wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    [attr.fill]="item() && favoriteService.isFavorite(item()!._id) ? '#C2A26F' : 'none'"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <!-- Concierge Notice Box -->
              <div class="concierge-callout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                  <strong>Telephone Purchase Service</strong>
                  <p>When you submit your order, our dedicated store manager will contact you directly by phone to verify details and arrange white-glove delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Items Section -->
      <section class="section related-section bg-cream" *ngIf="relatedItems().length > 0">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Harmonious Accents</span>
            <h2 class="section-title">You May Also Admire</h2>
          </div>
          <div class="related-grid">
            <app-product-card *ngFor="let rel of relatedItems()" [item]="rel"></app-product-card>
          </div>
        </div>
      </section>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-full">
        <div class="spinner"></div>
        <span>Presenting creation details...</span>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .breadcrumb-bar {
        background-color: #ffffff;
        border-bottom: 1px solid var(--color-border);
        padding: 0.85rem 0;
      }

      .breadcrumb-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        flex-wrap: wrap;

        a {
          color: var(--color-text-secondary);
          &:hover {
            color: var(--color-espresso);
          }
        }

        .sep {
          opacity: 0.4;
        }

        .current {
          color: var(--color-espresso);
          font-weight: 600;
        }
      }

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4.5rem;
      }

      .gallery-column {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .main-image-frame {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .thumbnails-row {
        display: flex;
        gap: 0.85rem;
      }

      .thumb-btn {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border);
        background-color: #ffffff;
        padding: 0;
        cursor: pointer;
        overflow: hidden;
        transition: var(--transition-fast);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.active,
        &:hover {
          border-color: var(--color-gold);
        }
      }

      .info-column {
        display: flex;
        flex-direction: column;
      }

      .category-pill {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--color-gold-dark);
        margin-bottom: 0.65rem;
      }

      .item-title {
        font-family: var(--font-serif);
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        line-height: 1.2;
        margin-bottom: 1.25rem;
      }

      .price-box {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 1.5rem;

        .item-price {
          font-family: var(--font-sans);
          font-size: 1.85rem;
          font-weight: 600;
          color: var(--color-espresso);
          letter-spacing: -0.01em;
        }

        .tax-note {
          font-size: 0.82rem;
          color: var(--color-text-muted);
        }
      }

      .divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 1.75rem 0;
      }

      .item-desc {
        font-size: 1.05rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
      }

      .specs-accordion {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .spec-row {
        display: flex;
        justify-content: space-between;
        padding: 0.65rem 0;
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: 0.88rem;

        .spec-label {
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .spec-value {
          color: var(--color-text-primary);
          font-weight: 600;
          text-align: right;
          max-width: 60%;
        }
      }

      .purchase-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .quantity-selector {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--color-border);
        background-color: #ffffff;
        border-radius: var(--radius-sm);
        height: 52px;

        .qty-btn {
          width: 44px;
          height: 100%;
          background: transparent;
          border: none;
          font-size: 1.2rem;
          color: var(--color-espresso);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);

          &:hover:not(:disabled) {
            background-color: var(--color-cream);
          }

          &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
        }

        .qty-display {
          width: 40px;
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
        }
      }

      .add-to-bag-btn {
        flex: 1;
        height: 52px;
      }

      .favorite-toggle-btn {
        width: 52px;
        height: 52px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &.active {
          color: var(--color-gold-dark);
          border-color: var(--color-gold);
        }
      }

      .concierge-callout {
        display: flex;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background-color: var(--color-cream);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        line-height: 1.5;

        svg {
          color: var(--color-gold-dark);
          flex-shrink: 0;
          margin-top: 2px;
        }

        strong {
          color: var(--color-espresso);
          display: block;
          margin-bottom: 0.2rem;
        }
      }

      .related-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      .loading-full {
        text-align: center;
        padding: 8rem 1rem;
        color: var(--color-text-muted);

        .spinner {
          width: 40px;
          height: 40px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1.5rem;
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 992px) {
        .details-grid {
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        .related-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 600px) {
        .purchase-controls {
          flex-wrap: wrap;
        }
        .add-to-bag-btn {
          width: 100%;
          order: 3;
        }
        .related-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ItemDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);

  item = signal<Item | null>(null);
  activeImage = signal<string>('');
  selectedQty = signal<number>(1);
  relatedItems = signal<Item[]>([]);

  get categoryName(): string {
    const it = this.item();
    if (!it || !it.category) return '';
    return typeof it.category === 'object' ? it.category.name : '';
  }

  get categoryId(): string {
    const it = this.item();
    if (!it || !it.category) return '';
    return typeof it.category === 'object' ? it.category._id : it.category;
  }

  get galleryImages(): () => string[] {
    return () => {
      const it = this.item();
      if (!it) return [];
      const set = new Set<string>();
      if (it.imageUrl) set.add(it.imageUrl);
      if (it.images) it.images.forEach((img) => set.add(img));
      return Array.from(set);
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.selectedQty.set(1);
        this.loadItem(id);
      }
    });
  }

  loadItem(id: string) {
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.activeImage.set(item.imageUrl);
        this.loadRelated(item);
      },
      error: (err) => console.error('Failed to load item', err),
    });
  }

  loadRelated(currentItem: Item) {
    const catId = typeof currentItem.category === 'object' ? currentItem.category._id : currentItem.category;
    if (catId) {
      this.itemService.getItemsByCategory(catId).subscribe({
        next: (items) => {
          this.relatedItems.set(
            items.filter((i) => i._id !== currentItem._id).slice(0, 4)
          );
        },
      });
    }
  }

  incrementQty() {
    this.selectedQty.update((q) => q + 1);
  }

  decrementQty() {
    if (this.selectedQty() > 1) {
      this.selectedQty.update((q) => q - 1);
    }
  }

  addToBag() {
    const current = this.item();
    if (current) {
      this.cartService.addToCart(current, this.selectedQty());
    }
  }

  toggleWishlist() {
    const current = this.item();
    if (current) {
      this.favoriteService.toggleFavorite(current);
    }
  }
}
