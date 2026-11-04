import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-manager-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe, LanguageSwitcherComponent],
  template: `
    <div class="manager-login-page">
      <div class="login-card">
        <div class="login-lang-row">
          <app-language-switcher></app-language-switcher>
        </div>

        <div class="brand-header">
          <span class="portal-badge">{{ 'manager.loginBadge' | translate }}</span>
          <h1 class="brand-title">{{ 'manager.loginTitle' | translate }}</h1>
          <span class="brand-subtitle">{{ 'manager.loginSubtitle' | translate }}</span>
        </div>

        <p class="login-intro">
          {{ 'manager.loginIntro' | translate }}
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">{{ 'manager.emailLabel' | translate }}</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="manager@aurelia.com"
              class="form-control"
              [class.is-invalid]="f['email'].touched && f['email'].invalid"
            />
            <div class="form-error" *ngIf="f['email'].touched && f['email'].invalid">
              Please enter a valid manager email.
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">{{ 'manager.passwordLabel' | translate }}</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="••••••••••••"
              class="form-control"
              [class.is-invalid]="f['password'].touched && f['password'].invalid"
            />
            <div class="form-error" *ngIf="f['password'].touched && f['password'].invalid">
              Password is required (minimum 6 characters).
            </div>
          </div>

          <div class="error-banner" *ngIf="errorMessage()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-gold btn-lg w-100 signin-btn"
            [disabled]="isLoading() || loginForm.invalid"
          >
            <span *ngIf="!isLoading()">{{ 'manager.loginBtn' | translate }}</span>
            <span *ngIf="isLoading()">Verifying Credentials...</span>
          </button>
        </form>

        <div class="login-footer">
          <a routerLink="/" class="back-link">
            &larr; {{ 'manager.returnStore' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .manager-login-page {
        min-height: 100vh;
        background-color: var(--color-espresso);
        background-image: radial-gradient(
          circle at center,
          rgba(42, 33, 24, 0.8) 0%,
          rgba(28, 22, 17, 1) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .login-lang-row {
        display: flex;
        justify-content: center;
        margin-bottom: 0.5rem;
      }

      .login-card {
        background-color: #ffffff;
        border: 1px solid rgba(194, 162, 111, 0.35);
        border-radius: var(--radius-sm);
        padding: 3.5rem 3rem;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      }

      .brand-header {
        text-align: center;
        margin-bottom: 1.5rem;

        .portal-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-dark);
          background-color: var(--color-gold-pale);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
        }

        .brand-title {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          letter-spacing: 0.2em;
          color: var(--color-espresso);
          line-height: 1;
        }

        .brand-subtitle {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.38em;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-top: 0.35rem;
        }
      }

      .login-intro {
        text-align: center;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .signin-btn {
        margin-top: 1rem;
        height: 50px;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background-color: var(--danger-bg);
        border: 1px solid var(--danger-border);
        border-radius: var(--radius-sm);
        color: var(--danger-text);
        font-size: 0.82rem;
        margin-bottom: 1.25rem;
      }

      .login-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--color-border);
        text-align: center;

        .back-link {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          transition: var(--transition-fast);

          &:hover {
            color: var(--color-espresso);
          }
        }
      }
    `,
  ],
})
export class ManagerLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['manager@aurelia.com', [Validators.required, Validators.email]],
    password: ['Manager@123456', [Validators.required, Validators.minLength(6)]],
  });

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toastService.success(`Welcome back, ${res.data.manager.name}.`);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/manager/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Authentication failed. Please verify credentials.';
          this.errorMessage.set(msg);
        },
      });
  }
}
