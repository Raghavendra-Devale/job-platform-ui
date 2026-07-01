import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { JobApplication } from '../../core/models/dashboard.models';

type KanbanStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

interface KanbanColumn {
  id: KanbanStatus;
  label: string;
  icon: string;
  headerBg: string;
  headerColor: string;
  accentColor: string;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="applications-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <span class="title-icon">📋</span>
            Application Tracker
          </h1>
          <p class="page-subtitle">Drag cards between columns — or use the arrow buttons — to update status</p>
        </div>
        <div class="header-right">
          <div class="total-badge">
            <span class="total-count">{{ applications().length }}</span>
            <span class="total-label">Applications</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-wrapper" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Loading your pipeline...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state-full" *ngIf="!loading() && applications().length === 0">
        <div class="empty-icon">🚀</div>
        <h2>No Applications Yet</h2>
        <p>Start applying to jobs and track your pipeline here. When you click <strong>"Apply Now"</strong> on a job listing, it appears in this board automatically.</p>
        <a routerLink="/jobs" class="btn btn-primary">Browse Jobs</a>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board" *ngIf="!loading() && applications().length > 0">
        <div
          class="kanban-column"
          *ngFor="let col of columns"
          [id]="'col-' + col.id"
          (dragover)="onDragOver($event, col.id)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event, col.id)"
          [class.drag-over]="dragOverColumn() === col.id && draggingApp()?.status !== col.id"
        >
          <!-- Column Header -->
          <div class="col-header" [style.background]="col.headerBg" [style.color]="col.headerColor">
            <div class="col-header-left">
              <span class="col-icon">{{ col.icon }}</span>
              <span class="col-title">{{ col.label }}</span>
            </div>
            <span class="col-count" [style.background]="col.accentColor">
              {{ getColumnCount(col.id) }}
            </span>
          </div>

          <!-- Drop Zone Indicator -->
          <div class="drop-hint" [class.visible]="dragOverColumn() === col.id && draggingApp()?.status !== col.id">
            ↓ Drop here
          </div>

          <!-- Cards -->
          <div class="col-cards">
            <div
              class="kanban-card"
              *ngFor="let app of getColumnApps(col.id)"
              draggable="true"
              [class.dragging]="draggingApp()?.id === app.id"
              [class.updating]="updatingId() === app.id"
              (dragstart)="onDragStart($event, app)"
              (dragend)="onDragEnd()"
              [id]="'card-' + app.id"
            >
              <!-- Left accent bar -->
              <div class="card-accent" [style.background]="col.accentColor"></div>

              <!-- Drag handle -->
              <div class="drag-handle" title="Drag to move">⠿</div>

              <!-- Card Body -->
              <div class="card-body">
                <h3 class="card-job-title" [routerLink]="['/jobs', app.jobId]" title="{{ app.jobTitle }}">
                  {{ app.jobTitle }}
                </h3>
                <p class="card-company">{{ app.company }}</p>
                <p class="card-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ app.location }}
                </p>

                <!-- Resume Badge -->
                <div class="card-resume" *ngIf="app.resumeName">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {{ app.resumeName }}
                </div>

                <!-- Dates -->
                <div class="card-dates">
                  <span class="date-item">Applied {{ formatDate(app.appliedAt) }}</span>
                  <span class="date-item updated" *ngIf="app.updatedAt">
                    Updated {{ formatDate(app.updatedAt) }}
                  </span>
                </div>
              </div>

              <!-- Card Footer Actions -->
              <div class="card-actions">
                <div class="move-actions">
                  <button
                    class="move-btn"
                    *ngIf="getPrevStatus(col.id) as prev"
                    (click)="updateStatus(app.id, prev)"
                    [disabled]="updatingId() === app.id"
                    title="Move back"
                  >← {{ getStatusLabel(prev) }}</button>
                  <button
                    class="move-btn move-btn-fwd"
                    *ngIf="getNextStatus(col.id) as next"
                    (click)="updateStatus(app.id, next)"
                    [disabled]="updatingId() === app.id"
                    title="Move forward"
                  >{{ getStatusLabel(next) }} →</button>
                </div>
                <button
                  class="delete-btn"
                  (click)="deleteApp(app.id)"
                  [disabled]="updatingId() === app.id"
                  title="Remove from tracker"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Column Empty Placeholder -->
            <div class="col-empty" *ngIf="getColumnCount(col.id) === 0">
              <span class="col-empty-icon">{{ col.icon }}</span>
              <p>Nothing here yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .applications-page {
      max-width: 1700px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-4);
    }

    /* ── Page Header ─────────────────────────────────────────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .title-icon { font-size: 1.5rem; }

    .page-subtitle {
      color: var(--color-text-3);
      font-size: var(--text-sm);
      margin: 0;
    }

    .total-badge {
      background: var(--color-primary);
      color: #fff;
      border-radius: var(--border-radius-lg);
      padding: var(--space-3) var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 14px rgba(79,70,229,.25);
    }

    .total-count {
      font-size: var(--text-2xl);
      font-weight: 800;
      line-height: 1;
    }

    .total-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.85;
      margin-top: 2px;
    }

    /* ── Loading ─────────────────────────────────────────────────── */
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-16) 0;
      color: var(--color-text-3);
    }

    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty ───────────────────────────────────────────────────── */
    .empty-state-full {
      text-align: center;
      padding: var(--space-16) var(--space-8);
      color: var(--color-text-3);
    }

    .empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }

    .empty-state-full h2 {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-2);
    }

    .empty-state-full p {
      max-width: 400px;
      margin: 0 auto var(--space-6);
      font-size: var(--text-sm);
      line-height: 1.6;
    }

    /* ── Board ───────────────────────────────────────────────────── */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(5, minmax(230px, 1fr));
      gap: var(--space-4);
      align-items: start;
      overflow-x: auto;
      padding-bottom: var(--space-4);
    }

    @media (max-width: 1200px) { .kanban-board { grid-template-columns: repeat(3, minmax(220px, 1fr)); } }
    @media (max-width: 768px)  { .kanban-board { grid-template-columns: 1fr; } }

    /* ── Column ──────────────────────────────────────────────────── */
    .kanban-column {
      background: #f5f6f8;
      border-radius: var(--border-radius-lg);
      border: 2px solid transparent;
      transition: border-color 0.18s, background 0.18s;
      display: flex;
      flex-direction: column;
      min-height: 380px;
    }

    .kanban-column.drag-over {
      border-color: var(--color-primary);
      background: #eef2ff;
    }

    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-radius: calc(var(--border-radius-lg) - 2px) calc(var(--border-radius-lg) - 2px) 0 0;
      font-weight: 700;
    }

    .col-header-left { display: flex; align-items: center; gap: var(--space-2); }
    .col-icon { font-size: 1rem; }
    .col-title { font-size: var(--text-sm); font-weight: 700; }

    .col-count {
      min-width: 22px; height: 22px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      padding: 0 6px;
    }

    .drop-hint {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-primary);
      text-align: center;
      padding: var(--space-2);
      background: #eef2ff;
      border-bottom: 1px dashed var(--color-primary-muted);
      display: none;
    }

    .drop-hint.visible { display: block; }

    /* ── Cards container ─────────────────────────────────────────── */
    .col-cards {
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      flex: 1;
    }

    /* ── Kanban Card ─────────────────────────────────────────────── */
    .kanban-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      position: relative;
      cursor: grab;
      transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
      overflow: hidden;
    }

    .kanban-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,.1);
    }

    .kanban-card.dragging {
      opacity: 0.35;
      transform: scale(0.96);
      cursor: grabbing;
    }

    .kanban-card.updating {
      opacity: 0.7;
      pointer-events: none;
    }

    /* Left colour accent */
    .card-accent {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
    }

    /* Drag handle */
    .drag-handle {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      font-size: 14px;
      color: #ccc;
      opacity: 0;
      transition: opacity 0.15s;
      cursor: grab;
      line-height: 1;
    }

    .kanban-card:hover .drag-handle { opacity: 1; }

    /* Card body */
    .card-body {
      padding: var(--space-3) var(--space-3) var(--space-3) calc(var(--space-3) + 8px);
    }

    .card-job-title {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-primary);
      cursor: pointer;
      margin: 0 0 4px;
      line-height: 1.3;
      padding-right: var(--space-5);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-job-title:hover { text-decoration: underline; }

    .card-company {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 4px;
    }

    .card-location {
      font-size: var(--text-xs);
      color: var(--color-text-3);
      margin: 0 0 var(--space-2);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card-resume {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: var(--color-text-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 2px 6px;
      margin-bottom: var(--space-2);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-dates { display: flex; flex-direction: column; gap: 2px; }

    .date-item {
      font-size: 10px;
      color: var(--color-text-3);
    }

    .date-item.updated { color: #6366f1; }

    /* Card footer */
    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-3);
      border-top: 1px solid var(--color-border);
      background: #fafafa;
      gap: var(--space-1);
    }

    .move-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

    .move-btn {
      font-size: 10px;
      font-weight: 600;
      color: var(--color-primary);
      background: var(--color-primary-light);
      border: 1px solid var(--color-primary-muted);
      border-radius: 4px;
      padding: 3px 7px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }

    .move-btn:hover:not(:disabled) {
      background: var(--color-primary);
      color: #fff;
    }

    .move-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .delete-btn {
      background: none;
      border: 1px solid #fecaca;
      color: #ef4444;
      border-radius: 4px;
      padding: 4px 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }

    .delete-btn:hover:not(:disabled) { background: #fee2e2; }
    .delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Column empty */
    .col-empty {
      text-align: center;
      padding: var(--space-8) var(--space-4);
      color: var(--color-text-3);
    }

    .col-empty-icon {
      font-size: 1.8rem;
      opacity: 0.3;
      display: block;
      margin-bottom: var(--space-2);
    }

    .col-empty p { font-size: var(--text-xs); margin: 0; }

    /* Global buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--border-radius-md);
      font-weight: 600;
      font-size: var(--text-sm);
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: opacity 0.15s;
    }

    .btn-primary { background: var(--color-primary); color: #fff; }
    .btn-primary:hover { opacity: 0.9; }
  `]
})
export class ApplicationsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  applications = signal<JobApplication[]>([]);
  loading = signal(true);
  updatingId = signal<number | null>(null);
  draggingApp = signal<JobApplication | null>(null);
  dragOverColumn = signal<KanbanStatus | null>(null);

  readonly columns: KanbanColumn[] = [
    { id: 'APPLIED',    label: 'Applied',    icon: '📤', headerBg: '#e0f2fe', headerColor: '#0369a1', accentColor: '#0284c7' },
    { id: 'SCREENING',  label: 'Screening',  icon: '🔍', headerBg: '#fef3c7', headerColor: '#92400e', accentColor: '#d97706' },
    { id: 'INTERVIEW',  label: 'Interview',  icon: '🎤', headerBg: '#f3e8ff', headerColor: '#6b21a8', accentColor: '#9333ea' },
    { id: 'OFFER',      label: 'Offer',      icon: '🎉', headerBg: '#dcfce7', headerColor: '#14532d', accentColor: '#16a34a' },
    { id: 'REJECTED',   label: 'Rejected',   icon: '❌', headerBg: '#fee2e2', headerColor: '#991b1b', accentColor: '#dc2626' },
  ];

  private readonly statusOrder: KanbanStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading.set(true);
    this.dashboardService.getApplications().subscribe({
      next: (data) => { this.applications.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  getColumnApps(status: KanbanStatus): JobApplication[] {
    return this.applications().filter(a => a.status === status);
  }

  getColumnCount(status: KanbanStatus): number {
    return this.getColumnApps(status).length;
  }

  getPrevStatus(current: KanbanStatus): KanbanStatus | null {
    const i = this.statusOrder.indexOf(current);
    return i > 0 ? this.statusOrder[i - 1] : null;
  }

  getNextStatus(current: KanbanStatus): KanbanStatus | null {
    const i = this.statusOrder.indexOf(current);
    return i < this.statusOrder.length - 1 ? this.statusOrder[i + 1] : null;
  }

  getStatusLabel(status: KanbanStatus): string {
    return this.columns.find(c => c.id === status)?.label ?? status;
  }

  updateStatus(appId: number, status: KanbanStatus): void {
    this.updatingId.set(appId);
    this.dashboardService.updateApplicationStatus(appId, status).subscribe({
      next: () => {
        this.applications.update(apps =>
          apps.map(a => a.id === appId
            ? { ...a, status, updatedAt: new Date().toISOString() }
            : a)
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }

  deleteApp(appId: number): void {
    if (!confirm('Remove this application from your tracker?')) return;
    this.updatingId.set(appId);
    this.dashboardService.deleteApplication(appId).subscribe({
      next: () => { this.applications.update(a => a.filter(x => x.id !== appId)); this.updatingId.set(null); },
      error: ()  => this.updatingId.set(null),
    });
  }

  // ── Drag & Drop ────────────────────────────────────────────────
  onDragStart(event: DragEvent, app: JobApplication): void {
    this.draggingApp.set(app);
    event.dataTransfer?.setData('text/plain', String(app.id));
  }

  onDragEnd(): void {
    this.draggingApp.set(null);
    this.dragOverColumn.set(null);
  }

  onDragOver(event: DragEvent, colId: KanbanStatus): void {
    event.preventDefault();
    this.dragOverColumn.set(colId);
  }

  onDragLeave(): void {
    this.dragOverColumn.set(null);
  }

  onDrop(event: DragEvent, targetStatus: KanbanStatus): void {
    event.preventDefault();
    this.dragOverColumn.set(null);
    const app = this.draggingApp();
    if (app && app.status !== targetStatus) {
      this.updateStatus(app.id, targetStatus);
    }
    this.draggingApp.set(null);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
