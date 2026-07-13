import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, JobApplication } from '../models/dashboard.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`);
  }

  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${environment.apiUrl}/dashboard/applications`);
  }

  createApplication(jobId: number): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${environment.apiUrl}/dashboard/applications`, { jobId });
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/dashboard/applications/${id}/status`, { status });
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/dashboard/applications/${id}`);
  }
}
