export interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  category: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  applicationDeadline: string;
  postedDate: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'FILLED';
  applicationsCount: number;
  postedBy: string;
  department?: string;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
}

export interface JobApplication {
  id: number;
  jobId: number;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  alumniDepartment: string;
  graduationYear: number;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedDate: string;
  updatedDate: string;
  notes?: string;
}

export interface JobBookmark {
  id: number;
  jobId: number;
  alumniId: string;
  createdAt: string;
}
