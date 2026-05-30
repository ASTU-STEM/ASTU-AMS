// Mock Dashboard Overview Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  KPICard,
  EmploymentTrendData,
  TracerCompletionData,
  TopHiringCompany,
  TopIndustry,
  SkillGapItem,
  EmployerFeedbackScore,
  CurriculumInsight,
  RecentActivity
} from '../types/dashboardOverview.types';

export const mockDashboardKPICards: KPICard[] = [
  {
    id: 'total-graduates',
    label: 'Total Graduates',
    value: '1,247',
    trend: 8,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'GraduationCap',
    tooltip: 'Total number of graduates in the selected period',
    sparkline: [1100, 1150, 1180, 1200, 1247],
    color: 'astu-navy'
  },
  {
    id: 'employment-rate',
    label: 'Employment Rate',
    value: '85%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'TrendingUp',
    tooltip: 'Percentage of graduates employed within 6 months',
    sparkline: [78, 80, 82, 83, 85],
    color: 'astu-green'
  },
  {
    id: 'time-to-hire',
    label: 'Avg Time-to-Hire',
    value: '3.2 mo',
    trend: -12,
    trendDirection: 'down',
    comparison: 'vs last year',
    icon: 'Clock',
    tooltip: 'Average time to secure employment after graduation',
    sparkline: [4.5, 4.2, 3.8, 3.5, 3.2],
    color: 'astu-green'
  },
  {
    id: 'average-salary',
    label: 'Avg Salary',
    value: '$42,500',
    trend: 7,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'DollarSign',
    tooltip: 'Average starting salary for graduates',
    sparkline: [38000, 39500, 40500, 41500, 42500],
    color: 'astu-navy'
  },
  {
    id: 'tracer-completion',
    label: 'Tracer Completion',
    value: '78%',
    trend: 5,
    trendDirection: 'up',
    comparison: 'vs last period',
    icon: 'FileCheck',
    tooltip: 'Tracer study survey completion rate',
    sparkline: [65, 70, 72, 75, 78],
    color: 'astu-green'
  },
  {
    id: 'employer-satisfaction',
    label: 'Employer Satisfaction',
    value: '4.2/5',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'Star',
    tooltip: 'Average employer satisfaction score',
    sparkline: [3.8, 3.9, 4.0, 4.1, 4.2],
    color: 'astu-navy'
  },
  {
    id: 'industry-partnerships',
    label: 'Industry Partnerships',
    value: '45',
    trend: 8,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'Building2',
    tooltip: 'Number of active industry partnerships',
    sparkline: [35, 38, 40, 42, 45],
    color: 'astu-navy'
  },
  {
    id: 'active-jobs',
    label: 'Active Job Opportunities',
    value: '128',
    trend: 15,
    trendDirection: 'up',
    comparison: 'vs last month',
    icon: 'Briefcase',
    tooltip: 'Number of active job postings for graduates',
    sparkline: [95, 105, 110, 115, 128],
    color: 'astu-green'
  }
];

export const mockEmploymentTrendData: EmploymentTrendData[] = [
  { year: '2020', employmentRate: 72, graduates: 950 },
  { year: '2021', employmentRate: 75, graduates: 1020 },
  { year: '2022', employmentRate: 78, graduates: 1100 },
  { year: '2023', employmentRate: 82, graduates: 1180 },
  { year: '2024', employmentRate: 85, graduates: 1247 }
];

export const mockTracerCompletionData: TracerCompletionData[] = [
  { status: 'completed', count: 872, percentage: 70 },
  { status: 'pending', count: 298, percentage: 24 },
  { status: 'overdue', count: 77, percentage: 6 }
];

export const mockTopHiringCompanies: TopHiringCompany[] = [
  { name: 'Ethio Telecom', graduateCount: 145, trend: 12, trendDirection: 'up' },
  { name: 'Safaricom Ethiopia', graduateCount: 98, trend: 8, trendDirection: 'up' },
  { name: 'Commercial Bank of Ethiopia', graduateCount: 87, trend: 5, trendDirection: 'up' },
  { name: 'Ethiopian Airlines', graduateCount: 76, trend: -3, trendDirection: 'down' },
  { name: 'Dashen Bank', graduateCount: 65, trend: 10, trendDirection: 'up' }
];

export const mockTopIndustries: TopIndustry[] = [
  { name: 'Technology', graduateCount: 425, percentage: 34 },
  { name: 'Finance', graduateCount: 312, percentage: 25 },
  { name: 'Manufacturing', graduateCount: 187, percentage: 15 },
  { name: 'Telecommunications', graduateCount: 150, percentage: 12 },
  { name: 'Consulting', graduateCount: 100, percentage: 8 }
];

export const mockSkillGapItems: SkillGapItem[] = [
  { skill: 'Cloud Computing', demand: 92, coverage: 45, trend: 15, trendDirection: 'up', category: 'missing' },
  { skill: 'DevOps', demand: 88, coverage: 52, trend: 12, trendDirection: 'up', category: 'missing' },
  { skill: 'AI/ML Engineering', demand: 85, coverage: 38, trend: 18, trendDirection: 'up', category: 'missing' },
  { skill: 'Cybersecurity', demand: 82, coverage: 48, trend: 10, trendDirection: 'up', category: 'missing' },
  { skill: 'Data Engineering', demand: 78, coverage: 55, trend: 8, trendDirection: 'up', category: 'requested' },
  { skill: 'Mobile Development', demand: 75, coverage: 62, trend: 5, trendDirection: 'up', category: 'requested' }
];

export const mockEmployerFeedbackScores: EmployerFeedbackScore[] = [
  { category: 'Technical Skills', score: 4.3, trend: 3, trendDirection: 'up' },
  { category: 'Communication', score: 4.1, trend: 2, trendDirection: 'up' },
  { category: 'Problem Solving', score: 4.2, trend: 4, trendDirection: 'up' },
  { category: 'Leadership', score: 3.9, trend: 1, trendDirection: 'up' },
  { category: 'Teamwork', score: 4.4, trend: 2, trendDirection: 'up' }
];

export const mockCurriculumInsights: CurriculumInsight[] = [
  {
    title: 'Add Cloud Computing',
    description: 'Industry demand for cloud skills has increased by 15%',
    priority: 'high',
    type: 'recommendation'
  },
  {
    title: 'Update Software Testing',
    description: 'Modern testing frameworks need to be integrated',
    priority: 'medium',
    type: 'recommendation'
  },
  {
    title: 'Strong Industry Alignment',
    description: 'Core curriculum aligns well with industry needs',
    priority: 'high',
    type: 'strength'
  },
  {
    title: 'Review Legacy Technologies',
    description: 'Some outdated technologies still in curriculum',
    priority: 'low',
    type: 'weakness'
  },
  {
    title: 'Excellent Practical Labs',
    description: 'Hands-on lab sessions receive positive feedback',
    priority: 'high',
    type: 'strength'
  }
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'survey',
    title: 'New Survey Submission',
    description: 'John Doe completed 6-month tracer survey',
    timestamp: '2 hours ago',
    icon: 'FileCheck'
  },
  {
    id: '2',
    type: 'feedback',
    title: 'Employer Feedback Received',
    description: 'Safaricom Ethiopia submitted competency assessment',
    timestamp: '5 hours ago',
    icon: 'MessageSquare'
  },
  {
    id: '3',
    type: 'report',
    title: 'Report Generated',
    description: 'Monthly employment analytics report completed',
    timestamp: '1 day ago',
    icon: 'FileText'
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Tracer Milestone Reached',
    description: '75% tracer completion rate achieved',
    timestamp: '2 days ago',
    icon: 'TrendingUp'
  },
  {
    id: '5',
    type: 'survey',
    title: 'New Survey Submission',
    description: 'Jane Smith completed 12-month tracer survey',
    timestamp: '3 days ago',
    icon: 'FileCheck'
  }
];
