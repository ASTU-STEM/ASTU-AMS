import { GetEmployerDashboardStats } from '../../../application/use-cases/GetEmployerDashboardStats';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { IDashboardAnalyticsRepository } from '../../../application/ports/IDashboardAnalyticsRepository';
import { EmployerProfile } from '../../../domain/entities/Employer';
import { EmployerNotFoundError } from '../../../domain/errors/EmployerErrors';

describe('GetEmployerDashboardStats Use Case', () => {
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;
  let mockAnalyticsRepo: jest.Mocked<IDashboardAnalyticsRepository>;

  const mockEmp = new EmployerProfile('emp1', 'usr1', 'Tech', 'IT', 'City', 'HR', null, null, true);

  beforeEach(() => {
    mockEmpRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    } as any;
    mockAnalyticsRepo = {
      getStatsByEmployerId: jest.fn(),
    };
  });

  it('should fetch and return dashboard metrics successfully', async () => {
    mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
    mockAnalyticsRepo.getStatsByEmployerId.mockResolvedValue({
      activeJobs: 3,
      closedJobs: 1,
      totalApplications: 10,
      interviewsScheduled: 2,
      hiredCandidates: 2,
      hiringRate: 20,
      averageTimeToHire: 14.5,
    });

    const useCase = new GetEmployerDashboardStats(mockEmpRepo, mockAnalyticsRepo);
    const result = await useCase.execute('usr1');

    expect(result.activeJobs).toBe(3);
    expect(result.hiringRate).toBe(20);
    expect(result.averageTimeToHire).toBe(14.5);
    expect(mockAnalyticsRepo.getStatsByEmployerId).toHaveBeenCalledWith('emp1');
  });

  it('should throw EmployerNotFoundError if profile not found', async () => {
    mockEmpRepo.findByUserId.mockResolvedValue(null);

    const useCase = new GetEmployerDashboardStats(mockEmpRepo, mockAnalyticsRepo);
    await expect(useCase.execute('usr1')).rejects.toThrow(EmployerNotFoundError);
  });
});
