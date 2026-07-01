import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobService } from '../../core/services/job.service';
import { JobResponse } from '../../core/models/job.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css'],
})
export class JobDetailComponent implements OnInit {
  private readonly jobService       = inject(JobService);
  private readonly route             = inject(ActivatedRoute);
  readonly authService               = inject(AuthService);
  private readonly dashboardService  = inject(DashboardService);

  job     = signal<JobResponse | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);
  jobId: number | null = null;

  onApplyClick(): void {
    if (this.jobId && this.authService.isAuthenticated()) {
      this.dashboardService.createApplication(this.jobId).subscribe();
    }
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('Invalid job ID.'); this.loading.set(false); return; }
    this.jobId = id;

    // Record job view on visit (if logged in)
    this.authService.viewJob(id).subscribe();

    this.jobService.getJobById(id).subscribe({
      next: (job) => {
        this.job.set(job);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this job. It may have been removed or the backend is unavailable.');
        this.loading.set(false);
      },
    });
  }

  toggleSave(): void {
    if (!this.jobId) return;
    if (this.authService.isSaved(this.jobId)) {
      this.authService.unsaveJob(this.jobId).subscribe();
    } else {
      this.authService.saveJob(this.jobId).subscribe();
    }
  }

  // Split comma-separated tags into array
  getTags(tags: string | null): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  // Cycle through a set of harmonious badge colors
  getTagClass(index: number): string {
    const classes = ['badge-blue', 'badge-teal', 'badge-purple', 'badge-green', 'badge-amber', 'badge-slate'];
    return 'badge ' + classes[index % classes.length];
  }

  // Split description into paragraphs, filter blank lines
  getDescriptionParagraphs(description: string | null): string[] {
    if (!description) return [];
    return description.split(/\n+/).map(p => p.trim()).filter(Boolean);
  }
}
