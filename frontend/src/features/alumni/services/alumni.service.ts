import axios from 'axios';
import {
  AlumniDashboardSummary,
  AlumniDocumentRequestInput,
  AlumniEmploymentUpdate,
  AlumniJobFilters,
  AlumniProfile,
  DocumentRequest,
  JobMatch,
  MentorshipSession,
  TracerSurvey,
  DonationCampaign,
  ForumPost,
  SkillPathway,
  CareerMilestone,
  Mentor,
  CareerEvent,
  AlumniPreferences
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/alumni`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AlumniWorkspace {
  profile: AlumniProfile;
  jobs: JobMatch[];
  surveys: TracerSurvey[];
  mentors: Mentor[];
  events: CareerEvent[];
  documents: DocumentRequest[];
  preferences: AlumniPreferences;
  donations: DonationCampaign[];
  forum: ForumPost[];
  pathways: SkillPathway[];
  milestones: CareerMilestone[];
}

export const alumniService = {
  async getWorkspace(): Promise<AlumniWorkspace> {
    const res = await apiClient.get('/workspace');
    return res.data.data;
  },

  async getDashboardSummary(): Promise<AlumniDashboardSummary> {
    const res = await apiClient.get('/dashboard-summary');
    return res.data.data;
  },

  async updateEmploymentStatus(update: AlumniEmploymentUpdate): Promise<AlumniProfile> {
    const res = await apiClient.put('/employment-status', update);
    return res.data.data;
  },

  async filterJobs(filters: AlumniJobFilters): Promise<JobMatch[]> {
    const res = await apiClient.get('/jobs', { params: filters });
    return res.data.data;
  },

  sortJobs(jobs: JobMatch[], sortBy: 'match' | 'recent' | 'salary' | 'views'): JobMatch[] {
    const sorted = [...jobs];
    const parseMatch = (match: string) => Number.parseInt(match.replace('%', ''), 10) || 0;
    switch (sortBy) {
      case 'match': return sorted.sort((a, b) => parseMatch(b.match) - parseMatch(a.match));
      case 'recent': return sorted.sort((a, b) => (b.applications || 0) - (a.applications || 0));
      case 'salary': return sorted.sort((a, b) => parseInt(b.salary) - parseInt(a.salary));
      case 'views': return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default: return sorted;
    }
  },

  async applyToJob(jobId: string): Promise<JobMatch[]> {
    const res = await apiClient.post(`/jobs/${jobId}/apply`);
    return res.data.data;
  },

  async withdrawApplication(jobId: string): Promise<JobMatch[]> {
    const res = await apiClient.post(`/jobs/${jobId}/withdraw`);
    return res.data.data;
  },

  async requestDocument(input: AlumniDocumentRequestInput): Promise<DocumentRequest[]> {
    const res = await apiClient.post('/documents', input);
    return res.data.data;
  },

  async completeSurvey(surveyId: string): Promise<TracerSurvey[]> {
    const res = await apiClient.post(`/surveys/${surveyId}/complete`);
    return res.data.data;
  },

  async scheduleMentorshipSession(mentorId: string, session: any): Promise<Mentor[]> {
    const res = await apiClient.post('/mentorship/sessions', { mentorId, ...session });
    return res.data.data;
  },

  async makeDonation(campaignId: string, amount: number): Promise<DonationCampaign[]> {
    const res = await apiClient.post('/donations', { campaignId, amount });
    return res.data.data;
  },

  async toggleForumLike(postId: string): Promise<ForumPost[]> {
    const res = await apiClient.post(`/forum/posts/${postId}/like`);
    return res.data.data;
  },

  async addForumPost(post: Omit<ForumPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'liked'>): Promise<ForumPost[]> {
    const res = await apiClient.post('/forum/posts', post);
    return res.data.data;
  },

  async addMilestone(milestone: Omit<CareerMilestone, 'id'>): Promise<CareerMilestone[]> {
    const res = await apiClient.post('/milestones', milestone);
    return res.data.data;
  },

  async saveProfile(profile: AlumniProfile) {
    return apiClient.put('/me', profile);
  },
  
  saveJobs: () => {},
  saveSurveys: () => {},
  saveMentors: () => {},
  saveEvents: () => {},
  saveDocuments: () => {},
  savePreferences: () => {},
  saveMilestones: () => {},
  saveDonations: () => {},
  saveForum: () => {},
  savePathways: () => {}
};
