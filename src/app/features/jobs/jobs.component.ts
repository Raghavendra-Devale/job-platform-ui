import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { JobService } from '../../core/services/job.service';
import { JobListResponse, JobSearchResponse, Page } from '../../core/models/job.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
})
export class JobsComponent implements OnInit, OnDestroy {
  private readonly jobService = inject(JobService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroy$ = new Subject<void>();

  readonly Math = Math;

  // ── State signals ────────────────────────────────────────────────────
  jobs        = signal<JobListResponse[]>([]);
  filters     = signal<Record<string, string[]>>({});
  totalElements = signal(0);
  totalPages  = signal(0);
  currentPage = signal(0);
  pageSize    = 10;
  loading     = computed(() => this.loadingService.isLoading() && this.jobs().length === 0);
  error       = signal<string | null>(null);

  recentJobs  = signal<JobListResponse[]>([]);
  filterForm!: FormGroup;

  // Max 7 page buttons
  pages = computed(() =>
    Array.from({ length: Math.min(this.totalPages(), 7) }, (_, i) => i)
  );

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword:    [''],
      location:   [''],
      provider:   [''],
      remote:     [null],
      sortBy:     [''],
      experience: [''],
      jobType:    [''],
      company:    ['']
    });

    // Live search — 300ms debounce
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.search();
    });

    this.search();

    // Fetch recently viewed jobs if user is logged in
    if (this.authService.isAuthenticated()) {
      this.loadRecentlyViewed();
    }
  }

  loadRecentlyViewed(): void {
    this.authService.getRecentJobs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobs) => this.recentJobs.set(jobs),
        error: (err) => console.error('Failed to load recently viewed jobs', err)
      });
  }

  toggleSave(jobId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.authService.isSaved(jobId)) {
      this.authService.unsaveJob(jobId).subscribe();
    } else {
      this.authService.saveJob(jobId).subscribe();
    }
  }

  goToJob(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }

  applyToJob(jobId: number, applyUrl: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
    if (this.authService.isAuthenticated()) {
      this.dashboardService.createApplication(jobId).subscribe();
    }
  }

  inferExperienceLevel(title: string, tags: string | null): string {
    const text = (title + ' ' + (tags || '')).toLowerCase();
    if (text.includes('junior') || text.includes('entry') || text.includes('intern') || text.includes('associate')) {
      return 'Junior';
    }
    if (text.includes('senior') || text.includes('sr.') || text.includes('sr ')) {
      return 'Senior';
    }
    if (text.includes('lead') || text.includes('principal') || text.includes('director') || text.includes('manager')) {
      return 'Lead';
    }
    return 'Mid Level';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Search / Load ────────────────────────────────────────────────────
  search(): void {
    this.error.set(null);

    const { keyword, location, provider, remote, sortBy, experience, jobType, company } = this.filterForm.value;

    const hasFilters = !!(keyword?.trim() || location || provider ||
                          (remote != null && remote !== '') || sortBy ||
                          experience || jobType || company?.trim());

    if (!hasFilters) {
      // No filters → /api/jobs (paginated full list)
      this.jobService.getJobs(this.currentPage(), this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: Page<JobListResponse>) => {
            this.jobs.set(res.content);
            this.totalElements.set(res.totalElements);
            this.totalPages.set(res.totalPages);
          },
          error: () => {
            this.error.set('Could not load jobs. Is the backend running?');
          }
        });
      return;
    }

    // Has filters → /api/jobs/search
    this.jobService.searchJobs({
      keyword:    keyword?.trim() || undefined,
      location:   location || undefined,
      provider:   provider || undefined,
      remote:     remote === 'true' ? true : remote === 'false' ? false : undefined,
      sortBy:     sortBy || undefined,
      experience: experience || undefined,
      jobType:    jobType || undefined,
      company:    company?.trim() || undefined,
      page:       this.currentPage(),
      size:       this.pageSize,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: JobSearchResponse) => {
        this.jobs.set(res.content);
        this.filters.set(res.filters || {});
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
      },
      error: () => {
        this.error.set('Search failed. Please try again.');
      }
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.search();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.filterForm.reset({
      keyword: '',
      location: '',
      provider: '',
      remote: null,
      sortBy: '',
      experience: '',
      jobType: '',
      company: ''
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  getSourceBadgeClass(source: string): string {
    const s = (source || '').toLowerCase();
    if (s.includes('remoteok'))  return 'badge badge-purple';
    if (s.includes('arbeitnow')) return 'badge badge-teal';
    return 'badge badge-slate';
  }

  getRemoteBadgeLabel(remote: boolean | null): string {
    if (remote === true)  return 'Remote';
    if (remote === false) return 'On-site';
    return 'Hybrid';
  }

  getRemoteBadgeClass(remote: boolean | null): string {
    if (remote === true)  return 'badge badge-green';
    if (remote === false) return 'badge badge-amber';
    return 'badge badge-blue';
  }

  getTopTags(tags: string | null, max = 3): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, max);
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
    if (wks  < 5)           return `${wks}w ago`;
    const mos  = Math.floor(days / 30);
    if (mos  < 12)          return `${mos}mo ago`;
    return `${Math.floor(mos / 12)}y ago`;
  }

  trackById(_: number, job: JobListResponse) { return job.id; }
}
