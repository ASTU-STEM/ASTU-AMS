import { GetRecommendedJobs } from '../../../application/use-cases/GetRecommendedJobs';
import { IJobRecommendationRepository } from '../../../application/ports/IJobRecommendationRepository';
import { IAlumniLookupRepository } from '../../../application/ports/IAlumniLookupRepository';
import { AlumniProfileSummary, JobRecommendationEntity } from '../../../domain/entities/JobBoard';
import { AlumniProfileRequiredError } from '../../../domain/errors/JobBoardErrors';

describe('GetRecommendedJobs Use Case', () => {
  let mockRecommendationRepo: jest.Mocked<IJobRecommendationRepository>;
  let mockAlumniRepo: jest.Mocked<IAlumniLookupRepository>;

  const mockAlumni = new AlumniProfileSummary(
    'alumni1', 'user1', 'John Doe', 'john@example.com',
    'dept1', 'SWE', ['TypeScript', 'Node.js'], 3.5, 2024,
    null, 'ACTIVE', 'UNEMPLOYED'
  );

  const mockRecommendation = new JobRecommendationEntity(
    'rec1', 'alumni1', 'job1', 85.5,
    ['department_match', 'skills_overlap'],
    new Date(), new Date('2026-12-31')
  );

  beforeEach(() => {
    mockRecommendationRepo = {
      findByAlumniId: jest.fn(),
      upsertMany: jest.fn(),
      deleteExpired: jest.fn(),
      findActiveJobsForRecommendation: jest.fn(),
    };
    mockAlumniRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findApplicationsByAlumniId: jest.fn(),
      findApplicationByAlumniAndJob: jest.fn(),
      createApplication: jest.fn(),
      updateApplicationStatus: jest.fn(),
    };
  });

  it('should return recommendations for alumni', async () => {
    mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
    mockRecommendationRepo.findByAlumniId.mockResolvedValue([mockRecommendation]);

    const useCase = new GetRecommendedJobs(mockRecommendationRepo, mockAlumniRepo);
    const result = await useCase.execute('user1', 10);

    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(85.5);
    expect(result[0].reasons).toContain('department_match');
  });

  it('should throw AlumniProfileRequiredError if no profile', async () => {
    mockAlumniRepo.findByUserId.mockResolvedValue(null);

    const useCase = new GetRecommendedJobs(mockRecommendationRepo, mockAlumniRepo);
    await expect(useCase.execute('user1', 10)).rejects.toThrow(AlumniProfileRequiredError);
  });

  it('should return empty array when no recommendations exist', async () => {
    mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
    mockRecommendationRepo.findByAlumniId.mockResolvedValue([]);

    const useCase = new GetRecommendedJobs(mockRecommendationRepo, mockAlumniRepo);
    const result = await useCase.execute('user1', 10);

    expect(result).toHaveLength(0);
  });
});
