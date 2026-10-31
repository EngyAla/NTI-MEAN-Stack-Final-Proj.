import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from '../../../core/services/item.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Item, Category } from '../../../core/models/ecommerce.model';

@Component({
  selector: 'app-items-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="items-manager">
      <!-- Title Row -->
      <div class="title-row">
        <div>
          <h1 class="page-title">Items & Inventory Management</h1>
          <p class="page-desc">
            Manage accessories catalog, set prices, and monitor backend stock reserves.
          </p>
        </div>

        <button type="button" class="btn btn-gold btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Item
        </button>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-controls-card">
        <div class="filter-inputs">
          <!-- Category Filter -->
          <div class="filter-group">
            <label>Filter by Category</label>
            <select
              class="form-control filter-select"
              [value]="selectedCatFilter()"
              (change)="onCategoryFilterChange($event)"
            >
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories()" [value]="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Search Filter -->
          <div class="filter-group flex-1">
            <label>Search Accessories</label>
            <div class="search-wrap">
              <input
                type="text"
                placeholder="Search by piece title or description..."
                class="form-control"
                [value]="searchKeyword()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
        </div>

        <div class="filter-status-row">
          <span class="count-tag">
            Total Inventory: {{ items().length }} {{ items().length === 1 ? 'Piece' : 'Pieces' }}
          </span>
          <span class="stock-badge-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Stock quantities are strictly private to manager console
          </span>
        </div>
      </div>

      <!-- Items Table Card -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="luxury-table" *ngIf="items().length > 0; else noItems">
            <thead>
              <tr>
                <th style="width: 70px;">Piece</th>
                <th>Title & Details</th>
                <th>Department</th>
                <th>Price</th>
                <th style="text-align: center;">Stock Quantity</th>
                <th>Featured</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let itm of items()">
                <td>
                  <img [src]="itm.imageUrl" [alt]="itm.name" class="item-table-thumb" />
                </td>
                <td>
                  <strong class="item-name-bold">{{ itm.name }}</strong>
                  <span class="item-sub-desc">{{ itm.description | slice:0:75 }}...</span>
                </td>
                <td>
                  <span class="category-tag-badge">{{ getCategoryName(itm) }}</span>
                </td>
                <td>
                  <strong>\${{ itm.price | number:'1.2-2' }}</strong>
                </td>
                <td style="text-align: center;">
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-closed': (itm.quantity || 0) > 10,
                      'badge-opened': (itm.quantity || 0) > 0 && (itm.quantity || 0) <= 10,
                      'badge-neutral': (itm.quantity || 0) === 0
                    }"
                  >
                    {{ itm.quantity }} units in stock
                  </span>
                </td>
                <td>
                  <span class="badge badge-gold" *ngIf="itm.isFeatured">Featured</span>
                  <span class="text-muted" *ngIf="!itm.isFeatured">&mdash;</span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn btn-outline btn-sm"
                      (click)="openEditModal(itm)"
                      title="Edit Item"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm delete-btn"
                      (click)="confirmDelete(itm)"
                      title="Delete Item"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noItems>
            <div class="empty-table-box">
              <p>No items found matching the selected filters. Click "Add New Item" to add one.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Add / Edit Item Modal -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3>{{ isEditing() ? 'Edit Item Details' : 'Add New Luxury Accessory' }}</h3>
            <button type="button" class="btn btn-ghost btn-sm close-modal-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <form [formGroup]="itemForm" (ngSubmit)="saveItem()">
            <div class="modal-body modal-grid-body">
              <!-- Item Name -->
              <div class="form-group full-width">
                <label for="name">Item Name *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="e.g. Palazzo Saffiano Leather Tote"
                  class="form-control"
                />
                <div class="form-error" *ngIf="f['name'].touched && f['name'].invalid">
                  Name is required.
                </div>
              </div>

              <!-- Category -->
              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" formControlName="category" class="form-control">
                  <option value="" disabled>Select Department</option>
                  <option *ngFor="let cat of categories()" [value]="cat._id">
                    {{ cat.name }}
                  </option>
                </select>
                <div class="form-error" *ngIf="f['category'].touched && f['category'].invalid">
                  Please select a category.
                </div>
              </div>

              <!-- Price -->
              <div class="form-group">
                <label for="price">Price ($ USD) *</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  formControlName="price"
                  placeholder="395.00"
                  class="form-control"
                />
                <div class="form-error" *ngIf="f['price'].touched && f['price'].invalid">
                  Valid price is required (cannot be negative).
                </div>
              </div>

              <!-- Quantity (Stock) -->
              <div class="form-group">
                <label for="quantity">Stock Quantity (Private to Manager) *</label>
                <input
                  type="number"
                  id="quantity"
                  min="0"
                  formControlName="quantity"
                  placeholder="15"
                  class="form-control"
                />
                <div class="form-error" *ngIf="f['quantity'].touched && f['quantity'].invalid">
                  Stock quantity is required (0 or more).
                </div>
              </div>

              <!-- Featured Flag -->
              <div class="form-group checkbox-group">
                <label class="custom-checkbox">
                  <input type="checkbox" formControlName="isFeatured" />
                  <span>Highlight as Featured Masterpiece on Home Page</span>
                </label>
              </div>

              <!-- Primary Image URL -->
              <div class="form-group full-width">
                <label for="imageUrl">Primary Image URL (Accessories Photography Only) *</label>
                <input
                  type="url"
                  id="imageUrl"
                  formControlName="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="form-control"
                />
                <div class="form-hint">
                  Strict Requirement: Use ONLY accessories product photography. No faces, women, men, or models.
                </div>
                <div class="form-error" *ngIf="f['imageUrl'].touched && f['imageUrl'].invalid">
                  Primary image URL is required.
                </div>
              </div>

              <!-- Image Preview -->
              <div class="form-group full-width" *ngIf="f['imageUrl'].value">
                <div class="preview-box">
                  <span class="preview-title">Primary Image Preview:</span>
                  <img [src]="f['imageUrl'].value" alt="Preview" class="preview-img" />
                </div>
              </div>

              <!-- Material & Finish -->
              <div class="form-group">
                <label for="material">Material & Craftsmanship Spec</label>
                <input
                  type="text"
                  id="material"
                  formControlName="material"
                  placeholder="e.g. Full-Grain Tuscan Calfskin / 18k Champagne Gold"
                  class="form-control"
                />
              </div>

              <!-- Dimensions & Fit -->
              <div class="form-group">
                <label for="dimensions">Dimensions</label>
                <input
                  type="text"
                  id="dimensions"
                  formControlName="dimensions"
                  placeholder="e.g. 38cm x 28cm x 14cm"
                  class="form-control"
                />
              </div>

              <!-- Description -->
              <div class="form-group full-width">
                <label for="description">Item Description *</label>
                <textarea
                  id="description"
                  formControlName="description"
                  placeholder="Elaborate editorial copy regarding aesthetics, leather grade, interior lining, and hardware..."
                  class="form-control"
                  style="min-height: 100px;"
                ></textarea>
                <div class="form-error" *ngIf="f['description'].touched && f['description'].invalid">
                  Description is required.
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancel</button>
              <button
                type="submit"
                class="btn btn-gold"
                [disabled]="isSaving() || itemForm.invalid"
              >
                <span *ngIf="!isSaving()">{{ isEditing() ? 'Save Changes' : 'Create Item' }}</span>
                <span *ngIf="isSaving()">Saving...</span>
              </button>
            </div>
          </form>
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
        padding: 1.5rem;
        margin-bottom: 2rem;
      }

      .filter-inputs {
        display: flex;
        gap: 1.5rem;
        align-items: flex-end;
        flex-wrap: wrap;
      }

      .filter-group {
        display: flex;
        flex-direction: column;

        label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin-bottom: 0.4rem;
        }

        &.flex-1 {
          flex: 1;
          min-width: 250px;
        }
      }

      .filter-select {
        min-width: 220px;
      }

      .filter-status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1.25rem;
        padding-top: 1rem;
        border-top: 1px solid var(--color-border-subtle);
        font-size: 0.8rem;
      }

      .count-tag {
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .stock-badge-note {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--color-gold-dark);
        font-weight: 500;
      }

      .table-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .item-table-thumb {
        width: 54px;
        height: 54px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        background-color: #faf7f2;
        border: 1px solid var(--color-border);
      }

      .item-name-bold {
        display: block;
        color: var(--color-espresso);
        font-size: 0.92rem;
        line-height: 1.3;
      }

      .item-sub-desc {
        display: block;
        font-size: 0.78rem;
        color: var(--color-text-muted);
        margin-top: 0.2rem;
      }

      .category-tag-badge {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-secondary);
      }

      .action-buttons {
        display: inline-flex;
        gap: 0.5rem;
      }

      .delete-btn {
        color: #b73838;
        &:hover {
          background-color: #fbebeb;
        }
      }

      .empty-table-box {
        padding: 4rem;
        text-align: center;
        color: var(--color-text-muted);
      }

      /* Modal styling */
      .modal-dialog.modal-lg {
        max-width: 780px;
      }

      .modal-grid-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;

        .full-width {
          grid-column: span 2;
        }
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        margin-top: 1.5rem;
      }

      .custom-checkbox {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.85rem;
        cursor: pointer;
        color: var(--color-espresso);

        input[type='checkbox'] {
          width: 18px;
          height: 18px;
          accent-color: var(--color-gold);
          cursor: pointer;
        }
      }

      .preview-box {
        padding: 0.75rem;
        background-color: var(--color-canvas);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 1rem;

        .preview-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .preview-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
      }
    `,
  ],
})
export class ItemsManagerComponent implements OnInit {
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  items = signal<Item[]>([]);
  categories = signal<Category[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  editingId: string | null = null;

  selectedCatFilter = signal<string>('');
  searchKeyword = signal<string>('');

  itemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    price: [null, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    imageUrl: ['', [Validators.required]],
    material: [''],
    dimensions: [''],
    isFeatured: [false],
  });

  get f() {
    return this.itemForm.controls;
  }

  ngOnInit() {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  loadItems() {
    this.itemService
      .getManagerItems({
        category: this.selectedCatFilter(),
        search: this.searchKeyword(),
      })
      .subscribe({
        next: (items) => this.items.set(items),
        error: (err) => console.error('Failed to load items', err),
      });
  }

  getCategoryName(item: Item): string {
    if (!item.category) return 'Unassigned';
    return typeof item.category === 'object' ? item.category.name : 'Category';
  }

  onCategoryFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCatFilter.set(val);
    this.loadItems();
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchKeyword.set(val);
    this.loadItems();
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.itemForm.reset({
      name: '',
      description: '',
      price: null,
      quantity: 10,
      category: this.categories().length > 0 ? this.categories()[0]._id : '',
      imageUrl: '',
      material: 'Full-Grain Italian Calfskin / 18k Gilded Brass',
      dimensions: 'Standard Luxury Specification',
      isFeatured: false,
    });
    this.showModal.set(true);
  }

  openEditModal(item: Item) {
    this.isEditing.set(true);
    this.editingId = item._id;

    const catId = typeof item.category === 'object' ? item.category._id : item.category;

    this.itemForm.setValue({
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity !== undefined ? item.quantity : 0,
      category: catId,
      imageUrl: item.imageUrl,
      material: item.material || '',
      dimensions: item.dimensions || '',
      isFeatured: !!item.isFeatured,
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveItem() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.itemForm.value;

    if (this.isEditing() && this.editingId) {
      this.itemService.updateItem(this.editingId, formVal).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.toastService.success(`Item "${res.name}" updated successfully.`);
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err.error?.message || 'Failed to update item.';
          this.toastService.error(msg);
        },
      });
    } else {
      this.itemService.createItem(formVal).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.toastService.success(`Item "${res.name}" created successfully.`);
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err.error?.message || 'Failed to create item.';
          this.toastService.error(msg);
        },
      });
    }
  }

  confirmDelete(item: Item) {
    if (confirm(`Are you certain you wish to remove "${item.name}" from the boutique collection?`)) {
      this.itemService.deleteItem(item._id).subscribe({
        next: () => {
          this.toastService.success(`"${item.name}" removed successfully.`);
          this.loadItems();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to delete item.';
          this.toastService.error(msg);
        },
      });
    }
  }
}
