import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="getBadgeClass()">
      <span class="badge-dot"></span>
      {{ displayText }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string | boolean = '';
  @Input() label?: string;
  @Input() type: 'status' | 'leave' | 'role' = 'status';

  get displayText(): string {
    if (this.label) return this.label;
    if (typeof this.status === 'boolean') {
      return this.status ? 'Active' : 'Inactive';
    }
    return String(this.status);
  }

  getBadgeClass(): string {
    if (this.type === 'status') {
      if (typeof this.status === 'boolean') {
        return this.status ? 'badge-active' : 'badge-inactive';
      }
      return this.status?.toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive';
    }

    if (this.type === 'leave') {
      switch (this.status?.toString().toLowerCase()) {
        case 'approved':
          return 'badge-approved';
        case 'rejected':
          return 'badge-rejected';
        case 'cancelled':
          return 'badge-cancelled';
        case 'pending':
        default:
          return 'badge-pending';
      }
    }

    if (this.type === 'role') {
      switch (this.status?.toString().toLowerCase()) {
        case 'admin':
          return 'badge-role-admin';
        case 'hr':
          return 'badge-role-hr';
        case 'manager':
          return 'badge-role-manager';
        default:
          return 'badge-role-employee';
      }
    }

    return 'badge-neutral';
  }
}
