import { RecordJobView } from '../../../application/use-cases/TrackJobView';
import { IJobViewRepository } from '../../../application/ports/IJobViewRepository';
import { IJobBoardRepository } from '../../../application/ports/IJobBoardRepository';
import { JobNotPublishedError } from '../../../domain/errors/JobBoardErrors';

describe('TrackJobView Use Case', () => {
  let mockJobViewRepo: jest.Mocked<IJobViewRepository>;
  let mockJobBoardRepo: jest.Mocked<IJobBoardRepository>;

  beforeEach(() => {
    mockJobViewRepo = {
      record: jest.fn(),
      getViewCount: jest.fn(),
      hasViewedRecently: jest.fn(),
    };
    mockJobBoardRepo = {
      findPublicJobs: jest.fn(),
      findJobDetail: jest.fn(),
      findJobById: jest.fn(),
      countApplications: jest.fn(),
    };
  });

  it('should record a new view for anonymous user', async () => {
    mockJobBoardRepo.findJobById.mockResolvedValue({ id: 'job1' });
    mockJobViewRepo.hasViewedRecently.mockResolvedValue(false);

    const useCase = new RecordJobView(mockJobViewRepo, mockJobBoardRepo);
    await useCase.execute('job1', null, '192.168.1.1');

    expect(mockJobViewRepo.record).toHaveBeenCalledWith('job1', null, '192.168.1.1');
  });

  it('should record a new view for authenticated user', async () => {
    mockJobBoardRepo.findJobById.mockResolvedValue({ id: 'job1' });
    mockJobViewRepo.hasViewedRecently.mockResolvedValue(false);

    const useCase = new RecordJobView(mockJobViewRepo, mockJobBoardRepo);
    await useCase.execute('job1', 'alumni1', '192.168.1.1');

    expect(mockJobViewRepo.record).toHaveBeenCalledWith('job1', 'alumni1', '192.168.1.1');
  });

  it('should skip recording if viewed recently by same alumni', async () => {
    mockJobBoardRepo.findJobById.mockResolvedValue({ id: 'job1' });
    mockJobViewRepo.hasViewedRecently.mockResolvedValue(true);

    const useCase = new RecordJobView(mockJobViewRepo, mockJobBoardRepo);
    await useCase.execute('job1', 'alumni1', '192.168.1.1');

    expect(mockJobViewRepo.record).not.toHaveBeenCalled();
  });

  it('should throw JobNotPublishedError if job not found', async () => {
    mockJobBoardRepo.findJobById.mockResolvedValue(null);

    const useCase = new RecordJobView(mockJobViewRepo, mockJobBoardRepo);
    await expect(
      useCase.execute('nonexistent', null, '192.168.1.1')
    ).rejects.toThrow(JobNotPublishedError);
  });
});
