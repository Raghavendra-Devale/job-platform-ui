import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationCardResponse } from '../../../core/models/recommendation.models';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-card.component.html',
  styleUrls: ['./recommendation-card.component.css'],
})
export class RecommendationCardComponent {
  @Input() recommendation!: RecommendationCardResponse;
  @Input() isLoading = false;

  @Output() viewDetails = new EventEmitter<number>();
  @Output() apply = new EventEmitter<number>();
  @Output() save = new EventEmitter<number>();

  onSave(event: MouseEvent): void {
    event.stopPropagation();
    this.save.emit(this.recommendation.jobId);
  }

  onApply(event: MouseEvent): void {
    event.stopPropagation();
    this.apply.emit(this.recommendation.jobId);
  }

  onViewDetails(event: MouseEvent): void {
    event.stopPropagation();
    this.viewDetails.emit(this.recommendation.jobId);
  }

  get matchScore(): number {
    return Math.round((this.recommendation?.similarityScore || 0) * 100);
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'badge-green';
    if (score >= 70) return 'badge-blue';
    if (score >= 50) return 'badge-amber';
    return 'badge-slate';
  }
}
