import { supabase } from './supabase';

export interface MatchResult {
  name: string;
  title: string;
  experience: number;
  overallMatch: number;
  keySkills: string[];
  topMatches: Array<{
    id: string;
    title: string;
    category: string;
    location: string;
    matchScore: number;
    matchedSkills: string[];
  }>;
  allMatches?: Array<{
    id: string;
    title: string;
    matchScore: number;
  }>;
}

export async function matchResumeWithJobs(resumeText: string): Promise<MatchResult> {
  try {
    const { data, error } = await supabase.functions.invoke('match-resume-', {
      body: { resumeText }
    });

    if (error) {
      console.error('Match resume error:', error);
      throw new Error(error.message);
    }

    return data as MatchResult;
  } catch (err) {
    console.error('Resume matching failed:', err);
    throw err;
  }
}
