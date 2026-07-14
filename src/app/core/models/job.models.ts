// Matches JobListResponse Java record
export interface JobListResponse {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  remote: boolean | null;
  tags: string | null;
  createdAt: string | null;
  salary?: string | null;
  jobType?: string | null;
  applyUrl?: string | null;
}

// Matches JobResponse Java record
export interface JobResponse {
  slug: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  remote: boolean;
  tags: string;
}

// Matches JobSearchResponse Java record
export interface JobSearchResponse {
  content: JobListResponse[];
  filters: Record<string, string[]>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Matches JobSearchRequest Java record
export interface JobSearchRequest {
  keyword?: string;
  location?: string;
  remote?: boolean;
  salaryMin?: string;
  salaryMax?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  provider?: string;
  experience?: string;
  jobType?: string;
  company?: string;
}

// Matches ProviderSyncSummary Java record
export interface ProviderSyncSummary {
  provider: string;
  fetched: number;
  inserted: number;
  skipped: number;
}

// Matches SyncSummaryResponse Java record
export interface SyncSummaryResponse {
  providers: ProviderSyncSummary[];
}

// Provider health map
export type ProviderHealthMap = Record<string, 'UP' | 'DOWN'>;

// Generic paginated page from Spring Data
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface JobSearchState {
  keyword: string;
  location: string;
  provider: string;
  remote: string | null;
  sortBy: string;
  experience: string;
  jobType: string;
  company: string;
  page: number;
}

export function stateToParams(state: JobSearchState): Record<string, string> {
  const params: Record<string, string> = {};
  if (state.keyword?.trim()) params['keyword'] = state.keyword.trim();
  if (state.location) params['location'] = state.location;
  if (state.provider) params['provider'] = state.provider;
  if (state.remote !== null && state.remote !== '') params['remote'] = state.remote;
  if (state.sortBy) params['sortBy'] = state.sortBy;
  if (state.experience) params['experience'] = state.experience;
  if (state.jobType) params['jobType'] = state.jobType;
  if (state.company?.trim()) params['company'] = state.company.trim();
  if (state.page > 0) params['page'] = state.page.toString();
  return params;
}

export function paramsToState(params: Record<string, any>): JobSearchState {
  return {
    keyword: params['keyword'] || '',
    location: params['location'] || '',
    provider: params['provider'] || '',
    remote: params['remote'] === 'true' ? 'true' : params['remote'] === 'false' ? 'false' : null,
    sortBy: params['sortBy'] || '',
    experience: params['experience'] || '',
    jobType: params['jobType'] || '',
    company: params['company'] || '',
    page: params['page'] ? +params['page'] : 0,
  };
}
