// Tracer Reports Type Definitions

export interface TracerFilterState {
  department: string;
  tracerPeriod: '6months' | '12months' | '24months' | 'all';
  graduationBatch: string;
  academicYear: string;
  employmentStatus: string;
}

export interface TracerKPIMetric {
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

export interface TracerTimelineData {
  period: string;
  participationRate: number;
  employmentRate: number;
  satisfactionRate: number;
  alignmentScore: number;
}

export interface SurveyCompletionData {
  category: string;
  completionRate: number;
  totalGraduates: number;
  responded: number;
  trend: number;
}

export interface EmploymentOutcomeData {
  status: string;
  count: number;
  percentage: number;
  color: string;
  trend?: number;
}

export interface CareerAlignmentData {
  metric: string;
  score: number;
  trend: number;
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
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

export interface GeographicData {
  region: string;
  country: string;
  count: number;
  percentage: number;
  trend: number;
}

export interface TracerInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
  recommendation?: string;
}

export interface TracerRecord {
  id: string;
  graduate: string;
  batch: string;
  surveyType: string;
  surveyDate: string;
  employmentStatus: string;
  company: string;
  country: string;
  salaryRange: string;
  alignmentScore: number;
  satisfactionScore: number;
}

export interface TracerExportOption {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv';
  icon: string;
  description: string;
}
