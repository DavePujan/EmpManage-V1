import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { SetupApiService } from '../../../api/setup-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="auth-page">
      <!-- Left Hero Panel -->
      <div class="auth-hero">
        <div class="hero-content">
          <div class="hero-brand">
            <img src="/logo.webp" alt="EmpManage Enterprise" class="hero-logo-img" />
          </div>

          <div class="hero-headline">
            <h1>Enterprise Workforce & Leave Management Platform</h1>
            <p>Streamline employee onboarding, department hierarchies, team assignments, and automated leave approval workflows.</p>
          </div>

          <div class="hero-features">
            <div class="feature-pill">
              <app-icon name="shield" [size]="18"></app-icon>
              <span>Role-Based Access Control</span>
            </div>
            <div class="feature-pill">
              <app-icon name="calendar" [size]="18"></app-icon>
              <span>Automated Leave Tracking</span>
            </div>
            <div class="feature-pill">
              <app-icon name="users" [size]="18"></app-icon>
              <span>Multi-tier Team Management</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="auth-form-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-mobile-logo">
              <img src="/logo.webp" alt="EmpManage Enterprise" class="mobile-logo-img" />
            </div>
            <h2>Welcome back</h2>
            <p>Please enter your credentials to access your account.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Username Input -->
            <div class="form-group">
              <label for="username">Username <span class="required">*</span></label>
              <div class="input-group has-leading-icon">
                <span class="input-icon">
                  <app-icon name="user" [size]="18"></app-icon>
                </span>
                <input
                  id="username"
                  type="text"
                  class="form-control"
                  placeholder="e.g. admin or john_doe"
                  formControlName="username"
                  [class.is-invalid]="isFieldInvalid('username')"
                />
              </div>
              @if (isFieldInvalid('username')) {
                <span class="form-error">Username is required</span>
              }
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label for="password">Password <span class="required">*</span></label>
              <div class="input-group has-leading-icon has-trailing-action">
                <span class="input-icon">
                  <app-icon name="key" [size]="18"></app-icon>
                </span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Enter your password"
                  formControlName="password"
                  [class.is-invalid]="isFieldInvalid('password')"
                />
                <span class="input-action" (click)="showPassword = !showPassword" [title]="showPassword ? 'Hide password' : 'Show password'">
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="18"></app-icon>
                </span>
              </div>
              @if (isFieldInvalid('password')) {
                <span class="form-error">Password is required</span>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg w-full mt-2"
              [disabled]="loginForm.invalid || authState.isLoading()"
            >
              @if (authState.isLoading()) {
                <app-icon name="refresh" [size]="18" customClass="spin"></app-icon>
                <span>Signing in...</span>
              } @else {
                <span>Sign in</span>
                <app-icon name="arrow-right" [size]="18"></app-icon>
              }
            </button>
          </form>

          <!-- Initial Admin Setup Trigger -->
          <div class="auth-footer-help">
            <p>First time system setup?</p>
            <button type="button" class="btn btn-ghost btn-sm" (click)="isSetupModalOpen = true">
              Create Initial Admin
            </button>
          </div>
        </div>
      </div>

      <!-- Initial Admin Modal -->
      @if (isSetupModalOpen) {
        <div class="modal-backdrop" (click)="isSetupModalOpen = false">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create Initial Admin Account</h3>
              <button class="btn btn-icon btn-ghost" (click)="isSetupModalOpen = false">
                <app-icon name="x" [size]="18"></app-icon>
              </button>
            </div>
            <form [formGroup]="setupForm" (ngSubmit)="onSetupSubmit()">
              <div class="modal-body">
                <p class="text-caption mb-4">
                  This endpoint sets up the master administrator if no admin account currently exists in the system.
                </p>

                <div class="form-group">
                  <label for="setup-username">Admin Username <span class="required">*</span></label>
                  <input id="setup-username" type="text" class="form-control" formControlName="username" placeholder="admin" />
                </div>

                <div class="form-group">
                  <label for="setup-email">Admin Email <span class="required">*</span></label>
                  <input id="setup-email" type="email" class="form-control" formControlName="email" placeholder="admin@company.com" />
                </div>

                <div class="form-group">
                  <label for="setup-password">Admin Password <span class="required">*</span></label>
                  <input id="setup-password" type="password" class="form-control" formControlName="password" placeholder="At least 6 characters" />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="isSetupModalOpen = false">Cancel</button>
                <button type="button" class="btn btn-primary" [disabled]="setupForm.invalid || isSettingUp" (click)="onSetupSubmit()">
                  @if (isSettingUp) {
                    <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                  }
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background-color: var(--color-bg);
    }

    .auth-hero {
      flex: 1;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-10);
      position: relative;
      overflow: hidden;

      @media (max-width: 960px) {
        display: none;
      }

      &::before {
        content: '';
        position: absolute;
        width: 500px;
        height: 500px;
        border-radius: var(--radius-full);
        background: radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0) 70%);
        top: -100px;
        right: -100px;
      }
    }

    .hero-content {
      max-width: 500px;
      position: relative;
      z-index: 2;
    }

    .hero-brand {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-8);

      .hero-logo-img {
        height: 52px;
        width: auto;
        object-fit: contain;
        background: rgba(255, 255, 255, 0.98);
        padding: 8px 16px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        backdrop-filter: blur(8px);
      }
    }

    .hero-headline {
      margin-bottom: var(--space-8);

      h1 {
        font-size: 32px;
        font-weight: 800;
        line-height: 1.2;
        color: #FFFFFF;
        margin-bottom: var(--space-4);
        letter-spacing: -0.03em;
      }

      p {
        font-size: 15px;
        line-height: 1.6;
        color: #94A3B8;
      }
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);

      .feature-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        padding: 10px 16px;
        background-color: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        font-size: 13.5px;
        font-weight: 500;
        color: #E2E8F0;
        backdrop-filter: blur(4px);
        width: fit-content;

        svg {
          color: var(--color-primary);
        }
      }
    }

    .auth-form-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background-color: var(--color-bg);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: var(--space-8);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);

      @media (max-width: 480px) {
        padding: var(--space-5);
        border: none;
        box-shadow: none;
        background: transparent;
      }
    }

    .auth-header {
      margin-bottom: var(--space-6);

      .auth-mobile-logo {
        display: none;
        margin-bottom: var(--space-4);

        .mobile-logo-img {
          height: 38px;
          object-fit: contain;
        }

        @media (max-width: 992px) {
          display: flex;
          justify-content: flex-start;
        }
      }

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: var(--space-1);
      }

      p {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
    }

    .auth-footer-help {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private setupApi = inject(SetupApiService);
  private toast = inject(ToastService);
  authState = inject(AuthStateService);

  showPassword = false;
  isSetupModalOpen = false;
  isSettingUp = false;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  setupForm: FormGroup = this.fb.group({
    username: ['admin', [Validators.required]],
    email: ['admin@company.com', [Validators.required, Validators.email]],
    password: ['AdminPassword123!', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = {
      username: (this.loginForm.value.username || '').trim(),
      password: (this.loginForm.value.password || '').trim()
    };

    this.authService.login(payload).subscribe({
      error: (err) => {
        console.error('Login request failed', err);
      }
    });
  }

  onSetupSubmit(): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.isSettingUp = true;
    this.setupApi.createInitialAdmin(this.setupForm.value).subscribe({
      next: (res) => {
        this.isSettingUp = false;
        this.isSetupModalOpen = false;
        this.toast.success(res || 'Initial Admin created successfully!');
        this.loginForm.patchValue({
          username: this.setupForm.value.username,
          password: this.setupForm.value.password
        });
      },
      error: () => {
        this.isSettingUp = false;
      }
    });
  }
}
