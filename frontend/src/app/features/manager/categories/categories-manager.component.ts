import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/ecommerce.model';

@Component({
  selector: 'app-categories-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="categories-manager">
      <!-- Title Bar -->
      <div class="title-row">
        <div>
          <h1 class="page-title">Categories Management</h1>
          <p class="page-desc">Define atelier departments and manage catalog categorization.</p>
        </div>

        <button type="button" class="btn btn-gold btn-sm" (click)="openAddModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Category
        </button>
      </div>

      <!-- Categories Table Card -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="luxury-table" *ngIf="categories().length > 0; else noCats">
            <thead>
              <tr>
                <th style="width: 70px;">Image</th>
                <th>Category Name</th>
                <th>Description</th>
                <th style="text-align: center;">Item Count</th>
                <th style="text-align: right;">Actions</th>
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
                      title="Edit Category"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm delete-btn"
                      (click)="confirmDelete(cat)"
                      title="Delete Category"
                    >
                      Delete
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
            <h3>{{ isEditing() ? 'Edit Category' : 'Create New Category' }}</h3>
            <button type="button" class="btn btn-ghost btn-sm close-modal-btn" (click)="closeModal()">
              &times;
            </button>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="modal-body">
              <!-- Name -->
              <div class="form-group">
                <label for="catName">Category Name *</label>
                <input
                  type="text"
                  id="catName"
                  formControlName="name"
                  placeholder="e.g. Handbags & Leathercraft"
                  class="form-control"
                />
                <div class="form-error" *ngIf="f['name'].touched && f['name'].invalid">
                  Category name is required (minimum 2 characters).
                </div>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label for="catDesc">Description</label>
                <textarea
                  id="catDesc"
                  formControlName="description"
                  placeholder="Artisan brief describing the category's materials and craftsmanship"
                  class="form-control"
                  style="min-height: 85px;"
                ></textarea>
              </div>

              <!-- Image URL -->
              <div class="form-group">
                <label for="catImg">Image URL (Product-Only Photography)</label>
                <input
                  type="url"
                  id="catImg"
                  formControlName="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="form-control"
                />
                <span class="form-hint">Reminder: Only accessories product photography is permitted (no human faces).</span>
              </div>

              <!-- Image Preview -->
              <div class="image-preview-box" *ngIf="f['imageUrl'].value">
                <span class="preview-label">Preview:</span>
                <img [src]="f['imageUrl'].value" alt="Preview" class="preview-img" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancel</button>
              <button
                type="submit"
                class="btn btn-gold"
                [disabled]="isSaving() || categoryForm.invalid"
              >
                <span *ngIf="!isSaving()">{{ isEditing() ? 'Update Category' : 'Create Category' }}</span>
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
    `,
  ],
})
export class CategoriesManagerComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  editingId: string | null = null;

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    imageUrl: [''],
  });

  get f() {
    return this.categoryForm.controls;
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      imageUrl: '',
    });
    this.showModal.set(true);
  }

  openEditModal(cat: Category) {
    this.isEditing.set(true);
    this.editingId = cat._id;
    this.categoryForm.setValue({
      name: cat.name,
      description: cat.description || '',
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

    if (this.isEditing() && this.editingId) {
      this.categoryService.updateCategory(this.editingId, formVal).subscribe({
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
      this.categoryService.createCategory(formVal).subscribe({
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
    // Frontend safeguard message as required
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
