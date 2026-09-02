import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog modal-sm" role="dialog" aria-modal="true">
          <div class="modal-body text-center" style="padding-top: 32px;">
            <!-- Icon -->
            <div class="dialog-icon-wrapper" [ngClass]="'icon-' + variant">
              <app-icon [name]="icon" [size]="28"></app-icon>
            </div>

            <!-- Title & Message -->
            <h3 class="dialog-title">{{ title }}</h3>
            <p class="dialog-message">{{ message }}</p>

            <!-- Actions -->
            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-outline w-full"
                [disabled]="isLoading"
                (click)="cancel.emit()"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="btn w-full"
                [ngClass]="variant === 'danger' ? 'btn-danger' : 'btn-primary'"
                [disabled]="isLoading"
                (click)="confirm.emit()"
              >
                @if (isLoading) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);

      &.icon-danger {
        background-color: var(--color-danger-bg);
        color: var(--color-danger);
      }

      &.icon-warning {
        background-color: var(--color-warning-bg);
        color: var(--color-warning);
      }

      &.icon-primary {
        background-color: var(--color-primary-soft);
        color: var(--color-primary);
      }
    }

    .dialog-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .dialog-message {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-6);
    }

    .dialog-actions {
      display: flex;
      gap: var(--space-3);
      width: 100%;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Are you sure?';
  @Input() message: string = 'This action cannot be undone.';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'primary' = 'danger';
  @Input() icon: string = 'alert-circle';
  @Input() isLoading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      if (!this.isLoading) {
        this.cancel.emit();
      }
    }
  }
}
