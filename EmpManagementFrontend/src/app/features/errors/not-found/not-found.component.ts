import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Page not found</h1>
        <p class="error-desc">Sorry, the page you are looking for does not exist or has been moved.</p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            <app-icon name="dashboard" [size]="16"></app-icon>
            <span>Back to Dashboard</span>
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
    .error-code {
      font-size: 72px;
      font-weight: 800;
      color: var(--color-primary);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1;
      margin-bottom: var(--space-2);
    }
    .error-title {
      font-size: 24px;
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
export class NotFoundComponent {}
