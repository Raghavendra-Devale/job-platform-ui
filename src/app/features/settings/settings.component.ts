import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

type ActiveSection = 'account' | 'notifications' | 'appearance';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade-in-up">

      <!-- ── Page Title ── -->
      <div class="page-header">
        <div class="header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                     a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
                     A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
                     l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
                     A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
                     l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
                     a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
                     l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
                     a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage your account, notifications, and preferences.</p>
        </div>
      </div>

      <!-- ── Layout ── -->
      <div class="settings-layout">

        <!-- Sidebar -->
        <nav class="settings-sidebar" aria-label="Settings navigation">
          <button
            class="sidebar-item"
            [class.active]="activeSection() === 'account'"
            (click)="activeSection.set('account')"
            id="settings-nav-account"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Account
          </button>
          <button
            class="sidebar-item"
            [class.active]="activeSection() === 'notifications'"
            (click)="activeSection.set('notifications')"
            id="settings-nav-notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Notifications
            <span class="unread-pill" *ngIf="notifService.unreadCount() > 0">
              {{ notifService.unreadCount() }}
            </span>
          </button>
          <button
            class="sidebar-item"
            [class.active]="activeSection() === 'appearance'"
            (click)="activeSection.set('appearance')"
            id="settings-nav-appearance"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Appearance
          </button>

          <div class="sidebar-divider"></div>

          <button class="sidebar-item danger" (click)="confirmLogout()" id="settings-nav-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </nav>

        <!-- Content Panel -->
        <div class="settings-content">

          <!-- ══ ACCOUNT SECTION ══ -->
          <section *ngIf="activeSection() === 'account'" class="section-panel animate-section">
            <h2 class="section-title">Account</h2>
            <p class="section-desc">Manage your personal information and password.</p>

            <!-- Profile info card -->
            <div class="settings-card">
              <div class="card-row-header">
                <div class="user-avatar-sm">{{ initials() }}</div>
                <div>
                  <p class="user-name-sm">{{ authService.currentUser()?.name }}</p>
                  <p class="user-email-sm">{{ authService.currentUser()?.email }}</p>
                  <span class="role-chip">{{ authService.currentUser()?.role }}</span>
                </div>
              </div>
            </div>

            <!-- Change password card -->
            <div class="settings-card">
              <h3 class="card-title">Change Password</h3>
              <p class="card-desc">Choose a strong password to keep your account secure.</p>

              <div class="form-group">
                <label class="form-label" for="current-pass">Current Password</label>
                <input id="current-pass" type="password" class="form-input"
                       placeholder="Enter current password"
                       [(ngModel)]="passwordForm.current" />
              </div>
              <div class="form-group">
                <label class="form-label" for="new-pass">New Password</label>
                <input id="new-pass" type="password" class="form-input"
                       placeholder="At least 8 characters"
                       [(ngModel)]="passwordForm.next" />
              </div>
              <div class="form-group">
                <label class="form-label" for="confirm-pass">Confirm New Password</label>
                <input id="confirm-pass" type="password" class="form-input"
                       placeholder="Repeat new password"
                       [(ngModel)]="passwordForm.confirm" />
              </div>

              <!-- Inline error -->
              <p class="form-error" *ngIf="passwordError()">{{ passwordError() }}</p>
              <!-- Inline success -->
              <p class="form-success" *ngIf="passwordSuccess()">{{ passwordSuccess() }}</p>

              <div class="form-actions">
                <button class="btn btn-primary" id="btn-change-password"
                        [disabled]="savingPassword()"
                        (click)="changePassword()">
                  <span class="spinner-xs" *ngIf="savingPassword()"></span>
                  {{ savingPassword() ? 'Saving…' : 'Update Password' }}
                </button>
              </div>
            </div>

            <!-- Danger zone -->
            <div class="settings-card danger-card">
              <h3 class="card-title danger-title">Danger Zone</h3>
              <p class="card-desc">These actions are permanent and cannot be undone.</p>
              <button class="btn btn-danger-outline" id="btn-delete-account" (click)="deleteAccountPrompt()">
                Delete Account
              </button>
            </div>
          </section>

          <!-- ══ NOTIFICATIONS SECTION ══ -->
          <section *ngIf="activeSection() === 'notifications'" class="section-panel animate-section">
            <h2 class="section-title">Notifications</h2>
            <p class="section-desc">Control how and when you receive updates.</p>

            <!-- Channel preferences -->
            <div class="settings-card">
              <h3 class="card-title">Delivery Channels</h3>
              <p class="card-desc">Choose where you'd like to receive notifications.</p>

              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-label">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email Notifications
                  </span>
                  <span class="toggle-desc">Receive activity updates to your registered email address.</span>
                </div>
                <label class="toggle-switch" for="toggle-email">
                  <input id="toggle-email" type="checkbox"
                         [checked]="notifService.preferences().emailNotifications"
                         (change)="toggleEmail($event)" />
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                </label>
              </div>

              <div class="divider-thin"></div>

              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-label">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    In-App Notifications
                  </span>
                  <span class="toggle-desc">Show bell icon alerts inside the application.</span>
                </div>
                <label class="toggle-switch" for="toggle-inapp">
                  <input id="toggle-inapp" type="checkbox"
                         [checked]="notifService.preferences().inAppNotifications"
                         (change)="toggleInApp($event)" />
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Event subscriptions -->
            <div class="settings-card">
              <h3 class="card-title">Notify me when…</h3>
              <p class="card-desc">These events will always generate a notification if in-app notifications are enabled.</p>

              <div class="event-list">
                <div class="event-row" *ngFor="let ev of eventTypes">
                  <div class="event-icon">{{ ev.icon }}</div>
                  <div class="event-info">
                    <span class="event-label">{{ ev.label }}</span>
                    <span class="event-desc">{{ ev.description }}</span>
                  </div>
                  <span class="event-badge active">Active</span>
                </div>
              </div>

              <p class="hint-text">
                Granular per-event controls will be available in a future release.
              </p>
            </div>

            <!-- Recent notifications preview -->
            <div class="settings-card" *ngIf="notifService.notifications().length > 0">
              <div class="card-row-header">
                <h3 class="card-title" style="margin:0">Recent Notifications</h3>
                <button class="link-action" (click)="notifService.markAllRead()" id="btn-mark-all-read">
                  Mark all read
                </button>
              </div>
              <div class="notif-preview-list">
                <div
                  class="notif-preview-item"
                  *ngFor="let n of notifService.notifications().slice(0, 5)"
                  [class.unread]="!n.read"
                >
                  <span class="notif-preview-icon">{{ getIcon(n.type) }}</span>
                  <div class="notif-preview-body">
                    <p class="notif-preview-title">{{ n.title }}</p>
                    <p class="notif-preview-msg">{{ n.message }}</p>
                  </div>
                  <span class="notif-preview-dot" *ngIf="!n.read"></span>
                </div>
              </div>
              <button class="link-action danger mt-2" (click)="notifService.clearAll()" id="btn-clear-all">
                Clear all notifications
              </button>
            </div>
          </section>

          <!-- ══ APPEARANCE SECTION ══ -->
          <section *ngIf="activeSection() === 'appearance'" class="section-panel animate-section">
            <h2 class="section-title">Appearance</h2>
            <p class="section-desc">Customise how JobBoard looks for you.</p>

            <div class="settings-card placeholder-card">
              <div class="placeholder-inner">
                <div class="placeholder-icon">🎨</div>
                <h3>Coming Soon</h3>
                <p>Dark mode, accent colours, and font-size controls are on the roadmap. Check back soon!</p>
                <div class="theme-preview-row">
                  <div class="theme-swatch active-swatch" title="Light (current)">
                    <div class="swatch-bg light-bg">
                      <div class="swatch-bar"></div>
                      <div class="swatch-content"></div>
                    </div>
                    <span>Light</span>
                  </div>
                  <div class="theme-swatch" title="Dark (coming soon)">
                    <div class="swatch-bg dark-bg">
                      <div class="swatch-bar dark-bar"></div>
                      <div class="swatch-content dark-content"></div>
                    </div>
                    <span>Dark</span>
                  </div>
                  <div class="theme-swatch" title="System (coming soon)">
                    <div class="swatch-bg system-bg"></div>
                    <span>System</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- Logout confirm overlay -->
    <div class="modal-overlay" *ngIf="showLogoutConfirm()" (click)="showLogoutConfirm.set(false)">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-icon logout-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3>Log out of JobBoard?</h3>
        <p>You'll need to sign in again to access your account.</p>
        <div class="modal-actions">
          <button class="btn btn-outline" (click)="showLogoutConfirm.set(false)">Cancel</button>
          <button class="btn btn-danger" id="btn-confirm-logout" (click)="logout()">Log Out</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page ──────────────────────────────────────────────────────── */
    .settings-page {
      max-width: 960px;
      margin: var(--space-8) auto;
      padding: 0 var(--space-4) var(--space-12);
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .header-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 20px rgba(99,102,241,.3);
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: 800;
      color: var(--color-text);
      margin: 0 0 var(--space-1);
    }

    .page-subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin: 0;
    }

    /* ── Layout ─────────────────────────────────────────────────────── */
    .settings-layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    @media (max-width: 640px) {
      .settings-layout {
        grid-template-columns: 1fr;
      }
      .settings-sidebar {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        gap: var(--space-1) !important;
        padding-bottom: var(--space-1);
      }
      .sidebar-divider { display: none; }
    }

    /* ── Sidebar ─────────────────────────────────────────────────────── */
    .settings-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2px;
      position: sticky;
      top: 80px;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--color-text-2);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }

    .sidebar-item:hover {
      background: var(--color-surface-2);
      color: var(--color-text);
    }

    .sidebar-item.active {
      background: var(--color-primary-light, #eef2ff);
      color: var(--color-primary, #6366f1);
      font-weight: 700;
    }

    .sidebar-item.danger { color: #ef4444; }
    .sidebar-item.danger:hover { background: #fef2f2; }

    .sidebar-divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-2) 0;
    }

    .unread-pill {
      margin-left: auto;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      border-radius: 99px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }

    /* ── Content ─────────────────────────────────────────────────────── */
    .settings-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .section-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .animate-section {
      animation: fadeSlide 0.25s ease both;
    }

    @keyframes fadeSlide {
      from { opacity: 0; transform: translateX(8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .section-title {
      font-size: var(--text-xl);
      font-weight: 800;
      color: var(--color-text);
      margin: 0 0 2px;
    }

    .section-desc {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin: 0;
    }

    /* ── Card ────────────────────────────────────────────────────────── */
    .settings-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 2px;
    }

    .card-desc {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin: 0;
    }

    .card-row-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      justify-content: space-between;
      flex-wrap: wrap;
    }

    /* ── User card ───────────────────────────────────────────────────── */
    .user-avatar-sm {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      font-size: 18px;
      flex-shrink: 0;
    }

    .user-name-sm {
      font-weight: 700;
      font-size: var(--text-base);
      color: var(--color-text);
      margin: 0 0 2px;
    }

    .user-email-sm {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin: 0 0 4px;
    }

    .role-chip {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      background: var(--color-primary-light, #eef2ff);
      color: var(--color-primary, #6366f1);
      border-radius: 99px;
      padding: 2px 8px;
      border: 1px solid #c7d2fe;
    }

    /* ── Form ────────────────────────────────────────────────────────── */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .form-label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }

    .form-input {
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      font-size: var(--text-sm);
      color: var(--color-text);
      background: var(--color-surface, #fff);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .form-input:focus {
      border-color: var(--color-primary, #6366f1);
      box-shadow: 0 0 0 3px rgba(99,102,241,.12);
    }

    .form-error   { font-size: var(--text-sm); color: #ef4444; margin: 0; }
    .form-success { font-size: var(--text-sm); color: #22c55e; font-weight: 600; margin: 0; }

    .form-actions { display: flex; }

    /* ── Toggle switch ───────────────────────────────────────────────── */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .toggle-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }

    .toggle-desc {
      font-size: var(--text-xs);
      color: var(--color-text-2);
    }

    .toggle-switch {
      position: relative;
      flex-shrink: 0;
      cursor: pointer;
    }

    .toggle-switch input {
      position: absolute;
      opacity: 0;
      width: 0; height: 0;
    }

    .toggle-track {
      display: block;
      width: 44px; height: 24px;
      border-radius: 99px;
      background: #e5e7eb;
      transition: background 0.2s;
      position: relative;
    }

    .toggle-thumb {
      position: absolute;
      top: 3px; left: 3px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
      transition: transform 0.2s;
    }

    .toggle-switch input:checked + .toggle-track {
      background: #6366f1;
    }

    .toggle-switch input:checked + .toggle-track .toggle-thumb {
      transform: translateX(20px);
    }

    .divider-thin {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-1) 0;
    }

    /* ── Event list ─────────────────────────────────────────────────── */
    .event-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .event-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .event-row:last-child { border-bottom: none; }

    .event-icon {
      font-size: 18px;
      width: 32px;
      text-align: center;
      flex-shrink: 0;
    }

    .event-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .event-label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }

    .event-desc {
      font-size: var(--text-xs);
      color: var(--color-text-2);
    }

    .event-badge {
      font-size: 10px;
      font-weight: 700;
      border-radius: 99px;
      padding: 2px 8px;
      flex-shrink: 0;
    }

    .event-badge.active {
      background: #dcfce7;
      color: #166534;
    }

    .hint-text {
      font-size: var(--text-xs);
      color: var(--color-text-3, #9ca3af);
      font-style: italic;
      margin: 0;
    }

    /* ── Notification preview ───────────────────────────────────────── */
    .notif-preview-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .notif-preview-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: 10px;
      background: #fafafa;
      border: 1px solid #f3f4f6;
      position: relative;
    }

    .notif-preview-item.unread {
      background: #f8f7ff;
      border-color: #e0e7ff;
    }

    .notif-preview-icon { font-size: 16px; flex-shrink: 0; }

    .notif-preview-body { flex: 1; min-width: 0; }

    .notif-preview-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 2px;
    }

    .notif-preview-msg {
      font-size: 11px;
      color: var(--color-text-2);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-preview-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #6366f1;
      flex-shrink: 0;
      align-self: center;
    }

    .link-action {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary, #6366f1);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: opacity 0.15s;
      align-self: flex-start;
    }
    .link-action:hover { opacity: .75; }
    .link-action.danger { color: #ef4444; }
    .mt-2 { margin-top: var(--space-2); }

    /* ── Appearance placeholder ─────────────────────────────────────── */
    .placeholder-card { align-items: center; }

    .placeholder-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-8) 0;
      text-align: center;
    }

    .placeholder-icon { font-size: 3rem; }

    .placeholder-inner h3 {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }

    .placeholder-inner p {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      max-width: 380px;
      line-height: 1.6;
      margin: 0;
    }

    .theme-preview-row {
      display: flex;
      gap: var(--space-4);
      margin-top: var(--space-2);
    }

    .theme-swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      cursor: not-allowed;
      opacity: .7;
    }

    .theme-swatch.active-swatch { opacity: 1; cursor: default; }

    .swatch-bg {
      width: 72px; height: 52px;
      border-radius: 10px;
      border: 2px solid transparent;
      overflow: hidden;
      position: relative;
    }

    .theme-swatch.active-swatch .swatch-bg { border-color: #6366f1; }

    .light-bg { background: #f9fafb; }
    .dark-bg  { background: #1f2937; }
    .system-bg {
      background: linear-gradient(to right, #f9fafb 50%, #1f2937 50%);
    }

    .swatch-bar {
      height: 12px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
    }
    .dark-bar { background: #374151; border-color: #4b5563; }

    .swatch-content {
      margin: 6px;
      height: 20px;
      background: #e5e7eb;
      border-radius: 4px;
    }
    .dark-content { background: #4b5563; }

    .swatch-bg span, .theme-swatch span {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-2);
    }

    /* ── Danger card ─────────────────────────────────────────────────── */
    .danger-card { border-color: #fecaca; }
    .danger-title { color: #ef4444; }

    /* ── Buttons ─────────────────────────────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border-radius: 10px;
      font-weight: 600;
      font-size: var(--text-sm);
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
      border: 1.5px solid transparent;
    }
    .btn:active { transform: scale(0.97); }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 3px 10px rgba(99,102,241,.3);
    }
    .btn-primary:hover:not(:disabled) { opacity: .9; }
    .btn-primary:disabled { opacity: .55; cursor: not-allowed; }

    .btn-outline {
      background: transparent;
      color: var(--color-text-2);
      border-color: var(--color-border);
    }
    .btn-outline:hover { background: var(--color-surface-2); color: var(--color-text); }

    .btn-danger {
      background: #ef4444;
      color: #fff;
      border-color: transparent;
    }
    .btn-danger:hover { opacity: .9; }

    .btn-danger-outline {
      background: transparent;
      color: #ef4444;
      border: 1.5px solid #fca5a5;
      border-radius: 10px;
      font-weight: 600;
      font-size: var(--text-sm);
      cursor: pointer;
      padding: var(--space-2) var(--space-4);
      transition: background 0.15s;
      display: inline-flex;
      align-items: center;
    }
    .btn-danger-outline:hover { background: #fef2f2; }

    /* ── Spinner xs ──────────────────────────────────────────────────── */
    .spinner-xs {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modal ───────────────────────────────────────────────────────── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-box {
      background: #fff;
      border-radius: 20px;
      padding: var(--space-8);
      max-width: 380px;
      width: 90%;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: 0 24px 64px rgba(0,0,0,.18);
      animation: slideUp 0.2s ease both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .modal-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .logout-icon {
      background: #fef2f2;
      color: #ef4444;
    }

    .modal-box h3 {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
    }

    .modal-box p {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin: 0;
    }

    .modal-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }

    /* ── Fade-in page ────────────────────────────────────────────────── */
    .animate-fade-in-up {
      animation: fadeInUp 0.35s ease both;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SettingsComponent implements OnInit {
  readonly authService   = inject(AuthService);
  readonly notifService  = inject(NotificationService);
  private readonly router = inject(Router);

  activeSection    = signal<ActiveSection>('account');
  showLogoutConfirm = signal(false);
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
  }

  toggleInApp(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.notifService.updatePreferences({ inAppNotifications: checked });
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

  confirmLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  logout(): void {
    this.showLogoutConfirm.set(false);
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }

  deleteAccountPrompt(): void {
    // placeholder — wire to real endpoint when available
    alert('Account deletion is not yet available. Please contact support.');
  }
}
