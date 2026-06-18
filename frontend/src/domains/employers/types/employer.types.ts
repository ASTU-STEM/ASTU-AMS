export interface CompanyProfile {
  id?: string;
  userId?: string;
  companyName: string;
  industry: string;
  website?: string;
  location: string;
  hrContact: string;
  tin?: string;
  logoUrl?: string;
  isVerified?: boolean;
  description?: string;
  companySize?: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
}

export interface EmployerJob {
  id: string;
  employerId?: string;
  title: string;
  description: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  deadline: string;
  experienceRequired: number;
  skillsRequired: string[];
  location: string;
  employmentType: string;
  isActive?: boolean;
  responsibilities?: string;
  requirements?: string;
  experienceLevel?: string;
  department?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  applicationsCount?: number;
  shortlistedCount?: number;
  viewsCount?: number;
  postedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateApplication {
  id: string;
  jobId: string;
  alumniId?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
  jobTitle?: string;
  alumnusName?: string;
  alumnusEmail?: string;
  cgpa?: number;
  department?: string;
  graduationYear?: number;
  skills?: string[];
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraduateFeedback {
  id: string;
  employerId?: string;
  alumniId?: string;
  technicalSkill: number;
  communicationSkill: number;
  leadershipSkill: number;
  teamworkSkill: number;
  problemSolvingSkill: number;
  innovationSkill?: number;
  feedbackText?: string;
  overallSatisfaction?: number;
  missingSkills?: string[];
  technologiesNeeded?: string[];
  wouldHireAgain?: boolean;
  alumnusName?: string;
  department?: string;
  createdAt: string;
}

export interface EmployerDashboardSummary {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  feedbackReports: number;
  totalViews: number;
  shortlistRate: number;
}

export interface TalentSearchFilters {
  query: string;
  department: string;
  graduationYear: string;
  skills: string[];
  minimumCgpa?: number;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  interviewer: string;
  interviewDate: string;
  interviewType: 'ONLINE' | 'IN_PERSON' | 'PHONE';
  meetingLink?: string;
  location?: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  candidateName?: string;
  jobTitle?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  unread: boolean;
}

export interface PartnershipOpportunity {
  id: string;
  title: string;
  type: string;
  owner: string;
  status: string;
  nextStep: string;
}

export interface TalentAlumni {
  id: string;
  avatarUrl?: string;
  name: string;
  department: string;
  graduationYear: number;
  cgpa: number;
  skills: string[];
  location: string;
  experience: string;
}

export type EmployerProfile = CompanyProfile;
