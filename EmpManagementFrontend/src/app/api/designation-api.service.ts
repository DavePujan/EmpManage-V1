import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateDesignationRequest,
  DesignationDetails,
  DesignationEmployee,
  DesignationItem,
  UpdateDesignationRequest,
  UpdateDesignationStatusRequest
} from '../core/models/designation.models';

@Injectable({
  providedIn: 'root'
})
export class DesignationApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Designation`;

  create(dto: CreateDesignationRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  getAll(): Observable<DesignationItem[]> {
    return this.http.get<DesignationItem[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<DesignationDetails> {
    return this.http.get<DesignationDetails>(`${this.baseUrl}/${id}`);
  }

  update(id: number, dto: UpdateDesignationRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, { responseType: 'text' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  updateStatus(id: number, isActive: boolean): Observable<string> {
    const body: UpdateDesignationStatusRequest = { isActive };
    return this.http.put(`${this.baseUrl}/${id}/status`, body, { responseType: 'text' });
  }

  getEmployees(id: number): Observable<DesignationEmployee[]> {
    return this.http.get<DesignationEmployee[]>(`${this.baseUrl}/${id}/employees`);
  }
}
