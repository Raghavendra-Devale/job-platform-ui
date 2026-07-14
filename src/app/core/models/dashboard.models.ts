import { RecommendationCardResponse } from './recommendation.models';

export interface ActivityLog {
  id: number;
  activityType: string;
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

export interface ResumeIntelligenceSummary {
  candidateName: string;
  role: string;
  experience: string;
}

export interface ResumeIntelligence {
  status: string;
  summary?: ResumeIntelligenceSummary;
  resumeScore?: number;
  skills?: string[];
  strengths?: string[];
  improvementSuggestions?: string[];
}

export interface RecommendationSummary {
  latestRun: string;
  totalJobs: number;
  averageMatch: number;
  highestMatch: number;
  newJobs: number;
}

export interface CareerInsight {
  label: string;
  value: string;
}

export interface DashboardViewModel {
  resume: ResumeIntelligence;
  recommendationSummary: RecommendationSummary;
  recentRecommendations: RecommendationCardResponse[];
  careerInsights: CareerInsight[];
  applicationSummary: {
    saved: number;
    applied: number;
    interview: number;
    offer: number;
  };
  hasActiveResume: boolean;
}
