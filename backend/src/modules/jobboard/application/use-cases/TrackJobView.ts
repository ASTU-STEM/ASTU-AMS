import { IJobViewRepository } from '../ports/IJobViewRepository';
import { IJobBoardRepository } from '../ports/IJobBoardRepository';
import { JobNotPublishedError } from '../../domain/errors/JobBoardErrors';

/**
 * Records a job view, deduplicated within 24h for authenticated users.
 * Anonymous views are always recorded.
 */
export class RecordJobView {
  constructor(
    private readonly jobViewRepo: IJobViewRepository,
    private readonly jobBoardRepo: IJobBoardRepository
  ) {}

  async execute(
    jobId: string,
    alumniId: string | null,
    viewerIp: string | null
  ): Promise<void> {
    const job = await this.jobBoardRepo.findJobById(jobId);
    if (!job) throw new JobNotPublishedError();

    // Deduplicate for authenticated users
    if (alumniId) {
      const viewedRecently = await this.jobViewRepo.hasViewedRecently(jobId, alumniId, 24);
      if (viewedRecently) return;
    }

    await this.jobViewRepo.record(jobId, alumniId, viewerIp);
  }
}
