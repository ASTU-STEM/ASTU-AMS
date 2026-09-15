export interface ResumeFile {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  imageUrl?: string;
  description?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'award' | 'publication' | 'patent' | 'recognition';
}

export interface AlumniProfile {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  batch: string;
  graduationYear?: number | string;
  department: string;
  cgpa: string;
  currentRole: string;
  company: string;
  salaryRange: string;
  employmentStatus?: string;
  workLocation?: string;
  location?: string;
  industry?: string;
  bio: string;
  avatarUrl: string;
  profilePicture?: string;
  skills: string[];
  resume: ResumeFile | null;
  resumeUrl?: string;
  linkedInUrl?: string;
  linkedIn?: string;
  gitHubUrl?: string;
  gitHub?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  portfolio?: string;
  certifications?: Certification[];
  projects?: Project[];
  achievements?: Achievement[];
  languages?: string[];
  volunteerWork?: string;
  address?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
}

export interface CareerMilestone {
  id: number;
  year: string;
  title: string;
  company: string;
  description: string;
  type: 'academic' | 'professional' | 'achievement';
}

export interface JobMatch {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  match: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applied: boolean;
  saved: boolean;
  applicationStatus?: 'Applied' | 'Under Review' | 'Interview Scheduled' | 'Offered' | 'Rejected';
  type: 'Full-Time' | 'Internship' | 'Contract' | 'Part-Time';
  experience?: string;
  views?: number;
  applications?: number;
  shortlisted?: number;
  skills?: string[];
  companyLogo?: string;
  companySize?: string;
  industry?: string;
  appliedDate?: string;
  interviewDate?: string;
  offerDetails?: string;
  remoteOption?: 'remote' | 'hybrid' | 'on-site';
}

export interface TracerSurvey {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completedAt?: string;
  type: '6-Month' | '12-Month' | '24-Month' | 'Employer' | 'Alumni Satisfaction';
  questions: SurveyQuestion[];
  estimatedTime?: string;
  department?: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'select' | 'text' | 'rating' | 'multiselect' | 'scale' | 'date';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  batch: string;
  department: string;
  skills: string[];
  bio: string;
  avatarUrl: string;
  status: 'AVAILABLE' | 'REQUEST_PENDING' | 'CONNECTED';
  sessions?: MentorshipSession[];
}

export interface MentorshipSession {
  id: number;
  date: string;
  time: string;
  topic: string;
  status: 'Scheduled' | 'Completed';
  meetLink?: string;
}

export interface DocumentRequest {
  id: number;
  type: 'Official Transcript' | 'Degree Verification' | 'Temporary Certificate' | 'English Medium Certificate';
  requestDate: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Dispatched';
  notes?: string;
  issuedDocumentUrl?: string;
}

export interface CareerEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  description: string;
  registered: boolean;
  capacity?: number;
  registeredCount?: number;
  speaker?: string;
  time?: string;
  tags?: string[];
  virtualLink?: string;
  type: 'virtual' | 'in-person' | 'hybrid';
}

export interface AlumniPreferences {
  emailJobs: boolean;
  emailSurveys: boolean;
  emailMentorship: boolean;
  profileVisibleToEmployers: boolean;
  shareCgpaToEmployers?: boolean;
  profileVisibleToPeers: boolean;
  emailEvents: boolean;
  emailNewsletter: boolean;
  smsNotifications: boolean;
  profileVisibleToAlumni: boolean;
  anonymousTracerResponses: boolean;
  shareAchievementsPublic: boolean;
  digestFrequency?: 'instant' | 'weekly' | 'monthly';
  donationEnabled?: boolean;
}

export interface AlumniNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  category: 'jobs' | 'survey' | 'documents' | 'mentorship' | 'profile';
}

export interface DonationCampaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  category: 'scholarship' | 'research' | 'infrastructure' | 'general';
  donorCount: number;
}

export interface ForumPost {
  id: number;
  author: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  liked: boolean;
}

export interface SkillPathway {
  id: number;
  title: string;
  description: string;
  skills: string[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  jobs: string[];
  popularity: number;
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

export interface AlumniJobFilters {
  query: string;
  type: 'All' | JobMatch['type'];
  location: string;
  minimumMatch?: number;
  savedOnly?: boolean;
}

export interface AlumniDocumentRequestInput {
  type: DocumentRequest['type'];
  notes?: string;
}

export interface AlumniEmploymentUpdate {
  currentRole: string;
  company: string;
  salaryRange: string;
}

export interface EmployerRating {
  id: number;
  companyName: string;
  companyLogo: string;
  reviewerName: string;
  reviewerTitle: string;
  alumniName: string;
  alumniId: string;
  department: string;
  batch: string;
  rating: number;
  competencies: { name: string; score: number }[];
  feedback: string;
  date: string;
}

export interface EmployerProfile {
  id: number;
  companyName: string;
  companyLogo: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  size: string;
  verified: boolean;
  sponsored: boolean;
  openPositions: number;
}

export interface TelebirrPayment {
  id: string;
  amount: number;
  campaignId: number;
  donorName: string;
  phoneNumber: string;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  date: string;
}

export interface TracerSchedule {
  id: number;
  surveyId: number;
  title: string;
  type: string;
  batch: string;
  department: string;
  scheduledDate: string;
  status: 'scheduled' | 'sent' | 'partial';
  sentCount: number;
  totalCount: number;
  responseCount: number;
}
