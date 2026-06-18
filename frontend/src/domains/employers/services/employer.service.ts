import { get, post, put, patch, del } from '../../../shared/services/api';
import type {
  CompanyProfile,
  EmployerJob,
  CandidateApplication,
  GraduateFeedback,
  InterviewSchedule,
  EmployerDashboardSummary,
  TalentSearchFilters,
  TalentAlumni
} from '../types';

export const employerService = {
  async getProfile(): Promise<CompanyProfile> {
    return get<CompanyProfile>('/api/employer/profile');
  },

  async createProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return post<CompanyProfile>('/api/employer/profile', data);
  },

  async updateProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return put<CompanyProfile>('/api/employer/profile', data);
  },

  async getDashboard(): Promise<EmployerDashboardSummary> {
    return get<EmployerDashboardSummary>('/api/employer/dashboard');
  },

  async getJobs(): Promise<EmployerJob[]> {
    return get<EmployerJob[]>('/api/employer/my-jobs');
  },

  async createJob(data: Partial<EmployerJob>): Promise<EmployerJob> {
    return post<EmployerJob>('/api/employer/jobs', data);
  },

  async updateJob(jobId: number, data: Partial<EmployerJob>): Promise<EmployerJob> {
    return put<EmployerJob>(`/api/employer/jobs/${jobId}`, data);
  },

  async deleteJob(jobId: number): Promise<void> {
    return del<void>(`/api/employer/jobs/${jobId}`);
  },

  async publishJob(jobId: number): Promise<void> {
    return post<void>(`/api/employer/jobs/${jobId}/publish`);
  },

  async closeJob(jobId: number): Promise<void> {
    return post<void>(`/api/employer/jobs/${jobId}/close`);
  },

  async reopenJob(jobId: number, deadline: string): Promise<void> {
    return post<void>(`/api/employer/jobs/${jobId}/reopen`, { deadline });
  },

  async getApplications(): Promise<CandidateApplication[]> {
    return get<CandidateApplication[]>('/api/employer/applications');
  },

  async getApplication(applicationId: number): Promise<CandidateApplication> {
    return get<CandidateApplication>(`/api/employer/applications/${applicationId}`);
  },

  async updateApplicationStatus(id: number, status: string): Promise<CandidateApplication> {
    return patch<CandidateApplication>(`/api/employer/applications/${id}/status`, { status });
  },

  async getInterviews(): Promise<InterviewSchedule[]> {
    return get<InterviewSchedule[]>('/api/employer/interviews');
  },

  async createInterview(data: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    return post<InterviewSchedule>('/api/employer/interviews', data);
  },

  async updateInterview(interviewId: number, data: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    return put<InterviewSchedule>(`/api/employer/interviews/${interviewId}`, data);
  },

  async deleteInterview(interviewId: number): Promise<void> {
    return del<void>(`/api/employer/interviews/${interviewId}`);
  },

  async getFeedback(): Promise<GraduateFeedback[]> {
    return get<GraduateFeedback[]>('/api/employer/feedback');
  },

  async submitFeedback(data: Partial<GraduateFeedback>): Promise<GraduateFeedback> {
    return post<GraduateFeedback>('/api/employer/feedback', data);
  },

  async searchTalent(filters: Partial<TalentSearchFilters>): Promise<TalentAlumni[]> {
    return get<TalentAlumni[]>('/api/employer/talent', filters as Record<string, unknown>);
  },

  async getTalentDetail(alumniId: number): Promise<TalentAlumni> {
    return get<TalentAlumni>(`/api/employer/talent/${alumniId}`);
  },
};
