// Curriculum Insights & Academic Alignment Intelligence Type Definitions

export interface CurriculumFilterState {
  department: string;
  program: string;
  courseCategory: string;
  academicYear: string;
  industryAlignment: string;
  skillCoverage: string;
  accreditationRequirement: string;
}

export interface CurriculumKPIMetric {
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

export interface CurriculumOverview {
  totalCourses: number;
  alignedCourses: number;
  partiallyAlignedCourses: number;
  misalignedCourses: number;
  coursesRequiringUpdate: number;
}

export interface CourseAlignment {
  course: string;
  department: string;
  alignmentScore: number;
  skillCoverage: number;
  industryRelevance: number;
  status: 'aligned' | 'partial' | 'outdated';
  updateRequired: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface NewCourseRecommendation {
  id: string;
  course: string;
  justification: string;
  demandLevel: number;
  industryRelevance: number;
  expectedImpact: 'high' | 'medium' | 'low';
  priorityRanking: number;
  suggestedDepartment: string;
}

export interface CourseUpdate {
  course: string;
  department: string;
  outdatedModules: string[];
  missingTechnologies: string[];
  labDeficiencies: string[];
  suggestedUpdates: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface AccreditationAlignment {
  complianceScore: number;
  learningOutcomeCoverage: number;
  graduateOutcomeMapping: number;
  curriculumAuditStatus: 'compliant' | 'partial' | 'non-compliant';
  etaReadiness: number;
}

export interface IndustryAlignment {
  alignmentScore: number;
  employerDemandMatch: number;
  curriculumRelevance: number;
  skillToIndustryMapping: number;
  sectorCoverage: {
    sector: string;
    coverage: number;
  }[];
}

export interface CurriculumInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
  recommendation?: string;
}

export interface CurriculumRecord {
  id: string;
  course: string;
  department: string;
  alignmentScore: number;
  industryRelevance: number;
  status: 'aligned' | 'partial' | 'outdated';
  updateRequired: boolean;
  priority: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

export interface CurriculumExportOption {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv';
  icon: string;
  description: string;
}
