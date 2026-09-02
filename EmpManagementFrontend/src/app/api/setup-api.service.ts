import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InitialAdminRequest } from '../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class SetupApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Setup`;

  createInitialAdmin(dto: InitialAdminRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/admin`, dto, { responseType: 'text' });
  }
}
