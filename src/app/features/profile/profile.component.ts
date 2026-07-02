import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobListResponse } from '../../core/models/job.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  recentJobs = signal<JobListResponse[]>([]);
  savedJobs  = signal<JobListResponse[]>([]);

  // Account Settings state
  activeTab = signal<'profile' | 'preferences' | 'password'>('profile');

  // Form Signals
  profileName = signal('');
  profileEmail = signal('');
  profileLoading = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);

  // New Profile Form Signals
  experience = signal<number | null>(null);
  currentRole = signal('');
  bio = signal('');
  linkedin = signal('');
  github = signal('');
  portfolio = signal('');
  phone = signal('');
  location = signal('');

  // Preferences Form Signals
  workStyle = signal('ANY');
  emailAlerts = signal(true);
  preferredRoles = signal('');
  preferredLocations = signal('');
  remoteOnly = signal(false);
  salaryRange = signal('');
  jobTypesFullTime = signal(false);
  jobTypesPartTime = signal(false);
  jobTypesContract = signal(false);
  jobTypesInternship = signal(false);

  prefLoading = signal(false);
  prefError = signal<string | null>(null);
  prefSuccess = signal<string | null>(null);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  passwordLoading = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  constructor() {
    // Keep form signals in sync with the global authenticated user state
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.profileName.set(user.name);
        this.profileEmail.set(user.email);
        this.workStyle.set(user.workPreference || 'ANY');
        this.emailAlerts.set(user.alertEnabled !== false);

        // Profile fields
        this.experience.set(user.experience !== undefined && user.experience !== null ? user.experience : null);
        this.currentRole.set(user.currentRole || '');
        this.bio.set(user.bio || '');
        this.linkedin.set(user.linkedin || '');
        this.github.set(user.github || '');
        this.portfolio.set(user.portfolio || '');
        this.phone.set(user.phone || '');
        this.location.set(user.location || '');

        // Preferences fields
        this.preferredRoles.set(user.preferredRoles || '');
        this.preferredLocations.set(user.preferredLocations || '');
        this.remoteOnly.set(user.remoteOnly === true);
        this.salaryRange.set(user.salaryRange || '');

        // Deserialize jobTypes (e.g. "FULL_TIME, CONTRACT") to checkboxes
        const jt = (user.jobTypes || '').toUpperCase();
        this.jobTypesFullTime.set(jt.includes('FULL_TIME'));
        this.jobTypesPartTime.set(jt.includes('PART_TIME'));
        this.jobTypesContract.set(jt.includes('CONTRACT'));
        this.jobTypesInternship.set(jt.includes('INTERNSHIP'));
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.authService.getRecentJobs().subscribe({
      next: (jobs) => this.recentJobs.set(jobs),
      error: () => console.error('Failed to load recent views')
    });

    this.authService.getSavedJobs().subscribe({
      next: (jobs) => this.savedJobs.set(jobs),
      error: () => console.error('Failed to load saved jobs')
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSourceClass(source: string): string {
    const s = (source || '').toLowerCase();
    if (s.includes('remoteok'))  return 'badge badge-purple';
    if (s.includes('arbeitnow')) return 'badge badge-teal';
    return 'badge badge-slate';
  }

  // ── Profile Updates ──────────────────────────────────────────────────

  onUpdateProfile(e: Event): void {
    e.preventDefault();
    this.profileLoading.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    this.authService.updateProfile({
      name: this.profileName(),
      email: this.profileEmail(),
      experience: this.experience(),
      currentRole: this.currentRole(),
      bio: this.bio(),
      linkedin: this.linkedin(),
      github: this.github(),
      portfolio: this.portfolio(),
      phone: this.phone(),
      location: this.location()
    }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.profileSuccess.set('Profile updated successfully!');
        this.toastService.showSuccess('Profile details saved successfully');
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(err.error?.error || 'Failed to update profile.');
      }
    });
  }

  onUpdatePreferences(e: Event): void {
    e.preventDefault();
    this.prefLoading.set(true);
    this.prefError.set(null);
    this.prefSuccess.set(null);

    // Serialize checkboxes to list
    const types: string[] = [];
    if (this.jobTypesFullTime()) types.push('FULL_TIME');
    if (this.jobTypesPartTime()) types.push('PART_TIME');
    if (this.jobTypesContract()) types.push('CONTRACT');
    if (this.jobTypesInternship()) types.push('INTERNSHIP');
    const jobTypesStr = types.join(', ');

    this.authService.updatePreferences({
      workPreference: this.workStyle(),
      alertEnabled: this.emailAlerts(),
      preferredRoles: this.preferredRoles(),
      preferredLocations: this.preferredLocations(),
      remoteOnly: this.remoteOnly(),
      salaryRange: this.salaryRange(),
      jobTypes: jobTypesStr
    }).subscribe({
      next: () => {
        this.prefLoading.set(false);
        this.prefSuccess.set('Preferences updated successfully!');
        this.toastService.showSuccess('Preferences updated successfully');
      },
      error: (err) => {
        this.prefLoading.set(false);
        this.prefError.set(err.error?.error || 'Failed to update preferences.');
      }
    });
  }

  onChangePassword(e: Event): void {
    e.preventDefault();
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword({
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.passwordLoading.set(false);
        this.passwordSuccess.set('Password changed successfully!');
        this.toastService.showSuccess('Password updated successfully');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err.error?.error || 'Failed to change password.');
      }
    });
  }

  // ── Saved Jobs Actions ───────────────────────────────────────────────

  unsaveJob(jobId: number): void {
    this.authService.unsaveJob(jobId).subscribe({
      next: () => {
        this.savedJobs.set(this.savedJobs().filter(j => j.id !== jobId));
        this.toastService.showSuccess('Job removed from bookmarks');
      },
      error: () => console.error('Failed to unsave job')
    });
  }
}
