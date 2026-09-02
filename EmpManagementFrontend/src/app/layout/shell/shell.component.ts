import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, ToastComponent],
  template: `
    <div class="app-layout">
      <!-- Mobile Drawer Backdrop -->
      @if (isMobileOpen) {
        <div class="mobile-drawer-backdrop" (click)="closeMobileDrawer()"></div>
      }

      <!-- Sidebar -->
      <div class="sidebar-wrapper" [class.mobile-open]="isMobileOpen">
        <app-sidebar
          [isCollapsed]="isSidebarCollapsed"
          (navClicked)="closeMobileDrawer()"
        ></app-sidebar>
      </div>

      <!-- Main Area -->
      <div class="main-wrapper">
        <app-header
          [isSidebarCollapsed]="isSidebarCollapsed"
          (toggleSidebar)="onToggleSidebar()"
        ></app-header>

        <main class="content-body">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Toast Container -->
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--color-bg);
    }

    .sidebar-wrapper {
      flex-shrink: 0;

      @media (max-width: 1024px) {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 100;
        transform: translateX(-100%);
        transition: transform var(--transition-base);

        &.mobile-open {
          transform: translateX(0);
        }
      }
    }

    .mobile-drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 99;
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }

    .content-body {
      flex: 1;
      padding-bottom: var(--space-10);
    }
  `]
})
export class ShellComponent {
  isSidebarCollapsed: boolean = false;
  isMobileOpen: boolean = false;

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1024) {
      this.isMobileOpen = false;
    }
  }

  onToggleSidebar(): void {
    if (window.innerWidth <= 1024) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileDrawer(): void {
    this.isMobileOpen = false;
  }
}
