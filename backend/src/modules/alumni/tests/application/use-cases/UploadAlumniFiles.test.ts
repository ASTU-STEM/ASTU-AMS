import { UploadAlumniFiles } from '../../../application/use-cases/UploadAlumniFiles';
import { IAlumniProfileRepository } from '../../../application/ports/IAlumniProfileRepository';
import { AlumniProfile } from '../../../domain/entities/Alumni';
import { AlumniNotFoundError, FileUploadError } from '../../../domain/errors/AlumniErrors';

describe('UploadAlumniFiles Use Case', () => {
  let useCase: UploadAlumniFiles;
  let mockRepo: jest.Mocked<IAlumniProfileRepository>;

  const mockProfile = new AlumniProfile('id1', 'userId1', 'stu1', 'John Doe', 'email@test.com', 'ACTIVE', true);

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UploadAlumniFiles(mockRepo);
  });

  it('should update resume and profile picture', async () => {
    mockRepo.findByUserId.mockResolvedValue(mockProfile);
    mockRepo.update.mockResolvedValue({ ...mockProfile, resumeUrl: '/path/cv.pdf' });

    const result = await useCase.execute('userId1', { resumeUrl: '/path/cv.pdf' });
    
    expect(result.resumeUrl).toBe('/path/cv.pdf');
    expect(mockRepo.update).toHaveBeenCalledWith('userId1', { resumeUrl: '/path/cv.pdf' });
  });

  it('should throw FileUploadError if no files provided', async () => {
    mockRepo.findByUserId.mockResolvedValue(mockProfile);
    await expect(useCase.execute('userId1', {})).rejects.toThrow(FileUploadError);
  });
});
