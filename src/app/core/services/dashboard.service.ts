import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, JobApplication } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/api/dashboard/summary');
  }

  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>('/api/dashboard/applications');
  }

  createApplication(jobId: number): Observable<JobApplication> {
    return this.http.post<JobApplication>('/api/dashboard/applications', { jobId });
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`/api/dashboard/applications/${id}/status`, { status });
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete<any>(`/api/dashboard/applications/${id}`);
  }
}
