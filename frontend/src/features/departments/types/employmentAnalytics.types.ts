// Employment Analytics Type Definitions

export interface EmploymentAnalyticsFilters {
  department: string;
  batch: string;
  academicYear: string;
  employmentStatus: string;
}

export interface EmploymentKPIMetric {
  id: string;
  label: string;
  value: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  comparison: string;
  icon: string;
  color: string;
}

export interface EmploymentTrendData {
  year: string;
  employmentRate: number;
  graduates: number;
  [key: string]: string | number;
}

export interface EmploymentStatusData {
  status: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

export interface ProgramEmploymentData {
  program: string;
  employmentRate: number;
  graduates: number;
  [key: string]: string | number;
}

export interface HiringIndustry {
  name: string;
  graduateCount: number;
  percentage: number;
}

export interface HiringCompany {
  name: string;
  graduatesHired: number;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
  industry: string;
}

export interface GeographicDistribution {
  region: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

export interface GraduateEmploymentRecord {
  id: string;
  studentId: string;
  graduateName: string;
  department: string;
  graduationYear?: string;
  employmentStatus: string;
  company: string;
  jobTitle: string;
  country: string;
  salaryRange: string;
  timeToHire: string;
  email?: string;
  phone?: string;
  cgpa?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string | null;
  bio?: string;
  nationality?: string;
  maritalStatus?: string;
  address?: string;
  skills?: string[];
  languages?: string[];
  resumeUrl?: string | null;
  linkedIn?: string | null;
  gitHub?: string | null;
  portfolio?: string | null;
  telegram?: string | null;
  twitterUrl?: string | null;
  isVerified?: boolean;
  preferences?: any;
  experiences?: any[];
  certifications?: any[];
  projects?: any[];
  achievements?: any[];
  [key: string]: any;
}

export interface TopEmployer {
  employer: string;
  graduatesHired: number;
  industry: string;
  averageSalary: string;
  lastHireDate: string;
}

export interface EmploymentInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
}
