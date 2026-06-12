import { 
  AlumniProfile, 
  CareerMilestone, 
  JobMatch, 
  TracerSurvey, 
  Mentor, 
  CareerEvent, 
  DocumentRequest, 
  AlumniPreferences,
  DonationCampaign,
  ForumPost,
  SkillPathway,
} from '../types/alumni.types';

const emptyProfile: AlumniProfile = {
  fullName: '', email: '', phone: '', studentId: '', batch: '', department: '',
  cgpa: '', currentRole: '', company: '', salaryRange: '', bio: '', avatarUrl: '',
  skills: [], resume: null,
};

const emptyPreferences: AlumniPreferences = {
  emailJobs: false, emailSurveys: false, emailMentorship: false,
  profileVisibleToEmployers: false, profileVisibleToPeers: false,
  emailEvents: false, emailNewsletter: false, smsNotifications: false,
  profileVisibleToAlumni: false, anonymousTracerResponses: false,
  shareAchievementsPublic: false,
};

export const getAlumniProfile = (): AlumniProfile => ({ ...emptyProfile });
export const saveAlumniProfile = (_profile: AlumniProfile): void => {};

export const getMilestones = (): CareerMilestone[] => [];
export const saveMilestones = (_milestones: CareerMilestone[]): void => {};

export const getJobMatches = (): JobMatch[] => [];
export const saveJobMatches = (_jobs: JobMatch[]): void => {};

export const getTracerSurveys = (): TracerSurvey[] => [];
export const saveTracerSurveys = (_surveys: TracerSurvey[]): void => {};

export const getMentors = (): Mentor[] => [];
export const saveMentors = (_mentors: Mentor[]): void => {};

export const getDocumentRequests = (): DocumentRequest[] => [];
export const saveDocumentRequests = (_docs: DocumentRequest[]): void => {};

export const getAlumniPreferences = (): AlumniPreferences => ({ ...emptyPreferences });
export const saveAlumniPreferences = (_prefs: AlumniPreferences): void => {};

export const getCareerEvents = (): CareerEvent[] => [];
export const saveCareerEvents = (_events: CareerEvent[]): void => {};

export const getDonationCampaigns = (): DonationCampaign[] => [];
export const saveDonationCampaigns = (_campaigns: DonationCampaign[]): void => {};

export const getForumPosts = (): ForumPost[] => [];
export const saveForumPosts = (_posts: ForumPost[]): void => {};

export const getSkillPathways = (): SkillPathway[] => [];
export const saveSkillPathways = (_pathways: SkillPathway[]): void => {};

export interface AlumniNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  category: 'jobs' | 'survey' | 'documents' | 'mentorship' | 'profile';
}

export const getAlumniNotifications = (): AlumniNotification[] => [];
export const saveAlumniNotifications = (_notifications: AlumniNotification[]): void => {};

export const calculateCompletion = (_profile: AlumniProfile): number => 0;
