import { ApplyForJob, UpdateApplicationStatus } from '../../../application/use-cases/ManageJobApplications';
import { IJobApplicationRepository } from '../../../application/ports/IJobApplicationRepository';
import { IJobRepository } from '../../../application/ports/IJobRepository';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { JobNotFoundError, UnauthorizedEmployerActionError, JobApplicationError } from '../../../domain/errors/EmployerErrors';
import { Job, JobApplication, EmployerProfile } from '../../../domain/entities/Employer';

describe('ManageJobApplications Use Cases', () => {
  let mockAppRepo: jest.Mocked<IJobApplicationRepository>;
  let mockJobRepo: jest.Mocked<IJobRepository>;
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;

  const mockJob = new Job('job1', 'emp1', 'Dev', 'Desc', 'Remote', 'FULL_TIME', 2, [], new Date(), null, true);
  const mockEmp = new EmployerProfile('emp1', 'usr1', 'Tech', 'IT', 'City', 'HR', null, null, true);
  const mockApp = new JobApplication('app1', 'job1', 'alumni1', 'PENDING', null, null);

  beforeEach(() => {
    mockAppRepo = { findById: jest.fn(), findByJobId: jest.fn(), findByAlumniId: jest.fn(), create: jest.fn(), updateStatus: jest.fn() } as any;
    mockJobRepo = { findById: jest.fn(), findByEmployerId: jest.fn(), search: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
    mockEmpRepo = { findByUserId: jest.fn(), update: jest.fn() } as any;
  });

  describe('ApplyForJob', () => {
    it('should submit application successfully', async () => {
      mockJobRepo.findById.mockResolvedValue(mockJob);
      mockAppRepo.findByAlumniId.mockResolvedValue([]); // not applied yet
      mockAppRepo.create.mockResolvedValue(mockApp);

      const useCase = new ApplyForJob(mockAppRepo, mockJobRepo);
      const result = await useCase.execute('job1', 'alumni1', { resumeUrl: 'link' });

      expect(result).toEqual(mockApp);
    });

    it('should throw JobApplicationError if already applied', async () => {
      mockJobRepo.findById.mockResolvedValue(mockJob);
      mockAppRepo.findByAlumniId.mockResolvedValue([mockApp]); // already applied

      const useCase = new ApplyForJob(mockAppRepo, mockJobRepo);
      await expect(useCase.execute('job1', 'alumni1', {})).rejects.toThrow(JobApplicationError);
    });
  });

  describe('UpdateApplicationStatus', () => {
    it('should update status if employer owns the job', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockAppRepo.findById.mockResolvedValue(mockApp);
      mockJobRepo.findById.mockResolvedValue(mockJob); // job1 belongs to emp1
      mockAppRepo.updateStatus.mockResolvedValue({ ...mockApp, status: 'SHORTLISTED' });

      const useCase = new UpdateApplicationStatus(mockAppRepo, mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', 'app1', 'SHORTLISTED');

      expect(result.status).toBe('SHORTLISTED');
    });
  });
});
