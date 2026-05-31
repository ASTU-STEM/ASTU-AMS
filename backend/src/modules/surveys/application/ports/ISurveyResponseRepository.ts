import { SurveyResponse } from '../../domain/entities/Survey';

export interface ISurveyResponseRepository {
  findByAlumniAndSurvey(alumniId: string, surveyId: string): Promise<SurveyResponse | null>;
  create(data: Omit<SurveyResponse, 'id' | 'submittedAt'>): Promise<SurveyResponse>;
  findBySurveyId(surveyId: string): Promise<SurveyResponse[]>;
}
