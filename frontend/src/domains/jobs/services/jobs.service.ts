import { get, post, del } from '../../../shared/services/api';
import type { Job, JobApplication } from '../types';

export const jobsService = {
  async getJobs(): Promise<Job[]> {
    return get<Job[]>('/jobboard');
  },

  async getJobById(id: string): Promise<Job> {
    return get<Job>(`/jobboard/detail/${id}`);
  },

  async getRecommendedJobs(): Promise<Job[]> {
    return get<Job[]>('/jobboard/recommended');
  },

  async getSavedJobs(): Promise<Job[]> {
    return get<Job[]>('/jobboard/saved');
  },

  async saveJob(id: string): Promise<void> {
    return post<void>(`/jobboard/${id}/save`);
  },

  async unsaveJob(id: string): Promise<void> {
    return del<void>(`/jobboard/${id}/save`);
  },

  async applyToJob(id: string, data?: FormData): Promise<JobApplication> {
    return post<JobApplication>(`/jobboard/${id}/apply`, data);
  },

  async getMyApplications(): Promise<JobApplication[]> {
    return get<JobApplication[]>('/jobboard/my-applications');
  },

  async getApplications(): Promise<JobApplication[]> {
    return get<JobApplication[]>('/jobboard/my-applications');
  },

  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    return get<JobApplication[]>('/employer/applications');
  },
};

export default jobsService;
