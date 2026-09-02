import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateDepartmentRequest,
  DepartmentCountResponse,
  DepartmentEmployeeItem,
  DepartmentListItem
} from '../core/models/department.models';
import { TeamListItem } from '../core/models/team.models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Department`;

  create(dto: CreateDepartmentRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  getAll(): Observable<DepartmentListItem[]> {
    return this.http.get<DepartmentListItem[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<DepartmentListItem> {
    return this.http.get<DepartmentListItem>(`${this.baseUrl}/${id}`);
  }

  getCount(): Observable<DepartmentCountResponse> {
    return this.http.get<DepartmentCountResponse>(`${this.baseUrl}/count`);
  }

  getTeams(id: number): Observable<TeamListItem[]> {
    return this.http.get<TeamListItem[]>(`${this.baseUrl}/${id}/teams`);
  }

  getEmployees(id: number): Observable<DepartmentEmployeeItem[]> {
    return this.http.get<DepartmentEmployeeItem[]>(`${this.baseUrl}/${id}/employees`);
  }
}
