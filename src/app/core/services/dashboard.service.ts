import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardSummary, JobApplication, ResumeIntelligence, DashboardViewModel, RecommendationSummary, CareerInsight, RecommendationRun } from '../models/dashboard.models';
import { RecommendationService } from './recommendation.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly recService = inject(RecommendationService);

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

  getDashboardView(): Observable<DashboardViewModel> {
    return this.http.get<DashboardViewModel>(`${environment.apiUrl}/dashboard`);
  }

  regenerateRecommendations(): Observable<RecommendationRun> {
    return this.http.post<RecommendationRun>(`${environment.apiUrl}/recommendations/regenerate`, {});
  }

  reprocessResume(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/profile/resumes/active/reprocess`, {});
  }
}
