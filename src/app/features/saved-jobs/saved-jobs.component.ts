import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobListResponse } from '../../core/models/job.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonCardComponent],
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.css'],
})
export class SavedJobsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);

  jobs    = signal<JobListResponse[]>([]);
  loading = computed(() => this.loadingService.isLoading() && this.jobs().length === 0);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.authService.getSavedJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
      },
      error: (err) => {
        console.error('Failed to load saved jobs', err);
        this.error.set('Failed to retrieve bookmarked jobs. Service is currently unavailable.');
      }
    });
  }

  unsaveJob(jobId: number): void {
    this.authService.unsaveJob(jobId).subscribe({
      next: () => {
        this.jobs.set(this.jobs().filter(j => j.id !== jobId));
        this.toastService.showSuccess('Job removed from bookmarks');
      },
      error: (err) => {
        console.error('Failed to unsave job', err);
      }
    });
  }

  applyToJob(job: JobListResponse): void {
    if (!job.applyUrl) return;
    window.open(job.applyUrl, '_blank');
    this.dashboardService.createApplication(job.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`Application for "${job.title}" is being tracked`);
      },
      error: (err) => console.error('Failed to create application track', err)
    });
  }

  getSourceClass(source: string): string {
    const s = (source || '').toLowerCase();
    if (s.includes('remoteok'))  return 'badge badge-purple';
    if (s.includes('arbeitnow')) return 'badge badge-teal';
    return 'badge badge-slate';
  }

  getRemoteLabel(remote: boolean | null): string {
    if (remote === true)  return 'Remote';
    if (remote === false) return 'On-site';
    return 'Hybrid';
  }

  getRemoteClass(remote: boolean | null): string {
    if (remote === true)  return 'badge badge-green';
    if (remote === false) return 'badge badge-amber';
    return 'badge badge-blue';
  }

  getTags(tags: string | null): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
  }

  timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now  = new Date();
    const secs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (secs < 60)          return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)          return `${mins}m ago`;
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24)          return `${hrs}h ago`;
    const days = Math.floor(hrs  / 24);
    if (days < 7)           return `${days}d ago`;
    const wks  = Math.floor(days / 7);
    return `${wks}w ago`;
  }
}
