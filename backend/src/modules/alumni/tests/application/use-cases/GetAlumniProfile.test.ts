import { GetAlumniProfile } from '../../../application/use-cases/GetAlumniProfile';
import { IAlumniProfileRepository } from '../../../application/ports/IAlumniProfileRepository';
import { AlumniProfile } from '../../../domain/entities/Alumni';
import { AlumniNotFoundError } from '../../../domain/errors/AlumniErrors';

describe('GetAlumniProfile Use Case', () => {
  let useCase: GetAlumniProfile;
  let mockRepo: jest.Mocked<IAlumniProfileRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new GetAlumniProfile(mockRepo);
  });

  it('should return profile when user exists', async () => {
    const mockProfile = new AlumniProfile('id1', 'userId1', 'stu1', 'John Doe', 'email@test.com', 'ACTIVE', true);
    mockRepo.findByUserId.mockResolvedValue(mockProfile);

    const result = await useCase.execute('userId1');
    expect(result).toEqual(mockProfile);
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('userId1');
  });

  it('should throw AlumniNotFoundError when profile does not exist', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('userId1')).rejects.toThrow(AlumniNotFoundError);
  });
});
