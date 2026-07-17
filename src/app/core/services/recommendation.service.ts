import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationCardResponse, RecommendationDetailResponse, RecommendationRunResponse } from '../models/recommendation.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);

  /** Load the latest persisted recommendation run (no generation) */
  getLatestRun(): Observable<RecommendationRunResponse> {
    return this.http.get<RecommendationRunResponse>(`${environment.apiUrl}/recommendations/latest`);
  }

  /** Generate new recommendations via AI (POST triggers full pipeline) */
  getRecommendations(): Observable<RecommendationCardResponse[]> {
    return this.http.post<RecommendationCardResponse[]>(`${environment.apiUrl}/recommendations`, {});
  }

  getRecommendationDetail(jobId: number): Observable<RecommendationDetailResponse> {
    return this.http.get<RecommendationDetailResponse>(`${environment.apiUrl}/recommendations/${jobId}`);
  }
}
