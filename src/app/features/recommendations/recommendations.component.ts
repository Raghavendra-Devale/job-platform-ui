import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { RecommendationService } from '../../core/services/recommendation.service';
import { RecommendationCardResponse } from '../../core/models/recommendation.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RecommendationCardComponent } from '../../shared/components/recommendation-card/recommendation-card.component';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    LoadingComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ChipComponent,
    BadgeComponent,
    RecommendationCardComponent
  ],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
})
export class RecommendationsComponent implements OnInit {
  private readonly recService = inject(RecommendationService);
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  recommendations = signal<RecommendationCardResponse[]>([]);
  state = signal<'initial' | 'loading' | 'success' | 'error'>('initial');
  loadingProgress = signal<string>('Analyzing resume...');

  ngOnInit(): void {
    // Check if recommendations already exist to bypass initial state
    this.recService.getRecommendations().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.recommendations.set(data);
          this.state.set('success');
        } else {
          this.state.set('initial');
        }
      },
      error: () => {
        this.state.set('initial');
      }
    });
  }

  startGeneration(): void {
    this.state.set('loading');
    this.loadingProgress.set('Analyzing resume...');

    // Progressive loading sub-states
    const subStates = [
      { text: 'Searching similar jobs...', delay: 1000 },
      { text: 'Ranking matches...', delay: 2200 },
      { text: 'Preparing explanations...', delay: 3400 }
    ];

    const timeouts: any[] = [];
    subStates.forEach(sub => {
      const t = setTimeout(() => {
        if (this.state() === 'loading') {
          this.loadingProgress.set(sub.text);
        }
      }, sub.delay);
      timeouts.push(t);
    });

    this.recService.getRecommendations().subscribe({
      next: (data) => {
        // Ensure minimum duration for user-friendly AI analysis feeling
        setTimeout(() => {
          this.recommendations.set(data);
          this.state.set(data.length > 0 ? 'success' : 'initial');
          this.toastService.showSuccess('Job recommendations generated successfully!');
        }, 4600);
      },
      error: (err) => {
        timeouts.forEach(clearTimeout);
        this.state.set('error');
        this.toastService.showError('Unable to generate recommendations. Please try again.');
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

  saveJob(jobId: number): void {
    if (this.authService.isSaved(jobId)) {
      this.toastService.showInfo('You have already saved this job');
      return;
    }
    const rec = this.recommendations().find(r => r.jobId === jobId);
    const title = rec ? rec.title : 'Job';
    this.authService.saveJob(jobId).subscribe({
      next: () => {
        this.toastService.showSuccess(`Saved "${title}" to bookmarks`);
      },
      error: (err) => {
        this.toastService.showError('Failed to save job');
        console.error('Failed to save job', err);
      }
    });
  }

  applyJob(jobId: number): void {
    const rec = this.recommendations().find(r => r.jobId === jobId);
    if (rec && rec.applyUrl) {
      window.open(rec.applyUrl, '_blank', 'noopener,noreferrer');
      this.dashboardService.createApplication(jobId).subscribe({
        next: () => {
          this.toastService.showSuccess(`Application for "${rec.title}" is being tracked`);
        },
        error: (err) => {
          console.error('Failed to track application', err);
        }
      });
    }
  }

  viewJobDetails(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }
}
