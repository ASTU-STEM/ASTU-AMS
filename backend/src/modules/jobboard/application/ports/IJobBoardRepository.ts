import {
  JobWithEmployer,
  JobDetailView,
  JobSearchParams,
  PaginatedResult
} from '../../domain/entities/JobBoard';

export interface IJobBoardRepository {
  /**
   * Find public jobs with advanced search, filtering, pagination, and sorting.
   * Only returns PUBLISHED + ACTIVE + NOT_EXPIRED jobs.
   */
  findPublicJobs(params: JobSearchParams): Promise<PaginatedResult<JobWithEmployer>>;

  /**
   * Find full job detail including company info, application count, and view count.
   * Returns null if job is not PUBLISHED or not active.
   */
  findJobDetail(jobId: string): Promise<JobDetailView | null>;

  /**
   * Find any job by ID regardless of status (for internal use, e.g., checking if job exists).
   */
  findJobById(jobId: string): Promise<any | null>;

  /**
   * Count total applications for a specific job.
   */
  countApplications(jobId: string): Promise<number>;
}
