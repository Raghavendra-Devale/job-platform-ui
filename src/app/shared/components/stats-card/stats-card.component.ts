import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.css']
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: string | number = '0';
  @Input() icon = 'briefcase';
  @Input() trend = '';
  @Input() trendType: 'up' | 'down' | 'neutral' = 'neutral';
}
