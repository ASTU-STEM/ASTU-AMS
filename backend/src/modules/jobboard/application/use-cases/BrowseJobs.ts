import { IJobBoardRepository } from '../ports/IJobBoardRepository';
import { IJobViewRepository } from '../ports/IJobViewRepository';
import { JobSearchParams, PaginatedResult, JobWithEmployer, JobDetailView } from '../../domain/entities/JobBoard';
import { JobNotPublishedError } from '../../domain/errors/JobBoardErrors';

/**
 * List publicly available jobs with search, filtering, pagination, and sorting.
 * No authentication required — anyone can browse.
 */
export class ListPublicJobs {
  constructor(private readonly jobBoardRepo: IJobBoardRepository) {}

  async execute(params: Partial<JobSearchParams>): Promise<PaginatedResult<JobWithEmployer>> {
    const searchParams: JobSearchParams = {
      keyword: params.keyword,
      department: params.department,
      location: params.location,
      employmentType: params.employmentType,
      experienceLevel: params.experienceLevel,
      industry: params.industry,
      company: params.company,
      salaryMin: params.salaryMin,
      salaryMax: params.salaryMax,
      experienceMin: params.experienceMin,
      experienceMax: params.experienceMax,
      page: Math.max(1, params.page || 1),
      limit: Math.min(50, Math.max(1, params.limit || 20)),
      sort: params.sort || 'newest',
    };

    return this.jobBoardRepo.findPublicJobs(searchParams);
  }
}

/**
 * Get full job detail, including company information and application count.
 * Records a job view (deduplicated within 24h for authenticated users).
 */
export class GetJobDetail {
  constructor(
    private readonly jobBoardRepo: IJobBoardRepository,
    private readonly jobViewRepo: IJobViewRepository
  ) {}

  async execute(
    jobId: string,
    alumniId: string | null,
    viewerIp: string | null
  ): Promise<JobDetailView> {
    const jobDetail = await this.jobBoardRepo.findJobDetail(jobId);
    if (!jobDetail) {
      throw new JobNotPublishedError();
    }

    // Deduplicate views within 24h for authenticated users
    let shouldRecord = true;
    if (alumniId) {
      const viewedRecently = await this.jobViewRepo.hasViewedRecently(jobId, alumniId, 24);
      if (viewedRecently) {
        shouldRecord = false;
      }
    }

    if (shouldRecord) {
      await this.jobViewRepo.record(jobId, alumniId, viewerIp);
    }

    return jobDetail;
  }
}

/**
 * Advanced keyword search for jobs (delegates to ListPublicJobs pattern).
 */
export class SearchJobs {
  constructor(private readonly jobBoardRepo: IJobBoardRepository) {}

  async execute(params: Partial<JobSearchParams>): Promise<PaginatedResult<JobWithEmployer>> {
    const searchParams: JobSearchParams = {
      keyword: params.keyword,
      department: params.department,
      location: params.location,
      employmentType: params.employmentType,
      experienceLevel: params.experienceLevel,
      industry: params.industry,
      company: params.company,
      salaryMin: params.salaryMin,
      salaryMax: params.salaryMax,
      experienceMin: params.experienceMin,
      experienceMax: params.experienceMax,
      page: Math.max(1, params.page || 1),
      limit: Math.min(50, Math.max(1, params.limit || 20)),
      sort: params.sort || 'newest',
    };

    return this.jobBoardRepo.findPublicJobs(searchParams);
  }
}
