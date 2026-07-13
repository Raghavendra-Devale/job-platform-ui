import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = ''; // icon name: e.g. 'bookmark', 'briefcase', 'user', 'dashboard', 'settings', 'file-text', 'bell'
}
