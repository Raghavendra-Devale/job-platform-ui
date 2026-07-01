import { Injectable, signal, computed } from '@angular/core';
import { AppNotification, NotificationPreferences } from '../models/notification.models';

// ── Mock seed data (mirrors real ActivityLog events from the backend) ────────
let _nextId = 6;
const SEED: AppNotification[] = [
  {
    id: 1,
    type: 'RESUME_UPLOADED',
    title: 'Resume uploaded',
    message: 'Your resume "SoftwareEngineer_2024.pdf" was uploaded successfully.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),        // 5 min ago
  },
  {
    id: 2,
    type: 'RESUME_ACTIVATED',
    title: 'Resume activated',
    message: '"SoftwareEngineer_2024.pdf" is now your active resume.',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: 3,
    type: 'JOB_SAVED',
    title: 'Job saved',
    message: 'You bookmarked "Java Backend Developer" at ABC Company.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),     // 2 h ago
  },
  {
    id: 4,
    type: 'APPLICATION_SUBMITTED',
    title: 'Application tracked',
    message: 'Your application for "Senior Software Engineer" has been recorded.',
    read: true,
    createdAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),    // 1 day ago
  },
  {
    id: 5,
    type: 'APPLICATION_UPDATED',
    title: 'Application status updated',
    message: 'Your application for "Java Backend Developer" moved to Screening.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),    // 3 days ago
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // ── State ─────────────────────────────────────────────────────────────────
  private readonly _notifications = signal<AppNotification[]>([...SEED]);
  private readonly _prefs = signal<NotificationPreferences>({
    emailNotifications: true,
    inAppNotifications: true,
  });

  readonly notifications  = this._notifications.asReadonly();
  readonly preferences    = this._prefs.asReadonly();

  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  // ── Notification actions ──────────────────────────────────────────────────

  markAsRead(id: number): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  /** Add a new in-app notification (called by other services after key events) */
  push(type: AppNotification['type'], title: string, message: string): void {
    if (!this._prefs().inAppNotifications) return;
    const notification: AppNotification = {
      id: _nextId++,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this._notifications.update(list => [notification, ...list]);
  }

  clearAll(): void {
    this._notifications.set([]);
  }

  // ── Preference actions ────────────────────────────────────────────────────

  updatePreferences(prefs: Partial<NotificationPreferences>): void {
    this._prefs.update(p => ({ ...p, ...prefs }));
    // TODO: persist to /api/users/profile/notification-preferences
  }
}
