
export enum CandidateStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED',
  ONBOARDING = 'ONBOARDING'
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  matchScore: number;
  status: CandidateStatus;
  appliedDate: string;
  summary: string;
  aiInsights: string[];
  avatar: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  openings: number;
  applicants: number;
}
