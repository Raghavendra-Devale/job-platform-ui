import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, LoginResponse } from '../models/auth.models';
import { JobListResponse } from '../models/job.models';
import { Resume } from '../models/resume.models';
import { BYPASS_LOADING } from '../interceptors/loading.interceptor';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loggedInKey = 'logged_in';

  // ── Signals for Global Application State ─────────────────────────────
  readonly currentUser = signal<User | null>(null);
  readonly savedJobIds = signal<number[]>([]);

  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const isLoggedIn = localStorage.getItem(this.loggedInKey) === 'true';
    if (isLoggedIn) {
      // Fetch user profile and saved jobs list on startup to maintain session
      this.getProfile().subscribe({
        next: () => this.loadSavedJobIds().subscribe(),
        error: () => this.logout() // Clear stale local state if session is expired
      });
    }
  }

  // ── Core Authentication API ──────────────────────────────────────────

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.loggedInKey, 'true');
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
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  logout(): Observable<any> {
    // Clear client-side state first
    localStorage.removeItem(this.loggedInKey);
    this.currentUser.set(null);
    this.savedJobIds.set([]);

    // Call backend to clear HttpOnly session cookie
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)) // Graceful fallback
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/profile`).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  // ── Resume Management ────────────────────────────────────────────────

  getResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${environment.apiUrl}/users/profile/resumes`);
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/users/profile/resumes`, formData).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  downloadResume(id: number, fileName: string): void {
    this.http.get(`${environment.apiUrl}/users/profile/resumes/${id}/download`, { responseType: 'blob' })
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
    return this.http.delete<any>(`${environment.apiUrl}/users/profile/resumes/${id}`).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  activateResume(id: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/users/profile/resumes/${id}/activate`, {}).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  renameResume(id: number, resumeName: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/users/profile/resumes/${id}/rename`, { resumeName }).pipe(
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
    return this.http.put<any>(`${environment.apiUrl}/users/profile`, data).pipe(
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
    return this.http.post<any>(`${environment.apiUrl}/users/profile/change-password`, data);
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
    return this.http.put<any>(`${environment.apiUrl}/users/profile/preferences`, data).pipe(
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
    return this.http.get<number[]>(`${environment.apiUrl}/jobs/saved/ids`, {
      context: new HttpContext().set(BYPASS_LOADING, true)
    }).pipe(
      tap((ids) => this.savedJobIds.set(ids)),
      catchError(() => of([]))
    );
  }

  getSavedJobs(): Observable<JobListResponse[]> {
    return this.http.get<JobListResponse[]>(`${environment.apiUrl}/jobs/saved`);
  }

  saveJob(jobId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/jobs/${jobId}/save`, {}, {
      context: new HttpContext().set(BYPASS_LOADING, true)
    }).pipe(
      tap(() => {
        const currentIds = this.savedJobIds();
        if (!currentIds.includes(jobId)) {
          this.savedJobIds.set([...currentIds, jobId]);
        }
      })
    );
  }

  unsaveJob(jobId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/jobs/${jobId}/save`, {
      context: new HttpContext().set(BYPASS_LOADING, true)
    }).pipe(
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
    return this.http.get<JobListResponse[]>(`${environment.apiUrl}/jobs/recent`, {
      context: new HttpContext().set(BYPASS_LOADING, true)
    });
  }

  viewJob(jobId: number): Observable<any> {
    if (!this.isAuthenticated()) return of(null);
    return this.http.post(`${environment.apiUrl}/jobs/${jobId}/view`, {}, {
      context: new HttpContext().set(BYPASS_LOADING, true)
    });
  }
}
