import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobListResponse } from '../../../core/models/job.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: JobListResponse;
  @Input() isLoading = false;

  @Output() save = new EventEmitter<number>();
  @Output() apply = new EventEmitter<number>();
  @Output() compare = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();

  constructor(public authService: AuthService) {}

  onSave(event: MouseEvent): void {
    event.stopPropagation();
    this.save.emit(this.job.id);
  }

  onApply(event: MouseEvent): void {
    event.stopPropagation();
    this.apply.emit(this.job.id);
  }

  onCompare(event: MouseEvent): void {
    event.stopPropagation();
    this.compare.emit(this.job.id);
  }

  onViewDetails(event: MouseEvent): void {
    event.stopPropagation();
    this.viewDetails.emit(this.job.id);
  }

  inferExperienceLevel(title: string, tags: string | null): string {
    const text = (title + ' ' + (tags || '')).toLowerCase();
    if (text.includes('junior') || text.includes('entry') || text.includes('intern') || text.includes('associate')) {
      return 'Junior';
    }
    if (text.includes('senior') || text.includes('sr.') || text.includes('sr ')) {
      return 'Senior';
    }
    if (text.includes('lead') || text.includes('principal') || text.includes('director') || text.includes('manager')) {
      return 'Lead';
    }
    return 'Mid Level';
  }

  getTopTags(tags: string | null, max = 3): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, max);
  }

  getSourceBadgeClass(source: string): string {
    const s = (source || '').toLowerCase();
    if (s.includes('remoteok'))  return 'badge badge-purple';
    if (s.includes('arbeitnow')) return 'badge badge-teal';
    return 'badge badge-slate';
  }

  getRemoteBadgeLabel(remote: boolean | null): string {
    if (remote === true)  return 'Remote';
    if (remote === false) return 'On-site';
    return 'Hybrid';
  }

  getRemoteBadgeClass(remote: boolean | null): string {
    if (remote === true)  return 'badge badge-green';
    if (remote === false) return 'badge badge-amber';
    return 'badge badge-blue';
  }

  timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now  = new Date();
    const secs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (secs < 60)          return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)          return `${mins}m ago`;
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24)          return `${hrs}h ago`;
    const days = Math.floor(hrs  / 24);
    if (days < 7)           return `${days}d ago`;
    const wks  = Math.floor(days / 7);
    if (wks  < 5)           return `${wks}w ago`;
    const mos  = Math.floor(days / 30);
    if (mos  < 12)          return `${mos}mo ago`;
    return `${Math.floor(mos / 12)}y ago`;
  }
}
