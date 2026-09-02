import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateTeamRequest,
  TeamCountResponse,
  TeamDetails,
  TeamEmployeeItem,
  TeamListItem
} from '../core/models/team.models';

@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Team`;

  create(dto: CreateTeamRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  getAll(): Observable<TeamListItem[]> {
    return this.http.get<TeamListItem[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<TeamDetails> {
    return this.http.get<TeamDetails>(`${this.baseUrl}/${id}`);
  }

  getEmployees(id: number): Observable<TeamEmployeeItem[]> {
    return this.http.get<TeamEmployeeItem[]>(`${this.baseUrl}/${id}/employees`);
  }

  getCount(): Observable<TeamCountResponse> {
    return this.http.get<TeamCountResponse>(`${this.baseUrl}/count`);
  }
}
