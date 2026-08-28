import { CreateJob, UpdateJob, DeleteJob } from '../../../application/use-cases/ManageJobs';
import { IJobRepository } from '../../../application/ports/IJobRepository';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { EmployerNotFoundError, JobNotFoundError, UnauthorizedEmployerActionError } from '../../../domain/errors/EmployerErrors';
import { EmployerProfile, Job } from '../../../domain/entities/Employer';

describe('ManageJobs Use Cases', () => {
  let mockJobRepo: jest.Mocked<IJobRepository>;
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;
  
  const mockEmp = new EmployerProfile('emp1', 'usr1', 'Tech', 'IT', 'City', 'HR', null, null, true);
  const mockJob = new Job('job1', 'emp1', 'Dev', 'Desc', 'Remote', 'FULL_TIME', 2, ['JS'], new Date(), null, true);

  beforeEach(() => {
    mockJobRepo = { findById: jest.fn(), findByEmployerId: jest.fn(), search: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
    mockEmpRepo = { findByUserId: jest.fn(), update: jest.fn() } as any;
  });

  describe('CreateJob', () => {
    it('should create job successfully', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockJobRepo.create.mockResolvedValue(mockJob);

      const useCase = new CreateJob(mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', { title: 'Dev' });

      expect(result).toEqual({ ...mockJob, recommendations: [] });
      expect(mockJobRepo.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dev', employerId: 'emp1' }));
    });
  });

  describe('UpdateJob', () => {
    it('should update job if owned by employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockJobRepo.findById.mockResolvedValue(mockJob);
      mockJobRepo.update.mockResolvedValue({ ...mockJob, title: 'Lead Dev' });

      const useCase = new UpdateJob(mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', 'job1', { title: 'Lead Dev' });

      expect(result.title).toBe('Lead Dev');
    });

    it('should throw UnauthorizedEmployerActionError if not owner', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue({ ...mockEmp, id: 'otherEmp' });
      mockJobRepo.findById.mockResolvedValue(mockJob); // Job belongs to 'emp1'

      const useCase = new UpdateJob(mockJobRepo, mockEmpRepo);
      await expect(useCase.execute('usr1', 'job1', {})).rejects.toThrow(UnauthorizedEmployerActionError);
    });
  });

  describe('DeleteJob', () => {
    it('should delete job if owned by employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockJobRepo.findById.mockResolvedValue(mockJob);

      const useCase = new DeleteJob(mockJobRepo, mockEmpRepo);
      await useCase.execute('usr1', 'job1');

      expect(mockJobRepo.delete).toHaveBeenCalledWith('job1');
    });
  });
});
