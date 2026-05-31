import { Survey } from '../../domain/entities/Survey';

export interface ISurveyRepository {
  findById(id: string): Promise<Survey | null>;
  findAll(activeOnly?: boolean): Promise<Survey[]>;
  create(data: Omit<Survey, 'id'>): Promise<Survey>;
}
