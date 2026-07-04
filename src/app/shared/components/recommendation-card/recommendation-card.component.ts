import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobRecommendation } from '../../../core/models/recommendation.models';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-card.component.html',
  styleUrls: ['./recommendation-card.component.css'],
})
export class RecommendationCardComponent {
  @Input() recommendation!: JobRecommendation;
  @Input() isLoading = false;
  @Output() save = new EventEmitter<JobRecommendation>();

  onSave(): void {
    this.save.emit(this.recommendation);
  }

  onApply(): void {
    if (this.recommendation.applyUrl) {
      window.open(this.recommendation.applyUrl, '_blank', 'noopener,noreferrer');
    }
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'badge-green';
    if (score >= 70) return 'badge-blue';
    if (score >= 50) return 'badge-amber';
    return 'badge-slate';
  }
}
