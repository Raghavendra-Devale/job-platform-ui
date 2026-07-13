import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecommendationService } from '../../core/services/recommendation.service';
import { JobRecommendation } from '../../core/models/recommendation.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { RecommendationCardComponent } from '../../shared/components/recommendation-card/recommendation-card.component';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonCardComponent, RecommendationCardComponent],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
})
export class RecommendationsComponent implements OnInit {
  private readonly recService = inject(RecommendationService);
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);

  recommendations = signal<JobRecommendation[]>([]);
  loading         = computed(() => this.loadingService.isLoading() && this.recommendations().length === 0);
  error           = signal<string | null>(null);

  private readonly CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

  ngOnInit(): void {
    this.refreshRecommendations();
  }

  refreshRecommendations(): void {
    this.error.set(null);
    this.recService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendations.set(data);
      },
      error: (err: any) => {
        if (err && err.status === 404) {
          this.error.set('No active resume found. Please upload a resume first to receive personalized recommendations.');
        } else {
          this.error.set('Failed to load recommendations. Please try again later.');
        }
      }
    });
  }

  getCircumference(): number {
    return this.CIRCUMFERENCE;
  }

  /** Stroke-dashoffset so the ring fills proportionally to the match score */
  getDashOffset(score: number): number {
    return this.CIRCUMFERENCE * (1 - score / 100);
  }

  /** CSS class for score ring colour */
  getScoreClass(score: number): string {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }

  saveJob(rec: JobRecommendation): void {
    if (this.authService.isSaved(rec.id)) {
      this.toastService.showInfo('You have already saved this job');
      return;
    }
    this.authService.saveJob(rec.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`Saved "${rec.jobTitle}" to bookmarks`);
      },
      error: (err) => {
        console.error('Failed to save job from recommendations', err);
      }
    });
  }

  trackApplication(rec: JobRecommendation): void {
    if (this.authService.isAuthenticated()) {
      this.dashboardService.createApplication(rec.id).subscribe({
        next: () => {
          this.toastService.showSuccess(`Application for "${rec.jobTitle}" is being tracked`);
        },
        error: (err) => {
          console.error('Failed to track application from recommendations', err);
        }
      });
    }
  }
}
