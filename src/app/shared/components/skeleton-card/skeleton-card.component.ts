import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.css'],
})
export class SkeletonCardComponent {
  @Input() type: 'card' | 'list' | 'summary' | 'table' = 'card';
  @Input() count = 1;

  getLoopArray(): number[] {
    return Array.from({ length: this.count });
  }
}
