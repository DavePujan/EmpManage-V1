import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateEmployeeRequest,
  EmployeeCountResponse,
  EmployeeFilter,
  EmployeeListItem,
  EmployeePagedResult,
  EmployeeSubordinate,
  EmployeeSupervisor,
  UpdateEmployeeDepartmentRequest,
  UpdateEmployeeDesignationRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeStatusRequest,
  UpdateEmployeeSupervisorRequest,
  UpdateEmployeeTeamRequest,
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

  search(filter: EmployeeFilter): Observable<EmployeePagedResult> {
    return this.http.post<EmployeePagedResult>(`${this.baseUrl}/search`, filter);
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

  updateDepartment(id: number, departmentId: number | null): Observable<string> {
    const body: UpdateEmployeeDepartmentRequest = { departmentId };
    return this.http.put(`${this.baseUrl}/${id}/department`, body, { responseType: 'text' });
  }

  updateTeam(id: number, teamId: number | null): Observable<string> {
    const body: UpdateEmployeeTeamRequest = { teamId };
    return this.http.put(`${this.baseUrl}/${id}/team`, body, { responseType: 'text' });
  }

  updateSupervisor(id: number, supervisorId: number | null): Observable<string> {
    const body: UpdateEmployeeSupervisorRequest = { supervisorId };
    return this.http.put(`${this.baseUrl}/${id}/supervisor`, body, { responseType: 'text' });
  }

  updateDesignation(id: number, designationId: number): Observable<string> {
    const body: UpdateEmployeeDesignationRequest = { designationId };
    return this.http.put(`${this.baseUrl}/${id}/designation`, body, { responseType: 'text' });
  }

  getSubordinates(id: number): Observable<EmployeeSubordinate[]> {
    return this.http.get<EmployeeSubordinate[]>(`${this.baseUrl}/${id}/subordinates`);
  }

  getSupervisor(id: number): Observable<EmployeeSupervisor> {
    return this.http.get<EmployeeSupervisor>(`${this.baseUrl}/${id}/supervisor`);
  }
}
