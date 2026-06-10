// Skill Gap Analysis & Workforce Demand Intelligence Type Definitions

export interface SkillGapFilterState {
  department: string;
  program: string;
  graduationBatch: string;
  industry: string;
  skillCategory: string;
  gapSeverity: string;
  dateRange: string;
}

export interface SkillGapKPIMetric {
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

export interface SkillGapOverview {
  totalSkills: number;
  skillsMatched: number;
  skillsMissing: number;
  skillsPartiallyCovered: number;
  skillsToPrioritize: number;
}

export interface DemandSupplySkill {
  skill: string;
  category: string;
  demandLevel: number;
  coverageLevel: number;
  gapScore: number;
  trend: number;
}

export interface DepartmentGap {
  department: string;
  gapScore: number;
  strongestSkill: string;
  weakestSkill: string;
  improvementTrend: number;
  priorityRanking: number;
}

export interface EmergingTechnology {
  technology: string;
  growthRate: number;
  adoptionPotential: number;
  curriculumReadiness: number;
  laborMarketRelevance: number;
  trend: number;
}

export interface CertificationGap {
  certification: string;
  demand: number;
  trainingGap: number;
  labToolingGap: number;
  recommended: boolean;
}

export interface SkillGapRecommendation {
  id: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  affectedDepartments: string[];
  rationale: string;
  impactLevel: 'high' | 'medium' | 'low';
  suggestedTimeline: string;
}

export interface SkillGapInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
  recommendation?: string;
}

export interface SkillGapRecord {
  id: string;
  skill: string;
  category: string;
  demandLevel: number;
  coverageLevel: number;
  gapScore: number;
  affectedDepartment: string;
  recommendedAction: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
}

export interface SkillGapExportOption {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv';
  icon: string;
  description: string;
}
