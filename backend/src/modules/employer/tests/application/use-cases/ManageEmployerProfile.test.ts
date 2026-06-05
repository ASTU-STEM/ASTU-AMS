import { GetEmployerProfile, UpdateEmployerProfile } from '../../../application/use-cases/ManageEmployerProfile';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { EmployerNotFoundError } from '../../../domain/errors/EmployerErrors';
import { EmployerProfile } from '../../../domain/entities/Employer';

describe('ManageEmployerProfile Use Cases', () => {
  let mockRepo: jest.Mocked<IEmployerProfileRepository>;
  const mockProfile = new EmployerProfile('emp1', 'usr1', 'Tech Corp', 'IT', 'City', 'HR', null, null, true);

  beforeEach(() => {
    mockRepo = { findByUserId: jest.fn(), update: jest.fn() } as any;
  });

  describe('GetEmployerProfile', () => {
    it('should return profile if found', async () => {
      mockRepo.findByUserId.mockResolvedValue(mockProfile);
      const useCase = new GetEmployerProfile(mockRepo);
      const result = await useCase.execute('usr1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw EmployerNotFoundError if not found', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      const useCase = new GetEmployerProfile(mockRepo);
      await expect(useCase.execute('usr1')).rejects.toThrow(EmployerNotFoundError);
    });
  });

  describe('UpdateEmployerProfile', () => {
    it('should update profile successfully', async () => {
      mockRepo.findByUserId.mockResolvedValue(mockProfile);
      mockRepo.update.mockResolvedValue({ ...mockProfile, companyName: 'New Name' });
      const useCase = new UpdateEmployerProfile(mockRepo);
      const result = await useCase.execute('usr1', { companyName: 'New Name' });
      expect(result.companyName).toBe('New Name');
    });

    it('should throw EmployerNotFoundError if profile not found for update', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      const useCase = new UpdateEmployerProfile(mockRepo);
      await expect(useCase.execute('usr1', {})).rejects.toThrow(EmployerNotFoundError);
    });
  });
});
