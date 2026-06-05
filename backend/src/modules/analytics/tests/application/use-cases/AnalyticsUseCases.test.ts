import { GetAlumniAnalytics } from '../../../application/use-cases/GetAlumniAnalytics';
import { GetEmployerAnalytics } from '../../../application/use-cases/GetEmployerAnalytics';
import { GetDepartmentAnalytics } from '../../../application/use-cases/GetDepartmentAnalytics';
import { GetCurriculumAnalytics } from '../../../application/use-cases/GetCurriculumAnalytics';
import { GetTracerAnalytics } from '../../../application/use-cases/GetTracerAnalytics';
import { GetAnalyticsInsights } from '../../../application/use-cases/GetAnalyticsInsights';
import { GetAnalyticsRecommendations } from '../../../application/use-cases/GetAnalyticsRecommendations';
import { IAnalyticsRepository } from '../../../application/ports/IAnalyticsRepository';
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

describe('Traditional Analytics Use Cases', () => {
  let mockRepo: jest.Mocked<IAnalyticsRepository>;

  beforeAll(async () => {
    await initPrisma();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

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

  it('GetAlumniAnalytics should fetch and return alumni stats', async () => {
    const mockData = { totalAlumni: 10 } as any;
    mockRepo.getOverallEmploymentStats.mockResolvedValue(mockData);

    const useCase = new GetAlumniAnalytics(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual(mockData);
    expect(mockRepo.getOverallEmploymentStats).toHaveBeenCalled();
  });

  it('GetEmployerAnalytics should fetch and return employer stats', async () => {
    const mockData = { topHiringCompanies: [] } as any;
    mockRepo.getEmployerAnalytics.mockResolvedValue(mockData);

    const useCase = new GetEmployerAnalytics(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual(mockData);
    expect(mockRepo.getEmployerAnalytics).toHaveBeenCalled();
  });

  it('GetDepartmentAnalytics should fetch and return department stats', async () => {
    const mockData = { departmentMetrics: [] } as any;
    mockRepo.getDepartmentAnalytics.mockResolvedValue(mockData);

    const useCase = new GetDepartmentAnalytics(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual(mockData);
    expect(mockRepo.getDepartmentAnalytics).toHaveBeenCalled();
  });

  it('GetCurriculumAnalytics should fetch and return skills stats', async () => {
    const mockData = { skillGaps: [] } as any;
    mockRepo.getCurriculumAnalytics.mockResolvedValue(mockData);

    const useCase = new GetCurriculumAnalytics(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual(mockData);
    expect(mockRepo.getCurriculumAnalytics).toHaveBeenCalled();
  });

  it('GetTracerAnalytics should fetch and return tracer stats', async () => {
    const mockData = { responseRate: 100 } as any;
    mockRepo.getTracerAnalytics.mockResolvedValue(mockData);

    const useCase = new GetTracerAnalytics(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual(mockData);
    expect(mockRepo.getTracerAnalytics).toHaveBeenCalled();
  });

  it('GetAnalyticsInsights should return a list of text insights', async () => {
    mockRepo.getOverallEmploymentStats.mockResolvedValue({ employmentRate: 80, selfEmploymentRate: 10 } as any);
    mockRepo.getCurriculumAnalytics.mockResolvedValue({ missingSkills: [{ skill: 'Cloud', demandCount: 2 }], curriculumRelevanceScore: 85 } as any);
    mockRepo.getDepartmentMetrics.mockResolvedValue([]);
    mockRepo.getEmployerAnalytics.mockResolvedValue({ topHiringCompanies: [] } as any);

    const useCase = new GetAnalyticsInsights(mockRepo);
    const result = await useCase.execute();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('GetAnalyticsRecommendations should return categorized suggestions', async () => {
    mockRepo.getCurriculumAnalytics.mockResolvedValue({ missingSkills: [], curriculumRelevanceScore: 85 } as any);
    mockRepo.getDepartmentMetrics.mockResolvedValue([{ departmentName: 'SWE', employmentRate: 75 }] as any);
    mockRepo.getEmployerAnalytics.mockResolvedValue({ topHiringCompanies: [] } as any);

    const useCase = new GetAnalyticsRecommendations(mockRepo);
    const result = await useCase.execute();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBeDefined();
  });
});
