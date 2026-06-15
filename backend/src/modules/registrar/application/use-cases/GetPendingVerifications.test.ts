import { GetPendingVerifications } from './GetPendingVerifications';
import { IRegistrarAlumniRepository } from '../ports/IRegistrarAlumniRepository';

describe('GetPendingVerifications Use Case', () => {
  let mockRepo: jest.Mocked<IRegistrarAlumniRepository>;
  let useCase: GetPendingVerifications;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    useCase = new GetPendingVerifications(mockRepo);
  });

  it('should call repository findAll with PENDING status', async () => {
    const mockPendingAlumni = [
      { id: '1', studentId: '123', fullName: 'Test', status: 'PENDING' }
    ];
    mockRepo.findAll.mockResolvedValue(mockPendingAlumni);

    const result = await useCase.execute();

    expect(mockRepo.findAll).toHaveBeenCalledWith('PENDING');
    expect(result).toEqual(mockPendingAlumni);
  });
});
