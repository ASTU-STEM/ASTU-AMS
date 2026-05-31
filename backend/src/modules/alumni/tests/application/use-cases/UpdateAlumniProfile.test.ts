import { UpdateAlumniProfile } from '../../../application/use-cases/UpdateAlumniProfile';
import { IAlumniProfileRepository } from '../../../application/ports/IAlumniProfileRepository';
import { AlumniProfile } from '../../../domain/entities/Alumni';
import { AlumniNotFoundError } from '../../../domain/errors/AlumniErrors';

describe('UpdateAlumniProfile Use Case', () => {
  let useCase: UpdateAlumniProfile;
  let mockRepo: jest.Mocked<IAlumniProfileRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateAlumniProfile(mockRepo);
  });

  it('should update and return the profile', async () => {
    const mockProfile = new AlumniProfile('id1', 'userId1', 'stu1', 'John Doe', 'email@test.com', 'ACTIVE', true);
    mockRepo.findByUserId.mockResolvedValue(mockProfile);
    mockRepo.update.mockResolvedValue({ ...mockProfile, phone: '123456789' });

    const result = await useCase.execute('userId1', { phone: '123456789' });
    
    expect(result.phone).toBe('123456789');
    expect(mockRepo.update).toHaveBeenCalledWith('userId1', { phone: '123456789' });
  });

  it('should throw AlumniNotFoundError if profile missing', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    await expect(useCase.execute('userId1', {})).rejects.toThrow(AlumniNotFoundError);
  });
});
