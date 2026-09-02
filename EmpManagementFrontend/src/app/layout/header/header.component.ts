import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, AvatarComponent, StatusBadgeComponent],
  template: `
    <header class="app-header">
      <!-- Left: Hamburger + Page Info -->
      <div class="header-left">
        <button class="menu-toggle-btn" (click)="toggleSidebar.emit()" aria-label="Toggle menu">
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <div class="header-branding">
          <span class="header-system-status">
            <span class="status-indicator"></span>
            System Online
          </span>
        </div>
      </div>

      <!-- Right: User Menu & Actions -->
      <div class="header-right">
        <!-- Notification Bell -->
        <button class="icon-action-btn" title="Notifications">
          <app-icon name="bell" [size]="19"></app-icon>
          <span class="notification-badge"></span>
        </button>

        <!-- Divider -->
        <div class="header-divider"></div>

        <!-- User Dropdown Toggle -->
        <div class="user-dropdown-container">
          <button class="user-profile-btn" (click)="isDropdownOpen = !isDropdownOpen">
            <app-avatar [name]="authState.username()" [size]="34"></app-avatar>
            <div class="user-info-text">
              <span class="user-name">{{ authState.username() }}</span>
              <span class="user-role-label">
                <app-status-badge [status]="authState.userRole() || ''" type="role"></app-status-badge>
              </span>
            </div>
            <app-icon name="chevron-down" [size]="14" customClass="dropdown-chevron"></app-icon>
          </button>

          <!-- Dropdown Menu -->
          @if (isDropdownOpen) {
            <div class="dropdown-backdrop" (click)="isDropdownOpen = false"></div>
            <div class="dropdown-menu">
              <div class="dropdown-header">
                <div class="signed-in-as">Signed in as</div>
                <div class="dropdown-user-name">{{ authState.username() }}</div>
              </div>

              <div class="dropdown-divider"></div>

              <a [routerLink]="['/profile']" class="dropdown-item" (click)="isDropdownOpen = false">
                <app-icon name="user" [size]="16"></app-icon>
                <span>My Profile</span>
              </a>

              <a [routerLink]="['/profile']" [queryParams]="{ tab: 'password' }" class="dropdown-item" (click)="isDropdownOpen = false">
                <app-icon name="key" [size]="16"></app-icon>
                <span>Change Password</span>
              </a>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item dropdown-logout" (click)="logout()">
                <app-icon name="logout" [size]="16"></app-icon>
                <span>Log out</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: var(--header-height);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
      position: sticky;
      top: 0;
      z-index: 80;

      @media (max-width: 768px) {
        padding: 0 var(--space-4);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .menu-toggle-btn {
      padding: 8px;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--color-surface-secondary);
        color: var(--color-text-primary);
      }
    }

    .header-system-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-muted);
      background-color: var(--color-bg);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);

      .status-indicator {
        width: 7px;
        height: 7px;
        border-radius: var(--radius-full);
        background-color: var(--color-success);
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .icon-action-btn {
      position: relative;
      padding: 8px;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--color-surface-secondary);
        color: var(--color-text-primary);
      }

      .notification-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 7px;
        height: 7px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary);
      }
    }

    .header-divider {
      width: 1px;
      height: 24px;
      background-color: var(--color-border);
    }

    .user-dropdown-container {
      position: relative;
    }

    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 4px 8px;
      border-radius: var(--radius-md);
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: var(--color-surface-secondary);
      }

      .user-info-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;

        @media (max-width: 640px) {
          display: none;
        }

        .user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }

      .dropdown-chevron {
        color: var(--color-text-muted);
      }
    }

    .dropdown-backdrop {
      position: fixed;
      inset: 0;
      z-index: 95;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 200px;
      padding: var(--space-2) 0;
      z-index: 100;
      animation: scaleUp var(--transition-fast) ease-out;
    }

    .dropdown-header {
      padding: var(--space-2) var(--space-4);

      .signed-in-as {
        font-size: 11px;
        color: var(--color-text-muted);
        text-transform: uppercase;
      }

      .dropdown-user-name {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: var(--space-1) 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 8px var(--space-4);
      font-size: 13.5px;
      color: var(--color-text-secondary);
      text-decoration: none;
      width: 100%;
      text-align: left;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--color-surface-secondary);
        color: var(--color-text-primary);
      }

      &.dropdown-logout {
        color: var(--color-danger);
        &:hover {
          background-color: var(--color-danger-bg);
        }
      }
    }
  `]
})
export class HeaderComponent {
  @Input() isSidebarCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  isDropdownOpen: boolean = false;

  authState = inject(AuthStateService);
  private authService = inject(AuthService);

  logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
  }
}
