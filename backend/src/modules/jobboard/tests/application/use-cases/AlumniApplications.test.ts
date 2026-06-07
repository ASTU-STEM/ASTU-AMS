import { ApplyToJob, WithdrawApplication, GetMyApplications } from '../../../application/use-cases/AlumniApplications';
import { IJobBoardRepository } from '../../../application/ports/IJobBoardRepository';
import { IAlumniLookupRepository } from '../../../application/ports/IAlumniLookupRepository';
import { AlumniProfileSummary, AlumniApplicationView } from '../../../domain/entities/JobBoard';
import {
  AlumniProfileRequiredError,
  DuplicateApplicationError,
  JobExpiredError,
  JobClosedError,
  JobNotPublishedError,
  ApplicationNotFoundError,
  CannotWithdrawError,
} from '../../../domain/errors/JobBoardErrors';

describe('AlumniApplications Use Cases', () => {
  let mockJobBoardRepo: jest.Mocked<IJobBoardRepository>;
  let mockAlumniRepo: jest.Mocked<IAlumniLookupRepository>;

  const mockAlumni = new AlumniProfileSummary(
    'alumni1', 'user1', 'John Doe', 'john@example.com',
    'dept1', 'SWE', ['TypeScript', 'Node.js'], 3.5, 2024,
    '/uploads/resume.pdf', 'ACTIVE', 'UNEMPLOYED'
  );

  const futureDate = new Date('2026-12-31');
  const pastDate = new Date('2020-01-01');

  const mockActiveJob = {
    id: 'job1',
    title: 'Software Engineer',
    status: 'PUBLISHED',
    isActive: true,
    deadline: futureDate,
    employerId: 'emp1',
  };

  const mockExpiredJob = {
    ...mockActiveJob,
    id: 'expired-job',
    deadline: pastDate,
  };

  const mockClosedJob = {
    ...mockActiveJob,
    id: 'closed-job',
    status: 'CLOSED',
  };

  const mockApplication = {
    id: 'app1',
    jobId: 'job1',
    alumniId: 'alumni1',
    status: 'PENDING',
    resumeUrl: '/uploads/resume.pdf',
    coverLetter: 'I am interested...',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAppView = new AlumniApplicationView(
    'app1', 'job1', 'Software Engineer', 'Tech Corp',
    'PENDING', '/uploads/resume.pdf', 'I am interested...',
    new Date(), new Date()
  );

  beforeEach(() => {
    mockJobBoardRepo = {
      findPublicJobs: jest.fn(),
      findJobDetail: jest.fn(),
      findJobById: jest.fn(),
      countApplications: jest.fn(),
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

  describe('ApplyToJob', () => {
    it('should create application successfully', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(mockActiveJob);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue(null);
      mockAlumniRepo.createApplication.mockResolvedValue(mockApplication);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      const result = await useCase.execute('user1', 'job1', {
        resumeUrl: '/uploads/resume.pdf',
        coverLetter: 'I am interested...',
      });

      expect(result).toEqual(mockApplication);
      expect(mockAlumniRepo.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 'job1',
          alumniId: 'alumni1',
          status: 'PENDING',
        })
      );
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      await expect(
        useCase.execute('user1', 'job1', {})
      ).rejects.toThrow(AlumniProfileRequiredError);
    });

    it('should throw JobNotPublishedError if job not found', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(null);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      await expect(
        useCase.execute('user1', 'job1', {})
      ).rejects.toThrow(JobNotPublishedError);
    });

    it('should throw JobExpiredError if deadline has passed', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(mockExpiredJob);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      await expect(
        useCase.execute('user1', 'expired-job', {})
      ).rejects.toThrow(JobExpiredError);
    });

    it('should throw JobClosedError if job status is CLOSED', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(mockClosedJob);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      await expect(
        useCase.execute('user1', 'closed-job', {})
      ).rejects.toThrow(JobClosedError);
    });

    it('should throw DuplicateApplicationError if already applied', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockJobBoardRepo.findJobById.mockResolvedValue(mockActiveJob);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue(mockApplication);

      const useCase = new ApplyToJob(mockJobBoardRepo, mockAlumniRepo);
      await expect(
        useCase.execute('user1', 'job1', {})
      ).rejects.toThrow(DuplicateApplicationError);
    });
  });

  describe('WithdrawApplication', () => {
    it('should withdraw application successfully', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue(mockApplication);
      mockAlumniRepo.updateApplicationStatus.mockResolvedValue({ ...mockApplication, status: 'WITHDRAWN' });

      const useCase = new WithdrawApplication(mockAlumniRepo);
      const result = await useCase.execute('user1', 'job1');

      expect(result.status).toBe('WITHDRAWN');
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new WithdrawApplication(mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(AlumniProfileRequiredError);
    });

    it('should throw ApplicationNotFoundError if no application', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue(null);

      const useCase = new WithdrawApplication(mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(ApplicationNotFoundError);
    });

    it('should throw CannotWithdrawError if already HIRED', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue({ ...mockApplication, status: 'HIRED' });

      const useCase = new WithdrawApplication(mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(CannotWithdrawError);
    });

    it('should throw CannotWithdrawError if already REJECTED', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue({ ...mockApplication, status: 'REJECTED' });

      const useCase = new WithdrawApplication(mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(CannotWithdrawError);
    });

    it('should throw CannotWithdrawError if already WITHDRAWN', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationByAlumniAndJob.mockResolvedValue({ ...mockApplication, status: 'WITHDRAWN' });

      const useCase = new WithdrawApplication(mockAlumniRepo);
      await expect(useCase.execute('user1', 'job1')).rejects.toThrow(CannotWithdrawError);
    });
  });

  describe('GetMyApplications', () => {
    it('should return alumni applications', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockAlumni);
      mockAlumniRepo.findApplicationsByAlumniId.mockResolvedValue([mockAppView]);

      const useCase = new GetMyApplications(mockAlumniRepo);
      const result = await useCase.execute('user1');

      expect(result).toHaveLength(1);
      expect(result[0].jobTitle).toBe('Software Engineer');
    });

    it('should throw AlumniProfileRequiredError if no profile', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);

      const useCase = new GetMyApplications(mockAlumniRepo);
      await expect(useCase.execute('user1')).rejects.toThrow(AlumniProfileRequiredError);
    });
  });
});
