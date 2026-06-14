export interface Job {
  id: string;
  employerId?: string;
  title: string;
  company?: string;
  companyLogo?: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  category?: string;
  description: string;
  requirements?: string;
  skillsRequired?: string[];
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  deadline: string;
  experienceRequired: number;
  createdAt: string;
  updatedAt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'ARCHIVED';
  applicationsCount?: number;
  department?: string;
  experienceLevel?: string;
  responsibilities?: string;
  isActive?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  alumniId: string;
  alumniName?: string;
  alumniEmail?: string;
  alumniDepartment?: string;
  graduationYear?: number;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface JobBookmark {
  id: string;
  jobId: string;
  alumniId: string;
  createdAt: string;
}
