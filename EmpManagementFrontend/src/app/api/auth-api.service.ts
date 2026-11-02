import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, LoginResponse } from '../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Auth`;

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, dto);
  }

  changePassword(dto: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/change-password`, dto, { responseType: 'text' });
  }

  forgotPassword(dto: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, dto, { responseType: 'text' });
  }
}
