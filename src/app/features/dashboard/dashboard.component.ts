import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardViewModel } from '../../core/models/dashboard.models';
import { RecommendationCardResponse } from '../../core/models/recommendation.models';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RecommendationCardComponent } from '../../shared/components/recommendation-card/recommendation-card.component';
import { ConfirmationModalService } from '../../core/services/confirmation-modal.service';

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmationModalService);

  vm = signal<DashboardViewModel | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  highestMatch = computed(() => {
    const run = this.vm()?.latestRecommendationRun;
    if (!run || !run.items || run.items.length === 0) return null;
    return run.items.reduce((max, item) => item.similarityScore > max.similarityScore ? item : max, run.items[0]);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardView().subscribe({
      next: (data) => {
        this.vm.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load career dashboard view model', err);
        this.error.set('Failed to load career dashboard. Please try again.');
        this.loading.set(false);
      }
    });
  }

  startGeneration(): void {
    this.confirmService.confirm({
      title: 'Generate AI Recommendations',
      message: `Would you like to analyze your active resume to generate matches?`,
      confirmText: 'Yes, proceed',
      cancelText: 'Cancel'
    }).then((confirmed) => {
      if (confirmed) {
        this.loading.set(true);
        this.dashboardService.regenerateRecommendations().subscribe({
          next: () => {
            this.toastService.showSuccess('AI Recommendations generated successfully!');
            this.loadData();
          },
          error: (err) => {
            console.error('Failed to generate recommendations', err);
            this.toastService.showError('Failed to generate recommendations');
            this.loading.set(false);
          }
        });
      }
    });
  }

  saveJob(jobId: number): void {
    if (this.authService.isSaved(jobId)) {
      this.toastService.showInfo('You have already saved this job');
      return;
    }
    const rec = this.vm()?.latestRecommendationRun?.items?.find(r => r.jobId === jobId);
    const title = rec ? rec.title : 'Job';
    this.authService.saveJob(jobId).subscribe({
      next: () => {
        this.toastService.showSuccess(`Saved "${title}" to bookmarks`);
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to save job', err);
      }
    });
  }

  applyJob(jobId: number): void {
    const rec = this.vm()?.latestRecommendationRun?.items?.find(r => r.jobId === jobId);
    if (rec && rec.applyUrl) {
      window.open(rec.applyUrl, '_blank', 'noopener,noreferrer');
      this.dashboardService.createApplication(jobId).subscribe({
        next: () => {
          this.toastService.showSuccess(`Application for "${rec.title}" is being tracked`);
          this.loadData();
        },
        error: (err) => {
          console.error('Failed to track application', err);
        }
      });
    }
  }

  retryResumeProcessing(): void {
    this.loading.set(true);
    this.dashboardService.reprocessResume().subscribe({
      next: () => {
        this.toastService.showSuccess('Resume AI processing triggered! Reloading in 3 seconds...');
        setTimeout(() => this.loadData(), 3000);
      },
      error: (err) => {
        console.error('Failed to reprocess resume', err);
        this.toastService.showError('Failed to trigger resume reprocessing. Please try again.');
        this.loading.set(false);
      }
    });
  }

  viewJobDetails(jobId: number): void {
    this.router.navigate(['/recommendations', jobId]);
  }
}
