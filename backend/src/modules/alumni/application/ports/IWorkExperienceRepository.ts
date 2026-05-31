import { WorkExperience } from '../../domain/entities/Alumni';

export interface IWorkExperienceRepository {
  findById(id: string): Promise<WorkExperience | null>;
  create(data: Omit<WorkExperience, 'id'>): Promise<WorkExperience>;
  update(id: string, data: Partial<WorkExperience>): Promise<WorkExperience>;
  delete(id: string): Promise<void>;
}
