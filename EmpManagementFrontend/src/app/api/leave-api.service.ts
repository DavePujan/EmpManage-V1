import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateLeaveRequest, LeaveFilter, LeavePagedResult, LeaveResponse, RejectLeaveRequest } from '../core/models/leave.models';

@Injectable({
  providedIn: 'root'
})
export class LeaveApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Leave`;

  // Employee: Apply for leave
  apply(dto: CreateLeaveRequest): Observable<LeaveResponse> {
    return this.http.post<LeaveResponse>(`${this.baseUrl}`, dto);
  }

  // Employee: Get my leaves
  getMyLeaves(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/my`);
  }

  // Employee: Get leave by id
  getById(id: number): Observable<LeaveResponse> {
    return this.http.get<LeaveResponse>(`${this.baseUrl}/${id}`);
  }

  // Manager + HR + Admin: Get all leaves
  getAll(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/all`);
  }

  // Manager + HR + Admin: Search / Filter leaves
  search(filter: LeaveFilter): Observable<LeavePagedResult> {
    return this.http.post<LeavePagedResult>(`${this.baseUrl}/search`, filter);
  }

  // Manager + HR + Admin: Get pending leaves
  getPending(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/pending`);
  }

  // HR: Get team leaves
  getTeamLeaves(): Observable<LeaveResponse[]> {
    return this.http.get<LeaveResponse[]>(`${this.baseUrl}/team`);
  }

  // HR: Approve leave
  approve(id: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}/approve`, {}, { responseType: 'text' });
  }

  // HR: Reject leave
  reject(id: number, dto: RejectLeaveRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}/reject`, dto, { responseType: 'text' });
  }

  // Employee: Cancel leave
  cancel(id: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}/cancel`, {}, { responseType: 'text' });
  }
}
