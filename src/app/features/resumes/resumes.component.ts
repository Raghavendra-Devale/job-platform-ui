import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Resume } from '../../core/models/resume.models';

@Component({
  selector: 'app-resumes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container resumes-container animate-fade-in-up">
      <!-- Header -->
      <div class="header-section">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Manage Resumes
        </h1>
        <p class="page-description">Maintain up to 4 resumes and select which one is active for job matches and applications.</p>
      </div>

      <!-- Main Layout Grid -->
      <div class="resumes-grid">
        
        <!-- Left: Upload Section -->
        <div class="upload-sidebar">
          <div class="card upload-card">
            <h3 class="card-title">Upload Resume</h3>
            
            <ng-container *ngIf="resumes().length < 4; else limitReached">
              <!-- Drag and Drop Area -->
              <div
                class="drag-drop-zone"
                [class.dragover]="isDragOver()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()">
                <input type="file" #fileInput class="sr-only" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" />
                <svg class="upload-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p class="upload-text">
                  <strong>Click to upload</strong> or drag & drop
                </p>
                <p class="upload-subtext">PDF, DOC, or DOCX up to 5MB</p>
              </div>

              <!-- Upload Status -->
              <div class="upload-status" *ngIf="uploadLoading() || uploadError() || uploadSuccess()">
                <div class="loading-spinner-wrapper" *ngIf="uploadLoading()">
                  <span class="spinner"></span> Uploading...
                </div>
                <p class="text-error" *ngIf="uploadError()">{{ uploadError() }}</p>
                <p class="text-success" *ngIf="uploadSuccess()">{{ uploadSuccess() }}</p>
              </div>
            </ng-container>

            <ng-template #limitReached>
              <div class="alert-box warning-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <p class="font-semibold">Maximum limit reached</p>
                  <p class="text-xs">You have uploaded the maximum allowance of 4 resumes. Delete an existing resume to upload a new one.</p>
                </div>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Right: Resumes List -->
        <div class="resumes-list-area">
          <div class="loading-state text-center" *ngIf="loading()">
            <span class="spinner-large"></span> Loading resumes...
          </div>

          <div class="error-state alert-box" *ngIf="error()">
            {{ error() }}
          </div>

          <div class="resumes-list" *ngIf="!loading() && !error()">
            <div class="resumes-count-badge">
              Resumes uploaded: <strong>{{ resumes().length }} / 4</strong>
            </div>

            <div *ngIf="resumes().length > 0; else noResumes" class="cards-grid">
              
              <!-- Resume Card -->
              <div class="card resume-item-card" *ngFor="let resume of resumes()" [class.active-card]="resume.isActive">
                <div class="card-inner">
                  
                  <div class="resume-meta">
                    <div class="file-icon-wrapper">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div class="resume-details">
                      <div class="name-badge-row">
                        <h4 class="resume-name" [title]="resume.resumeName">{{ resume.resumeName }}</h4>
                        <span class="badge badge-active" *ngIf="resume.isActive">Active</span>
                      </div>
                      <p class="updated-time">Updated on {{ formatDate(resume.updatedAt) }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="resume-actions">
                    <button class="btn btn-outline btn-sm btn-icon-text" (click)="downloadResume(resume)" title="Download Resume">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                    
                    <button class="btn btn-outline btn-sm" (click)="openRenameModal(resume)" title="Rename Resume">
                      Rename
                    </button>
                    
                    <button class="btn btn-danger btn-outline btn-sm" (click)="deleteResume(resume)" title="Delete Resume">
                      Delete
                    </button>

                    <button class="btn btn-primary btn-sm btn-activate" *ngIf="!resume.isActive" (click)="activateResume(resume)">
                      Activate
                    </button>
                  </div>

                </div>
              </div>

            </div>

            <ng-template #noResumes>
              <div class="card empty-card text-center">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <h2>No Resumes Uploaded</h2>
                <p>You haven't uploaded any resumes yet. Use the upload area on the left to add your first resume (will be set as active automatically).</p>
              </div>
            </ng-template>
          </div>
        </div>

      </div>
    </div>

    <!-- Custom Rename Dialog Modal -->
    <div class="modal-backdrop" *ngIf="showRenameModal()">
      <div class="modal-card animate-fade-in-up">
        <h3 class="modal-title">Rename Resume</h3>
        <p class="modal-description">Enter a new name for your resume file. The original extension will be preserved automatically.</p>
        
        <div class="form-group">
          <label class="form-label" for="newResumeName">Resume Name</label>
          <input
            type="text"
            id="newResumeName"
            class="form-input"
            [value]="renameValue()"
            (input)="renameValue.set($any($event.target).value)"
            (keyup.enter)="submitRename()"
            placeholder="e.g. Software_Developer_Resume"
            required
            #renameInput />
        </div>

        <p class="text-error text-xs" *ngIf="renameError()">{{ renameError() }}</p>

        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" (click)="closeRenameModal()" [disabled]="renameLoading()">Cancel</button>
          <button class="btn btn-primary btn-sm" (click)="submitRename()" [disabled]="renameLoading()">
            <span class="spinner" *ngIf="renameLoading()"></span>
            Rename
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resumes-container {
      max-width: 1000px;
      margin: var(--space-8) auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding: 0 var(--space-4);
    }

    .header-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      margin-bottom: var(--space-2);
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: 800;
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .page-description {
      font-size: var(--text-sm);
      color: var(--color-text-2);
    }

    /* Main Grid */
    .resumes-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-6);
      align-items: start;
    }

    @media (max-width: 768px) {
      .resumes-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar / Upload */
    .upload-sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .upload-card {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-text);
    }

    /* Drag and Drop Zone */
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
      margin-top: var(--space-2);
    }

    .text-error { color: var(--color-danger); font-weight: 500; }
    .text-success { color: var(--color-success); font-weight: 500; }

    /* Limit Warning */
    .alert-box {
      padding: var(--space-4);
      border-radius: var(--radius);
      font-size: var(--text-sm);
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .warning-box {
      background: var(--color-warning-light);
      color: var(--color-warning);
      border: 1px solid rgba(217, 119, 6, 0.2);
    }

    .alert-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .font-semibold {
      font-weight: 600;
    }

    /* Resumes List Area */
    .resumes-list-area {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .resumes-count-badge {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      margin-bottom: var(--space-1);
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    /* Resume Card */
    .resume-item-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
    }

    .resume-item-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-border-focus);
    }

    .resume-item-card.active-card {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
      box-shadow: var(--shadow-sm);
    }

    .card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
    }

    @media (max-width: 640px) {
      .card-inner {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-4);
      }
      .resume-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .resume-meta {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      min-width: 0;
      flex: 1;
    }

    .file-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius);
      background: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--color-text-2);
      border: 1px solid var(--color-border);
    }

    .active-card .file-icon-wrapper {
      background: var(--color-primary-muted);
      color: var(--color-primary);
      border-color: transparent;
    }

    .resume-details {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-0.5);
    }

    .name-badge-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-width: 0;
    }

    .resume-name {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }

    .badge-active {
      background: var(--color-success);
      color: #fff;
      font-size: var(--text-xs);
      font-weight: 600;
      padding: var(--space-0.5) var(--space-2);
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .updated-time {
      font-size: var(--text-xs);
      color: var(--color-text-3);
    }

    .active-card .updated-time {
      color: var(--color-primary);
    }

    .resume-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .btn-icon-text {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .btn-activate {
      font-weight: 600;
    }

    .empty-card {
      padding: var(--space-12) var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .empty-icon {
      width: 72px; height: 72px;
      border-radius: var(--radius-full);
      background: var(--color-surface-2);
      color: var(--color-text-3);
      display: flex; align-items: center; justify-content: center;
    }

    .empty-card h2 {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
    }

    .empty-card p {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      max-width: 440px;
    }

    /* Modal dialog styles */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      background: #fff;
      border-radius: var(--radius-md);
      padding: var(--space-6);
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      border: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
      margin: 0;
    }

    .modal-description {
      font-size: var(--text-xs);
      color: var(--color-text-2);
      margin: 0;
      line-height: 1.5;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1.5);
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
      width: 100%;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-1);
    }

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

    .spinner-large {
      display: inline-block;
      width: 28px; height: 28px;
      border: 3px solid var(--color-primary-muted);
      border-top-color: var(--color-primary);
      border-radius: 999px;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .text-center { text-align: center; }
    .text-xs { font-size: var(--text-xs); }
  `],
})
export class ResumesComponent implements OnInit {
  private readonly authService = inject(AuthService);

  resumes = signal<Resume[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  isDragOver = signal(false);

  // Upload state
  uploadLoading = signal(false);
  uploadError   = signal<string | null>(null);
  uploadSuccess = signal<string | null>(null);

  // Rename modal state
  showRenameModal = signal(false);
  renameValue     = signal('');
  renameError     = signal<string | null>(null);
  renameLoading   = signal(false);
  selectedResume  = signal<Resume | null>(null);

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.authService.getResumes().subscribe({
      next: (data) => {
        this.resumes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load resumes', err);
        this.error.set('Failed to fetch your resumes. Please try again.');
        this.loading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────

  downloadResume(resume: Resume): void {
    this.authService.downloadResume(resume.id, resume.resumeName);
  }

  activateResume(resume: Resume): void {
    this.authService.activateResume(resume.id).subscribe({
      next: () => {
        // Toggle active local states
        this.resumes.set(this.resumes().map(r => ({
          ...r,
          isActive: r.id === resume.id
        })));
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to activate resume. Please try again.');
      }
    });
  }

  deleteResume(resume: Resume): void {
    if (confirm(`Are you sure you want to delete "${resume.resumeName}"?`)) {
      this.authService.deleteResume(resume.id).subscribe({
        next: () => {
          this.resumes.set(this.resumes().filter(r => r.id !== resume.id));
          // If the deleted resume was active, reload list because backend auto-activated another
          if (resume.isActive) {
            this.loading.set(true);
            this.loadResumes();
          }
        },
        error: (err) => {
          alert(err.error?.error || 'Failed to delete resume. Please try again.');
        }
      });
    }
  }

  // ── Rename Modal ─────────────────────────────────────────────────────

  openRenameModal(resume: Resume): void {
    this.selectedResume.set(resume);
    // Remove the extension from name for cleaner editing
    let nameWithoutExt = resume.resumeName;
    const lastDot = resume.resumeName.lastIndexOf('.');
    if (lastDot !== -1) {
      nameWithoutExt = resume.resumeName.substring(0, lastDot);
    }
    this.renameValue.set(nameWithoutExt);
    this.renameError.set(null);
    this.showRenameModal.set(true);
  }

  closeRenameModal(): void {
    this.showRenameModal.set(false);
    this.selectedResume.set(null);
    this.renameValue.set('');
    this.renameError.set(null);
  }

  submitRename(): void {
    const resume = this.selectedResume();
    const newName = this.renameValue().trim();
    if (!resume) return;

    if (!newName) {
      this.renameError.set('Name cannot be empty.');
      return;
    }

    this.renameLoading.set(true);
    this.renameError.set(null);

    this.authService.renameResume(resume.id, newName).subscribe({
      next: (updatedResume: Resume) => {
        this.resumes.set(this.resumes().map(r => r.id === resume.id ? { ...r, resumeName: updatedResume.resumeName } : r));
        this.renameLoading.set(false);
        this.closeRenameModal();
      },
      error: (err) => {
        this.renameError.set(err.error?.error || 'Failed to rename resume.');
        this.renameLoading.set(false);
      }
    });
  }

  // ── Drag & Drop Uploader ─────────────────────────────────────────────

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.handleResumeFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const element = e.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.handleResumeFile(element.files[0]);
    }
  }

  handleResumeFile(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.setUploadState(null, 'File size exceeds maximum size limit of 5MB', null);
      return;
    }

    const acceptedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtension = ['pdf', 'doc', 'docx'].includes(extension || '');

    if (!acceptedMimes.includes(file.type) && !validExtension) {
      this.setUploadState(null, 'Only PDF and Word documents are allowed', null);
      return;
    }

    this.uploadLoading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    this.authService.uploadResume(file).subscribe({
      next: () => {
        this.setUploadState('Resume uploaded successfully!', null, false);
        // Reload resumes list from backend to include the new upload
        this.loadResumes();
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to upload resume. Please try again.';
        this.setUploadState(null, errorMsg, false);
      }
    });
  }

  private setUploadState(success: string | null, error: string | null, loading: boolean | null): void {
    if (success) this.uploadSuccess.set(success);
    if (error) this.uploadError.set(error);
    if (loading !== null) this.uploadLoading.set(loading);
  }
}
