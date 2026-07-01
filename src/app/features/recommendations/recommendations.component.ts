import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecommendationService } from '../../core/services/recommendation.service';
import { JobRecommendation } from '../../core/models/recommendation.models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="rec-page animate-fade-in-up">

      <!-- ── Page Header ── -->
      <div class="rec-header">
        <div class="header-left">
          <div class="header-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Job Recommendations</h1>
            <p class="page-subtitle">
              Personalized matches based on your resume &amp; profile.
              <span class="ai-pill">AI-powered — coming soon</span>
            </p>
          </div>
        </div>

        <div class="header-stat" *ngIf="!loading() && !error()">
          <span class="stat-number">{{ recommendations().length }}</span>
          <span class="stat-label">Matches found</span>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div class="loading-state" *ngIf="loading()">
        <div class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5]">
            <div class="sk sk-score"></div>
            <div class="sk sk-title"></div>
            <div class="sk sk-company"></div>
            <div class="sk sk-chips">
              <div class="sk sk-chip"></div>
              <div class="sk sk-chip"></div>
              <div class="sk sk-chip"></div>
            </div>
            <div class="sk sk-reason"></div>
          </div>
        </div>
      </div>

      <!-- ── Error ── -->
      <div class="error-box" *ngIf="error() && !loading()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error() }}
      </div>

      <!-- ── Cards Grid ── -->
      <div class="rec-grid" *ngIf="!loading() && !error()">

        <!-- Recommendation Card -->
        <div
          class="rec-card"
          *ngFor="let rec of recommendations(); let i = index"
          [class.top-match]="rec.matchScore >= 85"
          [style.animation-delay]="(i * 60) + 'ms'"
        >
          <!-- Top Match ribbon -->
          <div class="top-match-ribbon" *ngIf="rec.matchScore >= 85">⭐ Top Match</div>

          <!-- Score ring + header -->
          <div class="card-top">
            <div class="score-ring" [class]="getScoreClass(rec.matchScore)" [attr.aria-label]="rec.matchScore + '% match'">
              <svg class="ring-svg" viewBox="0 0 64 64">
                <circle class="ring-bg"   cx="32" cy="32" r="26" />
                <circle class="ring-fill" cx="32" cy="32" r="26"
                  [style.stroke-dasharray]="getCircumference()"
                  [style.stroke-dashoffset]="getDashOffset(rec.matchScore)"
                />
              </svg>
              <span class="score-text">{{ rec.matchScore }}%</span>
            </div>

            <div class="card-header-info">
              <h2 class="rec-title">{{ rec.jobTitle }}</h2>
              <p class="rec-company">{{ rec.company }}</p>
              <p class="rec-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ rec.location }}
              </p>
            </div>
          </div>

          <!-- Matched Skills -->
          <div class="section">
            <p class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Matched Skills
            </p>
            <div class="skill-chips">
              <span class="skill-chip" *ngFor="let skill of rec.matchedSkills">{{ skill }}</span>
            </div>
          </div>

          <!-- Reason -->
          <div class="section">
            <p class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Why this role?
            </p>
            <p class="reason-text">{{ rec.reason }}</p>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <a *ngIf="rec.applyUrl" [href]="rec.applyUrl" target="_blank" rel="noopener" class="btn btn-primary btn-sm" [id]="'btn-apply-' + rec.id">
              Apply Now
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
            <button class="btn btn-outline btn-sm btn-no-apply" *ngIf="!rec.applyUrl" disabled>No Apply Link</button>
            <button class="btn btn-ghost btn-sm" [id]="'btn-save-' + rec.id" title="Save job" (click)="saveJob(rec)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Save
            </button>
          </div>
        </div>

      </div>

      <!-- ── Empty State ── -->
      <div class="empty-state" *ngIf="!loading() && !error() && recommendations().length === 0">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h2>No recommendations yet</h2>
        <p>Upload a resume and complete your profile so we can find the best matches for you.</p>
        <a routerLink="/resumes" class="btn btn-primary">Upload Resume</a>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout ───────────────────────────────────────────────────────── */
    .rec-page {
      max-width: 1100px;
      margin: var(--space-8) auto;
      padding: 0 var(--space-4) var(--space-12);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    /* ── Header ───────────────────────────────────────────────────────── */
    .rec-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .header-icon-wrap {
      width: 52px; height: 52px;
      border-radius: var(--radius-lg, 14px);
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 20px rgba(99,102,241,.35);
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
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .ai-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      font-size: 11px;
      font-weight: 700;
      border-radius: 99px;
      padding: 2px 8px;
      letter-spacing: .02em;
      border: 1px solid #fbbf24;
    }

    .header-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border-radius: 14px;
      padding: var(--space-3) var(--space-6);
      box-shadow: 0 4px 14px rgba(99,102,241,.3);
      min-width: 90px;
    }

    .stat-number {
      font-size: var(--text-2xl);
      font-weight: 800;
      line-height: 1;
    }

    .stat-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .07em;
      opacity: .85;
      margin-top: 3px;
    }

    /* ── Cards Grid ───────────────────────────────────────────────────── */
    .rec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: var(--space-5);
      align-items: start;
    }

    @media (max-width: 680px) {
      .rec-grid { grid-template-columns: 1fr; }
    }

    /* ── Card ─────────────────────────────────────────────────────────── */
    .rec-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 18px;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: cardIn 0.4s ease both;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }

    .rec-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(99,102,241,.12), 0 4px 12px rgba(0,0,0,.06);
    }

    .rec-card.top-match {
      border-color: #a5b4fc;
      background: linear-gradient(160deg, #fafbff 0%, #f5f3ff 100%);
    }

    .top-match-ribbon {
      position: absolute;
      top: 14px; right: -22px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 30px;
      transform: rotate(35deg);
      letter-spacing: .04em;
      box-shadow: 0 2px 8px rgba(99,102,241,.4);
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Card Top (Score + Info) ───────────────────────────────────────── */
    .card-top {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
    }

    /* ── Score Ring ────────────────────────────────────────────────────── */
    .score-ring {
      position: relative;
      flex-shrink: 0;
      width: 64px; height: 64px;
    }

    .ring-svg {
      width: 64px; height: 64px;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 5;
    }

    .ring-fill {
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s ease;
    }

    /* Score colour tiers */
    .score-high  .ring-fill { stroke: #22c55e; }
    .score-good  .ring-fill { stroke: #6366f1; }
    .score-mid   .ring-fill { stroke: #f59e0b; }
    .score-low   .ring-fill { stroke: #ef4444; }

    .score-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text);
    }

    /* ── Card Header Info ───────────────────────────────────────────────── */
    .card-header-info {
      flex: 1;
      min-width: 0;
    }

    .rec-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 2px;
      line-height: 1.3;
    }

    .rec-company {
      font-size: var(--text-sm);
      font-weight: 600;
      color: #6366f1;
      margin: 0 0 4px;
    }

    .rec-location {
      font-size: var(--text-xs);
      color: var(--color-text-2);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ── Sections ────────────────────────────────────────────────────── */
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--color-text-2);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* ── Skill Chips ──────────────────────────────────────────────────── */
    .skill-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    .skill-chip {
      background: linear-gradient(135deg, #eef2ff, #f5f3ff);
      color: #4f46e5;
      border: 1px solid #c7d2fe;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      transition: background 0.15s, transform 0.1s;
    }

    .skill-chip:hover {
      background: #6366f1;
      color: #fff;
      border-color: #6366f1;
      transform: scale(1.04);
    }

    /* ── Reason ──────────────────────────────────────────────────────── */
    .reason-text {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      line-height: 1.55;
      margin: 0;
      background: var(--color-surface-2, #f9fafb);
      border-left: 3px solid #a5b4fc;
      border-radius: 0 8px 8px 0;
      padding: var(--space-2) var(--space-3);
      font-style: italic;
    }

    /* ── Actions ──────────────────────────────────────────────────────── */
    .card-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    /* ── Buttons ──────────────────────────────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      border-radius: var(--radius, 8px);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s, background 0.15s;
    }
    .btn:active { transform: scale(0.97); }

    .btn-sm {
      font-size: var(--text-xs);
      padding: var(--space-2) var(--space-3);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      border: none;
      box-shadow: 0 3px 10px rgba(99,102,241,.3);
    }
    .btn-primary:hover { opacity: .9; }

    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border: 1.5px solid var(--color-primary-muted, #c7d2fe);
    }
    .btn-outline:hover { background: var(--color-primary-light, #eef2ff); }

    .btn-ghost {
      background: var(--color-surface-2, #f9fafb);
      color: var(--color-text-2);
      border: 1px solid var(--color-border);
    }
    .btn-ghost:hover { background: #e5e7eb; color: var(--color-text); }

    .btn-no-apply { opacity: .5; cursor: not-allowed; }

    /* ── Skeleton Loading ─────────────────────────────────────────────── */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: var(--space-5);
    }

    @media (max-width: 680px) { .skeleton-grid { grid-template-columns: 1fr; } }

    .skeleton-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 18px;
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .sk {
      border-radius: 8px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    .sk-score  { width: 64px; height: 64px; border-radius: 50%; }
    .sk-title  { height: 20px; width: 75%; }
    .sk-company{ height: 14px; width: 50%; }
    .sk-reason { height: 48px; width: 100%; }
    .sk-chips  { display: flex; gap: 6px; }
    .sk-chip   { height: 22px; width: 70px; border-radius: 99px; }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── Error ────────────────────────────────────────────────────────── */
    .error-box {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 12px;
      padding: var(--space-4) var(--space-5);
      font-size: var(--text-sm);
    }

    /* ── Empty State ─────────────────────────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .empty-icon {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #eef2ff, #f5f3ff);
      color: #6366f1;
      display: flex; align-items: center; justify-content: center;
    }

    .empty-state h2 {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }

    .empty-state p {
      font-size: var(--text-sm);
      color: var(--color-text-2);
      max-width: 400px;
      line-height: 1.6;
      margin: 0;
    }

    /* ── Fade-in animation hook ─────────────────────────────────────── */
    .animate-fade-in-up {
      animation: fadeInUp 0.4s ease both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RecommendationsComponent implements OnInit {
  private readonly recService = inject(RecommendationService);

  recommendations = signal<JobRecommendation[]>([]);
  loading         = signal(true);
  error           = signal<string | null>(null);

  private readonly CIRCUMFERENCE = 2 * Math.PI * 26; // r=26

  ngOnInit(): void {
    this.recService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load recommendations. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  getCircumference(): number {
    return this.CIRCUMFERENCE;
  }

  /** Stroke-dashoffset so the ring fills proportionally to the match score */
  getDashOffset(score: number): number {
    return this.CIRCUMFERENCE * (1 - score / 100);
  }

  /** CSS class for score ring colour */
  getScoreClass(score: number): string {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }

  saveJob(rec: JobRecommendation): void {
    // TODO: wire to authService.saveJob() when backend is ready
    console.log('Save job:', rec.id);
  }
}
