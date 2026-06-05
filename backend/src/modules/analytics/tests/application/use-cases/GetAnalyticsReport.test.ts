import { GetAnalyticsReport } from '../../../application/use-cases/GetAnalyticsReport';
import { IAnalyticsRepository } from '../../../application/ports/IAnalyticsRepository';
import { 
  EmploymentStats, 
  SkillGapStats, 
  DepartmentMetric, 
  EmployerAnalytics, 
  DepartmentAnalytics, 
  CurriculumAnalytics, 
  TracerAnalytics 
} from '../../../domain/entities/Analytics';

import prisma, { initPrisma } from '../../../../../core/config/db';
import { AnalyticsCacheService } from '../../../infrastructure/services/AnalyticsCacheService';

jest.mock('../../../infrastructure/services/AnalyticsCacheService', () => ({
  AnalyticsCacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  }
}));

describe('GetAnalyticsReport Use Case', () => {
  beforeAll(async () => {
    await initPrisma();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  let mockRepo: jest.Mocked<IAnalyticsRepository>;

  const mockEmployment = new EmploymentStats(
    100, 80, 15, 5, 
    80, 15, 5, 
    25000, 24000, 12.5, 3.2, 
    [{ year: 2024, rate: 80 }], 
    [{ year: 2024, employed: 80, unemployed: 15, selfEmployed: 5 }]
  );

  const mockSkills = new SkillGapStats(8.5, 7.5, 8.0, 9.0, 7.0, 8.5, 50);
  
  const mockDepts = [
    new DepartmentMetric(
      'Software Eng', 'SWE', 50, 90, 28000, 92.5, 
      [{ status: 'EMPLOYED', count: 45 }, { status: 'UNEMPLOYED', count: 5 }]
    )
  ];

  const mockEmployers = new EmployerAnalytics(
    [{ companyName: 'Safaricom Ethiopia', count: 5 }],
    [{ companyName: 'Safaricom Ethiopia', jobPostCount: 2 }],
    [{ companyName: 'Safaricom Ethiopia', rate: 100 }],
    8.2,
    [{ month: 'Jun', jobCount: 2 }],
    [{ companyName: 'Safaricom Ethiopia', score: 8.5 }],
    [{ companyName: 'Safaricom Ethiopia', averageSalaryPaid: 28000 }],
    [{ companyName: 'Safaricom Ethiopia', growthPercentage: 15 }]
  );

  const mockDeptAnalytics = new DepartmentAnalytics(
    mockDepts,
    [{ code: 'SWE', rank: 1 }],
    [{ code: 'SWE', averageSalary: 28000 }],
    [{ year: 2024, departments: [{ code: 'SWE', rate: 90 }] }],
    [{ code: 'SWE', score: 92.5 }]
  );

  const mockCurriculum = new CurriculumAnalytics(
    [{ skill: 'Technical Skills', gapScore: 0.5 }],
    [{ skill: 'Cloud Computing', demandCount: 2 }],
    [{ skill: 'Cloud Computing', count: 3 }],
    85.0,
    [{ area: 'Soft Skills', priority: 'HIGH', description: 'Enhance communication' }]
  );

  const mockTracer = new TracerAnalytics(100, 100, 100, [{ date: '2026-06-05', count: 5 }], 85.0);

  beforeEach(() => {
    mockRepo = {
      getOverallEmploymentStats: jest.fn(),
      getSkillGapStats: jest.fn(),
      getDepartmentMetrics: jest.fn(),
      getEmployerAnalytics: jest.fn(),
      getDepartmentAnalytics: jest.fn(),
      getCurriculumAnalytics: jest.fn(),
      getTracerAnalytics: jest.fn(),
    };
  });

  it('should return combined analytics report successfully', async () => {
    mockRepo.getOverallEmploymentStats.mockResolvedValue(mockEmployment);
    mockRepo.getSkillGapStats.mockResolvedValue(mockSkills);
    mockRepo.getDepartmentMetrics.mockResolvedValue(mockDepts);
    mockRepo.getEmployerAnalytics.mockResolvedValue(mockEmployers);
    mockRepo.getDepartmentAnalytics.mockResolvedValue(mockDeptAnalytics);
    mockRepo.getCurriculumAnalytics.mockResolvedValue(mockCurriculum);
    mockRepo.getTracerAnalytics.mockResolvedValue(mockTracer);

    const useCase = new GetAnalyticsReport(mockRepo);
    const result = await useCase.execute();

    expect(result.overallEmployment.employmentRate).toBe(80);
    expect(result.skills.averageTechnical).toBe(8.5);
    expect(result.departments[0].departmentCode).toBe('SWE');
    expect(result.employers.topHiringCompanies[0].companyName).toBe('Safaricom Ethiopia');
    expect(result.curriculum.curriculumRelevanceScore).toBe(85.0);
  });
});
