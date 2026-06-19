// Mock Skill Gap Analysis & Workforce Demand Intelligence Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  SkillGapKPIMetric,
  SkillGapOverview,
  DemandSupplySkill,
  DepartmentGap,
  EmergingTechnology,
  CertificationGap,
  SkillGapRecommendation,
  SkillGapInsight,
  SkillGapRecord
} from '../types/skillGap.types';

export const mockSkillGapKPIMetrics: SkillGapKPIMetric[] = [
  {
    id: 'critical-gaps',
    label: 'Critical Skill Gaps',
    value: '12',
    trend: -2,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'AlertTriangle',
    tooltip: 'Number of critical skill gaps identified',
    sparkline: [18, 16, 15, 14, 12]
  },
  {
    id: 'high-demand',
    label: 'High Demand Skills',
    value: '24',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Skills with high market demand',
    sparkline: [18, 20, 21, 22, 24]
  },
  {
    id: 'misalignment',
    label: 'Curriculum Misalignment Score',
    value: '28%',
    trend: -3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'TrendingUp',
    tooltip: 'Percentage of curriculum misaligned with industry needs',
    sparkline: [32, 30, 29, 28, 28]
  },
  {
    id: 'demand-growth',
    label: 'Industry Demand Growth',
    value: '18%',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Growth rate of industry skill demand',
    sparkline: [14, 15, 16, 17, 18]
  },
  {
    id: 'training-priority',
    label: 'Training Priority Count',
    value: '8',
    trend: 1,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'purple-600',
    icon: 'TrendingUp',
    tooltip: 'Number of training priorities identified',
    sparkline: [6, 6, 7, 7, 8]
  },
  {
    id: 'emerging-tech',
    label: 'Emerging Technologies',
    value: '6',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Number of emerging technologies to track',
    sparkline: [3, 4, 4, 5, 6]
  },
  {
    id: 'certification-gaps',
    label: 'Certification Gaps',
    value: '5',
    trend: -1,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'TrendingDown',
    tooltip: 'Number of certification gaps',
    sparkline: [7, 6, 6, 5, 5]
  },
  {
    id: 'risk-index',
    label: 'Department Risk Index',
    value: 'Medium',
    trend: 0,
    trendDirection: 'neutral',
    comparison: 'vs last year',
    color: 'yellow-600',
    icon: 'TrendingUp',
    tooltip: 'Overall department risk assessment',
    sparkline: [50, 50, 50, 50, 50]
  }
];

export const mockSkillGapOverview: SkillGapOverview = {
  totalSkills: 150,
  skillsMatched: 95,
  skillsMissing: 28,
  skillsPartiallyCovered: 27,
  skillsToPrioritize: 12
};

export const mockDemandSupplySkills: DemandSupplySkill[] = [
  { skill: 'Cloud Computing', category: 'Infrastructure', demandLevel: 92, coverageLevel: 45, gapScore: 47, trend: 15 },
  { skill: 'DevOps', category: 'DevOps', demandLevel: 88, coverageLevel: 38, gapScore: 50, trend: 12 },
  { skill: 'AI / ML', category: 'AI', demandLevel: 85, coverageLevel: 42, gapScore: 43, trend: 18 },
  { skill: 'Data Engineering', category: 'Data', demandLevel: 82, coverageLevel: 48, gapScore: 34, trend: 14 },
  { skill: 'Cybersecurity', category: 'Security', demandLevel: 80, coverageLevel: 55, gapScore: 25, trend: 16 },
  { skill: 'Full Stack Development', category: 'Development', demandLevel: 78, coverageLevel: 65, gapScore: 13, trend: 8 },
  { skill: 'IoT', category: 'Embedded', demandLevel: 72, coverageLevel: 52, gapScore: 20, trend: 10 },
  { skill: 'Embedded Systems', category: 'Embedded', demandLevel: 68, coverageLevel: 58, gapScore: 10, trend: 6 },
  { skill: 'MLOps', category: 'AI', demandLevel: 65, coverageLevel: 28, gapScore: 37, trend: 20 },
  { skill: 'Kubernetes', category: 'DevOps', demandLevel: 62, coverageLevel: 32, gapScore: 30, trend: 14 }
];

export const mockDepartmentGaps: DepartmentGap[] = [
  { department: 'Software Engineering', gapScore: 35, strongestSkill: 'Full Stack Development', weakestSkill: 'Cloud Computing', improvementTrend: 5, priorityRanking: 2 },
  { department: 'Electrical Engineering', gapScore: 28, strongestSkill: 'Embedded Systems', weakestSkill: 'IoT', improvementTrend: 3, priorityRanking: 4 },
  { department: 'Mechanical Engineering', gapScore: 32, strongestSkill: 'Industrial Automation', weakestSkill: 'Robotics', improvementTrend: 4, priorityRanking: 3 },
  { department: 'Civil Engineering', gapScore: 25, strongestSkill: 'Structural Analysis', weakestSkill: 'BIM', improvementTrend: 2, priorityRanking: 5 },
  { department: 'Computer Science', gapScore: 38, strongestSkill: 'Algorithms', weakestSkill: 'AI / ML', improvementTrend: 6, priorityRanking: 1 },
  { department: 'Information Technology', gapScore: 30, strongestSkill: 'Network Security', weakestSkill: 'DevOps', improvementTrend: 4, priorityRanking: 3 }
];

export const mockEmergingTechnologies: EmergingTechnology[] = [
  { technology: 'AI', growthRate: 25, adoptionPotential: 92, curriculumReadiness: 45, laborMarketRelevance: 95, trend: 18 },
  { technology: 'Cloud Native', growthRate: 22, adoptionPotential: 88, curriculumReadiness: 38, laborMarketRelevance: 90, trend: 15 },
  { technology: 'DevOps', growthRate: 20, adoptionPotential: 85, curriculumReadiness: 40, laborMarketRelevance: 88, trend: 14 },
  { technology: 'Data Science', growthRate: 18, adoptionPotential: 82, curriculumReadiness: 48, laborMarketRelevance: 85, trend: 12 },
  { technology: 'Cybersecurity', growthRate: 16, adoptionPotential: 80, curriculumReadiness: 55, laborMarketRelevance: 82, trend: 10 },
  { technology: 'Robotics', growthRate: 14, adoptionPotential: 75, curriculumReadiness: 52, laborMarketRelevance: 78, trend: 8 },
  { technology: 'Industrial Automation', growthRate: 12, adoptionPotential: 72, curriculumReadiness: 58, laborMarketRelevance: 75, trend: 6 },
  { technology: 'Machine Learning Operations', growthRate: 20, adoptionPotential: 78, curriculumReadiness: 28, laborMarketRelevance: 85, trend: 16 }
];

export const mockCertificationGaps: CertificationGap[] = [
  { certification: 'AWS', demand: 88, trainingGap: 65, labToolingGap: 70, recommended: true },
  { certification: 'Azure', demand: 82, trainingGap: 58, labToolingGap: 62, recommended: true },
  { certification: 'CCNA', demand: 75, trainingGap: 45, labToolingGap: 50, recommended: true },
  { certification: 'PMP', demand: 68, trainingGap: 38, labToolingGap: 0, recommended: false },
  { certification: 'Data Analytics', demand: 72, trainingGap: 52, labToolingGap: 48, recommended: true },
  { certification: 'Cybersecurity', demand: 80, trainingGap: 55, labToolingGap: 58, recommended: true },
  { certification: 'Docker', demand: 78, trainingGap: 42, labToolingGap: 45, recommended: true },
  { certification: 'Kubernetes', demand: 75, trainingGap: 48, labToolingGap: 52, recommended: true },
  { certification: 'Python', demand: 85, trainingGap: 25, labToolingGap: 20, recommended: false },
  { certification: 'Power BI', demand: 65, trainingGap: 35, labToolingGap: 30, recommended: false }
];

export const mockSkillGapRecommendations: SkillGapRecommendation[] = [
  {
    id: '1',
    priority: 'immediate',
    action: 'Add Cloud Computing module',
    affectedDepartments: ['Software Engineering', 'Computer Science'],
    rationale: 'High market demand with low curriculum coverage',
    impactLevel: 'high',
    suggestedTimeline: 'Next semester'
  },
  {
    id: '2',
    priority: 'immediate',
    action: 'Integrate DevOps lab practice',
    affectedDepartments: ['Software Engineering', 'Information Technology'],
    rationale: 'Critical gap in deployment and operations skills',
    impactLevel: 'high',
    suggestedTimeline: 'Next semester'
  },
  {
    id: '3',
    priority: 'high',
    action: 'Update Cybersecurity curriculum',
    affectedDepartments: ['Information Technology', 'Computer Science'],
    rationale: 'Growing security threats and industry demand',
    impactLevel: 'high',
    suggestedTimeline: 'Academic year 2025'
  },
  {
    id: '4',
    priority: 'high',
    action: 'Add AI/ML elective',
    affectedDepartments: ['Computer Science', 'Software Engineering'],
    rationale: 'Emerging technology with high adoption potential',
    impactLevel: 'high',
    suggestedTimeline: 'Academic year 2025'
  },
  {
    id: '5',
    priority: 'medium',
    action: 'Introduce industry certification support',
    affectedDepartments: ['All Departments'],
    rationale: 'Employers prefer certified graduates',
    impactLevel: 'medium',
    suggestedTimeline: 'Academic year 2025'
  },
  {
    id: '6',
    priority: 'medium',
    action: 'Upgrade IoT lab equipment',
    affectedDepartments: ['Electrical Engineering', 'Computer Science'],
    rationale: 'Hands-on practice needed for IoT skills',
    impactLevel: 'medium',
    suggestedTimeline: 'Academic year 2025'
  },
  {
    id: '7',
    priority: 'low',
    action: 'Add Robotics course',
    affectedDepartments: ['Mechanical Engineering', 'Electrical Engineering'],
    rationale: 'Emerging technology with moderate demand',
    impactLevel: 'medium',
    suggestedTimeline: 'Academic year 2026'
  },
  {
    id: '8',
    priority: 'low',
    action: 'Enhance Data Engineering curriculum',
    affectedDepartments: ['Computer Science', 'Software Engineering'],
    rationale: 'Supporting skill for AI/ML initiatives',
    impactLevel: 'medium',
    suggestedTimeline: 'Academic year 2026'
  }
];

export const mockSkillGapInsights: SkillGapInsight[] = [
  {
    id: '1',
    type: 'concern',
    title: 'Critical Cloud Computing Gap',
    description: 'Cloud skills have highest demand but lowest coverage',
    metric: 'Gap Score',
    value: '47',
    recommendation: 'Prioritize cloud curriculum integration'
  },
  {
    id: '2',
    type: 'concern',
    title: 'DevOps Skills Missing',
    description: 'DevOps practices not covered in current curriculum',
    metric: 'Coverage',
    value: '38%',
    recommendation: 'Add DevOps labs and CI/CD training'
  },
  {
    id: '3',
    type: 'warning',
    title: 'AI/ML Curriculum Lag',
    description: 'AI/ML demand outpacing curriculum readiness',
    metric: 'Readiness',
    value: '42%',
    recommendation: 'Accelerate AI/ML course development'
  },
  {
    id: '4',
    type: 'success',
    title: 'Strong Full Stack Coverage',
    description: 'Full stack development skills well covered',
    metric: 'Coverage',
    value: '65%',
    recommendation: 'Maintain current curriculum'
  },
  {
    id: '5',
    type: 'info',
    title: 'Certification Opportunity',
    description: 'Industry certifications highly valued by employers',
    metric: 'Demand',
    value: '85%',
    recommendation: 'Implement certification support program'
  },
  {
    id: '6',
    type: 'success',
    title: 'Cybersecurity Progress',
    description: 'Cybersecurity coverage improving steadily',
    metric: 'Trend',
    value: '+16%',
    recommendation: 'Continue current trajectory'
  }
];

export const mockSkillGapRecords: SkillGapRecord[] = [
  {
    id: '1',
    skill: 'Cloud Computing',
    category: 'Infrastructure',
    demandLevel: 92,
    coverageLevel: 45,
    gapScore: 47,
    affectedDepartment: 'Software Engineering',
    recommendedAction: 'Add Cloud module',
    priority: 'immediate'
  },
  {
    id: '2',
    skill: 'DevOps',
    category: 'DevOps',
    demandLevel: 88,
    coverageLevel: 38,
    gapScore: 50,
    affectedDepartment: 'Software Engineering',
    recommendedAction: 'Add DevOps labs',
    priority: 'immediate'
  },
  {
    id: '3',
    skill: 'AI / ML',
    category: 'AI',
    demandLevel: 85,
    coverageLevel: 42,
    gapScore: 43,
    affectedDepartment: 'Computer Science',
    recommendedAction: 'Add AI/ML elective',
    priority: 'high'
  },
  {
    id: '4',
    skill: 'Data Engineering',
    category: 'Data',
    demandLevel: 82,
    coverageLevel: 48,
    gapScore: 34,
    affectedDepartment: 'Computer Science',
    recommendedAction: 'Enhance data curriculum',
    priority: 'medium'
  },
  {
    id: '5',
    skill: 'Cybersecurity',
    category: 'Security',
    demandLevel: 80,
    coverageLevel: 55,
    gapScore: 25,
    affectedDepartment: 'Information Technology',
    recommendedAction: 'Update security curriculum',
    priority: 'high'
  },
  {
    id: '6',
    skill: 'Full Stack Development',
    category: 'Development',
    demandLevel: 78,
    coverageLevel: 65,
    gapScore: 13,
    affectedDepartment: 'Software Engineering',
    recommendedAction: 'Maintain coverage',
    priority: 'low'
  },
  {
    id: '7',
    skill: 'IoT',
    category: 'Embedded',
    demandLevel: 72,
    coverageLevel: 52,
    gapScore: 20,
    affectedDepartment: 'Electrical Engineering',
    recommendedAction: 'Upgrade IoT labs',
    priority: 'medium'
  },
  {
    id: '8',
    skill: 'MLOps',
    category: 'AI',
    demandLevel: 65,
    coverageLevel: 28,
    gapScore: 37,
    affectedDepartment: 'Computer Science',
    recommendedAction: 'Add MLOps module',
    priority: 'high'
  }
];
