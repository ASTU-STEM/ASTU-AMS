import { AddWorkExperience, UpdateWorkExperience, DeleteWorkExperience } from '../../../application/use-cases/ManageWorkExperience';
import { IAlumniProfileRepository } from '../../../application/ports/IAlumniProfileRepository';
import { IWorkExperienceRepository } from '../../../application/ports/IWorkExperienceRepository';
import { AlumniProfile, WorkExperience } from '../../../domain/entities/Alumni';
import { AlumniNotFoundError, UnauthorizedExperienceError } from '../../../domain/errors/AlumniErrors';

describe('ManageWorkExperience Use Cases', () => {
  let mockAlumniRepo: jest.Mocked<IAlumniProfileRepository>;
  let mockExpRepo: jest.Mocked<IWorkExperienceRepository>;
  
  const mockProfile = new AlumniProfile('alumniId1', 'userId1', 'stu1', 'John Doe', 'email@test.com', 'ACTIVE', true);

  beforeEach(() => {
    mockAlumniRepo = { findByUserId: jest.fn(), update: jest.fn() };
    mockExpRepo = { findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
  });

  describe('AddWorkExperience', () => {
    it('should add experience if alumni exists', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockProfile);
      const newExp = new WorkExperience('exp1', 'alumniId1', 'TechCorp', 'Dev', 'IT', null, 'City', true, new Date());
      mockExpRepo.create.mockResolvedValue(newExp);

      const useCase = new AddWorkExperience(mockAlumniRepo, mockExpRepo);
      const result = await useCase.execute('userId1', { companyName: 'TechCorp', position: 'Dev', industry: 'IT', location: 'City', isCurrent: true, startDate: new Date() });
      
      expect(result).toEqual(newExp);
      expect(mockExpRepo.create).toHaveBeenCalled();
    });

    it('should throw AlumniNotFoundError if missing', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(null);
      const useCase = new AddWorkExperience(mockAlumniRepo, mockExpRepo);
      await expect(useCase.execute('userId1', {} as any)).rejects.toThrow(AlumniNotFoundError);
    });
  });

  describe('DeleteWorkExperience', () => {
    it('should delete if authorized', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockProfile);
      const exp = new WorkExperience('exp1', 'alumniId1', 'TechCorp', 'Dev', 'IT', null, 'City', true, new Date());
      mockExpRepo.findById.mockResolvedValue(exp);

      const useCase = new DeleteWorkExperience(mockAlumniRepo, mockExpRepo);
      await useCase.execute('userId1', 'exp1');
      
      expect(mockExpRepo.delete).toHaveBeenCalledWith('exp1');
    });

    it('should throw UnauthorizedExperienceError if experience belongs to another alumni', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockProfile);
      const exp = new WorkExperience('exp1', 'OTHER_ALUMNI', 'TechCorp', 'Dev', 'IT', null, 'City', true, new Date());
      mockExpRepo.findById.mockResolvedValue(exp);

      const useCase = new DeleteWorkExperience(mockAlumniRepo, mockExpRepo);
      await expect(useCase.execute('userId1', 'exp1')).rejects.toThrow(UnauthorizedExperienceError);
    });
  });
});
