export interface AlumniProfile {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  batch: string;
  department: string;
  cgpa: string;
  currentRole: string;
  company: string;
  salaryRange: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  resume: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  } | null;
  linkedInUrl?: string;
  gitHubUrl?: string;
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
  applicationStatus?: 'Applied' | 'Under Review' | 'Interview Scheduled' | 'Offered';
  type: 'Full-Time' | 'Internship' | 'Contract';
}

export interface TracerSurvey {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string;
  type: '6-Month' | '12-Month' | '24-Month';
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'select' | 'text' | 'rating';
  options?: string[];
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
}

export interface AlumniPreferences {
  emailJobs: boolean;
  emailSurveys: boolean;
  emailMentorship: boolean;
  profileVisibleToEmployers: boolean;
  profileVisibleToPeers: boolean;
}

export interface AlumniNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  category: 'jobs' | 'survey' | 'documents' | 'mentorship' | 'profile';
}

export interface AlumniDashboardSummary {
  profileCompletion: number;
  openJobMatches: number;
  savedJobs: number;
  appliedJobs: number;
  pendingSurveys: number;
  documentRequests: number;
  activeMentorships: number;
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
