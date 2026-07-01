import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobListResponse } from '../../core/models/job.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container profile-container animate-fade-in-up">
      <!-- Profile Header Grid -->
      <div class="profile-grid">
        <!-- Left Column: Avatar & Resume details -->
        <div class="left-col">
          <!-- Main Card: Profile Details -->
          <div class="card profile-card">
            <div class="avatar-section">
              <div class="profile-avatar">
                {{ getInitials(authService.currentUser()?.name) }}
              </div>
              <div class="user-meta">
                <h1 class="user-name">{{ authService.currentUser()?.name }}</h1>
                <p class="user-role-badge">
                  <span class="badge badge-blue">{{ authService.currentUser()?.role }}</span>
                </p>
                <p class="user-email">{{ authService.currentUser()?.email }}</p>
              </div>
            </div>
            <hr class="divider" />
            <div class="details-section">
              <div class="detail-item">
                <span class="detail-label">Member Since</span>
                <span class="detail-value">{{ formatDate(authService.currentUser()?.createdAt) }}</span>
              </div>
              <div class="detail-item" *ngIf="authService.currentUser()?.phone">
                <span class="detail-label">Phone</span>
                <span class="detail-value">{{ authService.currentUser()?.phone }}</span>
              </div>
              <div class="detail-item" *ngIf="authService.currentUser()?.location">
                <span class="detail-label">Location</span>
                <span class="detail-value">{{ authService.currentUser()?.location }}</span>
              </div>
            </div>
          </div>

          <!-- Resume Upload Card -->
          <div class="card resume-card">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Active Resume
            </h2>
            <p class="section-description">Manage your uploaded resumes and choose which one is active for job matching.</p>

            <!-- Current Active Resume Info -->
            <div class="current-resume-box" *ngIf="authService.currentUser()?.resumeFileName; else noResume">
              <div class="resume-info">
                <svg class="file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div class="file-meta">
                  <p class="file-name" [title]="authService.currentUser()?.resumeFileName || ''">{{ authService.currentUser()?.resumeFileName }}</p>
                  <p class="file-status">Currently active for job matches</p>
                </div>
              </div>
            </div>

            <ng-template #noResume>
              <div class="alert-box text-center">
                <p>No active resume selected yet.</p>
              </div>
            </ng-template>

            <!-- Manage Resumes Navigation Button -->
            <div style="margin-top: var(--space-2);">
              <a routerLink="/resumes" class="btn btn-outline" style="display: block; text-align: center; justify-content: center; width: 100%;">
                Manage Resumes
              </a>
            </div>
          </div>
        </div>

        <!-- Right Column: Settings & Forms -->
        <div class="card settings-card">
          <div class="tabs-header">
            <button class="tab-btn" [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Edit Profile</button>
            <button class="tab-btn" [class.active]="activeTab() === 'preferences'" (click)="activeTab.set('preferences')">Preferences</button>
            <button class="tab-btn" [class.active]="activeTab() === 'password'" (click)="activeTab.set('password')">Change Password</button>
          </div>

          <div class="tab-content">
            <!-- Edit Profile Tab -->
            <div *ngIf="activeTab() === 'profile'" class="tab-pane-content">
              <form (submit)="onUpdateProfile($event)">
                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label" for="profileName">Full Name</label>
                    <input type="text" id="profileName" class="form-input" [value]="profileName()" (input)="profileName.set($any($event.target).value)" required />
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label" for="profileEmail">Email Address</label>
                    <input type="email" id="profileEmail" class="form-input" [value]="profileEmail()" (input)="profileEmail.set($any($event.target).value)" required />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label" for="currentRole">Current Role</label>
                    <input type="text" id="currentRole" class="form-input" [value]="currentRole()" (input)="currentRole.set($any($event.target).value)" placeholder="e.g. Software Engineer" />
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label" for="experience">Years of Experience</label>
                    <input type="number" id="experience" class="form-input" [value]="experience()" (input)="experience.set($any($event.target).value ? +$any($event.target).value : null)" min="0" placeholder="e.g. 5" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label" for="phone">Phone Number</label>
                    <input type="tel" id="phone" class="form-input" [value]="phone()" (input)="phone.set($any($event.target).value)" placeholder="e.g. +1 (555) 019-2834" />
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label" for="location">Location</label>
                    <input type="text" id="location" class="form-input" [value]="location()" (input)="location.set($any($event.target).value)" placeholder="e.g. New York, NY" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="bio">Biography / Summary</label>
                  <textarea id="bio" class="form-input" [value]="bio()" (input)="bio.set($any($event.target).value)" rows="4" placeholder="Tell us about yourself..."></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="form-label" for="linkedin">LinkedIn Profile URL</label>
                    <input type="url" id="linkedin" class="form-input" [value]="linkedin()" (input)="linkedin.set($any($event.target).value)" placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div class="form-group col-4">
                    <label class="form-label" for="github">GitHub Profile URL</label>
                    <input type="url" id="github" class="form-input" [value]="github()" (input)="github.set($any($event.target).value)" placeholder="https://github.com/username" />
                  </div>
                  <div class="form-group col-4">
                    <label class="form-label" for="portfolio">Portfolio Website URL</label>
                    <input type="url" id="portfolio" class="form-input" [value]="portfolio()" (input)="portfolio.set($any($event.target).value)" placeholder="https://myportfolio.com" />
                  </div>
                </div>

                <div class="status-msg text-error" *ngIf="profileError()">{{ profileError() }}</div>
                <div class="status-msg text-success" *ngIf="profileSuccess()">{{ profileSuccess() }}</div>
                
                <div style="margin-top: var(--space-4);">
                  <button type="submit" class="btn btn-primary" [disabled]="profileLoading()">
                    <span class="spinner" *ngIf="profileLoading()"></span>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <!-- Preferences Tab -->
            <div *ngIf="activeTab() === 'preferences'" class="tab-pane-content">
              <form (submit)="onUpdatePreferences($event)">
                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label" for="preferredRoles">Preferred Roles</label>
                    <input type="text" id="preferredRoles" class="form-input" [value]="preferredRoles()" (input)="preferredRoles.set($any($event.target).value)" placeholder="e.g. Software Engineer, Tech Lead" />
                    <span style="font-size: var(--text-xs); color: var(--color-text-3);">Separate multiple roles with commas</span>
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label" for="preferredLocations">Preferred Locations</label>
                    <input type="text" id="preferredLocations" class="form-input" [value]="preferredLocations()" (input)="preferredLocations.set($any($event.target).value)" placeholder="e.g. San Francisco, New York" />
                    <span style="font-size: var(--text-xs); color: var(--color-text-3);">Separate multiple locations with commas</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label" for="workStyle">Preferred Work Style</label>
                    <select id="workStyle" class="form-input" [value]="workStyle()" (change)="workStyle.set($any($event.target).value)">
                      <option value="ANY">Any Style</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ONSITE">On-site</option>
                    </select>
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label" for="salaryRange">Salary Range</label>
                    <input type="text" id="salaryRange" class="form-input" [value]="salaryRange()" (input)="salaryRange.set($any($event.target).value)" placeholder="e.g. $100k-$130k or $120,000+" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Job Types Preferences</label>
                  <div style="display: flex; gap: var(--space-4); flex-wrap: wrap; margin-top: var(--space-2);">
                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm);">
                      <input type="checkbox" [checked]="jobTypesFullTime()" (change)="jobTypesFullTime.set($any($event.target).checked)" style="accent-color: var(--color-primary);" />
                      Full-time
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm);">
                      <input type="checkbox" [checked]="jobTypesPartTime()" (change)="jobTypesPartTime.set($any($event.target).checked)" style="accent-color: var(--color-primary);" />
                      Part-time
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm);">
                      <input type="checkbox" [checked]="jobTypesContract()" (change)="jobTypesContract.set($any($event.target).checked)" style="accent-color: var(--color-primary);" />
                      Contract
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm);">
                      <input type="checkbox" [checked]="jobTypesInternship()" (change)="jobTypesInternship.set($any($event.target).checked)" style="accent-color: var(--color-primary);" />
                      Internship
                    </label>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-6); flex-wrap: wrap; margin-top: var(--space-2);">
                  <div class="form-group checkbox-group" style="margin-bottom: 0;">
                    <input type="checkbox" id="remoteOnly" [checked]="remoteOnly()" (change)="remoteOnly.set($any($event.target).checked)" />
                    <label for="remoteOnly" class="checkbox-label">Remote Only Positions</label>
                  </div>
                  <div class="form-group checkbox-group" style="margin-bottom: 0;">
                    <input type="checkbox" id="emailAlerts" [checked]="emailAlerts()" (change)="emailAlerts.set($any($event.target).checked)" />
                    <label for="emailAlerts" class="checkbox-label">Enable Email Job Alerts</label>
                  </div>
                </div>

                <div class="status-msg text-error" *ngIf="prefError()" style="margin-top: var(--space-4);">{{ prefError() }}</div>
                <div class="status-msg text-success" *ngIf="prefSuccess()" style="margin-top: var(--space-4);">{{ prefSuccess() }}</div>
                
                <div style="margin-top: var(--space-4);">
                  <button type="submit" class="btn btn-primary" [disabled]="prefLoading()">
                    <span class="spinner" *ngIf="prefLoading()"></span>
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>

            <!-- Change Password Tab -->
            <div *ngIf="activeTab() === 'password'" class="tab-pane-content">
              <form (submit)="onChangePassword($event)">
                <div class="form-group">
                  <label class="form-label" for="currentPassword">Current Password</label>
                  <input type="password" id="currentPassword" class="form-input" [value]="currentPassword()" (input)="currentPassword.set($any($event.target).value)" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="newPassword">New Password</label>
                  <input type="password" id="newPassword" class="form-input" [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="confirmPassword">Confirm New Password</label>
                  <input type="password" id="confirmPassword" class="form-input" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" required />
                </div>
                <div class="status-msg text-error" *ngIf="passwordError()">{{ passwordError() }}</div>
                <div class="status-msg text-success" *ngIf="passwordSuccess()">{{ passwordSuccess() }}</div>
                <button type="submit" class="btn btn-primary" [disabled]="passwordLoading()">
                  <span class="spinner" *ngIf="passwordLoading()"></span>
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved & Recent View Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Recently Viewed Jobs -->
        <div class="card recent-jobs-card">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Recently Viewed Jobs
          </h2>
          <div class="jobs-list" *ngIf="recentJobs().length > 0; else noRecent">
            <div class="job-list-item" *ngFor="let job of recentJobs()">
              <div class="job-item-details">
                <a [routerLink]="['/jobs', job.id]" class="job-item-title">{{ job.title }}</a>
                <p class="job-item-company">{{ job.company }} &bull; {{ job.location }}</p>
              </div>
              <span [class]="getSourceClass(job.source)">{{ job.source }}</span>
            </div>
          </div>
          <ng-template #noRecent>
            <div class="empty-list-box text-center">
              <p>You haven't viewed any jobs recently.</p>
              <a routerLink="/jobs" class="btn btn-outline btn-sm mt-3">Browse Jobs</a>
            </div>
          </ng-template>
        </div>

        <!-- Saved Jobs Sneak Peak -->
        <div class="card saved-jobs-card">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Saved Jobs
          </h2>
          <div class="jobs-list" *ngIf="savedJobs().length > 0; else noSaved">
            <div class="job-list-item" *ngFor="let job of savedJobs().slice(0, 5)">
              <div class="job-item-details">
                <a [routerLink]="['/jobs', job.id]" class="job-item-title">{{ job.title }}</a>
                <p class="job-item-company">{{ job.company }} &bull; {{ job.location }}</p>
              </div>
              <button class="btn btn-ghost btn-sm btn-icon" (click)="unsaveJob(job.id)" title="Unsave job">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <div class="view-all-link-box" *ngIf="savedJobs().length > 5">
              <a routerLink="/saved-jobs" class="view-all-link">View all {{ savedJobs().length }} saved jobs &rarr;</a>
            </div>
          </div>
          <ng-template #noSaved>
            <div class="empty-list-box text-center">
              <p>You haven't bookmarked any jobs yet.</p>
              <a routerLink="/jobs" class="btn btn-outline btn-sm mt-3">Find Jobs</a>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: var(--space-8) auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      padding: 0 var(--space-4);
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: var(--space-6);
      align-items: start;
    }

    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    .left-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    /* Profile Details Card */
    .profile-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-2);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff;
      font-size: var(--text-2xl);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow);
    }

    .user-name {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-1);
    }

    .user-role-badge {
      margin-bottom: var(--space-2);
    }

    .user-email {
      font-size: var(--text-sm);
      color: var(--color-text-2);
    }

    .details-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
    }

    .detail-label {
      color: var(--color-text-3);
    }

    .detail-value {
      font-weight: 500;
      color: var(--color-text-2);
    }

    /* Resume Card */
    .resume-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .section-title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .section-description {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin-bottom: var(--space-2);
    }

    .current-resume-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      background: var(--color-primary-light);
      border: 1px solid var(--color-primary-muted);
      border-radius: var(--radius);
      gap: var(--space-2);
    }

    .resume-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-width: 0;
    }

    .file-icon {
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .file-meta {
      min-width: 0;
    }

    .file-name {
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--color-text);
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-status {
      font-size: var(--text-xs);
      color: var(--color-primary);
    }

    .resume-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .btn-danger {
      color: var(--color-danger);
      background: transparent;
      border: 1px solid var(--color-danger);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
    }

    .btn-danger:hover {
      background: var(--color-danger-light);
    }

    .alert-box {
      padding: var(--space-4);
      background: var(--color-surface-2);
      border-radius: var(--radius);
      color: var(--color-text-2);
      font-size: var(--text-sm);
    }

    /* Drag and Drop zone */
    .drag-drop-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      text-align: center;
      cursor: pointer;
      transition: background var(--transition), border-color var(--transition);
      background: var(--color-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .drag-drop-zone:hover, .drag-drop-zone.dragover {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
    }

    .upload-icon {
      color: var(--color-text-3);
      transition: color var(--transition);
    }

    .drag-drop-zone:hover .upload-icon, .drag-drop-zone.dragover .upload-icon {
      color: var(--color-primary);
    }

    .upload-text {
      font-size: var(--text-sm);
      color: var(--color-text);
    }

    .upload-subtext {
      font-size: var(--text-xs);
      color: var(--color-text-3);
    }

    .upload-status {
      font-size: var(--text-sm);
      margin-top: var(--space-1);
    }

    .text-error { color: var(--color-danger); font-weight: 500; }
    .text-success { color: var(--color-success); font-weight: 500; }

    /* Settings Card & Tabs */
    .settings-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      min-height: 400px;
    }

    .tabs-header {
      display: flex;
      border-bottom: 2px solid var(--color-border);
      gap: var(--space-6);
    }

    .tab-btn {
      background: none;
      border: none;
      padding: var(--space-3) 0;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text-3);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color var(--transition), border-color var(--transition);
      margin-bottom: -2px;
    }

    .tab-btn:hover, .tab-btn.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

    .tab-pane-content {
      padding-top: var(--space-3);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .form-label {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-2);
    }

    .form-input {
      padding: var(--space-2.5) var(--space-3.5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-bg);
      color: var(--color-text);
      font-size: var(--text-sm);
      transition: border-color var(--transition), box-shadow var(--transition);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-1);
      margin-bottom: var(--space-5);
    }

    .checkbox-group input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-primary);
      cursor: pointer;
    }

    .checkbox-label {
      font-size: var(--text-sm);
      color: var(--color-text);
      cursor: pointer;
      user-select: none;
    }

    .form-row {
      display: flex;
      gap: var(--space-4);
    }
    .col-6 { flex: 1; min-width: 0; }
    .col-4 { flex: 1; min-width: 0; }
    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
    }

    .status-msg {
      font-size: var(--text-sm);
      margin-bottom: var(--space-4);
      font-weight: 500;
    }

    /* Dashboard grids */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .recent-jobs-card, .saved-jobs-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .job-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      transition: transform var(--transition);
    }

    .job-list-item:hover {
      transform: translateX(3px);
    }

    .job-item-details {
      min-width: 0;
    }

    .job-item-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-item-title:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }

    .job-item-company {
      font-size: var(--text-xs);
      color: var(--color-text-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-list-box {
      padding: var(--space-8) var(--space-4);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-3);
      font-size: var(--text-sm);
    }

    .btn-icon {
      padding: var(--space-2);
      border-radius: var(--radius-full);
      color: var(--color-danger);
      background: var(--color-danger-light);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon:hover {
      background: #fecaca;
    }

    .view-all-link-box {
      text-align: right;
      padding-top: var(--space-1);
    }

    .view-all-link {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-primary);
    }

    .badge-purple { background: #ede9fe; color: #7c3aed; }
    .badge-teal { background: #ccfbf1; color: #0f766e; }
    .badge-slate { background: var(--color-surface-2); color: var(--color-text-2); }

    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid var(--color-primary-muted);
      border-top-color: var(--color-primary);
      border-radius: var(--radius-full);
      animation: spin 1s infinite linear;
      margin-right: 5px;
      vertical-align: middle;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .mt-3 { margin-top: var(--space-3); }
    .text-center { text-align: center; }
  `],
})
export class UserProfileComponent implements OnInit {
  readonly authService = inject(AuthService);

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
      },
      error: () => console.error('Failed to unsave job')
    });
  }
}
