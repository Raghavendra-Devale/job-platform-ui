// Matches JobListResponse Java record
export interface JobListResponse {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  remote: boolean | null;
  tags: string | null;
  createdAt: string | null; // ISO datetime string from backend
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

// Provider health map: { "RemoteOK": "UP", "Arbeitnow": "DOWN" }
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
