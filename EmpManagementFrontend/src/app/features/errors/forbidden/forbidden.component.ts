import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-icon">
          <app-icon name="shield" [size]="56"></app-icon>
        </div>
        <div class="error-code">403</div>
        <h1 class="error-title">Access Restricted</h1>
        <p class="error-desc">You do not have the required permissions or organizational role to access this section.</p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            <app-icon name="dashboard" [size]="16"></app-icon>
            <span>Return to Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-6);
    }
    .error-content {
      max-width: 460px;
    }
    .error-icon {
      color: var(--color-warning);
      margin-bottom: var(--space-3);
    }
    .error-code {
      font-size: 56px;
      font-weight: 800;
      color: var(--color-text-primary);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1;
      margin-bottom: var(--space-2);
    }
    .error-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }
    .error-desc {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }
    .error-actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class ForbiddenComponent {}
