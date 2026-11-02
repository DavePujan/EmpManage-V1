import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest, ForgotPasswordRequest } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthApiService } from '../../../api/auth-api.service';
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
              <div class="password-label-row">
                <label for="password">Password <span class="required">*</span></label>
                <button type="button" class="forgot-link-btn" (click)="isForgotPasswordModalOpen = true">
                  Forgot password?
                </button>
              </div>
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

          <!-- Footer Help -->
          <div class="auth-footer-help">
            <p>Need login assistance or forgotten your credentials?</p>
            <button type="button" class="btn btn-ghost btn-sm" (click)="isForgotPasswordModalOpen = true">
              Reset Password
            </button>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      @if (isForgotPasswordModalOpen) {
        <div class="modal-backdrop" (click)="isForgotPasswordModalOpen = false">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Reset Your Password</h3>
              <button class="btn btn-icon btn-ghost" (click)="isForgotPasswordModalOpen = false">
                <app-icon name="x" [size]="18"></app-icon>
              </button>
            </div>
            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onForgotPasswordSubmit()">
              <div class="modal-body">
                <p class="text-caption mb-4">
                  Enter your registered work email address. We will verify your account and dispatch a temporary password to your inbox.
                </p>

                <div class="form-group">
                  <label for="forgot-email">Work Email Address <span class="required">*</span></label>
                  <div class="input-group has-leading-icon">
                    <span class="input-icon">
                      <app-icon name="mail" [size]="18"></app-icon>
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      class="form-control"
                      formControlName="email"
                      placeholder="e.g. employee@company.com"
                      [class.is-invalid]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                    />
                  </div>
                  @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                    <span class="form-error">Please enter a valid email address</span>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="isForgotPasswordModalOpen = false">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="forgotPasswordForm.invalid || isResettingPassword">
                  @if (isResettingPassword) {
                    <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                    <span>Sending...</span>
                  } @else {
                    <span>Send Temporary Password</span>
                  }
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
        top: -20%;
        left: -20%;
        width: 140%;
        height: 140%;
        background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
        pointer-events: none;
      }
    }

    .hero-content {
      max-width: 520px;
      position: relative;
      z-index: 1;
    }

    .hero-brand {
      margin-bottom: var(--space-8);
    }

    .hero-logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .hero-headline h1 {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.2;
      color: #FFFFFF;
      margin-bottom: var(--space-4);
      letter-spacing: -0.025em;
    }

    .hero-headline p {
      font-size: 1.125rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: var(--space-8);
    }

    .hero-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .feature-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background-color: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-full);
      width: fit-content;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      font-weight: 500;
      backdrop-filter: blur(8px);
    }

    .auth-form-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);

      @media (min-width: 961px) {
        max-width: 560px;
      }
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
    }

    .auth-header {
      margin-bottom: var(--space-8);
    }

    .auth-mobile-logo {
      display: none;
      margin-bottom: var(--space-6);

      @media (max-width: 960px) {
        display: block;
      }
    }

    .mobile-logo-img {
      height: 40px;
      width: auto;
    }

    .auth-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
      letter-spacing: -0.02em;
    }

    .auth-header p {
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
    }

    .password-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-1);
    }

    .forgot-link-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;

      &:hover {
        text-decoration: underline;
        color: var(--color-primary-dark, #4338ca);
      }
    }

    .form-group {
      margin-bottom: var(--space-5);
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .required {
      color: var(--color-danger);
    }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .has-leading-icon .form-control {
      padding-left: 2.5rem;
    }

    .has-trailing-action .form-control {
      padding-right: 2.5rem;
    }

    .input-action {
      position: absolute;
      right: var(--space-3);
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-text-primary);
      }
    }

    .form-control {
      width: 100%;
      height: 44px;
      padding: var(--space-2) var(--space-3);
      font-size: 0.9375rem;
      color: var(--color-text-primary);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }

      &.is-invalid {
        border-color: var(--color-danger);

        &:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
      }
    }

    .form-error {
      display: block;
      margin-top: var(--space-1);
      font-size: 0.75rem;
      color: var(--color-danger);
    }

    .auth-footer-help {
      margin-top: var(--space-8);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);

      p {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .modal-dialog {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 440px;
      border: 1px solid var(--color-border);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .modal-body {
      padding: var(--space-6);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      background: var(--color-bg-secondary, #f8fafc);
      border-top: 1px solid var(--color-border);
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
  private authApi = inject(AuthApiService);
  private toast = inject(ToastService);
  authState = inject(AuthStateService);

  showPassword = false;
  isForgotPasswordModalOpen = false;
  isResettingPassword = false;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
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

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isResettingPassword = true;
    const email = (this.forgotPasswordForm.value.email || '').trim();

    this.authApi.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.isResettingPassword = false;
        this.isForgotPasswordModalOpen = false;
        this.toast.success(res || 'If an account with this email exists, a temporary password has been sent to your inbox.');
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isResettingPassword = false;
        this.toast.error('Could not process password reset request. Please try again.');
      }
    });
  }
}
