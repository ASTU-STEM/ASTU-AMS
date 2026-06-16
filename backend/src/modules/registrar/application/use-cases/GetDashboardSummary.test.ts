import { GetDashboardSummary } from './GetDashboardSummary';
import { IDashboardRepository } from '../ports/IDashboardRepository';

describe('GetDashboardSummary Use Case', () => {
  let mockRepo: jest.Mocked<IDashboardRepository>;
  let useCase: GetDashboardSummary;

  beforeEach(() => {
    mockRepo = {
      getSummary: jest.fn(),
    };
    useCase = new GetDashboardSummary(mockRepo);
  });

  it('should return the dashboard summary from the repository', async () => {
    const mockSummary = {
      totalGraduates: 100,
      totalAlumni: 50,
      pendingVerifications: 10,
      pendingDocumentRequests: 5,
    };
    mockRepo.getSummary.mockResolvedValue(mockSummary);

    const result = await useCase.execute();

    expect(mockRepo.getSummary).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSummary);
  });
});
