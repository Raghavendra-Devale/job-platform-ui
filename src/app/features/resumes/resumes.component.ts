import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Resume } from '../../core/models/resume.models';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationModalService } from '../../core/services/confirmation-modal.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-resumes',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonCardComponent],
  templateUrl: './resumes.component.html',
  styleUrls: ['./resumes.component.css'],
})
export class ResumesComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationModalService);
  private readonly loadingService = inject(LoadingService);

  resumes = signal<Resume[]>([]);
  loading = computed(() => this.loadingService.isLoading() && this.resumes().length === 0);
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
      },
      error: (err) => {
        console.error('Failed to load resumes', err);
        this.error.set('Failed to fetch your resumes. Please try again.');
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
    this.toastService.showSuccess(`Downloading "${resume.resumeName}"`);
  }

  activateResume(resume: Resume): void {
    this.authService.activateResume(resume.id).subscribe({
      next: () => {
        // Toggle active local states
        this.resumes.set(this.resumes().map(r => ({
          ...r,
          isActive: r.id === resume.id
        })));
        this.toastService.showSuccess(`"${resume.resumeName}" is now active`);
      },
      error: (err) => {
        const msg = err.error?.error || 'Failed to activate resume. Please try again.';
        this.toastService.showError(msg);
      }
    });
  }

  async deleteResume(resume: Resume): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Resume',
      message: `Are you sure you want to permanently delete "${resume.resumeName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (!confirmed) return;

    this.authService.deleteResume(resume.id).subscribe({
      next: () => {
        this.resumes.set(this.resumes().filter(r => r.id !== resume.id));
        this.toastService.showSuccess('Resume deleted successfully');
        // If the deleted resume was active, reload list because backend auto-activated another
        if (resume.isActive) {
          this.loadResumes();
        }
      },
      error: (err) => {
        const msg = err.error?.error || 'Failed to delete resume. Please try again.';
        this.toastService.showError(msg);
      }
    });
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
        this.toastService.showSuccess('Resume renamed successfully');
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
      this.toastService.showError('File exceeds maximum size limit of 5MB');
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
      this.toastService.showError('Only PDF, DOC, or DOCX formats are allowed');
      return;
    }

    this.uploadLoading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    this.authService.uploadResume(file).subscribe({
      next: () => {
        this.setUploadState('Resume uploaded successfully!', null, false);
        this.toastService.showSuccess('Resume uploaded successfully');
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
