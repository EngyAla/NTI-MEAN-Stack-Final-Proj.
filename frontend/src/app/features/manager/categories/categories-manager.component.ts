import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { Category } from '../../../core/models/ecommerce.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-categories-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="categories-manager">
      <!-- Title Bar -->
      <div class="title-row">
        <div>
          <h1 class="page-title">{{ 'manager.cat.title' | translate }}</h1>
          <p class="page-desc">{{ 'manager.cat.desc' | translate }}</p>
        </div>

        <button type="button" class="btn btn-gold btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ 'manager.cat.addBtn' | translate }}
        </button>
      </div>

      <!-- Categories Table Card -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="luxury-table" *ngIf="categories().length > 0; else noCats">
            <thead>
              <tr>
                <th style="width: 70px;">{{ 'manager.cat.imageUrl' | translate }}</th>
                <th>{{ 'manager.cat.nameEn' | translate }}</th>
                <th>{{ 'manager.cat.descEn' | translate }}</th>
                <th style="text-align: center;">{{ 'manager.stats.items' | translate }}</th>
                <th style="text-align: right;">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories()">
                <td>
                  <img
                    [src]="cat.imageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80'"
                    [alt]="cat.name"
                    class="cat-table-thumb"
                  />
                </td>
                <td>
                  <strong>{{ cat.name }}</strong>
                  <div class="bilingual-sub" *ngIf="cat.nameObj?.ar && cat.nameObj?.en">
                    <span class="sub-pill">{{ cat.nameObj?.en }}</span> | <span class="sub-pill">{{ cat.nameObj?.ar }}</span>
                  </div>
                </td>
                <td class="desc-cell">
                  {{ cat.description || 'No description provided.' }}
                </td>
                <td style="text-align: center;">
                  <span class="badge" [ngClass]="cat.itemCount ? 'badge-gold' : 'badge-neutral'">
                    {{ cat.itemCount || 0 }} {{ (cat.itemCount || 0) === 1 ? 'Product' : 'Products' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button
                      type="button"
                      class="btn btn-outline btn-sm action-btn"
                      (click)="openEditModal(cat)"
                      [title]="'common.edit' | translate"
                    >
                      {{ 'common.edit' | translate }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm delete-btn"
                      (click)="confirmDelete(cat)"
                      [title]="'common.delete' | translate"
                    >
                      {{ 'common.delete' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noCats>
            <div class="empty-table-box">
              <p>No categories found. Click "Add New Category" to begin.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Add/Edit Modal Dialog -->
      <div class="modal-backdrop" *ngIf="showModal()">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>{{ isEditing() ? (('common.edit' | translate) + ' ' + ('manager.stats.categories' | translate)) : ('manager.cat.addBtn' | translate) }}</h3>
            <button type="button" class="btn btn-ghost btn-sm close-modal-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="modal-body">
              <!-- Bilingual Names Grid -->
              <div class="form-row-2">
                <!-- English Name -->
                <div class="form-group">
                  <label for="catNameEn">{{ 'manager.cat.nameEn' | translate }}</label>
                  <input
                    type="text"
                    id="catNameEn"
                    formControlName="nameEn"
                    placeholder="e.g. Handbags & Leathercraft"
                    class="form-control"
                    [class.is-invalid]="f['nameEn'].touched && f['nameEn'].invalid"
                  />
                  <div class="form-error" *ngIf="f['nameEn'].touched && f['nameEn'].invalid">
                    English name is required (min 2 characters).
                  </div>
                </div>

                <!-- Arabic Name -->
                <div class="form-group" dir="rtl">
                  <label for="catNameAr">{{ 'manager.cat.nameAr' | translate }}</label>
                  <input
                    type="text"
                    id="catNameAr"
                    formControlName="nameAr"
                    placeholder="مثال: حقائب اليد والمصنوعات الجلدية"
                    class="form-control"
                    [class.is-invalid]="f['nameAr'].touched && f['nameAr'].invalid"
                  />
                  <div class="form-error" *ngIf="f['nameAr'].touched && f['nameAr'].invalid">
                    Arabic name is required (min 2 characters).
                  </div>
                </div>
              </div>

              <!-- Bilingual Descriptions Grid -->
              <div class="form-row-2">
                <!-- English Description -->
                <div class="form-group">
                  <label for="catDescEn">{{ 'manager.cat.descEn' | translate }}</label>
                  <textarea
                    id="catDescEn"
                    formControlName="descriptionEn"
                    placeholder="English description of materials and craftsmanship"
                    class="form-control"
                    style="min-height: 80px;"
                  ></textarea>
                </div>

                <!-- Arabic Description -->
                <div class="form-group" dir="rtl">
                  <label for="catDescAr">{{ 'manager.cat.descAr' | translate }}</label>
                  <textarea
                    id="catDescAr"
                    formControlName="descriptionAr"
                    placeholder="وصف باللغة العربية حول الحرفة والمواد المستخدمة"
                    class="form-control"
                    style="min-height: 80px;"
                  ></textarea>
                </div>
              </div>

              <!-- Image URL -->
              <div class="form-group">
                <label for="catImg">{{ 'manager.cat.imageUrl' | translate }}</label>
                <input
                  type="url"
                  id="catImg"
                  formControlName="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="form-control"
                />
                <span class="form-hint">{{ 'manager.cat.imageHint' | translate }}</span>
              </div>

              <!-- Image Preview -->
              <div class="image-preview-box" *ngIf="f['imageUrl'].value">
                <span class="preview-label">Preview:</span>
                <img [src]="f['imageUrl'].value" alt="Preview" class="preview-img" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">{{ 'common.cancel' | translate }}</button>
              <button
                type="submit"
                class="btn btn-gold"
                [disabled]="isSaving() || categoryForm.invalid"
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

      .table-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .cat-table-thumb {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-sm);
        object-fit: cover;
        background-color: #faf7f2;
        border: 1px solid var(--color-border);
      }

      .desc-cell {
        max-width: 320px;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        line-height: 1.4;
      }

      .bilingual-sub {
        font-size: 0.72rem;
        color: var(--color-text-muted);
        margin-top: 0.2rem;
      }

      .sub-pill {
        display: inline-block;
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

      .close-modal-btn {
        font-size: 1.5rem;
        padding: 0.2rem 0.5rem;
        line-height: 1;
      }

      .image-preview-box {
        margin-top: 1rem;
        padding: 0.75rem;
        background-color: var(--color-canvas);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 1rem;

        .preview-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .preview-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
      }

      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 640px) {
        .form-row-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoriesManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);

  categories = signal<Category[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);

  editingId: string | null = null;
  categoryForm!: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      descriptionEn: [''],
      descriptionAr: [''],
      imageUrl: [''],
    });

    // Reactive table reload on language switch without losing unsaved modal form data
    effect(() => {
      const currentLang = this.languageService.currentLang();
      if (currentLang) {
        this.loadCategories();
      }
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  get f() {
    return this.categoryForm.controls;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => {
        console.error('Failed to load categories', err);
        this.toastService.error('Failed to load categories.');
      },
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.categoryForm.reset({
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      imageUrl: '',
    });
    this.showModal.set(true);
  }

  openEditModal(cat: Category) {
    this.isEditing.set(true);
    this.editingId = cat._id;
    const enName = cat.nameObj?.en || (typeof cat.name === 'string' ? cat.name : '');
    const arName = cat.nameObj?.ar || (typeof cat.name === 'string' ? cat.name : '');
    const enDesc = cat.descriptionObj?.en || (typeof cat.description === 'string' ? cat.description : '');
    const arDesc = cat.descriptionObj?.ar || (typeof cat.description === 'string' ? cat.description : '');

    this.categoryForm.setValue({
      nameEn: enName,
      nameAr: arName,
      descriptionEn: enDesc,
      descriptionAr: arDesc,
      imageUrl: cat.imageUrl || '',
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.categoryForm.value;
    const payload = {
      name: {
        en: formVal.nameEn.trim(),
        ar: formVal.nameAr.trim(),
      },
      nameEn: formVal.nameEn.trim(),
      nameAr: formVal.nameAr.trim(),
      description: {
        en: (formVal.descriptionEn || '').trim(),
        ar: (formVal.descriptionAr || '').trim(),
      },
      descriptionEn: (formVal.descriptionEn || '').trim(),
      descriptionAr: (formVal.descriptionAr || '').trim(),
      imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : '',
    };

    if (this.isEditing() && this.editingId) {
      this.categoryService.updateCategory(this.editingId, payload).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.toastService.success(`Category "${updated.name}" updated successfully.`);
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err.error?.message || 'Failed to update category.';
          this.toastService.error(msg);
        },
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.toastService.success(`Category "${created.name}" created successfully.`);
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err.error?.message || 'Failed to create category.';
          this.toastService.error(msg);
        },
      });
    }
  }

  confirmDelete(cat: Category) {
    if (cat.itemCount && cat.itemCount > 0) {
      this.toastService.error(
        `Cannot delete "${cat.name}". It contains ${cat.itemCount} product(s). Please reassign or delete these items first.`
      );
      return;
    }

    if (confirm(`Are you sure you wish to delete the category "${cat.name}"?`)) {
      this.categoryService.deleteCategory(cat._id).subscribe({
        next: () => {
          this.toastService.success(`Category "${cat.name}" was deleted.`);
          this.loadCategories();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to delete category.';
          this.toastService.error(msg);
        },
      });
    }
  }
}