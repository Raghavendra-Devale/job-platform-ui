import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { JobService } from '../../core/services/job.service';
import {
  ProviderHealthMap,
  SyncSummaryResponse,
  ProviderSyncSummary,
  JobResponse,
} from '../../core/models/job.models';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly fb = inject(FormBuilder);

  // ── Sync ──────────────────────────────────────────────────────────────
  syncLoading = signal(false);
  syncResult  = signal<SyncSummaryResponse | null>(null);

  // ── Provider Health ───────────────────────────────────────────────────
  healthLoading  = signal(true);
  healthData     = signal<ProviderHealthMap>({});

  // ── External Search ───────────────────────────────────────────────────
  searchForm = this.fb.group({ keyword: [''] });
  searchLoading = signal(false);
  searchResults = signal<JobResponse[]>([]);
  searchDone    = signal(false);

  // ── Toasts ────────────────────────────────────────────────────────────
  toasts = signal<Toast[]>([]);
  private toastId = 0;

  ngOnInit(): void {
    this.loadHealth();

    this.searchForm.get('keyword')!.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
    ).subscribe((kw) => {
      if (kw && kw.trim().length >= 2) this.liveSearch(kw.trim());
      else { this.searchResults.set([]); this.searchDone.set(false); }
    });
  }

  // ── Sync ──────────────────────────────────────────────────────────────
  triggerSync(): void {
    this.syncLoading.set(true);
    this.syncResult.set(null);
    this.jobService.syncJobs().subscribe({
      next: (res) => {
        this.syncResult.set(res);
        this.syncLoading.set(false);
        this.showToast('Sync completed successfully!', 'success');
      },
      error: () => {
        this.syncLoading.set(false);
        this.showToast('Sync failed. Check backend connectivity.', 'error');
      },
    });
  }

  totalFetched(providers: ProviderSyncSummary[]): number {
    return providers.reduce((s, p) => s + p.fetched, 0);
  }
  totalInserted(providers: ProviderSyncSummary[]): number {
    return providers.reduce((s, p) => s + p.inserted, 0);
  }
  totalSkipped(providers: ProviderSyncSummary[]): number {
    return providers.reduce((s, p) => s + p.skipped, 0);
  }

  // ── Health ────────────────────────────────────────────────────────────
  loadHealth(): void {
    this.healthLoading.set(true);
    this.jobService.getProviderHealth().subscribe({
      next: (data) => {
        this.healthData.set(data);
        this.healthLoading.set(false);
      },
      error: () => {
        this.healthLoading.set(false);
        this.showToast('Could not load provider health.', 'error');
      },
    });
  }

  healthEntries(): [string, string][] {
    return Object.entries(this.healthData());
  }

  // ── External Search ───────────────────────────────────────────────────
  liveSearch(keyword: string): void {
    this.searchLoading.set(true);
    this.jobService.searchExternal(keyword).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.searchLoading.set(false);
        this.searchDone.set(true);
      },
      error: () => {
        this.searchLoading.set(false);
        this.searchDone.set(true);
        this.showToast('External search failed.', 'error');
      },
    });
  }

  // ── Toasts ────────────────────────────────────────────────────────────
  showToast(message: string, type: ToastType): void {
    const id = ++this.toastId;
    this.toasts.update(ts => [...ts, { id, message, type }]);
    setTimeout(() => {
      this.toasts.update(ts => ts.filter(t => t.id !== id));
    }, 4000);
  }
  dismissToast(id: number): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
