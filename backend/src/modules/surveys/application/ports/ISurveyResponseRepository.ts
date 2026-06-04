import { SurveyResponse } from '../../domain/entities/Survey';

export interface ISurveyResponseRepository {
  findById(id: string): Promise<SurveyResponse | null>;
  findByAlumniAndSurvey(alumniId: string, surveyId: string): Promise<SurveyResponse | null>;
  findDraftByAssignment(assignmentId: string): Promise<SurveyResponse | null>;
  findAll(): Promise<SurveyResponse[]>;
  create(data: Omit<SurveyResponse, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<SurveyResponse, 'assignmentId' | 'submittedAt'>>): Promise<SurveyResponse>;
  update(id: string, data: Partial<Omit<SurveyResponse, 'id'>>): Promise<SurveyResponse>;
}
