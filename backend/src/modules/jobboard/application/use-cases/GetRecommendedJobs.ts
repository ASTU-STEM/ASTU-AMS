import { IJobRecommendationRepository } from '../ports/IJobRecommendationRepository';
import { IAlumniLookupRepository } from '../ports/IAlumniLookupRepository';
import { JobRecommendationEntity } from '../../domain/entities/JobBoard';
import { AlumniProfileRequiredError } from '../../domain/errors/JobBoardErrors';

/**
 * Retrieves pre-computed job recommendations for an alumni.
 * Recommendations are sorted by score (highest first).
 */
export class GetRecommendedJobs {
  constructor(
    private readonly recommendationRepo: IJobRecommendationRepository,
    private readonly alumniRepo: IAlumniLookupRepository
  ) {}

  async execute(userId: string, limit: number = 10): Promise<JobRecommendationEntity[]> {
    const alumni = await this.alumniRepo.findByUserId(userId);
    if (!alumni) throw new AlumniProfileRequiredError();

    return this.recommendationRepo.findByAlumniId(alumni.id, limit);
  }
}
