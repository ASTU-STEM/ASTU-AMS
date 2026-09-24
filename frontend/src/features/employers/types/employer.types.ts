export interface CompanyProfile {
  name: string;
  registrationNumber?: string;
  industry: string;
  size?: string;
  website: string;
  location: string;
  tin?: string;
  hrName?: string;
  hrContact?: string;
  contactPerson?: string;
  hrEmail?: string;
  contactEmail?: string;
  hrPhone?: string;
  phone?: string;
  logoUrl: string;
  description: string;
  isPremium?: boolean;
  partnerships?: string[];
  verificationStatus?: string;
  ndaSigned?: boolean;
}

export interface EmployerJob {
  id: number;
  title: string;
  type: 'Full-Time' | 'Internship' | 'Contract';
  location: string;
  salaryRange: string;
  experienceRequired: string;
  description: string;
  skillsRequired: string[];
  status: 'Open' | 'Closed';
  postedDate: string;
  applicationsCount: number;
  shortlistedCount: number;
  viewsCount: number;
  recommendations?: CandidateApplication[];
}

export interface CandidateApplication {
  id: number;
  alumniId?: string;
  userId?: string;
  jobId?: number;
  jobTitle: string;
  alumnusName: string;
  alumnusEmail: string;
  alumnusAvatar?: string;
  cgpa: string;
  department: string;
  graduationYear: string;
  skills: string[];
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Accepted' | 'Rejected';
  appliedDate: string;
  cvFileName?: string;
  resumeUrl?: string;
  coverLetter?: string;

  // Extended Profile Fields from My Profile
  phone?: string;
  studentId?: string;
  bio?: string;
  nationality?: string;
  gender?: string;
  languages?: string[];
  volunteerWork?: string;
  currentAddress?: string;
  honors?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  certifications?: Array<{ id?: string; title: string; issuer?: string; issueDate?: string; expiryDate?: string; credentialUrl?: string }>;
  experiences?: Array<{ id?: string; title: string; company: string; location?: string; startDate?: string; endDate?: string; current?: boolean; description?: string }>;
  projects?: Array<{ id?: string; title: string; description?: string; link?: string; technologies?: string[] }>;
  achievements?: Array<{ id?: string; title: string; issuer?: string; date?: string; description?: string }>;
}

export interface GraduateFeedback {
  id: number;
  alumnusName: string;
  department: string;
  technicalSkills: number; // 1-5
  communication: number; // 1-5
  leadership: number; // 1-5
  teamwork: number; // 1-5
  problemSolving: number; // 1-5
  comments: string;
  submittedAt: string;
}

export interface Message {
  id: number;
  sender: 'Alumni' | 'Employer' | 'Admin';
  senderName: string;
  text: string;
  timestamp: string;
  unread: boolean;
}

export interface EmployerDashboardSummary {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredApplications?: number;
  feedbackReports: number;
  totalViews: number;
  shortlistRate: number;
}

export interface EmployerNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  category: 'applications' | 'messages' | 'jobs' | 'feedback' | 'partnerships';
}

export interface TalentSearchFilters {
  query: string;
  department: string;
  graduationYear: string;
  skills: string[];
  minimumCgpa?: number;
  status?: CandidateApplication['status'] | 'All';
}

export interface InterviewSchedule {
  id: number;
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  mode: 'In Person' | 'Phone' | 'Video';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface PartnershipOpportunity {
  id: number;
  title: string;
  type: 'Internship Pipeline' | 'Research Collaboration' | 'Career Event' | 'Sponsorship';
  owner: string;
  status: 'Draft' | 'Active' | 'Completed';
  nextStep: string;
}
