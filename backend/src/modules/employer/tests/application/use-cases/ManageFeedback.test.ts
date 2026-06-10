import { SubmitFeedback, GetEmployerFeedback } from '../../../application/use-cases/ManageFeedback';
import { IEmployerFeedbackRepository } from '../../../application/ports/IEmployerFeedbackRepository';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { IJobApplicationRepository } from '../../../application/ports/IJobApplicationRepository';
import { EmployerFeedback, EmployerProfile, JobApplication } from '../../../domain/entities/Employer';
import { EmployerNotFoundError, JobApplicationError } from '../../../domain/errors/EmployerErrors';

describe('ManageFeedback Use Cases', () => {
  let mockFeedbackRepo: jest.Mocked<IEmployerFeedbackRepository>;
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;
  let mockAppRepo: jest.Mocked<IJobApplicationRepository>;

  const mockEmp = new EmployerProfile('emp1', 'usr1', 'Tech', 'IT', 'City', 'HR', null, null, true);
  const mockApp = new JobApplication('app1', 'job1', 'alumni1', 'HIRED', null, null);
  const mockFeedback = new EmployerFeedback('fb1', 'emp1', 'alumni1', 9, 8, 8, 9, 8, 9, 'Great work', 9, ['Cloud'], ['React'], true, new Date());

  beforeEach(() => {
    mockFeedbackRepo = {
      create: jest.fn(),
      findByEmployerId: jest.fn(),
      findAll: jest.fn(),
    };
    mockEmpRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    } as any;
    mockAppRepo = {
      findById: jest.fn(),
      findByJobId: jest.fn(),
      findByAlumniId: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as any;
  });

  describe('SubmitFeedback', () => {
    it('should submit feedback successfully if candidate was hired by this employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      // Mock checking that there is a job application for the alumni, matching the employer's jobs, and status is HIRED
      mockAppRepo.findByAlumniId.mockResolvedValue([mockApp]);
      mockFeedbackRepo.create.mockResolvedValue(mockFeedback);

      const useCase = new SubmitFeedback(mockFeedbackRepo, mockEmpRepo, mockAppRepo);
      const result = await useCase.execute('usr1', {
        alumniId: 'alumni1',
        technicalSkill: 9,
        communicationSkill: 8,
        leadershipSkill: 8,
        teamworkSkill: 9,
        problemSolvingSkill: 8,
        innovationSkill: 9,
        feedbackText: 'Great work',
        overallSatisfaction: 9,
        missingSkills: ['Cloud'],
        technologiesNeeded: ['React'],
        wouldHireAgain: true,
      });

      expect(result).toEqual(mockFeedback);
    });

    it('should throw JobApplicationError if candidate was not hired by this employer', async () => {
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockAppRepo.findByAlumniId.mockResolvedValue([{ ...mockApp, status: 'SHORTLISTED' }]);

      const useCase = new SubmitFeedback(mockFeedbackRepo, mockEmpRepo, mockAppRepo);
      await expect(useCase.execute('usr1', {
        alumniId: 'alumni1',
        technicalSkill: 9,
        communicationSkill: 8,
        leadershipSkill: 8,
        teamworkSkill: 9,
        problemSolvingSkill: 8,
        innovationSkill: 9,
      })).rejects.toThrow(JobApplicationError);
    });
  });
});
