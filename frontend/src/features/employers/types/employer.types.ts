export interface CompanyProfile {
  name: string;
  registrationNumber: string;
  industry: string;
  website: string;
  location: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  logoUrl: string;
  description: string;
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
}

export interface CandidateApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  alumnusName: string;
  alumnusEmail: string;
  cgpa: string;
  department: string;
  graduationYear: string;
  skills: string[];
  status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
  appliedDate: string;
  cvFileName: string;
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
