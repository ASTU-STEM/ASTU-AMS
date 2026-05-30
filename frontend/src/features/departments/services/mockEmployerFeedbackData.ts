// Mock Employer Feedback & Industry Intelligence Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  EmployerFeedbackKPIMetric,
  SatisfactionMetric,
  CompetencyScore,
  IndustryDemandSkill,
  EmployerRecommendation,
  EmployerEngagement,
  EmployerInsight,
  EmployerFeedbackRecord
} from '../types/employerFeedback.types';

export const mockEmployerFeedbackKPIMetrics: EmployerFeedbackKPIMetric[] = [
  {
    id: 'total-responses',
    label: 'Total Employer Responses',
    value: '142',
    trend: 12,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Total number of employers who provided feedback',
    sparkline: [95, 105, 110, 125, 142]
  },
  {
    id: 'avg-satisfaction',
    label: 'Average Employer Satisfaction',
    value: '8.1/10',
    trend: 0.3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Average satisfaction score from all employer feedback',
    sparkline: [7.5, 7.7, 7.8, 7.9, 8.1]
  },
  {
    id: 'grad-performance',
    label: 'Graduate Performance Score',
    value: '8.3/10',
    trend: 0.4,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Average performance rating of ASTU graduates',
    sparkline: [7.6, 7.8, 8.0, 8.1, 8.3]
  },
  {
    id: 'industry-alignment',
    label: 'Industry Alignment Score',
    value: '79%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Percentage alignment between curriculum and industry needs',
    sparkline: [72, 74, 76, 77, 79]
  },
  {
    id: 'repeat-hiring',
    label: 'Repeat Hiring Rate',
    value: '68%',
    trend: 5,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Percentage of employers who hired ASTU graduates multiple times',
    sparkline: [58, 60, 63, 65, 68]
  },
  {
    id: 'active-partners',
    label: 'Active Employer Partners',
    value: '85',
    trend: 8,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'TrendingUp',
    tooltip: 'Number of active employer partnerships',
    sparkline: [65, 70, 75, 78, 85]
  },
  {
    id: 'curriculum-changes',
    label: 'Recommended Curriculum Changes',
    value: '12',
    trend: -3,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'purple-600',
    icon: 'TrendingDown',
    tooltip: 'Number of curriculum changes recommended by employers',
    sparkline: [18, 16, 15, 14, 12]
  },
  {
    id: 'emerging-skills',
    label: 'Emerging Skill Demands',
    value: '8',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Number of new skill demands identified by employers',
    sparkline: [4, 5, 6, 7, 8]
  }
];

export const mockSatisfactionMetrics: SatisfactionMetric[] = [
  {
    category: 'Technical Skills',
    score: 8.4,
    trend: 0.3,
    breakdown: { excellent: 45, good: 38, average: 15, poor: 2 }
  },
  {
    category: 'Communication',
    score: 7.8,
    trend: 0.2,
    breakdown: { excellent: 35, good: 40, average: 20, poor: 5 }
  },
  {
    category: 'Problem Solving',
    score: 8.2,
    trend: 0.4,
    breakdown: { excellent: 42, good: 36, average: 18, poor: 4 }
  },
  {
    category: 'Teamwork',
    score: 8.5,
    trend: 0.1,
    breakdown: { excellent: 48, good: 35, average: 15, poor: 2 }
  },
  {
    category: 'Leadership',
    score: 7.5,
    trend: 0.3,
    breakdown: { excellent: 30, good: 38, average: 25, poor: 7 }
  },
  {
    category: 'Adaptability',
    score: 8.0,
    trend: 0.2,
    breakdown: { excellent: 38, good: 38, average: 20, poor: 4 }
  },
  {
    category: 'Professionalism',
    score: 8.6,
    trend: 0.1,
    breakdown: { excellent: 50, good: 35, average: 13, poor: 2 }
  }
];

export const mockCompetencyScores: CompetencyScore[] = [
  { competency: 'Technical Competence', score: 8.4, trend: 0.3, benchmark: 8.0, topDepartment: 9.0 },
  { competency: 'Software Tools', score: 8.1, trend: 0.4, benchmark: 7.8, topDepartment: 9.2 },
  { competency: 'Industry Knowledge', score: 7.6, trend: 0.2, benchmark: 7.5, topDepartment: 8.5 },
  { competency: 'Critical Thinking', score: 8.3, trend: 0.3, benchmark: 8.0, topDepartment: 8.8 },
  { competency: 'Communication', score: 7.8, trend: 0.2, benchmark: 7.5, topDepartment: 8.5 },
  { competency: 'Team Collaboration', score: 8.5, trend: 0.1, benchmark: 8.2, topDepartment: 9.0 },
  { competency: 'Project Management', score: 7.4, trend: 0.3, benchmark: 7.2, topDepartment: 8.2 },
  { competency: 'Innovation', score: 7.8, trend: 0.4, benchmark: 7.5, topDepartment: 8.7 }
];

export const mockIndustryDemandSkills: IndustryDemandSkill[] = [
  {
    skill: 'AI / ML',
    demand: 92,
    trend: 15,
    growthRate: 25,
    hiringProjection: 120,
    industries: ['Technology', 'Finance', 'Healthcare']
  },
  {
    skill: 'Data Analytics',
    demand: 88,
    trend: 12,
    growthRate: 20,
    hiringProjection: 95,
    industries: ['Technology', 'Finance', 'Manufacturing']
  },
  {
    skill: 'Cloud Computing',
    demand: 85,
    trend: 10,
    growthRate: 18,
    hiringProjection: 88,
    industries: ['Technology', 'Telecommunications']
  },
  {
    skill: 'Cybersecurity',
    demand: 82,
    trend: 14,
    growthRate: 22,
    hiringProjection: 85,
    industries: ['Technology', 'Finance', 'Government']
  },
  {
    skill: 'DevOps',
    demand: 78,
    trend: 11,
    growthRate: 19,
    hiringProjection: 80,
    industries: ['Technology', 'Software']
  },
  {
    skill: 'Full Stack Development',
    demand: 75,
    trend: 8,
    growthRate: 15,
    hiringProjection: 75,
    industries: ['Technology', 'E-commerce']
  },
  {
    skill: 'Embedded Systems',
    demand: 68,
    trend: 6,
    growthRate: 12,
    hiringProjection: 65,
    industries: ['Manufacturing', 'Automotive']
  },
  {
    skill: 'Industrial Automation',
    demand: 65,
    trend: 7,
    growthRate: 14,
    hiringProjection: 60,
    industries: ['Manufacturing', 'Energy']
  }
];

export const mockEmployerRecommendations: EmployerRecommendation[] = [
  {
    id: '1',
    category: 'curriculum',
    title: 'Add AI/ML Course',
    description: 'Introduce machine learning fundamentals across all engineering programs',
    priority: 'high',
    frequency: 28,
    impactLevel: 'high',
    sourceEmployers: ['Ethio Telecom', 'Safaricom', 'Microsoft', 'Google']
  },
  {
    id: '2',
    category: 'laboratory',
    title: 'Upgrade Cloud Labs',
    description: 'Establish cloud computing labs with AWS/Azure access',
    priority: 'high',
    frequency: 24,
    impactLevel: 'high',
    sourceEmployers: ['Ethio Telecom', 'Safaricom', 'Microsoft']
  },
  {
    id: '3',
    category: 'internship',
    title: 'Expand Industry Partnerships',
    description: 'Increase internship opportunities with top employers',
    priority: 'high',
    frequency: 22,
    impactLevel: 'high',
    sourceEmployers: ['Ethiopian Airlines', 'Ethio Telecom', 'Safaricom']
  },
  {
    id: '4',
    category: 'softSkills',
    title: 'Strengthen Communication Training',
    description: 'Enhance verbal and written communication skills',
    priority: 'medium',
    frequency: 18,
    impactLevel: 'medium',
    sourceEmployers: ['Ethiopian Airlines', 'Ethio Telecom', 'Banks']
  },
  {
    id: '5',
    category: 'certification',
    title: 'Add Industry Certifications',
    description: 'Include AWS, Azure, and other industry certifications',
    priority: 'medium',
    frequency: 15,
    impactLevel: 'medium',
    sourceEmployers: ['Microsoft', 'Google', 'Ethio Telecom']
  },
  {
    id: '6',
    category: 'research',
    title: 'Industry-Academia Collaboration',
    description: 'Establish joint research projects with industry',
    priority: 'medium',
    frequency: 12,
    impactLevel: 'high',
    sourceEmployers: ['Ethiopian Airlines', 'Manufacturing Firms']
  },
  {
    id: '7',
    category: 'curriculum',
    title: 'Update Programming Languages',
    description: 'Modernize programming language curriculum',
    priority: 'low',
    frequency: 10,
    impactLevel: 'medium',
    sourceEmployers: ['Tech Companies', 'Startups']
  },
  {
    id: '8',
    category: 'laboratory',
    title: 'IoT Lab Enhancement',
    description: 'Upgrade IoT laboratory equipment',
    priority: 'low',
    frequency: 8,
    impactLevel: 'medium',
    sourceEmployers: ['Manufacturing', 'Telecommunications']
  }
];

export const mockEmployerEngagement: EmployerEngagement[] = [
  {
    employer: 'Ethio Telecom',
    industry: 'Telecommunications',
    participationRate: 95,
    graduatesHired: 45,
    internshipProvided: true,
    recruitmentPartner: true,
    collaborationScore: 92,
    lastActivity: '2024-12-10'
  },
  {
    employer: 'Safaricom',
    industry: 'Telecommunications',
    participationRate: 88,
    graduatesHired: 32,
    internshipProvided: true,
    recruitmentPartner: true,
    collaborationScore: 85,
    lastActivity: '2024-12-05'
  },
  {
    employer: 'Ethiopian Airlines',
    industry: 'Aviation',
    participationRate: 82,
    graduatesHired: 28,
    internshipProvided: true,
    recruitmentPartner: true,
    collaborationScore: 88,
    lastActivity: '2024-12-01'
  },
  {
    employer: 'Microsoft',
    industry: 'Technology',
    participationRate: 78,
    graduatesHired: 15,
    internshipProvided: true,
    recruitmentPartner: false,
    collaborationScore: 90,
    lastActivity: '2024-11-28'
  },
  {
    employer: 'Google',
    industry: 'Technology',
    participationRate: 72,
    graduatesHired: 12,
    internshipProvided: true,
    recruitmentPartner: false,
    collaborationScore: 88,
    lastActivity: '2024-11-25'
  },
  {
    employer: 'Commercial Bank of Ethiopia',
    industry: 'Finance',
    participationRate: 68,
    graduatesHired: 22,
    internshipProvided: false,
    recruitmentPartner: true,
    collaborationScore: 75,
    lastActivity: '2024-11-20'
  }
];

export const mockEmployerInsights: EmployerInsight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Strong Technical Skills',
    description: 'ASTU graduates excel in technical competencies',
    metric: 'Technical Skills Score',
    value: '8.4/10',
    recommendation: 'Continue strengthening technical curriculum'
  },
  {
    id: '2',
    type: 'success',
    title: 'High Repeat Hiring Rate',
    description: 'Employers consistently hire ASTU graduates',
    metric: 'Repeat Hiring Rate',
    value: '68%',
    recommendation: 'Leverage for employer testimonials'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Communication Skills Gap',
    description: 'Communication skills need improvement',
    metric: 'Communication Score',
    value: '7.8/10',
    recommendation: 'Enhance soft skills training'
  },
  {
    id: '4',
    type: 'concern',
    title: 'AI/ML Skill Gap',
    description: 'High demand but low supply in AI/ML skills',
    metric: 'AI/ML Demand',
    value: '92%',
    recommendation: 'Prioritize AI/ML curriculum addition'
  },
  {
    id: '5',
    type: 'success',
    title: 'Strong Industry Partnerships',
    description: 'Active partnerships with top employers',
    metric: 'Active Partners',
    value: '85',
    recommendation: 'Expand partnership programs'
  },
  {
    id: '6',
    type: 'info',
    title: 'Emerging Cloud Demand',
    description: 'Cloud computing skills in high demand',
    metric: 'Cloud Demand',
    value: '85%',
    recommendation: 'Upgrade cloud infrastructure'
  }
];

export const mockEmployerFeedbackRecords: EmployerFeedbackRecord[] = [
  {
    id: '1',
    employer: 'Ethio Telecom',
    industry: 'Telecommunications',
    department: 'Software Engineering',
    rating: 9.0,
    graduatesHired: 45,
    satisfaction: 9.2,
    recommendations: ['Add AI/ML courses', 'Upgrade cloud labs'],
    lastActivity: '2024-12-10'
  },
  {
    id: '2',
    employer: 'Safaricom',
    industry: 'Telecommunications',
    department: 'Software Engineering',
    rating: 8.5,
    graduatesHired: 32,
    satisfaction: 8.8,
    recommendations: ['Improve communication skills', 'Add DevOps training'],
    lastActivity: '2024-12-05'
  },
  {
    id: '3',
    employer: 'Ethiopian Airlines',
    industry: 'Aviation',
    department: 'Mechanical Engineering',
    rating: 8.8,
    graduatesHired: 28,
    satisfaction: 9.0,
    recommendations: ['Add IoT courses', 'Enhance practical training'],
    lastActivity: '2024-12-01'
  },
  {
    id: '4',
    employer: 'Microsoft',
    industry: 'Technology',
    department: 'Software Engineering',
    rating: 9.2,
    graduatesHired: 15,
    satisfaction: 9.5,
    recommendations: ['Add cloud certifications', 'Expand research collaboration'],
    lastActivity: '2024-11-28'
  },
  {
    id: '5',
    employer: 'Commercial Bank of Ethiopia',
    industry: 'Finance',
    department: 'Software Engineering',
    rating: 7.8,
    graduatesHired: 22,
    satisfaction: 8.0,
    recommendations: ['Improve soft skills', 'Add fintech courses'],
    lastActivity: '2024-11-20'
  },
  {
    id: '6',
    employer: 'Ethio Telecom',
    industry: 'Telecommunications',
    department: 'Electrical Engineering',
    rating: 8.5,
    graduatesHired: 18,
    satisfaction: 8.7,
    recommendations: ['Add power systems courses', 'Enhance lab equipment'],
    lastActivity: '2024-12-08'
  }
];
