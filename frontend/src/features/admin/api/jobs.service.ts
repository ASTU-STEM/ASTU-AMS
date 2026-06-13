import { get, post, put, remove } from './client';

export interface JobPosting {
  id: string;
  title: string;
  employer: string;
  type: string;
  postedAt: string;
  deadline: string;
  applicants: number;
  status: string;
  featured: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  appliedAt: string;
  status: string;
}

export interface CreateJobRequest {
  title: string;
  employer: string;
  type: string;
  deadline: string;
  description: string;
  requirements: string[];
  featured: boolean;
}

export const jobsService = {
  async getJobs(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
  }): Promise<{ jobs: JobPosting[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    
    return get<{ jobs: JobPosting[]; total: number }>(`/admin/jobs?${queryParams.toString()}`);
  },

  async getJobById(id: string): Promise<JobPosting> {
    return get<JobPosting>(`/admin/jobs/${id}`);
  },

  async createJob(data: CreateJobRequest): Promise<JobPosting> {
    return post<JobPosting>('/admin/jobs', data);
  },

  async updateJob(id: string, data: Partial<CreateJobRequest>): Promise<JobPosting> {
    return put<JobPosting>(`/admin/jobs/${id}`, data);
  },

  async deleteJob(id: string): Promise<void> {
    return remove<void>(`/admin/jobs/${id}`);
  },

  async getApplications(jobId: string): Promise<JobApplication[]> {
    return get<JobApplication[]>(`/admin/jobs/${jobId}/applications`);
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    return put<void>(`/admin/jobs/applications/${applicationId}`, { status });
  },

  async exportJobs(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`/api/admin/jobs/export/${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export jobs');
    }
    return response.blob();
  },
};
