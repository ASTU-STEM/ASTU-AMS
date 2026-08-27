import { ListPublicJobs, GetJobDetail, SearchJobs } from '../../../application/use-cases/BrowseJobs';
import { IJobBoardRepository } from '../../../application/ports/IJobBoardRepository';
import { IJobViewRepository } from '../../../application/ports/IJobViewRepository';
import { JobWithEmployer, JobDetailView, PaginatedResult } from '../../../domain/entities/JobBoard';
import { JobNotPublishedError } from '../../../domain/errors/JobBoardErrors';

describe('BrowseJobs Use Cases', () => {
  let mockJobBoardRepo: jest.Mocked<IJobBoardRepository>;
  let mockJobViewRepo: jest.Mocked<IJobViewRepository>;

  const mockJobWithEmployer = new JobWithEmployer(
    'job1', 'Software Engineer', 'Build great software', 'Addis Ababa',
    'FULL_TIME', 2, ['TypeScript', 'Node.js'], new Date('2026-12-31'),
    '50000-80000', 50000, 80000, true, 'PUBLISHED', 'SWE', 'MID',
    'Build and maintain apps', 'BSc in CS', new Date(),
    'Tech Corp', 'IT', 'Addis Ababa', null, 'https://techcorp.com', 'emp1'
  );

  const mockJobDetail = new JobDetailView(
    'job1', 'Software Engineer', 'Build great software', 'Addis Ababa',
    'FULL_TIME', 2, ['TypeScript', 'Node.js'], new Date('2026-12-31'),
    '50000-80000', 50000, 80000, true, 'PUBLISHED', 'SWE', 'MID',
    'Build and maintain apps', 'BSc in CS', new Date(),
    'Tech Corp', 'IT', 'Addis Ababa', null, 'https://techcorp.com', 'emp1',
    15, 120, 3, 'A leading tech company', '50-200'
  );

  const mockPaginated: PaginatedResult<JobWithEmployer> = {
    data: [mockJobWithEmployer],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(() => {
    mockJobBoardRepo = {
      findPublicJobs: jest.fn(),
      findJobDetail: jest.fn(),
      findJobById: jest.fn(),
      countApplications: jest.fn(),
    };
    mockJobViewRepo = {
      record: jest.fn(),
      getViewCount: jest.fn(),
      hasViewedRecently: jest.fn(),
    };
  });

  describe('ListPublicJobs', () => {
    it('should return paginated public jobs with default params', async () => {
      mockJobBoardRepo.findPublicJobs.mockResolvedValue(mockPaginated);

      const useCase = new ListPublicJobs(mockJobBoardRepo);
      const result = await useCase.execute({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(mockJobBoardRepo.findPublicJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20, sort: 'newest' })
      );
    });

    it('should pass search filters to repository', async () => {
      mockJobBoardRepo.findPublicJobs.mockResolvedValue(mockPaginated);

      const useCase = new ListPublicJobs(mockJobBoardRepo);
      await useCase.execute({
        keyword: 'nodejs',
        department: 'SWE',
        employmentType: 'FULL_TIME',
        page: 2,
        limit: 10,
      });

      expect(mockJobBoardRepo.findPublicJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'nodejs',
          department: 'SWE',
          employmentType: 'FULL_TIME',
          page: 2,
          limit: 10,
        })
      );
    });

    it('should return empty results when no jobs match', async () => {
      const emptyResult: PaginatedResult<JobWithEmployer> = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockJobBoardRepo.findPublicJobs.mockResolvedValue(emptyResult);

      const useCase = new ListPublicJobs(mockJobBoardRepo);
      const result = await useCase.execute({});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should cap limit at 50', async () => {
      mockJobBoardRepo.findPublicJobs.mockResolvedValue(mockPaginated);

      const useCase = new ListPublicJobs(mockJobBoardRepo);
      await useCase.execute({ limit: 200 });

      expect(mockJobBoardRepo.findPublicJobs).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });
  });

  describe('GetJobDetail', () => {
    it('should return job detail and record view', async () => {
      mockJobBoardRepo.findJobDetail.mockResolvedValue(mockJobDetail);
      mockJobViewRepo.hasViewedRecently.mockResolvedValue(false);

      const useCase = new GetJobDetail(mockJobBoardRepo, mockJobViewRepo);
      const result = await useCase.execute('job1', null, '127.0.0.1');

      expect(result).toEqual(mockJobDetail);
      expect(mockJobViewRepo.record).toHaveBeenCalledWith('job1', null, '127.0.0.1');
    });

    it('should throw JobNotPublishedError if job not found', async () => {
      mockJobBoardRepo.findJobDetail.mockResolvedValue(null);

      const useCase = new GetJobDetail(mockJobBoardRepo, mockJobViewRepo);
      await expect(useCase.execute('nonexistent', null, null)).rejects.toThrow(JobNotPublishedError);
    });

    it('should deduplicate views within 24h for authenticated users', async () => {
      mockJobBoardRepo.findJobDetail.mockResolvedValue(mockJobDetail);
      mockJobViewRepo.hasViewedRecently.mockResolvedValue(true);

      const useCase = new GetJobDetail(mockJobBoardRepo, mockJobViewRepo);
      await useCase.execute('job1', 'alumni1', '127.0.0.1');

      expect(mockJobViewRepo.record).not.toHaveBeenCalled();
    });
  });

  describe('SearchJobs', () => {
    it('should delegate to findPublicJobs with keyword', async () => {
      mockJobBoardRepo.findPublicJobs.mockResolvedValue(mockPaginated);

      const useCase = new SearchJobs(mockJobBoardRepo);
      const result = await useCase.execute({ keyword: 'developer' });

      expect(result.data).toHaveLength(1);
      expect(mockJobBoardRepo.findPublicJobs).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: 'developer' })
      );
    });
  });
});
