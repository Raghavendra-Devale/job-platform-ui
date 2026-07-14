import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { JobService } from '../../core/services/job.service';
import { JobListResponse, JobSearchResponse, Page, JobSearchState, stateToParams, paramsToState } from '../../core/models/job.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { LoadingService } from '../../core/services/loading.service';
import { JobCardComponent } from '../../shared/components/job-card/job-card.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, JobCardComponent],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
})
export class JobsComponent implements OnInit, OnDestroy {
  private readonly jobService = inject(JobService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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

    // 1. Sync URL changes -> Form & Search
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const state = paramsToState(params);
      
      // Patch form values without firing recursive valueChanges loops
      this.filterForm.patchValue(state, { emitEvent: false });
      this.currentPage.set(state.page);

      this.search();
    });

    // 2. Sync Form changes -> URL (Debounced & Cleaned)
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe(values => {
      const state: JobSearchState = {
        ...values,
        page: 0 // Reset page to 0 on any filter/keyword changes
      };
      const queryParams = stateToParams(state);

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: '' // Complete override to clear deleted params from URL
      });
    });

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

  saveJob(jobId: number): void {
    if (this.authService.isSaved(jobId)) {
      this.authService.unsaveJob(jobId).subscribe();
    } else {
      this.authService.saveJob(jobId).subscribe();
    }
  }

  applyJob(jobId: number): void {
    const job = this.jobs().find(j => j.id === jobId);
    if (job && job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
      if (this.authService.isAuthenticated()) {
        this.dashboardService.createApplication(jobId).subscribe();
      }
    }
  }

  compareResume(jobId: number): void {
    this.router.navigate(['/recommendations', jobId]);
  }

  viewDetails(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
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
    
    const state: JobSearchState = {
      ...this.filterForm.value,
      page: page
    };
    const queryParams = stateToParams(state);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: ''
    });

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
    }, { emitEvent: false });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: ''
    });
  }

  trackById(_: number, job: JobListResponse) { return job.id; }
}
