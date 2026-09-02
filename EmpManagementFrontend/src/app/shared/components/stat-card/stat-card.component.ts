import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stat-card">
      <div class="stat-info">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-value">{{ value }}</span>
        @if (meta) {
          <span class="stat-meta">{{ meta }}</span>
        }
      </div>
      <div class="stat-icon-wrapper icon-{{ colorVariant }}">
        <app-icon [name]="icon" [size]="24"></app-icon>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'dashboard';
  @Input() colorVariant: 'primary' | 'tertiary' | 'info' | 'warning' | 'dark' = 'primary';
  @Input() meta: string = '';
}
