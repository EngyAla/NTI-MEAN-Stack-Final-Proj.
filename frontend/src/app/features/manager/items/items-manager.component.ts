import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from '../../../core/services/item.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { Item, Category } from '../../../core/models/ecommerce.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-items-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="items-manager">
      <!-- Title Row -->
      <div class="title-row">
        <div>
          <h1 class="page-title">{{ 'manager.items.title' | translate }}</h1>
          <p class="page-desc">
            {{ 'manager.items.desc' | translate }}
          </p>
        </div>

        <button type="button" class="btn btn-gold btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ 'manager.items.addBtn' | translate }}
        </button>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-controls-card">
        <div class="filter-inputs">
          <!-- Category Filter -->
          <div class="filter-group">
            <label>{{ 'manager.items.category' | translate }}</label>
            <select
              class="form-control filter-select"
              [value]="selectedCatFilter()"
              (change)="onCategoryFilterChange($event)"
            >
              <option value="">{{ 'shop.filters.all' | translate }}</option>
              <option *ngFor="let cat of categories()" [value]="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Search Filter -->
          <div class="filter-group flex-1">
            <label>{{ 'shop.filters.searchPlaceholder' | translate }}</label>
            <div class="search-wrap">
              <input
                type="text"
                [placeholder]="'shop.filters.searchPlaceholder' | translate"
                class="form-control"
                [value]="searchKeyword()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
        </div>

        <div class="filter-status-row">
          <span class="count-tag">
            {{ 'manager.stats.items' | translate }}: {{ items().length }} {{ 'shop.results.designs' | translate }}
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
                <th>{{ 'manager.items.nameEn' | translate }}</th>
                <th>{{ 'manager.items.category' | translate }}</th>
                <th>{{ 'common.price' | translate }}</th>
                <th style="text-align: center;">{{ 'manager.items.quantity' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
                <th style="text-align: right;">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let itm of items()">
                <td>
                  <img [src]="itm.imageUrl" [alt]="itm.name" class="item-table-thumb" />
                </td>
                <td>
                  <strong class="item-name-bold">{{ itm.name }}</strong>
                  <div class="bilingual-sub" *ngIf="itm.nameObj?.ar && itm.nameObj?.en">
                    <span class="sub-pill">{{ itm.nameObj?.en }}</span> | <span class="sub-pill">{{ itm.nameObj?.ar }}</span>
                  </div>
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
                    {{ itm.quantity }} {{ 'manager.items.unitsInStock' | translate }}
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
                      [title]="'common.edit' | translate"
                    >
                      {{ 'common.edit' | translate }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm delete-btn"
                      (click)="confirmDelete(itm)"
                      [title]="'common.delete' | translate"
                    >
                      {{ 'common.delete' | translate }}
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
            <h3>{{ isEditing() ? (('common.edit' | translate) + ' ' + ('manager.stats.items' | translate)) : ('manager.items.addBtn' | translate) }}</h3>
            <button type="button" class="btn btn-ghost btn-sm close-modal-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <form [formGroup]="itemForm" (ngSubmit)="saveItem()">
            <div class="modal-body modal-grid-body">
              <!-- Bilingual Item Names -->
              <div class="form-row-2 full-width">
                <!-- English Name -->
                <div class="form-group">
                  <label for="nameEn">{{ 'manager.items.nameEn' | translate }}</label>
                  <input
                    type="text"
                    id="nameEn"
                    formControlName="nameEn"
                    placeholder="e.g. Palazzo Saffiano Leather Tote"
                    class="form-control"
                    [class.is-invalid]="f['nameEn'].touched && f['nameEn'].invalid"
                  />
                  <div class="form-error" *ngIf="f['nameEn'].touched && f['nameEn'].invalid">
                    English name is required (min 2 characters).
                  </div>
                </div>

                <!-- Arabic Name -->
                <div class="form-group" dir="rtl">
                  <label for="nameAr">{{ 'manager.items.nameAr' | translate }}</label>
                  <input
                    type="text"
                    id="nameAr"
                    formControlName="nameAr"
                    placeholder="مثال: حقيبة بالاتزو من جلد سافيانو"
                    class="form-control"
                    [class.is-invalid]="f['nameAr'].touched && f['nameAr'].invalid"
                  />
                  <div class="form-error" *ngIf="f['nameAr'].touched && f['nameAr'].invalid">
                    Arabic name is required (min 2 characters).
                  </div>
                </div>
              </div>

              <!-- Category -->
              <div class="form-group">
                <label for="category">{{ 'manager.items.category' | translate }}</label>
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
                <label for="price">{{ 'manager.items.price' | translate }}</label>
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
                <label for="quantity">{{ 'manager.items.quantity' | translate }}</label>
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
                  <span>{{ 'manager.items.featured' | translate }}</span>
                </label>
              </div>

              <!-- Primary Image URL -->
              <div class="form-group full-width">
                <label for="imageUrl">{{ 'manager.items.image' | translate }}</label>
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

              <!-- Bilingual Material & Finish -->
              <div class="form-row-2 full-width">
                <!-- English Material -->
                <div class="form-group">
                  <label for="materialEn">{{ 'manager.items.materialEn' | translate }}</label>
                  <input
                    type="text"
                    id="materialEn"
                    formControlName="materialEn"
                    placeholder="e.g. Full-Grain Tuscan Calfskin / 18k Champagne Gold"
                    class="form-control"
                  />
                </div>

                <!-- Arabic Material -->
                <div class="form-group" dir="rtl">
                  <label for="materialAr">{{ 'manager.items.materialAr' | translate }}</label>
                  <input
                    type="text"
                    id="materialAr"
                    formControlName="materialAr"
                    placeholder="مثال: جلد العجل التوسكاني الفاخر / ذهب شامبانيا عيار 18"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Dimensions & Fit -->
              <div class="form-group full-width">
                <label for="dimensions">{{ 'manager.items.dimensions' | translate }}</label>
                <input
                  type="text"
                  id="dimensions"
                  formControlName="dimensions"
                  placeholder="e.g. 38cm x 28cm x 14cm"
                  class="form-control"
                />
              </div>

              <!-- Bilingual Descriptions -->
              <div class="form-row-2 full-width">
                <!-- English Description -->
                <div class="form-group">
                  <label for="descEn">{{ 'manager.items.descEn' | translate }}</label>
                  <textarea
                    id="descEn"
                    formControlName="descriptionEn"
                    placeholder="Elaborate editorial copy regarding aesthetics, leather grade, interior lining, and hardware..."
                    class="form-control"
                    style="min-height: 90px;"
                    [class.is-invalid]="f['descriptionEn'].touched && f['descriptionEn'].invalid"
                  ></textarea>
                  <div class="form-error" *ngIf="f['descriptionEn'].touched && f['descriptionEn'].invalid">
                    English description is required.
                  </div>
                </div>

                <!-- Arabic Description -->
                <div class="form-group" dir="rtl">
                  <label for="descAr">{{ 'manager.items.descAr' | translate }}</label>
                  <textarea
                    id="descAr"
                    formControlName="descriptionAr"
                    placeholder="وصف تحريري باللغة العربية حول التصميم ونوع الجلد والبطانة الداخلية والتفاصيل الدقيقة..."
                    class="form-control"
                    style="min-height: 90px;"
                    [class.is-invalid]="f['descriptionAr'].touched && f['descriptionAr'].invalid"
                  ></textarea>
                  <div class="form-error" *ngIf="f['descriptionAr'].touched && f['descriptionAr'].invalid">
                    Arabic description is required.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">{{ 'common.cancel' | translate }}</button>
              <button
                type="submit"
                class="btn btn-gold"
                [disabled]="isSaving() || itemForm.invalid"
              >
                <span *ngIf="!isSaving()">{{ 'common.save' | translate }}</span>
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
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
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
        gap: 0.4rem;

        label {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-secondary);
        }
      }

      .filter-select {
        min-width: 200px;
      }

      .filter-status-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.85rem;
        border-top: 1px solid var(--color-border-subtle);
        font-size: 0.82rem;
        color: var(--color-text-secondary);
        flex-wrap: wrap;
        gap: 0.5rem;
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
        width: 52px;
        height: 52px;
        border-radius: var(--radius-sm);
        object-fit: cover;
        background-color: #faf7f2;
        border: 1px solid var(--color-border);
      }

      .item-name-bold {
        display: block;
        color: var(--color-espresso);
      }

      .bilingual-sub {
        font-size: 0.72rem;
        color: var(--color-text-muted);
        margin: 0.15rem 0;
      }

      .sub-pill {
        display: inline-block;
      }

      .item-sub-desc {
        display: block;
        font-size: 0.78rem;
        color: var(--color-text-muted);
        line-height: 1.3;
      }

      .category-tag-badge {
        font-size: 0.78rem;
        padding: 0.2rem 0.6rem;
        background-color: var(--color-canvas);
        border-radius: var(--radius-sm);
        color: var(--color-espresso);
        border: 1px solid var(--color-border);
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
        max-width: 820px;
      }

      .modal-grid-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 1.25rem;
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        padding-top: 1.7rem;
      }

      .custom-checkbox {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        cursor: pointer;
        font-size: 0.88rem;
        color: var(--color-espresso);
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
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .preview-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }
      }

      .close-modal-btn {
        font-size: 1.5rem;
        padding: 0.2rem 0.5rem;
        line-height: 1;
      }

      @media (max-width: 680px) {
        .modal-grid-body,
        .form-row-2 {
          grid-template-columns: 1fr;
        }
        .full-width {
          grid-column: 1;
        }
      }
    `,
  ],
})
export class ItemsManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);

  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);

  selectedCatFilter = signal('');
  searchKeyword = signal('');

  editingId: string | null = null;
  itemForm!: FormGroup;

  constructor() {
    this.itemForm = this.fb.group({
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      descriptionEn: ['', [Validators.required, Validators.minLength(5)]],
      descriptionAr: ['', [Validators.required, Validators.minLength(5)]],
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [10, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
      materialEn: [''],
      materialAr: [''],
      dimensions: [''],
      isFeatured: [false],
    });

    // Reactive table reload on language switch without losing unsaved modal form data
    effect(() => {
      const currentLang = this.languageService.currentLang();
      if (currentLang) {
        this.loadCategories();
        this.loadItems();
      }
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadItems();
  }

  get f() {
    return this.itemForm.controls;
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
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      price: null,
      quantity: 10,
      category: this.categories().length > 0 ? this.categories()[0]._id : '',
      imageUrl: '',
      materialEn: 'Full-Grain Italian Calfskin / 18k Gilded Brass',
      materialAr: 'جلد العجل الإيطالي الفاخر / نحاس مطلي بالذهب عيار 18',
      dimensions: 'Standard Luxury Specification',
      isFeatured: false,
    });
    this.showModal.set(true);
  }

  openEditModal(item: Item) {
    this.isEditing.set(true);
    this.editingId = item._id;

    const catId = typeof item.category === 'object' ? item.category._id : item.category;
    const enName = item.nameObj?.en || (typeof item.name === 'string' ? item.name : '');
    const arName = item.nameObj?.ar || (typeof item.name === 'string' ? item.name : '');
    const enDesc = item.descriptionObj?.en || (typeof item.description === 'string' ? item.description : '');
    const arDesc = item.descriptionObj?.ar || (typeof item.description === 'string' ? item.description : '');
    const enMat = item.materialObj?.en || (typeof item.material === 'string' ? item.material : '');
    const arMat = item.materialObj?.ar || (typeof item.material === 'string' ? item.material : '');

    this.itemForm.setValue({
      nameEn: enName,
      nameAr: arName,
      descriptionEn: enDesc,
      descriptionAr: arDesc,
      price: item.price,
      quantity: item.quantity !== undefined ? item.quantity : 0,
      category: catId,
      imageUrl: item.imageUrl,
      materialEn: enMat,
      materialAr: arMat,
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

    const payload = {
      name: {
        en: formVal.nameEn.trim(),
        ar: formVal.nameAr.trim(),
      },
      nameEn: formVal.nameEn.trim(),
      nameAr: formVal.nameAr.trim(),
      description: {
        en: formVal.descriptionEn.trim(),
        ar: formVal.descriptionAr.trim(),
      },
      descriptionEn: formVal.descriptionEn.trim(),
      descriptionAr: formVal.descriptionAr.trim(),
      material: {
        en: (formVal.materialEn || '').trim(),
        ar: (formVal.materialAr || '').trim(),
      },
      materialEn: (formVal.materialEn || '').trim(),
      materialAr: (formVal.materialAr || '').trim(),
      price: Number(formVal.price),
      quantity: Number(formVal.quantity),
      category: formVal.category,
      imageUrl: formVal.imageUrl.trim(),
      dimensions: formVal.dimensions ? formVal.dimensions.trim() : '',
      isFeatured: !!formVal.isFeatured,
    };

    if (this.isEditing() && this.editingId) {
      this.itemService.updateItem(this.editingId, payload).subscribe({
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
      this.itemService.createItem(payload).subscribe({
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