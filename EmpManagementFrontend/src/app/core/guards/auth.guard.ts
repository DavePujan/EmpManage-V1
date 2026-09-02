import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (authState.isAuthenticated()) {
    return true;
  }

  toast.warning('Please log in to access this page.', 'Authentication Required');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
