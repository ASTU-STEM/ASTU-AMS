import { CreateSurvey, GetSurveys } from '../../../application/use-cases/ManageSurveys';
import { ISurveyRepository } from '../../../application/ports/ISurveyRepository';
import { Survey } from '../../../domain/entities/Survey';

describe('ManageSurveys Use Cases', () => {
  let mockRepo: jest.Mocked<ISurveyRepository>;
  const mockSurvey = new Survey('s1', 'Test', 'Desc', 'SIX_MONTH', 6, true, false, []);

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      clone: jest.fn(),
      findByMilestone: jest.fn(),
    } as unknown as jest.Mocked<ISurveyRepository>;
  });

  describe('CreateSurvey', () => {
    it('should create a survey successfully', async () => {
      mockRepo.create.mockResolvedValue(mockSurvey);
      const useCase = new CreateSurvey(mockRepo);
      const result = await useCase.execute({ title: 'Test' });
      expect(result).toEqual(mockSurvey);
    });
  });

  describe('GetSurveys', () => {
    it('should return a list of surveys', async () => {
      mockRepo.findAll.mockResolvedValue([mockSurvey]);
      const useCase = new GetSurveys(mockRepo);
      const result = await useCase.execute(true);
      expect(result).toHaveLength(1);
    });
  });
});
