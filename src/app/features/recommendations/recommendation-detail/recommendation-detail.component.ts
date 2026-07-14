import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { RecommendationDetailResponse } from '../../../core/models/recommendation.models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ChipComponent } from '../../../shared/components/chip/chip.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recommendation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    LoadingComponent,
    ErrorStateComponent,
    ChipComponent,
    BadgeComponent
  ],
  templateUrl: './recommendation-detail.component.html',
  styleUrls: ['./recommendation-detail.component.css']
})
export class RecommendationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly recService = inject(RecommendationService);
  private readonly toastService = inject(ToastService);
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  jobId: number | null = null;
  detail = signal<RecommendationDetailResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.jobId = +idParam;
      this.loadDetail();
    } else {
      this.error.set('No job ID specified.');
      this.loading.set(false);
    }
  }

  loadDetail(): void {
    if (this.jobId === null) return;
    this.loading.set(true);
    this.error.set(null);

    this.recService.getRecommendationDetail(this.jobId).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recommendation details', err);
        this.error.set('Failed to load recommendation details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getMatchPercent(score: number): number {
    return Math.round(score * 100);
  }

  getScoreColor(score: number): string {
    const percent = this.getMatchPercent(score);
    if (percent >= 85) return 'var(--color-success)';
    if (percent >= 70) return 'var(--color-primary)';
    if (percent >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  getScoreBgColor(score: number): string {
    const percent = this.getMatchPercent(score);
    if (percent >= 85) return 'var(--color-success-light)';
    if (percent >= 70) return 'var(--color-primary-light)';
    if (percent >= 50) return 'var(--color-warning-light)';
    return 'var(--color-error-light)';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  saveJob(): void {
    if (this.jobId === null || !this.detail()) return;
    if (this.authService.isSaved(this.jobId)) {
      this.toastService.showInfo('You have already saved this job');
      return;
    }
    this.authService.saveJob(this.jobId).subscribe({
      next: () => {
        this.toastService.showSuccess(`Saved "${this.detail()?.title}" to bookmarks`);
      },
      error: (err) => {
        this.toastService.showError('Failed to save job');
        console.error('Failed to save job', err);
      }
    });
  }

  applyJob(): void {
    const details = this.detail();
    if (this.jobId === null || !details) return;
    if (details.applyUrl) {
      window.open(details.applyUrl, '_blank', 'noopener,noreferrer');
      this.dashboardService.createApplication(this.jobId).subscribe({
        next: () => {
          this.toastService.showSuccess(`Application for "${details.title}" is being tracked`);
        },
        error: (err) => {
          console.error('Failed to track application', err);
        }
      });
    }
  }
}
