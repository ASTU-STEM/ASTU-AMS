/**
 * Job Board Intelligence Service — AI-Ready Interface
 * 
 * Clean service interfaces designed for future AI agents.
 * The v1 implementation uses Prisma aggregation queries.
 * A future AI agent can implement this interface with ML-based intelligence.
 * 
 * DO NOT hardcode AI logic here — this is a contract definition.
 */

export interface PopularJob {
  jobId: string;
  title: string;
  companyName: string;
  viewCount: number;
  applicationCount: number;
}

export interface SkillDemand {
  skill: string;
  demandCount: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface CompanyHiringStats {
  employerId: string;
  companyName: string;
  totalHires: number;
  totalJobsPosted: number;
  averageTimeToHireDays: number;
}

export interface JobMatch {
  jobId: string;
  title: string;
  companyName: string;
  matchScore: number;
  matchReasons: string[];
}

export interface IJobBoardIntelligence {
  /** Which jobs are most popular? (by views + applications) */
  getMostPopularJobs(limit: number): Promise<PopularJob[]>;

  /** Which skills are most requested across all active job postings? */
  getMostRequestedSkills(limit: number): Promise<SkillDemand[]>;

  /** What companies hire the most graduates from a given department? */
  getTopHiringCompaniesForDepartment(departmentCode: string): Promise<CompanyHiringStats[]>;

  /** What jobs match this alumni profile? */
  getMatchingJobsForProfile(alumniId: string): Promise<JobMatch[]>;

  /** Job board overview metrics for analytics dashboard */
  getJobBoardMetrics(): Promise<{
    totalActiveJobs: number;
    totalApplicationsThisMonth: number;
    averageApplicationsPerJob: number;
    hiringConversionRate: number;
    topCategories: Array<{ category: string; count: number }>;
    topEmployers: Array<{ name: string; jobCount: number }>;
  }>;
}
