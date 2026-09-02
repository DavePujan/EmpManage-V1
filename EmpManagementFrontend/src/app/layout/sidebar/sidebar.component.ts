import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserRole } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, AvatarComponent, StatusBadgeComponent],
  template: `
    <aside class="app-sidebar" [class.is-collapsed]="isCollapsed">
      <!-- Brand / Logo -->
      <div class="sidebar-brand">
        <a routerLink="/dashboard" class="brand-link" title="EmpManage Enterprise">
          <img src="/logo.webp" alt="EmpManage Enterprise" class="brand-logo" />
        </a>
      </div>

      <!-- Navigation Section -->
      <div class="sidebar-menu">
        <div class="menu-section-label" *ngIf="!isCollapsed">MAIN MENU</div>
        <nav class="nav-list">
          @for (item of filteredNavItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="nav-link"
              [title]="isCollapsed ? item.label : ''"
              (click)="onNavClick()"
            >
              <span class="nav-icon">
                <app-icon [name]="item.icon" [size]="20"></app-icon>
              </span>
              @if (!isCollapsed) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>
      </div>

      <!-- User & Logout Footer -->
      <div class="sidebar-footer">
        <div class="user-pill" [routerLink]="['/profile']" (click)="onNavClick()">
          <app-avatar [name]="authState.username()" [size]="36"></app-avatar>
          @if (!isCollapsed) {
            <div class="user-meta">
              <span class="user-name">{{ authState.username() }}</span>
              <span class="user-role-badge">
                <app-status-badge [status]="authState.userRole() || ''" type="role"></app-status-badge>
              </span>
            </div>
          }
        </div>

        <button class="logout-btn" (click)="logout()" title="Logout">
          <app-icon name="logout" [size]="18"></app-icon>
          @if (!isCollapsed) {
            <span>Logout</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      transition: width var(--transition-base);
      z-index: 90;

      &.is-collapsed {
        width: var(--sidebar-collapsed-width);
      }
    }

    .sidebar-brand {
      height: var(--header-height);
      display: flex;
      align-items: center;
      padding: 0 var(--space-4);
      border-bottom: 1px solid var(--color-border);
      background-color: #FFFFFF;

      .brand-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        width: 100%;
        overflow: hidden;
      }

      .brand-logo {
        height: 38px;
        max-width: 100%;
        object-fit: contain;
        display: block;
        transition: transform var(--transition-fast);

        &:hover {
          transform: scale(1.02);
        }
      }
    }

    .sidebar-menu {
      flex: 1;
      padding: var(--space-5) var(--space-3);
      overflow-y: auto;

      .menu-section-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 0.06em;
        padding: 0 var(--space-3) var(--space-2);
      }
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: all var(--transition-fast);
      text-decoration: none;

      .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        transition: color var(--transition-fast);
      }

      &:hover {
        background-color: var(--color-surface-secondary);
        color: var(--color-text-primary);

        .nav-icon {
          color: var(--color-text-primary);
        }
      }

      &.active {
        background-color: var(--color-primary-soft);
        color: var(--color-primary);
        font-weight: 600;

        .nav-icon {
          color: var(--color-primary);
        }
      }
    }

    .sidebar-footer {
      padding: var(--space-4) var(--space-3);
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 8px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: var(--color-surface-secondary);
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      color: var(--color-danger);
      font-size: 13px;
      font-weight: 500;
      transition: background-color var(--transition-fast);
      width: 100%;

      &:hover {
        background-color: var(--color-danger-bg);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Output() navClicked = new EventEmitter<void>();

  authState = inject(AuthStateService);
  private authService = inject(AuthService);

  readonly allNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Employees', route: '/employees', icon: 'users', roles: [UserRole.Admin, UserRole.HR] },
    { label: 'Departments', route: '/departments', icon: 'building', roles: [UserRole.Admin, UserRole.HR] },
    { label: 'Teams', route: '/teams', icon: 'teams', roles: [UserRole.Admin, UserRole.HR] },
    { label: 'Designations', route: '/designations', icon: 'award', roles: [UserRole.Admin] },
    { label: 'Leave Management', route: '/leaves', icon: 'calendar' },
    { label: 'My Profile', route: '/profile', icon: 'user' }
  ];

  get filteredNavItems(): NavItem[] {
    const role = this.authState.userRole();
    return this.allNavItems.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return role ? item.roles.includes(role) : false;
    });
  }

  onNavClick(): void {
    this.navClicked.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
