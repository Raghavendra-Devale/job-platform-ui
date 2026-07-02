import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.models';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
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
