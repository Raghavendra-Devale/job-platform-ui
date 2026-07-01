export interface ActivityLog {
  id: number;
  activityType: string; // RESUME_UPLOADED, RESUME_ACTIVATED, JOB_SAVED, APPLICATION_SUBMITTED, APPLICATION_UPDATED
  description: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  location: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  appliedAt: string;
  updatedAt?: string | null;
  resumeName?: string | null;
}

export interface DashboardSummary {
  activeResumeName: string | null;
  totalResumesCount: number;
  savedJobsCount: number;
  applicationsCount: number;
  interviewsCount: number;
  offersCount: number;
  recentActivities: ActivityLog[];
}
