import { UpdateGraduateRecord } from './UpdateGraduateRecord';
import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';

describe('UpdateGraduateRecord Use Case', () => {
  let mockRepo: jest.Mocked<IGraduateRecordRepository>;
  let useCase: UpdateGraduateRecord;

  beforeEach(() => {
    mockRepo = {
      findByStudentId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsertMany: jest.fn(),
    };
    useCase = new UpdateGraduateRecord(mockRepo);
  });

  it('should update a graduate record via the repository', async () => {
    const updated: GraduateRecord = {
      id: 'uuid-1',
      studentId: 'ETS1234/13',
      fullName: 'John Doe Updated',
      department: 'Software Engineering',
      departmentCode: 'SWE',
      graduationYear: 2025,
      cgpa: 3.9,
      source: 'manual',
      email: 'john@example.com',
      phone: '0911000000',
      graduationDate: new Date('2025-06-30'),
    };
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('uuid-1', { fullName: 'John Doe Updated', cgpa: 3.9 });

    expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', { fullName: 'John Doe Updated', cgpa: 3.9 });
    expect(result).toEqual(updated);
  });
});
