import { ScheduleInterview, UpdateInterview, CancelInterview, GetEmployerInterviews } from '../../../application/use-cases/ManageInterviews';
import { IInterviewRepository } from '../../../application/ports/IInterviewRepository';
import { IJobApplicationRepository } from '../../../application/ports/IJobApplicationRepository';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { IJobRepository } from '../../../application/ports/IJobRepository';
import { Interview, JobApplication, EmployerProfile, Job } from '../../../domain/entities/Employer';
import { JobApplicationNotFoundError, UnauthorizedEmployerActionError } from '../../../domain/errors/EmployerErrors';

describe('ManageInterviews Use Cases', () => {
  let mockInterviewRepo: jest.Mocked<IInterviewRepository>;
  let mockAppRepo: jest.Mocked<IJobApplicationRepository>;
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;
  let mockJobRepo: jest.Mocked<IJobRepository>;

  const mockEmp = new EmployerProfile('emp1', 'usr1', 'Tech', 'IT', 'City', 'HR', null, null, true);
  const mockJob = new Job('job1', 'emp1', 'Dev', 'Desc', 'Remote', 'FULL_TIME', 2, ['JS'], new Date(), null, true);
  const mockApp = new JobApplication('app1', 'job1', 'alumni1', 'PENDING', null, null);
  const mockInterview = new Interview('int1', 'app1', 'Interviewer 1', new Date(), 'ONLINE', 'http://meeting', null, null, 'SCHEDULED', new Date(), new Date());

  beforeEach(() => {
    mockInterviewRepo = {
      findById: jest.fn(),
      findByEmployerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockAppRepo = {
      findById: jest.fn(),
      findByJobId: jest.fn(),
      findByAlumniId: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as any;
    mockEmpRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    } as any;
    mockJobRepo = {
      findById: jest.fn(),
      findByEmployerId: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  describe('ScheduleInterview', () => {
    it('should schedule interview successfully', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockAppRepo.findById.mockResolvedValue(mockApp);
      mockJobRepo.findById.mockResolvedValue(mockJob);
      mockInterviewRepo.create.mockResolvedValue(mockInterview);

      const useCase = new ScheduleInterview(mockInterviewRepo, mockAppRepo, mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', {
        applicationId: 'app1',
        interviewer: 'Interviewer 1',
        interviewDate: new Date(),
        interviewType: 'ONLINE',
        meetingLink: 'http://meeting',
      });

      expect(result).toEqual(mockInterview);
      expect(mockAppRepo.updateStatus).toHaveBeenCalledWith('app1', 'INTERVIEW_SCHEDULED');
    });

    it('should throw JobApplicationNotFoundError if application not found', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockAppRepo.findById.mockResolvedValue(null);

      const useCase = new ScheduleInterview(mockInterviewRepo, mockAppRepo, mockJobRepo, mockEmpRepo);
      await expect(useCase.execute('usr1', {
        applicationId: 'app1',
        interviewer: 'Interviewer 1',
        interviewDate: new Date(),
        interviewType: 'ONLINE',
      })).rejects.toThrow(JobApplicationNotFoundError);
    });

    it('should throw UnauthorizedEmployerActionError if employer does not own the job', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockAppRepo.findById.mockResolvedValue(mockApp);
      mockJobRepo.findById.mockResolvedValue({ ...mockJob, employerId: 'otherEmp' });

      const useCase = new ScheduleInterview(mockInterviewRepo, mockAppRepo, mockJobRepo, mockEmpRepo);
      await expect(useCase.execute('usr1', {
        applicationId: 'app1',
        interviewer: 'Interviewer 1',
        interviewDate: new Date(),
        interviewType: 'ONLINE',
      })).rejects.toThrow(UnauthorizedEmployerActionError);
    });
  });

  describe('UpdateInterview', () => {
    it('should update interview details if owned by employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockInterviewRepo.findById.mockResolvedValue(mockInterview);
      mockAppRepo.findById.mockResolvedValue(mockApp);
      mockJobRepo.findById.mockResolvedValue(mockJob);
      mockInterviewRepo.update.mockResolvedValue({ ...mockInterview, interviewer: 'Interviewer 2' });

      const useCase = new UpdateInterview(mockInterviewRepo, mockAppRepo, mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', 'int1', { interviewer: 'Interviewer 2' });

      expect(result.interviewer).toBe('Interviewer 2');
    });
  });

  describe('CancelInterview', () => {
    it('should cancel interview if owned by employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockInterviewRepo.findById.mockResolvedValue(mockInterview);
      mockAppRepo.findById.mockResolvedValue(mockApp);
      mockJobRepo.findById.mockResolvedValue(mockJob);

      const useCase = new CancelInterview(mockInterviewRepo, mockAppRepo, mockJobRepo, mockEmpRepo);
      await useCase.execute('usr1', 'int1');

      expect(mockInterviewRepo.update).toHaveBeenCalledWith('int1', { status: 'CANCELLED' });
    });
  });
});
