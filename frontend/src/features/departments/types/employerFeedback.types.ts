// Employer Feedback & Industry Intelligence Type Definitions

export interface EmployerFeedbackFilterState {
  department: string;
  graduationBatch: string;
  industry: string;
  employer: string;
  employmentType: string;
  dateRange: string;
  ratingRange: string;
}

export interface EmployerFeedbackKPIMetric {
  id: string;
  label: string;
  value: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  comparison: string;
  color: string;
  icon: string;
  tooltip: string;
  sparkline: number[];
}

export interface SatisfactionMetric {
  category: string;
  score: number;
  trend: number;
  breakdown: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export interface CompetencyScore {
  competency: string;
  score: number;
  trend: number;
  benchmark: number;
  topDepartment: number;
}

export interface IndustryDemandSkill {
  skill: string;
  demand: number;
  trend: number;
  growthRate: number;
  hiringProjection: number;
  industries: string[];
}

export interface EmployerRecommendation {
  id: string;
  category: 'curriculum' | 'laboratory' | 'internship' | 'research' | 'softSkills' | 'certification';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  frequency: number;
  impactLevel: 'high' | 'medium' | 'low';
  sourceEmployers: string[];
}

export interface EmployerEngagement {
  employer: string;
  industry: string;
  participationRate: number;
  graduatesHired: number;
  internshipProvided: boolean;
  recruitmentPartner: boolean;
  collaborationScore: number;
  lastActivity: string;
}

export interface EmployerInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
  recommendation?: string;
}

export interface EmployerFeedbackRecord {
  id: string;
  employer: string;
  industry: string;
  department: string;
  rating: number;
  graduatesHired: number;
  satisfaction: number;
  recommendations: string[];
  lastActivity: string;
}

export interface EmployerExportOption {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv';
  icon: string;
  description: string;
}
