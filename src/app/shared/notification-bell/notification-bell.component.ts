import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.models';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bell-wrapper" [class.open]="open()">

      <!-- Bell Button -->
      <button
        class="bell-btn"
        id="btn-notifications"
        [class.has-unread]="notifService.unreadCount() > 0"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="badge-dot" *ngIf="notifService.unreadCount() > 0">
          {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
        </span>
      </button>

      <!-- Dropdown Panel -->
      <div class="notif-dropdown" *ngIf="open()" role="dialog" aria-label="Notifications panel">

        <!-- Header -->
        <div class="notif-header">
          <span class="notif-heading">Notifications</span>
          <div class="notif-header-actions">
            <button
              class="link-btn"
              *ngIf="notifService.unreadCount() > 0"
              (click)="markAllRead()"
            >Mark all read</button>
            <button class="link-btn danger" *ngIf="notifService.notifications().length > 0" (click)="clearAll()">Clear</button>
          </div>
        </div>

        <!-- List -->
        <div class="notif-list" *ngIf="notifService.notifications().length > 0; else emptyNotif">
          <div
            class="notif-item"
            *ngFor="let n of notifService.notifications()"
            [class.unread]="!n.read"
            (click)="markRead(n)"
            [id]="'notif-' + n.id"
          >
            <div class="notif-icon-wrap" [class]="getIconClass(n.type)">
              <span [innerHTML]="getIcon(n.type)"></span>
            </div>
            <div class="notif-body">
              <p class="notif-title">{{ n.title }}</p>
              <p class="notif-msg">{{ n.message }}</p>
              <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
            </div>
            <div class="unread-dot" *ngIf="!n.read"></div>
          </div>
        </div>

        <ng-template #emptyNotif>
          <div class="notif-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p>You're all caught up!</p>
          </div>
        </ng-template>

        <!-- Footer -->
        <div class="notif-footer">
          <a routerLink="/settings" (click)="open.set(false)" class="footer-link" id="notif-settings-link">
            Notification Settings
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bell-wrapper {
      position: relative;
    }

    /* ── Bell Button ────────────────────────────────────────────── */
    .bell-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px; height: 38px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--color-text-2);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .bell-btn:hover,
    .bell-wrapper.open .bell-btn {
      background: var(--color-surface-2);
      color: var(--color-text);
    }

    .bell-btn.has-unread {
      color: var(--color-primary, #6366f1);
    }

    /* Badge dot */
    .badge-dot {
      position: absolute;
      top: 4px; right: 4px;
      min-width: 16px; height: 16px;
      background: #ef4444;
      color: #fff;
      border-radius: 99px;
      font-size: 9px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      border: 2px solid #fff;
      line-height: 1;
    }

    /* ── Dropdown Panel ─────────────────────────────────────────── */
    .notif-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 360px;
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,.13), 0 4px 12px rgba(0,0,0,.07);
      z-index: 200;
      overflow: hidden;
      animation: dropIn 0.18s ease both;
    }

    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    @media (max-width: 420px) {
      .notif-dropdown {
        width: calc(100vw - 24px);
        right: -12px;
      }
    }

    /* ── Header ─────────────────────────────────────────────────── */
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--color-border);
    }

    .notif-heading {
      font-weight: 800;
      font-size: 15px;
      color: var(--color-text);
    }

    .notif-header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .link-btn {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary, #6366f1);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      transition: background 0.12s;
    }
    .link-btn:hover { background: var(--color-primary-light, #eef2ff); }
    .link-btn.danger { color: #ef4444; }
    .link-btn.danger:hover { background: #fef2f2; }

    /* ── List ───────────────────────────────────────────────────── */
    .notif-list {
      max-height: 340px;
      overflow-y: auto;
    }

    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.12s;
      position: relative;
      border-bottom: 1px solid #f3f4f6;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: #fafafa; }
    .notif-item.unread { background: #f8f7ff; }
    .notif-item.unread:hover { background: #f0eeff; }

    /* ── Notification icon ──────────────────────────────────────── */
    .notif-icon-wrap {
      flex-shrink: 0;
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .icon-resume   { background: #ede9fe; }
    .icon-job      { background: #dcfce7; }
    .icon-app      { background: #dbeafe; }
    .icon-default  { background: #f3f4f6; }

    /* ── Body ───────────────────────────────────────────────────── */
    .notif-body { flex: 1; min-width: 0; }

    .notif-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 2px;
    }

    .notif-msg {
      font-size: 12px;
      color: var(--color-text-2);
      margin: 0 0 4px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-time {
      font-size: 10px;
      color: var(--color-text-3, #9ca3af);
      font-weight: 600;
    }

    /* Unread indicator dot */
    .unread-dot {
      flex-shrink: 0;
      align-self: center;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #6366f1;
    }

    /* ── Empty ──────────────────────────────────────────────────── */
    .notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      color: var(--color-text-3, #9ca3af);
    }

    .notif-empty p {
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }

    /* ── Footer ─────────────────────────────────────────────────── */
    .notif-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--color-border);
      background: #fafafa;
    }

    .footer-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-2);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.12s;
    }
    .footer-link:hover { color: var(--color-primary, #6366f1); text-decoration: none; }
  `]
})
export class NotificationBellComponent {
  readonly notifService = inject(NotificationService);
  readonly open = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-notification-bell')) {
      this.open.set(false);
    }
  }

  toggle(): void {
    this.open.update(v => !v);
  }

  markRead(n: AppNotification): void {
    this.notifService.markAsRead(n.id);
  }

  markAllRead(): void {
    this.notifService.markAllRead();
  }

  clearAll(): void {
    this.notifService.clearAll();
  }

  getIconClass(type: AppNotification['type']): string {
    if (type === 'RESUME_UPLOADED' || type === 'RESUME_ACTIVATED') return 'notif-icon-wrap icon-resume';
    if (type === 'JOB_SAVED')                                       return 'notif-icon-wrap icon-job';
    if (type === 'APPLICATION_SUBMITTED' || type === 'APPLICATION_UPDATED') return 'notif-icon-wrap icon-app';
    return 'notif-icon-wrap icon-default';
  }

  getIcon(type: AppNotification['type']): string {
    switch (type) {
      case 'RESUME_UPLOADED':        return '📄';
      case 'RESUME_ACTIVATED':       return '⭐';
      case 'JOB_SAVED':             return '🔖';
      case 'APPLICATION_SUBMITTED':  return '📤';
      case 'APPLICATION_UPDATED':    return '🔄';
      default:                       return '🔔';
    }
  }

  timeAgo(dateStr: string): string {
    const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60)  return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }
}
