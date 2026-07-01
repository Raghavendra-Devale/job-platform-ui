export interface JobRecommendation {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  matchScore: number;         // 0–100
  matchedSkills: string[];
  reason: string;
  applyUrl?: string | null;
}
