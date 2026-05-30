// Accreditation Reports & Executive Reporting Type Definitions

export interface AccreditationFilterState {
  department: string;
  academicYear: string;
  graduationBatch: string;
  accreditationCycle: string;
  reportType: string;
  dateRange: string;
}

export interface AccreditationKPIMetric {
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

export interface AccreditationOverview {
  overallReadinessStatus: 'ready' | 'in-progress' | 'needs-work';
  totalEvidenceItems: number;
  missingEvidenceItems: number;
  completedEvidenceItems: number;
  pendingComplianceAreas: number;
}

export interface TracerEvidence {
  surveyCompletionRate: number;
  responseRateByBatch: number;
  employmentOutcomes: number;
  salaryProgression: number;
  alignmentMetrics: number;
  geographicDistribution: number;
}

export interface EmployerEvidence {
  employerResponseRate: number;
  satisfactionScores: number;
  competencyRatings: number;
  industryDemandTrends: number;
  recommendationsFrequency: number;
  repeatEmployerEngagement: number;
}

export interface SkillGapEvidence {
  criticalSkillGaps: number;
  industryDemand: number;
  coverageRate: number;
  trainingPriorities: number;
  certificationGaps: number;
  departmentRiskAreas: number;
}

export interface CurriculumEvidence {
  alignmentScore: number;
  outdatedCourses: number;
  newCourseRecommendations: number;
  accreditationCompliance: number;
  practicalTheoryBalance: number;
  updatePriorities: number;
}

export interface ComplianceStatus {
  compliantItems: number;
  partiallyCompliantItems: number;
  nonCompliantItems: number;
  actionRequired: number;
  completionEstimate: string;
  responsibleArea: string;
}

export interface AccreditationEvidenceRecord {
  id: string;
  evidenceItem: string;
  category: string;
  source: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  completion: number;
  owner: string;
  lastUpdated: string;
  actionRequired: string;
}

export interface AccreditationInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'concern';
  title: string;
  description: string;
  metric: string;
  value: string;
  recommendation?: string;
}

export interface AccreditationExportOption {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv';
  icon: string;
  description: string;
}
