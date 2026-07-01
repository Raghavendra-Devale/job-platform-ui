import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { JobRecommendation } from '../models/recommendation.models';

// ── Mock data (replace with real HTTP call when backend is ready) ──────────
const MOCK_RECOMMENDATIONS: JobRecommendation[] = [
  {
    id: 1,
    jobTitle: 'Java Backend Developer',
    company: 'ABC Company',
    location: 'Bangalore, India',
    matchScore: 92,
    matchedSkills: ['Java', 'Spring Boot', 'REST APIs'],
    reason: 'Strong backend experience aligns perfectly with this role.',
    applyUrl: 'https://example.com/apply/1',
  },
  {
    id: 2,
    jobTitle: 'Senior Software Engineer',
    company: 'TechCorp Solutions',
    location: 'Hyderabad, India',
    matchScore: 87,
    matchedSkills: ['Java', 'Microservices', 'Kafka'],
    reason: 'Your microservices expertise is a strong match for their distributed platform team.',
    applyUrl: 'https://example.com/apply/2',
  },
  {
    id: 3,
    jobTitle: 'Full-Stack Developer',
    company: 'Innovate Labs',
    location: 'Remote',
    matchScore: 79,
    matchedSkills: ['Angular', 'TypeScript', 'REST APIs'],
    reason: 'Frontend skills complement their small full-stack team well.',
    applyUrl: 'https://example.com/apply/3',
  },
  {
    id: 4,
    jobTitle: 'Cloud Backend Engineer',
    company: 'NimbusWare',
    location: 'Pune, India',
    matchScore: 74,
    matchedSkills: ['Spring Boot', 'AWS', 'Docker'],
    reason: 'Cloud deployment knowledge is directly relevant to their AWS-native infrastructure.',
    applyUrl: null,
  },
  {
    id: 5,
    jobTitle: 'API Platform Engineer',
    company: 'DataPulse Inc.',
    location: 'Chennai, India',
    matchScore: 68,
    matchedSkills: ['REST APIs', 'Java'],
    reason: 'Solid API design background matches their platform engineering requirements.',
    applyUrl: 'https://example.com/apply/5',
  },
];

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);

  /**
   * GET /recommendations
   * Swap `of(MOCK_RECOMMENDATIONS).pipe(delay(600))` for the real call:
   *   return this.http.get<JobRecommendation[]>('/api/recommendations');
   */
  getRecommendations(): Observable<JobRecommendation[]> {
    // Mock — simulates 600 ms network latency
    return of(MOCK_RECOMMENDATIONS).pipe(delay(600));
  }
}
