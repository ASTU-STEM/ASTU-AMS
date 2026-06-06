import { IJobBoardRepository } from '../ports/IJobBoardRepository';
import { IAlumniLookupRepository } from '../ports/IAlumniLookupRepository';
import { AlumniApplicationView } from '../../domain/entities/JobBoard';
import {
  AlumniProfileRequiredError,
  DuplicateApplicationError,
  JobExpiredError,
  JobClosedError,
  JobNotPublishedError,
  ApplicationNotFoundError,
  CannotWithdrawError,
} from '../../domain/errors/JobBoardErrors';

// Statuses that prevent withdrawal
const NON_WITHDRAWABLE_STATUSES = ['HIRED', 'REJECTED', 'WITHDRAWN'];

/**
 * Alumni applies to a job.
 * Validates: profile exists, job is published+active+not expired, no duplicate.
 */
export class ApplyToJob {
  constructor(
    private readonly jobBoardRepo: IJobBoardRepository,
    private readonly alumniRepo: IAlumniLookupRepository
  ) {}

  async execute(userId: string, jobId: string, data: {
    resumeUrl?: string | null;
    coverLetter?: string | null;
  }) {
    // 1. Alumni must have a profile
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) {
      throw new AlumniProfileRequiredError();
    }

    // 2. Job must exist
    const job = await this.jobBoardRepo.findJobById(jobId);
    if (!job) {
      throw new JobNotPublishedError();
    }

    // 3. Job must not be closed/archived
    if (job.status === 'CLOSED' || job.status === 'ARCHIVED') {
      throw new JobClosedError();
    }

    // 4. Job deadline must not have passed
    if (new Date(job.deadline) < new Date()) {
      throw new JobExpiredError();
    }

    // 5. Alumni must not have already applied
    const existingApp = await this.alumniRepo.findApplicationByAlumniAndJob(alumni.id, jobId);
    if (existingApp) {
      throw new DuplicateApplicationError();
    }

    // 6. Create the application
    const application = await this.alumniRepo.createApplication({
      jobId,
      alumniId: alumni.id,
      status: 'PENDING',
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || null,
    });

    return application;
  }
}

/**
 * Alumni withdraws their application from a job.
 * Cannot withdraw if already HIRED, REJECTED, or WITHDRAWN.
 */
export class WithdrawApplication {
  constructor(private readonly alumniRepo: IAlumniLookupRepository) {}

  async execute(userId: string, jobId: string) {
    // 1. Alumni must have a profile
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) {
      throw new AlumniProfileRequiredError();
    }

    // 2. Application must exist
    const application = await this.alumniRepo.findApplicationByAlumniAndJob(alumni.id, jobId);
    if (!application) {
      throw new ApplicationNotFoundError();
    }

    // 3. Cannot withdraw from terminal states
    if (NON_WITHDRAWABLE_STATUSES.includes(application.status)) {
      throw new CannotWithdrawError();
    }

    // 4. Update status to WITHDRAWN
    return this.alumniRepo.updateApplicationStatus(application.id, 'WITHDRAWN');
  }
}

/**
 * Alumni views their submitted applications with job details.
 */
export class GetMyApplications {
  constructor(private readonly alumniRepo: IAlumniLookupRepository) {}

  async execute(userId: string): Promise<AlumniApplicationView[]> {
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) {
      throw new AlumniProfileRequiredError();
    }

    return this.alumniRepo.findApplicationsByAlumniId(alumni.id);
  }
}
