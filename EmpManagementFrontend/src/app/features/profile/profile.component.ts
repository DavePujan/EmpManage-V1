import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../api/auth-api.service';
import { EmployeeApiService } from '../../api/employee-api.service';
import { EmployeeListItem } from '../../core/models/user.models';
import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, AvatarComponent, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">Account & Profile</h1>
          <p class="page-description">Manage your personal information, employee credentials, and security settings.</p>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Left: Profile Summary Card -->
        <div class="profile-sidebar-card">
          <div class="profile-avatar-block">
            <app-avatar [name]="profileData?.name || authState.username()" [size]="80"></app-avatar>
            <h2 class="profile-user-name">{{ profileData?.name || authState.username() }}</h2>
            <p class="profile-user-email">{{ profileData?.email || 'No email registered' }}</p>
            <div class="mt-2">
              <app-status-badge [status]="authState.userRole() || ''" type="role"></app-status-badge>
            </div>
          </div>

          <div class="profile-quick-stats">
            <div class="quick-stat-item">
              <span class="label">Department</span>
              <span class="val">{{ profileData?.department || 'Not Assigned' }}</span>
            </div>
            <div class="quick-stat-item">
              <span class="label">Team</span>
              <span class="val">{{ profileData?.team || 'Not Assigned' }}</span>
            </div>
            <div class="quick-stat-item">
              <span class="label">Designation</span>
              <span class="val">{{ profileData?.designation || 'Not Assigned' }}</span>
            </div>
            <div class="quick-stat-item">
              <span class="label">Supervisor</span>
              <span class="val">{{ profileData?.supervisor || 'None' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Tabbed Forms -->
        <div class="profile-main-content">
          <!-- Navigation Tabs -->
          <div class="profile-tabs">
            <button
              class="profile-tab-btn"
              [class.active]="activeTab === 'personal'"
              (click)="activeTab = 'personal'"
            >
              <app-icon name="user" [size]="16"></app-icon>
              <span>Personal Information</span>
            </button>
            <button
              class="profile-tab-btn"
              [class.active]="activeTab === 'password'"
              (click)="activeTab = 'password'"
            >
              <app-icon name="key" [size]="16"></app-icon>
              <span>Security & Password</span>
            </button>
          </div>

          <!-- TAB 1: Personal Info -->
          @if (activeTab === 'personal') {
            <div class="card card-flat">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Personal Details</h3>
                  <p class="card-subtitle">Update your public name and primary email address.</p>
                </div>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
                <div class="card-body">
                  <div class="form-group">
                    <label for="prof-name">Full Name <span class="required">*</span></label>
                    <input id="prof-name" type="text" class="form-control" formControlName="name" />
                  </div>

                  <div class="form-group">
                    <label for="prof-email">Email Address <span class="required">*</span></label>
                    <input id="prof-email" type="email" class="form-control" formControlName="email" />
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn btn-primary" [disabled]="profileForm.invalid || isUpdatingProfile" (click)="onProfileSubmit()">
                      @if (isUpdatingProfile) {
                        <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                      }
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          }

          <!-- TAB 2: Change Password -->
          @if (activeTab === 'password') {
            <div class="card card-flat">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Change Password</h3>
                  <p class="card-subtitle">Ensure your account uses a secure and updated password.</p>
                </div>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
                <div class="card-body">
                  <!-- Current Password -->
                  <div class="form-group">
                    <label for="cur-pass">Current Password <span class="required">*</span></label>
                    <div class="input-group has-trailing-action">
                      <input
                        id="cur-pass"
                        [type]="showCurPassword ? 'text' : 'password'"
                        class="form-control"
                        formControlName="currentPassword"
                        placeholder="Enter current password"
                      />
                      <span class="input-action" (click)="showCurPassword = !showCurPassword">
                        <app-icon [name]="showCurPassword ? 'eye-off' : 'eye'" [size]="18"></app-icon>
                      </span>
                    </div>
                  </div>

                  <!-- New Password -->
                  <div class="form-group">
                    <label for="new-pass">New Password <span class="required">*</span></label>
                    <div class="input-group has-trailing-action">
                      <input
                        id="new-pass"
                        [type]="showNewPassword ? 'text' : 'password'"
                        class="form-control"
                        formControlName="newPassword"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <span class="input-action" (click)="showNewPassword = !showNewPassword">
                        <app-icon [name]="showNewPassword ? 'eye-off' : 'eye'" [size]="18"></app-icon>
                      </span>
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div class="form-group">
                    <label for="conf-pass">Confirm New Password <span class="required">*</span></label>
                    <input
                      id="conf-pass"
                      type="password"
                      class="form-control"
                      formControlName="confirmPassword"
                      placeholder="Repeat new password"
                    />
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn btn-primary" [disabled]="passwordForm.invalid || isChangingPassword" (click)="onPasswordSubmit()">
                      @if (isChangingPassword) {
                        <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                      }
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 900px) {
        grid-template-columns: 320px 1fr;
      }
    }

    .profile-sidebar-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      height: fit-content;
    }

    .profile-avatar-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--color-border);

      .profile-user-name {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-top: var(--space-3);
      }

      .profile-user-email {
        font-size: 13px;
        color: var(--color-text-muted);
        margin-top: 2px;
      }
    }

    .profile-quick-stats {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-top: var(--space-5);

      .quick-stat-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .val {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--color-text-primary);
        }
      }
    }

    .profile-main-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .profile-tabs {
      display: flex;
      gap: var(--space-2);
      border-bottom: 1px solid var(--color-border);

      .profile-tab-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        font-size: 13.5px;
        font-weight: 500;
        color: var(--color-text-secondary);
        border-bottom: 2px solid transparent;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--color-text-primary);
        }

        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 600;
        }
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeApi = inject(EmployeeApiService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  authState = inject(AuthStateService);

  activeTab: 'personal' | 'password' = 'personal';
  profileData: EmployeeListItem | null = null;

  isUpdatingProfile = false;
  isChangingPassword = false;
  showCurPassword = false;
  showNewPassword = false;

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'password') {
        this.activeTab = 'password';
        this.cdr.markForCheck();
      }
    });
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.employeeApi.getMyProfile().subscribe({
      next: (profile) => {
        this.profileData = profile;
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email
        });
        this.cdr.markForCheck();
      }
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile = true;
    this.employeeApi.updateMyProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isUpdatingProfile = false;
        this.toast.success('Profile updated successfully!');
        this.loadMyProfile();
      },
      error: () => {
        this.isUpdatingProfile = false;
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('New password and confirmation do not match.');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.toast.success('Password changed successfully.');
      },
      error: () => {
        this.isChangingPassword = false;
      }
    });
  }
}
