import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { JobApplication } from '../../core/models/dashboard.models';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalService } from '../../core/services/confirmation-modal.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { LoadingService } from '../../core/services/loading.service';

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
  imports: [CommonModule, RouterLink, SkeletonCardComponent],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css'],
})
export class ApplicationsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationModalService);
  private readonly loadingService = inject(LoadingService);

  applications = signal<JobApplication[]>([]);
  loading = computed(() => this.loadingService.isLoading() && this.applications().length === 0);
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
    this.dashboardService.getApplications().subscribe({
      next: (data) => {
        this.applications.set(data);
      },
      error: () => {},
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
        const label = this.getStatusLabel(status);
        this.toastService.showSuccess(`Application status updated to "${label}"`);
      },
      error: () => this.updatingId.set(null),
    });
  }

  async deleteApp(appId: number): Promise<void> {
    const app = this.applications().find(a => a.id === appId);
    const confirmed = await this.confirmationService.confirm({
      title: 'Remove Tracker',
      message: `Are you sure you want to stop tracking your application for "${app?.jobTitle || 'this job'}"?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      danger: true
    });

    if (!confirmed) return;

    this.updatingId.set(appId);
    this.dashboardService.deleteApplication(appId).subscribe({
      next: () => {
        this.applications.update(a => a.filter(x => x.id !== appId));
        this.updatingId.set(null);
        this.toastService.showSuccess('Application removed from tracker');
      },
      error: () => this.updatingId.set(null),
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
