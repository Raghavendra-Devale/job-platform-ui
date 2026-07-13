import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.css']
})
export class ChipComponent {
  @Input() label = '';
  @Input() active = false;
  @Input() removable = false;
  @Input() customClass = '';

  @Output() chipClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<MouseEvent>();

  onClick(): void {
    this.chipClick.emit();
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(event);
  }
}
