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
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
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
  graduationYear: string;
  employmentStatus: string;
  company: string;
  jobTitle: string;
  country: string;
  salaryRange: string;
  timeToHire: string;
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
