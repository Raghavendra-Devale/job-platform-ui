import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary, JobApplication } from '../../core/models/dashboard.models';
import { JobListResponse } from '../../core/models/job.models';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { RecommendationService } from '../../core/services/recommendation.service';
import { JobRecommendation } from '../../core/models/recommendation.models';
import { RecommendationCardComponent } from '../../shared/components/recommendation-card/recommendation-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonCardComponent, RecommendationCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly recService = inject(RecommendationService);

  summary = signal<DashboardSummary | null>(null);
  applications = signal<JobApplication[]>([]);
  loadingSummary = signal(true);
  loadingApps = signal(true);

  recentJobs = signal<JobListResponse[]>([]);
  savedJobs  = signal<JobListResponse[]>([]);

  recommendations = signal<JobRecommendation[]>([]);
  loadingRecs = signal(false);
  recError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingSummary.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loadingSummary.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard summary', err);
        this.loadingSummary.set(false);
      }
    });

    this.loadingApps.set(true);
    this.dashboardService.getApplications().subscribe({
      next: (data) => {
        this.applications.set(data);
        this.loadingApps.set(false);
      },
      error: (err) => {
        console.error('Failed to load job applications', err);
        this.loadingApps.set(false);
      }
    });

    this.authService.getRecentJobs().subscribe({
      next: (jobs) => this.recentJobs.set(jobs.slice(0, 5)),
      error: () => console.error('Failed to load recent views')
    });

    this.authService.getSavedJobs().subscribe({
      next: (jobs) => this.savedJobs.set(jobs.slice(0, 5)),
      error: () => console.error('Failed to load saved jobs')
    });
  }

  unsaveJob(jobId: number): void {
    this.authService.unsaveJob(jobId).subscribe({
      next: () => {
        this.savedJobs.set(this.savedJobs().filter(j => j.id !== jobId));
        this.loadData();
        this.toastService.showSuccess('Job removed from bookmarks');
      },
      error: () => console.error('Failed to unsave job')
    });
  }

  updateStatus(appId: number, status: string): void {
    this.dashboardService.updateApplicationStatus(appId, status).subscribe({
      next: () => {
        this.applications.update(apps =>
          apps.map(a => a.id === appId
            ? { ...a, status: status as JobApplication['status'], updatedAt: new Date().toISOString() }
            : a)
        );
        this.toastService.showSuccess(`Application status updated to "${status}"`);
        this.loadData(); // refresh counts
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPLIED':
        return 'badge-blue';
      case 'SCREENING':
        return 'badge-amber';
      case 'INTERVIEW':
        return 'badge-purple';
      case 'OFFER':
        return 'badge-green';
      case 'REJECTED':
        return 'badge-red';
      default:
        return 'badge-slate';
    }
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAIRecommendations(): void {
    this.loadingRecs.set(true);
    this.recError.set(null);
    this.recService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendations.set(data);
        this.loadingRecs.set(false);
        this.toastService.showSuccess('AI Recommendations generated successfully!');
      },
      error: (err) => {
        console.error('Failed to generate recommendations', err);
        const errMsg = err.error?.error || 'Failed to generate recommendations. Please try again.';
        this.recError.set(errMsg);
        this.loadingRecs.set(false);
        this.toastService.showError('Failed to generate recommendations');
      }
    });
  }

  saveJob(rec: JobRecommendation): void {
    if (this.authService.isSaved(rec.id)) {
      this.toastService.showInfo('You have already saved this job');
      return;
    }
    this.authService.saveJob(rec.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`Saved "${rec.jobTitle}" to bookmarks`);
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to save job from recommendations', err);
      }
    });
  }
}
