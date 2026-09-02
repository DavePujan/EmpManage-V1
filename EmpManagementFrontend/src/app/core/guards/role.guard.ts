import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.models';
import { AuthStateService } from '../services/auth-state.service';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authState.hasRole(allowedRoles)) {
    return true;
  }

  toast.error('You do not have permission to view this section.', 'Access Restricted');
  return router.createUrlTree(['/403']);
};
