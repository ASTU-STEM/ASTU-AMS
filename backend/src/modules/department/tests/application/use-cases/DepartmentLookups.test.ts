import { GetDepartmentStats, GetDepartmentAlumni } from '../../../application/use-cases/DepartmentLookups';
import { IDepartmentHeadRepository } from '../../../application/ports/IDepartmentHeadRepository';
import { IAlumniDepartmentRepository } from '../../../application/ports/IAlumniDepartmentRepository';
import { IDepartmentRepository } from '../../../application/ports/IDepartmentRepository';
import { DepartmentHeadProfile, Department } from '../../../domain/entities/Department';
import { UnauthorizedDepartmentActionError } from '../../../domain/errors/DepartmentErrors';

describe('Department Lookups Use Cases', () => {
  let mockHeadRepo: jest.Mocked<IDepartmentHeadRepository>;
  let mockAlumniRepo: jest.Mocked<IAlumniDepartmentRepository>;
  let mockDeptRepo: jest.Mocked<IDepartmentRepository>;

  const mockHead = new DepartmentHeadProfile('head1', 'user1', 'dept1');
  const mockDept = new Department('dept1', 'Software Eng', 'SWE');
  const mockAlumniList = [
    { id: 'al1', userId: 'usrA', fullName: 'Alice', graduationYear: 2020, employmentStatus: 'EMPLOYED' },
    { id: 'al2', userId: 'usrB', fullName: 'Bob', graduationYear: 2021, employmentStatus: 'UNEMPLOYED' }
  ];

  beforeEach(() => {
    mockHeadRepo = { findByUserId: jest.fn() };
    mockAlumniRepo = { findByDepartmentId: jest.fn() };
    mockDeptRepo = { findById: jest.fn(), findAll: jest.fn() };
  });

  describe('GetDepartmentStats', () => {
    it('should return correct stats for department head', async () => {
      mockHeadRepo.findByUserId.mockResolvedValue(mockHead);
      mockAlumniRepo.findByDepartmentId.mockResolvedValue(mockAlumniList);

      const useCase = new GetDepartmentStats(mockHeadRepo, mockAlumniRepo);
      const stats = await useCase.execute('user1');

      expect(stats.totalAlumni).toBe(2);
      expect(stats.employedAlumni).toBe(1);
      expect(stats.employmentRate).toBe(50); // 1/2 * 100
    });

    it('should throw if user is not a department head', async () => {
      mockHeadRepo.findByUserId.mockResolvedValue(null);
      const useCase = new GetDepartmentStats(mockHeadRepo, mockAlumniRepo);
      await expect(useCase.execute('user1')).rejects.toThrow(UnauthorizedDepartmentActionError);
    });
  });

  describe('GetDepartmentAlumni', () => {
    it('should return list of alumni for the department', async () => {
      mockHeadRepo.findByUserId.mockResolvedValue(mockHead);
      mockAlumniRepo.findByDepartmentId.mockResolvedValue(mockAlumniList);

      const useCase = new GetDepartmentAlumni(mockHeadRepo, mockAlumniRepo);
      const alumni = await useCase.execute('user1');

      expect(alumni).toHaveLength(2);
      expect(alumni[0].fullName).toBe('Alice');
    });
  });
});
