import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { UserRole } from '../../core/models/auth.models';
import { AuthStateService } from '../../core/services/auth-state.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authState = inject(AuthStateService);

  private requiredRoles: UserRole[] = [];
  private isVisible = false;

  @Input() set appHasRole(roles: UserRole | UserRole[] | string | string[]) {
    if (Array.isArray(roles)) {
      this.requiredRoles = roles as UserRole[];
    } else if (roles) {
      this.requiredRoles = [roles as UserRole];
    } else {
      this.requiredRoles = [];
    }
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluate whenever current user changes
      this.authState.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    const hasPermission = this.requiredRoles.length === 0 || this.authState.hasRole(this.requiredRoles);

    if (hasPermission && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPermission && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
