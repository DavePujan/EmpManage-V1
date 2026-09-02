import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-state-card">
      <div class="empty-icon-wrapper">
        <app-icon [name]="icon" [size]="36"></app-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary btn-sm" (click)="action.emit()">
          @if (actionIcon) {
            <app-icon [name]="actionIcon" [size]="16"></app-icon>
          }
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-10) var(--space-6);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
      width: 100%;
    }

    .empty-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary-soft);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .empty-description {
      font-size: 13px;
      color: var(--color-text-muted);
      max-width: 360px;
      margin-bottom: var(--space-4);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'info';
  @Input() title: string = 'No records found';
  @Input() description: string = 'Try adjusting your search criteria or adding a new item.';
  @Input() actionLabel: string = '';
  @Input() actionIcon: string = '';
  @Output() action = new EventEmitter<void>();
}
