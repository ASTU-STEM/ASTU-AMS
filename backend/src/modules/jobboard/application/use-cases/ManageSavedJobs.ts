import { ISavedJobRepository } from '../ports/ISavedJobRepository';
import { IAlumniLookupRepository } from '../ports/IAlumniLookupRepository';
import { IJobBoardRepository } from '../ports/IJobBoardRepository';
import { PaginatedResult, SavedJobEntity } from '../../domain/entities/JobBoard';
import { AlumniProfileRequiredError, JobNotPublishedError } from '../../domain/errors/JobBoardErrors';

/**
 * Alumni saves (bookmarks) a job for later.
 */
export class SaveJob {
  constructor(
    private readonly savedJobRepo: ISavedJobRepository,
    private readonly alumniRepo: IAlumniLookupRepository,
    private readonly jobBoardRepo: IJobBoardRepository
  ) {}

  async execute(userId: string, jobId: string): Promise<SavedJobEntity> {
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) throw new AlumniProfileRequiredError();

    const job = await this.jobBoardRepo.findJobById(jobId);
    if (!job) throw new JobNotPublishedError();

    return this.savedJobRepo.save(alumni.id, jobId);
  }
}

/**
 * Alumni removes a saved job bookmark.
 */
export class UnsaveJob {
  constructor(
    private readonly savedJobRepo: ISavedJobRepository,
    private readonly alumniRepo: IAlumniLookupRepository
  ) {}

  async execute(userId: string, jobId: string): Promise<void> {
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) throw new AlumniProfileRequiredError();

    await this.savedJobRepo.unsave(alumni.id, jobId);
  }
}

/**
 * Alumni retrieves their saved jobs with pagination.
 */
export class GetSavedJobs {
  constructor(
    private readonly savedJobRepo: ISavedJobRepository,
    private readonly alumniRepo: IAlumniLookupRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) throw new AlumniProfileRequiredError();

    return this.savedJobRepo.findByAlumniId(alumni.id, page, limit);
  }
}
