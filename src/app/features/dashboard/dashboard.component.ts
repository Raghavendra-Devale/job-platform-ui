import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary, JobApplication } from '../../core/models/dashboard.models';
import { JobListResponse } from '../../core/models/job.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-titles">
          <h1 class="welcome-title">Welcome back, {{ authService.currentUser()?.name || 'User' }}!</h1>
          <p class="welcome-subtitle">Here's an overview of your career search and active resume pipeline.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-wrapper" *ngIf="loadingSummary() && loadingApps()">
        <span class="spinner spinner-large"></span>
        <p>Loading your dashboard details...</p>
      </div>

      <ng-container *ngIf="!loadingSummary() || !loadingApps()">
        <!-- Stats Cards Grid -->
        <div class="stats-grid">
          <!-- Active Resume Card -->
          <div class="stat-card stat-resume">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Active Resume</span>
              <span class="stat-value text-truncate" [title]="summary()?.activeResumeName || 'None'">
                {{ summary()?.activeResumeName || 'No active resume' }}
              </span>
              <span class="stat-desc">Primary application file</span>
            </div>
          </div>

          <!-- Total Resumes Card -->
          <div class="stat-card stat-total-resumes">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                <path d="M9 17h6M9 12h6M9 7h4"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Resumes</span>
              <span class="stat-value">{{ summary()?.totalResumesCount || 0 }} / 4</span>
              <span class="stat-desc">Manage in Resumes tab</span>
            </div>
          </div>

          <!-- Saved Jobs Card -->
          <div class="stat-card stat-saved-jobs">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Saved Jobs</span>
              <span class="stat-value">{{ summary()?.savedJobsCount || 0 }}</span>
              <span class="stat-desc">Bookmarked openings</span>
            </div>
          </div>

          <!-- Applications Card -->
          <div class="stat-card stat-apps">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Applications</span>
              <span class="stat-value">{{ summary()?.applicationsCount || 0 }}</span>
              <span class="stat-desc">Total job application tracks</span>
            </div>
          </div>

          <!-- Interviews Card -->
          <div class="stat-card stat-interviews">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Interviews</span>
              <span class="stat-value">{{ summary()?.interviewsCount || 0 }}</span>
              <span class="stat-desc">Active interview loops</span>
            </div>
          </div>

          <!-- Offers Card -->
          <div class="stat-card stat-offers">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Offers</span>
              <span class="stat-value">{{ summary()?.offersCount || 0 }}</span>
              <span class="stat-desc">Offer letters received</span>
            </div>
          </div>
        </div>

        <div class="main-dashboard-grid">
          <!-- Column 1: Job Applications Tracker -->
          <div class="card applications-tracker-card">
            <h2 class="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Application Status Tracker
            </h2>
            <p class="card-subtitle">Keep tabs on where you stand for each role you've applied to.</p>

            <div class="applications-list" *ngIf="applications().length > 0; else noApps">
              <div class="application-item-card" *ngFor="let app of applications()">
                <div class="app-item-main">
                  <div>
                    <h3 class="app-job-title" [routerLink]="['/jobs', app.jobId]">{{ app.jobTitle }}</h3>
                    <p class="app-job-meta">{{ app.company }} • {{ app.location }}</p>
                    <div style="display: flex; gap: var(--space-2); align-items: center; margin-top: var(--space-1); flex-wrap: wrap;">
                      <span class="app-date">Applied {{ formatDate(app.appliedAt) }}</span>
                      <span class="badge badge-slate" *ngIf="app.resumeName" style="font-size: 10px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-3);">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {{ app.resumeName }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span [class]="'badge ' + getStatusClass(app.status)">{{ app.status }}</span>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="app-actions">
                  <span class="actions-label">Change Status:</span>
                  <div class="actions-buttons-group">
                    <button class="btn btn-xs btn-outline" *ngIf="app.status !== 'APPLIED'" (click)="updateStatus(app.id, 'APPLIED')">Applied</button>
                    <button class="btn btn-xs btn-outline" *ngIf="app.status !== 'INTERVIEW'" (click)="updateStatus(app.id, 'INTERVIEW')">Interview</button>
                    <button class="btn btn-xs btn-outline" *ngIf="app.status !== 'OFFER'" (click)="updateStatus(app.id, 'OFFER')">Offer</button>
                    <button class="btn btn-xs btn-outline" *ngIf="app.status !== 'REJECTED'" (click)="updateStatus(app.id, 'REJECTED')">Reject</button>
                    <button class="btn btn-xs btn-danger-outline" (click)="deleteApp(app.id)" title="Remove Application">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noApps>
              <div class="empty-state">
                <div class="empty-icon-circle">🚀</div>
                <h3>No Applications Tracked Yet</h3>
                <p>When you browse openings and click "Apply Now", they'll show up here automatically to help you manage your pipeline.</p>
                <a routerLink="/jobs" class="btn btn-primary">Browse Openings</a>
              </div>
            </ng-template>
          </div>

          <!-- Column 2: Recent Activity, Saved Jobs & Viewed Jobs Group -->
          <div class="column-right-group">
            <!-- Recent Activity Card -->
            <div class="card recent-activity-card">
              <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="12 6 12 12 16 14"/><circle cx="12" cy="12" r="10"/>
                </svg>
                Recent Activity
              </h2>
              <p class="card-subtitle">Chronological history of your job search actions.</p>

              <div class="timeline" *ngIf="summary()?.recentActivities && summary()!.recentActivities.length > 0; else noActivities">
                <div class="timeline-item" *ngFor="let act of summary()?.recentActivities">
                  <div class="timeline-marker" [class]="getActivityClass(act.activityType)">
                    {{ getActivityIcon(act.activityType) }}
                  </div>
                  <div class="timeline-content">
                    <p class="activity-desc">{{ act.description }}</p>
                    <span class="activity-time">{{ formatDate(act.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <ng-template #noActivities>
                <div class="empty-state">
                  <div class="empty-icon-circle">🔔</div>
                  <h3>No Activity Logged</h3>
                  <p>Your uploads, resume activations, and applications will create activity events here.</p>
                </div>
              </ng-template>
            </div>

            <!-- Recently Saved Jobs Card -->
            <div class="card recent-jobs-widget-card">
              <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Recently Saved Jobs
              </h2>
              <p class="card-subtitle">Your bookmarked positions for quick reference.</p>
              
              <div class="widget-list" *ngIf="savedJobs().length > 0; else noSaved">
                <div class="widget-item" *ngFor="let job of savedJobs()">
                  <div class="widget-item-info">
                    <h4 class="widget-item-title" [routerLink]="['/jobs', job.id]">{{ job.title }}</h4>
                    <p class="widget-item-meta">{{ job.company }} • {{ job.location }}</p>
                  </div>
                  <button class="btn btn-xs btn-danger-outline btn-icon-only" (click)="unsaveJob(job.id)" title="Unsave Job">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <ng-template #noSaved>
                <p class="empty-widget-text">No saved jobs yet.</p>
              </ng-template>
            </div>

            <!-- Recently Viewed Jobs Card -->
            <div class="card recent-jobs-widget-card">
              <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Recently Viewed Jobs
              </h2>
              <p class="card-subtitle">The openings you explored recently.</p>
              
              <div class="widget-list" *ngIf="recentJobs().length > 0; else noViewed">
                <div class="widget-item" *ngFor="let job of recentJobs()">
                  <div class="widget-item-info">
                    <h4 class="widget-item-title" [routerLink]="['/jobs', job.id]">{{ job.title }}</h4>
                    <p class="widget-item-meta">{{ job.company }} • {{ job.location }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noViewed>
                <p class="empty-widget-text">No recently viewed jobs.</p>
              </ng-template>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-1);
    }

    .welcome-subtitle {
      color: var(--color-text-3);
      font-size: var(--text-sm);
    }

    /* Loading state */
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) 0;
      color: var(--color-text-3);
      gap: var(--space-4);
    }

    .spinner-large {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-4);
    }

    .stat-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: var(--space-5);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      box-shadow: 0 1px 3px rgba(0,0,0,.02);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0,0,0,.05);
    }

    .stat-icon-wrapper {
      padding: var(--space-2);
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-text);
      margin: var(--space-1) 0;
      line-height: 1.2;
    }

    .stat-desc {
      font-size: var(--text-xs);
      color: var(--color-text-3);
    }

    /* Icon details */
    .stat-resume .stat-icon-wrapper { background: #e0f2fe; color: #0284c7; }
    .stat-total-resumes .stat-icon-wrapper { background: #e0e7ff; color: #4f46e5; }
    .stat-saved-jobs .stat-icon-wrapper { background: #fef3c7; color: #d97706; }
    .stat-apps .stat-icon-wrapper { background: #f3e8ff; color: #9333ea; }
    .stat-interviews .stat-icon-wrapper { background: #ccfbf1; color: #0d9488; }
    .stat-offers .stat-icon-wrapper { background: #dcfce7; color: #16a34a; }

    /* Main Dashboard Grid */
    .main-dashboard-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    @media (max-width: 900px) {
      .main-dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: var(--space-6);
      box-shadow: 0 1px 3px rgba(0,0,0,.02);
    }

    .card-title {
      font-size: var(--text-md);
      font-weight: 600;
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .card-subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-3);
      margin-bottom: var(--space-6);
    }

    /* Applications Tracker List */
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .application-item-card {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: var(--space-4);
      background: var(--color-surface);
      transition: border-color 0.2s;
    }

    .application-item-card:hover {
      border-color: var(--color-primary-muted);
    }

    .app-item-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }

    .app-job-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
      margin-bottom: var(--space-1);
    }

    .app-job-title:hover {
      text-decoration: underline;
    }

    .app-job-meta {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      margin-bottom: var(--space-1);
    }

    .app-date {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      display: block;
    }

    .app-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .actions-label {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      font-weight: 500;
    }

    .actions-buttons-group {
      display: flex;
      gap: var(--space-1);
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      font-size: var(--text-xs);
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-applied { background: #e0f2fe; color: #0369a1; }
    .badge-interview { background: #ccfbf1; color: #0f766e; }
    .badge-offer { background: #dcfce7; color: #15803d; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }
    .badge-default { background: #f3f4f6; color: #4b5563; }

    /* Buttons */
    .btn-xs {
      padding: var(--space-1) var(--space-2);
      font-size: 10px;
    }

    .btn-danger-outline {
      border: 1px solid #fecaca;
      background: transparent;
      color: #dc2626;
      border-radius: var(--border-radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: var(--space-1) var(--space-2);
      transition: background 0.2s, border-color 0.2s;
    }

    .btn-danger-outline:hover {
      background: #fee2e2;
      border-color: #f87171;
    }

    /* Empty states */
    .empty-state {
      text-align: center;
      padding: var(--space-10) var(--space-6);
      color: var(--color-text-3);
    }

    .empty-icon-circle {
      width: 48px;
      height: 48px;
      background: var(--color-surface-2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-lg);
      margin-bottom: var(--space-4);
    }

    .empty-state h3 {
      font-size: var(--text-md);
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: var(--space-1);
    }

    .empty-state p {
      font-size: var(--text-sm);
      margin-bottom: var(--space-5);
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Timeline */
    .timeline {
      position: relative;
      border-left: 2px solid var(--color-border);
      padding-left: var(--space-6);
      margin-left: 14px;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .timeline-item {
      position: relative;
    }

    .timeline-marker {
      position: absolute;
      left: -37px;
      top: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-sm);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* Markers */
    .activity-resume { border-color: #0284c7; background: #e0f2fe; }
    .activity-active { border-color: #4f46e5; background: #e0e7ff; }
    .activity-saved { border-color: #d97706; background: #fef3c7; }
    .activity-apply { border-color: #9333ea; background: #f3e8ff; }
    .activity-update { border-color: #0d9488; background: #ccfbf1; }

    .timeline-content {
      min-height: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .activity-desc {
      font-size: var(--text-sm);
      color: var(--color-text);
      margin: 0;
      line-height: 1.4;
    }

    .activity-time {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      margin-top: 2px;
    }

    /* Widgets Styles */
    .column-right-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .recent-jobs-widget-card {
      padding: var(--space-5) var(--space-6);
    }

    .widget-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .widget-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      transition: border-color 0.2s;
    }

    .widget-item:hover {
      border-color: var(--color-primary-muted);
    }

    .widget-item-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .widget-item-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .widget-item-title:hover {
      text-decoration: underline;
    }

    .widget-item-meta {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-icon-only {
      padding: var(--space-1);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: var(--border-radius-sm);
    }

    .empty-widget-text {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      text-align: center;
      padding: var(--space-4) 0;
      margin: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  applications = signal<JobApplication[]>([]);
  loadingSummary = signal(true);
  loadingApps = signal(true);

  recentJobs = signal<JobListResponse[]>([]);
  savedJobs  = signal<JobListResponse[]>([]);

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
      },
      error: () => console.error('Failed to unsave job')
    });
  }

  updateStatus(appId: number, status: string): void {
    this.dashboardService.updateApplicationStatus(appId, status).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error('Failed to update application status', err)
    });
  }

  deleteApp(appId: number): void {
    if (confirm('Are you sure you want to remove this job application tracker?')) {
      this.dashboardService.deleteApplication(appId).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => console.error('Failed to delete application', err)
      });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'RESUME_UPLOADED': return '📄';
      case 'RESUME_ACTIVATED': return '⚡';
      case 'JOB_SAVED': return '⭐';
      case 'APPLICATION_SUBMITTED': return '🚀';
      case 'APPLICATION_UPDATED': return '⚙️';
      default: return '🔔';
    }
  }

  getActivityClass(type: string): string {
    switch (type) {
      case 'RESUME_UPLOADED': return 'activity-resume';
      case 'RESUME_ACTIVATED': return 'activity-active';
      case 'JOB_SAVED': return 'activity-saved';
      case 'APPLICATION_SUBMITTED': return 'activity-apply';
      case 'APPLICATION_UPDATED': return 'activity-update';
      default: return 'activity-default';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPLIED': return 'badge-applied';
      case 'INTERVIEW': return 'badge-interview';
      case 'OFFER': return 'badge-offer';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-default';
    }
  }
}
