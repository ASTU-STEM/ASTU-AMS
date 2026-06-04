import { ISurveyRepository } from '../ports/ISurveyRepository';
import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { DuplicateSurveyResponseError, InactiveSurveyError, SurveyNotFoundError } from '../../domain/errors/SurveyErrors';

export class SubmitSurveyResponse {
  constructor(
    private readonly surveyRepo: ISurveyRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(surveyId: string, alumniId: string, answers: any[]) {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) throw new SurveyNotFoundError();
    if (!survey.isActive) throw new InactiveSurveyError();

    const existing = await this.responseRepo.findByAlumniAndSurvey(alumniId, surveyId);
    if (existing) throw new DuplicateSurveyResponseError();

    const response = await this.responseRepo.create({
      surveyId,
      alumniId,
      assignmentId: null,
      answers,
    });

    return response;
  }
}
