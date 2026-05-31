import { SubmitSurveyResponse } from '../../../application/use-cases/SubmitSurveyResponse';
import { ISurveyRepository } from '../../../application/ports/ISurveyRepository';
import { ISurveyResponseRepository } from '../../../application/ports/ISurveyResponseRepository';
import { Survey, SurveyResponse } from '../../../domain/entities/Survey';
import { DuplicateSurveyResponseError, InactiveSurveyError, SurveyNotFoundError } from '../../../domain/errors/SurveyErrors';

describe('SubmitSurveyResponse Use Case', () => {
  let mockSurveyRepo: jest.Mocked<ISurveyRepository>;
  let mockRespRepo: jest.Mocked<ISurveyResponseRepository>;

  const mockSurvey = new Survey('s1', 'Test', 'Desc', 'SIX_MONTH', true, []);
  const mockResponse = new SurveyResponse('r1', 's1', 'a1', new Date(), []);

  beforeEach(() => {
    mockSurveyRepo = { findById: jest.fn(), findAll: jest.fn(), create: jest.fn() };
    mockRespRepo = { findByAlumniAndSurvey: jest.fn(), create: jest.fn(), findBySurveyId: jest.fn() };
  });

  it('should submit response successfully', async () => {
    mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
    mockRespRepo.findByAlumniAndSurvey.mockResolvedValue(null);
    mockRespRepo.create.mockResolvedValue(mockResponse);

    const useCase = new SubmitSurveyResponse(mockSurveyRepo, mockRespRepo);
    const result = await useCase.execute('s1', 'usr1', [{ questionId: 'q1', answerText: 'Yes' }]);

    expect(result).toEqual(mockResponse);
  });

  it('should throw SurveyNotFoundError if survey does not exist', async () => {
    mockSurveyRepo.findById.mockResolvedValue(null);
    const useCase = new SubmitSurveyResponse(mockSurveyRepo, mockRespRepo);
    await expect(useCase.execute('s1', 'usr1', [])).rejects.toThrow(SurveyNotFoundError);
  });

  it('should throw InactiveSurveyError if survey is not active', async () => {
    mockSurveyRepo.findById.mockResolvedValue({ ...mockSurvey, isActive: false });
    const useCase = new SubmitSurveyResponse(mockSurveyRepo, mockRespRepo);
    await expect(useCase.execute('s1', 'usr1', [])).rejects.toThrow(InactiveSurveyError);
  });

  it('should throw DuplicateSurveyResponseError if already submitted', async () => {
    mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
    mockRespRepo.findByAlumniAndSurvey.mockResolvedValue(mockResponse);
    const useCase = new SubmitSurveyResponse(mockSurveyRepo, mockRespRepo);
    await expect(useCase.execute('s1', 'usr1', [])).rejects.toThrow(DuplicateSurveyResponseError);
  });
});
