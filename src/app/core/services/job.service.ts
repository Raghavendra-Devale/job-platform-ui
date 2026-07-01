import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JobListResponse,
  JobResponse,
  JobSearchRequest,
  JobSearchResponse,
  SyncSummaryResponse,
  ProviderHealthMap,
  Page,
} from '../models/job.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);

  // GET /api/jobs — paginated list
  getJobs(page = 0, size = 10): Observable<Page<JobListResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<JobListResponse>>('/api/jobs', { params });
  }

  // GET /api/jobs/:id — single job detail
  getJobById(id: number): Observable<JobResponse> {
    return this.http.get<JobResponse>(`/api/jobs/${id}`);
  }

  // GET /api/jobs/search — weighted ranked search with filters
  searchJobs(request: JobSearchRequest): Observable<JobSearchResponse> {
    let params = new HttpParams();
    if (request.keyword)        params = params.set('keyword', request.keyword);
    if (request.location)       params = params.set('location', request.location);
    if (request.remote != null) params = params.set('remote', String(request.remote));
    if (request.salaryMin)      params = params.set('salaryMin', request.salaryMin);
    if (request.salaryMax)      params = params.set('salaryMax', request.salaryMax);
    if (request.page != null)   params = params.set('page', String(request.page));
    if (request.size != null)   params = params.set('size', String(request.size));
    if (request.sortBy)         params = params.set('sortBy', request.sortBy);
    if (request.sortDirection)  params = params.set('sortDirection', request.sortDirection);
    if (request.provider)       params = params.set('provider', request.provider);
    if (request.experience)     params = params.set('experience', request.experience);
    if (request.jobType)        params = params.set('jobType', request.jobType);
    if (request.company)        params = params.set('company', request.company);
    return this.http.get<JobSearchResponse>('/api/jobs/search', { params });
  }

  // POST /api/jobs/sync — manual sync trigger
  syncJobs(): Observable<SyncSummaryResponse> {
    return this.http.post<SyncSummaryResponse>('/api/jobs/sync', {});
  }

  // GET /api/providers/health — health status per provider
  getProviderHealth(): Observable<ProviderHealthMap> {
    return this.http.get<ProviderHealthMap>('/api/providers/health');
  }

  // GET /api/providers/search — live external API search
  searchExternal(keyword: string): Observable<JobResponse[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<JobResponse[]>('/api/providers/search', { params });
  }
}
