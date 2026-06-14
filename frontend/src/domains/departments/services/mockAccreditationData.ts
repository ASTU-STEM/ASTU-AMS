// Mock Accreditation Reports & Executive Reporting Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  AccreditationKPIMetric,
  AccreditationOverview,
  TracerEvidence,
  EmployerEvidence,
  SkillGapEvidence,
  CurriculumEvidence,
  ComplianceStatus,
  AccreditationInsight,
  AccreditationEvidenceRecord
} from '../types/accreditation.types';

export const mockAccreditationKPIMetrics: AccreditationKPIMetric[] = [
  {
    id: 'readiness-score',
    label: 'Accreditation Readiness Score',
    value: '82%',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last cycle',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Overall ETA accreditation readiness score',
    sparkline: [75, 77, 78, 80, 82]
  },
  {
    id: 'tracer-participation',
    label: 'Tracer Participation Rate',
    value: '78%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Tracer study survey completion rate',
    sparkline: [70, 72, 74, 76, 78]
  },
  {
    id: 'employer-coverage',
    label: 'Employer Feedback Coverage',
    value: '72%',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Employer feedback response coverage',
    sparkline: [65, 67, 69, 70, 72]
  },
  {
    id: 'skill-gap-reduction',
    label: 'Skill Gap Reduction Index',
    value: '15%',
    trend: -5,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingDown',
    tooltip: 'Reduction in critical skill gaps',
    sparkline: [25, 22, 20, 18, 15]
  },
  {
    id: 'curriculum-alignment',
    label: 'Curriculum Alignment Score',
    value: '72%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Curriculum alignment with industry needs',
    sparkline: [65, 67, 69, 70, 72]
  },
  {
    id: 'employability-rate',
    label: 'Graduate Employability Rate',
    value: '85%',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Graduate employment within 6 months',
    sparkline: [80, 81, 82, 84, 85]
  },
  {
    id: 'evidence-completeness',
    label: 'Evidence Completeness Score',
    value: '88%',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last cycle',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Completeness of accreditation evidence',
    sparkline: [80, 82, 84, 86, 88]
  },
  {
    id: 'outstanding-items',
    label: 'Outstanding Compliance Items',
    value: '8',
    trend: -2,
    trendDirection: 'down',
    comparison: 'vs last cycle',
    color: 'astu-red',
    icon: 'TrendingDown',
    tooltip: 'Number of outstanding compliance items',
    sparkline: [15, 13, 11, 10, 8]
  }
];

export const mockAccreditationOverview: AccreditationOverview = {
  overallReadinessStatus: 'in-progress',
  totalEvidenceItems: 150,
  missingEvidenceItems: 12,
  completedEvidenceItems: 138,
  pendingComplianceAreas: 8
};

export const mockTracerEvidence: TracerEvidence = {
  surveyCompletionRate: 78,
  responseRateByBatch: 82,
  employmentOutcomes: 85,
  salaryProgression: 12,
  alignmentMetrics: 75,
  geographicDistribution: 70
};

export const mockEmployerEvidence: EmployerEvidence = {
  employerResponseRate: 72,
  satisfactionScores: 82,
  competencyRatings: 78,
  industryDemandTrends: 85,
  recommendationsFrequency: 68,
  repeatEmployerEngagement: 75
};

export const mockSkillGapEvidence: SkillGapEvidence = {
  criticalSkillGaps: 12,
  industryDemand: 88,
  coverageRate: 68,
  trainingPriorities: 8,
  certificationGaps: 5,
  departmentRiskAreas: 3
};

export const mockCurriculumEvidence: CurriculumEvidence = {
  alignmentScore: 72,
  outdatedCourses: 15,
  newCourseRecommendations: 8,
  accreditationCompliance: 78,
  practicalTheoryBalance: 55,
  updatePriorities: 18
};

export const mockComplianceStatus: ComplianceStatus = {
  compliantItems: 120,
  partiallyCompliantItems: 22,
  nonCompliantItems: 8,
  actionRequired: 15,
  completionEstimate: '2-3 months',
  responsibleArea: 'Department Head'
};

export const mockAccreditationInsights: AccreditationInsight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Strong Tracer Participation',
    description: 'Tracer study participation rate exceeds accreditation threshold',
    metric: 'Participation Rate',
    value: '78%',
    recommendation: 'Maintain current engagement strategy'
  },
  {
    id: '2',
    type: 'success',
    title: 'High Graduate Employability',
    description: 'Graduate employment rate meets accreditation standards',
    metric: 'Employability Rate',
    value: '85%',
    recommendation: 'Continue career support programs'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Missing Evidence Items',
    description: 'Some accreditation evidence items still need documentation',
    metric: 'Missing Items',
    value: '12',
    recommendation: 'Prioritize missing evidence collection'
  },
  {
    id: '4',
    type: 'concern',
    title: 'Skill Gap Coverage',
    description: 'Skill gap coverage below target for some departments',
    metric: 'Coverage Rate',
    value: '68%',
    recommendation: 'Address department-specific skill gaps'
  },
  {
    id: '5',
    type: 'success',
    title: 'Evidence Completeness',
    description: 'Evidence completeness score shows good progress',
    metric: 'Completeness',
    value: '88%',
    recommendation: 'Focus on remaining gaps'
  },
  {
    id: '6',
    type: 'info',
    title: 'Curriculum Alignment Progress',
    description: 'Curriculum alignment improving steadily',
    metric: 'Alignment Score',
    value: '72%',
    recommendation: 'Continue curriculum updates'
  }
];

export const mockAccreditationEvidenceRecords: AccreditationEvidenceRecord[] = [
  {
    id: '1',
    evidenceItem: 'Tracer Study Report',
    category: 'Tracer Evidence',
    source: 'Graduate Survey',
    status: 'compliant',
    completion: 100,
    owner: 'Registrar Office',
    lastUpdated: '2025-12-15',
    actionRequired: 'None'
  },
  {
    id: '2',
    evidenceItem: 'Employer Feedback Report',
    category: 'Employer Evidence',
    source: 'Industry Survey',
    status: 'compliant',
    completion: 100,
    owner: 'Industry Liaison',
    lastUpdated: '2025-12-10',
    actionRequired: 'None'
  },
  {
    id: '3',
    evidenceItem: 'Skill Gap Analysis',
    category: 'Skill Gap Evidence',
    source: 'Department Analysis',
    status: 'partial',
    completion: 85,
    owner: 'Department Head',
    lastUpdated: '2025-12-08',
    actionRequired: 'Complete department-specific analysis'
  },
  {
    id: '4',
    evidenceItem: 'Curriculum Alignment Report',
    category: 'Curriculum Evidence',
    source: 'Academic Affairs',
    status: 'partial',
    completion: 78,
    owner: 'Academic Dean',
    lastUpdated: '2025-12-05',
    actionRequired: 'Update course alignment data'
  },
  {
    id: '5',
    evidenceItem: 'Graduate Outcome Mapping',
    category: 'Graduate Outcome Evidence',
    source: 'Program Review',
    status: 'compliant',
    completion: 100,
    owner: 'Department Head',
    lastUpdated: '2025-12-01',
    actionRequired: 'None'
  },
  {
    id: '6',
    evidenceItem: 'Department Performance Report',
    category: 'Department Evidence',
    source: 'Performance Review',
    status: 'partial',
    completion: 72,
    owner: 'Department Head',
    lastUpdated: '2025-11-28',
    actionRequired: 'Add recent performance metrics'
  },
  {
    id: '7',
    evidenceItem: 'Learning Outcome Documentation',
    category: 'Curriculum Evidence',
    source: 'Course Syllabi',
    status: 'non-compliant',
    completion: 45,
    owner: 'Academic Dean',
    lastUpdated: '2025-11-20',
    actionRequired: 'Complete learning outcome mapping'
  },
  {
    id: '8',
    evidenceItem: 'Assessment Method Documentation',
    category: 'Curriculum Evidence',
    source: 'Course Assessment',
    status: 'partial',
    completion: 68,
    owner: 'Academic Dean',
    lastUpdated: '2025-11-15',
    actionRequired: 'Document assessment methods'
  }
];
