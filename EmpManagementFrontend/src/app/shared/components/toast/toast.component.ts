import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item toast-{{ toast.type }}" role="alert">
          <!-- Type Icon -->
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <app-icon name="check-circle" [size]="20" customClass="text-success"></app-icon>
              }
              @case ('error') {
                <app-icon name="alert-circle" [size]="20" customClass="text-danger"></app-icon>
              }
              @case ('warning') {
                <app-icon name="alert-circle" [size]="20" customClass="text-warning"></app-icon>
              }
              @case ('info') {
                <app-icon name="info" [size]="20" customClass="text-primary"></app-icon>
              }
            }
          </div>

          <!-- Content -->
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>

          <!-- Close Button -->
          <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Close notification">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
