import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  @Input() type: 'spinner' | 'skeleton' | 'bar' = 'spinner';
  @Input() count = 3;

  get countArray(): number[] {
    return Array(Math.max(1, this.count)).fill(0);
  }
}
