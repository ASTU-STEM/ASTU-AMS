// Mock Department Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  DepartmentMetric,
  DepartmentOverview,
  EmploymentData,
  EmployerFeedbackData,
  SkillGapData,
  TracerSurveyData,
  CurriculumInsight,
  ExportReport
} from '../types/department.types';

export const mockDepartmentMetrics: DepartmentMetric[] = [
  {
    id: 1,
    label: 'Employment Rate',
    value: '87%',
    color: 'astu-green',
    icon: 'Briefcase',
    bgGradient: 'from-emerald-50 to-green-50',
    trend: '+3% vs 2022',
    trendIcon: 'TrendingUp'
  },
  {
    id: 2,
    label: 'Graduate Count',
    value: '1,240',
    color: 'astu-navy',
    icon: 'Users',
    bgGradient: 'from-blue-50 to-indigo-50',
    trend: '+8% vs 2022',
    trendIcon: 'TrendingUp'
  },
  {
    id: 3,
    label: 'Avg. Salary',
    value: '$45K',
    color: 'astu-red',
    icon: 'DollarSign',
    bgGradient: 'from-red-50 to-orange-50',
    trend: '+$2K vs 2022',
    trendIcon: 'TrendingUp'
  },
  {
    id: 4,
    label: 'Tracer Completion',
    value: '78%',
    color: 'purple-600',
    icon: 'FileCheck',
    bgGradient: 'from-purple-50 to-pink-50',
    trend: '+5% vs 2022',
    trendIcon: 'TrendingUp'
  },
  {
    id: 5,
    label: 'Top Employers',
    value: '42',
    color: 'astu-navy',
    icon: 'Building2',
    bgGradient: 'from-blue-50 to-indigo-50',
    trend: '+6 new',
    trendIcon: 'Plus'
  },
  {
    id: 6,
    label: 'Skill Gaps',
    value: '5',
    color: 'astu-red',
    icon: 'AlertTriangle',
    bgGradient: 'from-red-50 to-orange-50',
    trend: 'Critical',
    trendIcon: 'AlertCircle'
  }
];

export const mockDepartmentOverview: DepartmentOverview = {
  employmentRate: 87,
  graduateCount: 1240,
  averageSalary: '$45K',
  tracerCompletion: 78,
  topEmployers: 42,
  skillGaps: 5
};

export const mockEmploymentData: EmploymentData = {
  overallRate: 87,
  timeToHire: '3.2 mo',
  averageSalary: '$45K',
  industryMatch: 78,
  industryDistribution: [
    { name: 'Technology', percentage: 42, color: 'astu-navy' },
    { name: 'Finance', percentage: 28, color: 'astu-green' },
    { name: 'Manufacturing', percentage: 15, color: 'astu-red' },
    { name: 'Other', percentage: 15, color: 'gray-500' }
  ],
  employmentByDepartment: [
    { name: 'Software Engineering', rate: 84, color: 'astu-navy' },
    { name: 'Mechanical Engineering', rate: 70, color: 'astu-green' },
    { name: 'Civil Engineering', rate: 75, color: 'astu-red' },
    { name: 'Electrical Engineering', rate: 82, color: 'purple-600' }
  ]
};

export const mockEmployerFeedback: EmployerFeedbackData = {
  strengths: [
    { skill: 'Technical Knowledge', rating: 8.5 },
    { skill: 'Problem Solving', rating: 8.2 },
    { skill: 'Communication', rating: 7.8 },
    { skill: 'Teamwork', rating: 8.0 }
  ],
  improvements: [
    { skill: 'Cloud Experience', rating: 5.2 },
    { skill: 'DevOps Skills', rating: 4.8 },
    { skill: 'AI/ML Knowledge', rating: 5.5 },
    { skill: 'Project Management', rating: 6.0 }
  ],
  recommendations: [
    'Increase practical cloud computing projects',
    'Integrate DevOps practices into coursework',
    'Add AI/ML elective courses',
    'Strengthen soft skills training',
    'Include industry-standard tools',
    'Enhance project-based learning'
  ]
};

export const mockSkillGapData: SkillGapData = {
  missingSkills: [
    'DevOps & Cloud Computing',
    'AI/ML Engineering',
    'Cybersecurity',
    'Data Science',
    'Microservices Architecture'
  ],
  marketDemand: [
    'Full-Stack Development',
    'Cloud Infrastructure',
    'Machine Learning',
    'DevOps',
    'Data Analytics'
  ],
  weakCurriculumAreas: [
    { area: 'Cloud Computing', gap: 'High', recommendation: 'Add AWS/Azure courses' },
    { area: 'AI/ML', gap: 'High', recommendation: 'Introduce ML fundamentals' },
    { area: 'DevOps', gap: 'Medium', recommendation: 'Add CI/CD pipeline training' },
    { area: 'Cybersecurity', gap: 'Medium', recommendation: 'Include security practices' },
    { area: 'Data Science', gap: 'Medium', recommendation: 'Expand data analytics' },
    { area: 'Microservices', gap: 'Low', recommendation: 'Modern architecture patterns' }
  ]
};

export const mockTracerSurveyData: TracerSurveyData = {
  sixMonthCompletion: 78,
  twelveMonthCompletion: 65,
  twentyFourMonthCompletion: 52,
  employmentStatusOverTime: [
    { period: '6 Months', employed: 72, seeking: 18, other: 10 },
    { period: '12 Months', employed: 82, seeking: 12, other: 6 },
    { period: '24 Months', employed: 87, seeking: 8, other: 5 }
  ],
  salaryProgression: [
    { period: '6 Months', avg: '$38K', growth: '+0%' },
    { period: '12 Months', avg: '$42K', growth: '+10.5%' },
    { period: '24 Months', avg: '$48K', growth: '+26.3%' }
  ]
};

export const mockCurriculumInsights: CurriculumInsight = {
  additions: [
    { course: 'Cloud Computing Fundamentals', priority: 'High', reason: 'High market demand' },
    { course: 'DevOps & CI/CD', priority: 'High', reason: 'Industry standard' },
    { course: 'AI/ML Introduction', priority: 'Medium', reason: 'Growing field' },
    { course: 'Cybersecurity Basics', priority: 'Medium', reason: 'Security requirement' }
  ],
  technologyUpdates: [
    { tech: 'React/Next.js', current: 'Legacy', recommended: 'Modern' },
    { tech: 'Node.js', current: 'Basic', recommended: 'Advanced' },
    { tech: 'Docker/Kubernetes', current: 'None', recommended: 'Essential' },
    { tech: 'TypeScript', current: 'Optional', recommended: 'Required' }
  ],
  outdatedTopics: [
    { topic: 'Legacy Frameworks', reason: 'No longer used in industry' },
    { topic: 'Manual Testing', reason: 'Automated testing is standard' },
    { topic: 'Old Database Systems', reason: 'Modern alternatives available' },
    { topic: 'Deprecated Libraries', reason: 'Security and performance issues' }
  ]
};

export const mockExportReports: ExportReport[] = [
  { title: 'Employment Report', format: 'PDF', icon: 'FileText', color: 'astu-red' },
  { title: 'Graduate Data', format: 'Excel', icon: 'Table', color: 'astu-green' },
  { title: 'Skill Analysis', format: 'PDF', icon: 'FileText', color: 'astu-navy' },
  { title: 'Tracer Study', format: 'Excel', icon: 'Table', color: 'purple-600' },
  { title: 'Accreditation Report', format: 'PDF', icon: 'FileText', color: 'astu-red' },
  { title: 'Curriculum Review', format: 'PDF', icon: 'FileText', color: 'astu-green' }
];
