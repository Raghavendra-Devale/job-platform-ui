export interface RecommendationCardResponse {
  jobId: number;
  title: string;
  company: string;
  location: string;
  description: string;
  remote: boolean;
  postedAt: string;
  similarityScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
  applyUrl: string;
}

export interface RecommendationDetailResponse {
  jobId: number;
  title: string;
  company: string;
  location: string;
  description: string;
  remote: boolean;
  postedAt: string;
  similarityScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
  applyUrl: string;
  strengths: string[];
  suggestions: string[];
}
