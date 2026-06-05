import { SurveyAssignment } from '../../domain/entities/Survey';

export interface ISurveyAssignmentRepository {
  findById(id: string): Promise<SurveyAssignment | null>;
  findByAlumniId(alumniId: string): Promise<SurveyAssignment[]>;
  findPendingAndInProgress(): Promise<SurveyAssignment[]>;
  findBySurveyAndAlumni(surveyId: string, alumniId: string): Promise<SurveyAssignment | null>;
  findAll(): Promise<SurveyAssignment[]>;
  create(data: Omit<SurveyAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurveyAssignment>;
  update(id: string, data: Partial<Omit<SurveyAssignment, 'id'>>): Promise<SurveyAssignment>;
}
