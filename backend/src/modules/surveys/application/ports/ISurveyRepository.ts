import { Survey } from '../../domain/entities/Survey';

export interface ISurveyRepository {
  findById(id: string): Promise<Survey | null>;
  findAll(activeOnly?: boolean, includeArchived?: boolean): Promise<Survey[]>;
  create(data: Omit<Survey, 'id'>): Promise<Survey>;
  update(id: string, data: Partial<Omit<Survey, 'id'>>): Promise<Survey>;
  archive(id: string): Promise<Survey>;
  clone(id: string): Promise<Survey>;
  findByMilestone(months: number): Promise<Survey | null>;
}
