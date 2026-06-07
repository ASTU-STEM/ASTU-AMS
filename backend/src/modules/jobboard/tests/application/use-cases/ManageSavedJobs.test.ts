import { SaveJob, UnsaveJob, GetSavedJobs } from '../../../application/use-cases/ManageSavedJobs';
import { ISavedJobRepository } from '../../../application/ports/ISavedJobRepository';
import { IAlumniLookupRepository } from '../../../application/ports/IAlumniLookupRepository';
import { IJobBoardRepository } from '../../../application/ports/IJobBoardRepository';
import { AlumniProfileSummary, SavedJobEntity, PaginatedResult } from '../../../domain/entities/JobBoard';
import { AlumniProfileRequiredError, JobNotPublishedError } from '../../../domain/errors/JobBoardErrors';

describe('ManageSavedJobs Use Cases', () => {
  let mockSavedJobRepo: jest.Mocked<ISavedJobRepository>;
  let mockAlumniRepo: jest.Mocked<IAlumniLookupRepository>;
  let mockJobBoardRepo: jest.Mocked<IJobBoardRepository>;

  const mockAlumni = new AlumniProfileSummary(
    'alumni1', 'user1', 'John Doe', 'john@example.com',
    'dept1', 'SWE', ['TypeScript'], 3.5, 2024,
    null, 'ACTIVE', 'UNEMPLOYED'
  );

  const mockSavedJob = new SavedJobEntity('saved1', 'alumni1', 'job1', new Date());

  beforeEach(() => {
    mockSavedJobRepo = {
      save: jest.fn(),
      unsave: jest.fn(),
      findByAlumniId: jest.fn(),
      isSaved: jest.fn(),
    };
    mockAlumniRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findApplicationsByAlumniId: jest.fn(),
      findApplicationByAlumniAndJob: jest.fn(),
      createApplication: jest.fn(),
      updateApplicationStatus: jest.fn(),
    };
    mockJobBoardRepo = {
      findPublicJobs: jest.fn(),
      findJobDetail: jest.fn(),
      findJobById: jest.fn(),
      countApplications: jest.fn(),
    };
  });

  describe('SaveJob', () => {
    it('should save a job successfully', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue({ id: 'job1' });
      mockSavedJobRepo.save.mockResolvedValue(mockSavedJob);

      const useCase = new SaveJob(mockSavedJobRepo, mockAlumniRepo, mockJobBoardRepo);
      const result = await useCase.execute('user1', 'job1');

      expect(result).toEqual(mockSavedJob);
      expect(mockSavedJobRepo.save).toHaveBeenCalledWith('alumni1', 'job1');
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new SaveJob(mockSavedJobRepo, mockAlumniRepo, mockJobBoardRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(AlumniProfileRequiredError);
    });

    it('should throw JobNotPublishedError if job not found', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(null);

      const useCase = new SaveJob(mockSavedJobRepo, mockAlumniRepo, mockJobBoardRepo);
      await expect(useCase.execute('user1', 'nonexistent')).rejects.toThrow(JobNotPublishedError);
    });
  });

  describe('UnsaveJob', () => {
    it('should unsave a job successfully', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockSavedJobRepo.unsave.mockResolvedValue(undefined);

      const useCase = new UnsaveJob(mockSavedJobRepo, mockAlumniRepo);
      await useCase.execute('user1', 'job1');

      expect(mockSavedJobRepo.unsave).toHaveBeenCalledWith('alumni1', 'job1');
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new UnsaveJob(mockSavedJobRepo, mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(AlumniProfileRequiredError);
    });
  });

  describe('GetSavedJobs', () => {
    it('should return paginated saved jobs', async () => {
      const mockResult: PaginatedResult<any> = {
        data: [{ ...mockSavedJob, job: { title: 'Dev' } }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockSavedJobRepo.findByAlumniId.mockResolvedValue(mockResult);

      const useCase = new GetSavedJobs(mockSavedJobRepo, mockAlumniRepo);
      const result = await useCase.execute('user1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new GetSavedJobs(mockSavedJobRepo, mockAlumniRepo);
      await expect(useCase.execute('user1', 1, 20)).rejects.toThrow(AlumniProfileRequiredError);
    });
  });
});
