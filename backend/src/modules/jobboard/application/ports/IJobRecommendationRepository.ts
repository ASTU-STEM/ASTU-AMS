import { JobRecommendationEntity } from '../../domain/entities/JobBoard';

export interface IJobRecommendationRepository {
  findByAlumniId(alumniId: string, limit: number): Promise<JobRecommendationEntity[]>;
  upsertMany(recommendations: Array<{
    alumniId: string;
    jobId: string;
    score: number;
    reasons: string[];
    expiresAt: Date;
  }>): Promise<void>;
  deleteExpired(): Promise<number>;
  findActiveJobsForRecommendation(): Promise<any[]>;
}
