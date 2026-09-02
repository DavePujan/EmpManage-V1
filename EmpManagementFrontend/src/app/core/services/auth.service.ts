import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthApiService } from '../../api/auth-api.service';
import { ChangePasswordRequest, LoginRequest, LoginResponse } from '../models/auth.models';
import { AuthStateService } from './auth-state.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AuthApiService);
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private toast = inject(ToastService);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authState.setLoading(true);

    return this.authApi.login(credentials).pipe(
      tap({
        next: (response) => {
          this.authState.setLoading(false);
          if (response && response.token) {
            this.authState.setToken(response.token);
            this.toast.success(`Welcome back, ${credentials.username}!`);
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          this.authState.setLoading(false);
        }
      })
    );
  }

  changePassword(dto: ChangePasswordRequest): Observable<string> {
    return this.authApi.changePassword(dto).pipe(
      tap({
        next: (res) => {
          this.toast.success(res || 'Password changed successfully.');
        }
      })
    );
  }

  logout(): void {
    this.authState.clear();
    this.toast.info('You have been logged out.');
    this.router.navigate(['/login']);
  }
}
