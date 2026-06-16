import axios from 'axios';
import {
  CandidateApplication,
  CompanyProfile,
  EmployerDashboardSummary,
  EmployerJob,
  GraduateFeedback,
  InterviewSchedule,
  Message,
  TalentSearchFilters
} from '../types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Mappers ───────────────────────────────────────────────────────────────────

function mapBackendJobToFrontend(data: any): EmployerJob {
  let type: EmployerJob['type'] = 'Full-Time';
  if (data.employmentType === 'INTERNSHIP') type = 'Internship';
  else if (data.employmentType === 'CONTRACT') type = 'Contract';

  let expText = 'Entry Level (0-1 yrs)';
  if (data.experienceRequired >= 5) expText = 'Senior (5+ yrs)';
  else if (data.experienceRequired >= 3) expText = 'Mid-Level (3-5 yrs)';
  else if (data.experienceRequired >= 1) expText = 'Junior (1-3 yrs)';

  return {
    id: data.id,
    title: data.title,
    type,
    location: data.location,
    salaryRange: data.salary || 'Not specified',
    experienceRequired: expText,
    description: data.description,
    skillsRequired: data.skillsRequired || [],
    status: (data.status === 'PUBLISHED' || data.status === 'Open') ? 'Open' : 'Closed',
    postedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Just now',
    applicationsCount: data.applications?.length || data._count?.applications || 0,
    shortlistedCount: 0,
    viewsCount: data.views || 0,
  };
}

function mapFrontendTypeToBackend(type: string): string {
  if (type === 'Internship') return 'INTERNSHIP';
  if (type === 'Contract') return 'CONTRACT';
  return 'FULL_TIME';
}

function mapExperienceToNumber(exp: string): number {
  if (exp.includes('5+') || exp.includes('Senior')) return 5;
  if (exp.includes('3-5') || exp.includes('Mid')) return 3;
  if (exp.includes('1-3') || exp.includes('Junior')) return 1;
  return 0;
}

function mapBackendApplicationToFrontend(app: any): CandidateApplication {
  return {
    id: app.id,
    alumnusName: app.alumni?.user?.email?.split('@')[0] || app.alumniId || 'Unknown',
    alumnusEmail: app.alumni?.user?.email || '',
    jobTitle: app.job?.title || 'Unknown Position',
    department: app.alumni?.department?.name || 'N/A',
    graduationYear: app.alumni?.graduationYear?.toString() || 'N/A',
    cgpa: app.alumni?.cgpa?.toString() || 'N/A',
    skills: app.alumni?.skills || [],
    status: mapApplicationStatus(app.status),
    appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
    resumeUrl: app.resumeUrl || null,
    coverLetter: app.coverLetter || '',
  };
}

function mapApplicationStatus(status: string): CandidateApplication['status'] {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'REVIEWED': return 'Reviewed';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'INTERVIEW_SCHEDULED': return 'Interviewed';
    case 'REJECTED': return 'Rejected';
    case 'HIRED': return 'Hired';
    case 'OFFERED': return 'Hired';
    default: return 'Pending';
  }
}

function mapFrontendStatusToBackend(status: string): string {
  switch (status) {
    case 'Pending': return 'PENDING';
    case 'Reviewed': return 'REVIEWED';
    case 'Shortlisted': return 'SHORTLISTED';
    case 'Interviewed': return 'INTERVIEW_SCHEDULED';
    case 'Rejected': return 'REJECTED';
    case 'Hired': return 'HIRED';
    default: return 'PENDING';
  }
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const employerService = {

  // ── Profile ────────────────────────────────────────────────────────────────

  async getProfile(): Promise<CompanyProfile> {
    try {
      const response = await apiClient.get('/employer/profile');
      const p = response.data.data;
      return {
        name: p.companyName || '',
        industry: p.industry || '',
        size: p.companySize || '',
        location: p.location || '',
        website: p.website || '',
        description: p.description || '',
        tin: p.tin || '',
        hrContact: p.hrContact || '',
        phone: p.phone || '',
        contactEmail: p.contactEmail || '',
        contactPerson: p.contactPerson || '',
        logoUrl: p.logoUrl || '',
        isPremium: p.isPremium || false,
        partnerships: p.partnerships || [],
        verificationStatus: p.verificationStatus || 'NOT_VERIFIED',
        ndaSigned: p.ndaSigned || false,
      };
    } catch (err: any) {
      console.error("getProfile failed:", err.response?.data || err.message);
      return {
        name: 'My Company', industry: '', size: '', location: '',
        website: '', description: '', tin: '', hrContact: '',
        phone: '', contactEmail: '', contactPerson: '', logoUrl: '',
        isPremium: false, partnerships: [], verificationStatus: 'NOT_VERIFIED', ndaSigned: false,
      };
    }
  },

  async saveProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    try {
      const payload: any = {
        companyName: profile.name,
        industry: profile.industry,
        location: profile.location,
        hrContact: profile.hrContact || profile.name,
        website: profile.website || null,
        description: profile.description || null,
        companySize: profile.size || null,
        contactPerson: profile.contactPerson || null,
        contactEmail: profile.contactEmail || null,
        phone: profile.phone || null,
        tin: profile.tin || null,
        isPremium: profile.isPremium ?? false,
        partnerships: profile.partnerships ?? [],
        verificationStatus: profile.verificationStatus ?? 'NOT_VERIFIED',
        ndaSigned: profile.ndaSigned ?? false,
      };
      await apiClient.put('/employer/profile', payload);
      return profile;
    } catch (err: any) {
      console.error("saveProfile failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // ── Jobs ───────────────────────────────────────────────────────────────────

  async getEmployerJobs(): Promise<EmployerJob[]> {
    try {
      const response = await apiClient.get('/employer/my-jobs');
      return (response.data.data || []).map(mapBackendJobToFrontend);
    } catch (err: any) {
      console.error("getEmployerJobs failed:", err.response?.data || err.message);
      throw err;
    }
  },

  async createJob(job: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>): Promise<EmployerJob> {
    const payload = {
      title: job.title,
      description: job.description,
      location: job.location,
      employmentType: mapFrontendTypeToBackend(job.type),
      experienceRequired: mapExperienceToNumber(job.experienceRequired),
      skillsRequired: job.skillsRequired,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      salary: job.salaryRange,
      status: 'PUBLISHED'
    };
    try {
      const response = await apiClient.post('/employer/jobs', payload);
      return mapBackendJobToFrontend(response.data.data);
    } catch (err: any) {
      console.error("createJob failed:", err.response?.data || err.message);
      throw err;
    }
  },

  async updateJob(jobId: number | string, updatedJob: Partial<EmployerJob>): Promise<EmployerJob> {
    const payload: any = {};
    if (updatedJob.title) payload.title = updatedJob.title;
    if (updatedJob.description) payload.description = updatedJob.description;
    if (updatedJob.location) payload.location = updatedJob.location;
    if (updatedJob.type) payload.employmentType = mapFrontendTypeToBackend(updatedJob.type);
    if (updatedJob.skillsRequired) payload.skillsRequired = updatedJob.skillsRequired;
    if (updatedJob.salaryRange) payload.salary = updatedJob.salaryRange;
    if (updatedJob.experienceRequired) payload.experienceRequired = mapExperienceToNumber(updatedJob.experienceRequired);

    const response = await apiClient.put(`/employer/jobs/${jobId}`, payload);
    return mapBackendJobToFrontend(response.data.data);
  },

  async toggleJobStatus(jobId: number | string, currentStatus: string): Promise<EmployerJob> {
    const action = currentStatus === 'Open' ? 'close' : 'publish';
    const response = await apiClient.post(`/employer/jobs/${jobId}/${action}`);
    return mapBackendJobToFrontend(response.data.data);
  },

  async deleteJob(jobId: number | string): Promise<void> {
    await apiClient.delete(`/employer/jobs/${jobId}`);
  },

  // ── Applications ───────────────────────────────────────────────────────────

  async getApplications(): Promise<CandidateApplication[]> {
    try {
      const response = await apiClient.get('/employer/applications');
      return (response.data.data || []).map(mapBackendApplicationToFrontend);
    } catch (err: any) {
      console.error("getApplications failed:", err.response?.data || err.message);
      return [];
    }
  },

  async updateApplicationStatus(applicationId: number | string, status: CandidateApplication['status']): Promise<void> {
    try {
      await apiClient.patch(`/employer/applications/${applicationId}/status`, {
        status: mapFrontendStatusToBackend(status),
      });
    } catch (err: any) {
      console.error("updateApplicationStatus failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboardSummary(): Promise<EmployerDashboardSummary> {
    try {
      const response = await apiClient.get('/employer/dashboard');
      const d = response.data.data;
      return {
        activeJobs: d.activeJobs || 0,
        totalApplications: d.totalApplications || 0,
        pendingApplications: d.pendingApplications || 0,
        shortlistedApplications: d.shortlistedApplications || 0,
        feedbackReports: d.feedbackReports || 0,
        totalViews: d.totalViews || 0,
        shortlistRate: d.shortlistRate || 0,
      };
    } catch (err: any) {
      console.error("getDashboardSummary failed:", err.response?.data || err.message);
      return {
        activeJobs: 0, totalApplications: 0, pendingApplications: 0,
        shortlistedApplications: 0, feedbackReports: 0, totalViews: 0, shortlistRate: 0,
      };
    }
  },

  // ── Feedback ───────────────────────────────────────────────────────────────

  async getFeedbacks(): Promise<GraduateFeedback[]> {
    try {
      const response = await apiClient.get('/employer/feedback');
      return (response.data.data || []).map((f: any) => ({
        id: f.id,
        graduateName: f.alumni?.user?.email?.split('@')[0] || 'Graduate',
        role: f.role || 'Employee',
        department: f.alumni?.department?.name || 'N/A',
        performanceRating: Math.round(
          ((f.technicalSkill || 0) + (f.communicationSkill || 0) + (f.leadershipSkill || 0) +
            (f.teamworkSkill || 0) + (f.problemSolvingSkill || 0) + (f.innovationSkill || 0)) / 6
        ),
        feedbackText: f.feedbackText || '',
        submittedAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      }));
    } catch (err: any) {
      console.error("getFeedbacks failed:", err.response?.data || err.message);
      return [];
    }
  },

  // ── Talent Search (uses backend) ───────────────────────────────────────────

  async searchTalent(filters: TalentSearchFilters): Promise<CandidateApplication[]> {
    try {
      const params: any = {};
      if (filters.query) params.search = filters.query;
      if (filters.department) params.department = filters.department;
      if (filters.graduationYear) params.graduationYear = filters.graduationYear;
      if (filters.minimumCgpa) params.minCgpa = filters.minimumCgpa;
      if (filters.skills?.length) params.skills = filters.skills.join(',');

      const response = await apiClient.get('/employer/talent', { params });
      return (response.data.data?.data || response.data.data || []).map((a: any) => ({
        id: a.id,
        alumnusName: a.fullName || 'Alumni',
        alumnusEmail: a.email || 'No Contact Info',
        jobTitle: 'Talent Pool',
        department: a.department?.name || 'N/A',
        graduationYear: a.graduationYear?.toString() || 'N/A',
        cgpa: a.cgpa === null ? 'Hidden (Privacy Setting)' : a.cgpa?.toString() || 'N/A',
        skills: a.skills || [],
        status: 'Pending' as CandidateApplication['status'],
        appliedDate: 'N/A',
        resumeUrl: a.resumeUrl || null,
        coverLetter: '',
      }));
    } catch (err: any) {
      console.error("searchTalent failed:", err.response?.data || err.message);
      return [];
    }
  },

  async sendMessageToAlumni(alumniId: string, message: string): Promise<void> {
    await apiClient.post(`/employer/talent/${alumniId}/message`, { message });
  },

  async requestCvFromAlumni(alumniId: string): Promise<void> {
    await apiClient.post(`/employer/talent/${alumniId}/request-cv`);
  },

  // ── Direct Messages (real backend) ─────────────────────────────────────

  async getConversations(): Promise<any[]> {
    try {
      const response = await apiClient.get('/employer/messages');
      return response.data.data || [];
    } catch (err: any) {
      console.error("getConversations failed:", err.response?.data || err.message);
      return [];
    }
  },

  async sendDirectMessage(alumniId: string, text: string): Promise<any> {
    const response = await apiClient.post('/employer/messages', { alumniId, text });
    return response.data.data;
  },

  // ── Submit Feedback (by alumni name) ───────────────────────────────────

  async submitFeedback(feedback: {
    alumnusName: string;
    department: string;
    technicalSkills: number;
    communication: number;
    leadership: number;
    teamwork: number;
    problemSolving: number;
    comments: string;
  }): Promise<any> {
    const response = await apiClient.post('/employer/feedback/by-name', feedback);
    return response.data.data;
  },

  // ── Logo Upload ────────────────────────────────────────────────────────

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post('/employer/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.logoUrl;
  },

  // kept for backward compat – deprecated
  getMessages(): Message[] {
    try {
      const stored = localStorage.getItem('employer_messages');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  saveMessages(messages: Message[]): void {
    localStorage.setItem('employer_messages', JSON.stringify(messages));
  },
};
