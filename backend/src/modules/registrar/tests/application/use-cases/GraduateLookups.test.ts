import { GetGraduateRecord, VerifyStudentId } from '../../../application/use-cases/GraduateLookups';
import { IGraduateRecordRepository } from '../../../application/ports/IGraduateRecordRepository';
import { GraduateNotFoundError } from '../../../domain/errors/RegistrarErrors';
import { GraduateRecord } from '../../../domain/entities/Registrar';

describe('GraduateLookups Use Cases', () => {
  let mockGradRepo: jest.Mocked<IGraduateRecordRepository>;
  const mockRecord = new GraduateRecord('1', 'S1', 'Alice', 'Computer Science', 'CS', 3.8, 2022, 'alice@test.com', '123', 'API', new Date());

  beforeEach(() => {
    mockGradRepo = { findByStudentId: jest.fn(), upsertMany: jest.fn() };
  });

  describe('GetGraduateRecord', () => {
    it('should return record if exists', async () => {
      mockGradRepo.findByStudentId.mockResolvedValue(mockRecord);
      const useCase = new GetGraduateRecord(mockGradRepo);
      
      const result = await useCase.execute('S1');
      expect(result).toEqual(mockRecord);
    });

    it('should throw GraduateNotFoundError if not exists', async () => {
      mockGradRepo.findByStudentId.mockResolvedValue(null);
      const useCase = new GetGraduateRecord(mockGradRepo);
      
      await expect(useCase.execute('S1')).rejects.toThrow(GraduateNotFoundError);
    });
  });

  describe('VerifyStudentId', () => {
    it('should return valid true if student exists', async () => {
      mockGradRepo.findByStudentId.mockResolvedValue(mockRecord);
      const useCase = new VerifyStudentId(mockGradRepo);
      
      const result = await useCase.execute('S1');
      expect(result.valid).toBe(true);
      expect(result.student?.fullName).toBe('Alice');
    });

    it('should return valid false if not exists', async () => {
      mockGradRepo.findByStudentId.mockResolvedValue(null);
      const useCase = new VerifyStudentId(mockGradRepo);
      
      const result = await useCase.execute('UNKNOWN');
      expect(result.valid).toBe(false);
    });
  });
});
