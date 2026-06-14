// Department Head Portal Type Definitions

export interface DepartmentMetric {
  id: number;
  label: string;
  value: string;
  color: string;
  icon: string;
  bgGradient: string;
  trend: string;
  trendIcon: string;
}

export interface EmploymentData {
  overallRate: number;
  timeToHire: string;
  averageSalary: string;
  industryMatch: number;
  industryDistribution: IndustryDistribution[];
  employmentByDepartment: EmploymentByDepartment[];
}

export interface IndustryDistribution {
  name: string;
  percentage: number;
  color: string;
}

export interface EmploymentByDepartment {
  name: string;
  rate: number;
  color: string;
}

export interface EmployerFeedbackData {
  strengths: SkillRating[];
  improvements: SkillRating[];
  recommendations: string[];
}

export interface SkillRating {
  skill: string;
  rating: number;
}

export interface SkillGapData {
  missingSkills: string[];
  marketDemand: string[];
  weakCurriculumAreas: WeakCurriculumArea[];
}

export interface WeakCurriculumArea {
  area: string;
  gap: string;
  recommendation: string;
}

export interface TracerSurveyData {
  sixMonthCompletion: number;
  twelveMonthCompletion: number;
  twentyFourMonthCompletion: number;
  employmentStatusOverTime: EmploymentStatus[];
  salaryProgression: SalaryProgression[];
}

export interface EmploymentStatus {
  period: string;
  employed: number;
  seeking: number;
  other: number;
}

export interface SalaryProgression {
  period: string;
  avg: string;
  growth: string;
}

export interface CurriculumInsight {
  additions: CourseAddition[];
  technologyUpdates: TechnologyUpdate[];
  outdatedTopics: OutdatedTopic[];
}

export interface CourseAddition {
  course: string;
  priority: string;
  reason: string;
}

export interface TechnologyUpdate {
  tech: string;
  current: string;
  recommended: string;
}

export interface OutdatedTopic {
  topic: string;
  reason: string;
}

export interface AccreditationReport {
  id: string;
  title: string;
  format: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
}

export interface DepartmentFilterState {
  timeRange: '6months' | '12months' | '24months' | 'all';
  department: string;
  year: string;
}

export interface DepartmentOverview {
  employmentRate: number;
  graduateCount: number;
  averageSalary: string;
  tracerCompletion: number;
  topEmployers: number;
  skillGaps: number;
}

export interface ExportReport {
  title: string;
  format: string;
  icon: string;
  color: string;
}
