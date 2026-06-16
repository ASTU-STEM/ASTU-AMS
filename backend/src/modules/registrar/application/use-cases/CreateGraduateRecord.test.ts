import { CreateGraduateRecord } from './CreateGraduateRecord';
import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';

describe('CreateGraduateRecord Use Case', () => {
  let mockRepo: jest.Mocked<IGraduateRecordRepository>;
  let useCase: CreateGraduateRecord;

  beforeEach(() => {
    mockRepo = {
      findByStudentId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsertMany: jest.fn(),
    };
    useCase = new CreateGraduateRecord(mockRepo);
  });

  it('should create a new graduate record via the repository', async () => {
    const input: Omit<GraduateRecord, 'id'> = {
      studentId: 'ETS1234/13',
      fullName: 'John Doe',
      department: 'Software Engineering',
      departmentCode: 'SWE',
      graduationYear: 2025,
      cgpa: 3.8,
      source: 'manual',
      email: 'john@example.com',
      phone: '0911000000',
      graduationDate: new Date('2025-06-30'),
    };

    const expected: GraduateRecord = { id: 'uuid-1', ...input };
    mockRepo.create.mockResolvedValue(expected);

    const result = await useCase.execute(input);

    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });
});
