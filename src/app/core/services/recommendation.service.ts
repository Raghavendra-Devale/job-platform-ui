import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationCardResponse, RecommendationDetailResponse } from '../models/recommendation.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);

  getRecommendations(): Observable<RecommendationCardResponse[]> {
    return this.http.post<RecommendationCardResponse[]>(`${environment.apiUrl}/recommendations`, {});
  }

  getRecommendationDetail(jobId: number): Observable<RecommendationDetailResponse> {
    return this.http.get<RecommendationDetailResponse>(`${environment.apiUrl}/recommendations/${jobId}`);
  }
}
