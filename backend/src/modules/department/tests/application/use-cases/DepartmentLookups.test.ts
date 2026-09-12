import { GetDepartmentStats, GetDepartmentAlumni, GetMyDepartment } from '../../../application/use-cases/DepartmentLookups';
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
    {
      id: 'al1', userId: 'usrA', studentId: 'ASTU/0001', fullName: 'Alice',
      email: 'alice@astu.edu.et', phone: '0911', graduationYear: 2020,
      employmentStatus: 'EMPLOYED', salary: 50000, skills: ['JS'],
      company: 'ACME', jobTitle: 'Engineer', industry: 'Tech', location: 'Addis', isVerified: true,
    },
    {
      id: 'al2', userId: 'usrB', studentId: 'ASTU/0002', fullName: 'Bob',
      email: 'bob@astu.edu.et', phone: '0922', graduationYear: 2021,
      employmentStatus: 'UNEMPLOYED', salary: null, skills: [],
      company: null, jobTitle: null, industry: null, location: null, isVerified: false,
    }
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
      expect(stats.selfEmployedAlumni).toBe(0);
      expect(stats.unemployedAlumni).toBe(1);
      expect(stats.employmentRate).toBe(50); // 1/2 * 100
      expect(stats.averageSalary).toBe(50000);
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

  describe('GetMyDepartment', () => {
    it('should return the department for a department head', async () => {
      mockHeadRepo.findByUserId.mockResolvedValue(mockHead);
      mockDeptRepo.findById.mockResolvedValue(mockDept);

      const useCase = new GetMyDepartment(mockHeadRepo, mockDeptRepo);
      const dept = await useCase.execute('user1');

      expect(dept).toEqual(mockDept);
    });

    it('should throw if user is not a department head', async () => {
      mockHeadRepo.findByUserId.mockResolvedValue(null);
      const useCase = new GetMyDepartment(mockHeadRepo, mockDeptRepo);
      await expect(useCase.execute('user1')).rejects.toThrow(UnauthorizedDepartmentActionError);
    });
  });
});
