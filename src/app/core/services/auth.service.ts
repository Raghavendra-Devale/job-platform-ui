import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, LoginResponse } from '../models/auth.models';
import { JobListResponse } from '../models/job.models';
import { Resume } from '../models/resume.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'jobboard_token';

  // ── Signals for Global Application State ─────────────────────────────
  readonly currentUser = signal<User | null>(null);
  readonly savedJobIds = signal<number[]>([]);

  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Fetch user profile and saved jobs list on startup to maintain session
      this.getProfile().subscribe({
        next: () => this.loadSavedJobIds().subscribe(),
        error: () => this.logout() // Clear stale local tokens
      });
    }
  }

  // ── Core Authentication API ──────────────────────────────────────────

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.currentUser.set({
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role,
          createdAt: new Date().toISOString()
        });
        // Immediately fetch full profile details and saved jobs
        this.getProfile().subscribe();
        this.loadSavedJobIds().subscribe();
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post('/api/auth/register', userData);
  }

  logout(): Observable<any> {
    // Clear client-side token store first
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.savedJobIds.set([]);

    // Call backend to clear HttpOnly session cookie
    return this.http.post('/api/auth/logout', {}).pipe(
      catchError(() => of(null)) // Graceful fallback
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>('/api/users/profile').pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ── Resume Management ────────────────────────────────────────────────

  getResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>('/api/users/profile/resumes');
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>('/api/users/profile/resumes', formData).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  downloadResume(id: number, fileName: string): void {
    this.http.get(`/api/users/profile/resumes/${id}/download`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Failed to download resume', err)
      });
  }

  deleteResume(id: number): Observable<any> {
    return this.http.delete<any>(`/api/users/profile/resumes/${id}`).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  activateResume(id: number): Observable<any> {
    return this.http.put<any>(`/api/users/profile/resumes/${id}/activate`, {}).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  renameResume(id: number, resumeName: string): Observable<any> {
    return this.http.put<any>(`/api/users/profile/resumes/${id}/rename`, { resumeName }).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  // ── Profile and Preferences Management ───────────────────────────────

  updateProfile(data: {
    name: string;
    email: string;
    experience?: number | null;
    currentRole?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    phone?: string;
    location?: string;
  }): Observable<any> {
    return this.http.put<any>('/api/users/profile', data).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          this.currentUser.set({
            ...user,
            ...data,
            experience: data.experience ?? undefined
          });
        }
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post<any>('/api/users/profile/change-password', data);
  }

  updatePreferences(data: {
    workPreference: string;
    alertEnabled: boolean;
    preferredRoles?: string;
    preferredLocations?: string;
    remoteOnly?: boolean;
    salaryRange?: string;
    jobTypes?: string;
  }): Observable<any> {
    return this.http.put<any>('/api/users/profile/preferences', data).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          this.currentUser.set({
            ...user,
            ...data
          });
        }
      })
    );
  }

  // ── Saved Jobs ───────────────────────────────────────────────────────

  loadSavedJobIds(): Observable<number[]> {
    if (!this.isAuthenticated()) return of([]);
    return this.http.get<number[]>('/api/jobs/saved/ids').pipe(
      tap((ids) => this.savedJobIds.set(ids)),
      catchError(() => of([]))
    );
  }

  getSavedJobs(): Observable<JobListResponse[]> {
    return this.http.get<JobListResponse[]>('/api/jobs/saved');
  }

  saveJob(jobId: number): Observable<any> {
    return this.http.post(`/api/jobs/${jobId}/save`, {}).pipe(
      tap(() => {
        const currentIds = this.savedJobIds();
        if (!currentIds.includes(jobId)) {
          this.savedJobIds.set([...currentIds, jobId]);
        }
      })
    );
  }

  unsaveJob(jobId: number): Observable<any> {
    return this.http.delete(`/api/jobs/${jobId}/save`).pipe(
      tap(() => {
        this.savedJobIds.set(this.savedJobIds().filter(id => id !== jobId));
      })
    );
  }

  isSaved(jobId: number): boolean {
    return this.savedJobIds().includes(jobId);
  }

  // ── Recently Viewed Jobs ─────────────────────────────────────────────

  getRecentJobs(): Observable<JobListResponse[]> {
    return this.http.get<JobListResponse[]>('/api/jobs/recent');
  }

  viewJob(jobId: number): Observable<any> {
    if (!this.isAuthenticated()) return of(null);
    return this.http.post(`/api/jobs/${jobId}/view`, {});
  }
}
