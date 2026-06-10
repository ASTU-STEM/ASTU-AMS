export interface EmployerDashboardStats {
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  hiredCandidates: number;
  hiringRate: number;
  averageTimeToHire: number;
}

export interface IDashboardAnalyticsRepository {
  getStatsByEmployerId(employerId: string): Promise<EmployerDashboardStats>;
}
