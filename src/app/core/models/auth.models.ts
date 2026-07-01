export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  resumeFileName?: string;
  workPreference?: string;
  alertEnabled?: boolean;
  createdAt: string;

  // Profile fields
  experience?: number;
  currentRole?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  phone?: string;
  location?: string;

  // Preference fields
  preferredRoles?: string;
  preferredLocations?: string;
  remoteOnly?: boolean;
  salaryRange?: string;
  jobTypes?: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
}
