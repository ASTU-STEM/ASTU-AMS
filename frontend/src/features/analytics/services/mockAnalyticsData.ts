import { AnalyticsSummary, EmploymentTrend, DepartmentStat, SkillGap, EmployerFeedbackMetric, SalaryDistribution, TopEmployer, TracerMetric } from '../types';

const departments = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Civil Engineering'];

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalAlumni: 1238,
  totalEmployers: 87,
  totalJobs: 156,
  totalSurveys: 4,
  employmentRate: 87,
  averageTimeToHire: 4.2,
  averageSalary: '15,000 - 25,000 ETB',
  responseRate: 73,
};

export const mockEmploymentTrends: EmploymentTrend[] = [
  { month: 'Jan', employed: 182, unemployed: 28, inEducation: 15 },
  { month: 'Feb', employed: 195, unemployed: 22, inEducation: 12 },
  { month: 'Mar', employed: 210, unemployed: 18, inEducation: 10 },
  { month: 'Apr', employed: 225, unemployed: 15, inEducation: 8 },
  { month: 'May', employed: 240, unemployed: 12, inEducation: 7 },
  { month: 'Jun', employed: 258, unemployed: 10, inEducation: 5 },
];

export const mockDepartmentStats: DepartmentStat[] = departments.map((dept, i) => ({
  department: dept,
  graduates: 80 + i * 20,
  employed: 60 + i * 15,
  employmentRate: 75 + i * 2,
  averageSalary: `${10 + i * 2},000 - ${20 + i * 3},000 ETB`,
  responseRate: 60 + i * 3,
}));

export const mockSkillGaps: SkillGap[] = [
  { skill: 'Python', demandLevel: 92, supplyLevel: 65, gap: 27, category: 'Programming' },
  { skill: 'Machine Learning', demandLevel: 88, supplyLevel: 45, gap: 43, category: 'AI/ML' },
  { skill: 'Cloud Computing', demandLevel: 85, supplyLevel: 40, gap: 45, category: 'Infrastructure' },
  { skill: 'Data Analysis', demandLevel: 80, supplyLevel: 55, gap: 25, category: 'Data' },
  { skill: 'Cybersecurity', demandLevel: 78, supplyLevel: 35, gap: 43, category: 'Security' },
  { skill: 'Mobile Development', demandLevel: 75, supplyLevel: 50, gap: 25, category: 'Development' },
  { skill: 'DevOps', demandLevel: 72, supplyLevel: 30, gap: 42, category: 'Infrastructure' },
  { skill: 'UI/UX Design', demandLevel: 70, supplyLevel: 40, gap: 30, category: 'Design' },
  { skill: 'Project Management', demandLevel: 68, supplyLevel: 50, gap: 18, category: 'Management' },
  { skill: 'Blockchain', demandLevel: 60, supplyLevel: 20, gap: 40, category: 'Emerging Tech' },
];

export const mockEmployerFeedback: EmployerFeedbackMetric[] = [
  { company: 'Ethio Telecom', competencyRating: 4.2, communicationRating: 3.8, technicalRating: 4.5, overallRating: 4.2, responses: 45 },
  { company: 'Ethiopian Airlines', competencyRating: 4.0, communicationRating: 4.2, technicalRating: 4.1, overallRating: 4.1, responses: 32 },
  { company: 'INSA', competencyRating: 4.5, communicationRating: 3.5, technicalRating: 4.8, overallRating: 4.3, responses: 28 },
  { company: 'Huawei Ethiopia', competencyRating: 4.3, communicationRating: 4.0, technicalRating: 4.6, overallRating: 4.3, responses: 35 },
  { company: 'Safaricom', competencyRating: 3.9, communicationRating: 4.1, technicalRating: 4.2, overallRating: 4.0, responses: 22 },
];

export const mockSalaryDistributions: SalaryDistribution[] = [
  { range: '< 5,000 ETB', count: 45, percentage: 8 },
  { range: '5,000 - 10,000 ETB', count: 120, percentage: 22 },
  { range: '10,000 - 20,000 ETB', count: 185, percentage: 34 },
  { range: '20,000 - 35,000 ETB', count: 110, percentage: 20 },
  { range: '35,000 - 50,000 ETB', count: 55, percentage: 10 },
  { range: '> 50,000 ETB', count: 32, percentage: 6 },
];

export const mockTopEmployers: TopEmployer[] = [
  { company: 'Ethio Telecom', hires: 85, averageSalary: '18,000 ETB', departments: ['CS', 'EE', 'SE'] },
  { company: 'Ethiopian Airlines', hires: 62, averageSalary: '22,000 ETB', departments: ['ME', 'EE', 'IE'] },
  { company: 'INSA', hires: 48, averageSalary: '25,000 ETB', departments: ['CS', 'SE', 'Cybersec'] },
  { company: 'Huawei Ethiopia', hires: 42, averageSalary: '28,000 ETB', departments: ['CS', 'EE', 'Telecom'] },
  { company: 'Safaricom', hires: 35, averageSalary: '20,000 ETB', departments: ['CS', 'SE', 'EE'] },
];

export const mockTracerMetrics: TracerMetric[] = [
  { interval: '6 Months', sent: 450, responded: 328, responseRate: 73 },
  { interval: '12 Months', sent: 380, responded: 251, responseRate: 66 },
  { interval: '24 Months', sent: 290, responded: 168, responseRate: 58 },
];
