import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authState = inject(AuthStateService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.title) {
          errorMessage = error.error.title;
        }
      }

      switch (error.status) {
        case 400:
          // Bad Request / Validation error
          toast.error(errorMessage, 'Request Failed');
          break;

        case 401:
          // Unauthorized - Session expired or invalid credentials
          if (!req.url.includes('/Auth/login')) {
            authState.clear();
            toast.warning('Your session has expired. Please log in again.', 'Unauthorized');
            router.navigate(['/login']);
          } else {
            toast.error(errorMessage || 'Invalid username or password.', 'Login Failed');
          }
          break;

        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.', 'Access Denied');
          break;

        case 404:
          // Not Found
          toast.error(errorMessage || 'The requested resource was not found.', 'Not Found');
          break;

        case 409:
          // Conflict
          toast.warning(errorMessage || 'A conflict occurred with existing data.', 'Conflict');
          break;

        case 500:
          // Server Error
          toast.error(errorMessage || 'Internal server error. Please try again later.', 'Server Error');
          break;

        case 0:
          // Network Error / Server unreachable
          toast.error('Unable to connect to the server. Please ensure the backend is running.', 'Connection Error');
          break;

        default:
          toast.error(errorMessage, `Error ${error.status || ''}`);
          break;
      }

      return throwError(() => error);
    })
  );
};
