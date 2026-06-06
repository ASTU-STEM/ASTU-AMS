import { JobApplication } from '../../domain/entities/Employer';

export interface IJobApplicationRepository {
  findById(applicationId: string): Promise<JobApplication | null>;
  findByJobId(jobId: string): Promise<JobApplication[]>;
  findByAlumniId(alumniId: string): Promise<JobApplication[]>;
  findByEmployerId(employerId: string): Promise<JobApplication[]>;
  create(data: Omit<JobApplication, 'id'>): Promise<JobApplication>;
  updateStatus(applicationId: string, status: string): Promise<JobApplication>;
  update(applicationId: string, data: Partial<JobApplication>): Promise<JobApplication>;
}
