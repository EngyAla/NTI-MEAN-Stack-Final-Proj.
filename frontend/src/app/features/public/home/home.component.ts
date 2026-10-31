import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ItemService } from '../../../core/services/item.service';
import { Category, Item } from '../../../core/models/ecommerce.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <!-- Editorial Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <span class="hero-eyebrow">Autumn / Winter 2026 Collection</span>
          <h1 class="hero-title">The Art of Everyday Elegance</h1>
          <p class="hero-description">
            Subtle prestige, handcrafted in limited numbers. Explore our bespoke curation of Tuscan leather bags, Swiss calibers, and solid gold heirlooms.
          </p>
          <div class="hero-cta-group">
            <a routerLink="/shop" class="btn btn-gold btn-lg">Explore Collection</a>
            <a routerLink="/shop" [queryParams]="{ featured: 'true' }" class="btn btn-outline-white btn-lg">
              Featured Pieces
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Luxury Value Pillars -->
    <section class="pillars-section">
      <div class="container">
        <div class="pillars-grid">
          <div class="pillar-item">
            <div class="pillar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h4>Artisan Heritage</h4>
            <p>Every piece is individually handcrafted in Florence and Geneva by master artisans.</p>
          </div>

          <div class="pillar-item">
            <div class="pillar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h4>Pure Quiet Luxury</h4>
            <p>Unadorned with ostentatious logos. Defined by exceptional materiality and proportion.</p>
          </div>

          <div class="pillar-item">
            <div class="pillar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h4>Dedicated Telephone Concierge</h4>
            <p>Orders are personally confirmed and arranged via phone with our atelier manager.</p>
          </div>

          <div class="pillar-item">
            <div class="pillar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h4>Signature Packaging</h4>
            <p>Delivered in hand-stitched velvet pouches and heavyweight embossed gift boxes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories Section -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Curated Disciplines</span>
          <h2 class="section-title">Explore by Category</h2>
          <p class="section-subtitle">
            From architectural leather goods to Swiss mechanical horology, discover our distinct departments.
          </p>
        </div>

        <div class="categories-grid" *ngIf="categories().length > 0; else loadingCats">
          <a
            *ngFor="let cat of categories()"
            [routerLink]="['/shop']"
            [queryParams]="{ category: cat._id }"
            class="category-card"
          >
            <div class="category-img-box">
              <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" class="category-img" />
              <div class="category-card-overlay"></div>
            </div>
            <div class="category-card-info">
              <h3 class="cat-name">{{ cat.name }}</h3>
              <span class="cat-count" *ngIf="cat.itemCount !== undefined">
                {{ cat.itemCount }} {{ cat.itemCount === 1 ? 'Design' : 'Designs' }}
              </span>
              <span class="cat-explore-btn">
                Discover
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            </div>
          </a>
        </div>

        <ng-template #loadingCats>
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Gathering atelier collections...</span>
          </div>
        </ng-template>
      </div>
    </section>

    <!-- Featured Products Showcase -->
    <section class="section featured-products-section bg-cream">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Masterpiece Selection</span>
          <h2 class="section-title">Featured Creations</h2>
          <p class="section-subtitle">
            Icons of the maison, celebrated for their exceptional tactile richness and timeless balance.
          </p>
        </div>

        <div class="products-grid" *ngIf="featuredItems().length > 0; else loadingItems">
          <app-product-card *ngFor="let item of featuredItems()" [item]="item"></app-product-card>
        </div>

        <ng-template #loadingItems>
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Selecting showcase pieces...</span>
          </div>
        </ng-template>

        <div class="text-center mt-5">
          <a routerLink="/shop" class="btn btn-primary btn-lg">View Complete Catalog</a>
        </div>
      </div>
    </section>

    <!-- Brand Introduction & Quiet Luxury Heritage -->
    <section class="section heritage-section">
      <div class="container">
        <div class="heritage-grid">
          <div class="heritage-media">
            <div class="media-frame">
              <!-- Strictly accessories product flat-lay -->
              <img
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80"
                alt="Aurelia fine accessories craft"
                class="heritage-img"
              />
              <div class="gold-accent-badge">
                <span class="year">MMXXVI</span>
                <span class="label">Atelier d’Art</span>
              </div>
            </div>
          </div>

          <div class="heritage-text">
            <span class="section-tag">The Philosophy</span>
            <h2 class="heritage-title">Understated Luxury for the Discerning Connoisseur</h2>
            <p class="lead-para">
              True luxury does not clamor for attention. It speaks in the whisper of hand-buffed calfskin edges, the precise mechanical click of a Swiss deployant clasp, and the warm resonance of 18k solid gold.
            </p>
            <p class="body-para">
              At Aurelia Atelier, our creations exist beyond transient seasonal cycles. We employ traditional vegetable tanning methods that allow our leather to develop a luminous patina over decades of personal companionship.
            </p>
            <div class="heritage-metrics">
              <div class="metric">
                <span class="metric-num">100%</span>
                <span class="metric-label">Certified Fine Materials</span>
              </div>
              <div class="metric">
                <span class="metric-num">0</span>
                <span class="metric-label">Mass Industrial Production</span>
              </div>
              <div class="metric">
                <span class="metric-num">1:1</span>
                <span class="metric-label">Personal Phone Concierge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Phone Ordering Banner -->
    <section class="concierge-banner-section">
      <div class="container">
        <div class="concierge-banner-box">
          <div class="concierge-icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="concierge-content">
            <h3 class="concierge-heading">Personal Telephone Ordering Service</h3>
            <p class="concierge-text">
              No online card payments required. Submit your bag selection, and our private concierge manager will reach out directly to review sizing, delivery schedule, and gift packaging options.
            </p>
          </div>
          <div class="concierge-action">
            <a routerLink="/shop" class="btn btn-gold">Browse Collection</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      /* Hero Section */
      .hero-section {
        position: relative;
        min-height: 85vh;
        display: flex;
        align-items: center;
        background-color: var(--color-espresso);
        background-image: url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85');
        background-size: cover;
        background-position: center;
        color: #ffffff;
      }

      .hero-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to right,
          rgba(28, 22, 17, 0.88) 0%,
          rgba(28, 22, 17, 0.65) 50%,
          rgba(28, 22, 17, 0.35) 100%
        );
      }

      .hero-container {
        position: relative;
        z-index: 2;
        padding-top: 4rem;
        padding-bottom: 4rem;
      }

      .hero-content {
        max-width: 650px;
      }

      .hero-eyebrow {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: var(--color-gold-light);
        margin-bottom: 1.25rem;
      }

      .hero-title {
        color: #ffffff;
        font-size: clamp(2.5rem, 5vw, 4.2rem);
        font-weight: 500;
        line-height: 1.15;
        margin-bottom: 1.5rem;
      }

      .hero-description {
        font-size: 1.15rem;
        color: #dcd4c7;
        line-height: 1.7;
        margin-bottom: 2.5rem;
        font-weight: 300;
      }

      .hero-cta-group {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      .btn-outline-white {
        background-color: transparent;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.6);

        &:hover {
          background-color: #ffffff;
          color: var(--color-espresso);
        }
      }

      /* Pillars */
      .pillars-section {
        background-color: #ffffff;
        border-bottom: 1px solid var(--color-border);
        padding: 3.5rem 0;
      }

      .pillars-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2.5rem;
      }

      .pillar-item {
        text-align: center;

        .pillar-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-color: var(--color-cream);
          color: var(--color-gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          border: 1px solid var(--color-border);
        }

        h4 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          color: var(--color-espresso);
        }

        p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
      }

      /* Categories Grid */
      .categories-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }

      .category-card {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border);
        background-color: #ffffff;
        border-radius: var(--radius-sm);
        overflow: hidden;
        transition: var(--transition-smooth);

        &:hover {
          border-color: var(--color-gold-light);
          box-shadow: var(--shadow-md);

          .category-img {
            transform: scale(1.05);
          }

          .cat-explore-btn {
            color: var(--color-gold-dark);
            gap: 0.6rem;
          }
        }
      }

      .category-img-box {
        position: relative;
        width: 100%;
        padding-top: 80%;
        overflow: hidden;
        background-color: #faf7f2;
      }

      .category-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .category-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgba(28, 22, 17, 0.35) 0%, transparent 60%);
      }

      .category-card-info {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
      }

      .cat-name {
        font-family: var(--font-serif);
        font-size: 1.35rem;
        margin-bottom: 0.25rem;
        color: var(--color-espresso);
      }

      .cat-count {
        font-size: 0.78rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 1.15rem;
      }

      .cat-explore-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--color-espresso);
        transition: var(--transition-fast);
      }

      /* Featured Products Grid */
      .products-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      .mt-5 {
        margin-top: 3.5rem;
      }

      /* Heritage Section */
      .heritage-grid {
        display: grid;
        grid-template-columns: 1fr 1.15fr;
        gap: 5rem;
        align-items: center;
      }

      .heritage-media {
        position: relative;
      }

      .media-frame {
        position: relative;
        border-radius: var(--radius-sm);
        overflow: hidden;
        box-shadow: var(--shadow-lg);

        .heritage-img {
          width: 100%;
          height: 520px;
          object-fit: cover;
        }
      }

      .gold-accent-badge {
        position: absolute;
        bottom: 2rem;
        right: 2rem;
        background-color: var(--color-espresso);
        color: #ffffff;
        border: 1px solid var(--color-gold);
        padding: 1.25rem 1.75rem;
        border-radius: var(--radius-sm);
        display: flex;
        flex-direction: column;
        align-items: center;

        .year {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          letter-spacing: 0.15em;
          color: var(--color-gold-light);
        }

        .label {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #ffffff;
        }
      }

      .heritage-title {
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        margin-bottom: 1.5rem;
        line-height: 1.25;
      }

      .lead-para {
        font-size: 1.1rem;
        color: var(--color-text-primary);
        line-height: 1.75;
        margin-bottom: 1.25rem;
      }

      .body-para {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
        margin-bottom: 2.5rem;
      }

      .heritage-metrics {
        display: flex;
        gap: 3rem;
        border-top: 1px solid var(--color-border);
        padding-top: 2rem;

        .metric-num {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          font-weight: 600;
          color: var(--color-gold-dark);
          display: block;
          line-height: 1;
          margin-bottom: 0.4rem;
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-secondary);
        }
      }

      /* Concierge Banner Box */
      .concierge-banner-section {
        padding-bottom: 5rem;
      }

      .concierge-banner-box {
        background-color: var(--color-cream);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 3rem 3.5rem;
        display: flex;
        align-items: center;
        gap: 2.5rem;
      }

      .concierge-icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: #ffffff;
        color: var(--color-gold-dark);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .concierge-content {
        flex: 1;

        .concierge-heading {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          color: var(--color-espresso);
        }

        .concierge-text {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
      }

      .concierge-action {
        flex-shrink: 0;
      }

      .loading-state {
        text-align: center;
        padding: 4rem;
        color: var(--color-text-muted);

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

      @media (max-width: 1100px) {
        .products-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .pillars-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 860px) {
        .categories-grid {
          grid-template-columns: 1fr;
        }
        .products-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .heritage-grid {
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        .concierge-banner-box {
          flex-direction: column;
          text-align: center;
          padding: 2.5rem 1.5rem;
        }
      }

      @media (max-width: 580px) {
        .products-grid {
          grid-template-columns: 1fr;
        }
        .pillars-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private itemService = inject(ItemService);

  categories = signal<Category[]>([]);
  featuredItems = signal<Item[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err),
    });

    this.itemService.getItems({ featured: true }).subscribe({
      next: (items) => this.featuredItems.set(items.slice(0, 8)),
      error: (err) => console.error('Failed to load featured items', err),
    });
  }
}
