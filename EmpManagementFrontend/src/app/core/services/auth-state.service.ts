import { Injectable, computed, inject, signal } from '@angular/core';
import { CurrentUser, UserRole } from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private tokenService = inject(TokenService);

  private _currentUser = signal<CurrentUser | null>(null);
  private _isLoading = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  
  readonly isAuthenticated = computed(() => {
    return !!this._currentUser() && !this.tokenService.isTokenExpired();
  });

  readonly userRole = computed(() => {
    return this._currentUser()?.role ?? null;
  });

  readonly userId = computed(() => {
    return this._currentUser()?.id ?? null;
  });

  readonly username = computed(() => {
    return this._currentUser()?.username ?? '';
  });

  readonly isAdmin = computed(() => this.userRole() === UserRole.Admin);
  readonly isHR = computed(() => this.userRole() === UserRole.HR);
  readonly isManager = computed(() => this.userRole() === UserRole.Manager);
  readonly isEmployee = computed(() => this.userRole() === UserRole.Employee);

  constructor() {
    this.initializeFromToken();
  }

  initializeFromToken(): void {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isTokenExpired(token)) {
      this.clear();
      return;
    }

    const payload = this.tokenService.decodeToken(token);
    if (!payload) {
      this.clear();
      return;
    }

    const id = this.tokenService.extractUserId(payload) ?? 0;
    const username = this.tokenService.extractUsername(payload);
    const role = this.tokenService.extractRole(payload);

    this._currentUser.set({
      id,
      username,
      role,
      token
    });
  }

  setToken(token: string): void {
    this.tokenService.setToken(token);
    this.initializeFromToken();
  }

  setUser(user: CurrentUser): void {
    this.tokenService.setToken(user.token);
    this._currentUser.set(user);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  clear(): void {
    this.tokenService.removeToken();
    this._currentUser.set(null);
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const current = this.userRole();
    if (!current) return false;

    if (Array.isArray(roles)) {
      return roles.includes(current);
    }
    return current === roles;
  }
}
