import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalService } from '../../core/services/confirmation-modal.service';

type ActiveSection = 'account' | 'notifications' | 'appearance';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  readonly authService   = inject(AuthService);
  readonly notifService  = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationModalService);

  activeSection    = signal<ActiveSection>('account');
  savingPassword   = signal(false);
  passwordError    = signal<string | null>(null);
  passwordSuccess  = signal<string | null>(null);

  passwordForm = { current: '', next: '', confirm: '' };

  readonly eventTypes = [
    { icon: '📄', label: 'Resume Uploaded',          description: 'When you successfully upload a new resume.' },
    { icon: '⭐', label: 'Resume Activated',          description: 'When you set a resume as your active document.' },
    { icon: '🔖', label: 'Job Saved',                 description: 'When you bookmark a job listing.' },
    { icon: '📤', label: 'Application Submitted',     description: 'When you apply to a job and it is tracked.' },
    { icon: '🔄', label: 'Application Status Updated', description: 'When your application moves to a new stage.' },
  ];

  ngOnInit(): void { /* profile already loaded by AuthService */ }

  initials(): string {
    const name = this.authService.currentUser()?.name ?? '';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      RESUME_UPLOADED: '📄', RESUME_ACTIVATED: '⭐',
      JOB_SAVED: '🔖', APPLICATION_SUBMITTED: '📤', APPLICATION_UPDATED: '🔄',
    };
    return map[type] ?? '🔔';
  }

  toggleEmail(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.notifService.updatePreferences({ emailNotifications: checked });
    this.toastService.showSuccess(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
  }

  toggleInApp(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.notifService.updatePreferences({ inAppNotifications: checked });
    this.toastService.showSuccess(`In-app notifications ${checked ? 'enabled' : 'disabled'}`);
  }

  changePassword(): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (!this.passwordForm.current || !this.passwordForm.next || !this.passwordForm.confirm) {
      this.passwordError.set('All password fields are required.');
      return;
    }
    if (this.passwordForm.next.length < 8) {
      this.passwordError.set('New password must be at least 8 characters.');
      return;
    }
    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.savingPassword.set(true);
    this.authService.changePassword({
      currentPassword: this.passwordForm.current,
      newPassword: this.passwordForm.next,
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('Password updated successfully!');
        this.toastService.showSuccess('Password updated successfully');
        this.passwordForm = { current: '', next: '', confirm: '' };
        setTimeout(() => this.passwordSuccess.set(null), 4000);
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(
          err?.error?.message ?? 'Failed to update password. Check your current password.'
        );
      }
    });
  }

  async confirmLogout(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out of JobBoard?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      danger: true
    });
    if (confirmed) {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.toastService.showSuccess('Logged out successfully');
      this.router.navigate(['/login']);
    });
  }

  deleteAccountPrompt(): void {
    alert('Account deletion is not yet available. Please contact support.');
  }
}
