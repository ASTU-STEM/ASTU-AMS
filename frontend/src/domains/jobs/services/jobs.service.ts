import { get, post, del } from '../../../shared/services/api';
import type { Job, JobApplication, JobBookmark } from '../types/jobs.types';

const BASE = '/jobs';

export const jobsService = {
  async getJobs(params?: { keyword?: string; department?: string; location?: string; page?: number; limit?: number }): Promise<{ data: Job[]; total: number; page: number; limit: number; totalPages: number }> {
    return get(`${BASE}`, params as Record<string, unknown>);
  },

  async getJobById(id: string): Promise<Job> {
    return get<Job>(`${BASE}/detail/${id}`);
  },

  async getMyApplications(): Promise<JobApplication[]> {
    return get<JobApplication[]>(`${BASE}/my-applications`);
  },

  async applyForJob(jobId: string, resume?: File, coverLetter?: string): Promise<void> {
    const formData = new FormData();
    if (resume) formData.append('resume', resume);
    if (coverLetter) formData.append('coverLetter', coverLetter);
    await post(`${BASE}/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async withdrawApplication(jobId: string): Promise<void> {
    await del(`${BASE}/${jobId}/application`);
  },

  async getSavedJobs(): Promise<JobBookmark[]> {
    return get<JobBookmark[]>(`${BASE}/saved`);
  },

  async saveJob(jobId: string): Promise<void> {
    await post(`${BASE}/${jobId}/save`);
  },

  async unsaveJob(jobId: string): Promise<void> {
    await del(`${BASE}/${jobId}/save`);
  },

  async getRecommended(limit?: number): Promise<Job[]> {
    const params = limit ? { limit } : {};
    return get<Job[]>(`${BASE}/recommended`, params);
  },
};

export default jobsService;
