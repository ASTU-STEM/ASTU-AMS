import { ImportGraduateData } from '../../../application/use-cases/ImportGraduateData';
import { IGraduateRecordRepository } from '../../../application/ports/IGraduateRecordRepository';
import { ISyncLogRepository } from '../../../application/ports/ISyncLogRepository';
import { InvalidFileFormatError } from '../../../domain/errors/RegistrarErrors';

describe('ImportGraduateData Use Case', () => {
  let mockGradRepo: jest.Mocked<IGraduateRecordRepository>;
  let mockSyncRepo: jest.Mocked<ISyncLogRepository>;
  let useCase: ImportGraduateData;

  beforeEach(() => {
    mockGradRepo = { findByStudentId: jest.fn(), upsertMany: jest.fn() };
    mockSyncRepo = { create: jest.fn(), getHistory: jest.fn() };
    useCase = new ImportGraduateData(mockGradRepo, mockSyncRepo);
  });

  it('should process and save valid records', async () => {
    mockGradRepo.upsertMany.mockResolvedValue({ added: 2, updated: 0 });
    
    const records = [
      { studentId: 'S1', fullName: 'Alice', department: 'CS', departmentCode: 'CS', cgpa: 3.5, graduationYear: 2022, email: 'a@a.com', phone: '123', source: 'MANUAL', graduationDate: new Date() },
      { studentId: 'S2', fullName: 'Bob', department: 'CS', departmentCode: 'CS', cgpa: 3.2, graduationYear: 2022, email: 'b@b.com', phone: '124', source: 'MANUAL', graduationDate: new Date() },
    ];

    const result = await useCase.execute(records);

    expect(result.added).toBe(2);
    expect(mockGradRepo.upsertMany).toHaveBeenCalledWith(records);
    expect(mockSyncRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'SUCCESS' }));
  });

  it('should throw InvalidFileFormatError if records are empty', async () => {
    await expect(useCase.execute([])).rejects.toThrow(InvalidFileFormatError);
  });
});
