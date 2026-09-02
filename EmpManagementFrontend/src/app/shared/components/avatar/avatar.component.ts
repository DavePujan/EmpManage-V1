import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar-circle"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.fontSize.px]="fontSize"
      [style.backgroundColor]="bgColor"
      [style.color]="textColor"
    >
      {{ initials }}
    </div>
  `,
  styles: [`
    .avatar-circle {
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
      text-transform: uppercase;
      user-select: none;
    }
  `]
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() size: number = 36;
  @Input() bgColor: string = 'var(--color-primary-soft)';
  @Input() textColor: string = 'var(--color-primary)';

  get fontSize(): number {
    return Math.max(11, Math.floor(this.size * 0.38));
  }

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }
}
