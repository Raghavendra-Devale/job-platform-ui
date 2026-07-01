import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobListResponse } from '../../core/models/job.models';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container saved-container animate-fade-in-up">
      <div class="header-section">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Saved Bookmarks
        </h1>
        <p class="page-description">You have bookmarked {{ jobs().length }} job listings for review.</p>
      </div>

      <div class="loading-state text-center" *ngIf="loading()">
        <span class="spinner-large"></span> Loading bookmarks...
      </div>

      <div class="error-state alert-box" *ngIf="error()">
        {{ error() }}
      </div>

      <div class="saved-grid" *ngIf="!loading() && !error()">
        <div class="saved-list" *ngIf="jobs().length > 0; else emptyState">
          <!-- Job Item Card -->
          <div class="card job-card animate-fade-in stagger-{{ i % 5 + 1 }}" *ngFor="let job of jobs(); let i = index">
            <div class="job-card-inner">
              <div class="job-card-details">
                <div class="title-row">
                  <a [routerLink]="['/jobs', job.id]" class="job-title">{{ job.title }}</a>
                  <span [class]="getSourceClass(job.source)">{{ job.source }}</span>
                </div>
                <p class="company-name">{{ job.company }}</p>
                <div class="meta-row">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ job.location }}
                  </span>
                  <span [class]="getRemoteClass(job.remote)">
                    {{ getRemoteLabel(job.remote) }}
                  </span>
                  <span class="meta-item ml-auto" *ngIf="job.createdAt">
                    {{ timeAgo(job.createdAt) }}
                  </span>
                </div>
                <!-- Tags -->
                <div class="tags-row" *ngIf="getTags(job.tags).length > 0">
                  <span class="badge badge-slate" *ngFor="let tag of getTags(job.tags)">{{ tag }}</span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="job-card-actions">
                <a [routerLink]="['/jobs', job.id]" class="btn btn-outline btn-sm">View details</a>
                <button class="btn btn-primary btn-sm" *ngIf="job.applyUrl" (click)="applyToJob(job)">Apply Now</button>
                <button class="btn btn-danger btn-ghost btn-sm btn-icon" (click)="unsaveJob(job.id)" title="Remove Bookmark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="card empty-card text-center">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>No saved jobs</h2>
            <p>You haven't bookmarked any jobs yet. When browsing jobs, click the bookmark icon to save them for later.</p>
            <a routerLink="/jobs" class="btn btn-primary mt-4">Browse Jobs Now</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .saved-container {
      max-width: 800px;
      margin: var(--space-8) auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding: 0 var(--space-4);
    }

    .header-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: 800;
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .page-description {
      font-size: var(--text-sm);
      color: var(--color-text-2);
    }

    .saved-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .job-card {
      padding: var(--space-5);
    }

    .job-card-inner {
      display: flex;
      justify-content: space-between;
      gap: var(--space-6);
    }

    @media (max-width: 640px) {
      .job-card-inner {
        flex-direction: column;
      }
    }

    .job-card-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      flex: 1;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .job-title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
    }
    .job-title:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }

    .company-name {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-primary);
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      font-size: var(--text-xs);
      color: var(--color-text-2);
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      margin-top: var(--space-1);
    }

    .job-card-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .job-card-actions {
        justify-content: flex-end;
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-3);
        margin-top: var(--space-1);
      }
    }

    .btn-icon {
      padding: var(--space-2);
      border-radius: var(--radius-full);
      color: var(--color-danger);
      background: var(--color-danger-light);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon:hover {
      background: #fecaca;
    }

    .empty-card {
      padding: var(--space-12) var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .empty-icon {
      width: 72px; height: 72px;
      border-radius: var(--radius-full);
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex; align-items: center; justify-content: center;
    }

    .empty-card h2 {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
    }

    .empty-card p {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      max-width: 440px;
    }

    .alert-box {
      padding: var(--space-4);
      background: var(--color-danger-light);
      border-radius: var(--radius);
      color: var(--color-danger);
      font-size: var(--text-sm);
    }

    /* Badges mapping */
    .badge-purple { background: #ede9fe; color: #7c3aed; }
    .badge-teal { background: #ccfbf1; color: #0f766e; }
    .badge-slate { background: var(--color-surface-2); color: var(--color-text-2); }
    .badge-green  { background: var(--color-success-light); color: var(--color-success); }
    .badge-amber  { background: var(--color-warning-light); color: var(--color-warning); }
    .badge-blue   { background: var(--color-primary-muted); color: var(--color-primary); }

    /* Spinner animation */
    .spinner-large {
      display: inline-block;
      width: 28px; height: 28px;
      border: 3px solid var(--color-primary-muted);
      border-top-color: var(--color-primary);
      border-radius: 999px;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .text-center { text-align: center; }
    .mt-4 { margin-top: var(--space-4); }
    .ml-auto { margin-left: auto; }
  `],
})
export class SavedJobsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  jobs    = signal<JobListResponse[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.authService.getSavedJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load saved jobs', err);
        this.error.set('Failed to retrieve bookmarked jobs. Service is currently unavailable.');
        this.loading.set(false);
      }
    });
  }

  unsaveJob(jobId: number): void {
    this.authService.unsaveJob(jobId).subscribe({
      next: () => {
        this.jobs.set(this.jobs().filter(j => j.id !== jobId));
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
      next: () => console.log('Application tracked successfully'),
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
