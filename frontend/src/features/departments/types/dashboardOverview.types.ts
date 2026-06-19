// Dashboard Overview Type Definitions

export interface DashboardOverviewFilters {
  department: string;
  academicYear: string;
  tracerPeriod: string;
}

export interface KPICard {
  id: string;
  label: string;
  value: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  comparison: string;
  icon: string;
  tooltip: string;
  sparkline: number[];
  color: string;
}

export interface EmploymentTrendData {
  year: string;
  employmentRate: number;
  graduates: number;
  [key: string]: string | number; // Index signature for AnalyticsChart compatibility
}

export interface TracerCompletionData {
  status: 'completed' | 'pending' | 'overdue';
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for AnalyticsChart compatibility
}

export interface TopHiringCompany {
  name: string;
  graduateCount: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface TopIndustry {
  name: string;
  graduateCount: number;
  percentage: number;
}

export interface SkillGapItem {
  skill: string;
  demand: number;
  coverage: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  category: 'requested' | 'missing';
}

export interface EmployerFeedbackScore {
  category: string;
  score: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface CurriculumInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'strength' | 'weakness' | 'recommendation';
}

export interface RecentActivity {
  id: string;
  type: 'survey' | 'feedback' | 'report' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
