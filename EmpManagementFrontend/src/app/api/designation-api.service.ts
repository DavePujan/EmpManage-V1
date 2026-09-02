import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateDesignationRequest } from '../core/models/designation.models';

@Injectable({
  providedIn: 'root'
})
export class DesignationApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Designation`;

  create(dto: CreateDesignationRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }
}
