export type UserProfile = {
  name: string;
  short_intro: string;
  skills: string[];
  preferred_categories: string[];
  excluded_categories: string[];
  portfolio_links: string[];
  experience_summary: string;
  rate_min: number | null;
  rate_max: number | null;
  keywords_prioritize: string[];
  keywords_avoid: string[];
  proposal_tone: string;
  reusable_snippets: string[];
};

export type NormalizedJob = {
  job_id: string;
  title: string;
  url: string;
  category?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  description: string;
  posted_at?: string | null;
  raw_text: string;
};

export type JobScoreBreakdown = {
  category: number;
  budget: number;
  keywords: number;
  blacklist_penalty: number;
  recency: number;
};

export type AnalyzeJobsRequest = {
  jobs: NormalizedJob[];
  profile?: UserProfile;
};

export type JobAnalysis = {
  job_id: string;
  total_score: number;
  breakdown: JobScoreBreakdown;
  reasons: string[];
  red_flags: string[];
  llm_fit_summary?: string | null;
  llm_confidence?: number | null;
  proposal_angle?: string | null;
};

export type AnalyzeJobsResponse = {
  ranked: JobAnalysis[];
};

export type GenerateProposalRequest = {
  job: NormalizedJob;
  profile?: UserProfile;
};

export type GenerateProposalResponse = {
  proposal: string;
  angle: string;
  tone: string;
  source: "template" | "llm";
};
