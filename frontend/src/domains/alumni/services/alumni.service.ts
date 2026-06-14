import { get, post, put, del } from '../../../shared/services/api';
import type {
  AlumniProfile,
  JobMatch,
  TracerSurvey,
  Mentor,
  CareerEvent,
  DocumentRequest,
  AlumniPreferences,
  SkillPathway,
  AlumniDocumentRequestInput,
} from '../types/alumni.types';

const BASE = '/alumni';

export const alumniService = {
  async getProfile(): Promise<AlumniProfile> {
    return get<AlumniProfile>(`${BASE}/me`);
  },

  async updateProfile(data: Partial<AlumniProfile>): Promise<AlumniProfile> {
    return put<AlumniProfile>(`${BASE}/me`, data);
  },

  async getJobMatches(): Promise<JobMatch[]> {
    return [];
  },

  async getTracerSurveys(): Promise<TracerSurvey[]> {
    return [];
  },

  async getMentors(): Promise<Mentor[]> {
    return [];
  },

  async getCareerEvents(): Promise<CareerEvent[]> {
    return [];
  },

  async getDocumentRequests(): Promise<DocumentRequest[]> {
    return get<DocumentRequest[]>(`${BASE}/document-requests`);
  },

  async createDocumentRequest(input: AlumniDocumentRequestInput): Promise<DocumentRequest> {
    return post<DocumentRequest>(`${BASE}/document-requests`, {
      documentType: input.documentType,
      additionalInstructions: input.additionalInstructions,
    });
  },

  async getPreferences(): Promise<AlumniPreferences> {
    const profile = await get<any>(`${BASE}/me`);
    return {
      emailJobs: profile.emailJobs ?? true,
      emailSurveys: profile.emailSurveys ?? true,
      emailMentorship: profile.emailMentorship ?? true,
      profileVisibleToEmployers: profile.profileVisibleToEmployers ?? false,
      profileVisibleToPeers: profile.profileVisibleToPeers ?? false,
      emailEvents: profile.emailEvents ?? true,
      emailNewsletter: profile.emailNewsletter ?? false,
      smsNotifications: profile.smsNotifications ?? false,
      profileVisibleToAlumni: profile.profileVisibleToAlumni ?? true,
      anonymousTracerResponses: profile.anonymousTracerResponses ?? false,
      shareAchievementsPublic: profile.shareAchievementsPublic ?? true,
    };
  },

  async updatePreferences(_prefs: AlumniPreferences): Promise<void> {
    await put(`${BASE}/me`, _prefs);
  },

  async getSkillPathways(): Promise<SkillPathway[]> {
    return [];
  },
};

export function calculateCompletion(profile: AlumniProfile): number {
  if (!profile) return 0;
  let score = 0;
  const total = 7;
  if (profile.fullName) score++;
  if (profile.email) score++;
  if (profile.phone) score++;
  if (profile.skills?.length) score++;
  if (profile.linkedIn || profile.gitHub || profile.portfolio) score++;
  if (profile.dateOfBirth) score++;
  if (profile.profilePicture) score++;
  return Math.round((score / total) * 100);
}
