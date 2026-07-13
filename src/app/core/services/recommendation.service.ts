import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobRecommendation } from '../models/recommendation.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);

  getRecommendations(): Observable<JobRecommendation[]> {
    return this.http.post<{ recommendations: any[] }>(`${environment.apiUrl}/recommendations`, {}).pipe(
      map(response => {
        return (response.recommendations || []).map((item, index) => ({
          id: index + 1,
          jobTitle: item.title || 'Unknown Position',
          company: item.company || 'Unknown Company',
          location: item.location || 'Remote',
          matchScore: Math.round((item.similarity_score || 0) * 100),
          matchedSkills: item.matched_skills || [],
          reason: item.recommendation_reason || '',
          applyUrl: item.apply_url || null
        }));
      })
    );
  }
}
