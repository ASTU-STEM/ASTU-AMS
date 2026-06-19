// Mock Tracer Reports Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  TracerKPIMetric,
  TracerTimelineData,
  SurveyCompletionData,
  EmploymentOutcomeData,
  CareerAlignmentData,
  SatisfactionMetric,
  GeographicData,
  TracerInsight,
  TracerRecord
} from '../types/tracer.types';

export const mockTracerKPIMetrics: TracerKPIMetric[] = [
  {
    id: 'survey-completion',
    label: 'Survey Completion Rate',
    value: '78%',
    trend: 5,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Percentage of graduates who completed the tracer survey',
    sparkline: [65, 70, 72, 75, 78]
  },
  {
    id: 'response-rate',
    label: 'Response Rate',
    value: '82%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Percentage of contacted graduates who responded',
    sparkline: [75, 78, 80, 81, 82]
  },
  {
    id: 'employment-rate',
    label: 'Employment Rate',
    value: '87%',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Percentage of graduates currently employed',
    sparkline: [80, 82, 84, 85, 87]
  },
  {
    id: 'further-study',
    label: 'Further Study Rate',
    value: '12%',
    trend: -2,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'purple-600',
    icon: 'TrendingDown',
    tooltip: 'Percentage of graduates pursuing further education',
    sparkline: [14, 13, 13, 12, 12]
  },
  {
    id: 'avg-salary',
    label: 'Average Salary',
    value: '$45K',
    trend: 8,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'TrendingUp',
    tooltip: 'Average annual salary of employed graduates',
    sparkline: [38, 40, 42, 44, 45]
  },
  {
    id: 'time-to-hire',
    label: 'Avg Time-to-Hire',
    value: '3.2 mo',
    trend: -5,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Average time to secure employment after graduation',
    sparkline: [3.8, 3.6, 3.5, 3.3, 3.2]
  },
  {
    id: 'alignment-score',
    label: 'Career Alignment Score',
    value: '82%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Percentage of graduates working in field of study',
    sparkline: [76, 78, 79, 81, 82]
  },
  {
    id: 'satisfaction-score',
    label: 'Graduate Satisfaction',
    value: '8.2/10',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Overall satisfaction score with education and career',
    sparkline: [7.5, 7.7, 7.9, 8.0, 8.2]
  }
];

export const mockTracerTimelineData: TracerTimelineData[] = [
  {
    period: '6 Months',
    participationRate: 78,
    employmentRate: 72,
    satisfactionRate: 7.8,
    alignmentScore: 75
  },
  {
    period: '12 Months',
    participationRate: 65,
    employmentRate: 82,
    satisfactionRate: 8.0,
    alignmentScore: 80
  },
  {
    period: '24 Months',
    participationRate: 52,
    employmentRate: 87,
    satisfactionRate: 8.2,
    alignmentScore: 82
  }
];

export const mockSurveyCompletionData: SurveyCompletionData[] = [
  { category: 'Batch 2024', completionRate: 85, totalGraduates: 320, responded: 272, trend: 5 },
  { category: 'Batch 2023', completionRate: 78, totalGraduates: 285, responded: 222, trend: 3 },
  { category: 'Batch 2022', completionRate: 72, totalGraduates: 310, responded: 223, trend: -2 },
  { category: 'Batch 2021', completionRate: 68, totalGraduates: 295, responded: 201, trend: -5 },
  { category: 'Software Engineering', completionRate: 82, totalGraduates: 150, responded: 123, trend: 4 },
  { category: 'Mechanical Engineering', completionRate: 70, totalGraduates: 180, responded: 126, trend: -3 }
];

export const mockEmploymentOutcomeData: EmploymentOutcomeData[] = [
  { status: 'Employed', count: 845, percentage: 72, color: 'astu-green' },
  { status: 'Self-Employed', count: 95, percentage: 8, color: 'astu-navy' },
  { status: 'Unemployed', count: 118, percentage: 10, color: 'astu-red' },
  { status: 'Further Study', count: 94, percentage: 8, color: 'purple-600' },
  { status: 'Unknown', count: 24, percentage: 2, color: 'gray-500' }
];

export const mockCareerAlignmentData: CareerAlignmentData[] = [
  {
    metric: 'Job Relevance',
    score: 82,
    trend: 3,
    distribution: { high: 65, medium: 25, low: 10 }
  },
  {
    metric: 'Curriculum Relevance',
    score: 78,
    trend: 2,
    distribution: { high: 55, medium: 30, low: 15 }
  },
  {
    metric: 'Industry Match',
    score: 85,
    trend: 4,
    distribution: { high: 70, medium: 20, low: 10 }
  },
  {
    metric: 'Skill Utilization',
    score: 80,
    trend: 3,
    distribution: { high: 60, medium: 28, low: 12 }
  }
];

export const mockSatisfactionData: SatisfactionMetric[] = [
  {
    category: 'Education Satisfaction',
    score: 8.4,
    trend: 0.3,
    breakdown: { excellent: 45, good: 35, average: 15, poor: 5 }
  },
  {
    category: 'Career Satisfaction',
    score: 8.1,
    trend: 0.4,
    breakdown: { excellent: 40, good: 38, average: 18, poor: 4 }
  },
  {
    category: 'Salary Satisfaction',
    score: 7.8,
    trend: 0.5,
    breakdown: { excellent: 35, good: 40, average: 20, poor: 5 }
  },
  {
    category: 'Industry Satisfaction',
    score: 8.3,
    trend: 0.2,
    breakdown: { excellent: 42, good: 36, average: 18, poor: 4 }
  },
  {
    category: 'Professional Growth',
    score: 8.0,
    trend: 0.4,
    breakdown: { excellent: 38, good: 38, average: 20, poor: 4 }
  }
];

export const mockGeographicData: GeographicData[] = [
  { region: 'Ethiopia', country: 'Ethiopia', count: 798, percentage: 68, trend: 5 },
  { region: 'Africa', country: 'Kenya', count: 95, percentage: 8, trend: 3 },
  { region: 'Africa', country: 'Nigeria', count: 71, percentage: 6, trend: 2 },
  { region: 'Middle East', country: 'UAE', count: 59, percentage: 5, trend: 4 },
  { region: 'Europe', country: 'Germany', count: 47, percentage: 4, trend: 2 },
  { region: 'North America', country: 'USA', count: 35, percentage: 3, trend: 3 },
  { region: 'Asia', country: 'India', count: 24, percentage: 2, trend: 1 }
];

export const mockTracerInsights: TracerInsight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Highest Response Rate',
    description: 'Batch 2024 shows exceptional survey participation',
    metric: 'Completion Rate',
    value: '85%',
    recommendation: 'Use this batch as benchmark for outreach strategies'
  },
  {
    id: '2',
    type: 'concern',
    title: 'Lowest Response Rate',
    description: 'Batch 2021 needs improved engagement',
    metric: 'Completion Rate',
    value: '68%',
    recommendation: 'Implement targeted follow-up campaign for this cohort'
  },
  {
    id: '3',
    type: 'success',
    title: 'Most Employable Cohort',
    description: 'Software Engineering graduates lead in employment',
    metric: 'Employment Rate',
    value: '92%',
    recommendation: 'Expand successful practices to other programs'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Career Alignment Concern',
    description: 'Mechanical Engineering shows lower alignment',
    metric: 'Alignment Score',
    value: '72%',
    recommendation: 'Review curriculum and industry partnerships'
  },
  {
    id: '5',
    type: 'success',
    title: 'Satisfaction Excellence',
    description: 'Overall satisfaction exceeds industry benchmark',
    metric: 'Satisfaction Score',
    value: '8.2/10',
    recommendation: 'Maintain current quality standards'
  },
  {
    id: '6',
    type: 'info',
    title: 'Geographic Distribution',
    description: 'Strong domestic employment presence',
    metric: 'Domestic Employment',
    value: '68%',
    recommendation: 'Consider international partnership programs'
  }
];

export const mockTracerRecords: TracerRecord[] = [
  {
    id: '1',
    graduate: 'Abebe Kebede',
    batch: '2024',
    surveyType: '6-Month',
    surveyDate: '2024-12-15',
    employmentStatus: 'employed',
    company: 'Ethio Telecom',
    country: 'Ethiopia',
    salaryRange: '$40K-$50K',
    alignmentScore: 85,
    satisfactionScore: 8.5
  },
  {
    id: '2',
    graduate: 'Sara Ahmed',
    batch: '2024',
    surveyType: '6-Month',
    surveyDate: '2024-12-14',
    employmentStatus: 'employed',
    company: 'Safaricom',
    country: 'Kenya',
    salaryRange: '$50K-$60K',
    alignmentScore: 90,
    satisfactionScore: 9.0
  },
  {
    id: '3',
    graduate: 'Dawit Mekonnen',
    batch: '2023',
    surveyType: '12-Month',
    surveyDate: '2024-11-20',
    employmentStatus: 'self-employed',
    company: 'Self-Employed',
    country: 'Ethiopia',
    salaryRange: '$30K-$40K',
    alignmentScore: 75,
    satisfactionScore: 7.5
  },
  {
    id: '4',
    graduate: 'Hanna Tesfaye',
    batch: '2023',
    surveyType: '12-Month',
    surveyDate: '2024-11-18',
    employmentStatus: 'further-study',
    company: 'N/A',
    country: 'Germany',
    salaryRange: 'N/A',
    alignmentScore: 80,
    satisfactionScore: 8.0
  },
  {
    id: '5',
    graduate: 'Kifle Demissie',
    batch: '2022',
    surveyType: '24-Month',
    surveyDate: '2024-10-25',
    employmentStatus: 'employed',
    company: 'Microsoft',
    country: 'USA',
    salaryRange: '$80K-$90K',
    alignmentScore: 95,
    satisfactionScore: 9.5
  },
  {
    id: '6',
    graduate: 'Mekdes Bekele',
    batch: '2024',
    surveyType: '6-Month',
    surveyDate: '2024-12-13',
    employmentStatus: 'employed',
    company: 'Ethiopian Airlines',
    country: 'Ethiopia',
    salaryRange: '$35K-$45K',
    alignmentScore: 88,
    satisfactionScore: 8.7
  },
  {
    id: '7',
    graduate: 'Yonas Haile',
    batch: '2023',
    surveyType: '12-Month',
    surveyDate: '2024-11-15',
    employmentStatus: 'unemployed',
    company: 'N/A',
    country: 'Ethiopia',
    salaryRange: 'N/A',
    alignmentScore: 65,
    satisfactionScore: 6.5
  },
  {
    id: '8',
    graduate: 'Selamawit Tadesse',
    batch: '2022',
    surveyType: '24-Month',
    surveyDate: '2024-10-20',
    employmentStatus: 'employed',
    company: 'Google',
    country: 'USA',
    salaryRange: '$90K-$100K',
    alignmentScore: 92,
    satisfactionScore: 9.2
  }
];
