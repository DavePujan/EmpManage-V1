import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateEmployeeRequest,
  EmployeeCountResponse,
  EmployeeListItem,
  UpdateEmployeeRequest,
  UpdateEmployeeStatusRequest,
  UpdateMyProfileRequest
} from '../core/models/user.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Employee`;

  create(dto: CreateEmployeeRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  getAll(): Observable<EmployeeListItem[]> {
    return this.http.get<EmployeeListItem[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<EmployeeListItem> {
    return this.http.get<EmployeeListItem>(`${this.baseUrl}/${id}`);
  }

  update(id: number, dto: UpdateEmployeeRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, { responseType: 'text' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getCount(): Observable<EmployeeCountResponse> {
    return this.http.get<EmployeeCountResponse>(`${this.baseUrl}/count`);
  }

  updateStatus(id: number, dto: UpdateEmployeeStatusRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}/status`, dto, { responseType: 'text' });
  }

  getMyProfile(): Observable<EmployeeListItem> {
    return this.http.get<EmployeeListItem>(`${this.baseUrl}/me`);
  }

  updateMyProfile(dto: UpdateMyProfileRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/me`, dto, { responseType: 'text' });
  }
}
