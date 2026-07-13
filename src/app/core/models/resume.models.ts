export interface Resume {
  id: number;
  resumeName: string;
  isActive: boolean;
  updatedAt: string;
}

export interface Skill {
  id?: number;
  name: string;
}

export interface ResumeSummary {
  candidateName?: string;
  role?: string;
  experience?: string;
  score?: number;
}

export interface ResumeStatus {
  hasResume: boolean;
  uploadedAt?: string;
  processingStatus:
    | 'NOT_UPLOADED'
    | 'UPLOADING'
    | 'PROCESSING'
    | 'READY'
    | 'FAILED';
  parsedSkills: Skill[];
  summary?: ResumeSummary;
}
