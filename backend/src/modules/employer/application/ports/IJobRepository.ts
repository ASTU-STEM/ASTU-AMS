import { Job } from '../../domain/entities/Employer';

export interface IJobRepository {
  findById(jobId: string): Promise<Job | null>;
  findByEmployerId(employerId: string): Promise<Job[]>;
  search(criteria: any): Promise<Job[]>;
  create(data: Omit<Job, 'id'>): Promise<Job>;
  update(jobId: string, data: Partial<Job>): Promise<Job>;
  delete(jobId: string): Promise<void>;
}
