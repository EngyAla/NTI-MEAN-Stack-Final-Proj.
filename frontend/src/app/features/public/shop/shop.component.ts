import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ItemService } from '../../../core/services/item.service';
import { LanguageService } from '../../../core/services/language.service';
import { Category, Item } from '../../../core/models/ecommerce.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, EmptyStateComponent, TranslatePipe],
  template: `
    <!-- Shop Hero Header -->
    <section class="shop-hero">
      <div class="container text-center">
        <span class="shop-tag">{{ 'shop.hero.tag' | translate }}</span>
        <h1 class="shop-title">{{ 'shop.hero.title' | translate }}</h1>
        <p class="shop-sub">
          {{ 'shop.hero.sub' | translate }}
        </p>
      </div>
    </section>

    <!-- Filter & Sort Bar -->
    <section class="filter-bar-section">
      <div class="container filter-container">
        <!-- Categories Tabs / Filter Pills -->
        <div class="category-pills">
          <button
            type="button"
            class="pill-btn"
            [class.active]="selectedCategoryId() === ''"
            (click)="selectCategory('')"
          >
            {{ 'shop.filters.all' | translate }}
          </button>
          <button
            *ngFor="let cat of categories()"
            type="button"
            class="pill-btn"
            [class.active]="selectedCategoryId() === cat._id"
            (click)="selectCategory(cat._id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Search and Sort Controls -->
        <div class="controls-group">
          <!-- Search Input -->
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              [placeholder]="'shop.filters.searchPlaceholder' | translate"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              class="search-input"
            />
            <button
              *ngIf="searchQuery()"
              type="button"
              class="clear-btn"
              (click)="onSearchChange('')"
            >
              &times;
            </button>
          </div>

          <!-- Sort Selector -->
          <div class="sort-box">
            <select
              [ngModel]="selectedSort()"
              (ngModelChange)="onSortChange($event)"
              class="sort-select"
            >
              <option value="newest">{{ 'shop.sort.newest' | translate }}</option>
              <option value="price-asc">{{ 'shop.sort.priceAsc' | translate }}</option>
              <option value="price-desc">{{ 'shop.sort.priceDesc' | translate }}</option>
              <option value="name-asc">{{ 'shop.sort.nameAsc' | translate }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Grid Area -->
    <section class="section product-grid-section">
      <div class="container">
        <!-- Active Filter Indicator & Count -->
        <div class="results-header">
          <span class="results-count">
            {{ 'shop.results.showing' | translate }} {{ items().length }} {{ 'shop.results.designs' | translate }}
          </span>
          <button
            *ngIf="selectedCategoryId() || searchQuery()"
            type="button"
            class="reset-filters-btn"
            (click)="resetFilters()"
          >
            {{ 'shop.results.reset' | translate }}
          </button>
        </div>

        <!-- Products Grid -->
        <div class="shop-grid" *ngIf="!isLoading() && items().length > 0">
          <app-product-card *ngFor="let item of items()" [item]="item"></app-product-card>
        </div>

        <!-- Empty State -->
        <app-empty-state
          *ngIf="!isLoading() && items().length === 0"
          [title]="'shop.empty.title' | translate"
          [description]="'shop.empty.desc' | translate"
          [actionText]="'shop.empty.action' | translate"
          (actionClick)="resetFilters()"
        ></app-empty-state>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading()">
          <div class="spinner"></div>
          <span>{{ 'shop.results.showing' | translate }}...</span>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .shop-hero {
        background-color: var(--color-espresso);
        color: #ffffff;
        padding: 4.5rem 1.5rem 3.5rem;
        border-bottom: 1px solid rgba(194, 162, 111, 0.2);

        .shop-tag {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-light);
          display: inline-block;
          margin-bottom: 0.75rem;
        }

        .shop-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .shop-sub {
          font-size: 1.05rem;
          color: #bfaea0;
          max-width: 620px;
          margin: 0 auto;
          font-weight: 300;
        }
      }

      .filter-bar-section {
        background-color: #ffffff;
        border-bottom: 1px solid var(--color-border);
        padding: 1.25rem 0;
        position: sticky;
        top: 0px;
        z-index: 50;
      }

      .filter-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .category-pills {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        max-width: 100%;

        &::-webkit-scrollbar {
          height: 3px;
        }
        &::-webkit-scrollbar-thumb {
          background: var(--color-border);
        }
      }

      .pill-btn {
        padding: 0.5rem 1.1rem;
        font-family: var(--font-sans);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid var(--color-border);
        background-color: transparent;
        color: var(--color-text-secondary);
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: var(--transition-fast);
        white-space: nowrap;

        &:hover {
          color: var(--color-espresso);
          border-color: var(--color-espresso);
        }

        &.active {
          background-color: var(--color-espresso);
          color: #ffffff;
          border-color: var(--color-espresso);
        }
      }

      .controls-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search-box {
        position: relative;
        display: flex;
        align-items: center;

        svg {
          position: absolute;
          left: 0.85rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .search-input {
          padding: 0.55rem 2rem 0.55rem 2.25rem;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          width: 220px;
          outline: none;
          transition: var(--transition-fast);

          &:focus {
            border-color: var(--color-gold);
            width: 260px;
          }
        }

        .clear-btn {
          position: absolute;
          right: 0.65rem;
          background: transparent;
          border: none;
          font-size: 1.1rem;
          color: var(--color-text-muted);
          cursor: pointer;
        }
      }

      .sort-select {
        padding: 0.55rem 2.25rem 0.55rem 0.85rem;
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 500;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background-color: #ffffff;
        color: var(--color-espresso);
        outline: none;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236A6055' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 0.85rem;

        &:focus {
          border-color: var(--color-gold);
        }
      }

      .results-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border-subtle);
      }

      .results-count {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .reset-filters-btn {
        background: transparent;
        border: none;
        color: var(--color-gold-dark);
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        cursor: pointer;
        text-decoration: underline;
      }

      .shop-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      .loading-state {
        text-align: center;
        padding: 6rem 1rem;
        color: var(--color-text-muted);

        .spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1.25rem;
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .shop-grid app-product-card {
        animation: fadeInUp 0.4s ease both;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(12px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 1100px) {
        .shop-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 820px) {
        .filter-container {
          flex-direction: column;
          align-items: stretch;
        }
        .controls-group {
          justify-content: space-between;
        }
        .search-box .search-input {
          width: 100%;
        }
        .shop-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 540px) {
        .shop-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ShopComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);

  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  isLoading = signal(true);

  selectedCategoryId = signal<string>('');
  searchQuery = signal<string>('');
  selectedSort = signal<string>('newest');

  constructor() {
    effect(() => {
      const currentLang = this.languageService.currentLang();
      if (currentLang) {
        this.categoryService.getCategories().subscribe({
          next: (cats) => this.categories.set(cats),
        });
        this.loadItems();
      }
    });
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        // Check queryParams after categories load
        this.route.queryParams.subscribe((params) => {
          if (params['category']) {
            // Check if parameter is category ID or alias (like 'handbags')
            const paramVal = params['category'].toLowerCase();
            const matchingCat = cats.find(
              (c) => c._id === paramVal || c.name.toLowerCase().includes(paramVal)
            );
            this.selectedCategoryId.set(matchingCat ? matchingCat._id : paramVal);
          } else {
            this.selectedCategoryId.set('');
          }

          if (params['search']) {
            this.searchQuery.set(params['search']);
          }

          this.loadItems();
        });
      },
      error: (err) => {
        console.error('Error fetching categories', err);
        this.loadItems();
      },
    });
  }

  loadItems() {
    this.isLoading.set(true);

    const filters: {
      category?: string;
      search?: string;
      sort?: string;
    } = {};

    if (this.selectedCategoryId()) {
      filters.category = this.selectedCategoryId();
    }

    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    if (this.selectedSort()) {
      filters.sort = this.selectedSort();
    }

    this.itemService.getItems(filters).subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load shop items', err);
        this.isLoading.set(false);
      },
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId.set(categoryId);
    this.loadItems();
  }

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.loadItems();
  }

  onSortChange(val: string) {
    this.selectedSort.set(val);
    this.loadItems();
  }

  resetFilters() {
    this.selectedCategoryId.set('');
    this.searchQuery.set('');
    this.selectedSort.set('newest');
    this.loadItems();
  }
}
