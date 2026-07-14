import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardSummary, JobApplication, ResumeIntelligence, DashboardViewModel, RecommendationSummary, CareerInsight } from '../models/dashboard.models';
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
    const resumeIntelligence$ = this.http.get<ResumeIntelligence>(`${environment.apiUrl}/users/profile/resumes/active/intelligence`).pipe(
      catchError(() => of({ status: 'NOT_UPLOADED', skills: [] } as ResumeIntelligence))
    );

    const summary$ = this.getSummary().pipe(
      catchError(() => of({
        activeResumeName: null,
        totalResumesCount: 0,
        savedJobsCount: 0,
        applicationsCount: 0,
        interviewsCount: 0,
        offersCount: 0,
        recentActivities: []
      } as DashboardSummary))
    );

    const recommendations$ = this.recService.getRecommendations().pipe(
      catchError(() => of([]))
    );

    return forkJoin({
      resume: resumeIntelligence$,
      summary: summary$,
      recommendations: recommendations$
    }).pipe(
      map(({ resume, summary, recommendations }) => {
        const hasActiveResume = resume.status === 'READY';

        // 1. Build RecommendationSummary
        let avgMatch = 0;
        let highestMatch = 0;
        if (recommendations.length > 0) {
          const scores = recommendations.map(r => Math.round(r.similarityScore * 100));
          avgMatch = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          highestMatch = Math.max(...scores);
        }

        const recSummary: RecommendationSummary = {
          latestRun: recommendations.length > 0 ? 'Today' : 'Not run yet',
          totalJobs: recommendations.length,
          averageMatch: avgMatch,
          highestMatch: highestMatch,
          newJobs: recommendations.length > 0 ? 6 : 0
        };

        // 2. Build Career Insights
        const careerInsights: CareerInsight[] = [];
        if (recommendations.length > 0) {
          // Strongest skill: most frequent matching skill
          const matchSkillsCount: { [key: string]: number } = {};
          recommendations.forEach(r => {
            r.matchingSkills?.forEach(s => {
              matchSkillsCount[s] = (matchSkillsCount[s] || 0) + 1;
            });
          });
          const strongestSkill = Object.keys(matchSkillsCount).reduce((a, b) => matchSkillsCount[a] > matchSkillsCount[b] ? a : b, 'Spring Boot');

          // Most requested missing skill
          const missingSkillsCount: { [key: string]: number } = {};
          recommendations.forEach(r => {
            r.missingSkills?.forEach(s => {
              missingSkillsCount[s] = (missingSkillsCount[s] || 0) + 1;
            });
          });
          const mostRequestedMissing = Object.keys(missingSkillsCount).reduce((a, b) => missingSkillsCount[a] > missingSkillsCount[b] ? a : b, 'AWS');

          careerInsights.push({ label: 'Your strongest skill', value: strongestSkill });
          careerInsights.push({ label: 'Most requested missing skill', value: mostRequestedMissing });
          careerInsights.push({ label: 'Your average match score', value: `${avgMatch}%` });
          careerInsights.push({ label: 'Recommended next step', value: `Learn ${mostRequestedMissing}` });
        } else {
          careerInsights.push({ label: 'Your strongest skill', value: 'Upload resume to analyze' });
          careerInsights.push({ label: 'Recommended next step', value: 'Complete your profile' });
        }

        // 3. Application Summary Stats
        const applicationSummary = {
          saved: summary.savedJobsCount,
          applied: summary.applicationsCount,
          interview: summary.interviewsCount,
          offer: summary.offersCount
        };

        return {
          resume,
          recommendationSummary: recSummary,
          recentRecommendations: recommendations.slice(0, 5),
          careerInsights,
          applicationSummary,
          hasActiveResume
        };
      })
    );
  }
}
