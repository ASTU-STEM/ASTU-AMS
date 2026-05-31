import { GetAnalyticsReport } from '../../../application/use-cases/GetAnalyticsReport';
import { IAnalyticsRepository } from '../../../application/ports/IAnalyticsRepository';
import { EmploymentStats, SkillGapStats, DepartmentMetric } from '../../../domain/entities/Analytics';

describe('GetAnalyticsReport Use Case', () => {
  let mockRepo: jest.Mocked<IAnalyticsRepository>;

  const mockEmployment = new EmploymentStats(100, 80, 20, 80);
  const mockSkills = new SkillGapStats(8.5, 7.5, 8.0, 9.0, 7.0, 8.5, 50);
  const mockDepts = [new DepartmentMetric('Software Eng', 'SWE', 50, 90)];

  beforeEach(() => {
    mockRepo = {
      getOverallEmploymentStats: jest.fn(),
      getSkillGapStats: jest.fn(),
      getDepartmentMetrics: jest.fn(),
    };
  });

  it('should return combined analytics report successfully', async () => {
    mockRepo.getOverallEmploymentStats.mockResolvedValue(mockEmployment);
    mockRepo.getSkillGapStats.mockResolvedValue(mockSkills);
    mockRepo.getDepartmentMetrics.mockResolvedValue(mockDepts);

    const useCase = new GetAnalyticsReport(mockRepo);
    const result = await useCase.execute();

    expect(result.overallEmployment.employmentRate).toBe(80);
    expect(result.skills.averageTechnical).toBe(8.5);
    expect(result.departments[0].departmentCode).toBe('SWE');
  });
});
