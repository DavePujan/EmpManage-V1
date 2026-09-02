import { Injectable } from '@angular/core';
import { JwtPayload, UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'emp_auth_token';

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save token to localStorage', e);
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove token from localStorage', e);
    }
  }

  hasToken(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  decodeToken(token?: string | null): JwtPayload | null {
    const rawToken = token || this.getToken();
    if (!rawToken) return null;

    try {
      const parts = rawToken.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as JwtPayload;
    } catch (e) {
      console.error('Error decoding JWT token', e);
      return null;
    }
  }

  isTokenExpired(token?: string | null): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    // exp is in seconds, Date.now() in ms
    const expirationDate = payload.exp * 1000;
    return Date.now() >= expirationDate;
  }

  extractUserId(payload: JwtPayload | null): number | null {
    if (!payload) return null;
    const idStr = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid;
    return idStr ? parseInt(idStr, 10) : null;
  }

  extractUsername(payload: JwtPayload | null): string {
    if (!payload) return '';
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || '';
  }

  extractRole(payload: JwtPayload | null): UserRole {
    if (!payload) return UserRole.Employee;
    const roleStr = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
    
    switch (roleStr?.toLowerCase()) {
      case 'admin':
        return UserRole.Admin;
      case 'hr':
        return UserRole.HR;
      case 'manager':
        return UserRole.Manager;
      default:
        return UserRole.Employee;
    }
  }
}
