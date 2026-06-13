import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardEngineStatus, DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/dashboard';

  getSummary(recentLimit = 5): Observable<DashboardSummary> {
    const params = new HttpParams().set('recentLimit', recentLimit);
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`, { params });
  }

  getEngineStatus(): Observable<DashboardEngineStatus> {
    return this.http.get<DashboardEngineStatus>(`${this.baseUrl}/engine-status`);
  }
}
