import { UpdateAlumniProfile } from '../application/use-cases/UpdateAlumniProfile';
import { IAlumniRepository } from '../application/ports/IAlumniRepository';
import { Alumni } from '../domain/entities/Alumni';

describe('UpdateAlumniProfile Use Case', () => {
  let mockRepository: jest.Mocked<IAlumniRepository>;
  let updateAlumniProfile: UpdateAlumniProfile;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    updateAlumniProfile = new UpdateAlumniProfile(mockRepository);
  });

  it('should successfully update an alumni name', async () => {
    const existingAlumni = new Alumni('1', 'Old Name', 'UGR/1234/12', 'Software Engineering', 2024);
    mockRepository.findById.mockResolvedValue(existingAlumni);
    
    const result = await updateAlumniProfile.execute('1', 'New Name');
    
    expect(result.name).toBe('New Name');
    expect(mockRepository.save).toHaveBeenCalledWith(result);
  });

  it('should throw an error if alumni is not found', async () => {
    mockRepository.findById.mockResolvedValue(null);
    
    await expect(updateAlumniProfile.execute('2', 'New Name')).rejects.toThrow('Alumni not found');
  });
});
