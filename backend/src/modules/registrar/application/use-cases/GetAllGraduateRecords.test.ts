import { GetAllGraduateRecords } from './GetAllGraduateRecords';
import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';

describe('GetAllGraduateRecords Use Case', () => {
  let mockRepo: jest.Mocked<IGraduateRecordRepository>;
  let useCase: GetAllGraduateRecords;

  beforeEach(() => {
    mockRepo = {
      findByStudentId: jest.fn(),
      upsertMany: jest.fn(),
      findAll: jest.fn(), // We expect this to exist now
    } as unknown as jest.Mocked<IGraduateRecordRepository>; // Use unknown cast since findAll isn't in interface yet
    useCase = new GetAllGraduateRecords(mockRepo);
  });

  it('should return all graduate records from the repository', async () => {
    const mockRecords: GraduateRecord[] = [
      {
        id: '1',
        studentId: 'ETS1234/13',
        fullName: 'John Doe',
        department: 'Software Engineering',
        departmentCode: 'SWE',
        graduationYear: 2025,
        cgpa: 3.8,
        source: 'batch-import',
        email: 'john@example.com',
        phone: '0911000000',
        graduationDate: new Date('2025-06-30')
      },
      {
        id: '2',
        studentId: 'ETS5678/13',
        fullName: 'Jane Smith',
        department: 'Computer Science',
        departmentCode: 'CSE',
        graduationYear: 2025,
        cgpa: 3.9,
        source: 'batch-import',
        email: 'jane@example.com',
        phone: '0911000001',
        graduationDate: new Date('2025-06-30')
      }
    ];

    mockRepo.findAll.mockResolvedValue(mockRecords);

    const result = await useCase.execute();

    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRecords);
    expect(result.length).toBe(2);
  });

  it('should return empty array if no records exist', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
