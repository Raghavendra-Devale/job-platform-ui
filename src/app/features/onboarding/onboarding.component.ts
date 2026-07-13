import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ChipComponent } from '../../shared/components/chip/chip.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Skill, ResumeStatus } from '../../core/models/resume.models';

interface OnboardingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BadgeComponent,
    ChipComponent,
    LoadingComponent
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  isDragOver = signal(false);

  // Core onboarding status mapping
  status = signal<ResumeStatus>({
    hasResume: false,
    processingStatus: 'NOT_UPLOADED',
    parsedSkills: []
  });

  // Reusable Timeline steps
  timelineSteps = signal<OnboardingStep[]>([
    { id: 'upload', label: 'Uploaded', status: 'pending' },
    { id: 'extraction', label: 'Text Extraction', status: 'pending' },
    { id: 'parsing', label: 'Resume Parsing', status: 'pending' },
    { id: 'skills', label: 'Skill Extraction', status: 'pending' },
    { id: 'embedding', label: 'Embedding Generation', status: 'pending' },
    { id: 'completed', label: 'Completed', status: 'pending' }
  ]);

  constructor() {
    // If the user already has a resume on load, set state to READY
    if (this.authService.hasResume()) {
      const activeResume = this.authService.resumes().find(r => r.isActive) || this.authService.resumes()[0];
      this.status.set({
        hasResume: true,
        uploadedAt: activeResume?.updatedAt,
        processingStatus: 'READY',
        parsedSkills: [
          { name: 'Angular' },
          { name: 'TypeScript' },
          { name: 'JavaScript' },
          { name: 'CSS' },
          { name: 'HTML' }
        ],
        summary: {
          candidateName: this.authService.currentUser()?.name || 'Candidate',
          role: 'Software Engineer',
          experience: '2+ years',
          score: 92
        }
      });
    }
  }

  // ── File Handlers ───────────────────────────────────────────────────

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
      this.uploadFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const element = e.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.uploadFile(element.files[0]);
    }
  }

  // ── Upload & Simulation ─────────────────────────────────────────────

  private uploadFile(file: File): void {
    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.showError('File size exceeds limit of 5MB');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      this.toastService.showError('Only PDF, DOC, or DOCX formats are allowed');
      return;
    }

    // Set initial uploading state
    this.status.update(s => ({
      ...s,
      processingStatus: 'UPLOADING'
    }));

    this.authService.uploadResume(file).subscribe({
      next: () => {
        this.toastService.showSuccess('Resume uploaded successfully!');
        this.startAIProcessing();
      },
      error: (err) => {
        this.status.update(s => ({
          ...s,
          processingStatus: 'FAILED'
        }));
        this.toastService.showError(err.error?.error || 'Upload failed. Please try again.');
      }
    });
  }

  private startAIProcessing(): void {
    this.status.update(s => ({
      ...s,
      processingStatus: 'PROCESSING'
    }));

    // Reset steps
    this.timelineSteps.set(this.timelineSteps().map(step => ({ ...step, status: 'pending' })));

    // Progressive step simulation to guide first-time experience
    const steps = this.timelineSteps();
    let currentStepIndex = 0;

    const runNextStep = () => {
      if (currentStepIndex >= steps.length) {
        this.completeAIProcessing();
        return;
      }

      // Mark previous steps as completed
      this.timelineSteps.set(steps.map((step, idx) => {
        if (idx < currentStepIndex) return { ...step, status: 'completed' };
        if (idx === currentStepIndex) return { ...step, status: 'processing' };
        return { ...step, status: 'pending' };
      }));

      currentStepIndex++;
      setTimeout(runNextStep, 800);
    };

    runNextStep();
  }

  private completeAIProcessing(): void {
    // Set all steps completed
    this.timelineSteps.set(this.timelineSteps().map(step => ({ ...step, status: 'completed' })));

    // Generate simulated parser results based on user details
    const userName = this.authService.currentUser()?.name || 'Candidate';
    const mockSkills: Skill[] = [
      { name: 'Angular' },
      { name: 'TypeScript' },
      { name: 'REST APIs' },
      { name: 'Git' },
      { name: 'Node.js' }
    ];

    this.status.set({
      hasResume: true,
      uploadedAt: new Date().toISOString(),
      processingStatus: 'READY',
      parsedSkills: mockSkills,
      summary: {
        candidateName: userName,
        role: 'Frontend Developer',
        experience: '2 years',
        score: 92
      }
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────

  finishOnboarding(): void {
    this.toastService.showSuccess('Onboarding complete!');
    this.router.navigate(['/dashboard']);
  }
}
