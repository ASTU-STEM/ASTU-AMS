export interface AnalyticsSummary {
  totalAlumni: number;
  totalEmployers: number;
  totalJobs: number;
  totalSurveys: number;
  employmentRate: number;
  averageTimeToHire: number;
  averageSalary: string;
  responseRate: number;
}

export interface EmploymentTrend {
  month: string;
  employed: number;
  unemployed: number;
  inEducation: number;
}

export interface DepartmentStat {
  department: string;
  graduates: number;
  employed: number;
  employmentRate: number;
  averageSalary: string;
  responseRate: number;
}

export interface SkillGap {
  skill: string;
  demandLevel: number;
  supplyLevel: number;
  gap: number;
  category: string;
}

export interface EmployerFeedbackMetric {
  company: string;
  competencyRating: number;
  communicationRating: number;
  technicalRating: number;
  overallRating: number;
  responses: number;
}

export interface SalaryDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface TopEmployer {
  company: string;
  hires: number;
  averageSalary: string;
  departments: string[];
}

export interface TracerMetric {
  interval: string;
  sent: number;
  responded: number;
  responseRate: number;
}
