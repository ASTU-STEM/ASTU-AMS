import { SavedJobEntity, PaginatedResult } from '../../domain/entities/JobBoard';

export interface ISavedJobRepository {
  save(alumniId: string, jobId: string): Promise<SavedJobEntity>;
  unsave(alumniId: string, jobId: string): Promise<void>;
  findByAlumniId(alumniId: string, page: number, limit: number): Promise<PaginatedResult<any>>;
  isSaved(alumniId: string, jobId: string): Promise<boolean>;
}
