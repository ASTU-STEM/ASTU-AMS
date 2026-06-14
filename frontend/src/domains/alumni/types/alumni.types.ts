export interface WorkExperience {
  id: string;
  alumniId: string;
  companyName: string;
  position: string;
  industry: string;
  salaryRange?: string;
  location?: string;
  isCurrent: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface AlumniProfile {
  id: string;
  userId?: string;
  studentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  cgpa: number;
  graduationYear: number;
  gender: string;
  dateOfBirth?: string;
  departmentId: string;
  department?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  employmentStatus: 'EMPLOYED' | 'UNEMPLOYED' | 'SELF_EMPLOYED';
  salary?: number;
  isVerified: boolean;
  profilePicture?: string;
  skills: string[];
  resumeUrl?: string;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  telegram?: string;
  experiences?: WorkExperience[];
  createdAt: string;
  updatedAt: string;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  description: string;
  requirements: string[];
  skillsRequired?: string[];
  deadline: string;
  postedDate: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'FILLED';
  applied: boolean;
  saved: boolean;
  match?: number;
  applicationStatus?: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
  department?: string;
  experienceLevel?: string;
}

export interface TracerSurvey {
  id: string;
  title: string;
  description: string;
  type: 'SIX_MONTH' | 'TWELVE_MONTH' | 'EIGHTEEN_MONTH' | 'TWENTY_FOUR_MONTH' | 'CUSTOM';
  milestoneMonths?: number;
  isActive: boolean;
  isArchived: boolean;
  deadline?: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completedAt?: string;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'RATING' | 'NUMBER' | 'DATE';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options: string[];
  order: number;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  department: string;
  skills: string[];
  bio: string;
  avatarUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  sessions?: MentorshipSession[];
}

export interface MentorshipSession {
  id: string;
  date: string;
  time: string;
  topic: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  meetLink?: string;
}

export interface DocumentRequest {
  id: string;
  documentType: 'TRANSCRIPT' | 'DEGREE_VERIFICATION' | 'RECOMMENDATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  additionalInstructions?: string;
  notes?: string;
  contactEmail?: string;
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'ONLINE' | 'IN_PERSON';
  registered: boolean;
  capacity?: number;
  registeredCount?: number;
}

export interface AlumniPreferences {
  emailJobs: boolean;
  emailSurveys: boolean;
  emailMentorship: boolean;
  profileVisibleToEmployers: boolean;
  profileVisibleToPeers: boolean;
  emailEvents: boolean;
  emailNewsletter: boolean;
  smsNotifications: boolean;
  profileVisibleToAlumni: boolean;
  anonymousTracerResponses: boolean;
  shareAchievementsPublic: boolean;
}

export interface AlumniNotification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AlumniDashboardSummary {
  profileCompletion: number;
  openJobMatches: number;
  savedJobs: number;
  appliedJobs: number;
  pendingSurveys: number;
  documentRequests: number;
  activeMentorships: number;
  unreadMessages: number;
  upcomingEvents: number;
  networkConnections: number;
}

export interface AlumniEmploymentUpdate {
  currentRole: string;
  company: string;
  salaryRange: string;
}

export interface AlumniDocumentRequestInput {
  documentType: 'TRANSCRIPT' | 'DEGREE_VERIFICATION' | 'RECOMMENDATION';
  additionalInstructions?: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  category: string;
  donorCount: number;
}

export interface ForumPost {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  liked: boolean;
}

export interface SkillPathway {
  id: string;
  title: string;
  description: string;
  skills: string[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  jobs: string[];
  popularity: number;
}

export interface AlumniJobFilters {
  query: string;
  type?: string;
  location: string;
  minimumMatch?: number;
  savedOnly?: boolean;
}

export interface TracerSchedule {
  id: string;
  surveyId: string;
  title: string;
  type: string;
  batch: string;
  department: string;
  scheduledDate: string;
  status: string;
  sentCount: number;
  totalCount: number;
  responseCount: number;
}
