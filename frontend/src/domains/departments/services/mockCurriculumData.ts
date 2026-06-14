// Mock Curriculum Insights & Academic Alignment Intelligence Data for Development
// This will be replaced with actual API calls via department.service.ts

import {
  CurriculumKPIMetric,
  CurriculumOverview,
  CourseAlignment,
  NewCourseRecommendation,
  CourseUpdate,
  AccreditationAlignment,
  IndustryAlignment,
  CurriculumInsight,
  CurriculumRecord
} from '../types/curriculum.types';

export const mockCurriculumKPIMetrics: CurriculumKPIMetric[] = [
  {
    id: 'alignment-score',
    label: 'Curriculum Alignment Score',
    value: '72%',
    trend: 3,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Overall curriculum alignment with industry needs',
    sparkline: [65, 68, 69, 70, 72]
  },
  {
    id: 'outdated-courses',
    label: 'Outdated Courses Count',
    value: '15',
    trend: -2,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'AlertTriangle',
    tooltip: 'Number of courses requiring updates',
    sparkline: [20, 18, 17, 16, 15]
  },
  {
    id: 'new-course-recommendations',
    label: 'New Course Recommendations',
    value: '8',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-navy',
    icon: 'TrendingUp',
    tooltip: 'Recommended new courses to add',
    sparkline: [5, 6, 6, 7, 8]
  },
  {
    id: 'industry-coverage',
    label: 'Industry Coverage Rate',
    value: '68%',
    trend: 4,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'Coverage of industry-demanded skills',
    sparkline: [60, 62, 64, 66, 68]
  },
  {
    id: 'accreditation-readiness',
    label: 'Accreditation Readiness Score',
    value: '78%',
    trend: 2,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'astu-green',
    icon: 'TrendingUp',
    tooltip: 'ETA accreditation readiness score',
    sparkline: [72, 74, 75, 76, 78]
  },
  {
    id: 'skill-coverage-gap',
    label: 'Skill Coverage Gap Index',
    value: '32%',
    trend: -3,
    trendDirection: 'down',
    comparison: 'vs last year',
    color: 'astu-red',
    icon: 'TrendingDown',
    tooltip: 'Gap in skill coverage',
    sparkline: [38, 36, 35, 33, 32]
  },
  {
    id: 'practical-theory-balance',
    label: 'Practical vs Theory Balance',
    value: '55:45',
    trend: 1,
    trendDirection: 'up',
    comparison: 'vs last year',
    color: 'purple-600',
    icon: 'TrendingUp',
    tooltip: 'Balance between practical and theoretical content',
    sparkline: [50, 51, 52, 54, 55]
  },
  {
    id: 'update-priority',
    label: 'Curriculum Update Priority Index',
    value: 'Medium',
    trend: 0,
    trendDirection: 'neutral',
    comparison: 'vs last year',
    color: 'yellow-600',
    icon: 'TrendingUp',
    tooltip: 'Overall priority for curriculum updates',
    sparkline: [50, 50, 50, 50, 50]
  }
];

export const mockCurriculumOverview: CurriculumOverview = {
  totalCourses: 120,
  alignedCourses: 75,
  partiallyAlignedCourses: 30,
  misalignedCourses: 15,
  coursesRequiringUpdate: 18
};

export const mockCourseAlignment: CourseAlignment[] = [
  { course: 'Data Structures & Algorithms', department: 'Computer Science', alignmentScore: 85, skillCoverage: 90, industryRelevance: 88, status: 'aligned', updateRequired: false, priority: 'low' },
  { course: 'Database Management', department: 'Computer Science', alignmentScore: 78, skillCoverage: 82, industryRelevance: 80, status: 'aligned', updateRequired: false, priority: 'low' },
  { course: 'Software Engineering', department: 'Software Engineering', alignmentScore: 72, skillCoverage: 75, industryRelevance: 78, status: 'partial', updateRequired: true, priority: 'medium' },
  { course: 'Web Development', department: 'Software Engineering', alignmentScore: 65, skillCoverage: 68, industryRelevance: 72, status: 'partial', updateRequired: true, priority: 'medium' },
  { course: 'Operating Systems', department: 'Computer Science', alignmentScore: 80, skillCoverage: 85, industryRelevance: 75, status: 'aligned', updateRequired: false, priority: 'low' },
  { course: 'Computer Networks', department: 'Information Technology', alignmentScore: 70, skillCoverage: 72, industryRelevance: 68, status: 'partial', updateRequired: true, priority: 'medium' },
  { course: 'Circuit Analysis', department: 'Electrical Engineering', alignmentScore: 75, skillCoverage: 78, industryRelevance: 70, status: 'aligned', updateRequired: false, priority: 'low' },
  { course: 'Digital Electronics', department: 'Electrical Engineering', alignmentScore: 68, skillCoverage: 70, industryRelevance: 65, status: 'partial', updateRequired: true, priority: 'medium' },
  { course: 'Thermodynamics', department: 'Mechanical Engineering', alignmentScore: 72, skillCoverage: 75, industryRelevance: 68, status: 'aligned', updateRequired: false, priority: 'low' },
  { course: 'Mechanics of Materials', department: 'Mechanical Engineering', alignmentScore: 65, skillCoverage: 68, industryRelevance: 62, status: 'partial', updateRequired: true, priority: 'medium' }
];

export const mockNewCourseRecommendations: NewCourseRecommendation[] = [
  {
    id: '1',
    course: 'AI/ML Fundamentals',
    justification: 'High industry demand for AI skills',
    demandLevel: 92,
    industryRelevance: 95,
    expectedImpact: 'high',
    priorityRanking: 1,
    suggestedDepartment: 'Computer Science'
  },
  {
    id: '2',
    course: 'Cloud Computing',
    justification: 'Cloud skills critical for modern IT',
    demandLevel: 88,
    industryRelevance: 90,
    expectedImpact: 'high',
    priorityRanking: 2,
    suggestedDepartment: 'Information Technology'
  },
  {
    id: '3',
    course: 'DevOps Engineering',
    justification: 'DevOps practices essential in software development',
    demandLevel: 85,
    industryRelevance: 88,
    expectedImpact: 'high',
    priorityRanking: 3,
    suggestedDepartment: 'Software Engineering'
  },
  {
    id: '4',
    course: 'Cybersecurity Fundamentals',
    justification: 'Growing security threats require security skills',
    demandLevel: 82,
    industryRelevance: 85,
    expectedImpact: 'high',
    priorityRanking: 4,
    suggestedDepartment: 'Information Technology'
  },
  {
    id: '5',
    course: 'Data Engineering',
    justification: 'Data engineering supports AI/ML initiatives',
    demandLevel: 78,
    industryRelevance: 82,
    expectedImpact: 'medium',
    priorityRanking: 5,
    suggestedDepartment: 'Computer Science'
  },
  {
    id: '6',
    course: 'Mobile App Development',
    justification: 'Mobile development skills in high demand',
    demandLevel: 75,
    industryRelevance: 78,
    expectedImpact: 'medium',
    priorityRanking: 6,
    suggestedDepartment: 'Software Engineering'
  },
  {
    id: '7',
    course: 'IoT Systems',
    justification: 'IoT emerging in industrial applications',
    demandLevel: 72,
    industryRelevance: 75,
    expectedImpact: 'medium',
    priorityRanking: 7,
    suggestedDepartment: 'Electrical Engineering'
  },
  {
    id: '8',
    course: 'Machine Learning Operations',
    justification: 'MLOps critical for AI deployment',
    demandLevel: 70,
    industryRelevance: 75,
    expectedImpact: 'medium',
    priorityRanking: 8,
    suggestedDepartment: 'Computer Science'
  }
];

export const mockCourseUpdates: CourseUpdate[] = [
  {
    course: 'Software Engineering',
    department: 'Software Engineering',
    outdatedModules: ['Traditional Waterfall', 'Legacy Testing Methods'],
    missingTechnologies: ['CI/CD', 'Containerization', 'Cloud Deployment'],
    labDeficiencies: ['No DevOps lab', 'Limited cloud access'],
    suggestedUpdates: ['Add DevOps module', 'Integrate CI/CD pipeline', 'Cloud deployment projects'],
    priority: 'high'
  },
  {
    course: 'Web Development',
    department: 'Software Engineering',
    outdatedModules: ['jQuery', 'Old PHP frameworks'],
    missingTechnologies: ['React', 'Node.js', 'TypeScript'],
    labDeficiencies: ['No modern framework lab'],
    suggestedUpdates: ['Add React module', 'Node.js backend', 'TypeScript integration'],
    priority: 'high'
  },
  {
    course: 'Computer Networks',
    department: 'Information Technology',
    outdatedModules: ['Legacy protocols', 'Traditional networking'],
    missingTechnologies: ['SDN', 'Cloud Networking', '5G'],
    labDeficiencies: ['No SDN lab equipment'],
    suggestedUpdates: ['Add SDN concepts', 'Cloud networking module', '5G overview'],
    priority: 'medium'
  },
  {
    course: 'Digital Electronics',
    department: 'Electrical Engineering',
    outdatedModules: ['Traditional logic design', 'Legacy microcontrollers'],
    missingTechnologies: ['FPGA', 'ARM Cortex', 'Embedded Linux'],
    labDeficiencies: ['No FPGA boards', 'Limited ARM kits'],
    suggestedUpdates: ['Add FPGA module', 'ARM programming', 'Embedded systems lab'],
    priority: 'medium'
  }
];

export const mockAccreditationAlignment: AccreditationAlignment = {
  complianceScore: 78,
  learningOutcomeCoverage: 82,
  graduateOutcomeMapping: 75,
  curriculumAuditStatus: 'partial',
  etaReadiness: 80
};

export const mockIndustryAlignment: IndustryAlignment = {
  alignmentScore: 72,
  employerDemandMatch: 68,
  curriculumRelevance: 75,
  skillToIndustryMapping: 70,
  sectorCoverage: [
    { sector: 'IT', coverage: 75 },
    { sector: 'Engineering', coverage: 70 },
    { sector: 'Science', coverage: 68 },
    { sector: 'Manufacturing', coverage: 65 }
  ]
};

export const mockCurriculumInsights: CurriculumInsight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Strong Core Curriculum',
    description: 'Core courses show strong alignment with industry needs',
    metric: 'Alignment Score',
    value: '85%',
    recommendation: 'Maintain current core curriculum'
  },
  {
    id: '2',
    type: 'concern',
    title: 'Missing Cloud Skills',
    description: 'Cloud computing not covered in current curriculum',
    metric: 'Coverage',
    value: '25%',
    recommendation: 'Add cloud computing module'
  },
  {
    id: '3',
    type: 'warning',
    title: 'DevOps Gap',
    description: 'DevOps practices not integrated in software engineering',
    metric: 'Coverage',
    value: '35%',
    recommendation: 'Add DevOps lab and CI/CD training'
  },
  {
    id: '4',
    type: 'info',
    title: 'AI/ML Opportunity',
    description: 'AI/ML skills highly demanded but not fully covered',
    metric: 'Demand',
    value: '92%',
    recommendation: 'Accelerate AI/ML course development'
  },
  {
    id: '5',
    type: 'success',
    title: 'Accreditation Progress',
    description: 'ETA accreditation readiness improving steadily',
    metric: 'Readiness',
    value: '80%',
    recommendation: 'Continue current trajectory'
  },
  {
    id: '6',
    type: 'concern',
    title: 'Practical Lab Deficiencies',
    description: 'Several courses lack modern lab equipment',
    metric: 'Lab Coverage',
    value: '65%',
    recommendation: 'Upgrade lab infrastructure'
  }
];

export const mockCurriculumRecords: CurriculumRecord[] = [
  {
    id: '1',
    course: 'Data Structures & Algorithms',
    department: 'Computer Science',
    alignmentScore: 85,
    industryRelevance: 88,
    status: 'aligned',
    updateRequired: false,
    priority: 'low',
    recommendedAction: 'Maintain current curriculum'
  },
  {
    id: '2',
    course: 'Software Engineering',
    department: 'Software Engineering',
    alignmentScore: 72,
    industryRelevance: 78,
    status: 'partial',
    updateRequired: true,
    priority: 'medium',
    recommendedAction: 'Add DevOps module'
  },
  {
    id: '3',
    course: 'Web Development',
    department: 'Software Engineering',
    alignmentScore: 65,
    industryRelevance: 72,
    status: 'partial',
    updateRequired: true,
    priority: 'high',
    recommendedAction: 'Update to modern frameworks'
  },
  {
    id: '4',
    course: 'Computer Networks',
    department: 'Information Technology',
    alignmentScore: 70,
    industryRelevance: 68,
    status: 'partial',
    updateRequired: true,
    priority: 'medium',
    recommendedAction: 'Add SDN and cloud networking'
  },
  {
    id: '5',
    course: 'Digital Electronics',
    department: 'Electrical Engineering',
    alignmentScore: 68,
    industryRelevance: 65,
    status: 'partial',
    updateRequired: true,
    priority: 'medium',
    recommendedAction: 'Add FPGA and ARM modules'
  },
  {
    id: '6',
    course: 'Database Management',
    department: 'Computer Science',
    alignmentScore: 78,
    industryRelevance: 80,
    status: 'aligned',
    updateRequired: false,
    priority: 'low',
    recommendedAction: 'Maintain current curriculum'
  },
  {
    id: '7',
    course: 'Operating Systems',
    department: 'Computer Science',
    alignmentScore: 80,
    industryRelevance: 75,
    status: 'aligned',
    updateRequired: false,
    priority: 'low',
    recommendedAction: 'Maintain current curriculum'
  },
  {
    id: '8',
    course: 'Thermodynamics',
    department: 'Mechanical Engineering',
    alignmentScore: 72,
    industryRelevance: 68,
    status: 'aligned',
    updateRequired: false,
    priority: 'low',
    recommendedAction: 'Maintain current curriculum'
  }
];
