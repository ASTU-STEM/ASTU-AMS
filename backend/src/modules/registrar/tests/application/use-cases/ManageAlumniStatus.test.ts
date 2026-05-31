import { ManageAlumniStatus } from '../../../application/use-cases/ManageAlumniStatus';
import { IRegistrarAlumniRepository } from '../../../application/ports/IRegistrarAlumniRepository';
import { AlumniStatusUpdateError } from '../../../domain/errors/RegistrarErrors';

describe('ManageAlumniStatus Use Case', () => {
  let mockAlumniRepo: jest.Mocked<IRegistrarAlumniRepository>;
  let useCase: ManageAlumniStatus;

  beforeEach(() => {
    mockAlumniRepo = { findById: jest.fn(), findAll: jest.fn(), updateStatus: jest.fn() };
    // Assuming an IAuditLogger is also needed, we'll mock it
    const mockLogger = { log: jest.fn() } as any;
    useCase = new ManageAlumniStatus(mockAlumniRepo, mockLogger);
  });

  it('should update status and return result', async () => {
    mockAlumniRepo.findById.mockResolvedValue({ id: 'alumni1', status: 'INACTIVE' });
    mockAlumniRepo.updateStatus.mockResolvedValue({ id: 'alumni1', status: 'ACTIVE' });

    const result = await useCase.execute('alumni1', 'ACTIVE', 'Approved', 'admin1', '127.0.0.1');
    expect(result.status).toBe('ACTIVE');
    expect(mockAlumniRepo.updateStatus).toHaveBeenCalledWith('alumni1', 'ACTIVE');
  });

  it('should throw AlumniStatusUpdateError if invalid status', async () => {
    mockAlumniRepo.findById.mockResolvedValue({ id: 'alumni1' });
    
    await expect(useCase.execute('alumni1', 'INVALID_STATUS', '', 'admin1', '127.0.0.1'))
      .rejects.toThrow(AlumniStatusUpdateError);
  });

  it('should throw AlumniStatusUpdateError if alumni not found', async () => {
    mockAlumniRepo.findById.mockResolvedValue(null);
    
    await expect(useCase.execute('UNKNOWN', 'ACTIVE', '', 'admin1', '127.0.0.1'))
      .rejects.toThrow(AlumniStatusUpdateError);
  });
});
