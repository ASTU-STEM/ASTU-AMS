// Mock Employment Analytics Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  EmploymentKPIMetric,
  EmploymentTrendData,
  EmploymentStatusData,
  ProgramEmploymentData,
  HiringIndustry,
  HiringCompany,
  GeographicDistribution,
  GraduateEmploymentRecord,
  TopEmployer,
  EmploymentInsight
} from '../types/employmentAnalytics.types';

export const mockEmploymentKPIMetrics: EmploymentKPIMetric[] = [
  {
    id: 'employment-rate',
    label: 'Employment Rate',
    value: '85%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'TrendingUp',
    color: 'astu-green'
  },
  {
    id: 'unemployment-rate',
    label: 'Unemployment Rate',
    value: '12%',
    trend: -2,
    trendDirection: 'down',
    comparison: 'vs last year',
    icon: 'TrendingDown',
    color: 'astu-red'
  },
  {
    id: 'self-employment-rate',
    label: 'Self-Employment Rate',
    value: '3%',
    trend: 1,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'Briefcase',
    color: 'astu-navy'
  },
  {
    id: 'time-to-hire',
    label: 'Avg Time-to-Hire',
    value: '3.2 mo',
    trend: -12,
    trendDirection: 'down',
    comparison: 'vs last year',
    icon: 'Clock',
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
    color: 'astu-navy'
  },
  {
    id: 'international-employment',
    label: 'International Employment',
    value: '18%',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'Globe',
    color: 'astu-navy'
  },
  {
    id: 'local-employment',
    label: 'Local Employment',
    value: '67%',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'MapPin',
    color: 'astu-green'
  },
  {
    id: 'job-match-rate',
    label: 'Job Match Rate',
    value: '78%',
    trend: 5,
    trendDirection: 'up',
    comparison: 'vs last year',
    icon: 'Target',
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

export const mockEmploymentStatusData: EmploymentStatusData[] = [
  { status: 'Employed', count: 1060, percentage: 85 },
  { status: 'Unemployed', count: 150, percentage: 12 },
  { status: 'Self-Employed', count: 37, percentage: 3 },
  { status: 'Further Study', count: 25, percentage: 2 },
  { status: 'Unknown', count: 15, percentage: 1 }
];

export const mockProgramEmploymentData: ProgramEmploymentData[] = [
  { program: 'Computer Science', employmentRate: 88, graduates: 350 },
  { program: 'Software Engineering', employmentRate: 86, graduates: 280 },
  { program: 'Electrical Engineering', employmentRate: 84, graduates: 320 },
  { program: 'Mechanical Engineering', employmentRate: 82, graduates: 297 }
];

export const mockHiringIndustries: HiringIndustry[] = [
  { name: 'Technology', graduateCount: 425, percentage: 34 },
  { name: 'Finance', graduateCount: 312, percentage: 25 },
  { name: 'Manufacturing', graduateCount: 187, percentage: 15 },
  { name: 'Telecommunications', graduateCount: 150, percentage: 12 },
  { name: 'Consulting', graduateCount: 100, percentage: 8 }
];

export const mockHiringCompanies: HiringCompany[] = [
  { name: 'Ethio Telecom', graduatesHired: 145, change: 12, changeDirection: 'up', industry: 'Telecommunications' },
  { name: 'Safaricom Ethiopia', graduatesHired: 98, change: 8, changeDirection: 'up', industry: 'Technology' },
  { name: 'Commercial Bank of Ethiopia', graduatesHired: 87, change: 5, changeDirection: 'up', industry: 'Finance' },
  { name: 'Ethiopian Airlines', graduatesHired: 76, change: -3, changeDirection: 'down', industry: 'Transportation' },
  { name: 'Dashen Bank', graduatesHired: 65, change: 10, changeDirection: 'up', industry: 'Finance' }
];

export const mockGeographicDistribution: GeographicDistribution[] = [
  { region: 'Ethiopia', count: 850, percentage: 67 },
  { region: 'Africa (Other)', count: 125, percentage: 10 },
  { region: 'Middle East', count: 100, percentage: 8 },
  { region: 'Europe', count: 75, percentage: 6 },
  { region: 'North America', count: 62, percentage: 5 },
  { region: 'Asia', count: 35, percentage: 4 }
];

export const mockGraduateEmploymentRecords: GraduateEmploymentRecord[] = [
  {
    id: '1',
    studentId: 'ASTU/1024/18',
    graduateName: 'Abdi Kebede',
    department: 'Computer Science',
    graduationYear: '2024',
    employmentStatus: 'Employed',
    company: 'Ethio Telecom',
    jobTitle: 'Software Engineer',
    country: 'Ethiopia',
    salaryRange: '$40,000 - $50,000',
    timeToHire: '2 months'
  },
  {
    id: '2',
    studentId: 'ASTU/4592/18',
    graduateName: 'Chala Bekele',
    department: 'Software Engineering',
    graduationYear: '2024',
    employmentStatus: 'Employed',
    company: 'Safaricom Ethiopia',
    jobTitle: 'Full Stack Developer',
    country: 'Ethiopia',
    salaryRange: '$45,000 - $55,000',
    timeToHire: '3 months'
  },
  {
    id: '3',
    studentId: 'ASTU/7823/18',
    graduateName: 'Dawit Abebe',
    department: 'Electrical Engineering',
    graduationYear: '2024',
    employmentStatus: 'Employed',
    company: 'Ethiopian Airlines',
    jobTitle: 'Systems Engineer',
    country: 'Ethiopia',
    salaryRange: '$38,000 - $48,000',
    timeToHire: '4 months'
  },
  {
    id: '4',
    studentId: 'ASTU/3156/18',
    graduateName: 'Hanna Tadesse',
    department: 'Computer Science',
    graduationYear: '2024',
    employmentStatus: 'Self-Employed',
    company: 'Freelance',
    jobTitle: 'Web Developer',
    country: 'Ethiopia',
    salaryRange: '$35,000 - $45,000',
    timeToHire: '6 months'
  },
  {
    id: '5',
    studentId: 'ASTU/6294/18',
    graduateName: 'Kaleb Mekonnen',
    department: 'Mechanical Engineering',
    graduationYear: '2024',
    employmentStatus: 'Employed',
    company: 'Dashen Bank',
    jobTitle: 'Data Analyst',
    country: 'Ethiopia',
    salaryRange: '$42,000 - $52,000',
    timeToHire: '3 months'
  }
];

export const mockTopEmployers: TopEmployer[] = [
  {
    employer: 'Ethio Telecom',
    graduatesHired: 145,
    industry: 'Telecommunications',
    averageSalary: '$42,000',
    lastHireDate: '2025-01-15'
  },
  {
    employer: 'Safaricom Ethiopia',
    graduatesHired: 98,
    industry: 'Technology',
    averageSalary: '$48,000',
    lastHireDate: '2025-01-10'
  },
  {
    employer: 'Commercial Bank of Ethiopia',
    graduatesHired: 87,
    industry: 'Finance',
    averageSalary: '$40,000',
    lastHireDate: '2025-01-08'
  },
  {
    employer: 'Ethiopian Airlines',
    graduatesHired: 76,
    industry: 'Transportation',
    averageSalary: '$45,000',
    lastHireDate: '2025-01-05'
  },
  {
    employer: 'Dashen Bank',
    graduatesHired: 65,
    industry: 'Finance',
    averageSalary: '$41,000',
    lastHireDate: '2025-01-03'
  }
];

export const mockEmploymentInsights: EmploymentInsight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Best Performing Program',
    description: 'Computer Science leads with 88% employment rate',
    metric: 'Employment Rate',
    value: '88%'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Weakest Employment Area',
    description: 'Mechanical Engineering needs industry partnerships',
    metric: 'Employment Rate',
    value: '82%'
  },
  {
    id: '3',
    type: 'success',
    title: 'Fastest Hiring Company',
    description: 'Ethio Telecom hires graduates within 2 months',
    metric: 'Avg Time-to-Hire',
    value: '2 months'
  },
  {
    id: '4',
    type: 'success',
    title: 'Highest Salary Market',
    description: 'Technology sector offers highest average salary',
    metric: 'Avg Salary',
    value: '$48,000'
  },
  {
    id: '5',
    type: 'info',
    title: 'Most Common Sector',
    description: 'Technology remains the largest employment sector',
    metric: 'Sector Share',
    value: '34%'
  },
  {
    id: '6',
    type: 'concern',
    title: 'Key Recommendation',
    description: 'Strengthen industry partnerships for engineering programs',
    metric: 'Action Required',
    value: 'High Priority'
  }
];
