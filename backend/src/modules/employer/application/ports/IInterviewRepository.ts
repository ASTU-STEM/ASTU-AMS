import { Interview } from '../../domain/entities/Employer';

export interface IInterviewRepository {
  findById(id: string): Promise<Interview | null>;
  findByEmployerId(employerId: string): Promise<Interview[]>;
  create(data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Interview>;
  update(id: string, data: Partial<Interview>): Promise<Interview>;
  delete(id: string): Promise<void>;
}
